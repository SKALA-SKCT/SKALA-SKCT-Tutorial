import type { Problem } from "../types";
import { VERBAL_COMPREHENSION_TUTORIALS } from "./tutorials/verbalComprehension";
import { DATA_ANALYSIS_TUTORIALS } from "./tutorials/dataAnalysis";
import { CREATIVE_MATH_TUTORIALS } from "./tutorials/creativeMath";
import { VERBAL_REASONING_TUTORIALS } from "./tutorials/verbalReasoning";
import { SEQUENCE_REASONING_TUTORIALS } from "./tutorials/sequenceReasoning";

/**
 * All guided tutorials, aggregated by category. Each is hand-authored via
 * `defineTutorial` in `./tutorials/*`, mirroring the friendly, click-through
 * explanation for its type.
 */
export const PROBLEMS: Problem[] = [
  ...VERBAL_COMPREHENSION_TUTORIALS,
  ...DATA_ANALYSIS_TUTORIALS,
  ...CREATIVE_MATH_TUTORIALS,
  ...VERBAL_REASONING_TUTORIALS,
  ...SEQUENCE_REASONING_TUTORIALS,
];
