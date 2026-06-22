/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { MessageRole } from '@prisma';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  create(conversationId: string, content: string, role: MessageRole) {
    return this.prisma.message.create({
      data: {
        conversationId,
        content,
        role,
      },
    });
  }

  findByConversation(conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
