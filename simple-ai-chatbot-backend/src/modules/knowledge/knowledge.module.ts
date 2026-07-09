import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { QdrantModule } from '@/qdrant/qdrant.module';

@Module({
  imports: [PrismaModule, AiModule, QdrantModule],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class KnowledgeModule { }
