import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

@Injectable()
export class KnowledgeService {
    constructor(private prisma: PrismaService) { };
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
