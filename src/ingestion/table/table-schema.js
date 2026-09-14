function isYear(value) {
    return /^(19|20)\d{2}$/.test(value.trim());
}

function isNumeric(value) {
    return /^[-+]?\(?[\d,.]+\)?%?$/.test(
        value.trim()
    );
}

function clean(value) {
    return String(value ?? "").trim();
}

export function inferTableSchema(lines) {
    if (!lines?.length) {
        return {
            columnCount: 0,
            headers: [],
            rowLabelColumn: null,
            rowLabelIsImplicit: false,
            valueColumns: []
        };
    }

    const headerIndex =
        lines.findIndex(
            line => line.role === "header"
        );

    if (headerIndex === -1) {
        return {
            columnCount: 0,
            headers: [],
            rowLabelColumn: null,
            rowLabelIsImplicit: false,
            valueColumns: []
        };
    }

    const headerLine =
        lines[headerIndex];

    const headers =
        headerLine.cells.map(clean);

    const columnCount =
        headers.length;

    /*
     * Inspect actual data rows.
     *
     * We use multiple rows rather than relying
     * only on the header text.
     */
    const dataLines =
        lines
            .slice(headerIndex + 1)
            .filter(
                line =>
                    line.role === "data"
            );

    const dataColumnCounts =
        dataLines.map(
            line =>
                line.cells?.length ?? 0
        );

    /*
     * If data rows consistently contain one
     * more cell than the header, the first
     * data cell is likely an implicit row label.
     *
     * Example:
     *
     * Header:
     * South America | Asia | Africa | Australia
     *
     * Data:
     * Highest average | 523.6 | 467.4 | 405.0 | 340.5
     */
    const hasExtraDataColumn =
        dataColumnCounts.length > 0 &&
        dataColumnCounts.filter(
            count =>
                count === columnCount + 1
        ).length >=
            Math.ceil(dataColumnCounts.length / 2);

    if (hasExtraDataColumn) {
        const valueColumns = [];

        for (
            let headerIndex = 0;
            headerIndex < headers.length;
            headerIndex++
        ) {
            valueColumns.push({
                headerIndex,
                cellIndex: headerIndex + 1,
                header: headers[headerIndex]
            });
        }

        return {
            columnCount,
            headerIndex,
            headers,
            rowLabelColumn: null,
            rowLabelIsImplicit: true,
            valueColumns
        };
    }

    /*
     * Normal case:
     *
     * Header:
     * Property | 2010 | 2009 | 2008
     *
     * Data:
     * Property | 345  | 445  | 222
     *
     * The first non-numeric/non-year header
     * is treated as the explicit row-label column.
     */
    const headerColumns =
        headers.map(
            (header, index) => ({
                index,
                header,
                year: isYear(header),
                numeric: isNumeric(header)
            })
        );

    const explicitRowLabel =
        headerColumns.find(
            column =>
                !column.year &&
                !column.numeric
        );

    let rowLabelColumn = null;

    if (explicitRowLabel) {
        rowLabelColumn =
            explicitRowLabel.index;
    }

    const valueColumns = [];

    for (
        let headerIndex = 0;
        headerIndex < headers.length;
        headerIndex++
    ) {
        if (
            headerIndex ===
            rowLabelColumn
        ) {
            continue;
        }

        valueColumns.push({
            headerIndex,
            cellIndex: headerIndex,
            header: headers[headerIndex]
        });
    }

    return {
        columnCount,
        headerIndex,
        headers,
        rowLabelColumn,
        rowLabelIsImplicit: false,
        valueColumns
    };
}