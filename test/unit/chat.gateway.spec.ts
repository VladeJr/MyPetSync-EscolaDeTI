import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from '../../src/chat/chat.gateway';
import { ChatService } from '../../src/chat/chat.service';
import { WsException } from '@nestjs/websockets';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  const mockClient: any = {
    id: 'client123',
    join: jest.fn(),
    handshake: { user: { userId: 'userABC' } },
  };

  const mockChatService = {
    sendMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    gateway = module.get(ChatGateway);
    chatService = module.get(ChatService);

    (gateway as any).server = mockServer;

    jest.clearAllMocks();
  });

  it('deve permitir que o cliente entre na sala corretamente', () => {
    gateway.handleJoinRoom(mockClient, 'room123');

    expect(mockClient.join).toHaveBeenCalledWith('room123');
  });

  it('deve enviar mensagem corretamente', async () => {
    mockChatService.sendMessage.mockResolvedValueOnce({
      _id: 'msg123',
      content: 'Olá',
    });

    await gateway.handleSendMessage(mockClient, {
      roomId: 'room123',
      content: 'Olá',
    });

    expect(mockChatService.sendMessage).toHaveBeenCalledWith('userABC', {
      roomId: 'room123',
      content: 'Olá',
    });

    expect(mockServer.to).toHaveBeenCalledWith('room123');
    expect(mockServer.emit).toHaveBeenCalledWith('newMessage', {
      _id: 'msg123',
      content: 'Olá',
    });
  });

  it('deve lançar WsException se handshake não tiver userId', async () => {
    const badClient = {
      join: jest.fn(),
      handshake: {},
    };

    await expect(
      gateway.handleSendMessage(badClient as any, {
        roomId: 'room123',
        content: 'teste',
      }),
    ).rejects.toThrow(WsException);
  });

  it('deve lidar com erro ao enviar mensagem', async () => {
    mockChatService.sendMessage.mockRejectedValueOnce(
      new Error('Falha no service'),
    );

    await expect(
      gateway.handleSendMessage(mockClient, {
        roomId: 'room123',
        content: 'msg',
      }),
    ).rejects.toThrow(Error);
  });
});
