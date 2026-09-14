export function mapTableRow(schema, cells) {
    const cleanCells =
        cells.map(cell =>
            String(cell ?? "").trim()
        );

    let label = null;

    const values = {};

    /*
     * When data rows contain one more cell than
     * the header, the additional cell may represent
     * an additional label/sub-label.
     *
     * Example:
     *
     * Header:
     * Accounting item | 2011
     *
     * Data:
     * Income | General income | 200,000
     *
     * We want:
     *
     * label = "Income — General income"
     * 2011 = "200,000"
     */

    if (schema.rowLabelIsImplicit) {
        const valueCellIndexes =
            new Set(
                schema.valueColumns.map(
                    column => column.cellIndex
                )
            );

        const labelCells =
            cleanCells.filter(
                (_, index) =>
                    !valueCellIndexes.has(index)
            );

        label =
            labelCells
                .filter(Boolean)
                .join(" — ");
    } else {
        label =
            cleanCells[
                schema.rowLabelColumn
            ] ?? null;
    }

    for (
        const column of schema.valueColumns
    ) {
        const value =
            cleanCells[
                column.cellIndex
            ] ?? null;

        if (!column.header) {
            continue;
        }

        values[column.header] = value;
    }

    return {
        label,
        values
    };
}