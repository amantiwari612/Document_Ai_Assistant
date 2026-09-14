// import { createEmbedding } from "./src/embedding.js";
// import { searchSimilarChunks } from "./src/retrieval/search.js";

import { pool } from "./src/database/db.js";
import { createEmbeddings } from "./src/embeddings/embeddings.js";
import { searchSimilarChunks } from "./src/retrieval/search.js";

// import { pool } from "./src/database/db.js";


const question = "What is this PDF about?";

try {
    // 1. Convert the question into an embedding
    const queryEmbedding = await createEmbeddings(question);

    console.log("Query embedding dimensions:", queryEmbedding.length);

    // 2. Search PostgreSQL
    const results = await searchSimilarChunks(queryEmbedding, 5);

    console.log("\nTop results:\n");

    for (const result of results) {
        console.log("ID:", result.id);
        console.log("Chunk:", result.chunk_index);
        console.log("Similarity:", result.similarity);
        console.log("Content:", result.content);
        console.log("-----------------------------------");
    }

} catch (error) {
    console.error("Search failed:");
    console.error(error);
} finally {
    await pool.end();
}