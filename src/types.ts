export type ProblemType = "standard" | "single-blank" | "insertion";

/** One chunk of the passage. Sentences flow inline; positions render as pills. */
export interface Segment {
  id: string;
  text: string;
  /** "sentence" (default) or "position" for an (A)~(E) insertion slot. */
  kind?: "sentence" | "position";
  /** Start a new paragraph before this segment. */
  newParagraph?: boolean;
}

export interface Choice {
  id: string;
  marker: string; // ①~⑤
  text: string;
}

/** One guided step: narration + what to spotlight while it's shown. */
export interface Step {
  narration: string;
  /** Passage segment ids to highlight (others dim). */
  highlight?: string[];
  /** Spotlight the <보기> box this step. */
  highlightBox?: boolean;
  /** Choice ids to spotlight (e.g. while evaluating options). */
  highlightChoices?: string[];
  /** Table cells, rows, or chart series to spotlight. */
  highlightVisual?: string[];
  /** Once reached, the correct choice is marked as the answer. */
  reveal?: boolean;
}

export interface ProblemTable {
  type: "table";
  id: string;
  title: string;
  unit?: string;
  columns: string[];
  rows: {
    id: string;
    label: string;
    cells: Array<string | number>;
  }[];
  note?: string;
}

export interface ProblemBarChart {
  type: "bar-chart";
  id: string;
  title: string;
  unit?: string;
  categories: string[];
  series: {
    id: string;
    name: string;
    values: number[];
    color?: string;
  }[];
}

export interface ProblemSequence {
  type: "sequence";
  id: string;
  title: string;
  items: {
    id: string;
    value: string;
  }[];
}

export type ProblemVisual = ProblemTable | ProblemBarChart | ProblemSequence;

export interface Problem {
  id: string;
  type: ProblemType;
  /** Specific question format shown inside a subtype tutorial set. */
  internalTypeName: string;
  /** Short label for pills, e.g. "빈칸 추론 / 빈칸 1개". */
  typeLabel: string;
  /** One-line description shown on the home card. */
  typeSummary: string;
  /** How to approach this whole type (pinned above the passage). */
  strategy: string;
  /** The question stem. */
  stem: string;
  /** <보기> content for insertion-type problems. */
  box?: string;
  /** Label shown above a structured passage, such as <조건>. */
  passageLabel?: string;
  /** Structured source material shown as an actual table or graph. */
  visuals?: ProblemVisual[];
  passage: Segment[];
  choices: Choice[];
  answerId: string;
  steps: Step[];
}
