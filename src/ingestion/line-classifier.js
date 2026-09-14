export function classifyLine(line) {
    const text = line.text.trim();

    const hasTabs = line.rawText.includes("\t");

    const tabCount = (line.rawText.match(/\t/g) || []).length;

    const looksLikeTableCaption =
        /^Table[ \t]+\d+(?:[ \t]*:)?(?:[ \t]+.*)?$/i.test(text);

    const looksLikeBullet =
        /^[-•*▪◦]\s+/.test(text);

    const looksLikeNumberedItem =
        /^\d+[.)]\s+/.test(text);

    const looksLikeFootnote =
        /^\(\d+\)\s+/.test(text);

    const looksLikeYear =
        /^(19|20)\d{2}$/.test(text);

    return {
        ...line,

        features: {
            hasTabs,
            tabCount,
            looksLikeTableCaption,
            looksLikeBullet,
            looksLikeNumberedItem,
            looksLikeFootnote,
            looksLikeYear
        }
    };
}