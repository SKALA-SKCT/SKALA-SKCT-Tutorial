import type { ExampleQuestion } from "./catalog";
import { EXAMPLE_QUESTION_BANK } from "./exampleQuestions";
import { PROBLEMS } from "./problems";
import { shuffled } from "../utils/array";

const categoryPrefix: Record<string, string> = {
  "verbal-comprehension": "vc-",
  "data-analysis": "da-",
  "creative-math": "cm-",
  "verbal-reasoning": "vr-",
  "sequence-reasoning": "sr-",
};

function balancedFromGroups(groups: ExampleQuestion[][], count: number): ExampleQuestion[] {
  const available = groups.filter((group) => group.length > 0).map(shuffled);
  if (available.length === 0) return [];
  const order = shuffled(available);

  return Array.from({ length: count }, (_, index) => {
    const group = order[index % order.length];
    return group[Math.floor(index / order.length) % group.length];
  });
}

export function questionsForTutorial(tutorialId: string, count = 20): ExampleQuestion[] {
  return shuffled(EXAMPLE_QUESTION_BANK.filter((question) => question.kindId === tutorialId)).slice(
    0,
    count,
  );
}

export function balancedCategoryQuestions(categoryId: string, count = 20): ExampleQuestion[] {
  const prefix = categoryPrefix[categoryId];
  const groups = PROBLEMS.filter((problem) => prefix && problem.id.startsWith(prefix)).map(
    (problem) => questionsForTutorial(problem.id, 20),
  );
  return shuffled(balancedFromGroups(groups, count));
}

export function balancedAllQuestions(count = 20): ExampleQuestion[] {
  const groups = Object.keys(categoryPrefix).map((categoryId) =>
    balancedCategoryQuestions(categoryId, 20),
  );
  return shuffled(balancedFromGroups(groups, count));
}
