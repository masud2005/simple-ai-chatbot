import { PrismaService } from '@/prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) { }
  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  private readonly logger = new Logger(AiService.name);

  // Generate Response using Gemini API
  async generateResponse(prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-3.1-flash-lite',
      });
      const result = await model.generateContent(prompt);

      return result.response.text();
    } catch (error: any) {
      this.logger.error("Failed to generate response", error?.stack);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to generate AI response',
        error: error?.message,
      });
    }
  }

  // Create Embedding using Gemini API
  async createEmbedding(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-embedding-2',
      });
      const result = await model.embedContent(text);

      return result.embedding.values;
    } catch (error: any) {
      this.logger.error("Failed to create embedding", error?.stack);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to create embedding',
        error: error?.message,
      });
    }
  }
}
