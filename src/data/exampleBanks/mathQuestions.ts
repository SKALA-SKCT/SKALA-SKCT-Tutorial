import type { ExampleQuestion } from "../catalog";
import { defineQuestion, rotateChoices } from "./bankUtils";

const CATEGORY = "creative-math";

function hasFinalConsonant(value: string) {
  const code = value.charCodeAt(value.length - 1);
  return code >= 0xac00 && code <= 0xd7a3 ? (code - 0xac00) % 28 !== 0 : false;
}

function withJosa(value: string, consonant: string, vowel: string) {
  return `${value}${hasFinalConsonant(value) ? consonant : vowel}`;
}

const asTopic = (value: string) => withJosa(value, "은", "는");
const asSubject = (value: string) => withJosa(value, "이", "가");
const asObject = (value: string) => withJosa(value, "을", "를");
const togetherWith = (value: string) => withJosa(value, "과", "와");
const asMeans = (value: string) => withJosa(value, "으로", "로");

function numberText(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function numericChoice(correct: number, unit: string, seed: number, gap?: number) {
  const step = gap ?? Math.max(1, Math.round(Math.abs(correct) * 0.1));
  // 금액, 인원, 시간처럼 음수가 나올 수 없는 값에 0 이하 선지가 섞이면 계산하지 않고도 지울 수 있다.
  const offsets = correct > 0 && correct - step * 2 <= 0 ? [-1, 1, 2, 3] : [-2, -1, 1, 2];
  return rotateChoices(
    `${numberText(correct)}${unit}`,
    offsets.map((offset) => `${numberText(correct + step * offset)}${unit}`),
    seed,
  );
}

/**
 * 실제 시험의 농도 문제는 답이 정수로 떨어진다.
 * 섞은 뒤 농도가 12.8%처럼 나오지 않도록 농도와 무게 조합을 골랐다.
 */
const concentrationMixtures = [
  [12, 28, 300, 500],
  [8, 20, 450, 150],
  [15, 35, 200, 600],
  [6, 18, 600, 200],
  [10, 25, 400, 600],
  [14, 30, 750, 250],
  [5, 17, 250, 750],
  [16, 24, 750, 250],
  [9, 21, 250, 750],
  [18, 33, 800, 200],
] as const;

const mixtureScenarios = [
  "두 종류의 소금물",
  "두 회사의 설탕물",
  "서로 다른 농도의 과즙",
  "두 실험실의 용액",
  "농도가 다른 세정액",
  "두 탱크의 혼합액",
  "서로 다른 농도의 시럽",
  "두 공정의 원료액",
  "농도가 다른 식염수",
  "두 용기의 혼합 용액",
];

const mixtureQuestions = concentrationMixtures.map(([c1, c2, w1, w2], index) => {
  const final = (c1 * w1 + c2 * w2) / (w1 + w2);
  return defineQuestion(CATEGORY, "cm-concentration-1", "농도 혼합 계산", index, {
    stem: `${asObject(mixtureScenarios[index])} 각각 ${w1}g과 ${w2}g 섞었다. 첫 번째 농도가 ${c1}%, 두 번째 농도가 ${c2}%일 때 혼합 후 농도는?`,
    ...numericChoice(final, "%", index, 2),
    explanation: `용질의 양은 ${c1}×${w1}/100 + ${c2}×${w2}/100 = ${numberText((c1 * w1 + c2 * w2) / 100)}g입니다. 이를 전체 ${w1 + w2}g으로 나누면 농도는 ${numberText(final)}%입니다.`,
  });
});

const dilutionSeeds = [
  [20, 300, 200],
  [15, 400, 100],
  [24, 250, 350],
  [18, 500, 250],
  [30, 200, 400],
  [12, 600, 300],
  [25, 360, 240],
  [16, 450, 150],
  [28, 500, 200],
  [10, 700, 300],
] as const;

const dilutionQuestions = dilutionSeeds.map(([concentration, weight, water], offset) => {
  const index = offset + 10;
  const solute = (concentration * weight) / 100;
  const final = (solute / (weight + water)) * 100;
  const material = ["소금물", "설탕물", "과즙", "식염수", "시럽"][offset % 5];
  return defineQuestion(CATEGORY, "cm-concentration-1", "농도 혼합 계산", index, {
    stem: `농도 ${concentration}%인 ${material} ${weight}g에 물 ${water}g을 넣었다. 새로 만든 ${material}의 농도는?`,
    ...numericChoice(final, "%", index, 2),
    explanation: `물을 넣어도 용질 ${numberText(solute)}g은 변하지 않습니다. 전체 ${weight + water}g 중 용질의 비율은 ${numberText(final)}%입니다.`,
  });
});

export const CONCENTRATION_QUESTIONS = [...mixtureQuestions, ...dilutionQuestions];

const systemScenarios = [
  ["A사업장", "B사업장", "직원 수", "명"],
  ["동부 지점", "서부 지점", "회원 수", "명"],
  ["1공장", "2공장", "생산 인원", "명"],
  ["도심 노선", "순환 노선", "이용객 수", "명"],
  ["온라인 매장", "오프라인 매장", "주문 건수", "건"],
  ["가 지역", "나 지역", "가구 수", "가구"],
  ["기초 과정", "심화 과정", "수강생 수", "명"],
  ["A제품", "B제품", "판매량", "개"],
  ["중앙 창고", "외곽 창고", "재고량", "개"],
  ["개발팀", "기획팀", "프로젝트 수", "개"],
  ["북부 농장", "남부 농장", "출하량", "상자"],
  ["고객 센터", "기술 센터", "상담 건수", "건"],
  ["가 학교", "나 학교", "지원자 수", "명"],
  ["영상 채널", "음악 채널", "구독자 수", "명"],
  ["접수 부서", "심사 부서", "처리 건수", "건"],
  ["기본 모델", "고급 모델", "계약 수", "건"],
  ["가 병원", "나 병원", "검진 인원", "명"],
  ["해안 도시", "내륙 도시", "관광객 수", "명"],
  ["A서비스", "B서비스", "가입자 수", "명"],
  ["소재 연구소", "에너지 연구소", "과제 수", "개"],
] as const;

const SYSTEM_QUESTIONS: ExampleQuestion[] = systemScenarios.map(
  ([first, second, measure, unit], index) => {
    const a = 100 + index * 10;
    const b = 200 + (index % 6) * 20;
    const rateA = [10, 20, -10, 30][index % 4];
    const rateB = [-20, 10, 25, -10][index % 4];
    const totalBefore = a + b;
    const afterA = (a * (100 + rateA)) / 100;
    const afterB = (b * (100 + rateB)) / 100;
    const totalAfter = afterA + afterB;
    const askA = index % 2 === 0;
    const correct = askA ? afterA : afterB;
    return defineQuestion(CATEGORY, "cm-arithmetic-1", "증감 연립방정식", index, {
      // 전년도 값과 올해 값을 모두 다루므로 어느 해를 묻는지 발문에서 못 박는다.
      stem: `${togetherWith(first)} ${second}의 전년도 ${measure} 합계로 ${asSubject(`${totalBefore}${unit}`)} 집계되었다. 올해 ${first}의 값이 ${Math.abs(rateA)}% ${rateA >= 0 ? "증가" : "감소"}하고 ${second}의 값이 ${Math.abs(rateB)}% ${rateB >= 0 ? "증가" : "감소"}하여 올해 합계는 ${asMeans(`${numberText(totalAfter)}${unit}`)} 집계되었다. 올해 ${askA ? first : second}의 ${asTopic(measure)}?`,
      ...numericChoice(correct, unit, index, 10),
      explanation: `전년도 두 값을 A와 B로 두면 A+B=${totalBefore}이고, 증감률을 반영한 합은 ${numberText((100 + rateA) / 100)}A+${numberText((100 + rateB) / 100)}B=${numberText(totalAfter)}입니다. 두 식을 풀면 전년도 값은 각각 ${numberText(a)}${unit}, ${numberText(b)}${unit}이며 여기에 증감률을 적용한 올해 ${askA ? first : second}의 값은 ${numberText(correct)}${unit}입니다.`,
    });
  },
);

export { SYSTEM_QUESTIONS };

const costSeeds = [
  [40000, 50, 20],
  [30000, 40, 10],
  [50000, 60, 25],
  [24000, 50, 20],
  [36000, 25, 10],
  [48000, 40, 25],
  [60000, 30, 20],
  [28000, 60, 25],
  [32000, 25, 12],
  [72000, 40, 10],
  [45000, 60, 25],
  [20000, 50, 10],
  [80000, 30, 20],
  [54000, 40, 25],
  [25000, 60, 20],
  [64000, 50, 30],
  [42000, 25, 10],
  [56000, 40, 20],
  [35000, 60, 25],
  [90000, 50, 20],
] as const;
const products = [
  "운동화",
  "가방",
  "재킷",
  "책상",
  "의자",
  "이어폰",
  "조명",
  "시계",
  "선풍기",
  "커피 머신",
  "태블릿",
  "침구 세트",
  "자전거",
  "공기청정기",
  "텐트",
  "모니터",
  "캐리어",
  "프린터",
  "카메라",
  "로봇 청소기",
] as const;

export const COST_QUESTIONS: ExampleQuestion[] = costSeeds.map(
  ([cost, markup, discount], index) => {
    const listPrice = cost * (1 + markup / 100);
    const salePrice = listPrice * (1 - discount / 100);
    const profit = salePrice - cost;
    const askProfit = index % 2 === 1;
    const correct = askProfit ? profit : cost;
    return defineQuestion(CATEGORY, "cm-cost-1", "원가와 판매가 계산", index, {
      stem: `${products[index]}의 정가는 원가에 ${markup}%의 이익을 붙여 정했다. 정가에서 ${discount}% 할인해 판매한 가격이 ${numberText(salePrice)}원일 때, ${askProfit ? "이 상품을 한 개 팔아 남긴 이익은?" : "이 상품의 원가는?"}`,
      ...numericChoice(
        correct,
        "원",
        index,
        Math.max(1000, Math.round(correct / 10 / 1000) * 1000),
      ),
      explanation: askProfit
        ? `정가는 원가의 ${100 + markup}%이고 판매가는 그 ${100 - discount}%이므로 판매가는 원가의 ${numberText((listPrice * (100 - discount)) / 100 / cost)}배입니다. 원가는 ${numberText(salePrice)}÷${numberText((listPrice * (100 - discount)) / 100 / cost)}=${cost}원이고, 판매가에서 원가를 빼면 이익은 ${numberText(profit)}원입니다.`
        : `정가는 원가의 ${100 + markup}%이고 판매가는 정가의 ${100 - discount}%이므로, 판매가는 원가의 ${numberText((listPrice * (100 - discount)) / 100 / cost)}배입니다. 따라서 원가는 ${numberText(salePrice)}÷${numberText((listPrice * (100 - discount)) / 100 / cost)}=${cost}원입니다.`,
    });
  },
);

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function fraction(numerator: number, denominator: number) {
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
}

function combination(n: number, r: number) {
  const k = Math.min(r, n - r);
  let result = 1;
  for (let i = 1; i <= k; i += 1) result = (result * (n - k + i)) / i;
  return result;
}

/**
 * 실제 시험의 확률 선지는 5/7, 3/5처럼 분모가 작은 기약분수로 제시된다.
 * 111/126과 그 이웃값(110/126, 112/126)을 늘어놓으면 시험에 없는 형태가 되므로,
 * 여사건 확률이 분모 20 이하로 약분되는 조합만 쓴다.
 */
const probabilitySeeds = [
  [7, 3, 2, "지원자", "자격 보유자", "명"],
  [6, 2, 2, "제품", "불량품", "개"],
  [10, 4, 2, "도서", "외국어 도서", "권"],
  [9, 3, 2, "응모권", "당첨권", "장"],
  [6, 3, 3, "파일", "암호화 파일", "개"],
  [5, 2, 2, "전구", "저전력 전구", "개"],
  [7, 2, 3, "참가자", "경험자", "명"],
  [8, 4, 3, "공", "빨간 공", "개"],
  [10, 5, 2, "카드", "별표 카드", "장"],
  [8, 3, 2, "식단", "채식 식단", "개"],
  [9, 4, 2, "열쇠", "마스터 열쇠", "개"],
  [10, 3, 2, "시료", "양성 시료", "개"],
  [6, 4, 2, "회원", "관리자", "명"],
  [8, 2, 2, "동전", "기념 동전", "개"],
  [10, 6, 2, "업무", "긴급 업무", "개"],
  [7, 4, 2, "묘목", "내병성 묘목", "그루"],
  [9, 2, 2, "소포", "특급 소포", "개"],
  [5, 3, 2, "문항", "보너스 문항", "개"],
  [6, 2, 3, "부품", "수입 부품", "개"],
  [7, 5, 2, "선수", "왼손잡이 선수", "명"],
] as const;

/** 정답과 분모가 비슷한 기약분수 오답을 만든다. 분모가 20을 넘는 값은 시험 선지답지 않아 버린다. */
function nearbyFractions(numerator: number, denominator: number) {
  const values: string[] = [];
  const target = numerator / denominator;
  for (const [top, bottom] of [
    [1, 2],
    [1, 3],
    [2, 3],
    [1, 4],
    [3, 4],
    [1, 5],
    [2, 5],
    [3, 5],
    [4, 5],
    [1, 6],
    [5, 6],
    [2, 7],
    [3, 7],
    [4, 7],
    [5, 7],
    [6, 7],
    [3, 8],
    [5, 8],
    [7, 8],
    [4, 9],
    [5, 9],
    [7, 9],
    [8, 9],
    [3, 10],
    [7, 10],
    [9, 10],
    [5, 12],
    [7, 12],
    [11, 12],
    [9, 14],
    [11, 14],
    [13, 14],
    [11, 15],
    [13, 15],
  ]
    .map(([top, bottom]) => [top, bottom, Math.abs(top / bottom - target)] as const)
    .sort((left, right) => left[2] - right[2])) {
    const text = fraction(top, bottom);
    if (text === fraction(numerator, denominator) || values.includes(text)) continue;
    values.push(text);
    if (values.length === 4) break;
  }
  return values;
}

const probabilityQuestions: ExampleQuestion[] = probabilitySeeds.map(
  ([total, special, pick, groupName, specialName, unit], index) => {
    const all = combination(total, pick);
    const none = combination(total - special, pick);
    const favorable = all - none;
    const correct = fraction(favorable, all);
    return defineQuestion(CATEGORY, "cm-probability-1", "‘적어도 하나’ 확률 (여사건)", index, {
      stem: `${asTopic(groupName)} 모두 ${total}${unit}이며, 그중 ${asTopic(specialName)} ${special}${unit}이다. 무작위로 ${pick}${unit} 선택할 때 선택 대상 중 적어도 하나가 ${specialName}에 해당할 확률은?`,
      ...rotateChoices(correct, nearbyFractions(favorable, all), index),
      explanation: `전체 경우는 ${total}C${pick}=${all}이고 ${asTopic(specialName)} 하나도 없는 경우는 ${total - special}C${pick}=${none}입니다. 여사건을 빼면 확률은 (${all}-${none})/${all}, 즉 ${correct}입니다.`,
    });
  },
);

export { probabilityQuestions as PROBABILITY_QUESTIONS };

const distanceSeeds = [
  [60, 40, 60, "철수와 영희"],
  [72, 48, 96, "두 배송 기사"],
  [90, 60, 135, "두 고속버스"],
  [80, 50, 100, "두 점검 차량"],
  [100, 75, 150, "두 열차"],
  [84, 56, 112, "두 관광버스"],
  [70, 42, 105, "두 자전거 선수"],
  [96, 64, 128, "두 화물차"],
  [120, 80, 200, "두 승용차"],
  [75, 50, 125, "두 통근버스"],
  [66, 44, 88, "두 순찰차"],
  [108, 72, 180, "두 시외버스"],
  [54, 36, 81, "두 전기 자전거"],
  [88, 55, 110, "두 우편 차량"],
  [78, 52, 104, "두 조사 차량"],
  [105, 70, 140, "두 셔틀버스"],
  [64, 48, 96, "두 여행자"],
  [92, 69, 138, "두 방역 차량"],
  [110, 88, 220, "두 급행 열차"],
  [99, 66, 132, "두 운송 차량"],
] as const;

const distanceQuestions: ExampleQuestion[] = distanceSeeds.map(
  ([fast, slow, distance, subject], index) => {
    const differenceMinutes = distance * (1 / slow - 1 / fast) * 60;
    return defineQuestion(CATEGORY, "cm-dst-1", "거리, 속력, 시간 (거리 동일)", index, {
      stem: `${asSubject(subject)} 같은 거리를 각각 시속 ${fast}km와 시속 ${slow}km로 이동했다. 빠른 쪽이 ${numberText(differenceMinutes)}분 먼저 도착했다면 이동한 거리는?`,
      ...numericChoice(distance, "km", index, 10),
      explanation: `같은 거리에서 걸린 시간의 차는 거리×(1/${slow}-1/${fast})입니다. 시간 차 ${numberText(differenceMinutes)}분을 시간 단위로 바꾸어 식을 풀면 거리는 ${distance}km입니다.`,
    });
  },
);

export { distanceQuestions as DISTANCE_QUESTIONS };

/**
 * 일률 문제의 답은 ab/(a+b) 꼴이라 아무 숫자나 넣으면 8/3처럼 나누어떨어지지 않는다.
 * 2.67일처럼 반올림한 값을 정답 선지로 올리면 실제로는 정답이 없는 문제가 되므로,
 * 네 가지 형태 모두 답이 정수로 떨어지는 조합만 골라 두었다.
 */
const pairWorkSeeds = [
  [30, 20],
  [18, 9],
  [10, 15],
  [30, 15],
  [24, 12],
] as const;
const joinWorkSeeds = [
  [12, 3, 6],
  [15, 5, 10],
  [20, 5, 5],
  [18, 6, 9],
  [24, 4, 8],
] as const;
const machineWorkSeeds = [
  [3, 8, 4],
  [4, 9, 6],
  [5, 12, 6],
  [6, 10, 4],
  [8, 9, 12],
] as const;
const speedWorkSeeds = [
  [12, 2],
  [12, 3],
  [15, 2],
  [20, 4],
  [18, 2],
] as const;

const workQuestions: ExampleQuestion[] = Array.from({ length: 20 }, (_, index) => {
  const mode = index % 4;
  const group = Math.floor(index / 4);
  if (mode === 0) {
    const [a, b] = pairWorkSeeds[group];
    const together = (a * b) / (a + b);
    return defineQuestion(CATEGORY, "cm-work-1", "협력 작업 일률", index, {
      stem: `어떤 일을 A는 혼자 ${a}일, B는 혼자 ${b}일 만에 끝낸다. 두 사람이 처음부터 함께 일하면 며칠이 걸리는가?`,
      ...numericChoice(together, "일", index, 1),
      explanation: `하루 일률은 각각 1/${a}, 1/${b}이고 합은 ${fraction(a + b, a * b)}입니다. 전체 일 1을 합산 일률로 나누면 ${numberText(together)}일입니다.`,
    });
  }
  if (mode === 1) {
    const [a, worked, b] = joinWorkSeeds[group];
    const extra = ((a - worked) * b) / (a + b);
    return defineQuestion(CATEGORY, "cm-work-1", "협력 작업 일률", index, {
      stem: `A가 혼자 하면 ${a}일 걸리는 일을 ${worked}일 동안 진행한 뒤, 혼자 하면 ${b}일 걸리는 B가 합류했다. 남은 일을 두 사람이 함께 끝내는 데 걸리는 시간은?`,
      ...numericChoice(extra, "일", index, 1),
      explanation: `A가 끝낸 양은 ${fraction(worked, a)}, 남은 양은 ${fraction(a - worked, a)}입니다. 두 사람의 합산 일률은 ${fraction(a + b, a * b)}이므로, 남은 양을 이 값으로 나누면 ${numberText(extra)}일입니다.`,
    });
  }
  if (mode === 2) {
    const [machines, hours, targetMachines] = machineWorkSeeds[group];
    const targetHours = (machines * hours) / targetMachines;
    return defineQuestion(CATEGORY, "cm-work-1", "협력 작업 일률", index, {
      stem: `성능이 같은 기계 ${machines}대가 작업을 ${hours}시간에 끝낸다. 같은 기계 ${targetMachines}대로 같은 작업을 하면 몇 시간이 걸리는가?`,
      ...numericChoice(targetHours, "시간", index, 1),
      explanation: `전체 작업량은 기계 수와 시간의 곱에 비례하므로 ${machines}×${hours}=${machines * hours}입니다. 이를 기계 ${targetMachines}대에 나누면 ${numberText(targetHours)}시간입니다.`,
    });
  }
  const [a, ratio] = speedWorkSeeds[group];
  const b = a / ratio;
  const together = a / (1 + ratio);
  return defineQuestion(CATEGORY, "cm-work-1", "협력 작업 일률", index, {
    stem: `A는 혼자 일을 ${a}시간에 끝내고 B의 작업 속도는 A의 ${ratio}배이다. 두 사람이 함께 일할 때 걸리는 시간은?`,
    ...numericChoice(together, "시간", index, 1),
    explanation: `B는 같은 일을 ${numberText(b)}시간에 끝냅니다. 두 사람의 일률은 각각 1/${a}, 1/${numberText(b)}이고 합은 ${fraction(1 + ratio, a)}입니다. 전체 일 1을 이 값으로 나누면 ${numberText(together)}시간입니다.`,
  });
});

export { workQuestions as WORK_QUESTIONS };

export const MATH_EXAMPLE_QUESTIONS = [
  ...CONCENTRATION_QUESTIONS,
  ...SYSTEM_QUESTIONS,
  ...COST_QUESTIONS,
  ...probabilityQuestions,
  ...distanceQuestions,
  ...workQuestions,
];
