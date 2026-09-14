import { extractTextFromPDF } from "../extract-text.js";
import { analyzePageLines } from "../line-analyzer.js";
import { detectBlocks } from "../block-detector.js";
import { validateBlocks } from "../table/table-validator.js";
import { parseTable } from "../table/table-parser.js";

const filePath = "./sample-tables.pdf";

const result =
    await extractTextFromPDF(filePath);

const targetTables = new Set([
    7,
    9,
    19,
    29
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

        const parsedTable =
            parseTable(block);

        console.log(
            "\n========================================"
        );

        console.log(
            `TABLE ${block.tableNumber}`
        );

        console.log(
            "========================================"
        );

        console.log(
            "\n--- BLOCK ---"
        );

        console.dir(
            {
                pageNumber: block.pageNumber,
                tableNumber: block.tableNumber,
                title: block.title,
                captionLineCount:
                    block.captionLineCount
            },
            {
                depth: null
            }
        );

        console.log(
            "\n--- SCHEMA ---"
        );

        console.dir(
            parsedTable.schema,
            {
                depth: null
            }
        );

        console.log(
            "\n--- HEADERS ---"
        );

        console.dir(
            parsedTable.headers,
            {
                depth: null
            }
        );

        console.log(
            "\n--- NORMALIZED ROWS ---"
        );

        console.dir(
            parsedTable.rows,
            {
                depth: null
            }
        );
    }
}