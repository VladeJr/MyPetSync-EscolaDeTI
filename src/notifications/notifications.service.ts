import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationToken, NotificationTokenDocument } from './schemas/notification-token.schema';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(NotificationToken.name)
    private readonly tokenModel: Model<NotificationTokenDocument>,
  ) {
    // Firebase desativado temporariamente para não quebrar
    // const serviceAccountPath = path.resolve('config/firebase-service-account.json');
    // if (!admin.apps.length) {
    //   admin.initializeApp({
    //     credential: admin.credential.cert(serviceAccountPath),
    //   });
    // }
  }

  /** Salva ou atualiza o token de notificação do usuário */
  async saveToken(userId: string, token: string, platform?: string) {
    await this.tokenModel.updateOne(
      { user: new Types.ObjectId(userId), token },
      { $set: { platform } },
      { upsert: true },
    );
  }

  /** Envia notificação (stub sem Firebase) */
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

    // Apenas log para simular envio
    this.logger.log(`Simulando envio de notificação para ${tokens.length} token(s).`);
    this.logger.log(`Título: ${dto.title}, Corpo: ${dto.body}`);
    return { success: true, message: 'Simulação de envio realizada.' };
  }

  /** Remove token inválido ou não usado */
  async removeToken(token: string) {
    await this.tokenModel.deleteOne({ token });
  }
}
