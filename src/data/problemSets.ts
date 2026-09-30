import type { ExampleQuestion } from "./catalog";
import { EXAMPLE_QUESTION_BANK } from "./exampleQuestions";
import { EXTRA_QUESTION_BANK } from "./extraQuestions";
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
function interleaveKinds(bank: ExampleQuestion[], prefix: string): ExampleQuestion[] {
  const groups = PROBLEMS.filter((problem) => problem.id.startsWith(prefix)).map((problem) =>
    bank.filter((question) => question.kindId === problem.id),
  );
  const longest = Math.max(0, ...groups.map((group) => group.length));
  return Array.from({ length: longest }, (_, index) =>
    groups.map((group) => group[index]).filter((question) => question !== undefined),
  ).flat();
}

// 기존 세트 번호의 문항이 바뀌면 저장된 기록의 점수가 달라지므로 추가 문항 세트는 뒤에 이어 붙입니다.
function buildCategorySets(categoryId: string, prefix: string): ProblemSet[] {
  const ordered = [
    ...interleaveKinds(EXAMPLE_QUESTION_BANK, prefix),
    ...interleaveKinds(EXTRA_QUESTION_BANK, prefix),
  ];
  return Array.from({ length: Math.floor(ordered.length / SET_SIZE) }, (_, index) => ({
    id: `${categoryId}-${index + 1}`,
    categoryId,
    number: index + 1,
    questions: ordered.slice(index * SET_SIZE, (index + 1) * SET_SIZE),
  }));
}

export const PROBLEM_SETS: ProblemSet[] = Object.entries(categoryPrefix).flatMap(
  ([categoryId, prefix]) => buildCategorySets(categoryId, prefix),
);

export function setsForCategory(categoryId: string): ProblemSet[] {
  return PROBLEM_SETS.filter((set) => set.categoryId === categoryId);
}

export function scoreOf(set: ProblemSet, record: { answers: Record<string, number> }): number {
  return set.questions.filter((question) => record.answers[question.id] === question.answer).length;
}
