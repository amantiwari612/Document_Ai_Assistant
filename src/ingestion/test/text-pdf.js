import { chunkPages } from "../chunker.js";
import { extractTextFromPDF } from "../pdf.js";
import { detectBlocks } from "../block-detector.js";
import { chunkBlocks } from "../chunk-block.js";

const result = await extractTextFromPDF("./sample-tables.pdf");
const blocks = detectBlocks(result.pages);
for (const block of blocks) {
    console.log("\n========================");

    console.log("TYPE:", block.type);
    console.log("PAGE:", block.pageNumber);
    console.log("TABLE:", block.tableNumber ?? null);

    for (const line of block.lines) {
        console.log(
            `${line.lineNumber}: ${line.text}`
        );
    }
}
const chunks = chunkBlocks(blocks);

console.log("\n===== CHUNKS =====");
console.log("Total chunks:", chunks.length);

for (const chunk of chunks.slice(0, 5)) {
    console.log("\n==============================");
    console.log("Type:", chunk.type);
    console.log("Page:", chunk.pageNumber);
    console.log("Table:", chunk.tableNumber);
    console.log("Chunk:", chunk.chunkIndex);
    console.log("==============================");
    console.log(chunk.text);
}
