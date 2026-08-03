import { useState } from "react";
import { PROBLEMS } from "./data/problems";
import Home from "./components/Home";
import TutorialPlayer from "./components/TutorialPlayer";

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = PROBLEMS.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="app">
      {selected ? (
        <TutorialPlayer problem={selected} onBack={() => setSelectedId(null)} />
      ) : (
        <Home problems={PROBLEMS} onSelect={setSelectedId} />
      )}
    </div>
  );
}
