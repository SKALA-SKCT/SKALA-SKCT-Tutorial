import { useState } from "react";
import type { Problem } from "../types";
import Passage from "./Passage";
import ProblemVisuals from "./ProblemVisuals";
import DataTableView from "./DataTable";
import Choices from "./Choices";
import ExamHeader from "./ExamHeader";
import ExamTools from "./exam/ExamTools";

interface Props {
  problems: Problem[];
  subtypeName?: string;
  title: string;
  onBack: () => void;
}

export default function TutorialPlayer({ problems, subtypeName, title, onBack }: Props) {
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const problem = problems[problemIndex];
  const step = problem.steps[stepIndex];
  const selectProblem = (index: number) => {
    setProblemIndex(index);
    setStepIndex(0);
  };

  // Once any step up to here has `reveal`, keep the answer shown.
  const revealed = problem.steps.slice(0, stepIndex + 1).some((s) => s.reveal);

  const activeIds = step.highlight ?? [];
  const activeVisualIds = step.highlightVisual ?? [];
  const dimmed = activeIds.length > 0 || activeVisualIds.length > 0 || Boolean(step.highlightBox);

  return (
    <div className="player exam-screen">
      <ExamHeader title={title} zoom={zoom} onZoom={setZoom} />

      <div className="exam-content tutorial-exam-content" style={{ zoom: `${zoom}%` }}>
        <aside className="strategy tutorial-floating-tip">
          <div className="strategy-body">
            <strong>풀이 팁</strong>
            <p>{problem.strategy}</p>
          </div>
          <div className="tip-step-guide">
            <strong>
              STEP {stepIndex + 1} <small>/ {problem.steps.length}</small>
            </strong>
            <div className="tip-step-track">
              <i style={{ width: `${((stepIndex + 1) / problem.steps.length) * 100}%` }} />
            </div>
            <p>{step.narration}</p>
            <div>
              <button
                disabled={stepIndex === 0}
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              >
                이전
              </button>
              <button
                onClick={() =>
                  stepIndex === problem.steps.length - 1
                    ? setStepIndex(0)
                    : setStepIndex((i) => i + 1)
                }
              >
                {stepIndex === problem.steps.length - 1 ? "처음" : "다음"}
              </button>
            </div>
          </div>
        </aside>

        <div className="exam-question-column">
          {problems.length > 1 && (
            <nav className="tutorial-question-nav" aria-label="튜토리얼 유형 이동">
              {problems.map((item, index) => (
                <button
                  type="button"
                  className={index === problemIndex ? "active" : ""}
                  key={item.id}
                  aria-label={`${index + 1}번 유형`}
                  aria-current={index === problemIndex ? "page" : undefined}
                  onClick={() => selectProblem(index)}
                >
                  {index + 1}
                </button>
              ))}
            </nav>
          )}
          <div className="exam-question-card">
            <div className="exam-question-label">
              <span>
                {subtypeName && problems.length > 1
                  ? `${subtypeName} ${problemIndex + 1}/${problems.length}`
                  : problem.typeLabel}
                {subtypeName && problems.length > 1 && (
                  <small className="tutorial-internal-label">{problem.internalTypeName}</small>
                )}
              </span>
            </div>
            <div className="tutorial-problem-content">
              <div className="exam-prompt">
                <h2>{problem.stem}</h2>
              </div>

              {problem.table && <DataTableView table={problem.table} />}

              {problem.box && (
                <div className={`box${step.highlightBox ? " active" : ""}`}>
                  <span className="box-label">&lt;보기&gt;</span>
                  <p>{problem.box}</p>
                </div>
              )}

              {problem.visuals && (
                <ProblemVisuals
                  visuals={problem.visuals}
                  activeIds={activeVisualIds}
                  dimmed={dimmed}
                />
              )}

              {problem.passage.length > 0 && (
                <Passage
                  segments={problem.passage}
                  activeIds={activeIds}
                  dimmed={dimmed}
                  label={problem.passageLabel}
                />
              )}

              <Choices
                choices={problem.choices}
                answerId={problem.answerId}
                revealed={revealed}
                highlightIds={step.highlightChoices ?? []}
              />
            </div>
          </div>
        </div>

        <ExamTools
          resetKey={`${problem.id}:${stepIndex}`}
          onExit={onBack}
          onPrevious={problems.length > 1 ? () => selectProblem(problemIndex - 1) : undefined}
          onNext={problems.length > 1 ? () => selectProblem(problemIndex + 1) : undefined}
          previousDisabled={problemIndex === 0}
          nextDisabled={problemIndex === problems.length - 1}
        />
      </div>
    </div>
  );
}
