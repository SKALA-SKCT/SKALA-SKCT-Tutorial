import MemoPad from "./MemoPad";
import Calculator from "./Calculator";

export default function ExamTools({
  resetKey,
  onExit,
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
}: {
  resetKey: number | string;
  onExit: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
}) {
  return (
    <aside className="exam-tools-panel">
      <MemoPad resetKey={resetKey} />
      <Calculator />
      <div className={`exam-tools-actions${onPrevious && onNext ? " has-navigation" : ""}`}>
        {onPrevious && (
          <button disabled={previousDisabled} onClick={onPrevious}>
            이전
          </button>
        )}
        {onNext && (
          <button disabled={nextDisabled} onClick={onNext}>
            다음
          </button>
        )}
        <button onClick={onExit}>종료</button>
      </div>
    </aside>
  );
}
