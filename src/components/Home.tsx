import type { Category } from "../data/catalog";

export default function Home({ categories, onSelect }: { categories: Category[]; onSelect: (id: string) => void }) {
  return (
    <div className="home">
      <div className="category-grid">
        {categories.map((category) => (
          <button className={`category-card category-${category.id}`} key={category.id} onClick={() => onSelect(category.id)}>
            <span className="category-number">{category.number}</span>
            <div><h2>{category.name}</h2><p>{category.description}</p></div>
            <span className="category-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
