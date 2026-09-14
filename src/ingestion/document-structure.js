export function buildDocumentStructure(pages) {
    return {
        type: "document",

        pages: pages.map(page => ({
            pageNumber: page.pageNumber,
            blocks: page.blocks ?? []
        }))
    };
}