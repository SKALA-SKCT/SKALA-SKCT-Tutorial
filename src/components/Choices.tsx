import type { Choice } from "../types";

interface Props {
  choices: Choice[];
  answerId: string;
  revealed: boolean;
  highlightIds: string[];
}

export default function Choices({ choices, answerId, revealed, highlightIds }: Props) {
  return (
    <ol className="choices">
      {choices.map((c) => {
        const isAnswer = c.id === answerId;
        const cls = ["choice"];
        if (highlightIds.includes(c.id)) cls.push("focus");
        if (revealed && isAnswer) cls.push("correct");
        return (
          <li key={c.id} className={cls.join(" ")}>
            <span className="choice-marker">{c.marker}</span>
            <span className="choice-text">{c.text}</span>
            {revealed && isAnswer && <span className="choice-badge">정답</span>}
          </li>
        );
      })}
    </ol>
  );
}
