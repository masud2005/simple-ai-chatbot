import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { KnowledgeService } from './knowledge.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('knowledge')
export class KnowledgeController {
  constructor(
    private readonly aiService: AiService,
    private readonly knowledgeService: KnowledgeService,
  ) { }

  // POST /knowledge/upload
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return await this.knowledgeService.ingestFile(file);
  }
}
