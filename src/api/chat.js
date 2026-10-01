// src/routes/chat.js
import express from "express";
import { searchSimilarChunks } from "../retrieval/search.js";
import { generateAnswer } from "../generation/answer.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, limit, documentId } = req.body;
    const clientId = req.headers["x-client-id"] || req.body.clientId;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!clientId) {
      return res.status(400).json({ error: "Missing x-client-id header." });
    }

    const cleanQuery = message.trim();
    const parsedLimit = parseInt(limit, 10) || 5;

    // 1. Auto-adapting search handles both specific Q&A and broad summary queries
    const chunks = await searchSimilarChunks(cleanQuery, parsedLimit, clientId, documentId || null);

    // 2. Generation produces a summary or direct answer based on the retrieved context
    const answer = await generateAnswer(cleanQuery, chunks);

    return res.status(200).json({
      answer,
      sources: chunks.map((c) => ({
        id: c.id,
        filename: c.filename,
        page: c.page,
        chunk: c.chunk_index,
        blockType: c.block_type,
        tableNumber: c.table_number,
        similarity: Number((c.similarity || 0).toFixed(4)),
        content: c.content
      }))
    });

  } catch (error) {
    console.error("Chat Error:", error);
    return res.status(500).json({ error: "Failed to generate answer." });
  }
});

export default router;