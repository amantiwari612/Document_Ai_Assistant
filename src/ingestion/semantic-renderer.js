function cleanText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim();
}

function renderRow(row) {
    const label =
        cleanText(row.label);

    if (!label) {
        return "";
    }

    const context = [];

    if (row.section) {
        context.push(
            cleanText(row.section)
        );
    }

    if (row.group) {
        context.push(
            cleanText(row.group)
        );
    }

    context.push(label);

    const rowName =
        context.join(" — ");

    const values = [];

    for (const [header, value] of
        Object.entries(row.values ?? {})) {

        const cleanHeader =
            cleanText(header);

        const cleanValue =
            cleanText(value);

        if (!cleanHeader || !cleanValue) {
            continue;
        }

        values.push(
            `${cleanHeader} = ${cleanValue}`
        );
    }

    if (values.length === 0) {
        return "";
    }

    return `${rowName}: ${values.join("; ")}.`;
}

export function renderTableSemantically(table) {
    const parts = [];

    const tableNumber =
        table.tableNumber ?? null;

    const title =
        cleanText(table.title);

    // Table identity
    if (
        tableNumber !== null &&
        title
    ) {
        parts.push(
            `Table ${tableNumber} — ${title}.`
        );
    } else if (
        tableNumber !== null
    ) {
        parts.push(
            `Table ${tableNumber}.`
        );
    } else if (title) {
        parts.push(`${title}.`);
    }

    // Column information
    const headers =
        (table.headers ?? [])
            .map(cleanText)
            .filter(Boolean);

    if (headers.length > 0) {
        parts.push(
            `Columns: ${headers.join(" | ")}`
        );
    }

    // Data rows
    for (const row of table.rows ?? []) {
        const rendered =
            renderRow(row);

        if (rendered) {
            parts.push(rendered);
        }
    }

    return parts.join("\n\n");
}