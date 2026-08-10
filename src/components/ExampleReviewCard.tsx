import { choiceMarker, type ExampleQuestion } from "../data/catalog";
import ProblemVisuals from "./ProblemVisuals";

interface ExampleReviewCardProps {
  question: ExampleQuestion;
  number: number;
  selected: number | undefined;
  open: boolean;
  randomResult: boolean;
  allCategoryRandom: boolean;
  onToggle: () => void;
}

export default function ExampleReviewCard({
  question,
  number,
  selected,
  open,
  randomResult,
  allCategoryRandom,
  onToggle,
}: ExampleReviewCardProps) {
  const answered = selected !== undefined;
  const isCorrect = answered && selected === question.answer;

  return (
    <article className="example-review-card">
      <button
        className="example-review-title example-review-toggle"
        type="button"
        aria-expanded={open}
        onClick={onToggle}
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
        <span className={isCorrect ? "correct" : answered ? "incorrect" : "unanswered"}>
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
            <ProblemVisuals visuals={question.visuals} activeIds={[]} dimmed={false} />
          )}
          {question.passage && (
            <div className="practice-passage">
              {question.passageLabel && <strong>&lt;{question.passageLabel}&gt;</strong>}
              <p>{question.passage}</p>
            </div>
          )}
          <div className="example-review-choices">
            {question.choices.map((choice, index) => (
              <div
                className={`${index === question.answer ? "correct-answer" : ""}${index === selected && index !== question.answer ? " selected-wrong" : ""}`}
                key={`${index}-${choice}`}
              >
                <span>{choiceMarker(index)}</span>
                <p>{choice}</p>
                {index === question.answer && <small>정답</small>}
                {index === selected && index !== question.answer && <small>내 답</small>}
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
}
