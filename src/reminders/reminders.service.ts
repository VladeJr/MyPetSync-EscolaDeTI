import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { addDays, addMonths, addWeeks, subMinutes } from 'date-fns';

import { Reminder, ReminderDocument } from './schemas/reminder.schema.js';
import { CreateReminderDto } from './dto/create-reminder.dto.js';
import { UpdateReminderDto } from './dto/update-reminder.dto.js';
import { QueryReminderDto } from './dto/query-reminder.dto.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectModel(Reminder.name) private readonly model: Model<ReminderDocument>,
    private readonly notifications: NotificationsService,
    private readonly scheduler: SchedulerRegistry,
  ) {}

  private computeNextRun(dto: { targetAt?: string | Date; repeat: Reminder['repeat']; leadMinutes: number }): Date | undefined {
    // targetAt: instante alvo do evento (UTC), dispara no (targetAt - lead)
    if (!dto.targetAt && dto.repeat === 'none') return undefined;
    const target = dto.targetAt ? new Date(dto.targetAt) : new Date(); // se só recorrente, usa agora como base
    const fireAt = subMinutes(target, dto.leadMinutes || 0);

    // Para recorrências, nextRunAt sempre aponta para o PRÓXIMO disparo
    if (dto.repeat === 'none') return fireAt;

    // Se recorrente, calcula uma janela futura com base no target
    const now = new Date();
    let next = fireAt;
    while (next <= now) {
      if (dto.repeat === 'daily')   next = addDays(next, 1);
      if (dto.repeat === 'weekly')  next = addWeeks(next, 1);
      if (dto.repeat === 'monthly') next = addMonths(next, 1);
    }
    return next;
  }

  async create(userId: string, dto: CreateReminderDto) {
    const repeat = dto.repeat ?? 'none';
    const lead = dto.leadMinutes ?? 0;

    const nextRunAt = this.computeNextRun({ targetAt: dto.targetAt, repeat, leadMinutes: lead });

    const created = await this.model.create({
      user: new Types.ObjectId(userId),
      pet: dto.pet ? new Types.ObjectId(dto.pet) : undefined,
      title: dto.title,
      message: dto.message,
      targetAt: dto.targetAt ? new Date(dto.targetAt) : undefined,
      repeat,
      leadMinutes: lead,
      nextRunAt,
      status: 'active',
      meta: dto.meta,
    });

    return created.toObject();
  }

  async findAll(userId: string, q: QueryReminderDto) {
    const filter: any = { user: new Types.ObjectId(userId) };
    if (q.pet) filter.pet = new Types.ObjectId(q.pet);
    if (q.status) filter.status = q.status;

    const page = Math.max(parseInt(q.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(q.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ nextRunAt: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(userId: string, id: string) {
    const doc = await this.model.findOne({ _id: id, user: userId }).lean();
    return doc;
  }

  async update(userId: string, id: string, dto: UpdateReminderDto) {
    const doc = await this.model.findOne({ _id: id, user: userId });
    if (!doc) return null;

    if (dto.title !== undefined) doc.title = dto.title;
    if (dto.message !== undefined) doc.message = dto.message;
    if (dto.targetAt !== undefined) doc.targetAt = dto.targetAt ? new Date(dto.targetAt) : undefined;
    if (dto.repeat !== undefined) doc.repeat = dto.repeat;
    if (dto.leadMinutes !== undefined) doc.leadMinutes = dto.leadMinutes;
    if (dto.pet !== undefined) doc.pet = dto.pet ? new Types.ObjectId(dto.pet) : undefined;
    if (dto.meta !== undefined) doc.meta = dto.meta as any;

    // Recalcular próxima execução
    doc.nextRunAt = this.computeNextRun({
      targetAt: doc.targetAt,
      repeat: doc.repeat,
      leadMinutes: doc.leadMinutes,
    });

    await doc.save();
    return doc.toObject();
  }

  async pause(userId: string, id: string) {
    const doc = await this.model.findOneAndUpdate({ _id: id, user: userId }, { $set: { status: 'paused' } }, { new: true, lean: true });
    return doc;
  }

  async resume(userId: string, id: string) {
    const doc = await this.model.findOne({ _id: id, user: userId });
    if (!doc) return null;
    doc.status = 'active';
    // Se estava sem nextRunAt, recalcule
    if (!doc.nextRunAt) {
      doc.nextRunAt = this.computeNextRun({ targetAt: doc.targetAt, repeat: doc.repeat, leadMinutes: doc.leadMinutes });
    }
    await doc.save();
    return doc.toObject();
  }

  async remove(userId: string, id: string) {
    const doc = await this.model.findOneAndDelete({ _id: id, user: userId }).lean();
    return !!doc;
  }

  // Scheduler: roda a cada minuto e dispara push nos vencidos
  @Cron(CronExpression.EVERY_MINUTE)
  async processDue() {
    const now = new Date();

    // Busca um lote de lembretes vencidos e ativos
    const due = await this.model.find({
      status: 'active',
      nextRunAt: { $lte: now },
    }).limit(200); // lot size control

    if (!due.length) return;

    for (const r of due) {
      try {
        // Envia push
        const title = r.title;
        const body = r.message || 'Você tem um lembrete no MyPetSync.';
        await this.notifications.send(
          { title, body, data: { type: 'reminder', reminderId: r._id.toString(), petId: r.pet?.toString() || '' } },
          r.user.toString(),
        );

        // Reprograma próxima execução ou conclui
        if (r.repeat === 'none') {
          r.status = 'done';
          r.nextRunAt = undefined;
        } else {
          r.nextRunAt = this.computeNextRun({ targetAt: r.targetAt, repeat: r.repeat, leadMinutes: r.leadMinutes });
        }
        await r.save();
      } catch (e) {
        // Em caso de erro, apenas loga; manterá a tentativa no próximo ciclo
        this.logger.error(`Erro ao processar reminder ${r._id}: ${e?.message || e}`);
      }
    }
  }
}
