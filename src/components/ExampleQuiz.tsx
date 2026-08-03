import { useState } from "react";
import type { Category, Subtype } from "../data/catalog";
import { choiceMarker } from "../data/catalog";
import ExamHeader from "./ExamHeader";
import ExamTools from "./exam/ExamTools";

export default function ExampleQuiz({ category, subtype, onBack }: { category: Category; subtype: Subtype; onBack: () => void }) {
  const [index, setIndex] = useState(0); const [selected, setSelected] = useState<number | null>(null); const [checked, setChecked] = useState(false);
  const [zoom, setZoom] = useState(100);
  const question = category.examples[index]; const last = index === category.examples.length - 1;
  const next = () => { if (last) { onBack(); return; } setIndex(index + 1); setSelected(null); setChecked(false); };
  return <section className="quiz-page exam-screen">
    <ExamHeader title={`${category.name} ${subtype.name} 예시문제`} zoom={zoom} onZoom={setZoom} />
    <div className="exam-content" style={{ zoom: `${zoom}%` }}>
      <div className="exam-question-column">
        <article className="exam-question-card">
          <div className="exam-question-label"><span>{category.name} 영역 {index + 1} <small>/ {category.examples.length}</small></span></div>
          <div className="exam-prompt"><h2>{question.stem}</h2>{question.passage && <p>{question.passage}</p>}</div>
          <div className="quiz-choices">{question.choices.map((choice, choiceIndex) => <button key={choice} disabled={checked} className={`${selected === choiceIndex ? "selected" : ""} ${checked && choiceIndex === question.answer ? "correct" : ""} ${checked && selected === choiceIndex && choiceIndex !== question.answer ? "wrong" : ""}`} onClick={() => setSelected(choiceIndex)}><span>{choiceMarker(choiceIndex)}</span>{choice}</button>)}</div>
          {checked && <div className={`quiz-result ${selected === question.answer ? "is-correct" : ""}`}><strong>{selected === question.answer ? "정답입니다!" : `정답은 ${choiceMarker(question.answer)}입니다.`}</strong><p>{question.explanation}</p></div>}
          <div className="exam-question-actions quiz-question-actions">
            <button className="btn btn-primary" disabled={selected === null || checked} onClick={() => setChecked(true)}>정답 확인</button>
            <button className="btn btn-next" disabled={!checked} onClick={next}>{last ? "학습 선택으로" : "다음 →"}</button>
          </div>
        </article>
      </div>
      <ExamTools resetKey={question.id ?? `${subtype.id}:${index}`} onExit={onBack} />
    </div>
  </section>;
}
