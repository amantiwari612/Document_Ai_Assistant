import { extractTextFromPDF } from "../extract-text.js";
import { analyzePageLines } from "../line-analyzer.js";
import { detectBlocks } from "../block-detector.js";
import { validateBlocks } from "../table/table-validator.js";
import { analyzeTableLine } from "../table/table-line-analyzer.js";
import { classifyTableRow } from "../table/table-row-classifier.js";

const filePath = "./sample-tables.pdf";

const result =
    await extractTextFromPDF(filePath);

const targetTables = new Set([
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    20,
    21,
    22,
    23,
    25,
    26
]);

for (const page of result.pages) {
    const analyzedPage =
        analyzePageLines(page);

    const detectedBlocks =
        detectBlocks(analyzedPage);

    const validatedBlocks =
        validateBlocks(detectedBlocks);

    for (const block of validatedBlocks) {
        if (block.type !== "table") {
            continue;
        }

        if (!targetTables.has(block.tableNumber)) {
            continue;
        }

        console.log(
            "\n========================================"
        );

        console.log(
            `TABLE ${block.tableNumber}`
        );

        console.log(
            `PAGE ${block.pageNumber}`
        );

        console.log(
            "========================================"
        );

        console.log(
            "\n--- RAW CLASSIFIED LINES ---"
        );

        const captionLineCount =
            block.captionLineCount ?? 1;

        const dataLines =
            block.lines.slice(captionLineCount);

        const analyzedLines =
            dataLines.map(analyzeTableLine);

        let previousLine = null;

        for (const line of analyzedLines) {
            const classified =
                classifyTableRow(
                    line,
                    previousLine
                );

            console.log({
                lineNumber: classified.lineNumber,
                rawText: classified.rawText,
                cells: classified.cells,
                columnCount:
                    classified.columnCount,
                role: classified.role,
                reason: classified.reason
            });

            previousLine = classified;
        }
    }
}