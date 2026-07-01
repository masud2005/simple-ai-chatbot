export abstract class VectorProvider {
    abstract saveVector(
        id: string,
        text: string,
        vector: number[],
    ): Promise<void>;

    abstract searchSimilar(
        vector: number[],
        limit?: number,
    ): Promise<{ id: string; content: string; similarity: number }[]>;
}
