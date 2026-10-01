// src/retrieval/search.js
import { pool } from "../database/db.js";
import { createEmbedding } from "../embeddings/embeddings.js";

/**
 * Auto-adapting vector & document search pipeline
 */
export async function searchSimilarChunks(queryText, userLimit = 5, clientId, documentId = null) {
  // 1. Detect if query requires broad document context
  const isGlobalQuery = /summary|summarize|overview|whole document|entire document|how many tables|table count|index/i.test(queryText);

  // 2. Automatically scale K if the query is broad
  const effectiveLimit = isGlobalQuery ? 100 : Math.min(Math.max(userLimit, 1), 20);

  const queryEmbedding = await createEmbedding(queryText);
  const vector = `[${queryEmbedding.join(",")}]`;

  let query = "";
  let queryParams = [];

  if (documentId) {
    query = `
      SELECT 
        id,
        document_id,
        filename,
        page,
        chunk_index,
        content,
        block_type,
        table_number,
        1 - (embedding <=> $1::vector) AS similarity
      FROM document_chunks
      WHERE client_id = $2 AND document_id = $3
      ORDER BY 
        CASE WHEN $4 = true THEN chunk_index END ASC, -- Keep natural reading order for summaries
        embedding <=> $1::vector ASC
      LIMIT $5;
    `;
    queryParams = [vector, clientId, documentId, isGlobalQuery, effectiveLimit];
  } else {
    query = `
      SELECT 
        id,
        document_id,
        filename,
        page,
        chunk_index,
        content,
        block_type,
        table_number,
        1 - (embedding <=> $1::vector) AS similarity
      FROM document_chunks
      WHERE client_id = $2
      ORDER BY embedding <=> $1::vector ASC
      LIMIT $3;
    `;
    queryParams = [vector, clientId, effectiveLimit];
  }

  const result = await pool.query(query, queryParams);
  
  // If global query, sort chunks chronologically so the LLM reads page by page
  if (isGlobalQuery) {
    return result.rows.sort((a, b) => a.chunk_index - b.chunk_index);
  }

  return result.rows;
}