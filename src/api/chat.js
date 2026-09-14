import e from "express";

import { generateAnswer } from "../generation/answer.js";
import { searchSimilarChunks } from "../retrieval/search.js";


const router = e.Router();

router.post("/", async (req, res) => {
  try {
    const { message, limit } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Dynamic chunk limit with safe fallback (1 to 20 range)
    const kLimit = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 20);

    console.log("\n================================");
    console.log("NEW CHAT REQUEST");
    console.log("Question:", message);

    const chunks = await searchSimilarChunks(message.trim(), kLimit);
    console.log(`Retrieved ${chunks.length} chunks`);

    const answer = await generateAnswer(message.trim(), chunks);

    // FIXED: Changed res.json(500).json(...) to res.status(200).json(...)
    return res.status(200).json({
      answer,
      sources: chunks.map((chunk) => {
        const score = Number(chunk.similarity ?? chunk.rrf_score ?? 0);
        return {
          id: chunk.id,
          filename: chunk.filename,
          page: chunk.page,
          chunk: chunk.chunk_index,
          blockType: chunk.block_type,
          tableNumber: chunk.table_number,
          similarity: Number.isNaN(score) ? 0 : Number(score.toFixed(4)),
          content: chunk.content
        };
      })
    });
  } catch (error) {
    console.error("Chat error:", error);

    if (res.headersSent) return;

    return res.status(500).json({
      error: "Failed to generate answer."
    });
  }
});

export default router;