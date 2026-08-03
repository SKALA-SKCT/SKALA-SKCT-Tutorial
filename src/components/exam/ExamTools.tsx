import MemoPad from "./MemoPad";
import Calculator from "./Calculator";

export default function ExamTools({ resetKey, onExit }: { resetKey: number | string; onExit: () => void }) {
  return <aside className="exam-tools-panel">
    <MemoPad resetKey={resetKey} />
    <Calculator />
    <div className="exam-tools-actions"><button onClick={onExit}>종료</button></div>
  </aside>;
}
