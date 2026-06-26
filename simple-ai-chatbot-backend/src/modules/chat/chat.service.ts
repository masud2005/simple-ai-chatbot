import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { MessageRole } from '@prisma';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) { }

  async handleMessage(conversationId: string, content: string) {
    const messageCount = await this.prisma.message.count({
      where: { conversationId },
    });

    // 1. save user message
    await this.prisma.message.create({
      data: {
        conversationId,
        content,
        role: MessageRole.USER,
      },
    });

    if (messageCount === 0) {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { title: content.substring(0, 30) + (content.length > 30 ? '...' : '') },
      });
    }

    // 2. fake AI response (temporary)
    // const response = `AI: You said -> ${content}`;
    // Real Ai Response
    // const aiResponse = await this.ai.generateResponse(content);

    const similarDocs: any = await this.ai.findSimilarDocuments(content);
    let contextText = "";
    if (similarDocs && similarDocs.length > 0) {
      contextText = similarDocs.map((doc: any) => doc.content).join('\n\n');
    }

    // Coustom instructions or prompt
    const prompt = `
তুমি একজন হেল্পফুল অ্যাসিস্ট্যান্ট। তোমার কাজ হলো নিচের দেওয়া "Context" বা তথ্যের উপর ভিত্তি করে ইউজারের প্রশ্নের উত্তর দেওয়া। 
যদি Context-এর মধ্যে উত্তর না থাকে, তাহলে সুন্দর করে বলবে "দুঃখিত, এই সম্পর্কে আমার কাছে কোনো তথ্য নেই।"
Context (তথ্য):
${contextText}
ইউজারের প্রশ্ন: ${content}
`;

    const aiResponse = await this.ai.generateResponse(prompt);

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
