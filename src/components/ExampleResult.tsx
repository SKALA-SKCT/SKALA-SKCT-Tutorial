import { useState } from "react";
import type { ExampleQuestion } from "../data/catalog";
import type { PracticeResult } from "./ExampleQuiz";
import ExampleReviewCard from "./ExampleReviewCard";
import ResultExitConfirm from "./ResultExitConfirm";

export default function ExampleResult({
  result,
  onLeave,
}: {
  result: PracticeResult;
  onLeave: () => void;
}) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [openQuestionIds, setOpenQuestionIds] = useState<Set<string>>(() => new Set());
  const correct = result.questions.filter(
    (question) => result.answers[question.id] === question.answer,
  ).length;
  const labels = [
    ...new Set(result.questions.map((question) => question.typeLabel).filter(Boolean)),
  ];
  const randomResult = result.title.includes("랜덤");
  const randomCategories = new Set(labels.map((label) => label?.split(" / ")[0]).filter(Boolean));
  const allCategoryRandom = randomResult && randomCategories.size > 1;
  const singleType = labels.length === 1;
  const resultTitle =
    labels.length === 1
      ? `${labels[0]?.replace(" / ", "-")} 예시문제 결과`
      : `${result.title} 결과`;
  const grouped = result.questions.reduce<Record<string, ExampleQuestion[]>>(
    (current, question) => {
      const label = question.typeLabel ?? "유형 미지정";
      (current[label] ??= []).push(question);
      return current;
    },
    {},
  );
  const reviewGroups: [string, ExampleQuestion[]][] = randomResult
    ? [["random", result.questions]]
    : Object.entries(grouped);
  return (
    <section className="example-result-page">
      <main className="example-result-content">
        <button className="btn-back" onClick={() => setShowExitConfirm(true)}>
          ← 목록으로
        </button>
        <header className="example-result-head">
          <h1>{resultTitle}</h1>
          <strong>
            <b>{correct}</b>
            <span>/20</span>
          </strong>
        </header>
        {reviewGroups.map(([label, questions]) => (
          <section className="example-review-group" key={label}>
            {!randomResult && !singleType && (
              <header>
                <h2>{label}</h2>
              </header>
            )}
            <div className="example-review-list">
              {questions.map((question) => {
                const selected = result.answers[question.id];
                const number = result.questions.indexOf(question) + 1;
                const open = openQuestionIds.has(question.id);
                return (
                  <ExampleReviewCard
                    key={question.id}
                    question={question}
                    number={number}
                    selected={selected}
                    open={open}
                    randomResult={randomResult}
                    allCategoryRandom={allCategoryRandom}
                    onToggle={() =>
                      setOpenQuestionIds((current) => {
                        const next = new Set(current);
                        if (next.has(question.id)) next.delete(question.id);
                        else next.add(question.id);
                        return next;
                      })
                    }
                  />
                );
              })}
            </div>
          </section>
        ))}
      </main>
      {showExitConfirm && (
        <ResultExitConfirm onCancel={() => setShowExitConfirm(false)} onConfirm={onLeave} />
      )}
    </section>
  );
}
