function isYearValue(value) {
    return /^(19|20)\d{2}$/.test(value.trim());
}

function isNumericValue(value) {
    return /^[-+]?\(?[\d,.]+\)?%?$/.test(
        value.trim()
    );
}

function getYearCount(cells) {
    return cells.filter(isYearValue).length;
}

function getNumericCount(cells) {
    return cells.filter(isNumericValue).length;
}

function getTextCount(cells) {
    return cells.filter(
        cell =>
            cell.trim().length > 0 &&
            !isNumericValue(cell) &&
            !isYearValue(cell)
    ).length;
}

export function classifyTableRow(
    line,
    previousLine = null
) {
    const cells = line.cells ?? [];

    const columnCount = cells.length;

    const yearCount = getYearCount(cells);
    const numericCount = getNumericCount(cells);
    const textCount = getTextCount(cells);

    /*
     * --------------------------------------------------
     * 1. Multiple year values
     *
     * Example:
     *
     * 2006 | 2007 | 2008 | 2009
     * --------------------------------------------------
     */

    if (yearCount >= 2) {
        return {
            ...line,
            role: "group_header",
            reason: "multiple_year_columns"
        };
    }

    /*
     * --------------------------------------------------
     * 2. Header row
     *
     * Example:
     *
     * Name | Entered | Completed | Entered | Completed
     *
     * or:
     *
     * Accounting item | 2011
     * --------------------------------------------------
     */

    if (
        textCount >= 2 &&
        numericCount === 0
    ) {
        return {
            ...line,
            role: "header",
            reason: "multiple_text_columns"
        };
    }

    /*
     * Header containing one textual label
     * and one or more years.
     *
     * Example:
     *
     * Accounting item | 2011
     */

    if (
        textCount >= 1 &&
        yearCount >= 1 &&
        numericCount === yearCount
    ) {
        return {
            ...line,
            role: "header",
            reason: "text_with_year"
        };
    }

    /*
     * --------------------------------------------------
     * 3. Data row
     *
     * Any row containing actual numeric values
     * after the header has been established.
     * --------------------------------------------------
     */

    if (
        numericCount >= 1 &&
        columnCount >= 2
    ) {
        return {
            ...line,
            role: "data",
            reason: "numeric_values"
        };
    }

    /*
     * --------------------------------------------------
     * 4. Textual data
     *
     * Useful for tables such as:
     *
     * Economics | A, B | A, C | A, C
     * --------------------------------------------------
     */

    if (
        columnCount >= 2 &&
        textCount >= 2
    ) {
        return {
            ...line,
            role: "data",
            reason: "textual_values"
        };
    }

    /*
     * --------------------------------------------------
     * 5. Single textual cell
     * --------------------------------------------------
     */

    if (
        columnCount === 1 &&
        textCount === 1
    ) {
        return {
            ...line,
            role: "section",
            reason: "single_text_cell"
        };
    }

    return {
        ...line,
        role: "unknown",
        reason: "no_strong_signal"
    };
}