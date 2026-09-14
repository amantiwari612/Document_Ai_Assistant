const DEFAULT_CHUNK_SIZE = 300;
const DEFAULT_OVERLAP = 50;


function chunkText(
    text,
    chunkSize,
    overlap
) {
    const words = text
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) {
        return [];
    }

    const chunks = [];

    let start = 0;

    while (start < words.length) {
        const end =
            Math.min(
                start + chunkSize,
                words.length
            );

        chunks.push(
            words
                .slice(start, end)
                .join(" ")
        );

        if (end === words.length) {
            break;
        }

        start += chunkSize - overlap;
    }

    return chunks;
}


/*
 * Convert a table block into text
 * without trying to understand its schema.
 *
 * We simply preserve the cells that
 * the table parser already detected.
 */
function tableToText(block) {
    const lines = block.lines ?? [];

    const parts = [];

    if (block.tableNumber !== null &&
        block.tableNumber !== undefined) {

        parts.push(
            `Table ${block.tableNumber}`
        );
    }

    if (block.title?.trim()) {
        parts.push(
            block.title.trim()
        );
    }

    for (const line of lines) {
        const cells = line.cells ?? [];

        if (cells.length === 0) {
            if (line.text?.trim()) {
                parts.push(line.text.trim());
            }

            continue;
        }

        parts.push(
            cells
                .map(cell => String(cell).trim())
                .filter(Boolean)
                .join(" | ")
        );
    }

    return parts.join("\n");
}


/*
 * Chunk a table by rows.
 *
 * We don't interpret:
 * - headers
 * - sections
 * - groups
 * - numeric columns
 *
 * We simply preserve the extracted table structure.
 */
function chunkTable(
    block,
    chunkSize,
    overlap
) {
    const lines = block.lines ?? [];

    if (lines.length === 0) {
        const text = tableToText(block);

        return chunkText(
            text,
            chunkSize,
            overlap
        );
    }

    const prefix = [];

    if (block.tableNumber !== null &&
        block.tableNumber !== undefined) {

        prefix.push(
            `Table ${block.tableNumber}`
        );
    }

    if (block.title?.trim()) {
        prefix.push(
            block.title.trim()
        );
    }

    const chunks = [];

    let currentRows = [];

    function buildContent(rows) {
        return [
            ...prefix,
            ...rows
        ].join("\n");
    }

    function rowToText(line) {
        const cells = line.cells ?? [];

        if (cells.length > 0) {
            return cells
                .map(cell => String(cell).trim())
                .filter(Boolean)
                .join(" | ");
        }

        return line.text?.trim() ?? "";
    }

    function rowWordCount(row) {
        return row
            .split(/\s+/)
            .filter(Boolean)
            .length;
    }

    let currentWordCount = prefix
        .join(" ")
        .split(/\s+/)
        .filter(Boolean)
        .length;

    for (const line of lines) {
        const row = rowToText(line);

        if (!row) {
            continue;
        }

        const rowWords = rowWordCount(row);

        /*
         * If one row itself is larger than
         * the chunk size, split that row
         * using the normal text chunker.
         */
        if (rowWords > chunkSize) {
            if (currentRows.length > 0) {
                chunks.push(
                    buildContent(currentRows)
                );

                currentRows = [];
                currentWordCount =
                    prefix
                        .join(" ")
                        .split(/\s+/)
                        .filter(Boolean)
                        .length;
            }

            const rowChunks = chunkText(
                row,
                chunkSize,
                overlap
            );

            for (const rowChunk of rowChunks) {
                chunks.push(
                    buildContent([rowChunk])
                );
            }

            continue;
        }

        /*
         * Add the row if it fits.
         */
        if (
            currentWordCount + rowWords <=
            chunkSize
        ) {
            currentRows.push(row);
            currentWordCount += rowWords;
            continue;
        }

        /*
         * Current chunk is full.
         */
        if (currentRows.length > 0) {
            chunks.push(
                buildContent(currentRows)
            );
        }

        /*
         * Start the next chunk with this row.
         *
         * We intentionally don't create a complicated
         * row-level overlap. The table identity/title
         * remains present in every chunk.
         */
        currentRows = [row];

        currentWordCount =
            prefix
                .join(" ")
                .split(/\s+/)
                .filter(Boolean)
                .length +
            rowWords;
    }

    if (currentRows.length > 0) {
        chunks.push(
            buildContent(currentRows)
        );
    }

    return chunks;
}


/*
 * Lists are treated as text, but each item
 * remains on its own line.
 */
function listToText(block) {
    return (block.items ?? [])
        .map(item => String(item).trim())
        .filter(Boolean)
        .join("\n");
}


export function chunkDocument(
    document,
    chunkSize = DEFAULT_CHUNK_SIZE,
    overlap = DEFAULT_OVERLAP
) {
    if (overlap >= chunkSize) {
        throw new Error(
            "Overlap must be smaller than chunk size."
        );
    }

    if (chunkSize <= 0) {
        throw new Error(
            "Chunk size must be greater than 0."
        );
    }

    if (overlap < 0) {
        throw new Error(
            "Overlap cannot be negative."
        );
    }

    const chunks = [];

    let chunkIndex = 0;


    for (const page of document.pages) {

        for (const block of page.blocks) {

            /*
             * ========================================
             * TEXT
             * ========================================
             */

            if (block.type === "text") {

                if (!block.text?.trim()) {
                    continue;
                }

                const textChunks =
                    chunkText(
                        block.text,
                        chunkSize,
                        overlap
                    );

                for (const content of textChunks) {

                    chunks.push({
                        chunkIndex,
                        pageNumber:
                            page.pageNumber,
                        blockType: "text",
                        tableNumber: null,
                        content
                    });

                    chunkIndex++;
                }

                continue;
            }


            /*
             * ========================================
             * TABLE
             * ========================================
             */

            if (block.type === "table") {

                const tableChunks =
                    chunkTable(
                        block,
                        chunkSize,
                        overlap
                    );

                for (const content of tableChunks) {

                    chunks.push({
                        chunkIndex,
                        pageNumber:
                            page.pageNumber,
                        blockType: "table",
                        tableNumber:
                            block.tableNumber ?? null,
                        content
                    });

                    chunkIndex++;
                }

                continue;
            }


            /*
             * ========================================
             * LIST
             * ========================================
             */

            if (block.type === "list") {

                const listText =
                    listToText(block);

                if (!listText) {
                    continue;
                }

                const listChunks =
                    chunkText(
                        listText,
                        chunkSize,
                        overlap
                    );

                for (const content of listChunks) {

                    chunks.push({
                        chunkIndex,
                        pageNumber:
                            page.pageNumber,
                        blockType: "list",
                        tableNumber: null,
                        content
                    });

                    chunkIndex++;
                }

                continue;
            }
        }
    }

    return chunks;
} 