import express from "express";
import multer from "multer";
import { processAndIndexPDF } from "../ingestion/ingest.js";

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }
});

router.post("/", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No PDF file provided." });
        }

        const originalFilename = req.file.originalname;
        const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const result = await processAndIndexPDF(
            req.file.buffer,
            originalFilename,
            documentId
        );

        return res.status(200).json({
            message: "PDF uploaded and indexed successfully.",
            document: {
                id: result.documentId,
                filename: result.filename,
                totalPages: result.totalPages,
                chunksCount: result.chunksCount
            }
        });

    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: "Failed to process PDF document." });
    }
});

export default router;