import { PrismaService } from '@/prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) { }
  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

  async generateResponse(message: string) {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
    });
    // console.log('Model', model);

    const result = await model.generateContent(message);
    // console.log('Result', result);

    const response = result.response;
    // console.log('Response', response);

    return response.text();
  }

  async createEmbedding(text: string) {
    // console.log(text);
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-embedding-2',
    })
    // console.log(model);
    try {
      const result = await model.embedContent(text);
      // console.log(result);
      const embedding = result.embedding;
      // console.log(embedding);
      return embedding.values;

    } catch (error: any) {
      console.log(error)
    }
  }

  async saveDocumentToDatabase(text: string) {
    console.log("Normal Text: ", text);
    const embeddingValues = await this.createEmbedding(text);

    if (!embeddingValues) {
      throw new Error("Embedding generation failed");
    }

    // Convert to string
    const vectorString = `[${embeddingValues.join(',')}]`;
    console.log("Convert to Vecotor Text: ", vectorString)

    // Save to DB
    await this.prisma.$executeRaw`
      INSERT INTO "Document" (id, content, embedding, "createdAt")
      VALUES (
        gen_random_uuid(), 
        ${text}, 
        ${vectorString}::vector, 
        NOW()
      )
    `;

    return {
      success: true,
      message: "Document saved successfully!"
    };
  }

  async findSimilarDocuments(queryText: string) {
    console.log("User Question: ", queryText);

    // convert to embedding
    const queryEmbedding = await this.createEmbedding(queryText);

    if (!queryEmbedding) {
      throw new Error("Query embedding generation failed");
    }

    // convert to vector string
    const vectorString = `[${queryEmbedding.join(',')}]`;
    console.log("Query Vector String: ", vectorString);

    // find similar documents
    const documents = await this.prisma.$queryRaw`
      SELECT id, content, 1 - (embedding <=> ${vectorString}::vector) as similarity
      FROM "Document"
      -- Highest similarity comes first
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT 3; 
    `;

    console.log("Similar Documents: ", documents);
    return documents;
  }
}
