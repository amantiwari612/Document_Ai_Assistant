
import { pool } from "../database/db.js";
import { createEmbedding } from "./embeddings.js";

export async function storeChunks(
    chunks,
    filename
) {
    for (const chunk of chunks) {

        console.log(
            `Embedding chunk=${chunk.chunkIndex} ` +
            `page=${chunk.pageNumber} ` +
            `type=${chunk.blockType} ` +
            `table=${chunk.tableNumber}`
        );

        const embedding =
            await createEmbedding(
                chunk.content
            );

        if (embedding.length !== 768) {
            throw new Error(
                `Expected 768 dimensions, got ${embedding.length}`
            );
        }

        const vector =
            `[${embedding.join(",")}]`;

        await pool.query(
            `
            INSERT INTO document_chunks (
                filename,
                page,
                chunk_index,
                content,
                embedding,
                block_type,
                table_number
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5::vector,
                $6,
                $7
            )
            `,
            [
                filename,
                chunk.pageNumber,
                chunk.chunkIndex,
                chunk.content,
                vector,
                chunk.blockType,
                chunk.tableNumber
            ]
        );
    }
}