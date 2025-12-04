import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from '../../src/chat/chat.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatRoom } from '../../src/chat/schemas/chat-room.schema';
import { Message } from '../../src/chat/schemas/message.schema';
import { NotFoundException } from '@nestjs/common';

describe('ChatService', () => {
  let service: ChatService;
  let chatRoomModel: Model<ChatRoom>;
  let messageModel: Model<Message>;

  const mockRoomId = new Types.ObjectId().toHexString();
  const mockUserId = new Types.ObjectId().toHexString();

  const mockChatRoomModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    exec: jest.fn(),
  };

  const mockMessageModel = {
    create: jest.fn(),
    find: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getModelToken(ChatRoom.name),
          useValue: mockChatRoomModel,
        },
        {
          provide: getModelToken(Message.name),
          useValue: mockMessageModel,
        },
      ],
    }).compile();

    service = module.get(ChatService);
    chatRoomModel = module.get(getModelToken(ChatRoom.name));
    messageModel = module.get(getModelToken(Message.name));

    jest.clearAllMocks();
  });
  
  it('deve criar uma sala com participantes válidos', async () => {
    mockChatRoomModel.create.mockResolvedValueOnce({
      _id: mockRoomId,
      name: 'Atendimento',
      participants: [mockUserId],
    });

    const dto = { participants: [mockUserId], name: 'Teste' };

    const room = await service.createRoom(dto, mockUserId);

    expect(room).toBeDefined();
    expect(chatRoomModel.create).toHaveBeenCalled();
  });

  it('deve retornar lista vazia se userId for inválido', async () => {
    const rooms = await service.getRoomsByUser('abc123'); // inválido
    expect(rooms).toEqual([]);
  });

  it('deve retornar salas ativas do usuário', async () => {
    mockChatRoomModel.find.mockReturnValueOnce({
      sort: () => ({ exec: () => ['sala1', 'sala2'] }),
    });

    const rooms = await service.getRoomsByUser(mockUserId);

    expect(rooms.length).toBe(2);
    expect(chatRoomModel.find).toHaveBeenCalled();
  });

  it('deve lançar erro ao buscar sala com ID inválido', async () => {
    await expect(service.getRoomById('123')).rejects.toThrow(NotFoundException);
  });

  it('deve retornar sala existente', async () => {
    mockChatRoomModel.findById.mockReturnValueOnce({
      exec: () => ({ _id: mockRoomId }),
    });

    const room = await service.getRoomById(mockRoomId);
    expect(room._id).toBe(mockRoomId);
  });

  it('deve lançar erro se sala não existir', async () => {
    mockChatRoomModel.findById.mockReturnValueOnce({ exec: () => null });

    await expect(service.getRoomById(mockRoomId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve enviar mensagem corretamente', async () => {
    mockChatRoomModel.findById.mockReturnValueOnce({
      exec: () => ({ _id: mockRoomId, set: jest.fn(), save: jest.fn() }),
    });

    mockMessageModel.create.mockResolvedValueOnce({
      _id: 'msg123',
      content: 'Olá',
    });

    const dto = { roomId: mockRoomId, content: 'Olá' };
    const result = await service.sendMessage(mockUserId, dto);

    expect(result).toBeDefined();
    expect(messageModel.create).toHaveBeenCalled();
  });

  it('deve lançar erro ao enviar mensagem para sala inválida', async () => {
    const dto = { roomId: '123', content: 'Teste' };

    await expect(service.sendMessage(mockUserId, dto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve retornar lista vazia se roomId for inválido', async () => {
    const result = await service.getMessages('abc123');
    expect(result).toEqual([]);
  });

  it('deve retornar mensagens da sala', async () => {
    mockMessageModel.find.mockReturnValueOnce({
      sort: () => ({ exec: () => [{ content: 'Oi' }] }),
    });

    const msgs = await service.getMessages(mockRoomId);
    expect(msgs.length).toBe(1);
  });
});
