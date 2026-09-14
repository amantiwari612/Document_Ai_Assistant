function countTabs(rawText) {
    return (rawText.match(/\t/g) || []).length;
}

function countNumericTokens(text) {
    const tokens = text.split(/\s+/);

    return tokens.filter(token =>
        /^[-+]?[\d,.]+%?$/.test(token)
    ).length;
}

function splitCells(rawText) {
    return rawText
        .split(/\t+/)
        .map(cell => cell.trim())
        .filter(Boolean);
}

export function analyzeTableLine(line) {
    const cells = splitCells(line.rawText);

    const numericTokenCount =
        countNumericTokens(line.text);

    return {
        lineNumber: line.lineNumber,
        text: line.text,
        rawText: line.rawText,

        cells,

        columnCount: cells.length,

        hasTabs:
            countTabs(line.rawText) > 0,

        numericTokenCount,

        isNumericHeavy:
            numericTokenCount >= 2,

        isYear:
            line.features?.looksLikeYear ?? false
    };
}