
import OpenAI from "openai";

const ollama = new OpenAI({
    baseURL: "http://localhost:11434/v1",
    apiKey: "ollama"
});

export async function generateAnswer(question, chunks) {

    const context = chunks
        .map((chunk, index) => {
            return `[SOURCE ${index + 1} | File: ${chunk.filename} | Page: ${chunk.page} | Table #: ${chunk.table_number ?? "N/A"}]
${chunk.content}`;
        })
        .join("\n\n---\n\n");

    const systemInstruction = `
You are a Document Assistant.

Your job is to help the user understand and work with their documents.

You can also have normal conversations with the user, such as greetings,
thanks, and simple conversational messages.

For document-related questions:

1. Answer ONLY using the provided SOURCE CONTENT.
2. Do NOT invent information.
3. Do NOT guess or substitute one table for another.
4. If the user asks for a specific table, use that exact table number.
5. If the requested information is not present in the SOURCE CONTENT,
   clearly say that it is not available in the provided context.
6. Never use one source as a replacement for another source.
7. Keep the answer relevant to the user's question.

For normal conversational messages:

- Respond naturally.
- Do not pretend that document sources are required.
- Do not mention missing document context.
- Do not display sources when the conversation does not require them.
`;

    const userPrompt = `
SOURCE CONTENT:

${context || "No document context was provided."}

QUESTION:

${question}
`;

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

