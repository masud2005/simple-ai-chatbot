import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Conversation } from '@prisma';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(private prisma: PrismaService) { }

  // Creates a new conversation.
  async create(title: string): Promise<Conversation> {
    try {
      const conversation = await this.prisma.conversation.create({
        data: { title },
      });
      return conversation;
    } catch (error: any) {
      this.logger.error("Error creating conversation:", error?.stack);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to create conversation.',
        error: error?.message,
      });
    }
  }

  // Retrieves all conversations.
  async findAll(): Promise<Conversation[]> {
    try {
      return await this.prisma.conversation.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error: any) {
      this.logger.error("Error fetching conversations:", error?.stack);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch conversations.',
        error: error?.message,
      });
    }
  }

  // Retrieves a specific conversation by ID, including its messages.
  async findOne(id: string): Promise<Conversation> {
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id },
        include: { messages: true },
      });

      if (!conversation) {
        this.logger.warn(`Conversation not found with ID: ${id}`);
        throw new NotFoundException("Conversation not found");
      }

      return conversation;
    } catch (error: any) {
      this.logger.error("Error fetching conversation:", error?.stack);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to fetch conversation.',
        error: error?.message,
      });
    }
  }

  // Deletes a specific conversation by ID.
  async remove(id: string): Promise<Conversation> {
    try {
      const deletedConversation = await this.prisma.conversation.delete({
        where: { id },
      });
      return deletedConversation;
    } catch (error: any) {
      this.logger.error("Error deleting conversation:", error?.stack);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to delete the conversation.',
        error: error?.message,
      });
    }
  }
}
