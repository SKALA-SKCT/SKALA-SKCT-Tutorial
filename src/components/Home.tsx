import type { Problem } from "../types";

interface Props {
  problems: Problem[];
  onSelect: (id: string) => void;
}

export default function Home({ problems, onSelect }: Props) {
  return (
    <div className="home">
      <header className="home-head">
        <h1>SKCT 유형별 풀이 튜토리얼</h1>
        <p className="home-sub">
          문제 유형마다 <strong>어떻게 접근하고 어떤 순서로 읽어야 하는지</strong>{" "}
          단계별로 안내합니다. 지문이 한 문장씩 형광펜으로 강조되며 풀이 흐름을
          그대로 따라갈 수 있어요.
        </p>
      </header>

      <div className="card-grid">
        {problems.map((p) => (
          <button key={p.id} className="card" onClick={() => onSelect(p.id)}>
            <span className={`type-pill type-${p.type}`}>{p.typeLabel}</span>
            <p className="card-summary">{p.typeSummary}</p>
            <span className="card-approach">
              {p.type === "single-blank" ? "→ 지문 먼저 읽기" : "→ 보기 먼저 읽기"}
            </span>
            <span className="card-cta">튜토리얼 시작 →</span>
          </button>
        ))}
      </div>

      <footer className="home-foot">Vite · React · Cloudflare Workers 샘플</footer>
    </div>
  );
}
