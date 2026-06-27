import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { MessageRole, Message } from '@prisma';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(private prisma: PrismaService) { }

  // Creates a new message in a conversation.
  async create(conversationId: string, content: string, role: MessageRole): Promise<Message> {
    try {
      const message = await this.prisma.message.create({
        data: {
          conversationId,
          content,
          role,
        },
      });
      return message;
    } catch (error: any) {
      this.logger.error("Failed to create message", error?.stack);
      throw new InternalServerErrorException({
        success: false,
        message: "Failed to create message",
        error: error?.message
      });
    }
  }

  // Retrieves all messages for a specific conversation.
  async findByConversation(conversationId: string): Promise<Message[]> {
    try {
      return await this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error: any) {
      this.logger.error("Failed to fetch messages for the conversation", error?.stack)
      throw new InternalServerErrorException({
        success: false,
        message: "Failed to fetch messages for the conversation",
        error: error?.message
      });
    }
  }
}
