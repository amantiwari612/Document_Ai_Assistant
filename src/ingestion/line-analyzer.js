export function analyzePageLines(page) {
    const lines = page.text
        .split(/\r?\n/)
        .map((text, index) => ({
            lineNumber: index + 1,
            text: text.trim(),
            rawText: text
        }))
        .filter(line => line.text.length > 0);

    return {
        pageNumber: page.pageNumber,
        lines
    };
}