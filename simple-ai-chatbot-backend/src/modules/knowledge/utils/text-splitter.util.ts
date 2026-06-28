export class TextSplitterUtil {
    static splitText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
        const chunks: string[] = [];
        let i = 0;

        // Replace multiple whitespace characters (including newlines) with a single space
        const cleanText = text.replace(/\n+/g, '\n').trim();

        while (i < cleanText.length) {
            const chunk = cleanText.slice(i, i + chunkSize);
            chunks.push(chunk);
            i += chunkSize - overlap;
        }
        return chunks;
    }
}