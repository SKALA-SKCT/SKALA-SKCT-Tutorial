import type { Category, ProblemKind, Subtype } from "../data/catalog";

export default function CategoryPage({
  category,
  onBack,
  onSelect,
}: {
  category: Category;
  onBack: () => void;
  onSelect: (subtype: Subtype, kind: ProblemKind) => void;
}) {
  return (
    <section className="catalog-page">
      <button className="btn-back" onClick={onBack}>
        ← 전체 유형
      </button>
      <header className="catalog-head">
        <div>
          <h1>{category.name} 세부 유형 선택</h1>
          <p>{category.description}</p>
        </div>
      </header>
      <div className="subtype-grid">
        {category.subtypes.flatMap((subtype) =>
          subtype.kinds.map((kind) => (
            <button
              className="subtype-card"
              key={kind.id}
              onClick={() => onSelect(subtype, kind)}
            >
              <div>
                <h3>{kind.name}</h3>
                <p>{kind.description}</p>
              </div>
            </button>
          )),
        )}
      </div>
    </section>
  );
}
