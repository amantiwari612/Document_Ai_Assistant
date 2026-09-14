
import { mapTableRow } from "./table-row-maper.js";
import { inferTableSchema } from "./table-schema.js";



export function buildTableStructure(table) {

    const lines =
        table.lines ?? [];

    const schema =
        inferTableSchema(lines);

    const headerLines =
        lines.filter(
            line => line.role === "header"
        );

    const rows = [];

    let currentSection = null;
    let currentGroup = null;

    for (const line of lines) {

        if (line.role === "header") {
            continue;
        }

        if (line.role === "section") {

            currentSection =
                line.cells?.[0]?.trim() ?? null;

            continue;
        }

        if (line.role === "group_header") {

            currentGroup =
                line.cells?.[0]?.trim() ?? null;

            continue;
        }

        if (line.role === "data") {

            const mapped =
                mapTableRow(
                    schema,
                    line.cells
                );

            rows.push({
                section: currentSection,
                group: currentGroup,

                label: mapped.label,

                values: mapped.values
            });
        }
    }

    return {
        tableNumber: table.tableNumber,
        pageNumber: table.pageNumber,
        title: table.title,

        headers: schema.headers,

        schema,

        headerRows:
            headerLines.map(
                line => line.cells
            ),

        rows
    };
}