import type { Category } from "../data/catalog";

export default function RandomHub({
  categories,
  onBack,
  onSelect,
  onAll,
}: {
  categories: Category[];
  onBack: () => void;
  onSelect: (category: Category) => void;
  onAll: () => void;
}) {
  return (
    <section className="catalog-page random-hub">
      <button className="btn-back" onClick={onBack}>
        ← 전체 유형
      </button>
      <header className="catalog-head">
        <div>
          <h1>랜덤 문제 풀기</h1>
          <p>원하는 영역을 선택하거나, 다섯 영역을 고르게 섞어 20문제를 풀어보세요.</p>
        </div>
      </header>
      <div className="random-mode-grid">
        {categories.map((category) => (
          <button
            className={`random-mode-card category-${category.id}`}
            key={category.id}
            onClick={() => onSelect(category)}
          >
            <span>{category.number}</span>
            <div>
              <h2>{category.name}</h2>
              <p>{category.name}의 모든 세부 유형에서 20문항을 무작위로 출제합니다.</p>
            </div>
          </button>
        ))}
        <button className="random-mode-card category-random random-all-card" onClick={onAll}>
          <span>06</span>
          <div>
            <h2>랜덤 유형</h2>
            <p>다섯 영역에서 각각 4문항을 골라 순서를 섞어 출제합니다.</p>
          </div>
        </button>
      </div>
    </section>
  );
}
