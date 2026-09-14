import OpenAI from "openai";

const ollama = new OpenAI({
    baseURL: "http://localhost:11434/v1",
    apiKey: "ollama"
});

const response = await ollama.chat.completions.create({
    model: "qwen2.5:7b",

    messages: [
        {
            role: "user",
            content: "Explain what a PDF is in one sentence."
        }
    ]
});

console.log(response.choices[0].message.content);