import fs from "fs";
import { PDFParse } from "pdf-parse";

export async function extractTextFromPDF(filePath) {
    const buffer = fs.readFileSync(filePath);

    const parser = new PDFParse({
        data: buffer
    });

    try {
        const result = await parser.getText({
            itemJoiner: " "
        });

        return {
            totalPages: result.total,

            pages: result.pages.map((page, index) => ({
                pageNumber: page.num ?? index + 1,
                text: page.text
            }))
        };
    } finally {
        await parser.destroy();
    }
}