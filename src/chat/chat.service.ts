import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatRoom, ChatRoomDocument } from './schemas/chat-room.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name)
    private readonly chatRoomModel: Model<ChatRoomDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async createRoom(dto: CreateRoomDto, creatorId: string) {
    const participantsIds = dto.participants.map(
      (id) => new Types.ObjectId(id),
    );
    const room = await this.chatRoomModel.create({
      name: dto.name ?? 'Atendimento',
      participants: participantsIds,
    });

    return room;
  }

  async getRoomsByUser(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      return [];
    }
    return this.chatRoomModel
      .find({ participants: new Types.ObjectId(userId), isActive: true })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async getRoomById(roomId: string) {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new NotFoundException('Sala não encontrada');
    }
    const room = await this.chatRoomModel.findById(roomId).exec();
    if (!room) throw new NotFoundException('Sala não encontrada');
    return room;
  }

  async sendMessage(senderId: string, dto: SendMessageDto) {
    if (!Types.ObjectId.isValid(dto.roomId)) {
      throw new NotFoundException('Sala não encontrada');
    }
    const room = await this.chatRoomModel.findById(dto.roomId).exec();
    if (!room) throw new NotFoundException('Sala não encontrada');

    const message = await this.messageModel.create({
      roomId: room._id,
      senderId: new Types.ObjectId(senderId),
      content: dto.content,
    });

    room.set('updatedAt', new Date());
    await room.save();

    return message;
  }

  async getMessages(roomId: string) {
    if (!Types.ObjectId.isValid(roomId)) {
      return [];
    }

  async markMessagesAsRead(roomId: string, userId: string) {
    await this.messageModel.updateMany(
      {
        roomId: new Types.ObjectId(roomId),
        senderId: { $ne: new Types.ObjectId(userId) },
      },
      { $set: { read: true } },
    );

    return true;
  }
  

    return this.messageModel
const rooms = await this.chatRoomModel
  .find({ participants: new Types.ObjectId(userId), isActive: true })
  .sort({ updatedAt: -1 })
  .exec();

for (const room of rooms) {
  const count = await this.messageModel.countDocuments({
    roomId: room._id,
    senderId: { $ne: new Types.ObjectId(userId) },
    read: false,
  });

  (room as any)._doc.unreadCount = count;
 }

return rooms;
 }
}