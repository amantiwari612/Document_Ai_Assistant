import fs from "fs";
import { PDFParse } from "pdf-parse";

export async function inspectPDF(filePath) {
    const buffer = fs.readFileSync(filePath);

    const parser = new PDFParse({
        data: buffer
    });

    try {
        const result = await parser.getText({
            itemJoiner: " "
        });

        console.log("TOTAL PAGES:", result.total);

        for (const page of result.pages) {
            console.log("\n==============================");
            console.log(`PAGE ${page.pageNumber}`);
            console.log("==============================");

            console.log(page.text);
        }

        return result;
    } finally {
        await parser.destroy();
    }
}