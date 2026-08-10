import type { ExampleQuestion } from "../catalog";
import type { ProblemVisual } from "../../types";

const categoryNames: Record<string, string> = {
  "verbal-comprehension": "언어이해",
  "data-analysis": "자료해석",
  "creative-math": "창의수리",
  "verbal-reasoning": "언어추리",
  "sequence-reasoning": "수열추리",
};

const kindNames: Record<string, string> = {
  "vc-main-idea-1": "글의 주제 찾기",
  "vc-blank-1": "빈칸에 들어갈 내용 추론",
  "vc-insertion-1": "문장 삽입 위치 찾기",
  "vc-content-match-1": "내용과 일치하지 않는 것 찾기",
  "vc-paragraph-order-1": "문단 순서 배열",
  "vc-inference-1": "이해와 추론상 적절하지 않은 것 찾기",
  "vc-critique-1": "주장에 대한 반박 고르기",
  "da-reading-1": "표에서 옳지 않은 설명 찾기",
  "da-calc-1": "표에서 옳지 않은 설명 찾기 (계산)",
  "cm-concentration-1": "농도(소금물 혼합) 계산",
  "cm-arithmetic-1": "증감 연립방정식",
  "cm-cost-1": "원가 구하기",
  "cm-probability-1": "‘적어도 하나’ 확률 (여사건)",
  "cm-dst-1": "거리, 속력, 시간 (거리 동일)",
  "cm-work-1": "협력 작업 일률",
  "vr-proposition-1": "명제와 삼단논법 추리",
  "vr-condition-1": "조건추리 (순서 배치)",
  "vr-truth-1": "진실게임 (참과 거짓)",
  "sr-arithgeo-1": "등비수열 (일정한 비)",
  "sr-various-1": "여러 가지 수열 (홀짝 분리)",
  "sr-special-1": "특수 규칙 수열 (반복 차이)",
};

export interface QuestionDraft {
  stem: string;
  passage?: string;
  passageLabel?: string;
  box?: string;
  visuals?: ProblemVisual[];
  choices: string[];
  answer: number;
  explanation: string;
}

export function defineQuestion(
  categoryId: string,
  kindId: string,
  kindName: string,
  index: number,
  draft: QuestionDraft,
): ExampleQuestion {
  return {
    id: `example-${kindId}-${String(index + 1).padStart(2, "0")}`,
    categoryId,
    kindId,
    typeLabel: `${categoryNames[categoryId]} / ${kindNames[kindId] ?? kindName}`,
    passage: "",
    ...draft,
  };
}

export function rotateChoices(
  correct: string,
  distractors: string[],
  seed: number,
): Pick<QuestionDraft, "choices" | "answer"> {
  const unique = [correct, ...distractors.filter((item) => item !== correct)].filter(
    (item, index, items) => items.indexOf(item) === index,
  );
  if (unique.length < 5 && /^\d+\/\d+$/.test(correct)) {
    for (const candidate of ["1/2", "1/3", "2/3", "1/4", "3/4", "2/5", "3/5", "4/5"]) {
      if (!unique.includes(candidate)) unique.push(candidate);
      if (unique.length === 5) break;
    }
  }
  if (unique.length < 5 && /^-?\d+(?:\.\d+)?$/.test(correct)) {
    const value = Number(correct);
    for (const delta of [1, -1, 2, -2, 3, -3, 5, -5, 10, -10]) {
      const candidate = String(Number((value + delta).toFixed(4)));
      if (!unique.includes(candidate)) unique.push(candidate);
      if (unique.length === 5) break;
    }
  }
  if (unique.length < 5) throw new Error(`선지 후보 부족: ${correct} / ${unique.join(", ")}`);
  const base = unique.slice(0, 5);
  const shift = seed % 5;
  const choices = [...base.slice(shift), ...base.slice(0, shift)];
  return { choices, answer: choices.indexOf(correct) };
}

export function sequenceVisual(id: string, values: Array<string | number>): ProblemVisual[] {
  return [
    {
      type: "sequence",
      id: `${id}-visual`,
      title: "수열",
      items: values.map((value, index) => ({
        id: `${id}-item-${index + 1}`,
        value: String(value),
      })),
    },
  ];
}

export function tableVisual(
  id: string,
  title: string,
  columns: string[],
  rows: Array<{ label: string; cells: Array<string | number> }>,
  unit?: string,
): ProblemVisual[] {
  return [
    {
      type: "table",
      id: `${id}-visual`,
      title,
      unit,
      columns,
      rows: rows.map((row, index) => ({ id: `${id}-row-${index + 1}`, ...row })),
    },
  ];
}
