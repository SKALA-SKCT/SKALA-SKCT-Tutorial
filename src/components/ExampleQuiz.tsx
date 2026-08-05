import { useState } from "react";
import type { Category, Subtype } from "../data/catalog";
import { choiceMarker } from "../data/catalog";
import ExamHeader from "./ExamHeader";
import ExamTools from "./exam/ExamTools";

export default function ExampleQuiz({
  category,
  subtype,
  onBack,
}: {
  category: Category;
  subtype: Subtype;
  onBack: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [zoom, setZoom] = useState(100);
  const question = category.examples[index];
  const selected = answers[question.id] ?? null;
  const last = index === category.examples.length - 1;
  const goNext = () => {
    if (last) {
      setSubmitted(true);
      return;
    }
    setIndex((value) => value + 1);
  };
  const leaveResult = () => {
    setShowExitConfirm(true);
  };

  if (submitted) {
    const correctCount = category.examples.filter(
      (item) => answers[item.id] === item.answer,
    ).length;

    return (
      <section className="example-result-page exam-screen">
        <ExamHeader
          title={`${category.name} ${subtype.name} 예시문제 결과`}
          zoom={zoom}
          onZoom={setZoom}
        />
        <main className="example-result-content" style={{ zoom: `${zoom}%` }}>
          <button className="btn-back" onClick={leaveResult}>
            ← 목록으로
          </button>
          <header className="example-result-head">
            <div>
              <h1>예시문제 결과</h1>
              <p>
                총 {category.examples.length}문항 중 {correctCount}문항을 맞혔습니다.
              </p>
            </div>
          </header>

          <div className="example-review-list">
            {category.examples.map((item, questionIndex) => {
              const selectedAnswer = answers[item.id];
              const correct = selectedAnswer === item.answer;
              const status = selectedAnswer === undefined ? "미응답" : correct ? "정답" : "오답";
              return (
                <article className="example-review-card" key={item.id}>
                  <div className="example-review-title">
                    <strong>{questionIndex + 1}번</strong>
                    <span className={correct ? "correct" : "incorrect"}>{status}</span>
                  </div>
                  <div className="example-review-prompt">
                    <h2>{item.stem}</h2>
                    {item.passage && <p>{item.passage}</p>}
                  </div>
                  <div className="example-review-choices">
                    {item.choices.map((choice, choiceIndex) => {
                      const isCorrectAnswer = choiceIndex === item.answer;
                      const isSelected = choiceIndex === selectedAnswer;
                      return (
                        <div
                          className={`${isCorrectAnswer ? "correct-answer" : ""}${isSelected && !isCorrectAnswer ? " selected-wrong" : ""}`}
                          key={choice}
                        >
                          <span>{choiceMarker(choiceIndex)}</span>
                          <p>{choice}</p>
                          {isCorrectAnswer && <small>정답</small>}
                          {isSelected && !isCorrectAnswer && <small>내 답</small>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="example-review-answer">
                    <p>
                      내 답: {selectedAnswer === undefined ? "미응답" : choiceMarker(selectedAnswer)}
                      <strong>정답: {choiceMarker(item.answer)}</strong>
                    </p>
                  </div>
                  <div className="example-review-explanation">
                    <strong>해설</strong>
                    <p>{item.explanation}</p>
                  </div>
                </article>
              );
            })}
          </div>
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
                <button type="button" className="confirm-primary" onClick={onBack}>
                  이동하기
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }
  return (
    <section className="quiz-page exam-screen">
      <ExamHeader
        title={`${category.name} ${subtype.name} 예시문제`}
        zoom={zoom}
        onZoom={setZoom}
      />
      <div className="exam-content" style={{ zoom: `${zoom}%` }}>
        <div className="exam-question-column">
          <article className="exam-question-card">
            <div className="exam-question-label">
              <span>
                {category.name} 영역 {index + 1} <small>/ {category.examples.length}</small>
              </span>
            </div>
            <div className="exam-prompt">
              <h2>{question.stem}</h2>
              {question.passage && <p>{question.passage}</p>}
            </div>
            <div className="quiz-choices">
              {question.choices.map((choice, choiceIndex) => (
                <button
                  key={choice}
                  className={selected === choiceIndex ? "selected" : ""}
                  onClick={() =>
                    setAnswers((current) => {
                      const next = { ...current };
                      if (current[question.id] === choiceIndex) delete next[question.id];
                      else next[question.id] = choiceIndex;
                      return next;
                    })
                  }
                >
                  <span>{choiceMarker(choiceIndex)}</span>
                  {choice}
                </button>
              ))}
            </div>
            <div className="exam-question-actions">
              <button className="exam-next-button" onClick={goNext}>
                {last ? "제출" : "다음 →"}
              </button>
            </div>
          </article>
        </div>
        <ExamTools resetKey={question.id ?? `${subtype.id}:${index}`} onExit={onBack} />
      </div>
    </section>
  );
}
