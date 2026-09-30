import type { ExampleQuestion } from "../catalog";
import { defineQuestion, rotateChoices, sequenceVisual } from "../exampleBanks/bankUtils";

const CATEGORY = "sequence-reasoning";
export const BLANK = "(   )";

export function tidy(value: number) {
  return String(Number(value.toFixed(4)));
}

/** 항과 선지는 실전처럼 정수나 소수 두 자리 이내 값만 쓴다. */
export function isClean(value: number) {
  return Number.isFinite(value) && Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;
}

/** 곱셈과 나눗셈을 거친 값의 부동소수점 오차를 지운다. */
export function round(value: number) {
  return Number(value.toFixed(6));
}

/**
 * 숫자는 읽는 소리의 끝 글자로 조사를 고른다 (3 삼, 10 십, 2 이).
 * 분수 3/4는 사분의 삼으로 읽으므로 분자를 기준으로 삼는다.
 */
export function josa(text: string, pair: "은는" | "이가" | "을를" | "과와" | "으로") {
  const spoken = text.includes("/") ? text.split("/")[0] : text;
  const last = spoken.replace(/[^0-9가-힣]/g, "").slice(-1);
  let batchim = false;
  let rieul = false;
  if (/\d/.test(last)) {
    batchim = "013678".includes(last);
    rieul = "178".includes(last);
  } else if (last) {
    const jong = (last.charCodeAt(0) - 0xac00) % 28;
    batchim = jong > 0;
    rieul = jong === 8;
  }
  if (pair === "으로") return text + (batchim && !rieul ? "으로" : "로");
  return text + (batchim ? pair[0] : pair[1]);
}

const ORDINALS = ["첫", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열"];
export const nth = (index: number) => `${ORDINALS[index]} 번째`;

/** 음수와 분수는 식 안에서 괄호로 감싼다. */
export const paren = (text: string) => (/^-|\//.test(text) ? `(${text})` : text);
export const signed = (value: number) => (value > 0 ? `+${tidy(value)}` : tidy(value));

export function fraction(numerator: number, denominator: number) {
  const sign = numerator * denominator < 0 ? "-" : "";
  const n = Math.abs(numerator);
  const d = Math.abs(denominator);
  return d === 1 ? `${sign}${n}` : `${sign}${n}/${d}`;
}

export interface Candidate {
  value: number;
  reason: string;
}

/** 오답이 정답과 비슷한 크기에 머물도록 자릿수에 맞춘 간격을 잡는다. */
function nearStep(value: number) {
  const size = Math.abs(value);
  const step = size >= 1 ? 10 ** (Math.floor(Math.log10(size)) - 1) : 0.1;
  return Number.isInteger(value) ? Math.max(1, step) : Math.max(0.01, step);
}

/**
 * 풀이 실수에서 나오는 값을 먼저 쓰고, 모자라면 정답 근처 값으로 채운다.
 * 화면에 이미 보이는 항은 오답으로 쓰지 않는다.
 */
export function pickDistractors(
  answer: number,
  candidates: Candidate[],
  visible: number[],
  nearReason: string,
  seed: number,
) {
  const step = nearStep(answer);
  const pool = [
    ...candidates,
    ...[1, -1, 2, -2, 3, -3, 4, -4, 5, -5].map((k) => ({ value: answer + k * step, reason: nearReason })),
  ];
  // 모든 항의 부호가 같으면 부호가 다른 값은 풀지 않고도 지워지므로 오답으로 쓰지 않는다.
  const sameSign = visible.every((value) => Math.sign(value) === Math.sign(answer));
  const picked: Candidate[] = [];
  for (const candidate of pool) {
    const value = round(candidate.value);
    if (!isClean(value) || value === 0 || value === answer || visible.includes(value)) continue;
    if (sameSign && Math.sign(value) !== Math.sign(answer)) continue;
    if (picked.some((item) => item.value === value)) continue;
    picked.push({ value, reason: candidate.reason });
    if (picked.length === 4) break;
  }
  if (picked.length < 4) throw new Error(`오답 후보 부족: ${answer}`);
  const [a, b] = picked;
  const mention =
    a.reason === b.reason
      ? `${josa(tidy(a.value), "과와")} ${josa(tidy(b.value), "은는")} 모두 ${a.reason}`
      : `${josa(tidy(a.value), "은는")} ${a.reason}이고, ${josa(tidy(b.value), "은는")} ${b.reason}`;
  const shift = seed % 4;
  const ordered = [...picked.slice(shift), ...picked.slice(0, shift)];
  return { distractors: ordered.map((item) => tidy(item.value)), mention: `${mention}입니다.` };
}

export function assertClean(values: number[], label: string) {
  for (const value of values)
    if (!isClean(value) || value === 0) throw new Error(`${label}: 깔끔하지 않은 항 ${value}`);
}

/** [첫째 항, 비의 분자, 비의 분모, 항 개수, 빈칸 위치(0부터)] */
const geometricSeeds: Array<[number, number, number, number, number]> = [
  [4, 3, 1, 6, 5],
  [7, 2, 1, 7, 3],
  [486, 2, 3, 6, 4],
  [5, -2, 1, 6, 2],
  [2400, 1, 2, 6, 5],
  [16, 3, 2, 6, 3],
  [3, 4, 1, 6, 1],
  [1, -3, 1, 7, 6],
  [4860, 1, 3, 6, 2],
  [0.3, 2, 1, 6, 4],
  [7, 3, 1, 6, 3],
  [2.5, -2, 1, 6, 5],
  [1875, 1, 5, 6, 4],
  [243, -2, 3, 6, 3],
  [9, 2, 1, 7, 6],
  [-3, 2, 1, 6, 2],
  [4000, -1, 2, 6, 4],
  [11, 3, 1, 6, 5],
  [0.2, 5, 1, 6, 3],
  [32, 5, 2, 6, 5],
  [1, 6, 1, 6, 4],
  [5, 4, 1, 6, 2],
  [1536, 1, 4, 6, 1],
  [-7, -2, 1, 6, 5],
  [13, 2, 1, 7, 4],
  [256, 3, 4, 6, 4],
  [0.7, 3, 1, 6, 5],
  [2187, 1, 3, 6, 3],
  [8, -3, 1, 6, 4],
  [32, 3, 2, 6, 2],
  [3, 5, 1, 6, 4],
  [10, -3, 1, 6, 1],
  [6400, 1, 4, 6, 5],
  [0.5, -4, 1, 6, 3],
  [1.1, 2, 1, 6, 4],
  [1458, -1, 3, 6, 2],
  [20, 2, 1, 6, 0],
  [-1, 4, 1, 6, 4],
  [250, 2, 5, 6, 3],
  [243, 4, 3, 6, 5],
  [15, -2, 1, 7, 5],
  [5120, 1, 2, 7, 1],
  [1.5, 3, 1, 6, 3],
  [400, -1, 2, 6, 2],
  [2, -4, 1, 6, 4],
  [0.8, 5, 1, 6, 1],
  [176, 1, 2, 6, 3],
  [50, 3, 1, 6, 5],
  [8, 5, 2, 6, 2],
  [-5, 3, 1, 6, 3],
  [3000, 1, 5, 6, 4],
  [1, -5, 1, 6, 5],
  [1215, 2, 3, 6, 1],
  [0.25, -2, 1, 7, 6],
  [14, 3, 1, 6, 2],
  [625, -2, 5, 6, 4],
  [1944, 1, 3, 6, 3],
  [18, -2, 1, 6, 0],
  [0.1, -3, 1, 6, 5],
  [40, 3, 2, 6, 4],
];

const geometricStems = [
  "다음 등비수열의 빈칸에 들어갈 수로 알맞은 것은?",
  "다음 수열이 일정한 비로 변하는 등비수열일 때, 빈칸에 들어갈 수로 알맞은 것은?",
  "다음 수들이 일정한 규칙을 따를 때, 빈칸에 들어갈 수로 알맞은 것은?",
];

export const SR_GEOMETRIC_EXTRA: ExampleQuestion[] = geometricSeeds.map(
  ([start, num, den, length, blank], i) => {
    const terms = [start];
    for (let k = 1; k < length; k += 1) terms.push(round((terms[k - 1] * num) / den));
    assertClean(terms, `sr-arithgeo-${21 + i}`);
    const answer = terms[blank];
    const visible = terms.filter((_, k) => k !== blank);
    const ratio = fraction(num, den);
    const pairAt = blank >= 2 ? 0 : blank + 1;
    const first = `이웃한 두 항 ${tidy(terms[pairAt])}, ${tidy(terms[pairAt + 1])}에서 뒤 항이 앞 항의 ${ratio}배이므로 각 항에 ${josa(ratio, "을를")} 곱하는 등비수열입니다.`;
    let body: string;
    if (blank === 0) {
      body = `첫 번째 항은 두 번째 항 ${josa(tidy(terms[1]), "을를")} ${josa(ratio, "으로")} 나눈 값이므로 ${tidy(terms[1])} ÷ ${paren(ratio)} = ${tidy(answer)}입니다.`;
    } else {
      body = `빈칸은 ${nth(blank - 1)} 항에 ${josa(ratio, "을를")} 곱한 값이므로 ${tidy(terms[blank - 1])} × ${paren(ratio)} = ${tidy(answer)}입니다.`;
      if (blank < length - 1)
        body += ` 여기에 다시 ${josa(ratio, "을를")} 곱하면 ${nth(blank + 1)} 항 ${josa(tidy(terms[blank + 1]), "이가")} 되어 규칙이 맞습니다.`;
    }
    const middle = blank > 0 && blank < length - 1;
    const arithmetic = middle
      ? (terms[blank - 1] + terms[blank + 1]) / 2
      : blank === 0
        ? 2 * terms[1] - terms[2]
        : 2 * terms[blank - 1] - terms[blank - 2];
    const candidates: Candidate[] = [
      {
        value: arithmetic,
        reason: middle
          ? "앞뒤 두 항의 가운데 값으로 계산해 등차수열로 잘못 본 값"
          : "이웃한 두 항의 차이가 일정한 등차수열로 잘못 본 값",
      },
      { value: -answer, reason: "부호를 반대로 잡은 값" },
      { value: round((answer * num) / den), reason: "비를 한 번 더 곱해 한 칸 뒤의 항을 구한 값" },
    ];
    if (i % 2) candidates.reverse();
    const { distractors, mention } = pickDistractors(
      answer,
      candidates,
      visible,
      `앞뒤 항과 ${ratio}배 관계가 성립하지 않는 값`,
      i,
    );
    return defineQuestion(CATEGORY, "sr-arithgeo-1", "등비수열 (일정한 비)", 20 + i, {
      stem: geometricStems[i % geometricStems.length],
      visuals: sequenceVisual(
        `sr-arithgeo-${21 + i}`,
        terms.map((value, k) => (k === blank ? BLANK : tidy(value))),
      ),
      ...rotateChoices(tidy(answer), distractors, i),
      explanation: `${first} ${body} ${mention}`,
    });
  },
);
