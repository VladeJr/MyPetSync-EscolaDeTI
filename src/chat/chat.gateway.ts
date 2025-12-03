import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
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
    const userId = (client.handshake as any).user?.userId;
    console.log(
      `Cliente conectado ao chat: ${client.id} (User ID: ${userId || 'N/A'})`,
    );
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId: string; content: string },
  ) {
    const senderId = (client.handshake as any).user.userId;
    const message = await this.chatService.sendMessage(senderId, {
      roomId: payload.roomId,
      content: payload.content,
    } as SendMessageDto);

    this.server.to(payload.roomId).emit('newMessage', message);
  }
}
