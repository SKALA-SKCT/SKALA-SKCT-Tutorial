import { useState } from "react";
import type { Category } from "../data/catalog";

export default function Home({
  categories,
  onSelect,
  onRandom,
}: {
  categories: Category[];
  onSelect: (id: string) => void;
  onRandom: () => void;
}) {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const descriptionLines: Record<string, string[]> = {
    "verbal-comprehension": [
      "긴 글에서 중심 내용과 세부 정보를",
      "판단하는 영역입니다. 핵심어와 문장",
      "사이의 관계를 정확히 확인해야 합니다.",
    ],
    "data-analysis": [
      "표와 그래프의 수치를 비교하고",
      "계산하는 영역입니다. 필요한 값과",
      "계산 순서를 먼저 정해야 합니다.",
    ],
    "creative-math": [
      "주어진 상황을 식으로 바꾸어",
      "답을 구하는 영역입니다. 변하지 않는 값과",
      "수량 사이의 관계를 먼저 찾아야 합니다.",
    ],
    "verbal-reasoning": [
      "명제와 여러 조건을 연결해 반드시 참인",
      "결론을 찾는 영역입니다. 조건을 짧게",
      "기호화하고 확정 정보부터 정리해야 합니다.",
    ],
    "sequence-reasoning": [
      "수의 변화 규칙을 찾아 빈칸이나",
      "다음 항을 구하는 영역입니다. 차이와 비율을",
      "먼저 보고 반복 연산을 확인해야 합니다.",
    ],
  };
  const cards = [
    ...categories.map((category) => ({ type: "category" as const, category })),
    { type: "random" as const },
  ];
  return (
    <div className="home">
      <header className="home-head">
        <h1>유형별 문제 연습</h1>
        <p>SKCT의 5개 인지 영역을 유형별로 나누어 핵심 풀이 전략을 익히고 예시문제로 연습할 수 있습니다.</p>
      </header>
      <div
        className={`category-grid${activeCard === null ? "" : ` active-card-${activeCard + 1}`}`}
      >
        {cards.map((card) =>
          card.type === "category" ? (
            <div
              className={`category-card category-${card.category.id}`}
              key={card.category.id}
            >
              <span className="category-number">{card.category.number}</span>
              <div>
                <h2>{card.category.name}</h2>
                <p>
                  {descriptionLines[card.category.id].map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
              </div>
              <span className="category-arrow">→</span>
            </div>
          ) : (
            <div
              className="category-card category-random"
              key="random"
            >
              <span className="category-number">06</span>
              <div>
                <h2>랜덤 문제 풀기</h2>
                <p>
                  <span>다섯 영역 또는 전체 랜덤을 선택해</span>
                  <span>20문제를 이어서 풀 수 있습니다.</span>
                </p>
              </div>
              <span className="category-arrow">→</span>
            </div>
          ),
        )}
        <div className="category-hit-grid" onPointerLeave={() => setActiveCard(null)}>
          {cards.map((card, index) => (
            <button
              aria-label={card.type === "category" ? card.category.name : "랜덤 문제 풀기"}
              key={card.type === "category" ? card.category.id : "random"}
              onClick={() =>
                card.type === "category" ? onSelect(card.category.id) : onRandom()
              }
              onPointerEnter={() => setActiveCard(index)}
              onFocus={() => setActiveCard(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
