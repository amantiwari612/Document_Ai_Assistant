function countTabs(rawText) {
    return (rawText.match(/\t/g) || []).length;
}

function countNumericTokens(text) {
    const tokens = text.split(/\s+/);

    return tokens.filter(token =>
        /^[-+]?[\d,.]+%?$/.test(token)
    ).length;
}

function getColumnCounts(lines) {
    return lines
        .map(line => countTabs(line.rawText) + 1)
        .filter(count => count > 1);
}

export function scoreTableCandidate(block) {
    const lines = block.lines;

    if (lines.length === 0) {
        return {
            score: 0,
            signals: {}
        };
    }

    const caption = lines[0];

    const dataLines = lines.slice(1);

    const tabbedLines = dataLines.filter(
        line => line.features.hasTabs
    );

    const columnCounts = getColumnCounts(dataLines);

    const numericTokenCount = dataLines.reduce(
        (total, line) =>
            total + countNumericTokens(line.text),
        0
    );

    const signals = {
        hasCaption:
            caption.features.looksLikeTableCaption,

        lineCount: lines.length,

        tabbedLines: tabbedLines.length,

        tabbedLineRatio:
            dataLines.length > 0
                ? tabbedLines.length / dataLines.length
                : 0,

        numericTokenCount,

        averageColumns:
            columnCounts.length > 0
                ? columnCounts.reduce(
                    (sum, value) => sum + value,
                    0
                ) / columnCounts.length
                : 1
    };

    let score = 0;

    /*
     * Explicit table caption is strong evidence.
     */
    if (signals.hasCaption) {
        score += 0.4;
    }

    /*
     * Repeated tabular structure.
     */
    if (signals.tabbedLineRatio >= 0.5) {
        score += 0.3;
    } else if (signals.tabbedLineRatio >= 0.25) {
        score += 0.15;
    }

    /*
     * Multiple columns.
     */
    if (signals.averageColumns >= 2) {
        score += 0.15;
    }

    /*
     * Numeric data is common in tables.
     */
    if (signals.numericTokenCount >= 3) {
        score += 0.15;
    }

    score = Math.min(score, 1);

    return {
        score,
        signals
    };
}