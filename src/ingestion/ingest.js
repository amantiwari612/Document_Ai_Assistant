import { extractTextFromPDF } from "./extract-text.js";
import { analyzePageLines } from "./line-analyzer.js";
import { detectBlocks } from "./block-detector.js";
import { validateBlocks } from "./table/table-validator.js";
import { buildPageBlocks } from "./block-builder.js";
import { buildDocumentStructure } from "./document-structure.js";
import { chunkDocument } from "./chunker.js";
import { createEmbedding } from "../embeddings/embeddings.js";
import { pool } from "../database/db.js";

const filePath = "./index.pdf";

// ========================================
// 1. EXTRACT PDF
// ========================================

const result = await extractTextFromPDF(filePath);

console.log("Total pages:", result.totalPages);


// ========================================
// 2. BUILD STRUCTURED PAGES
// ========================================

const structuredPages = [];

for (const page of result.pages) {

    const analyzedPage =
        analyzePageLines(page);

    const detectedBlocks =
        detectBlocks(analyzedPage);

    const validatedBlocks =
        validateBlocks(detectedBlocks);

    const blocks =
        buildPageBlocks(validatedBlocks);

    structuredPages.push({
        pageNumber: page.pageNumber,
        blocks
    });
}


// ========================================
// 3. BUILD DOCUMENT STRUCTURE
// ========================================

const document =
    buildDocumentStructure(structuredPages);


// ========================================
// 4. CHUNK DOCUMENT
// ========================================

const chunks =
    chunkDocument(document, 300, 50);

console.log("Total chunks:", chunks.length);

// ========================================
// 5. CREATE EMBEDDINGS + STORE
// ========================================

for (const chunk of chunks) {

    console.log(
        `Embedding chunk=${chunk.chunkIndex} ` +
        `page=${chunk.pageNumber} ` +
        `type=${chunk.blockType} ` +
        `table=${chunk.tableNumber}`
    );

    // Contextual Enrichment for Table/Block Types
    let enrichedContent = chunk.content;
    if (chunk.blockType === "table" && chunk.tableNumber) {
        enrichedContent = `[Table Identifier: Table ${chunk.tableNumber} | Page: ${chunk.pageNumber}]\n${chunk.content}`;
    }

    // Create embedding using contextualized text
    const embedding =
        await createEmbedding(enrichedContent);

    if (embedding.length !== 768) {
        throw new Error(
            `Expected 768 dimensions, got ${embedding.length}`
        );
    }

    const vector =
        `[${embedding.join(",")}]`;

    await pool.query(
        `
        INSERT INTO document_chunks (
            filename,
            page,
            chunk_index,
            content,
            embedding,
            block_type,
            table_number
        )
        VALUES ($1, $2, $3, $4, $5::vector, $6, $7)
        `,
        [
            filePath,
            chunk.pageNumber,
            chunk.chunkIndex,
            enrichedContent, // Store enriched text so LLM sees context
            vector,
            chunk.blockType,
            chunk.tableNumber
        ]
    );
}

// ========================================
// 6. DONE
// ========================================

console.log("Ingestion complete.");

await pool.end();