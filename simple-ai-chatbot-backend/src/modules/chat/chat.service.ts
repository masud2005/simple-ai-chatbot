import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { MessageRole } from '@prisma';
import { AiService } from '../ai/ai.service';
import { KnowledgeService } from '../knowledge/knowledge.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private knowledge: KnowledgeService,
  ) { }

  async handleMessage(conversationId: string, content: string): Promise<{ response: string }> {
    try {

      const messageCount = await this.prisma.message.count({
        where: { conversationId },
      });

      // 1. Save user message to database
      await this.prisma.message.create({
        data: {
          conversationId,
          content,
          role: MessageRole.USER,
        },
      });

      // 2. Update conversation title if it's the first message
      if (messageCount === 0) {
        await this.prisma.conversation.update({
          where: { id: conversationId },
          data: { title: content.substring(0, 30) + (content.length > 30 ? '...' : '') },
        });
      }

      // 3. Generate embedding for the user's message using AI Service
      const queryEmbedding = await this.ai.createEmbedding(content);

      // 4. Find similar documents from the database using Knowledge Service
      let contextText = "";
      if (queryEmbedding) {
        const similarDocs = await this.knowledge.findSimilarDocuments(queryEmbedding);
        if (similarDocs && similarDocs.length > 0) {
          contextText = similarDocs.map((doc: any) => doc.content).join('\n\n');
        } else {
          this.logger.debug('No similar documents found in the database.');
        }
      }

      // 5. Construct custom prompt for RAG (Retrieval-Augmented Generation)
      const prompt = `
তুমি একজন হেল্পফুল অ্যাসিস্ট্যান্ট। তোমার কাজ হলো নিচের দেওয়া "Context" বা তথ্যের উপর ভিত্তি করে ইউজারের প্রশ্নের উত্তর দেওয়া। 
যদি Context-এর মধ্যে উত্তর না থাকে, তাহলে সুন্দর করে বলবে "দুঃখিত, এই সম্পর্কে আমার কাছে কোনো তথ্য নেই।"

Context (তথ্য):
${contextText}

ইউজারের প্রশ্ন: ${content}
`;

      // 6. Generate final response from AI Service
      const aiResponse = await this.ai.generateResponse(prompt);

      // 7. Save assistant's message to database
      await this.prisma.message.create({
        data: {
          conversationId,
          content: aiResponse,
          role: MessageRole.ASSISTANT,
        },
      });

      // 8. Return response to the client
      return { response: aiResponse };

    } catch (error: any) {
      this.logger.error("Error in handleMessage: ", error?.stack);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to process the chat message.',
        error: error?.message,
      });
    }
  }
}
