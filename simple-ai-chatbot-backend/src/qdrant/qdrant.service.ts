import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { VectorProvider } from './qdrant.provider';
import { QdrantClient } from '@qdrant/js-client-rest';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QdrantService implements VectorProvider, OnModuleInit {
    private client: QdrantClient;
    private readonly collectionName = 'knowledge_base';
    private readonly logger = new Logger(QdrantService.name);

    constructor(private readonly configService: ConfigService) {
        this.client = new QdrantClient({
            url: configService.getOrThrow('QDRANT_URL'),
        });
    }

    // async onModuleInit() {
    //     this.logger.log('[INIT] Checking Qdrant collection...');

    //     try {
    //         await this.client.getCollections();
    //         this.logger.log('[INIT] Connected to Qdrant');
    //     } catch (err) {
    //         this.logger.error('[INIT] Failed to connect to Qdrant:', err);
    //         throw err;
    //     }
    // }

    async onModuleInit() {
        try {
            const collections = await this.client.getCollections();
            const exists = collections.collections.some(c => c.name === this.collectionName);

            if (!exists) {
                await this.client.createCollection(this.collectionName, {
                    vectors: {
                        size: 3072,
                        distance: 'Cosine'
                    }
                });
                this.logger.log(`Created Qdrant collection: ${this.collectionName}`);
            }
        } catch (error) {
            this.logger.error('Failed to initialize Qdrant collection', error);
        }
    }

    async saveVector(id: string, text: string, vector: number[]): Promise<void> {
        await this.client.upsert(this.collectionName, {
            wait: true,
            points: [{ id, vector, payload: { content: text } }]
        });
    }
    async searchSimilar(vector: number[], limit: number = 3): Promise<{ id: string; content: string; similarity: number }[]> {
        const results = await this.client.search(this.collectionName, {
            vector: vector,
            limit: limit,
            with_payload: true,
        });
        return results.map(res => ({
            id: String(res.id),
            content: res.payload?.content as string,
            similarity: res.score
        }));
    }
}

