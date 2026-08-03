import type { Category, Subtype } from "../data/catalog";

export default function CategoryPage({ category, onBack, onSelect }: { category: Category; onBack: () => void; onSelect: (subtype: Subtype) => void }) {
  return <section className="catalog-page">
    <button className="btn-back" onClick={onBack}>← 전체 유형</button>
    <header className="catalog-head"><div><h1>{category.name} 세부 유형 선택</h1><p>{category.description}</p></div></header>
    <div className="subtype-grid">
      {category.subtypes.map((subtype) => <button className="subtype-card" key={subtype.id} onClick={() => onSelect(subtype)}>
        <div><h3>{subtype.name}</h3><p>{subtype.description}</p></div><span>학습하기 →</span>
      </button>)}
    </div>
  </section>;
}
