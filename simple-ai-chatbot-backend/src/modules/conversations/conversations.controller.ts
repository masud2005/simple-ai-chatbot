import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { Conversation } from '@prisma';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly service: ConversationsService) { }

  // Creates a new conversation.
  @Post()
  async create(@Body('title') title: string): Promise<Conversation> {
    return this.service.create(title);
  }

  // Retrieves all conversations.
  @Get()
  async findAll(): Promise<Conversation[]> {
    return this.service.findAll();
  }

  // Retrieves a specific conversation by ID.
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Conversation> {
    return this.service.findOne(id);
  }

  // Deletes a specific conversation by ID.
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Conversation> {
    return this.service.remove(id);
  }
}
