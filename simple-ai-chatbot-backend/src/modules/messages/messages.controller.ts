/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessageRole } from '@prisma';

@Controller('messages')
export class MessagesController {
  constructor(private service: MessagesService) {}

  @Post()
  create(
    @Body()
    body: {
      conversationId: string;
      content: string;
      role: MessageRole;
    },
  ) {
    return this.service.create(body.conversationId, body.content, body.role);
  }

  @Get(':conversationId')
  find(@Param('conversationId') id: string) {
    return this.service.findByConversation(id);
  }
}
