import type { Choice, DataTable, Problem, ProblemType, Segment, Step } from "../types";

const markers = ["①", "②", "③", "④", "⑤"];

/**
 * Author-facing step. Highlights are written as 1-based positions so the
 * content reads naturally: `highlight: [2]` spotlights the 2nd passage
 * segment, `highlightChoices: [3]` spotlights the ③ choice.
 */
export interface TutorialStep {
  narration: string;
  /** 1-based indices into the passage array (sentences or (A)~(E) positions). */
  highlight?: number[];
  /** Spotlight the <보기> box while this step is shown. */
  highlightBox?: boolean;
  /** 1-based choice numbers to spotlight. */
  highlightChoices?: number[];
  /** From this step on, mark the correct choice as the answer. */
  reveal?: boolean;
}

export interface TutorialInput {
  id: string;
  type?: ProblemType;
  /** Specific format label shown on the question card. */
  internalTypeName: string;
  /** Pinned "풀이 팁" banner: how to approach this type. */
  strategy: string;
  stem: string;
  /** <보기> content for insertion / ordering problems. */
  box?: string;
  /** Optional data table rendered above the passage (자료해석). */
  table?: DataTable;
  /** Each entry becomes one segment; strings are plain sentences. */
  passage: Array<string | Omit<Segment, "id">>;
  choices: string[];
  /** 1-based number of the correct choice (e.g. 2 for ②). */
  answer: number;
  steps: TutorialStep[];
}

/** Build a fully-formed Problem from concise, 1-based author input. */
export function defineTutorial(input: TutorialInput): Problem {
  const passage: Segment[] = input.passage.map((item, index) => ({
    id: `p${index + 1}`,
    ...(typeof item === "string" ? { text: item } : item),
  }));

  const choices: Choice[] = input.choices.map((text, index) => ({
    id: String(index + 1),
    marker: markers[index] ?? String(index + 1),
    text,
  }));

  const steps: Step[] = input.steps.map((s) => {
    const step: Step = { narration: s.narration };
    if (s.highlight) step.highlight = s.highlight.map((n) => `p${n}`);
    if (s.highlightBox) step.highlightBox = true;
    if (s.highlightChoices) step.highlightChoices = s.highlightChoices.map(String);
    if (s.reveal) step.reveal = true;
    return step;
  });

  return {
    id: input.id,
    type: input.type ?? "single-blank",
    internalTypeName: input.internalTypeName,
    typeLabel: input.internalTypeName,
    typeSummary: input.internalTypeName,
    strategy: input.strategy,
    stem: input.stem,
    box: input.box,
    table: input.table,
    passage,
    choices,
    answerId: String(input.answer),
    steps,
  };
}
