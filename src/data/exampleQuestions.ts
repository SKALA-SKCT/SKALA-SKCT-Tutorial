import type { ExampleQuestion } from "./catalog";
import { DATA_EXAMPLE_QUESTIONS } from "./exampleBanks/dataQuestions";
import { LOGIC_EXAMPLE_QUESTIONS } from "./exampleBanks/logicQuestions";
import { MATH_EXAMPLE_QUESTIONS } from "./exampleBanks/mathQuestions";
import { SEQUENCE_EXAMPLE_QUESTIONS } from "./exampleBanks/sequenceQuestions";
import { VERBAL_JUDGMENT_QUESTIONS } from "./exampleBanks/verbalJudgment";
import { VERBAL_MAIN_BLANK_QUESTIONS } from "./exampleBanks/verbalMainBlank";
import { VERBAL_STRUCTURE_QUESTIONS } from "./exampleBanks/verbalStructure";

export const EXAMPLE_QUESTION_BANK: ExampleQuestion[] = [
  ...VERBAL_MAIN_BLANK_QUESTIONS,
  ...VERBAL_STRUCTURE_QUESTIONS,
  ...VERBAL_JUDGMENT_QUESTIONS,
  ...DATA_EXAMPLE_QUESTIONS,
  ...MATH_EXAMPLE_QUESTIONS,
  ...LOGIC_EXAMPLE_QUESTIONS,
  ...SEQUENCE_EXAMPLE_QUESTIONS,
];

export function questionsForKind(kindId: string) {
  return EXAMPLE_QUESTION_BANK.filter((question) => question.kindId === kindId);
}

export function questionsForCategory(categoryId: string) {
  return EXAMPLE_QUESTION_BANK.filter((question) => question.categoryId === categoryId);
}

export const exampleChoiceMarkers = ["①", "②", "③", "④", "⑤"];
