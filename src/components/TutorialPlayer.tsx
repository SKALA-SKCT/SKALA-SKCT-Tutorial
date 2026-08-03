import { useMemo, useState } from "react";
import type { Problem } from "../types";
import Passage from "./Passage";
import Choices from "./Choices";
import GuidePanel from "./GuidePanel";

interface Props {
  problem: Problem;
  onBack: () => void;
}

export default function TutorialPlayer({ problem, onBack }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = problem.steps[stepIndex];

  // Once any step up to here has `reveal`, keep the answer shown.
  const revealed = useMemo(
    () => problem.steps.slice(0, stepIndex + 1).some((s) => s.reveal),
    [problem.steps, stepIndex],
  );

  const activeIds = step.highlight ?? [];
  const dimmed = activeIds.length > 0 || Boolean(step.highlightBox);

  return (
    <div className="player">
      <header className="player-head">
        <button className="btn-back" onClick={onBack}>
          ← 유형 목록
        </button>
        <span className={`type-pill type-${problem.type}`}>{problem.typeLabel}</span>
      </header>

      <div className="player-grid">
        <div className="player-main">
          <div className="strategy">
            <span className="strategy-tag">
              {problem.type === "single-blank" ? "지문 먼저" : "보기 먼저"}
            </span>
            <div className="strategy-body">
              <strong>이 유형 공략법</strong>
              <p>{problem.strategy}</p>
            </div>
          </div>

          <p className="stem">{problem.stem}</p>

          {problem.box && (
            <div className={`box${step.highlightBox ? " active" : ""}`}>
              <span className="box-label">&lt;보기&gt;</span>
              <p>{problem.box}</p>
            </div>
          )}

          <Passage
            segments={problem.passage}
            activeIds={activeIds}
            dimmed={dimmed}
          />

          <Choices
            choices={problem.choices}
            answerId={problem.answerId}
            revealed={revealed}
            highlightIds={step.highlightChoices ?? []}
          />
        </div>

        <GuidePanel
          stepIndex={stepIndex}
          totalSteps={problem.steps.length}
          narration={step.narration}
          onPrev={() => setStepIndex((i) => Math.max(0, i - 1))}
          onNext={() =>
            setStepIndex((i) => Math.min(problem.steps.length - 1, i + 1))
          }
          onRestart={() => setStepIndex(0)}
        />
      </div>
    </div>
  );
}
