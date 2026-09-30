import type { ExampleQuestion } from "../catalog";
import { defineQuestion, rotateChoices, sequenceVisual } from "../exampleBanks/bankUtils";
import {
  BLANK,
  type Candidate,
  assertClean,
  josa,
  nth,
  pickDistractors,
  round,
  signed,
  tidy,
} from "./srGeometric";

const CATEGORY = "sequence-reasoning";

const opText = (value: number, change: number) =>
  `${tidy(value)} ${change > 0 ? "+" : "-"} ${tidy(Math.abs(change))}`;

/** [첫째 항, 반복되는 차이, 항 개수, 빈칸 위치(0부터)] */
const repeatSeeds: Array<[number, number[], number, number]> = [
  [5, [3, -1], 7, 6],
  [20, [-4, 7], 7, 3],
  [1, [2, 3, -4], 7, 6],
  [12, [5, -2, -2], 8, 4],
  [40, [-6, 4], 7, 1],
  [0.5, [1.5, -0.5], 7, 5],
  [-9, [6, -3, 1], 7, 2],
  [33, [-5, -5, 8], 8, 7],
  [7, [4, -6, 3], 7, 4],
  [2.4, [0.6, -0.2], 7, 6],
  [60, [-12, 5, 3], 7, 3],
  [-6, [7, -2], 7, 2],
  [16, [3, 3, -7], 8, 5],
  [90, [-15, 10], 7, 6],
  [2, [1, 4, -2, -1], 9, 8],
  [0.8, [0.4, 0.4, -0.6], 7, 4],
  [25, [-3, -4, 9], 7, 1],
  [11, [8, -5], 7, 4],
  [-4, [2, -5, 6], 7, 6],
  [150, [-30, 20], 7, 3],
  [6, [-2, 5, -1], 8, 7],
  [1.5, [2.5, -1], 7, 2],
  [48, [-7, 3, -1], 7, 5],
  [9, [6, -4, 2, -3], 9, 5],
  [2, [9, -4], 7, 6],
  [70, [-8, -8, 5], 7, 3],
  [5, [3, -7, 5], 8, 6],
  [-13, [5, 1], 7, 5],
  [3.5, [1.5, -2.5, 2], 7, 6],
  [28, [4, -9, 2], 7, 2],
  [100, [-17, 6], 7, 4],
  [13, [2, 2, -5], 8, 7],
  [-21, [12, -4], 7, 6],
  [5, [10, -3, -4], 7, 4],
  [36, [-9, 4, 4], 7, 1],
  [0.2, [0.3, 0.5, -0.1], 7, 6],
  [8, [-5, 9, -2, 1], 9, 7],
  [55, [-6, 2], 7, 3],
  [17, [6, -8, 3], 7, 5],
  [2, [4, -1, -1], 7, 6],
  [80, [-20, 15, -5], 7, 2],
  [6.5, [-2, 3.5], 7, 6],
  [-15, [9, -2, 4], 7, 4],
  [14, [-3, 8], 7, 5],
  [1, [5, 5, -3], 8, 7],
  [45, [4, -11], 7, 2],
  [10, [1, 2, 3, -5], 9, 8],
  [24, [-4, 6, -1], 7, 3],
  [2, [3, -8, 6], 7, 6],
  [75, [-10, 4], 7, 2],
  [19, [7, -3, -3], 7, 5],
  [1.8, [1.2, -0.3], 7, 4],
  [-7, [3, 6, -4], 7, 0],
  [32, [-9, 5], 7, 6],
  [4, [11, -6, 2], 8, 7],
  [66, [-7, -7, 10], 7, 4],
  [3, [8, -2, -5, 4], 9, 4],
  [12.5, [-2.5, 4], 7, 6],
  [9, [-4, 1, 7], 7, 3],
  [41, [5, -12], 7, 5],
];

const repeatStems = [
  "항 사이의 차이가 같은 순서로 반복될 때, 빈칸에 들어갈 수로 알맞은 것은?",
  "다음 수들이 일정한 규칙을 따를 때, 빈칸에 들어갈 수로 알맞은 것은?",
  "다음 수열의 규칙을 찾아 빈칸에 들어갈 수를 고르면?",
];

export const SR_SPECIAL_EXTRA: ExampleQuestion[] = repeatSeeds.map(
  ([start, changes, length, blank], i) => {
    const period = changes.length;
    const terms = [start];
    for (let k = 1; k < length; k += 1) terms.push(round(terms[k - 1] + changes[(k - 1) % period]));
    assertClean(terms, `sr-special-${21 + i}`);
    const answer = terms[blank];
    const visible = terms.filter((_, k) => k !== blank);
    const first = `항 사이의 차이는 ${josa(changes.map(signed).join(", "), "이가")} 순서대로 반복됩니다.`;
    let body: string;
    let base: number;
    let used: number;
    if (blank === 0) {
      used = changes[0];
      base = terms[1];
      body = `첫 번째 항은 두 번째 항에서 첫 차이 ${josa(signed(used), "을를")} 되돌린 값이므로 ${opText(base, -used)} = ${tidy(answer)}입니다.`;
    } else {
      used = changes[(blank - 1) % period];
      base = terms[blank - 1];
      body = `빈칸 앞의 차이는 ${signed(used)}이므로 빈칸은 ${opText(base, used)} = ${tidy(answer)}입니다.`;
      if (blank < length - 1)
        body += ` 이어서 ${josa(signed(changes[blank % period]), "을를")} 더하면 ${nth(blank + 1)} 항 ${josa(tidy(terms[blank + 1]), "이가")} 되어 반복 규칙과 맞습니다.`;
    }
    const direction = blank === 0 ? -1 : 1;
    const candidates: Candidate[] = [
      ...changes
        .filter((change) => change !== used)
        .map((change) => ({
          value: round(base + direction * change),
          reason: `반복 순서에서 다른 차이 ${josa(signed(change), "을를")} 적용한 값`,
        })),
      { value: round(base - direction * used), reason: "차이의 부호를 반대로 적용한 값" },
    ];
    if (i % 2) candidates.reverse();
    const { distractors, mention } = pickDistractors(
      answer,
      candidates,
      visible,
      "반복되는 차이와 맞지 않는 값",
      i + 2,
    );
    return defineQuestion(CATEGORY, "sr-special-1", "특수 규칙 수열 (반복 차이)", 20 + i, {
      stem: repeatStems[i % repeatStems.length],
      visuals: sequenceVisual(
        `sr-special-${21 + i}`,
        terms.map((value, k) => (k === blank ? BLANK : tidy(value))),
      ),
      ...rotateChoices(tidy(answer), distractors, i + 2),
      explanation: `${first} ${body} ${mention}`,
    });
  },
);
