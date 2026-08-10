import { useState } from "react";
import type { ExampleQuestion } from "../data/catalog";
import { choiceMarker } from "../data/catalog";
import { PROBLEMS } from "../data/problems";
import ExamHeader from "./ExamHeader";
import ExamTools from "./exam/ExamTools";
import ProblemVisuals from "./ProblemVisuals";
import { displayQuestionStem } from "../utils/questionText";

export interface PracticeResult {
  title: string;
  questions: ExampleQuestion[];
  answers: Record<string, number>;
}

export default function ExampleQuiz({
  title,
  questions,
  onFinish,
}: {
  title: string;
  questions: ExampleQuestion[];
  onFinish: (result: PracticeResult) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showType, setShowType] = useState(() => !title.includes("랜덤"));
  const [showTip, setShowTip] = useState(false);
  const question = questions[index];
  const selected = answers[question.id];
  const last = index === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const randomMode = title.includes("랜덤");
  const currentTutorial = PROBLEMS.find((problem) => problem.id === question.kindId);

  const finish = () => onFinish({ title, questions, answers });
  const goNext = () => {
    setShowTip(false);
    if (last) finish();
    else setIndex((value) => value + 1);
  };
  const goPrevious = () => {
    setShowTip(false);
    setIndex((value) => Math.max(0, value - 1));
  };

  return (
    <section className="quiz-page exam-screen">
      <ExamHeader title={title} zoom={zoom} onZoom={setZoom} />
      <div className="exam-content practice-exam-content" style={{ zoom: `${zoom}%` }}>
        <aside className="practice-tip-panel">
          <button
            type="button"
            className="practice-tip-heading"
            aria-expanded={showTip}
            onClick={() => setShowTip((value) => !value)}
          >
            <span>풀이 팁</span>
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <path d="m6 8 4 4 4-4" />
            </svg>
          </button>
          {showTip && (
            <p>{currentTutorial?.strategy ?? "문제의 조건과 질문을 먼저 구분해 확인하세요."}</p>
          )}
        </aside>
        <div className="exam-question-column">
          <article className="exam-question-card">
            <div className="exam-question-label practice-question-label">
              <div>
                <span>{randomMode && !showType ? "문제" : question.typeLabel}</span>
                {randomMode && (
                  <button type="button" onClick={() => setShowType((value) => !value)}>
                    {showType ? "유형 숨기기" : "유형 보기"}
                  </button>
                )}
              </div>
              <strong className="practice-question-progress">
                {index + 1} <small>/ {questions.length}</small>
              </strong>
            </div>
            <div className="exam-prompt">
              <h2>{displayQuestionStem(question.stem)}</h2>
            </div>
            {question.box && (
              <div className="box practice-box">
                <span className="box-label">&lt;보기&gt;</span>
                <p>{question.box}</p>
              </div>
            )}
            {question.visuals && (
              <ProblemVisuals visuals={question.visuals} activeIds={[]} dimmed={false} />
            )}
            {question.passage && (
              <div className="practice-passage">
                {question.passageLabel && <strong>&lt;{question.passageLabel}&gt;</strong>}
                <p>{question.passage}</p>
              </div>
            )}
            <div className="quiz-choices">
              {question.choices.map((choice, choiceIndex) => (
                <button
                  key={`${choiceIndex}-${choice}`}
                  className={selected === choiceIndex ? "selected" : ""}
                  onClick={() =>
                    setAnswers((current) => ({ ...current, [question.id]: choiceIndex }))
                  }
                >
                  <span>{choiceMarker(choiceIndex)}</span>
                  {choice}
                </button>
              ))}
            </div>
            <div className="exam-question-actions practice-actions">
              <div>
                {index > 0 && <button onClick={goPrevious}>← 이전</button>}
                <button className="exam-next-button" onClick={goNext}>
                  {last ? "결과 보기" : "다음 →"}
                </button>
              </div>
            </div>
          </article>
        </div>
        <ExamTools resetKey={question.id} onExit={() => setShowExitConfirm(true)} />
      </div>
      {showExitConfirm && (
        <div className="confirm-overlay" role="presentation">
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="practice-exit-title"
          >
            <h2 id="practice-exit-title">여기까지 채점할까요?</h2>
            <p>
              응답한 {answeredCount}문항만 결과에 표시됩니다. 결과를 나가면 기록은 저장되지
              않습니다.
            </p>
            <div>
              <button type="button" onClick={() => setShowExitConfirm(false)}>
                계속 풀기
              </button>
              <button type="button" className="confirm-primary" onClick={finish}>
                응시 종료
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
