interface ResultExitConfirmProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ResultExitConfirm({ onCancel, onConfirm }: ResultExitConfirmProps) {
  return (
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
          <button type="button" onClick={onCancel}>
            취소
          </button>
          <button type="button" className="confirm-primary" onClick={onConfirm}>
            이동하기
          </button>
        </div>
      </div>
    </div>
  );
}
