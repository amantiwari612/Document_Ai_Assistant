import { analyzeTableLine } from "./table-line-analyzer.js";
import { classifyTableRow } from "./table-row-classifier.js";
import { buildTableStructure } from "./table-structure.js";



export function parseTable(block) {
    if (block.type !== "table") {
        return null;
    }

    const captionLineCount =
        block.captionLineCount ?? 1;

    const dataLines =
        block.lines.slice(captionLineCount);

    const analyzedLines =
        dataLines.map(analyzeTableLine);

    const classifiedLines = [];

    for (let i = 0; i < analyzedLines.length; i++) {
        const currentLine =
            analyzedLines[i];

        const previousLine =
            classifiedLines[i - 1] ?? null;

        classifiedLines.push(
            classifyTableRow(
                currentLine,
                previousLine
            )
        );
    }

    const parsedTable = {
        tableNumber: block.tableNumber,
        title: block.title,
        pageNumber: block.pageNumber,
        lines: classifiedLines
    };

    return buildTableStructure(parsedTable);
}