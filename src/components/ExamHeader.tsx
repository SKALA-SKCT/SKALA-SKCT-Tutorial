import { useEffect, useState } from "react";

export default function ExamHeader({
  title,
  zoom,
  onZoom,
}: {
  title: string;
  label?: string;
  zoom: number;
  onZoom: (value: number) => void;
}) {
  const [seconds, setSeconds] = useState(15 * 60);
  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <header className="exam-header">
      <div className="exam-header-inner">
        <strong>{title}</strong>
        <div className="exam-header-center">
          <small>남은 시간</small>
          <b className="exam-timer">{time}</b>
        </div>
        <div className="zoom-control">
          <button
            type="button"
            aria-label="화면 축소"
            disabled={zoom <= 80}
            onClick={() => onZoom(Math.max(80, zoom - 10))}
          >
            −
          </button>
          <span>{zoom}%</span>
          <button
            type="button"
            aria-label="화면 확대"
            disabled={zoom >= 120}
            onClick={() => onZoom(Math.min(120, zoom + 10))}
          >
            +
          </button>
        </div>
      </div>
    </header>
  );
}
