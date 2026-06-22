import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { MessageRole } from '@prisma';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

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
    // const response = `AI: You said -> ${content}`;
    // Real Ai Response
    const aiResponse = await this.ai.generateResponse(content);

    // 3. save assistant message
    await this.prisma.message.create({
      data: {
        conversationId,
        content: aiResponse,
        role: MessageRole.ASSISTANT,
      },
    });

    return { response: aiResponse };
  }
}
