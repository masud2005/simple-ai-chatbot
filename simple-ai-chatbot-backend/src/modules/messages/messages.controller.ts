import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message, MessageRole } from '@prisma';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly service: MessagesService,
  ) { }

  // Creates a new message.
  @Post()
  async create(
    @Body()
    body: {
      conversationId: string;
      content: string;
      role: MessageRole;
    },
  ): Promise<Message> {
    return this.service.create(body.conversationId, body.content, body.role);
  }

  // Retrieves all messages for a specific conversation.
  @Get(':conversationId')
  async find(@Param('conversationId') id: string): Promise<Message[]> {
    return this.service.findByConversation(id);
  }
}
