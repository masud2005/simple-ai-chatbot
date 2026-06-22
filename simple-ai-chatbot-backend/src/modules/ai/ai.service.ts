import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
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
}
