function countTabs(line) {
    return (line.rawText.match(/\t/g) || []).length;
}

function countNumericTokens(text) {
    const tokens = text.split(/\s+/);

    return tokens.filter(token =>
        /^[-+]?[\d,.]+%?$/.test(token)
    ).length;
}

function getEvidence(line) {
    const tabCount = countTabs(line);
    const numericTokenCount = countNumericTokens(line.text);

    return {
        hasTabs: tabCount > 0,
        tabCount,
        hasNumbers: numericTokenCount > 0,
        numericTokenCount,
        isYear: line.features.looksLikeYear
    };
}

export function createTableState() {
    return {
        lineCount: 0,

        structuredLines: 0,

        tabbedLines: 0,

        numericLines: 0,

        yearLines: 0,

        weakLines: 0,

        /*
         * Once we have enough evidence that this is
         * actually a table, weak lines are allowed.
         */
        tableEvidence: 0
    };
}

export function updateTableState(state, line) {
    const evidence = getEvidence(line);

    state.lineCount++;

    if (evidence.hasTabs) {
        state.tabbedLines++;
        state.structuredLines++;

        state.tableEvidence += 2;
    }

    if (evidence.hasNumbers) {
        state.numericLines++;
        state.structuredLines++;

        state.tableEvidence += 1;
    }

    if (evidence.isYear) {
        state.yearLines++;

        state.tableEvidence += 2;
    }

    if (
        !evidence.hasTabs &&
        !evidence.hasNumbers &&
        !evidence.isYear
    ) {
        state.weakLines++;
    } else {
        state.weakLines = 0;
    }

    return state;
}

export function isLikelyTableContinuation(state, line) {
    const evidence = getEvidence(line);

    /*
     * Strong table evidence.
     */
    if (evidence.hasTabs) {
        return true;
    }

    if (evidence.hasNumbers) {
        return true;
    }

    if (evidence.isYear) {
        return true;
    }

    /*
     * Once the table has accumulated enough evidence,
     * allow a few weak lines.
     *
     * Example:
     *
     * Table 6
     * Rainfall
     * (inches)
     * Americas    Asia    Europe    Africa
     *
     * "Rainfall" and "(inches)" are weak individually,
     * but they occur inside a table that has structured
     * evidence around them.
     */
    if (
        state.tableEvidence >= 2 &&
        state.weakLines < 3
    ) {
        return true;
    }

    return false;
}