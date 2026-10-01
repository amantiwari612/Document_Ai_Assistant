import { OllamaClient as ollama } from "../llm/ollama_service.js";

export async function generateAnswer(question, chunks) {

    // 1. Format retrieved chunks with clear metadata attribution
    const context = (chunks || [])
        .map((chunk, index) => {
            const tableMeta = chunk.table_number ? ` | Table #: ${chunk.table_number}` : "";
            const pageMeta = chunk.page ? ` | Page: ${chunk.page}` : "";
            return `[SOURCE ${index + 1} | File: ${chunk.filename || "Doc"}${pageMeta}${tableMeta}]
${chunk.content}`;
        })
        .join("\n\n---\n\n");

    // 2. System instruction supporting both local QA and document synthesis/summaries
    const systemInstruction = `
You are a Document Assistant.

Your job is to help the user understand and work with their documents.

You can also have normal conversations with the user, such as greetings,
thanks, and simple conversational messages.

For document-related questions:

1. Answer using ONLY the provided SOURCE CONTENT.
2. Do NOT invent information, facts, or use placeholder text (e.g. Latin text).
3. If the user asks for a summary, overview, or word-count constrained synthesis, synthesize the provided SOURCE CONTENT accurately according to their constraints.
4. Do NOT guess or substitute one table for another. If a specific table is requested, use that exact table number.
5. If the requested information is genuinely not present in the SOURCE CONTENT, clearly state that it is not available in the provided context.
6. Keep the answer accurate, structured, and relevant to the user's request.

For normal conversational messages:

- Respond naturally.
- Do not pretend that document sources are required.
- Do not mention missing document context.
- Do not display sources when the conversation does not require them.
`;

    // 3. User prompt incorporating context
    const userPrompt = `
SOURCE CONTENT:

${context || "No document context was provided."}

QUESTION:

${question}
`;

    // 4. Call LLM with low temperature for high fidelity
    const response = await ollama.chat.completions.create({
        model: "qwen2.5:7b",
        temperature: 0.1,
        messages: [
            {
                role: "system",
                content: systemInstruction
            },
            {
                role: "user",
                content: userPrompt
            }
        ]
    });

    return response.choices[0].message.content;
}