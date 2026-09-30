import { useEffect, useState } from "react";
import type { Category, ExampleQuestion } from "../data/catalog";
import { SET_SIZE, scoreOf, type ProblemSet } from "../data/problemSets";
import { getSetRecords, type SetRecord } from "../api/setRecords";
import { ReviewBody } from "./ExampleReviewCard";
import MemoPad from "./exam/MemoPad";
import Calculator from "./exam/Calculator";

export type RecordStatus = "idle" | "saving" | "saved" | "failed";
type ReviewFilter = "all" | "wrong" | "correct" | "unanswered";

function requestedRound(): number | null {
  const value = Number(new URLSearchParams(window.location.search).get("round"));
  return Number.isInteger(value) && value >= 1 ? value : null;
}

function questionStatus(question: ExampleQuestion, answers: Record<string, number>) {
  const selected = answers[question.id];
  if (selected === undefined) return "unanswered";
  return selected === question.answer ? "correct" : "wrong";
}

const STATUS_LABEL = { correct: "정답", wrong: "오답", unanswered: "미응답" } as const;

export default function SetResult({
  category,
  set,
  recordStatus,
  pendingAnswers,
  onBack,
  onRetry,
}: {
  category: Category;
  set: ProblemSet;
  recordStatus: RecordStatus;
  pendingAnswers: Record<string, number> | null;
  onBack: () => void;
  onRetry: () => void;
}) {
  const [records, setRecords] = useState<SetRecord[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [round, setRound] = useState<number | null>(requestedRound);
  const [filter, setFilter] = useState<ReviewFilter>("all");

  useEffect(() => {
    if (recordStatus === "saving") return;
    getSetRecords()
      .then((items) => {
        setRecords(items);
        setLoadFailed(false);
      })
      .catch(() => setLoadFailed(true));
  }, [recordStatus]);

  const attempts = (records ?? []).filter((record) => record.setId === set.id);
  const unsaved = recordStatus === "failed" && pendingAnswers !== null;
  const selectedRound = Math.min(round ?? attempts.length, attempts.length);
  const answers = unsaved ? pendingAnswers : attempts[selectedRound - 1]?.answers;
  const title = `${category.name} 문제 세트 ${set.number}`;

  const selectRound = (value: number) => {
    setRound(value);
    setFilter("all");
    window.history.replaceState({}, "", `${window.location.pathname}?round=${value}`);
  };

  const header = (
    <>
      <button className="btn-back" onClick={onBack}>
        ← 목록으로
      </button>
      <header className="set-result-head">
        <h1>{title}</h1>
        <button type="button" className="set-start" onClick={onRetry}>
          재응시
        </button>
      </header>
    </>
  );

  if (recordStatus === "saving" || (!unsaved && records === null && !loadFailed)) {
    return (
      <section className="set-result-page">
        {header}
        <p className="set-notice">결과를 불러오고 있습니다.</p>
      </section>
    );
  }
  if (!answers) {
    return (
      <section className="set-result-page">
        {header}
        <p className="set-notice">
          {loadFailed
            ? "기록을 불러오지 못했습니다. 로그인 상태를 확인해 주세요."
            : "아직 응시 기록이 없습니다."}
        </p>
      </section>
    );
  }

  const score = scoreOf(set, { answers });
  const scores = attempts.map((record) => scoreOf(set, record));
  const previous = unsaved ? scores.at(-1) : scores[selectedRound - 2];
  const diff = previous === undefined ? null : score - previous;
  const statusCount = (status: ReviewFilter) =>
    set.questions.filter((question) => questionStatus(question, answers) === status).length;
  const typeRows = Object.entries(
    set.questions.reduce<Record<string, { correct: number; total: number }>>((rows, question) => {
      const label = question.typeLabel?.split(" / ").slice(1).join(" / ") || "유형 미지정";
      const row = (rows[label] ??= { correct: 0, total: 0 });
      row.total += 1;
      if (questionStatus(question, answers) === "correct") row.correct += 1;
      return rows;
    }, {}),
  );
  const filters: [ReviewFilter, string][] = [
    ["all", `전체 ${SET_SIZE}`],
    ["wrong", `틀린 문제 ${statusCount("wrong")}`],
    ["correct", `맞춘 문제 ${statusCount("correct")}`],
    ["unanswered", `미응답 ${statusCount("unanswered")}`],
  ];
  const visibleQuestions = set.questions
    .map((question, index) => ({ question, number: index + 1 }))
    .filter(({ question }) => filter === "all" || questionStatus(question, answers) === filter);

  return (
    <section className={`set-result-page category-${category.id}`}>
      {header}
      {unsaved ? (
        <p className="set-notice">
          기록을 저장하지 못했습니다. 로그인 상태를 확인해 주세요. 이 결과는 목록으로 이동하면
          사라집니다.
        </p>
      ) : (
        <div className="set-round-tabs" role="tablist" aria-label="응시 회차">
          {attempts.map((record, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={index + 1 === selectedRound}
              className={index + 1 === selectedRound ? "active" : ""}
              key={record.id}
              onClick={() => selectRound(index + 1)}
            >
              {index + 1}회차
            </button>
          ))}
        </div>
      )}

      <div className="set-metrics">
        <div>
          <small>총점</small>
          <strong className="brand">
            {score}
            <span>/{SET_SIZE}</span>
          </strong>
        </div>
        <div>
          <small>정답률</small>
          <strong>
            {Math.round((score / SET_SIZE) * 100)}
            <span>%</span>
          </strong>
        </div>
        <div>
          <small>최고 점수</small>
          <strong>
            {Math.max(score, ...scores)}
            <span>/{SET_SIZE}</span>
          </strong>
        </div>
        <div>
          <small>이전 회차 대비</small>
          <strong className={diff === null ? "" : diff > 0 ? "up" : diff < 0 ? "brand" : ""}>
            {diff === null ? "-" : `${diff > 0 ? "+" : ""}${diff}`}
            {diff !== null && <span>문항</span>}
          </strong>
        </div>
      </div>

      <div className="set-type-card">
        <h2>세부 유형별 점수</h2>
        <table>
          <thead>
            <tr>
              <th>세부 유형</th>
              <th>맞힌 문항</th>
              <th>정답률</th>
            </tr>
          </thead>
          <tbody>
            {typeRows.map(([label, row]) => (
              <tr key={label}>
                <td>{label}</td>
                <td>
                  {row.correct}/{row.total}
                </td>
                <td>{Math.round((row.correct / row.total) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="set-review-layout">
        <div className="set-review-main">
          <div className="set-review-head">
            <div>
              <h2>문항별 리뷰</h2>
              <p>문제, 자료, 선택지, 해설을 함께 확인합니다.</p>
            </div>
            <div className="set-review-filters">
              {filters.map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={filter === value ? "active" : ""}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {visibleQuestions.length === 0 && <p className="set-notice">표시할 문항이 없습니다.</p>}
          {visibleQuestions.map(({ question, number }) => {
            const status = questionStatus(question, answers);
            return (
              <article className="set-question" key={question.id}>
                <header>
                  <strong>{number}번</strong>
                  <small>{question.typeLabel?.split(" / ").slice(1).join(" / ")}</small>
                  <span className={status}>{STATUS_LABEL[status]}</span>
                </header>
                <ReviewBody question={question} selected={answers[question.id]} showStem />
              </article>
            );
          })}
        </div>
        <aside className="exam-tools-panel set-review-tools">
          <MemoPad resetKey={`set:${set.id}`} placeholder="메모를 입력하세요" />
          <Calculator />
        </aside>
      </div>
    </section>
  );
}
