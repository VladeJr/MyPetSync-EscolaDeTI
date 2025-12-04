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
      .populate('participants', 'nome tipo_usuario')
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

  async getRoomDetails(roomId: string) {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new NotFoundException('Sala não encontrada');
    }

    const room = await this.chatRoomModel
      .findById(roomId)
      .populate('participants', 'nome tipo_usuario')
      .exec();

    if (!room) throw new NotFoundException('Sala não encontrada');

    return room;
  }

  async getOrCreateRoomForParticipants(userIds: string[], name?: string) {
    const participants = userIds.map((id) => new Types.ObjectId(id));

    const existingRoom = await this.chatRoomModel.findOne({
      participants: { $all: participants },
      isActive: true,
    });

    if (existingRoom) return existingRoom;

    const room = await this.chatRoomModel.create({
      name: name ?? 'Atendimento',
      participants,
    });

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

    return this.messageModel
      .find({ roomId: new Types.ObjectId(roomId) })
      .sort({ createdAt: 1 })
      .exec();
  }
}
