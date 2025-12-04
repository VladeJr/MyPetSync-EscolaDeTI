import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient<Socket>();

    const token = client.handshake.auth?.token as string | undefined;

    console.log('WS HANDSHAKE AUTH:', client.handshake.auth); // debug

    if (!token) {
      console.error('WS: token não informado');
      throw new WsException('Token não informado');
    }

    try {
      const payload = this.jwtService.verify(token);
      console.log('WS JWT PAYLOAD:', payload); // debug

      (client.handshake as any).user = {
        userId: payload.sub || payload.userId || payload.id,
        tipo_usuario: payload.tipo_usuario,
      };

      return true;
    } catch (e) {
      console.error('WS: token inválido', e);
      throw new WsException('Token inválido');
    }
  }
}
