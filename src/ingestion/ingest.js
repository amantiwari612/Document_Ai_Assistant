import fs from "fs/promises";
import path from "path";
import os from "os";

import { extractTextFromPDF } from "./extract-text.js";
import { analyzePageLines } from "./line-analyzer.js";
import { detectBlocks } from "./block-detector.js";
import { validateBlocks } from "./table/table-validator.js";
import { buildPageBlocks } from "./block-builder.js";
import { buildDocumentStructure } from "./document-structure.js";
import { chunkDocument } from "./chunker.js";
import { createEmbedding } from "../embeddings/embeddings.js";
import { pool } from "../database/db.js";

/**
 * Dynamically ingests, chunks, vectorizes, and stores a PDF in PostgreSQL
 */
export async function processAndIndexPDF(fileBuffer, originalFilename, documentId) {
    const tempFilePath = path.join(os.tmpdir(), `${documentId}-${originalFilename}`);
    await fs.writeFile(tempFilePath, fileBuffer);

    try {
        console.log(`\n================================`);
        console.log(`INGESTING PDF: ${originalFilename}`);
        console.log(`Document ID: ${documentId}`);

        // 1. Extract PDF Text & Lines
        const result = await extractTextFromPDF(tempFilePath);
        console.log("Total pages:", result.totalPages);

        // 2. Build Structured Pages
        const structuredPages = [];
        for (const page of result.pages) {
            const analyzedPage = analyzePageLines(page);
            const detectedBlocks = detectBlocks(analyzedPage);
            const validatedBlocks = validateBlocks(detectedBlocks);
            const blocks = buildPageBlocks(validatedBlocks);

            structuredPages.push({
                pageNumber: page.pageNumber,
                blocks
            });
        }

        // 3. Build Document Structure & Generate Chunks
        const document = buildDocumentStructure(structuredPages);
        const chunks = chunkDocument(document, 300, 50);
        console.log(`Total generated chunks: ${chunks.length}`);

        // 4. Generate Embeddings & Store in PostgreSQL
        for (const chunk of chunks) {
            let enrichedContent = chunk.content;

            if (chunk.blockType === "table" && chunk.tableNumber) {
                enrichedContent = `[Document: ${originalFilename} | Table Identifier: Table ${chunk.tableNumber} | Page: ${chunk.pageNumber}]\n${chunk.content}`;
            } else {
                enrichedContent = `[Document: ${originalFilename} | Page: ${chunk.pageNumber}]\n${chunk.content}`;
            }

            const embedding = await createEmbedding(enrichedContent);

            if (embedding.length !== 768) {
                throw new Error(`Expected 768 dimensions, got ${embedding.length}`);
            }

            const vector = `[${embedding.join(",")}]`;

            // Fixed: Corresponded 8 columns directly to 8 placeholders ($1 through $8)
            await pool.query(
                `
                INSERT INTO document_chunks (
                    document_id,
                    filename,
                    page,
                    chunk_index,
                    content,
                    embedding,
                    block_type,
                    table_number
                )
                VALUES ($1, $2, $3, $4, $5, $6::vector, $7, $8)
                `,
                [
                    documentId,
                    originalFilename,
                    chunk.pageNumber,
                    chunk.chunkIndex,
                    enrichedContent,
                    vector,
                    chunk.blockType,
                    chunk.tableNumber ?? null
                ]
            );
        }

        console.log(`Successfully indexed ${originalFilename}\n================================`);

        return {
            documentId,
            filename: originalFilename,
            totalPages: result.totalPages,
            chunksCount: chunks.length
        };

    } finally {
        // Clean up temporary file
        await fs.unlink(tempFilePath).catch(() => {});
    }
}