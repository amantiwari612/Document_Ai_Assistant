import { createEmbedding } from "./embeddings.js";



const text =
    "This is a test document about financial statements.";

const embedding =
    await createEmbedding(text);

console.log(
    "Dimensions:",
    embedding.length
);

console.log(
    "First 10 values:",
    embedding.slice(0, 10)
);