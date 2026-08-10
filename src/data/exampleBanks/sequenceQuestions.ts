import type { ExampleQuestion } from "../catalog";
import { defineQuestion, rotateChoices, sequenceVisual } from "./bankUtils";

const CATEGORY = "sequence-reasoning";

function tidy(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
}

/**
 * 실제 시험의 수열은 항과 선지가 모두 딱 떨어지는 값으로 제시된다.
 * 소수점 세 자리를 넘는 값은 반올림해 적을 수밖에 없어 정답이 근삿값이 되므로 화면에 올리지 않는다.
 */
function isClean(value: number) {
  return Number.isFinite(value) && Math.abs(value * 1000 - Math.round(value * 1000)) < 1e-9;
}

/** 1/3처럼 소수로 적으면 근삿값이 되는 비는 분수로 읽어 준다. */
function ratioText(ratio: number) {
  if (Number.isInteger(ratio)) return String(ratio);
  const sign = ratio < 0 ? "-" : "";
  const denominator = Math.round(1 / Math.abs(ratio));
  if (Math.abs(Math.abs(ratio) - 1 / denominator) < 1e-9) return `${sign}1/${denominator}`;
  return tidy(ratio);
}

/** 정답과 자릿수 감각이 비슷하면서도 값이 겹치지 않는 오답 네 개를 고른다. */
function numericDistractors(answer: number, previous: number, ratio: number) {
  const candidates = [
    previous,
    answer + previous,
    answer - previous,
    answer * ratio,
    answer * 2,
    -answer,
    answer / 2,
  ];
  const picked: number[] = [];
  for (const candidate of candidates) {
    if (!isClean(candidate)) continue;
    if (candidate === answer || picked.includes(candidate)) continue;
    picked.push(candidate);
    if (picked.length === 4) break;
  }
  if (picked.length < 4) throw new Error(`오답 후보 부족: ${answer}`);
  return picked.map(tidy);
}

/**
 * 여섯 항이 모두 정수이거나 소수 두 자리 이내가 되도록 첫 항과 비를 잡았다.
 * 45.5625, 0.1024처럼 실제 시험에 나오지 않는 값이 화면에 뜨지 않게 하기 위해서다.
 */
const geometricSeeds = [
  [3, 2],
  [5, 3],
  [128, 0.5],
  [2, -2],
  [1.5, 2],
  [729, 1 / 3],
  [-4, -3],
  [0.25, 4],
  [7, -2],
  [1024, 0.25],
  [96, 0.5],
  [1250, 0.2],
  [-2, 4],
  [64, 2.5],
  [243, -1 / 3],
  [2, 5],
  [1.2, 3],
  [625, 0.2],
  [-1.5, -2],
  [0.5, 2],
] as const;

export const ARITHMETIC_GEOMETRIC_QUESTIONS: ExampleQuestion[] = geometricSeeds.map(
  ([start, ratio], index) => {
    const values: number[] = [start];
    for (let i = 1; i < 6; i += 1) values.push(Number((values[i - 1] * ratio).toFixed(6)));
    const answer = values[5];
    const previous = values[4];
    return defineQuestion(CATEGORY, "sr-arithgeo-1", "등비수열 (일정한 비)", index, {
      stem: "다음 등비수열의 빈칸에 들어갈 수로 알맞은 것은?",
      visuals: sequenceVisual(`sr-arithgeo-${index + 1}`, [
        ...values.slice(0, 5).map(tidy),
        "(   )",
      ]),
      ...rotateChoices(tidy(answer), numericDistractors(answer, previous, ratio), index),
      explanation: `각 항은 바로 앞 항의 ${ratioText(ratio)}배인 등비수열입니다. 따라서 빈칸의 값은 ${tidy(previous)}의 ${ratioText(ratio)}배인 ${tidy(answer)}입니다.`,
    });
  },
);

interface SplitSeed {
  oddStart: number;
  oddChange: number;
  oddMode: "add" | "multiply";
  evenStart: number;
  evenChange: number;
  evenMode: "add" | "multiply";
  target: 7 | 8;
}

const splitSeeds: SplitSeed[] = [
  {
    oddStart: 2,
    oddChange: 3,
    oddMode: "add",
    evenStart: 20,
    evenChange: -4,
    evenMode: "add",
    target: 7,
  },
  {
    oddStart: 3,
    oddChange: 2,
    oddMode: "multiply",
    evenStart: 5,
    evenChange: 5,
    evenMode: "add",
    target: 8,
  },
  {
    oddStart: 81,
    oddChange: 1 / 3,
    oddMode: "multiply",
    evenStart: 4,
    evenChange: 6,
    evenMode: "add",
    target: 7,
  },
  {
    oddStart: 7,
    oddChange: 7,
    oddMode: "add",
    evenStart: 96,
    evenChange: 0.5,
    evenMode: "multiply",
    target: 8,
  },
  {
    oddStart: 1.5,
    oddChange: 1.5,
    oddMode: "add",
    evenStart: 2,
    evenChange: 3,
    evenMode: "multiply",
    target: 7,
  },
  {
    oddStart: -4,
    oddChange: 5,
    oddMode: "add",
    evenStart: 64,
    evenChange: 0.5,
    evenMode: "multiply",
    target: 8,
  },
  {
    oddStart: 5,
    oddChange: -2,
    oddMode: "multiply",
    evenStart: 11,
    evenChange: 4,
    evenMode: "add",
    target: 7,
  },
  {
    oddStart: 200,
    oddChange: -25,
    oddMode: "add",
    evenStart: 0.5,
    evenChange: 2,
    evenMode: "multiply",
    target: 8,
  },
  {
    oddStart: 6,
    oddChange: 4,
    oddMode: "add",
    evenStart: 3,
    evenChange: -3,
    evenMode: "multiply",
    target: 7,
  },
  {
    oddStart: 2.5,
    oddChange: 2,
    oddMode: "multiply",
    evenStart: 30,
    evenChange: -6,
    evenMode: "add",
    target: 8,
  },
  {
    oddStart: 100,
    oddChange: 0.5,
    oddMode: "multiply",
    evenStart: -8,
    evenChange: 7,
    evenMode: "add",
    target: 7,
  },
  {
    oddStart: 9,
    oddChange: 9,
    oddMode: "add",
    evenStart: 1,
    evenChange: 4,
    evenMode: "multiply",
    target: 8,
  },
  {
    oddStart: -3,
    oddChange: -2,
    oddMode: "multiply",
    evenStart: 50,
    evenChange: -8,
    evenMode: "add",
    target: 7,
  },
  {
    oddStart: 0.2,
    oddChange: 5,
    oddMode: "multiply",
    evenStart: 15,
    evenChange: 2.5,
    evenMode: "add",
    target: 8,
  },
  {
    oddStart: 13,
    oddChange: -3,
    oddMode: "add",
    evenStart: 128,
    evenChange: 0.25,
    evenMode: "multiply",
    target: 7,
  },
  {
    oddStart: 4,
    oddChange: 3,
    oddMode: "multiply",
    evenStart: 70,
    evenChange: -10,
    evenMode: "add",
    target: 8,
  },
  {
    oddStart: 1.25,
    oddChange: 1.25,
    oddMode: "add",
    evenStart: 8,
    evenChange: 2,
    evenMode: "multiply",
    target: 7,
  },
  {
    oddStart: 243,
    oddChange: 1 / 3,
    oddMode: "multiply",
    evenStart: -5,
    evenChange: 6,
    evenMode: "add",
    target: 8,
  },
  {
    oddStart: 10,
    oddChange: -4,
    oddMode: "add",
    evenStart: 2,
    evenChange: -2,
    evenMode: "multiply",
    target: 7,
  },
  {
    oddStart: 0.4,
    oddChange: 2.5,
    oddMode: "multiply",
    evenStart: 40,
    evenChange: -7,
    evenMode: "add",
    target: 8,
  },
];

function advance(value: number, mode: "add" | "multiply", change: number) {
  return mode === "add" ? value + change : value * change;
}

export const VARIOUS_SEQUENCE_QUESTIONS: ExampleQuestion[] = splitSeeds.map((seed, index) => {
  const odd = [seed.oddStart];
  const even = [seed.evenStart];
  for (let i = 1; i < 4; i += 1) {
    odd.push(advance(odd[i - 1], seed.oddMode, seed.oddChange));
    even.push(advance(even[i - 1], seed.evenMode, seed.evenChange));
  }
  const terms = [odd[0], even[0], odd[1], even[1], odd[2], even[2], odd[3], even[3]];
  const answer = terms[seed.target - 1];
  const shown = terms.slice(0, seed.target - 1).map(tidy);
  const targetGroup = seed.target % 2 ? "홀수 번째" : "짝수 번째";
  const mode = seed.target % 2 ? seed.oddMode : seed.evenMode;
  const change = seed.target % 2 ? seed.oddChange : seed.evenChange;
  return defineQuestion(CATEGORY, "sr-various-1", "여러 가지 수열 (홀짝 분리)", index, {
    stem: "홀수 번째 항과 짝수 번째 항이 서로 다른 규칙을 따를 때 빈칸의 값은?",
    visuals: sequenceVisual(`sr-various-${index + 1}`, [...shown, "(   )"]),
    ...rotateChoices(
      tidy(answer),
      [
        answer + 1,
        answer - 1,
        answer + (mode === "add" ? Math.abs(change) : Math.abs(answer) / 2),
        answer - (mode === "add" ? Math.abs(change) : Math.abs(answer) / 2),
      ]
        .filter(isClean)
        .map(tidy),
      index + 1,
    ),
    explanation: `${targetGroup} 항만 분리하면 ${mode === "add" ? `앞 항에 ${tidy(change)}만큼 더하는` : `앞 항의 ${ratioText(change)}배가 되는`} 규칙입니다. 이를 이어 적용하면 ${tidy(answer)}입니다.`,
  });
});

const repeatedDifferenceSeeds = [
  { start: 8.5, changes: [-3, 0.5] },
  { start: 4, changes: [6, -2] },
  { start: 30, changes: [-5, 2, 1] },
  { start: -2, changes: [4, 4, -3] },
  { start: 100, changes: [-10, 3] },
  { start: 1.2, changes: [0.8, 1.6, -0.4] },
  { start: 45, changes: [-7, -2, 5] },
  { start: 3, changes: [2, 5] },
  { start: 64, changes: [-8, 1, 1] },
  { start: -10, changes: [3, 7, -2] },
  { start: 5.5, changes: [-1.5, 2.5] },
  { start: 200, changes: [-20, -5, 10] },
  { start: 0.25, changes: [0.5, -0.25, 1] },
  { start: 18, changes: [4, -9] },
  { start: 72, changes: [-6, -6, 2] },
  { start: -1, changes: [8, -3, -3] },
  { start: 9.9, changes: [-0.9, 0.3] },
  { start: 50, changes: [5, -12, 4] },
  { start: 2, changes: [3, 3, 6] },
  { start: 125, changes: [-25, 10] },
] as const;

export const SPECIAL_SEQUENCE_QUESTIONS: ExampleQuestion[] = repeatedDifferenceSeeds.map(
  ({ start, changes }, index) => {
    const values: number[] = [start];
    for (let i = 0; i < 6; i += 1) values.push(values[i] + changes[i % changes.length]);
    const answer = values[6];
    const nextChange = changes[5 % changes.length];
    return defineQuestion(CATEGORY, "sr-special-1", "특수 규칙 수열 (반복 차이)", index, {
      stem: "항 사이의 차이가 일정한 주기로 반복될 때 빈칸에 들어갈 값은?",
      visuals: sequenceVisual(`sr-special-${index + 1}`, [
        ...values.slice(0, 6).map(tidy),
        "(   )",
      ]),
      ...rotateChoices(
        tidy(answer),
        [answer + 1, answer - 1, answer + Math.abs(nextChange), answer - Math.abs(nextChange)].map(
          tidy,
        ),
        index + 2,
      ),
      explanation: `항 사이의 차이는 ${changes.map(tidy).join(", ")} 순서로 반복됩니다. 다음 차이는 ${tidy(nextChange)}입니다. 이를 적용하면 ${tidy(answer)}입니다.`,
    });
  },
);

export const SEQUENCE_EXAMPLE_QUESTIONS = [
  ...ARITHMETIC_GEOMETRIC_QUESTIONS,
  ...VARIOUS_SEQUENCE_QUESTIONS,
  ...SPECIAL_SEQUENCE_QUESTIONS,
];
