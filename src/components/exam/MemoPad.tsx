import { useEffect, useRef, useState } from "react";

function MemoTextarea({ resetKey }: { resetKey: string }) {
  const [memo, setMemo] = useState("");
  useEffect(() => setMemo(""), [resetKey]);
  return (
    <textarea
      value={memo}
      onChange={(e) => setMemo(e.target.value)}
      placeholder="다음 문제로 넘어가면 지워집니다"
    />
  );
}

export default function MemoPad({ resetKey }: { resetKey: number | string }) {
  const [tab, setTab] = useState<"memo" | "draw">("memo");
  const [memoReset, setMemoReset] = useState(0);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const clearCanvas = () =>
    canvasRef.current
      ?.getContext("2d")
      ?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, [tab, resetKey]);

  const position = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  return (
    <div className="memo-pad">
      <div className="memo-tabs">
        <button className={tab === "memo" ? "active" : ""} onClick={() => setTab("memo")}>
          메모장
        </button>
        <button className={tab === "draw" ? "active" : ""} onClick={() => setTab("draw")}>
          그림판
        </button>
        {tab === "draw" && (
          <div className="draw-tools">
            <button className={tool === "pen" ? "active" : ""} onClick={() => setTool("pen")}>
              펜
            </button>
            <button className={tool === "eraser" ? "active" : ""} onClick={() => setTool("eraser")}>
              지우개
            </button>
          </div>
        )}
        <button
          className="memo-clear"
          onClick={() => (tab === "memo" ? setMemoReset((value) => value + 1) : clearCanvas())}
        >
          전체 지우기
        </button>
      </div>
      <div className="memo-body">
        {tab === "memo" ? (
          <MemoTextarea resetKey={`${resetKey}:${memoReset}`} />
        ) : (
          <canvas
            ref={canvasRef}
            onPointerDown={(event) => {
              drawing.current = true;
              last.current = position(event);
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!drawing.current || !last.current) return;
              const context = event.currentTarget.getContext("2d");
              if (!context) return;
              const point = position(event);
              context.globalCompositeOperation =
                tool === "eraser" ? "destination-out" : "source-over";
              context.strokeStyle = "#18181b";
              context.lineWidth = tool === "eraser" ? 9 : 2;
              context.lineCap = "round";
              context.beginPath();
              context.moveTo(last.current.x, last.current.y);
              context.lineTo(point.x, point.y);
              context.stroke();
              last.current = point;
            }}
            onPointerUp={() => {
              drawing.current = false;
              last.current = null;
            }}
          />
        )}
      </div>
    </div>
  );
}
