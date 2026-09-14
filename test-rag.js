import { pool } from "./src/database/db.js";
import { generateAnswer } from "./src/generation/answer.js";
import { searchSimilarChunks } from "./src/retrieval/search.js";

const question =
    "Give me the number of tables and give me details about table 2.";

try {

    // ========================================
    // 1. RETRIEVE RELEVANT CHUNKS
    // ========================================

    console.log("Searching...\n");

    const chunks =
        await searchSimilarChunks(question, 5);

    console.log(
        `Found ${chunks.length} relevant chunks.`
    );


    // ========================================
    // 2. SHOW RETRIEVED CHUNKS
    // ========================================

    console.log("\nRETRIEVED CHUNKS:");

    for (const chunk of chunks) {

        console.log(
            "\n=============================="
        );

        console.log("ID:", chunk.id);

        console.log(
            "Similarity:",
            Number(chunk.similarity).toFixed(4)
        );

        console.log(
            "File:",
            chunk.filename
        );

        console.log(
            "Page:",
            chunk.page
        );

        console.log(
            "Chunk:",
            chunk.chunk_index
        );

        console.log(
            "Type:",
            chunk.block_type
        );

        console.log(
            "Table:",
            chunk.table_number
        );

        console.log("\nContent:");

        console.log(chunk.content);

        console.log(
            "=============================="
        );
    }


    // ========================================
    // 3. GENERATE ANSWER
    // ========================================

    console.log("\nGenerating answer...\n");

    const answer =
        await generateAnswer(
            question,
            chunks
        );

    console.log("ANSWER:");

    console.log(answer);

} catch (error) {

    console.error(
        "RAG test failed:",
        error
    );

} finally {

    await pool.end();

}