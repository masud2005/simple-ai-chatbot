import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { FileParserUtil } from './utils/file-parser.util';
import { TextSplitterUtil } from './utils/text-splitter.util';
import { AiService } from '../ai/ai.service';

@Injectable()
export class KnowledgeService {
    constructor(
        private prisma: PrismaService,
        private ai: AiService
    ) { }
    private readonly logger = new Logger(KnowledgeService.name);

    // This function saves a document to the database
    async saveDocumentToDatabase(text: string, embeddingValues: number[]): Promise<{
        success: boolean;
        message: string;
    }> {
        try {
            this.validateEmbedding(embeddingValues);

            const vectorString = this.toVectorString(embeddingValues);

            await this.prisma.$executeRaw`
                INSERT INTO "Document" (id, content, embedding, "createdAt")
                VALUES (
                    gen_random_uuid(), 
                    ${text}, 
                    ${vectorString}::vector, 
                    NOW()
                )
            `;
            return { success: true, message: "Document saved successfully!" };
        } catch (error) {
            this.logger.error("Failed to save document", error?.stack);
            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to save document',
                error: error?.message,
            });
        }
    }

    // This function finds the most similar documents in the database to a given embedding
    async findSimilarDocuments(embeddingValues: number[]): Promise<{
        id: string;
        content: string;
        similarity: number;
    }[]> {
        try {
            this.validateEmbedding(embeddingValues);

            const vectorString = this.toVectorString(embeddingValues);

            const documents = await this.prisma.$queryRaw`
                SELECT id, content, 1 - (embedding <=> ${vectorString}::vector) as similarity
                FROM "Document"
                ORDER BY embedding <=> ${vectorString}::vector
                LIMIT 3; 
            `;
            return documents as { id: string; content: string; similarity: number }[];
        } catch (error) {
            this.logger.error("Failed to find similar documents", error?.stack);
            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to find similar documents',
                error: error?.message,
            });
        }
    }

    // This function ingests a file into the knowledge base
    async ingestFile(file: Express.Multer.File): Promise<{ success: boolean; message: string; chunks: number }> {
        try {
            // Validate uploaded file
            if (!file) {
                throw new BadRequestException('No file was uploaded.');
            }

            this.logger.log(`Processing file: ${file.originalname}`);

            // 1. Parse file into plain text
            const rawText = await FileParserUtil.parse(file);

            // Validate parsed text
            if (!rawText || !rawText.trim()) {
                throw new BadRequestException(
                    'The uploaded file does not contain any readable text.',
                );
            }

            // 2. Split into chunks
            const chunks = TextSplitterUtil.splitText(rawText);

            if (!chunks.length) {
                throw new BadRequestException(
                    'Unable to generate chunks from the uploaded file.',
                );
            }
            this.logger.log(`Generated ${chunks.length} chunks.`);

            let savedChunks = 0;
            let skippedChunks = 0;

            // 3. Generate embeddings for each chunk and save to database
            for (const chunk of chunks) {
                const cleanedChunk = chunk.trim();

                if (cleanedChunk.length < 20) {
                    skippedChunks++;
                    continue;
                }

                const embeddingValues = await this.ai.createEmbedding(chunk);

                const result = await this.saveDocumentToDatabase(cleanedChunk, embeddingValues);

                if (result.success) savedChunks++;
            }

            this.logger.log(
                `Finished processing "${file.originalname}". Saved: ${savedChunks}, Skipped: ${skippedChunks}`,
            );

            return {
                success: true,
                message: `File ingested successfully! (saved: ${savedChunks}, skipped: ${skippedChunks})`,
                chunks: chunks.length
            };
        } catch (error: any) {
            this.logger.error("Failed to ingest file", error?.stack);
            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to ingest file',
                error: error?.message,
            });
        }
    }

    // Convert array of numbers to vector string
    private toVectorString(values: number[]): string {
        return `[${values.join(',')}]`;
    }

    // Validate embedding values
    private validateEmbedding(embeddingValues: number[]): void {
        if (!embeddingValues || embeddingValues.length === 0) {
            throw new InternalServerErrorException({
                success: false,
                message: 'Embedding vector is empty.',
            });
        }
    }
}
