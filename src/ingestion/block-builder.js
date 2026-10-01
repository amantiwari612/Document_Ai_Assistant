export function buildPageBlocks(blocks) {
    return blocks.map(block => {
        switch (block.type) {

            case "table": {
                // 1. Deduplicate consecutive identical lines (e.g., repeated "Table 1" captions)
                const cleanLines = [];
                for (const line of block.lines || []) {
                    const rawText = line.text?.trim() || "";
                    if (rawText && cleanLines[cleanLines.length - 1] !== rawText) {
                        cleanLines.push(rawText);
                    }
                }

                // 2. Build structured table text representation
                const content = cleanLines.join("\n");

                return {
                    type: "table",
                    blockType: "table",
                    pageNumber: block.pageNumber,
                    tableNumber: block.tableNumber ?? null,
                    title: block.title ?? null,
                    captionLineCount: block.captionLineCount ?? 0,
                    content, // Cleaned string content for chunking & vectorizing
                    lines: block.lines ?? []
                };
            }

            case "list": {
                const items = (block.lines || []).map(line => line.text?.trim() || "").filter(Boolean);
                const content = items.map(item => `- ${item}`).join("\n");

                return {
                    type: "list",
                    blockType: "list",
                    pageNumber: block.pageNumber,
                    items,
                    content
                };
            }

            case "text": {
                const content = (block.lines || [])
                    .map(line => line.text?.trim() || "")
                    .filter(Boolean)
                    .join("\n");

                return {
                    type: "text",
                    blockType: "text",
                    pageNumber: block.pageNumber,
                    content,
                    text: content
                };
            }

            default: {
                const content = (block.lines || [])
                    .map(line => line.text?.trim() || "")
                    .filter(Boolean)
                    .join("\n");

                return {
                    type: "unknown",
                    blockType: "unknown",
                    pageNumber: block.pageNumber,
                    content,
                    lines: block.lines ?? []
                };
            }
        }
    });
}