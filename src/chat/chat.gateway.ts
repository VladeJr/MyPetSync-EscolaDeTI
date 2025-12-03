import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/auth/guards/ws-auth.guard';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    const user = (client.handshake as any).user;
    console.log(
      `Cliente conectado ao chat: ${client.id} (User ID: ${
        user?.userId || 'N/A'
      })`,
    );
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.join(roomId);
    console.log(`Client ${client.id} entrou na sala ${roomId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId: string; content: string },
  ) {
    const user = (client.handshake as any).user;

    if (!user?.userId) {
      console.error(
        'WS: usuário não definido no socket ao enviar mensagem. payload:',
        payload,
      );
      throw new WsException('Usuário não autenticado no socket');
    }

    const senderId = user.userId;

    const message = await this.chatService.sendMessage(senderId, {
      roomId: payload.roomId,
      content: payload.content,
    } as SendMessageDto);

    this.server.to(payload.roomId).emit('newMessage', message);
  }
}
