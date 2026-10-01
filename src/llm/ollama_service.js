import OpenAI from "openai";
import "dotenv/config";

export const OllamaClient = new OpenAI({
    baseURL: `${process.env.OLLAMA_BASE_URL}`,
    apiKey: `${process.env.OLLAMA_API_KEY}`
});