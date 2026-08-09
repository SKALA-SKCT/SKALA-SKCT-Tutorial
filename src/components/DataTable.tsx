import type { DataTable } from "../types";

/** Renders a 자료해석 data table (with optional caption + unit note). */
export default function DataTableView({ table }: { table: DataTable }) {
  return (
    <figure className="data-table">
      {table.title && <figcaption className="data-table-title">{table.title}</figcaption>}
      {table.unit && <div className="data-table-unit">({table.unit})</div>}
      <div className="data-table-scroll">
        <table>
          <thead>
            <tr>
              {table.columns.map((col, i) => (
                <th key={i} scope="col">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) =>
                  c === 0 ? (
                    <th key={c} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={c}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
