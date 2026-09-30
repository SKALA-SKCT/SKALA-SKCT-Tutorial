import type { ExampleQuestion } from "./catalog";
import { EXAMPLE_QUESTION_BANK } from "./exampleQuestions";
import { PROBLEMS } from "./problems";

export const SET_SIZE = 20;

export interface ProblemSet {
  id: string;
  categoryId: string;
  number: number;
  questions: ExampleQuestion[];
}

const categoryPrefix: Record<string, string> = {
  "verbal-comprehension": "vc-",
  "data-analysis": "da-",
  "creative-math": "cm-",
  "verbal-reasoning": "vr-",
  "sequence-reasoning": "sr-",
};

// 세부 유형을 번갈아 이어 붙인 뒤 20문항씩 자르므로 모든 사용자가 같은 세트를 받습니다.
function buildCategorySets(categoryId: string, prefix: string): ProblemSet[] {
  const groups = PROBLEMS.filter((problem) => problem.id.startsWith(prefix)).map((problem) =>
    EXAMPLE_QUESTION_BANK.filter((question) => question.kindId === problem.id),
  );
  const longest = Math.max(0, ...groups.map((group) => group.length));
  const interleaved = Array.from({ length: longest }, (_, index) =>
    groups.map((group) => group[index]).filter((question) => question !== undefined),
  ).flat();

  return Array.from({ length: Math.floor(interleaved.length / SET_SIZE) }, (_, index) => ({
    id: `${categoryId}-${index + 1}`,
    categoryId,
    number: index + 1,
    questions: interleaved.slice(index * SET_SIZE, (index + 1) * SET_SIZE),
  }));
}

export const PROBLEM_SETS: ProblemSet[] = Object.entries(categoryPrefix).flatMap(
  ([categoryId, prefix]) => buildCategorySets(categoryId, prefix),
);

export function setsForCategory(categoryId: string): ProblemSet[] {
  return PROBLEM_SETS.filter((set) => set.categoryId === categoryId);
}
