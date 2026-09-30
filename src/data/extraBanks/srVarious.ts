import type { ExampleQuestion } from "../catalog";
import { defineQuestion, rotateChoices, sequenceVisual } from "../exampleBanks/bankUtils";
import {
  BLANK,
  type Candidate,
  assertClean,
  fraction,
  josa,
  nth,
  paren,
  pickDistractors,
  round,
  tidy,
} from "./srGeometric";

const CATEGORY = "sequence-reasoning";

/** "+3"은 3씩 더하기, "*-1/2"는 -1/2씩 곱하기. */
interface Rule {
  mode: "add" | "multiply";
  num: number;
  den: number;
}

function parseRule(text: string): Rule {
  const [num, den = "1"] = text.slice(1).split("/");
  return { mode: text[0] === "+" ? "add" : "multiply", num: Number(num), den: Number(den) };
}

const forward = (value: number, rule: Rule) =>
  round(rule.mode === "add" ? value + rule.num / rule.den : (value * rule.num) / rule.den);
const backward = (value: number, rule: Rule) =>
  round(rule.mode === "add" ? value - rule.num / rule.den : (value * rule.den) / rule.num);

function ruleText(rule: Rule) {
  if (rule.mode === "multiply") return `앞 항에 ${josa(fraction(rule.num, rule.den), "을를")} 곱하는`;
  const step = rule.num / rule.den;
  return step > 0 ? `${tidy(step)}씩 커지는` : `${tidy(-step)}씩 작아지는`;
}

function stepText(value: number, rule: Rule, direction: "forward" | "backward") {
  const step = rule.num / rule.den;
  if (rule.mode === "multiply")
    return `${tidy(value)} ${direction === "forward" ? "×" : "÷"} ${paren(fraction(rule.num, rule.den))}`;
  const add = direction === "forward" ? step : -step;
  return `${tidy(value)} ${add > 0 ? "+" : "-"} ${tidy(Math.abs(add))}`;
}

/** [홀수 번째 첫 항, 홀수 번째 규칙, 짝수 번째 첫 항, 짝수 번째 규칙, 항 개수, 빈칸 위치(0부터)] */
const splitSeeds: Array<[number, string, number, string, number, number]> = [
  [3, "+4", 10, "*2", 8, 7],
  [1, "*3", 50, "+-5", 8, 4],
  [20, "+-3", 2, "*3", 9, 8],
  [4, "+2.5", 7, "+-2", 8, 5],
  [64, "*1/2", 3, "+8", 8, 2],
  [5, "+6", 1, "*-2", 8, 6],
  [2, "*4", 30, "+7", 8, 3],
  [-6, "+5", 81, "*-1/3", 8, 7],
  [0.5, "*3", 20, "+-3", 9, 8],
  [11, "+11", 400, "*1/2", 8, 1],
  [7, "*2", 6, "+6", 8, 4],
  [30, "+-4", 1.5, "*2", 8, 7],
  [2, "+0.5", 9, "+3", 8, 6],
  [100, "+-15", 2, "*5", 8, 3],
  [-2, "*3", 4, "+-6", 8, 2],
  [8, "+8", 243, "*1/3", 9, 8],
  [1.2, "+1.2", 5, "*2", 8, 5],
  [3, "*-2", 15, "+5", 8, 6],
  [45, "+-9", 0.25, "*4", 8, 7],
  [6, "*1/2", 1, "+7", 8, 4],
  [17, "+-5", -1, "*3", 8, 3],
  [4, "*5", 60, "+-8", 8, 2],
  [9, "+2", 2, "*2", 8, 7],
  [1, "+3", 1000, "*1/10", 8, 5],
  [0.6, "+0.3", 7, "*2", 8, 6],
  [72, "*1/2", 5, "+4", 8, 0],
  [-10, "+4", 3, "*2", 9, 4],
  [5, "*2", 40, "+-6", 9, 8],
  [14, "+7", 2, "*-3", 8, 7],
  [3, "+-2", 16, "*1/2", 8, 3],
  [2, "*-3", 1, "+2", 8, 4],
  [25, "+10", 90, "+-20", 8, 6],
  [1.5, "*2", 12, "+1.5", 8, 5],
  [1, "+1", 3, "*3", 8, 7],
  [50, "+-7", 4, "+9", 8, 2],
  [128, "*-1/2", 6, "+5", 8, 6],
  [7, "+3", 0.5, "*4", 8, 3],
  [4, "*3/2", 18, "+-4", 8, 4],
  [-5, "+-5", 3, "*-2", 8, 7],
  [10, "*3", 8, "+-1.5", 8, 5],
  [33, "+-6", 1, "*5", 9, 8],
  [2, "+9", 256, "*1/4", 8, 3],
  [1, "*2", 2, "*3", 8, 6],
  [0.1, "*10", 50, "+-10", 8, 4],
  [8, "+-2.5", 6, "*2", 8, 2],
  [21, "+4", 64, "*3/4", 8, 7],
  [3, "*3", 1, "+-4", 8, 5],
  [12, "+12", 4, "*2", 8, 6],
  [2, "+-7", 9, "*2", 8, 3],
  [500, "*1/5", 3, "+3.5", 8, 4],
  [6, "+-1.5", 4, "*-2", 8, 7],
  [1, "*-4", 10, "+10", 8, 2],
  [15, "+-4", 2, "*5/2", 9, 8],
  [40, "*1/2", -3, "+4", 8, 1],
  [9, "*2", 100, "+-12", 8, 6],
  [2.2, "+1.1", 7, "*3", 8, 5],
  [4, "+-3", 5, "*-3", 8, 3],
  [3, "*4", 25, "+-5", 8, 4],
  [18, "+6", 1, "*6", 8, 7],
  [7, "*-2", 2, "+1.5", 8, 2],
];

const splitStems = [
  "홀수 번째 항과 짝수 번째 항이 각각 다른 규칙을 따를 때, 빈칸에 들어갈 수로 알맞은 것은?",
  "다음 수들이 일정한 규칙을 따를 때, 빈칸에 들어갈 수로 알맞은 것은?",
  "다음 수열에서 빈칸에 들어갈 수로 알맞은 것은?",
];

export const SR_VARIOUS_EXTRA: ExampleQuestion[] = splitSeeds.map(
  ([oddStart, oddRule, evenStart, evenRule, length, blank], i) => {
    const rules = [parseRule(oddRule), parseRule(evenRule)];
    const terms: number[] = [];
    for (let k = 0; k < length; k += 1)
      terms.push(k < 2 ? [oddStart, evenStart][k] : forward(terms[k - 2], rules[k % 2]));
    assertClean(terms, `sr-various-${21 + i}`);
    const answer = terms[blank];
    const visible = terms.filter((_, k) => k !== blank);
    const rule = rules[blank % 2];
    const other = rules[(blank + 1) % 2];
    const group = blank % 2 ? "짝수 번째" : "홀수 번째";
    const otherGroup = blank % 2 ? "홀수 번째" : "짝수 번째";
    const hasPrevious = blank >= 2;
    const anchor = hasPrevious ? terms[blank - 2] : terms[blank + 2];
    const direction = hasPrevious ? "forward" : "backward";
    const apply = (target: Rule) =>
      hasPrevious ? forward(anchor, target) : backward(anchor, target);
    const anchorText = `${nth(hasPrevious ? blank - 2 : blank + 2)} 항`;
    const first = `홀수 번째 항은 ${ruleText(rules[0])} 수열이고, 짝수 번째 항은 ${ruleText(rules[1])} 수열입니다.`;
    const body = hasPrevious
      ? `빈칸은 ${nth(blank)} 항이므로 ${anchorText}에서 ${group} 항의 규칙을 한 번 적용해 ${stepText(anchor, rule, direction)} = ${tidy(answer)}입니다.`
      : `빈칸은 ${nth(blank)} 항이므로 ${anchorText}에서 ${group} 항의 규칙을 거꾸로 적용해 ${stepText(anchor, rule, direction)} = ${tidy(answer)}입니다.`;
    const adjacent =
      blank >= 2 ? 2 * terms[blank - 1] - terms[blank - 2] : 2 * terms[blank + 1] - terms[blank + 2];
    const candidates: Candidate[] = [
      { value: apply(other), reason: `${otherGroup} 항의 규칙을 잘못 적용한 값` },
      { value: adjacent, reason: "홀짝을 나누지 않고 이웃한 두 항의 차이를 이어 쓴 값" },
      { value: -answer, reason: "부호를 반대로 잡은 값" },
    ];
    if (i % 2) candidates.reverse();
    const { distractors, mention } = pickDistractors(
      answer,
      candidates,
      visible,
      `${group} 항의 규칙과 맞지 않는 값`,
      i + 1,
    );
    return defineQuestion(CATEGORY, "sr-various-1", "여러 가지 수열 (홀짝 분리)", 20 + i, {
      stem: splitStems[i % splitStems.length],
      visuals: sequenceVisual(
        `sr-various-${21 + i}`,
        terms.map((value, k) => (k === blank ? BLANK : tidy(value))),
      ),
      ...rotateChoices(tidy(answer), distractors, i + 1),
      explanation: `${first} ${body} ${mention}`,
    });
  },
);
