import { Router } from "express";
import { pool } from "../database/db.js";

const router = Router();

// GET documents for the SPECIFIC computer
router.get("/", async (req, res) => {
  try {
    // Read device ID from headers or query string
    const clientId = req.headers["x-client-id"] || req.query.clientId;

    if (!clientId) {
      return res.status(400).json({ error: "Missing x-client-id header." });
    }

    const result = await pool.query(
      `
      SELECT DISTINCT document_id AS id, filename
      FROM document_chunks
      WHERE client_id = $1 AND document_id IS NOT NULL
      ORDER BY filename ASC
      `,
      [clientId]
    );

    return res.status(200).json({ documents: result.rows });
  } catch (error) {
    console.error("Fetch documents error:", error);
    return res.status(500).json({ error: "Failed to fetch documents." });
  }
});

// DELETE a document scoped to the specific computer
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.headers["x-client-id"];

    const result = await pool.query(
      `DELETE FROM document_chunks WHERE document_id = $1 AND client_id = $2 RETURNING id`,
      [id, clientId]
    );

    return res.status(200).json({
      message: "Document deleted successfully.",
      deletedChunksCount: result.rowCount
    });
  } catch (error) {
    console.error("Delete document error:", error);
    return res.status(500).json({ error: "Failed to delete document." });
  }
});

router.delete("/session", async (req, res) => {
  try {
    const clientId = req.headers["x-client-id"] || req.body?.clientId;

    if (!clientId) {
      return res.status(400).json({ error: "Missing x-client-id header." });
    }

    const result = await pool.query(
      `DELETE FROM document_chunks WHERE client_id = $1`,
      [clientId]
    );

    console.log(`[CLEANUP] Deleted ${result.rowCount} chunks for client: ${clientId}`);

    return res.status(200).json({
      message: "Session data cleared successfully.",
      deletedChunks: result.rowCount
    });
  } catch (error) {
    console.error("Clear session error:", error);
    return res.status(500).json({ error: "Failed to clear session data." });
  }
});

export default router;