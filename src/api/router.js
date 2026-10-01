import express from "express";
import multer from "multer";
import { processAndIndexPDF } from "../ingestion/ingest.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed."));
        }
    }
});

router.post("/", (req, res, next) => {
    // Handle Multer middleware errors (file size limit, invalid file type) cleanly
    upload.single("file")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No PDF file provided." });
        }

        // 1. Extract device client_id from headers or form body fallback
        const clientId = req.headers["x-client-id"] || req.body?.clientId;

        if (!clientId) {
            return res.status(400).json({ error: "Missing x-client-id header." });
        }

        const originalFilename = req.file.originalname;
        const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        // 2. Pass extracted clientId to the ingestion engine
        const result = await processAndIndexPDF(
            req.file.buffer,
            originalFilename,
            documentId,
            clientId
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
        console.error("Upload route processing error:", error);
        return res.status(500).json({ error: "Failed to process PDF document." });
    }
});

export default router;