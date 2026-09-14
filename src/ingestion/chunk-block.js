export function chunkBlocks(blocks) {
    const chunks = [];

    for (const block of blocks) {
        chunks.push({
            type: block.type,
            pageNumber: block.pageNumber,
            tableNumber: block.tableNumber ?? null,
            chunkIndex: 0,
            text: block.text
        });
    }

    return chunks;
}