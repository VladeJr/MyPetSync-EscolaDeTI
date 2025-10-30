import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationToken, NotificationTokenDocument } from './schemas/notification-token.schema';
import { SendNotificationDto } from './dto/send-notification.dto';
import * as path from 'path';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(NotificationToken.name)
    private readonly tokenModel: Model<NotificationTokenDocument>,
  ) {
    // Inicializa o Firebase Admin (só uma vez)
    const serviceAccountPath = path.resolve('config/firebase-service-account.json');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
    }
  }

  /** Salva ou atualiza o token de notificação do usuário */
  async saveToken(userId: string, token: string, platform?: string) {
    await this.tokenModel.updateOne(
      { user: new Types.ObjectId(userId), token },
      { $set: { platform } },
      { upsert: true },
    );
  }

  /** Envia notificação para lista de tokens ou todos os tokens de um usuário */
  async send(dto: SendNotificationDto, userId?: string) {
    let tokens = dto.tokens || [];

    if (userId) {
      const docs = await this.tokenModel.find({ user: userId }).lean();
      tokens = docs.map((d) => d.token);
    }

    if (!tokens.length) {
      this.logger.warn('Nenhum token encontrado.');
      return { success: false, message: 'Nenhum token válido.' };
    }

    const payload: admin.messaging.MulticastMessage = {
      notification: { title: dto.title, body: dto.body },
      data: dto.data ? Object.fromEntries(Object.entries(dto.data).map(([k, v]) => [k, String(v)])) : {},
      tokens,
    };

    const result = await admin.messaging().sendEachForMulticast(payload);
    this.logger.log(`Notificações enviadas: ${result.successCount}/${tokens.length}`);
    return result;
  }

  /** Remove token inválido ou não usado */
  async removeToken(token: string) {
    await this.tokenModel.deleteOne({ token });
  }
}
