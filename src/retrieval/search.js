import { pool } from "../database/db.js";
import { createEmbedding } from "../embeddings/embeddings.js";

/**
 * Generic Hybrid Search + Reciprocal Rank Fusion (RRF)
 * Combines dense vector similarity with PostgreSQL full-text search (BM25 equivalent).
 */
export async function searchSimilarChunks(query, limit = 5) {
    const queryEmbedding = await createEmbedding(query);
    const vector = `[${queryEmbedding.join(",")}]`;

    // Hybrid SQL Query using Reciprocal Rank Fusion (RRF)
    const sql = `
    WITH vector_matches AS (
        SELECT id, filename, page, chunk_index, block_type, table_number, content,
               ROW_NUMBER() OVER (ORDER BY embedding <=> $1::vector) AS rank
        FROM document_chunks
        ORDER BY embedding <=> $1::vector
        LIMIT 20
    ),
    text_matches AS (
        SELECT id, filename, page, chunk_index, block_type, table_number, content,
               ROW_NUMBER() OVER (
                   ORDER BY ts_rank_cd(to_tsvector('english', content), plainto_tsquery('english', $2)) DESC
               ) AS rank
        FROM document_chunks
        WHERE to_tsvector('english', content) @@ plainto_tsquery('english', $2)
        LIMIT 20
    )
    SELECT 
        COALESCE(v.id, t.id) AS id,
        COALESCE(v.filename, t.filename) AS filename,
        COALESCE(v.page, t.page) AS page,
        COALESCE(v.chunk_index, t.chunk_index) AS chunk_index,
        COALESCE(v.block_type, t.block_type) AS block_type,
        COALESCE(v.table_number, t.table_number) AS table_number,
        COALESCE(v.content, t.content) AS content,
        (COALESCE(1.0 / (60 + v.rank), 0.0) + COALESCE(1.0 / (60 + t.rank), 0.0)) AS rrf_score
    FROM vector_matches v
    FULL OUTER JOIN text_matches t ON v.id = t.id
    ORDER BY rrf_score DESC
    LIMIT $3;
    `;

    const result = await pool.query(sql, [vector, query, limit]);
    return result.rows;
}