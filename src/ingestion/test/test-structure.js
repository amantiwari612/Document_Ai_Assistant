import { mapTableRow } from "../table/table-row-maper.js";

export function buildTableStructure(table) {
    const lines = table.lines ?? [];

    const headerLines = lines.filter(
        line => line.role === "header"
    );

    const headers =
        headerLines[0]?.cells?.map(
            cell => cell.trim()
        ) ?? [];

    const rows = [];

    let currentSection = null;
    let currentGroup = null;

    for (const line of lines) {

        // Header rows describe columns.
        if (line.role === "header") {
            continue;
        }

        // Section changes the context for following rows.
        if (line.role === "section") {
            currentSection =
                line.cells?.[0]?.trim() ?? null;

            continue;
        }

        // Group changes the context for following rows.
        if (line.role === "group_header") {
            currentGroup =
                line.cells?.[0]?.trim() ?? null;

            continue;
        }

        // Actual data row.
        if (line.role === "data") {
            const mapped =
                mapTableRow(
                    headers,
                    line.cells
                );

            rows.push({
                section: currentSection,
                group: currentGroup,
                label: mapped.label,
                values: mapped.values
            });

            continue;
        }
    }

    return {
        tableNumber: table.tableNumber,
        pageNumber: table.pageNumber,
        title: table.title,

        headers,

        headerRows:
            headerLines.map(
                line => line.cells
            ),

        rows
    };
}