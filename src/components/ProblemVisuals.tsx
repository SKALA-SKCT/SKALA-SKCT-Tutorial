import type { ProblemVisual } from "../types";

interface Props {
  visuals: ProblemVisual[];
  activeIds: string[];
  dimmed: boolean;
}

function SequenceValue({ value }: { value: string }) {
  const fraction = value.match(/^(-?\d+)\/(\d+)$/);
  if (!fraction) return value;
  return (
    <span className="sequence-fraction" aria-label={`${fraction[2]}분의 ${fraction[1]}`}>
      <b>{fraction[1]}</b>
      <b>{fraction[2]}</b>
    </span>
  );
}

export default function ProblemVisuals({ visuals, activeIds, dimmed }: Props) {
  return (
    <div className={`problem-visuals${dimmed ? " dimmed" : ""}`}>
      {visuals.map((visual) => {
        if (visual.type === "sequence") {
          return (
            <figure className="problem-sequence-wrap" key={visual.id}>
              <figcaption>{visual.title}</figcaption>
              <div className="problem-sequence" role="img" aria-label={visual.title}>
                {visual.items.map((item) => (
                  <span
                    className={activeIds.includes(item.id) ? "active" : ""}
                    data-visual={item.id}
                    key={item.id}
                  >
                    <SequenceValue value={item.value} />
                  </span>
                ))}
              </div>
            </figure>
          );
        }

        if (visual.type === "table") {
          return (
            <figure className="problem-table-wrap" key={visual.id}>
              <figcaption>
                <strong>{visual.title}</strong>
                {visual.unit && <span>단위는 {visual.unit}</span>}
              </figcaption>
              <table className="problem-table">
                <thead>
                  <tr>
                    {/* 본문 각 행은 항목 이름 칸으로 시작한다. 머리글에도 그 칸을 두어야 연도와 값이 어긋나지 않는다. */}
                    <th scope="col">구분</th>
                    {visual.columns.map((column) => (
                      <th key={column} scope="col">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visual.rows.map((row) => {
                    const rowActive = activeIds.includes(row.id);
                    return (
                      <tr className={rowActive ? "active" : ""} key={row.id} data-visual={row.id}>
                        <th>{row.label}</th>
                        {row.cells.map((cell, index) => {
                          const cellId = `${row.id}-${index + 1}`;
                          return (
                            <td
                              className={activeIds.includes(cellId) ? "active" : ""}
                              data-visual={cellId}
                              key={cellId}
                            >
                              {cell}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {visual.note && <p className="problem-visual-note">{visual.note}</p>}
            </figure>
          );
        }

        const maxValue = Math.max(...visual.series.flatMap((series) => series.values));
        return (
          <figure className="problem-chart-wrap" key={visual.id}>
            <figcaption>
              <strong>{visual.title}</strong>
              {visual.unit && <span>단위는 {visual.unit}</span>}
            </figcaption>
            <div className="problem-bar-chart" role="img" aria-label={visual.title}>
              {visual.categories.map((category, categoryIndex) => (
                <div className="problem-chart-group" key={category}>
                  <div className="problem-chart-bars">
                    {visual.series.map((series) => {
                      const value = series.values[categoryIndex];
                      const active = activeIds.includes(series.id);
                      return (
                        <div
                          className={`problem-chart-bar${active ? " active" : ""}`}
                          data-visual={series.id}
                          key={series.id}
                          style={{
                            height: `${Math.max(10, (value / maxValue) * 150)}px`,
                            backgroundColor: series.color,
                          }}
                        >
                          <span>{value}</span>
                        </div>
                      );
                    })}
                  </div>
                  <strong>{category}</strong>
                </div>
              ))}
            </div>
            <div className="problem-chart-legend">
              {visual.series.map((series) => (
                <span key={series.id}>
                  <i style={{ backgroundColor: series.color }} />
                  {series.name}
                </span>
              ))}
            </div>
          </figure>
        );
      })}
    </div>
  );
}
