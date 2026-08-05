import type { Category } from "../data/catalog";

export default function Home({
  categories,
  onSelect,
}: {
  categories: Category[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="home">
      <header className="home-head">
        <h1>유형별 문제 연습</h1>
        <p>SKCT의 5개 인지 영역을 유형별로 나누어 핵심 풀이 전략을 익히고 예시문제로 연습할 수 있습니다.</p>
      </header>
      <div className="category-grid">
        {categories.map((category) => (
          <button
            className={`category-card category-${category.id}`}
            key={category.id}
            onClick={() => onSelect(category.id)}
          >
            <span className="category-number">{category.number}</span>
            <div>
              <h2>{category.name}</h2>
              <p>{category.description}</p>
            </div>
            <span className="category-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
