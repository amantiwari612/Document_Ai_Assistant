import { pool } from "../database/db.js";

export async function storeChunk({
    filename,
    page,
    chunkIndex,
    content,
    embedding
}) {
    const vector = `[${embedding.join(",")}]`;

    const query = `
        INSERT INTO document_chunks
        (filename, page, chunk_index, content, embedding)
        VALUES ($1, $2, $3, $4, $5::vector)
        RETURNING id;
    `;

    const values = [
        filename,
        page,
        chunkIndex,
        content,
        vector
    ];

    const result = await pool.query(query, values);

    return result.rows[0].id;
}