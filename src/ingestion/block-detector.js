import { classifyLine } from "./line-classifier.js";

import {
    createTableState,
    updateTableState,
    isLikelyTableContinuation
} from "./table/table-state.js";

export function detectBlocks(page) {
    const lines = page.lines.map(classifyLine);

    const blocks = [];

    let currentBlock = null;
    let tableState = null;

    function flushBlock() {
        if (!currentBlock) {
            return;
        }

        if (currentBlock.lines.length > 0) {
            blocks.push({
                type: currentBlock.type,
                pageNumber: page.pageNumber,
                lines: currentBlock.lines
            });
        }

        currentBlock = null;
        tableState = null;
    }

    function startBlock(type, line) {
        flushBlock();

        currentBlock = {
            type,
            lines: [line]
        };

        if (type === "table_candidate") {
            tableState = createTableState();

            updateTableState(
                tableState,
                line
            );
        }
    }

    for (const line of lines) {

        /*
         * TABLE CAPTION
         *
         * A caption always starts a new candidate.
         */
        if (line.features.looksLikeTableCaption) {
            startBlock(
                "table_candidate",
                line
            );

            continue;
        }

        /*
         * CURRENT TABLE
         */
        if (currentBlock?.type === "table_candidate") {

    const continues = isLikelyTableContinuation(
        tableState,
        line
    );

    if (continues) {
        currentBlock.lines.push(line);

        updateTableState(
            tableState,
            line
        );

        continue;
    }

    /*
     * If the candidate is still very young and hasn't
     * accumulated enough evidence, allow a few lines
     * before deciding that it wasn't a table.
     */
    if (
        tableState.lineCount <= 3 &&
        tableState.tableEvidence < 2
    ) {
        currentBlock.lines.push(line);

        updateTableState(
            tableState,
            line
        );

        continue;
    }

    /*
     * Otherwise the table has probably ended.
     */
    flushBlock();

    startBlock(
        "text",
        line
    );

    continue;
}

        /*
         * LIST
         */
        if (
            line.features.looksLikeBullet ||
            line.features.looksLikeNumberedItem
        ) {
            if (currentBlock?.type !== "list") {
                startBlock(
                    "list",
                    line
                );
            } else {
                currentBlock.lines.push(line);
            }

            continue;
        }

        /*
         * TABULAR CONTENT WITHOUT CAPTION
         */
        if (line.features.hasTabs) {

            if (
                currentBlock?.type !==
                "tabular_candidate"
            ) {
                startBlock(
                    "tabular_candidate",
                    line
                );
            } else {
                currentBlock.lines.push(line);
            }

            continue;
        }

        /*
         * NORMAL TEXT
         */
        if (currentBlock?.type !== "text") {
            startBlock(
                "text",
                line
            );
        } else {
            currentBlock.lines.push(line);
        }
    }

    flushBlock();

    return blocks;
}