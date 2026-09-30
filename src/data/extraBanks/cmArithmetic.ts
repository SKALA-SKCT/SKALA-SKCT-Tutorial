import type { ExampleQuestion } from "../catalog";
import { defineQuestion } from "../exampleBanks/bankUtils";

// cm-arithmetic-1: 문제 세트와 랜덤 문제에만 쓰는 추가 문항 60개 (id 번호 21~80)
const CATEGORY = "creative-math";
const KIND = "cm-arithmetic-1";
const KIND_NAME = "증감 연립방정식";

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
const asMeans = (value: string) => withJosa(value, "으로", "로");
const togetherWith = (value: string) => withJosa(value, "과", "와");
const wasPast = (value: string) => withJosa(value, "이었다", "였다");

function nt(value: number) {
  const rounded = Number(value.toFixed(4));
  return Number.isInteger(rounded) ? rounded.toLocaleString("en-US") : String(rounded);
}
function check(condition: boolean, message: string) {
  if (!condition) throw new Error(`[${KIND}] 검산 실패: ${message}`);
}
/** 부동소수점 꼬리만 걷어 낸다. 실제로 나누어떨어지지 않는 값은 그대로 두어 check에서 걸린다. */
function snap(value: number) {
  return Math.abs(value - Math.round(value)) < 1e-9 ? Math.round(value) : value;
}

const STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000];

/** 실전 선지처럼 같은 간격으로 오름차순 배열하고, 정답 자리는 문항 번호로 고르게 돌린다. */
function sortedChoices(correct: number, format: (value: number) => string, position: number) {
  check(Number.isInteger(correct) && correct > 0, `정답이 양의 정수가 아님: ${correct}`);
  const gap = [...STEPS].reverse().find((step) => step <= correct / 8) ?? 1;
  const values = [0, 1, 2, 3, 4].map((k) => correct + gap * (k - position));
  check(values[0] > 0, `0 이하 선지: ${values.join(", ")}`);
  return { choices: values.map(format), answer: position };
}

const PERIODS = {
  year: ["작년", "올해"],
  month: ["지난달", "이번 달"],
  week: ["지난주", "이번 주"],
  quarter: ["1분기", "2분기"],
  term: ["지난 학기", "이번 학기"],
} as const;
type Period = keyof typeof PERIODS;
type Ask = "thisA" | "thisB" | "lastA" | "lastB" | "thisTotal" | "lastTotal";

/** 기관, 첫째 항목, 둘째 항목, 측정값, 단위, 기간 */
type Scene = [string, string, string, string, string, Period];

interface Solved {
  scene: Scene;
  a: number;
  b: number;
  ra: number;
  /** 둘째 항목 변화. 비율 문항은 %, 절대량 문항은 단위 값 */
  rb: number;
  rbIsAbsolute?: boolean;
  ask: Ask;
}

function tools([org, first, second, measure, unit, period]: Scene) {
  const [prev, cur] = PERIODS[period];
  const N = (value: number) => `${nt(value)}${unit === "만 원" ? "만 원" : unit}`;
  const how = unit === "만 원" ? "얼마인가?" : `몇 ${unit}인가?`;
  const pct = (rate: number) => `${Math.abs(rate)}% ${rate > 0 ? "증가" : "감소"}`;
  const k = (rate: number) => nt((100 + rate) / 100);
  return { org, first, second, measure, unit, prev, cur, N, how, pct, k };
}

/** 묻는 값과 마지막 해설 문장을 만든다. a, b는 이전 기간 값이다. */
function finish(s: Solved) {
  const t = tools(s.scene);
  const a2 = snap((s.a * (100 + s.ra)) / 100);
  const b2 = s.rbIsAbsolute ? s.b + s.rb : snap((s.b * (100 + s.rb)) / 100);
  check([a2, b2].every((v) => Number.isInteger(v) && v > 0), `변화 후 값 ${a2}, ${b2}`);
  const bRule = s.rbIsAbsolute
    ? `${nt(s.b)}${s.rb >= 0 ? "+" : "-"}${nt(Math.abs(s.rb))}`
    : `${nt(s.b)}×${t.k(s.rb)}`;
  const map: Record<Ask, [string, number, string]> = {
    thisA: [
      `${t.cur} ${t.first} ${asTopic(t.measure)} ${t.how}`,
      a2,
      `따라서 ${t.cur} ${t.first} ${asTopic(t.measure)} ${nt(s.a)}×${t.k(s.ra)}=${t.N(a2)}입니다. ${t.prev} 값 ${asTopic(t.N(s.a))} 증감을 반영하기 전이라 답이 아닙니다.`,
    ],
    thisB: [
      `${t.cur} ${t.second} ${asTopic(t.measure)} ${t.how}`,
      b2,
      `따라서 ${t.cur} ${t.second} ${asTopic(t.measure)} ${bRule}=${t.N(b2)}입니다. ${t.prev} 값 ${asTopic(t.N(s.b))} 증감을 반영하기 전이라 답이 아닙니다.`,
    ],
    lastA: [
      `${t.prev} ${t.first} ${asTopic(t.measure)} ${t.how}`,
      s.a,
      `따라서 ${t.prev} ${t.first} ${asTopic(t.measure)} ${t.N(s.a)}입니다. ${asTopic(t.N(a2))} ${t.cur} 값이라 묻는 값이 아닙니다.`,
    ],
    lastB: [
      `${t.prev} ${t.second} ${asTopic(t.measure)} ${t.how}`,
      s.b,
      `따라서 ${t.prev} ${t.second} ${asTopic(t.measure)} ${t.N(s.b)}입니다. ${asTopic(t.N(b2))} ${t.cur} 값이라 묻는 값이 아닙니다.`,
    ],
    thisTotal: [
      `${t.cur} ${togetherWith(t.first)} ${t.second}의 ${t.measure} 합계는 ${t.how}`,
      a2 + b2,
      `${t.cur} 값은 ${t.first} ${t.N(a2)}, ${t.second} ${asMeans(t.N(b2))} 합계는 ${t.N(a2 + b2)}입니다. ${t.prev} 합계 ${asTopic(t.N(s.a + s.b))} 증감을 반영하기 전이라 답이 아닙니다.`,
    ],
    lastTotal: [
      `${t.prev} ${togetherWith(t.first)} ${t.second}의 ${t.measure} 합계는 ${t.how}`,
      s.a + s.b,
      `따라서 ${t.prev} 합계는 ${nt(s.a)}+${nt(s.b)}=${t.N(s.a + s.b)}입니다. ${t.cur} 합계 ${asTopic(t.N(a2 + b2))} 증감을 반영한 뒤의 값이라 묻는 값이 아닙니다.`,
    ],
  };
  const [question, correct, tail] = map[s.ask];
  return { t, a2, b2, question, correct, tail };
}

/** 계수와 문자를 부호에 맞게 이어 붙인다. 예: signedTerms([[0.1, "x"], [-0.05, "y"]]) → 0.1x-0.05y */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function signedTerms(terms: Array<[number, string]>) {
  return terms
    .map(([coef, name], index) => {
      const body = `${Math.abs(coef) === 1 ? "" : nt(Math.abs(coef))}${name}`;
      if (coef < 0) return `-${body}`;
      return index === 0 ? body : `+${body}`;
    })
    .join("");
}

interface Built {
  stem: string;
  correct: number;
  unit: string;
  explanation: string;
}

type RateSeed = [Scene, number, number, number, number, Ask];

// 1) 두 기간의 합계가 모두 주어짐
const totalSeeds: RateSeed[] = [
  [["한 제과 회사", "쿠키", "케이크", "판매량", "상자", "year"], 1200, 800, 15, -10, "thisB"],
  [["시립 도서관", "본관", "분관", "대출 권수", "권", "month"], 3500, 1500, -8, 20, "thisA"],
  [["한 통신사", "기본 요금제", "무제한 요금제", "가입자 수", "명", "year"], 4200, 2800, 5, 25, "lastB"],
  [["한 택배 회사", "동부 센터", "서부 센터", "처리 건수", "건", "week"], 6000, 4000, -15, 30, "thisB"],
  [["한 자동차 영업소", "세단", "SUV", "계약 대수", "대", "quarter"], 450, 350, 20, -20, "lastA"],
  [["한 과수원", "사과", "배", "수확량", "상자", "year"], 2400, 1600, -25, 10, "thisA"],
  [["한 시립 박물관", "평일", "주말", "관람객 수", "명", "year"], 18000, 22000, 12, -5, "thisB"],
  [["한 헬스장", "오전반", "저녁반", "회원 수", "명", "month"], 260, 340, 25, -15, "thisA"],
  [["한 온라인 쇼핑몰", "의류", "잡화", "매출액", "만 원", "month"], 3600, 2400, -5, 35, "thisB"],
  [["한 구청 민원실", "방문 민원", "온라인 민원", "처리 건수", "건", "quarter"], 1500, 2500, -20, 16, "lastB"],
];
const totalQuestions: Built[] = totalSeeds.map(([scene, a, b, ra, rb, ask]) => {
  const f = finish({ scene, a, b, ra, rb, ask });
  const { t } = f;
  const T = a + b;
  const T2 = f.a2 + f.b2;
  // 역검산: 화면에 보이는 합계와 증감률만으로 이전 값을 다시 구한다.
  const x = snap((T2 - ((100 + rb) / 100) * T) / ((ra - rb) / 100));
  check(x === a && T - x === b, `연립 해 ${x}`);
  return {
    stem: `${t.org}의 ${t.prev} ${togetherWith(t.first)} ${t.second}의 ${t.measure} 합은 ${wasPast(t.N(T))}. ${t.cur}에는 ${t.first} ${asSubject(t.measure)} ${t.pct(ra)}하고 ${t.second} ${asTopic(t.measure)} ${t.pct(rb)}하여 합계가 ${asMeans(t.N(T2))} 집계되었다. ${f.question}`,
    correct: f.correct,
    unit: t.unit,
    // 계수가 음수로 보이지 않도록 증감률이 작은 쪽 계수를 곱해 소거한다.
    explanation: `${t.prev} ${t.first} 값을 x, ${t.second} 값을 y라 하면 x+y=${nt(T)}, ${t.k(ra)}x+${t.k(rb)}y=${nt(T2)}입니다. ${
      ra > rb
        ? `첫 식에 ${asObject(t.k(rb))} 곱해 두 번째 식에서 빼면 ${nt((ra - rb) / 100)}x=${nt(T2 - ((100 + rb) / 100) * T)}이므로 x=${nt(a)}, y=${nt(b)}입니다.`
        : `첫 식에 ${asObject(t.k(ra))} 곱해 두 번째 식에서 빼면 ${nt((rb - ra) / 100)}y=${nt(T2 - ((100 + ra) / 100) * T)}이므로 y=${nt(b)}, x=${nt(a)}입니다.`
    } ${f.tail}`,
  };
});

// 2) 합계의 증감량이 주어짐
const deltaSeeds: RateSeed[] = [
  [["한 종합병원", "내과", "외과", "외래 환자 수", "명", "month"], 1800, 1200, 10, -5, "lastA"],
  [["구립 체육센터", "수영 강좌", "요가 강좌", "수강생 수", "명", "month"], 320, 180, -15, 20, "thisA"],
  [["한 화장품 공장", "스킨", "로션", "생산량", "개", "week"], 5000, 3000, 6, -12, "thisB"],
  [["한 항공사", "국내선", "국제선", "탑승객 수", "명", "month"], 24000, 16000, -5, 15, "lastB"],
  [["한 치킨 전문점", "배달", "포장", "주문 건수", "건", "month"], 2600, 1400, 5, 20, "thisB"],
  [["한 대학교", "학부", "대학원", "신입생 수", "명", "year"], 2800, 700, -10, 30, "thisA"],
  [["한 농협 공판장", "딸기", "토마토", "출하량", "상자", "week"], 900, 600, 30, -25, "thisB"],
  [["한 영화관", "조조", "심야", "관람객 수", "명", "week"], 750, 1250, 16, -8, "lastA"],
  [["한 렌터카 업체", "경차", "승합차", "대여 건수", "건", "quarter"], 640, 360, -25, 15, "thisB"],
  [["한 인터넷 강의 플랫폼", "영어 강좌", "수학 강좌", "신청 건수", "건", "term"], 4500, 5500, 8, -4, "thisA"],
];
const deltaQuestions: Built[] = deltaSeeds.map(([scene, a, b, ra, rb, ask]) => {
  const f = finish({ scene, a, b, ra, rb, ask });
  const { t } = f;
  const T = a + b;
  const delta = f.a2 + f.b2 - T;
  check(delta !== 0, "증감량 0");
  const x = snap((delta - (rb / 100) * T) / ((ra - rb) / 100));
  check(x === a && T - x === b, `연립 해 ${x}`);
  return {
    stem: `${t.org}의 ${t.prev} ${togetherWith(t.first)} ${t.second}의 ${t.measure} 합은 ${wasPast(t.N(T))}. ${t.cur}에는 ${t.first} ${asSubject(t.measure)} ${t.pct(ra)}하고 ${t.second} ${asTopic(t.measure)} ${t.pct(rb)}하여, 합계가 ${t.prev}보다 ${t.N(Math.abs(delta))} ${delta > 0 ? "늘었다" : "줄었다"}. ${f.question}`,
    correct: f.correct,
    unit: t.unit,
    explanation: `${t.prev} ${t.first} 값을 x, ${t.second} 값을 y라 하면 x+y=${nt(T)}이고, 증감량만 모으면 ${signedTerms([[ra / 100, "x"], [rb / 100, "y"]])}=${nt(delta)}입니다. ${
      ra > rb
        ? `y=${nt(T)}-x를 대입하면 ${nt((ra - rb) / 100)}x=${nt(delta - (rb / 100) * T)}이므로 x=${nt(a)}, y=${nt(b)}입니다.`
        : `x=${nt(T)}-y를 대입하면 ${nt((rb - ra) / 100)}y=${nt(delta - (ra / 100) * T)}이므로 y=${nt(b)}, x=${nt(a)}입니다.`
    } ${f.tail}`,
  };
});

// 3) 이전 기간의 비와 합계 증감량이 주어짐
type RatioSeed = [Scene, number, number, number, number, number, Ask];
const ratioSeeds: RatioSeed[] = [
  [["한 캠핑장", "텐트 사이트", "카라반", "이용 건수", "건", "month"], 3, 2, 120, 10, -5, "thisTotal"],
  [["한 문구점", "볼펜", "형광펜", "판매량", "개", "week"], 5, 3, 100, -6, 20, "lastTotal"],
  [["한 수목원", "소나무", "단풍나무", "묘목 식재 수", "그루", "year"], 4, 1, 150, 15, -40, "thisA"],
  [["한 반찬 가게", "김치", "나물", "판매량", "팩", "week"], 2, 3, 160, 25, -10, "thisB"],
  [["한 공공 자전거 서비스", "일반 자전거", "전기 자전거", "대여 건수", "건", "month"], 7, 3, 200, -10, 30, "thisTotal"],
  [["한 스키장", "스키 강습", "보드 강습", "신청 건수", "건", "week"], 3, 5, 40, 20, -15, "thisTotal"],
  [["한 도시가스 회사", "주택", "상가", "신규 계약 건수", "건", "quarter"], 4, 3, 90, -5, 10, "lastTotal"],
  [["한 꽃집", "장미", "튤립", "판매량", "송이", "month"], 5, 4, 60, 12, 5, "thisA"],
  [["한 공연장", "1층", "2층", "좌석 판매량", "석", "month"], 3, 1, 250, -4, 24, "thisB"],
  [["한 출판사", "소설", "에세이", "발행 부수", "부", "year"], 5, 2, 400, 15, -25, "thisTotal"],
];
const ratioQuestions: Built[] = ratioSeeds.map(([scene, p, q, unitSize, ra, rb, ask]) => {
  const a = p * unitSize;
  const b = q * unitSize;
  const f = finish({ scene, a, b, ra, rb, ask });
  const { t } = f;
  const delta = f.a2 + f.b2 - a - b;
  check(delta !== 0, "증감량 0");
  const perK = (p * ra + q * rb) / 100;
  const kValue = snap(delta / perK);
  check(kValue === unitSize, `비례 상수 ${kValue}`);
  return {
    stem: `${t.org}의 ${t.prev} ${togetherWith(t.first)} ${t.second}의 ${t.measure} 비는 ${p} : ${wasPast(String(q))}. ${t.cur}에는 ${t.first} ${asSubject(t.measure)} ${t.pct(ra)}하고 ${t.second} ${asTopic(t.measure)} ${t.pct(rb)}하여, 합계가 ${t.prev}보다 ${t.N(Math.abs(delta))} ${delta > 0 ? "늘었다" : "줄었다"}. ${f.question}`,
    correct: f.correct,
    unit: t.unit,
    explanation: `${t.prev} ${t.first} 값을 ${p === 1 ? "" : p}k, ${t.second} 값을 ${q === 1 ? "" : q}k라 하면 증감량은 ${signedTerms([[(p * ra) / 100, "k"], [(q * rb) / 100, "k"]])}=${nt(perK)}k입니다. 이 값이 ${nt(delta)}이므로 k=${nt(unitSize)}이고, ${t.prev} ${t.first} 값은 ${nt(a)}, ${t.second} 값은 ${nt(b)}입니다. ${f.tail}`,
  };
});

// 4) 한쪽은 증감률, 다른 쪽은 증감량, 합계는 증감률로 주어짐
const mixedSeeds: RateSeed[] = [
  [["한 지역 축제", "먹거리 부스", "체험 부스", "방문객 수", "명", "year"], 3000, 2000, 12, -110, "thisA"],
  [["한 부품 공장", "1라인", "2라인", "생산량", "개", "week"], 4800, 3200, -5, 400, "thisB"],
  [["한 게임 회사", "PC 게임", "모바일 게임", "이용자 수", "명", "month"], 6000, 4000, 15, -400, "lastA"],
  [["한 유제품 회사", "흰 우유", "가공유", "판매량", "상자", "month"], 1500, 2500, 8, 200, "thisB"],
  [["한 관광 안내소", "한국어", "외국어", "안내 건수", "건", "month"], 700, 300, -10, 50, "thisA"],
  [["한 제약 회사", "알약", "시럽", "생산량", "상자", "quarter"], 2200, 1800, 10, -120, "thisB"],
  [["한 대형 마트", "일반 계산대", "셀프 계산대", "결제 건수", "건", "week"], 5400, 3600, -20, 1260, "thisB"],
  [["한 양식장", "광어", "우럭", "출하량", "상자", "year"], 1200, 800, 25, -200, "lastB"],
  [["한 커피 전문점", "아메리카노", "라테", "판매량", "잔", "month"], 2500, 1500, -8, 360, "thisA"],
  [["한 전기차 충전소", "급속 충전", "완속 충전", "이용 건수", "건", "quarter"], 3500, 6500, 20, -300, "thisB"],
];
const mixedQuestions: Built[] = mixedSeeds.map(([scene, a, b, ra, db, ask]) => {
  const f = finish({ scene, a, b, ra, rb: db, rbIsAbsolute: true, ask });
  const { t } = f;
  const T = a + b;
  const delta = f.a2 + f.b2 - T;
  const rate = (delta / T) * 100;
  check(Math.abs(rate * 10 - Math.round(rate * 10)) < 1e-9 && rate !== 0, `전체 증감률 ${rate}`);
  const x = snap((((T * rate) / 100 - db) * 100) / ra);
  check(x === a && T - x === b, `연립 해 ${x}`);
  return {
    stem: `${t.org}의 ${t.prev} ${togetherWith(t.first)} ${t.second}의 ${t.measure} 합은 ${wasPast(t.N(T))}. ${t.cur}에는 ${t.first} ${asSubject(t.measure)} ${t.pct(ra)}하고 ${t.second} ${asTopic(t.measure)} ${t.N(Math.abs(db))} ${db > 0 ? "늘어" : "줄어"}, 합계가 ${t.prev}보다 ${t.pct(Number(rate.toFixed(1)))}하였다. ${f.question}`,
    correct: f.correct,
    unit: t.unit,
    explanation: `합계가 ${nt(T)}의 ${nt(Math.abs(rate))}%인 ${nt(Math.abs(delta))}만큼 ${delta > 0 ? "늘었으므로" : "줄었으므로"} 합계 변화량은 ${nt(delta)}입니다. ${t.prev} ${t.first} 값을 x라 하면 ${t.first}의 변화는 ${nt(ra / 100)}x이고 ${t.second}의 변화는 ${nt(db)}이므로 ${nt(ra / 100)}x${db >= 0 ? "+" : "-"}${nt(Math.abs(db))}=${nt(delta)}, x=${nt(a)}입니다. ${t.second} 값은 ${nt(T)}-${nt(a)}=${nt(b)}입니다. ${f.tail}`,
  };
});

// 5) 변화 뒤 두 값의 차이가 주어짐
const gapSeeds: RateSeed[] = [
  [["한 동네 빵집", "식빵", "바게트", "판매량", "개", "month"], 500, 300, -20, 10, "thisTotal"],
  [["한 시청", "1구역", "2구역", "공공 와이파이 접속 건수", "건", "week"], 2000, 3000, 30, -10, "thisA"],
  [["한 태권도장", "초등부", "중등부", "원생 수", "명", "month"], 90, 60, 10, 25, "thisTotal"],
  [["한 가구 공장", "책상", "의자", "생산량", "개", "month"], 800, 1200, 15, -20, "thisB"],
  [["한 여행사", "국내 여행", "해외 여행", "예약 건수", "건", "quarter"], 1500, 900, -12, 40, "thisTotal"],
  [["한 양계 농장", "1동", "2동", "달걀 생산량", "판", "week"], 1000, 600, -5, 15, "lastA"],
  [["한 공영 주차장", "정기권", "일일권", "이용 건수", "건", "month"], 400, 600, 35, -15, "thisTotal"],
  [["한 음악 스트리밍 서비스", "가요", "팝", "재생 횟수", "회", "week"], 7000, 5000, -10, 14, "thisB"],
  [["한 수산 가공 공장", "어묵", "맛살", "생산량", "상자", "month"], 650, 350, 20, 40, "thisTotal"],
  [["한 주민센터", "오전반", "오후반", "강좌 수강생 수", "명", "term"], 240, 160, -25, 30, "thisA"],
];
const gapQuestions: Built[] = gapSeeds.map(([scene, a, b, ra, rb, ask]) => {
  const f = finish({ scene, a, b, ra, rb, ask });
  const { t } = f;
  const T = a + b;
  const d = f.a2 - f.b2;
  check(d !== 0, "차이 0");
  const ka = (100 + ra) / 100;
  const kb = (100 + rb) / 100;
  const x = snap((d + kb * T) / (ka + kb));
  check(x === a && T - x === b, `연립 해 ${x}`);
  const [big, small] = d > 0 ? [t.first, t.second] : [t.second, t.first];
  const equation =
    d > 0 ? `${t.k(ra)}x-${t.k(rb)}y=${nt(d)}` : `${t.k(rb)}y-${t.k(ra)}x=${nt(-d)}`;
  return {
    stem: `${t.org}의 ${t.prev} ${togetherWith(t.first)} ${t.second}의 ${t.measure} 합은 ${wasPast(t.N(T))}. ${t.cur}에는 ${t.first} ${asSubject(t.measure)} ${t.pct(ra)}하고 ${t.second} ${asTopic(t.measure)} ${t.pct(rb)}한 결과, ${big}의 ${asSubject(t.measure)} ${small}보다 ${t.N(Math.abs(d))} 많아졌다. ${f.question}`,
    correct: f.correct,
    unit: t.unit,
    explanation: `${t.prev} ${t.first} 값을 x, ${t.second} 값을 y라 하면 x+y=${nt(T)}, ${equation}입니다. y=${nt(T)}-x를 대입해 풀면 ${nt(ka + kb)}x=${nt(d + kb * T)}, x=${nt(a)}이고 y=${nt(b)}입니다. ${f.tail}`,
  };
});

// 6) 증가분과 감소분이 같아 합계가 그대로임
const balanceSeeds: RateSeed[] = [
  [["한 도시락 업체", "한식 도시락", "양식 도시락", "판매량", "개", "month"], 600, 400, 10, -15, "thisA"],
  [["한 정수기 렌털 회사", "가정용", "사무용", "계약 건수", "건", "quarter"], 900, 600, -20, 30, "thisB"],
  [["한 시외버스 터미널", "오전", "오후", "승차객 수", "명", "week"], 1500, 2500, 25, -15, "lastA"],
  [["한 동물병원", "강아지", "고양이", "진료 건수", "건", "month"], 1200, 800, -10, 15, "thisB"],
  [["한 가전 매장", "TV", "냉장고", "판매량", "대", "quarter"], 280, 420, 15, -10, "thisA"],
  [["한 화훼 농가", "국화", "카네이션", "출하량", "상자", "month"], 750, 250, -4, 12, "thisB"],
  [["한 청소년 수련관", "1기 캠프", "2기 캠프", "참가자 수", "명", "year"], 180, 120, 20, -30, "thisB"],
  [["한 인쇄소", "명함", "전단", "주문 건수", "건", "month"], 3200, 4800, 30, -20, "thisA"],
  [["한 실내 수영장", "성인", "어린이", "입장객 수", "명", "month"], 5600, 2400, -15, 35, "thisB"],
  [["한 제지 공장", "A4 용지", "B5 용지", "생산량", "상자", "quarter"], 4500, 1500, 6, -18, "lastB"],
];
const balanceQuestions: Built[] = balanceSeeds.map(([scene, a, b, ra, rb, ask]) => {
  const f = finish({ scene, a, b, ra, rb, ask });
  const { t } = f;
  const T = a + b;
  check(f.a2 + f.b2 === T && ra * rb < 0, "합계 불변 조건");
  const x = snap((T * Math.abs(rb)) / (Math.abs(ra) + Math.abs(rb)));
  check(x === a, `연립 해 ${x}`);
  const divisor = gcd(Math.abs(ra), Math.abs(rb));
  return {
    stem: `${t.org}의 ${t.prev} ${togetherWith(t.first)} ${t.second}의 ${t.measure} 합은 ${wasPast(t.N(T))}. ${t.cur}에는 ${t.first} ${asSubject(t.measure)} ${t.pct(ra)}하고 ${t.second} ${asTopic(t.measure)} ${t.pct(rb)}하였는데, 두 ${t.measure}의 합은 ${togetherWith(t.prev)} 같았다. ${f.question}`,
    correct: f.correct,
    unit: t.unit,
    explanation: `${t.prev} ${t.first} 값을 x, ${t.second} 값을 y라 하면, 합계가 그대로이므로 두 값의 변화량은 크기가 같습니다. ${nt(Math.abs(ra) / 100)}x=${nt(Math.abs(rb) / 100)}y이므로 x : y=${Math.abs(rb) / divisor} : ${Math.abs(ra) / divisor}이고, 합계 ${asObject(nt(T))} 이 비로 나누면 x=${nt(a)}, y=${nt(b)}입니다. ${f.tail}`,
  };
});

const built: Built[] = [
  ...totalQuestions,
  ...deltaQuestions,
  ...ratioQuestions,
  ...mixedQuestions,
  ...gapQuestions,
  ...balanceQuestions,
];
check(built.length === 60, `문항 수 ${built.length}`);
check(new Set(built.map((item) => item.stem)).size === 60, "중복 지문");

export const CM_ARITHMETIC_EXTRA: ExampleQuestion[] = built.map((item, i) =>
  defineQuestion(CATEGORY, KIND, KIND_NAME, 20 + i, {
    stem: item.stem,
    ...sortedChoices(
      item.correct,
      (value) => `${nt(value)}${item.unit === "만 원" ? "만 원" : item.unit}`,
      i % 5,
    ),
    explanation: item.explanation,
  }),
);
