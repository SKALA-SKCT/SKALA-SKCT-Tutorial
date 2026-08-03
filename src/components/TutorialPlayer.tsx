import { useMemo, useState } from "react";
import type { Problem } from "../types";
import Passage from "./Passage";
import Choices from "./Choices";
import ExamHeader from "./ExamHeader";
import ExamTools from "./exam/ExamTools";

interface Props {
  problem: Problem;
  title: string;
  onBack: () => void;
}

export default function TutorialPlayer({ problem, title, onBack }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const step = problem.steps[stepIndex];

  // Once any step up to here has `reveal`, keep the answer shown.
  const revealed = useMemo(
    () => problem.steps.slice(0, stepIndex + 1).some((s) => s.reveal),
    [problem.steps, stepIndex],
  );

  const activeIds = step.highlight ?? [];
  const dimmed = activeIds.length > 0 || Boolean(step.highlightBox);

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
            <strong>STEP {stepIndex + 1} <small>/ {problem.steps.length}</small></strong>
            <div className="tip-step-track"><i style={{ width: `${((stepIndex + 1) / problem.steps.length) * 100}%` }} /></div>
            <p>{step.narration}</p>
            <div><button disabled={stepIndex === 0} onClick={() => setStepIndex((i) => Math.max(0, i - 1))}>이전</button><button onClick={() => stepIndex === problem.steps.length - 1 ? setStepIndex(0) : setStepIndex((i) => i + 1)}>{stepIndex === problem.steps.length - 1 ? "처음" : "다음"}</button></div>
          </div>
        </aside>

        <div className="exam-question-column">
          <div className="exam-question-card">
            <div className="exam-question-label"><span>{problem.typeLabel}</span><button onClick={onBack}>나가기</button></div>
            <div className="tutorial-problem-content">
              <div className="exam-prompt"><h2>{problem.stem}</h2></div>

              {problem.box && (
                <div className={`box${step.highlightBox ? " active" : ""}`}>
                  <span className="box-label">&lt;보기&gt;</span>
                  <p>{problem.box}</p>
                </div>
              )}

              <Passage segments={problem.passage} activeIds={activeIds} dimmed={dimmed} />

              <Choices choices={problem.choices} answerId={problem.answerId} revealed={revealed} highlightIds={step.highlightChoices ?? []} />
            </div>
          </div>
        </div>

        <ExamTools resetKey={`${problem.id}:${stepIndex}`} onExit={onBack} />
      </div>
    </div>
  );
}
