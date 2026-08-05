import { useState } from "react";
import { choiceMarker, type ExampleQuestion } from "../data/catalog";
import type { PracticeResult } from "./ExampleQuiz";
import ProblemVisuals from "./ProblemVisuals";

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
                const selected = result.answers[question.id],
                  answered = selected !== undefined,
                  isCorrect = answered && selected === question.answer,
                  number = result.questions.indexOf(question) + 1,
                  open = openQuestionIds.has(question.id);
                return (
                  <article className="example-review-card" key={question.id}>
                    <button
                      className="example-review-title example-review-toggle"
                      type="button"
                      aria-expanded={open}
                      onClick={() =>
                        setOpenQuestionIds((current) => {
                          const next = new Set(current);
                          if (next.has(question.id)) next.delete(question.id);
                          else next.add(question.id);
                          return next;
                        })
                      }
                    >
                      <strong>{number}번</strong>
                      <div className="example-review-summary">
                        {randomResult && (
                          <small className={`category-${question.categoryId ?? "random"}`}>
                            {allCategoryRandom
                              ? question.typeLabel
                              : question.typeLabel?.split(" / ").slice(1).join(" / ")}
                          </small>
                        )}
                        <p>{question.stem}</p>
                      </div>
                      <span
                        className={isCorrect ? "correct" : answered ? "incorrect" : "unanswered"}
                      >
                        {isCorrect ? "정답" : answered ? "오답" : "미응답"}
                      </span>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 8 4 4 4-4" />
                      </svg>
                    </button>
                    {open && (
                      <div className="example-review-body">
                        {question.box && (
                          <div className="box practice-box">
                            <span className="box-label">&lt;보기&gt;</span>
                            <p>{question.box}</p>
                          </div>
                        )}
                        {question.visuals && (
                          <ProblemVisuals
                            visuals={question.visuals}
                            activeIds={[]}
                            dimmed={false}
                          />
                        )}
                        {question.passage && (
                          <div className="practice-passage">
                            {question.passageLabel && (
                              <strong>&lt;{question.passageLabel}&gt;</strong>
                            )}
                            <p>{question.passage}</p>
                          </div>
                        )}
                        <div className="example-review-choices">
                          {question.choices.map((choice, i) => (
                            <div
                              className={`${i === question.answer ? "correct-answer" : ""}${i === selected && i !== question.answer ? " selected-wrong" : ""}`}
                              key={`${i}-${choice}`}
                            >
                              <span>{choiceMarker(i)}</span>
                              <p>{choice}</p>
                              {i === question.answer && <small>정답</small>}
                              {i === selected && i !== question.answer && <small>내 답</small>}
                            </div>
                          ))}
                        </div>
                        <div className="example-review-answer">
                          <p>
                            내 답: {answered ? choiceMarker(selected) : "미응답"}
                            <strong>정답: {choiceMarker(question.answer)}</strong>
                          </p>
                        </div>
                        <div className="example-review-explanation">
                          <strong>해설</strong>
                          <p>{question.explanation}</p>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </main>
      {showExitConfirm && (
        <div className="confirm-overlay" role="presentation">
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-exit-title"
          >
            <h2 id="result-exit-title">목록으로 이동할까요?</h2>
            <p>목록으로 이동하면 현재 결과는 사라지며 다시 확인할 수 없습니다.</p>
            <div>
              <button type="button" onClick={() => setShowExitConfirm(false)}>
                취소
              </button>
              <button type="button" className="confirm-primary" onClick={onLeave}>
                이동하기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
