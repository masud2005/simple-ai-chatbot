import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  create(title: string) {
    return this.prisma.conversation.create({
      data: { title },
    });
  }

  findAll() {
    return this.prisma.conversation.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: { messages: true },
    });
  }

  remove(id: string) {
    return this.prisma.conversation.delete({
      where: { id },
    });
  }
}
