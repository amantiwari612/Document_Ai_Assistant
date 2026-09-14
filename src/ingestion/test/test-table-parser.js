import { extractTextFromPDF } from "../extract-text.js";
import { analyzePageLines } from "../line-analyzer.js";
import { detectBlocks } from "../block-detector.js";
import { validateBlocks } from "../table/table-validator.js";
import { parseTable } from "../table/table-parser.js";
import { buildTableStructure } from "../table/table-structure.js";


const filePath = "./sample-tables.pdf";

const result = await extractTextFromPDF(filePath);

for (const page of result.pages.slice(0, 3)) {
    const analyzedPage = analyzePageLines(page);

    const detectedBlocks = detectBlocks(analyzedPage);

    const blocks = validateBlocks(detectedBlocks);

    for (const block of blocks) {
        if (block.type !== "table") {
            continue;
        }

        const table = parseTable(block);
        const structure = buildTableStructure(table);

console.log("\nSTRUCTURE:");
console.dir(structure, {
    depth: null
});

        console.log("\n================================");
        console.log(`TABLE ${table.tableNumber}`);
        console.log("================================");

        console.log("Page:", table.pageNumber);
        console.log("Title:", table.title);

        for (const line of table.lines) {
      console.log(`\nLINE ${line.lineNumber}`);
      console.log("Text:", line.text);
      console.log("Cells:", line.cells);
      console.log("Columns:", line.columnCount);
      console.log("Has tabs:", line.hasTabs);
      console.log("Numeric tokens:", line.numericTokenCount);
      console.log("Numeric heavy:", line.isNumericHeavy);
      console.log("Is year:", line.isYear);
console.log("Role:", line.role);
console.log("Reason:", line.reason);
console.log("Schema:");
console.log(table.schema);
  }
    }
}