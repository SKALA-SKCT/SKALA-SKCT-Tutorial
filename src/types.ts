export type ProblemType = "single-blank" | "insertion";

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
  /** Once reached, the correct choice is marked as the answer. */
  reveal?: boolean;
}

/** A data table for 자료해석-style problems (rendered above the passage). */
export interface DataTable {
  /** Optional caption, e.g. "<표> 연도별 제품 판매량". */
  title?: string;
  /** Optional unit note, e.g. "단위: 천 개". */
  unit?: string;
  /** Header cells; the first is the row-label column header. */
  columns: string[];
  /** Each row as [rowLabel, ...cells], aligned to `columns`. */
  rows: string[][];
}

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
  /** Optional data table rendered above the passage (자료해석). */
  table?: DataTable;
  passage: Segment[];
  choices: Choice[];
  answerId: string;
  steps: Step[];
}
