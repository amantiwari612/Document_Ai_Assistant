import express from "express";
import { pool } from "../database/db.js";

const router = express.Router();

// 1. GET ALL UPLOADED DOCUMENTS (for React sidebar on page load)
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT document_id AS id, filename
            FROM document_chunks
            WHERE document_id IS NOT NULL
            ORDER BY filename ASC
        `);

        return res.status(200).json({
            documents: result.rows
        });
    } catch (error) {
        console.error("Fetch documents error:", error);
        return res.status(500).json({ error: "Failed to fetch documents." });
    }
});

// 2. DELETE A DOCUMENT AND ITS VECTOR CHUNKS
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM document_chunks WHERE document_id = $1 RETURNING id`,
            [id]
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

export default router;