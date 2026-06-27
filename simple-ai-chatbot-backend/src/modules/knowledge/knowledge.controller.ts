import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { KnowledgeService } from './knowledge.service';

@Controller('knowledge')
export class KnowledgeController {
  constructor(
    private readonly aiService: AiService,
    private readonly knowledgeService: KnowledgeService,
  ) { }

  // Generates embedding for text and saves it to the vector database.
  @Post("embedding-text")
  async embedding(@Body() body: { text: string }) {
    const embedding = await this.aiService.createEmbedding(body.text);
    return this.knowledgeService.saveDocumentToDatabase(body.text, embedding);
  }
}
