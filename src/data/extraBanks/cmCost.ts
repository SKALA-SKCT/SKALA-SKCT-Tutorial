import type { ExampleQuestion } from "../catalog";
import { defineQuestion } from "../exampleBanks/bankUtils";

// cm-cost-1: 문제 세트와 랜덤 문제에만 쓰는 추가 문항 60개 (id 번호 21~80)
const CATEGORY = "creative-math";
const KIND = "cm-cost-1";
const KIND_NAME = "원가와 판매가 계산";

/** 숫자로 끝나는 값도 읽는 소리(영, 일, 삼, 육, 칠, 팔, 십, 백, 천)에 받침이 있으면 받침으로 본다. */
function hasFinalConsonant(value: string) {
  const last = value[value.length - 1];
  if (/\d/.test(last)) return "0136780".includes(last);
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

function nt(value: number) {
  const rounded = Number(value.toFixed(8));
  return Number.isInteger(rounded) ? rounded.toLocaleString("en-US") : String(rounded);
}
const won = (value: number) => Number.isInteger(value)
  ? `${nt(value)}원`
  : `약 ${nt(Number(value.toFixed(2)))}원`;
function check(condition: boolean, message: string) {
  if (!condition) throw new Error(`[${KIND}] 검산 실패: ${message}`);
}
/** 부동소수점 꼬리만 걷어 낸다. 실제로 나누어떨어지지 않는 값은 그대로 두어 check에서 걸린다. */
function snap(value: number) {
  return Math.abs(value - Math.round(value)) < 1e-6 ? Math.round(value) : value;
}
const k = (rate: number) => nt((100 + rate) / 100);

const STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];

/**
 * 실전 선지처럼 같은 간격으로 오름차순 배열하고, 정답 자리는 문항 번호로 고르게 돌린다.
 * 0 이하 값이 생기면 계산 없이 지울 수 있으므로 정답 자리를 가까운 곳으로 옮긴다.
 */
function sortedChoices(correct: number, unit: string, position: number, fixedGap?: number) {
  check(Number.isInteger(correct) && correct > 0, `정답이 양의 정수가 아님: ${correct}`);
  const gap = fixedGap ?? [...STEPS].reverse().find((step) => step <= correct / 8) ?? 1;
  const positions = [0, 1, 2, 3, 4].sort((a, b) => Math.abs(a - position) - Math.abs(b - position));
  for (const p of positions) {
    const values = [0, 1, 2, 3, 4].map((i) => correct + gap * (i - p));
    if (values[0] > 0)
      return { choices: values.map((value) => `${nt(value)}${unit}`), answer: p };
  }
  throw new Error(`[${KIND}] 선지 생성 실패: ${correct}`);
}

interface Built {
  stem: string;
  correct: number;
  unit: "원" | "%" | "개";
  explanation: string;
  gap?: number;
}

// 1) 정가에서 일정 금액을 깎아 판 뒤 원가 대비 이익률이 주어짐
const cutSeeds: Array<[string, string, number, number, number, "list" | "cost"]> = [
  ["한 주방용품점", "원목 도마", 18000, 30, 12, "list"],
  ["한 아웃도어 매장", "등산 배낭", 42000, 25, 10, "cost"],
  ["한 생활가전 매장", "전기 포트", 26000, 35, 17, "list"],
  ["한 요가 용품점", "요가 매트", 15000, 40, 22, "cost"],
  ["한 컴퓨터 용품점", "무선 마우스", 22000, 50, 32, "list"],
  ["한 잡화점", "가죽 지갑", 36000, 45, 20, "cost"],
];
const cutQuestions: Built[] = cutSeeds.map(([shop, item, C, m, r, ask]) => {
  const L = snap((C * (100 + m)) / 100);
  const N = snap((C * (m - r)) / 100);
  check(Number.isInteger(L) && Number.isInteger(N), `정가 ${L}, 할인액 ${N}`);
  const x = snap(N / ((m - r) / 100));
  check(x === C && snap(L - N - C) === snap((C * r) / 100), "할인액 역검산");
  return {
    stem: `${asTopic(shop)} ${asObject(item)} 들여와 원가의 ${m}%를 이익으로 붙여 정가를 매겼다. 연말 행사에서 정가보다 ${won(N)} 싸게 팔았더니 남은 이익이 원가의 ${r}%였다. 이 ${item}의 ${asTopic(ask === "list" ? "정가" : "원가")} 얼마인가?`,
    correct: ask === "list" ? L : C,
    unit: "원",
    explanation: `원가를 x원이라 하면 정가는 ${k(m)}x원이고 행사 가격은 (${k(m)}x-${nt(N)})원입니다. 이 값이 원가의 ${100 + r}%인 ${k(r)}x와 같으므로 ${nt((m - r) / 100)}x=${nt(N)}, x=${won(C)}입니다. ${
      ask === "list"
        ? `묻는 것은 정가이므로 ${nt(C)}×${k(m)}=${asSubject(won(L))} 답이며, 원가 ${asObject(won(C))} 고르면 틀립니다.`
        : `정가 ${asTopic(won(L))} 원가에 이익을 붙인 값이라 묻는 값이 아닙니다.`
    }`,
  };
});

// 2) 할인하고도 목표 이익률을 지키려면 정가를 얼마로 정해야 하는지
const targetSeeds: Array<[string, string, number, number, number, "list" | "markup"]> = [
  ["한 소품 가게", "수제 향초", 12000, 20, 10, "list"],
  ["한 캠핑 용품점", "캠핑 의자", 30000, 25, 5, "markup"],
  ["한 음향 기기 매장", "블루투스 스피커", 45000, 10, 8, "list"],
  ["한 아동 도서 매장", "동화 전집", 60000, 30, 12, "markup"],
  ["한 드러그스토어", "전동 칫솔", 28000, 15, 2, "list"],
  ["한 운동 기구 매장", "실내 자전거", 150000, 20, 16, "markup"],
];
const targetQuestions: Built[] = targetSeeds.map(([shop, item, C, d, r, ask]) => {
  const S = snap((C * (100 + r)) / 100);
  const L = snap(S / ((100 - d) / 100));
  const m = snap(((L - C) / C) * 100);
  check(Number.isInteger(S) && Number.isInteger(L) && (ask === "list" || Number.isInteger(m)), `판매가 ${S}, 정가 ${L}, 이익률 ${m}`);
  check(snap((L * (100 - d)) / 100 - C) === snap((C * r) / 100), "정가 역검산");
  const naive = snap((C * (100 + d + r)) / 100);
  check(naive !== L && d + r !== m, "함정 값이 정답과 같음");
  return {
    stem: `${asTopic(shop)} 원가가 ${won(C)}인 ${asObject(item)} 정가의 ${d}%를 할인해 팔려고 한다. 할인한 가격으로 팔아도 원가의 ${r}%만큼 이익이 남게 하려면 ${ask === "list" ? `${item}의 정가를 얼마로 정해야 하는가?` : "정가를 정할 때 원가에 몇 %의 이익을 붙여야 하는가?"}`,
    correct: ask === "list" ? L : m,
    unit: ask === "list" ? "원" : "%",
    gap: ask === "list" ? undefined : 5,
    explanation: `할인한 판매가는 원가의 ${100 + r}%인 ${nt(C)}×${k(r)}=${won(S)}이어야 합니다. 이 값이 정가의 ${100 - d}%이므로 정가는 ${nt(S)}÷${k(-d)}=${won(L)}입니다. ${
      ask === "list"
        ? `원가에 ${d + r}%를 한꺼번에 붙인 ${asTopic(won(naive))} 정가 기준 할인을 원가 기준으로 계산한 값이라 틀립니다.`
        : `정가는 원가보다 ${won(L - C)} 비싸므로 붙일 이익률은 ${m}%입니다. 할인율과 이익률을 더한 ${d + r}%는 할인이 정가 기준이라는 점을 놓친 값입니다.`
    }`,
  };
});

// 3) 원가와 한 개당 이익으로 이익률, 할인율, 이익 구하기
type RateAsk = "markup" | "discount" | "profit";
const rateSeeds: Array<[string, string, number, number, number, RateAsk]> = [
  ["한 주방 잡화점", "보온병", 20000, 20, 10, "markup"],
  ["한 생활가전 대리점", "가습기", 40000, 50, 20, "discount"],
  ["한 여행 용품점", "여행용 파우치", 8000, 50, 25, "markup"],
  ["한 우산 가게", "접이식 우산", 12000, 40, 15, "discount"],
  ["한 로스터리 카페", "원두 한 봉지", 16000, 35, 20, "profit"],
  ["한 등산 용품점", "등산 스틱", 25000, 40, 12, "markup"],
];
const rateQuestions: Built[] = rateSeeds.map(([shop, item, C, m, d, ask]) => {
  const L = snap((C * (100 + m)) / 100);
  const S = snap((L * (100 - d)) / 100);
  const P = S - C;
  check(Number.isInteger(L) && Number.isInteger(S) && P > 0, `정가 ${L}, 판매가 ${S}`);
  check(snap(((S / ((100 - d) / 100) - C) / C) * 100) === m, "이익률 역검산");
  check(snap(((L - (C + P)) / L) * 100) === d, "할인율 역검산");
  if (ask === "markup")
    return {
      stem: `${asTopic(shop)} 원가가 ${won(C)}인 ${item}에 일정한 비율의 이익을 붙여 정가를 정했다. 이를 정가의 ${d}% 할인한 가격에 팔았더니 한 개당 ${won(P)}의 이익이 남았다. 원가에 붙인 이익률은 몇 %인가?`,
      correct: m,
      unit: "%",
      gap: 5,
      explanation: `판매가는 원가에 이익을 더한 ${nt(C)}+${nt(P)}=${won(S)}이고, 이는 정가의 ${100 - d}%입니다. 정가는 ${nt(S)}÷${k(-d)}=${won(L)}이므로 원가보다 ${won(L - C)} 비싸고, 이익률은 ${nt(L - C)}÷${nt(C)}×100=${m}%입니다. 이익 ${asObject(won(P))} 원가로 나눈 ${nt((P / C) * 100)}%는 할인 뒤의 이익률이라 틀립니다.`,
    };
  if (ask === "discount")
    return {
      stem: `${asTopic(shop)} 원가가 ${won(C)}인 ${item}에 원가의 ${m}% 이익을 붙여 정가를 정했다. 재고 정리를 위해 정가에서 일정 비율을 할인해 팔았더니 한 개당 ${won(P)}의 이익이 남았다. 정가에서 몇 %를 할인했는가?`,
      correct: d,
      unit: "%",
      gap: 5,
      explanation: `정가는 ${nt(C)}×${k(m)}=${won(L)}이고 판매가는 ${nt(C)}+${nt(P)}=${won(S)}이므로 할인액은 ${won(L - S)}입니다. 할인율은 정가 기준이라 ${nt(L - S)}÷${nt(L)}×100=${d}%입니다. 할인액을 원가로 나누면 ${nt(((L - S) / C) * 100)}%가 되어 틀립니다.`,
    };
  const naive = snap((C * (m - d)) / 100);
  check(naive !== P, "함정 값이 정답과 같음");
  return {
    stem: `${asTopic(shop)} 원가가 ${won(C)}인 ${item}에 원가의 ${m}% 이익을 붙여 정가를 정한 뒤, 정가의 ${d}%를 할인해 팔았다. 한 개를 팔 때 남는 이익은 얼마인가?`,
    correct: P,
    unit: "원",
    explanation: `정가는 ${nt(C)}×${k(m)}=${won(L)}이고 할인 판매가는 ${nt(L)}×${k(-d)}=${won(S)}입니다. 여기서 원가를 빼면 이익은 ${won(P)}입니다. 이익률에서 할인율을 빼 원가의 ${m - d}%인 ${withJosa(won(naive), "으로", "로")} 계산하면 할인 기준이 정가라는 점을 놓쳐 틀립니다.`,
  };
});

// 4) 재고 일부는 정가, 나머지는 일정 금액 할인, 전체 이익률이 주어짐
const stockSeeds: Array<[string, string, number, number, number, number, number, "cost" | "cut"]> = [
  ["한 캠핑 카페", "텀블러", 8000, 50, 75, 3200, 40, "cost"],
  ["한 휴대폰 액세서리점", "스마트워치 밴드", 12000, 30, 60, 4500, 15, "cut"],
  ["한 수제 과자점", "쿠키 선물 세트", 6000, 45, 80, 3000, 35, "cost"],
  ["한 조명 가게", "LED 스탠드", 25000, 40, 50, 6000, 28, "cost"],
  ["한 전자 액세서리 매장", "보조 배터리", 15000, 36, 70, 5000, 26, "cut"],
  ["한 도자기 공방", "머그컵", 5000, 60, 40, 2000, 36, "cost"],
];
const stockQuestions: Built[] = stockSeeds.map(([shop, item, C, m, full, N, r, ask]) => {
  const rest = (100 - full) / 100;
  // 재고 수 n은 양변에서 약분되므로 한 개 기준으로 검산한다.
  const revenuePerUnit = (C * (100 + m)) / 100 - rest * N;
  check(snap(revenuePerUnit - (C * (100 + r)) / 100) === 0, "재고 이익률 검산");
  const costBack = snap((rest * N) / ((m - r) / 100));
  const cutBack = snap(((m - r) / 100) * C / rest);
  check(costBack === C && cutBack === N, "재고 역산");
  return {
    stem: `${asTopic(shop)} ${asObject(item)} 매입해 원가의 ${m}% 이익을 붙여 정가를 정했다. 전체 재고의 ${full}%는 정가에 팔고, 나머지는 정가에서 ${asObject(ask === "cost" ? won(N) : "일정 금액")} 할인해 모두 팔았다. 정산해 보니 전체 매입 금액의 ${r}%만큼 이익이 났다. ${ask === "cost" ? `${item}의 원가는 얼마인가?` : `${item}의 원가가 ${won(C)}이라면 한 개당 할인한 금액은 얼마인가?`}`,
    correct: ask === "cost" ? C : N,
    unit: "원",
    explanation:
      ask === "cost"
        ? `원가를 x원, 재고를 n개라 하면 매출은 ${k(m)}x×n에서 할인한 ${nt(rest)}n개분의 ${nt(N)}원을 뺀 값이고, 이 값이 매입 금액 nx의 ${100 + r}%와 같습니다. n을 약분하면 ${k(m)}x-${nt(rest * N)}=${k(r)}x이므로 ${nt((m - r) / 100)}x=${nt(rest * N)}, x=${won(C)}입니다. 할인액 ${asObject(won(N))} 재고 전체에 적용하면 ${asSubject(won(snap(N / ((m - r) / 100))))} 나와 틀립니다.`
        : `한 개 기준으로 보면 정가는 ${nt(C)}×${k(m)}=${won((C * (100 + m)) / 100)}이고, 목표 매출은 원가의 ${100 + r}%인 ${won((C * (100 + r)) / 100)}입니다. 그 차이 ${asTopic(won(((m - r) / 100) * C))} 할인한 ${100 - full}%의 재고가 만든 것이므로 할인액을 N이라 하면 ${nt(rest)}N=${nt(((m - r) / 100) * C)}, N=${won(N)}입니다. 차이 ${asObject(won(((m - r) / 100) * C))} 그대로 할인액으로 보면 할인한 재고의 비율을 빠뜨린 것이라 틀립니다.`,
  };
});

// 5) 두 상품을 합쳐 매입한 뒤 각각 다른 이익률로 판매
const pairSeeds: Array<[string, string, string, number, number, number, number, "A" | "B"]> = [
  ["한 문구 도매상", "노트", "필통", 36000, 24000, 25, -10, "A"],
  ["한 원예 용품점", "화분", "꽃씨", 50000, 30000, 20, 15, "B"],
  ["한 전자상가 점포", "충전기", "케이블", 45000, 35000, -8, 30, "A"],
  ["한 식자재 마트", "쌀", "잡곡", 120000, 80000, 15, -5, "B"],
  ["한 공구 상점", "전동 드릴", "톱", 64000, 56000, 35, 10, "A"],
  ["한 옷가게", "셔츠", "바지", 72000, 48000, -15, 40, "B"],
];
const pairQuestions: Built[] = pairSeeds.map(([shop, A, B, x, y, a, b, ask]) => {
  const T = x + y;
  const P = snap((x * a) / 100 + (y * b) / 100);
  check(Number.isInteger(P) && P > 0 && a !== b, `총이익 ${P}`);
  const xBack = snap((P - (b / 100) * T) / ((a - b) / 100));
  check(xBack === x, "매입가 역산");
  const change = (rate: number) => `${Math.abs(rate)}% ${rate > 0 ? "비싸게" : "싸게"}`;
  const solve =
    a > b
      ? `y=${nt(T)}-x를 대입하면 ${nt((a - b) / 100)}x=${nt(P - (b / 100) * T)}이므로 x=${nt(x)}, y=${nt(y)}입니다.`
      : `x=${nt(T)}-y를 대입하면 ${nt((b - a) / 100)}y=${nt(P - (a / 100) * T)}이므로 y=${nt(y)}, x=${nt(x)}입니다.`;
  return {
    stem: `${asTopic(shop)} ${togetherWith(A)} ${asObject(B)} 합쳐 ${won(T)}어치 매입했다. ${asTopic(A)} 매입가보다 ${change(a)}, ${asTopic(B)} 매입가보다 ${change(b)} 모두 팔았더니 전체 이익이 ${won(P)}이었다. ${ask === "A" ? A : B}의 매입가는 얼마인가?`,
    correct: ask === "A" ? x : y,
    unit: "원",
    explanation: `${A}의 매입가를 x원, ${B}의 매입가를 y원이라 하면 x+y=${nt(T)}이고, 이익은 ${nt(a / 100)}x+${b < 0 ? `(${nt(b / 100)})` : nt(b / 100)}y=${nt(P)}입니다. ${solve} 따라서 ${ask === "A" ? A : B}의 매입가는 ${won(ask === "A" ? x : y)}이고, ${asTopic(won(ask === "A" ? y : x))} 다른 상품의 매입가입니다.`,
  };
});

// 6) 일부를 할인해 모두 판 총 판매액으로 수량 구하기
const volumeSeeds: Array<[string, string, number, number, [number, number], number, number, "all" | "discounted"]> = [
  ["한 욕실용품 회사", "비누 세트", 5000, 20, [1, 4], 20, 800, "all"],
  ["한 섬유 회사", "호텔 수건", 4000, 50, [1, 2], 30, 600, "all"],
  ["한 주방용품 회사", "오븐 장갑", 3000, 40, [2, 5], 25, 1000, "discounted"],
  ["한 휴대폰 케이스 업체", "투명 케이스", 8000, 25, [1, 5], 10, 900, "all"],
  ["한 양말 공장", "양말 세트", 6000, 30, [3, 5], 50, 500, "discounted"],
  ["한 기념품 가게", "금속 열쇠고리", 2000, 60, [1, 4], 25, 1200, "all"],
];
const volumeQuestions: Built[] = volumeSeeds.map(([shop, item, C, m, [num, den], d, n, ask]) => {
  const L = snap((C * (100 + m)) / 100);
  const Ld = snap((L * (100 - d)) / 100);
  check(n % den === 0 && Number.isInteger(L) && Number.isInteger(Ld), "수량 시드");
  const discounted = (n * num) / den;
  const R = (n - discounted) * L + discounted * Ld;
  const avg = snap((L * (den - num)) / den + (Ld * num) / den);
  check(Number.isInteger(avg) && snap(R / avg) === n && R % 10000 === 0, `평균 판매액 ${avg}, 매출 ${R}`);
  const fullText = `${den - num}/${den}`;
  return {
    stem: `${asTopic(shop)} 원가가 ${won(C)}인 ${item}에 원가의 ${m}% 이익을 붙여 정가를 정했다. 준비한 물량의 ${asTopic(fullText)} 정가에 팔고, 나머지는 정가의 ${d}%를 할인해 모두 팔았다. 총 판매액이 ${nt(R / 10000)}만 원일 때, ${ask === "all" ? "준비한 물량은 모두 몇 개인가?" : "할인해 판 물량은 몇 개인가?"}`,
    correct: ask === "all" ? n : discounted,
    unit: "개",
    explanation: `정가는 ${nt(C)}×${k(m)}=${won(L)}, 할인가는 ${nt(L)}×${k(-d)}=${won(Ld)}입니다. 한 개당 평균 판매액은 ${nt(L)}×${fullText}+${nt(Ld)}×${num}/${den}=${won(avg)}이므로 전체 물량은 ${nt(R)}÷${nt(avg)}=${nt(n)}개입니다. ${
      ask === "all"
        ? `총 판매액을 정가로만 나눈 ${nt(snap(R / L))}개는 할인 판매분을 무시한 값이라 틀립니다.`
        : `이 중 할인해 판 물량은 ${nt(n)}×${num}/${den}=${nt(discounted)}개이며, 전체 물량 ${nt(n)}개를 고르면 틀립니다.`
    }`,
  };
});

// 7) 이익률과 할인율, 한 개당 이익으로 원가나 정가 구하기
const profitSeeds: Array<[string, string, number, number, number, "cost" | "list"]> = [
  ["한 캠핑 매장", "에어 매트", 15000, 40, 10, "cost"],
  ["한 주방가전 매장", "블렌더", 35000, 50, 20, "cost"],
  ["한 전자기기 매장", "전자책 리더기", 100000, 30, 10, "list"],
  ["한 등산화 전문점", "등산화", 50000, 60, 25, "cost"],
  ["한 그릇 가게", "와인잔 세트", 24000, 25, 4, "list"],
  ["한 건강용품 매장", "안마 쿠션", 40000, 45, 20, "cost"],
];
const profitQuestions: Built[] = profitSeeds.map(([shop, item, C, m, d, ask]) => {
  const factor = snap((((100 + m) / 100) * (100 - d)) / 100 * 100) / 100;
  const L = snap((C * (100 + m)) / 100);
  const P = snap(C * factor - C);
  check(Number.isInteger(L) && Number.isInteger(P) && P > 0, `정가 ${L}, 이익 ${P}`);
  check(snap(P / (factor - 1)) === C, "원가 역산");
  const naive = P / ((m - d) / 100);
  check(snap(naive) !== C, "함정 값이 정답과 같음");
  return {
    stem: `${asTopic(shop)} ${item}의 원가에 ${m}%의 이익을 붙여 정가를 정했다. 이 ${asObject(item)} 정가의 ${d}% 할인한 가격에 팔았더니 한 개당 ${won(P)}의 이익이 남았다. ${item}의 ${asTopic(ask === "cost" ? "원가" : "정가")} 얼마인가?`,
    correct: ask === "cost" ? C : L,
    unit: "원",
    explanation: `원가를 x원이라 하면 판매가는 ${k(m)}x×${k(-d)}=${nt(factor)}x원이므로 이익은 ${nt(factor - 1)}x=${nt(P)}, x=${won(C)}입니다. ${
      ask === "list" ? `정가는 ${nt(C)}×${k(m)}=${won(L)}입니다. ` : ""
    }이익률에서 할인율을 빼 원가의 ${m - d}%를 이익으로 보면 원가가 ${asSubject(won(naive))} 되어 틀립니다.`,
  };
});

// 8) 원가와 정가가 함께 오른 뒤 이익 변화
type HikeAsk = "newList" | "oldCost" | "newCost" | "oldList" | "newProfit";
const hikeSeeds: Array<[string, string, number, number, number, number, HikeAsk]> = [
  ["한 생활용품점", "보온 도시락", 20000, 30000, 10, 20, "newList"],
  ["한 사무용품점", "노트북 거치대", 24000, 32000, 5, 10, "oldCost"],
  ["한 휴대폰 매장", "무선 충전기", 18000, 27000, 20, 10, "newCost"],
  ["한 화장품 가게", "핸드크림 세트", 12000, 20000, 15, 12, "oldList"],
  ["한 가전 매장", "전기 그릴", 60000, 90000, 8, 6, "newList"],
  ["한 캠핑 용품점", "캠핑 랜턴", 32000, 40000, 25, 15, "newProfit"],
];
const hikeQuestions: Built[] = hikeSeeds.map(([shop, item, C, L, c, p, ask]) => {
  const P0 = L - C;
  const C2 = snap((C * (100 + c)) / 100);
  const L2 = snap((L * (100 + p)) / 100);
  const delta = L2 - C2 - P0;
  check(Number.isInteger(C2) && Number.isInteger(L2) && delta !== 0 && p !== c, `변화 ${delta}`);
  const lBack = snap((delta - (c / 100) * P0) / ((p - c) / 100));
  check(lBack === L && lBack - P0 === C, "정가 역산");
  const askMap: Record<HikeAsk, [string, number, string]> = {
    newList: ["인상한 뒤의 정가는 얼마인가?", L2, `인상한 정가는 ${nt(L)}×${k(p)}=${won(L2)}입니다. 인상 전 정가 ${asObject(won(L))} 고르면 틀립니다.`],
    oldCost: ["인상 전의 원가는 얼마인가?", C, `인상 전 원가는 ${nt(L)}-${nt(P0)}=${won(C)}입니다. 오른 뒤 원가 ${asTopic(won(C2))} 묻는 값이 아닙니다.`],
    newCost: ["오른 뒤의 원가는 얼마인가?", C2, `인상 전 원가는 ${won(C)}이므로 오른 원가는 ${nt(C)}×${k(c)}=${won(C2)}입니다. 인상 전 원가 ${asObject(won(C))} 고르면 틀립니다.`],
    oldList: ["인상 전의 정가는 얼마인가?", L, `따라서 인상 전 정가는 ${won(L)}이고, 인상한 뒤 정가 ${asTopic(won(L2))} 묻는 값이 아닙니다.`],
    newProfit: ["인상한 뒤 한 개당 이익은 얼마인가?", L2 - C2, `인상 뒤 정가는 ${won(L2)}, 원가는 ${won(C2)}이므로 이익은 ${won(L2 - C2)}입니다. 이는 처음 이익 ${won(P0)}에서 ${won(Math.abs(delta))} ${delta > 0 ? "늘어난" : "줄어든"} 값과 같습니다.`],
  };
  const [question, correct, tail] = askMap[ask];
  const solve =
    p > c
      ? `${nt((p - c) / 100)}y=${nt(delta - (c / 100) * P0)}`
      : `${nt((c - p) / 100)}y=${nt((c / 100) * P0 - delta)}`;
  return {
    stem: `${asTopic(shop)} ${asObject(item)} 정가에 팔아 한 개당 ${won(P0)}의 이익을 남겨 왔다. 원가가 ${c}% 오르자 정가를 ${p}% 올렸고, 그 결과 한 개당 이익이 ${won(Math.abs(delta))} ${delta > 0 ? "늘었다" : "줄었다"}. ${question}`,
    correct,
    unit: "원",
    explanation: `인상 전 원가를 x원, 정가를 y원이라 하면 y-x=${nt(P0)}이고 이익의 변화는 ${nt(p / 100)}y-${nt(c / 100)}x=${nt(delta)}입니다. x=y-${asObject(nt(P0))} 대입하면 ${solve}이므로 y=${nt(L)}, x=${nt(C)}입니다. ${tail}`,
  };
});

// 9) 두 상품의 정가 차이와 할인율, 결제 금액으로 정가 구하기
const basketSeeds: Array<[string, string, string, number, number, number, number, number, number, "A" | "B"]> = [
  ["한 스포츠 매장", "테니스 라켓", "배드민턴 라켓", 80000, 50000, 10, 20, 1, 2, "A"],
  ["한 안경원", "선글라스", "안경테", 120000, 90000, 25, 10, 1, 1, "B"],
  ["한 베이커리", "생크림 케이크", "롤케이크", 32000, 18000, 15, 5, 2, 3, "A"],
  ["한 서점", "영어 사전", "문제집", 45000, 25000, 20, 12, 1, 4, "B"],
  ["한 화원", "난 화분", "다육 화분", 60000, 15000, 30, 20, 1, 5, "A"],
  ["한 가구점", "소파", "스툴", 400000, 80000, 15, 25, 1, 2, "B"],
];
const basketQuestions: Built[] = basketSeeds.map(([shop, A, B, LA, LB, x, y, na, nb, ask]) => {
  const D = LA - LB;
  const ka = (100 - x) / 100;
  const kb = (100 - y) / 100;
  const T = snap(na * ka * LA + nb * kb * LB);
  check(Number.isInteger(T) && D > 0, `결제액 ${T}`);
  const coef = na * ka + nb * kb;
  const lbBack = snap((T - na * ka * D) / coef);
  check(lbBack === LB, "정가 역산");
  const count = (n: number) => `${n}개`;
  return {
    stem: `${shop}에서 ${A}의 정가는 ${B}의 정가보다 ${won(D)} 비싸다. 할인 행사 기간에 ${asTopic(A)} 정가의 ${x}%, ${asTopic(B)} 정가의 ${y}%를 할인한다. 한 손님이 ${A} ${togetherWith(count(na))} ${B} ${asObject(count(nb))} 사고 ${asObject(won(T))} 냈다면 ${ask === "A" ? A : B}의 정가는 얼마인가?`,
    correct: ask === "A" ? LA : LB,
    unit: "원",
    explanation: `${B}의 정가를 x원이라 하면 ${A}의 정가는 (x+${nt(D)})원입니다. 결제액은 ${na === 1 ? "" : `${na}×`}${nt(ka)}(x+${nt(D)})+${nb === 1 ? "" : `${nb}×`}${nt(kb)}x=${nt(T)}이므로 ${nt(coef)}x=${nt(T - na * ka * D)}, x=${won(LB)}입니다. ${
      ask === "A"
        ? `따라서 ${A}의 정가는 ${nt(LB)}+${nt(D)}=${won(LA)}이며, ${B}의 정가 ${asObject(won(LB))} 고르면 틀립니다.`
        : `${A}의 정가 ${asTopic(won(LA))} 다른 상품의 값이라 묻는 값이 아닙니다.`
    }`,
  };
});

// 10) 할인 판매가와 이익률로 원가와 정가를 거꾸로 구하기
type BackAsk = "cost" | "list" | "gapAmount" | "markup";
const backSeeds: Array<[string, string, number, number, number, BackAsk]> = [
  ["한 스포츠 용품점", "손목 보호대", 12000, 12, 10, "cost"],
  ["한 주방가전 대리점", "스탠드 믹서", 240000, 10, 5, "list"],
  ["한 패션 잡화점", "캐시미어 목도리", 50000, 15, 36, "gapAmount"],
  ["한 커피 용품점", "원두 그라인더", 50000, 20, 20, "list"],
  ["한 생활가전 매장", "스팀다리미", 36000, 10, 30, "cost"],
  ["한 침구 매장", "전기 담요", 48000, 20, 20, "markup"],
];
const backQuestions: Built[] = backSeeds.map(([shop, item, C, d, r, ask]) => {
  const S = snap((C * (100 + r)) / 100);
  const L = snap(S / ((100 - d) / 100));
  const m = snap(((L - C) / C) * 100);
  check(Number.isInteger(S) && Number.isInteger(L) && (ask !== "markup" || Number.isInteger(m)), `판매가 ${S}, 정가 ${L}`);
  check(snap(S / ((100 + r) / 100)) === C && snap((L * (100 - d)) / 100) === S, "역산 검산");
  const askMap: Record<BackAsk, [string, number, "원" | "%", string]> = {
    cost: [`이 ${item}의 원가는 얼마인가?`, C, "원", `묻는 것은 원가이므로 ${asSubject(won(C))} 답이고, 정가 ${asTopic(won(L))} 다른 값입니다. 판매가에서 ${r}%를 빼 ${withJosa(won(snap((S * (100 - r)) / 100)), "으로", "로")} 계산하면 이익률의 기준이 원가라는 점을 놓쳐 틀립니다.`],
    list: [`이 ${item}의 정가는 얼마인가?`, L, "원", `묻는 것은 정가이므로 ${asSubject(won(L))} 답입니다. 판매가에 ${d}%를 더한 ${asTopic(won(snap((S * (100 + d)) / 100)))} 할인의 기준이 정가라는 점을 놓친 값이라 틀립니다.`],
    gapAmount: [`이 ${item}의 정가와 원가의 차이는 얼마인가?`, L - C, "원", `따라서 정가와 원가의 차이는 ${nt(L)}-${nt(C)}=${won(L - C)}입니다. 판매가와 원가의 차이 ${asTopic(won(S - C))} 할인 뒤 이익이라 묻는 값이 아닙니다.`],
    markup: [`정가를 정할 때 원가에 몇 %의 이익을 붙였는가?`, m, "%", `정가는 원가보다 ${won(L - C)} 비싸므로 원가에 붙인 이익률은 ${m}%입니다. 할인율과 이익률을 더한 ${d + r}%는 두 비율의 기준이 다르다는 점을 놓친 값입니다.`],
  };
  const [question, correct, unit, tail] = askMap[ask];
  return {
    stem: `${shop}에서 ${asObject(item)} 정가의 ${d}%를 할인한 ${won(S)}에 팔았더니 원가의 ${r}%만큼 이익이 남았다. ${question}`,
    correct,
    unit,
    gap: unit === "%" ? 5 : undefined,
    explanation: `판매가 ${asTopic(won(S))} 원가의 ${100 + r}%이므로 원가는 ${nt(S)}÷${k(r)}=${won(C)}입니다. 또 판매가는 정가의 ${100 - d}%이므로 정가는 ${nt(S)}÷${k(-d)}=${won(L)}입니다. ${tail}`,
  };
});

const built: Built[] = [
  ...cutQuestions,
  ...targetQuestions,
  ...rateQuestions,
  ...stockQuestions,
  ...pairQuestions,
  ...volumeQuestions,
  ...profitQuestions,
  ...hikeQuestions,
  ...basketQuestions,
  ...backQuestions,
];
check(built.length === 60, `문항 수 ${built.length}`);
check(new Set(built.map((item) => item.stem)).size === 60, "중복 지문");

export const CM_COST_EXTRA: ExampleQuestion[] = built.map((item, i) =>
  defineQuestion(CATEGORY, KIND, KIND_NAME, 20 + i, {
    stem: item.stem,
    ...sortedChoices(item.correct, item.unit, i % 5, item.gap),
    explanation: item.explanation,
  }),
);
