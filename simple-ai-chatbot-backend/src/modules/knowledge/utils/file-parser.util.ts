import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { BadRequestException } from '@nestjs/common';

export class FileParserUtil {
    static async parse(file: Express.Multer.File): Promise<string> {
        const { mimetype, buffer } = file;

        switch (mimetype) {
            case 'application/pdf': {
                const parser = new PDFParse({
                    data: buffer,
                });

                try {
                    const result = await parser.getText();
                    return result.text;
                } finally {
                    await parser.destroy();
                }
            }

            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
                const docxData = await mammoth.extractRawText({ buffer });
                return docxData.value;
            }

            case 'text/plain':
            case 'text/markdown':
            case 'text/csv':
                return buffer.toString('utf-8');

            default:
                throw new BadRequestException(
                    `Unsupported file type: ${mimetype}`,
                );
        }
    }
}