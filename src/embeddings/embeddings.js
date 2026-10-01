import { OllamaClient as client } from "../llm/ollama_service.js";

const EMBEDDING_MODEL = "nomic-embed-text";

export async function createEmbedding(text) {
    if (!text?.trim()) {
        throw new Error(
            "Cannot create embedding for empty text."
        );
    }

    const response =
        await client.embeddings.create({
            model: EMBEDDING_MODEL,
            input: text
        });

    return response.data[0].embedding;
}