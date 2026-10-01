import { scoreTableCandidate } from "./table-scorer.js";
import { parseTableCaption } from "./table-caption.js";

/**
 * Validates candidate table blocks, converts failed blocks back to standard text,
 * and attaches table metadata and table numbers.
 *
 * @param {Array} blocks Array of detected page blocks
 * @returns {Array} Validated blocks with updated block types and metadata
 */
export function validateBlocks(blocks) {
    let fallbackTableCounter = 1;

    return blocks.map((block) => {
        // 1. Pass through non-table candidates unchanged
        if (block.type !== "table_candidate") {
            return {
                ...block,
                blockType: block.type
            };
        }

        // 2. Score candidate lines and attempt caption parsing
        const result = scoreTableCandidate(block);
        const tableInfo = parseTableCaption(block.lines);

        let type;

        if (result.score >= 0.7) {
            type = "table";
        } else if (result.score >= 0.4) {
            type = "table_candidate"; // Keep as candidate for further context checks
        } else {
            type = "text"; // Revert weak candidates to standard text
        }

        // 3. If candidate failed validation, return clean text block without table attributes
        if (type === "text") {
            return {
                ...block,
                type: "text",
                blockType: "text"
            };
        }

        // 4. Determine final table number (Use parsed caption number OR assign fallback sequence)
        let finalTableNumber = tableInfo.tableNumber;

        if (type === "table" && !finalTableNumber) {
            finalTableNumber = fallbackTableCounter;
            fallbackTableCounter++;
        } else if (type === "table" && typeof finalTableNumber === "number") {
            // Synchronize counter to prevent index collisions
            fallbackTableCounter = Math.max(fallbackTableCounter, finalTableNumber + 1);
        }

        // 5. Return validated table block with enriched table identifiers
        return {
            ...block,
            type,
            blockType: type,
            tableNumber: finalTableNumber ?? null,
            title: tableInfo.title ?? null,
            captionLineCount: tableInfo.captionLineCount ?? 0,
            tableScore: result.score,
            tableSignals: result.signals ?? []
        };
    });
}