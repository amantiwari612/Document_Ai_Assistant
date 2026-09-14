export function buildPageBlocks(blocks) {
    return blocks.map(block => {

        switch (block.type) {

            case "table":
                return {
                    type: "table",
                    pageNumber: block.pageNumber,

                    tableNumber:
                        block.tableNumber ?? null,

                    title:
                        block.title ?? null,

                    // Preserve the raw table structure.
                    // The chunker will decide how to represent it.
                    lines:
                        block.lines ?? []
                };


            case "list":
                return {
                    type: "list",
                    pageNumber: block.pageNumber,

                    items:
                        block.lines.map(
                            line => line.text
                        )
                };


            case "text":
                return {
                    type: "text",
                    pageNumber: block.pageNumber,

                    text:
                        block.lines
                            .map(line => line.text)
                            .join("\n")
                };


            default:
                return {
                    type: "unknown",
                    pageNumber: block.pageNumber,
                    lines: block.lines ?? []
                };
        }
    });
}