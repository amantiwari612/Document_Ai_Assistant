import { extractTextFromPDF } from "./extract-text.js";
import { analyzePageLines } from "./line-analyzer.js";
import { detectBlocks } from "./block-detector.js";
import { validateBlocks } from "./table/table-validator.js";
import { buildPageBlocks } from "./block-builder.js";
import { buildDocumentStructure } from "./document-structure.js";
import { renderTableSemantically } from "./semantic-renderer.js";

const filePath = "./sample-tables.pdf";

const result = await extractTextFromPDF(filePath);

console.log("TOTAL PAGES:", result.totalPages);

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

    console.log("\n================================");
    console.log(`PAGE ${page.pageNumber}`);
    console.log("================================");

    for (const [index, block] of blocks.entries()) {

        console.log(`\nBLOCK ${index + 1}`);

        console.log("TYPE:", block.type);

        if (block.tableNumber !== null &&
            block.tableNumber !== undefined) {

            console.log(
                "TABLE NUMBER:",
                block.tableNumber
            );
        }

        if (block.title) {
            console.log(
                "TITLE:",
                block.title
            );
        }

        if (
            block.content?.tableScore !== undefined
        ) {
            console.log(
                "TABLE SCORE:",
                block.content.tableScore.toFixed(2)
            );
        }

        if (block.content?.lines) {
            for (const line of block.content.lines) {
                console.log(
                    `${line.lineNumber}: ${line.text}`
                );
            }
        }

        if (block.items) {
            for (const item of block.items) {
                console.log("-", item);
            }
        }

        if (block.text) {
            console.log(block.text);
        }
    }
}

const document =
    buildDocumentStructure(structuredPages);

console.log("\n\n===============================");
console.log("DOCUMENT STRUCTURE");
console.log("===============================");

for (const page of document.pages) {
    console.log(`\nPAGE ${page.pageNumber}`);

    for (const block of page.blocks) {
        console.log(
            `  ${block.type}`,
            block.tableNumber
                ? `Table ${block.tableNumber}`
                : ""
        );
    }
}