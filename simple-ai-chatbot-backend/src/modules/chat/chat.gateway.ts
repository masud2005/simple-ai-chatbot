/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @SubscribeMessage('send_message')
  handleMessage(
    @MessageBody() payload: { conversationId: string; content: string },
  ) {
    return 'service file';
  }
}
