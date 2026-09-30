import type { Category } from "../data/catalog";
import { setsForCategory } from "../data/problemSets";

export default function SetHub({
  categories,
  onBack,
  onSelect,
}: {
  categories: Category[];
  onBack: () => void;
  onSelect: (category: Category) => void;
}) {
  return (
    <section className="catalog-page random-hub">
      <button className="btn-back" onClick={onBack}>
        ← 전체 유형
      </button>
      <header className="catalog-head">
        <div>
          <h1>문제 세트</h1>
          <p>
            영역을 선택하면 세부 유형을 섞은 20문제 세트를 풀 수 있습니다. 모든 사용자에게 같은
            문제가 출제됩니다.
          </p>
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
              <p>
                세부 유형 {category.subtypes[0]?.kinds.length ?? 0}개를 섞은 20문제 세트{" "}
                {setsForCategory(category.id).length}개
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
