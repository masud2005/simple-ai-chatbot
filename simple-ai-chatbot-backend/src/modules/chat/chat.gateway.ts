/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() payload: { conversationId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const response = await this.chatService.handleMessage(
      payload.conversationId,
      payload.content,
    );

    // send back to same client
    client.emit('receive_message', response);
  }
}
