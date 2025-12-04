import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/shared/current-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('rooms')
  createRoom(@Body() dto: CreateRoomDto, @CurrentUser() user: any) {
    return this.chatService.createRoom(dto, user.userId);
  }

  @Get('rooms')
  getMyRooms(@CurrentUser() user: any) {
    return this.chatService.getRoomsByUser(user.userId);
  }

  @Get('rooms/:id/messages')
  getMessages(@Param('id') roomId: string) {
    return this.chatService.getMessages(roomId);
  }

  @Get('rooms/:id')
  getRoomDetails(@Param('id') roomId: string) {
    return this.chatService.getRoomDetails(roomId);
  }

  @Post('rooms/:id/messages')
  sendMessage(
    @Param('id') roomId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.sendMessage(user.userId, {
      ...dto,
      roomId,
    });
  }
}
