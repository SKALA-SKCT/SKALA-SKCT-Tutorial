interface Props {
  stepIndex: number;
  totalSteps: number;
  narration: string;
  onPrev: () => void;
  onNext: () => void;
  onRestart: () => void;
}

export default function GuidePanel({
  stepIndex,
  totalSteps,
  narration,
  onPrev,
  onNext,
  onRestart,
}: Props) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <aside className="guide">
      <div className="guide-progress">
        <span className="guide-step">
          STEP {stepIndex + 1} <span className="guide-total">/ {totalSteps}</span>
        </span>
        <div className="guide-bar">
          <div className="guide-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <p className="guide-narration">{narration}</p>

      <div className="guide-actions">
        <button className="btn btn-ghost" onClick={onPrev} disabled={isFirst}>
          ← 이전
        </button>
        {isLast ? (
          <button className="btn btn-primary" onClick={onRestart}>
            ↺ 처음부터
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onNext}>
            다음 →
          </button>
        )}
      </div>
    </aside>
  );
}
