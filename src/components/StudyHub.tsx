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
          <div className="mode-visual" aria-hidden="true">
            <img src="/images/tutorial-guide.png" alt="" />
          </div>
          <div>
            <h2>풀이 튜토리얼</h2>
            <p>풀이 과정을 차례로 따라가며 핵심 단서와 판단 기준을 익힐 수 있습니다.</p>
          </div>
          <strong>튜토리얼 시작 →</strong>
        </button>
        <button className="mode-card example-mode" onClick={onExamples}>
          <span className="mode-icon">02</span>
          <div className="mode-visual" aria-hidden="true">
            <img src="/images/example-practice.png" alt="" />
          </div>
          <div>
            <h2>예시문제 풀기</h2>
            <p>실전과 같은 화면에서 대표 문제를 풀며 익힌 전략을 점검할 수 있습니다.</p>
          </div>
          <strong>예시문제 시작 →</strong>
        </button>
      </div>
    </section>
  );
}
