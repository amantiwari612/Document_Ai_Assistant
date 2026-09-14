export function parseTableCaption(lines) {
    if (!lines || lines.length === 0) {
        return {
            tableNumber: null,
            title: null,
            captionLineCount: 0
        };
    }

    const firstLine = lines[0].text.trim();

    const match = firstLine.match(
        /^Table[ \t]+(\d+)(?:[ \t]*:)?(?:[ \t]+(.*))?$/i
    );

    if (!match) {
        return {
            tableNumber: null,
            title: null,
            captionLineCount: 0
        };
    }

    const tableNumber = Number(match[1]);

    const titleParts = [];

    if (match[2]?.trim()) {
        titleParts.push(match[2].trim());
    }

    let captionLineCount = 1;

    // Look for continuation lines.
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        // A line containing tabs is much more likely
        // to be table data rather than caption text.
        if (line.features?.hasTabs) {
            break;
        }

        // Numeric-heavy lines are also likely table data.
        if (line.features?.looksLikeYear) {
            break;
        }

        titleParts.push(line.text.trim());
        captionLineCount++;
    }

    return {
        tableNumber,
        title: titleParts.join(" ").trim() || null,
        captionLineCount
    };
}