import { scoreTableCandidate } from "./table-scorer.js";
import { parseTableCaption } from "./table-caption.js";

export function validateBlocks(blocks) {
    return blocks.map(block => {
        if (block.type !== "table_candidate") {
            return {
                ...block,
                type: block.type
            };
        }

        const result = scoreTableCandidate(block);

        const tableInfo = parseTableCaption(
            block.lines
        );

        let type;

        if (result.score >= 0.7) {
            type = "table";
        } else if (result.score >= 0.4) {
            type = "table_candidate";
        } else {
            type = "text";
        }

        return {
            ...block,
            type,
            tableNumber: tableInfo.tableNumber,
            title: tableInfo.title,
            captionLineCount: tableInfo.captionLineCount,
            tableScore: result.score,
            tableSignals: result.signals
        };
    });
}