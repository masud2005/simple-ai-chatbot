import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { MessageRole } from '@prisma';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async handleMessage(conversationId: string, content: string) {
    // 1. save user message
    await this.prisma.message.create({
      data: {
        conversationId,
        content,
        role: MessageRole.USER,
      },
    });

    // 2. fake AI response (temporary)
    const response = `AI: You said -> ${content}`;

    // 3. save assistant message
    await this.prisma.message.create({
      data: {
        conversationId,
        content: response,
        role: MessageRole.ASSISTANT,
      },
    });

    return { response };
  }
}
