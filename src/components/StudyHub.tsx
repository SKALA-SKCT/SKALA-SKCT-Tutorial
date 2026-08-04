import type { Category, Subtype } from "../data/catalog";

export default function StudyHub({
  category,
  subtype,
  onBack,
  onTutorial,
  onExamples,
}: {
  category: Category;
  subtype: Subtype;
  onBack: () => void;
  onTutorial: () => void;
  onExamples: () => void;
}) {
  return (
    <section className="catalog-page">
      <button className="btn-back" onClick={onBack}>
        ← {category.name}
      </button>
      <header className="study-head">
        <h1>{subtype.name}</h1>
        <p>{subtype.description}</p>
      </header>
      <div className="mode-grid">
        <button className="mode-card tutorial-mode" onClick={onTutorial}>
          <span className="mode-icon">01</span>
          <div>
            <h2>풀이 튜토리얼</h2>
            <p>문장을 단계별로 강조하며 접근 순서와 정답 근거를 익힙니다.</p>
          </div>
          <strong>튜토리얼 시작 →</strong>
        </button>
        <button className="mode-card example-mode" onClick={onExamples}>
          <span className="mode-icon">02</span>
          <div>
            <h2>예시문제 풀기</h2>
            <p>배운 전략을 {category.examples.length}개의 대표 문제에 바로 적용합니다.</p>
          </div>
          <strong>예시문제 시작 →</strong>
        </button>
      </div>
    </section>
  );
}
