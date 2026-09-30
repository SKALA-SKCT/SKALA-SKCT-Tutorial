import type { ExampleQuestion } from "../catalog";
import { defineQuestion } from "../exampleBanks/bankUtils";

// cm-probability-1: 문제 세트와 랜덤 문제에만 쓰는 추가 문항 60개 (id 번호 21~80)

const CATEGORY = "creative-math";
const KIND_ID = "cm-probability-1";
const KIND_NAME = "‘적어도 하나’ 확률 (여사건)";

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

type Frac = [number, number];

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}
function fr(n: number, d: number): Frac {
  if (d <= 0) throw new Error(`분모 오류: ${n}/${d}`);
  const g = gcd(n, d);
  return [n / g, d / g];
}
const sub = (a: Frac, b: Frac) => fr(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
const add = (a: Frac, b: Frac) => fr(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const mul = (a: Frac, b: Frac) => fr(a[0] * b[0], a[1] * b[1]);
const ONE: Frac = [1, 1];
const txt = (f: Frac) => `${f[0]}/${f[1]}`;
const val = (f: Frac) => f[0] / f[1];
const same = (a: Frac, b: Frac) => a[0] === b[0] && a[1] === b[1];
const inOpenUnit = (f: Frac) => f[0] > 0 && f[0] < f[1];

function comb(n: number, r: number) {
  if (r < 0 || r > n) return 0;
  const k = Math.min(r, n - r);
  let result = 1;
  for (let i = 1; i <= k; i += 1) result = (result * (n - k + i)) / i;
  return result;
}

/** 정답 분모를 기준으로 같은 분모 계열의 기약분수 후보를 만든다. 분모가 작으면 2배, 3배 분모까지 넓힌다. */
function fractionPool(answer: Frac) {
  const dens = answer[1] < 8 ? [answer[1], answer[1] * 2, answer[1] * 3] : [answer[1]];
  const pool: Frac[] = [];
  for (const d of dens)
    for (let k = 1; k < d; k += 1) {
      const f = fr(k, d);
      if (!pool.some((item) => same(item, f))) pool.push(f);
    }
  return pool;
}

/** 함정 선지를 넣고 나머지를 정답과 가까운 값으로 채워, 정답이 오름차순 rank번째에 오게 한다. */
function arrange(correct: Frac, traps: Frac[], rank: number) {
  const chosen: Frac[] = [];
  for (const trap of traps)
    if (inOpenUnit(trap) && !same(trap, correct) && !chosen.some((item) => same(item, trap)))
      chosen.push(trap);
  const pool = fractionPool(correct).filter(
    (f) => !same(f, correct) && !chosen.some((item) => same(item, f)),
  );
  const lower = pool.filter((f) => val(f) < val(correct)).sort((a, b) => val(b) - val(a));
  const upper = pool.filter((f) => val(f) > val(correct)).sort((a, b) => val(a) - val(b));
  const remaining = 4 - chosen.length;
  const below = chosen.filter((f) => val(f) < val(correct)).length;
  const wantBelow = Math.max(0, Math.min(remaining, rank - below));
  const fills = [...lower.slice(0, wantBelow)];
  fills.push(...upper.slice(0, remaining - fills.length));
  if (fills.length < remaining) fills.push(...lower.slice(wantBelow, wantBelow + remaining - fills.length));
  const all = [correct, ...chosen, ...fills].sort((a, b) => val(a) - val(b));
  if (all.length !== 5 || new Set(all.map(val)).size !== 5)
    throw new Error(`선지 구성 실패: ${txt(correct)} / ${all.map(txt).join(", ")}`);
  const choices = all.map(txt);
  return { choices, answer: choices.indexOf(txt(correct)) };
}

interface Built {
  stem: string;
  correct: Frac;
  body: string;
  notes: Array<[Frac, string]>;
}

/** 선지로 쓸 수 있는 함정만 남긴다. 해설에는 실제 선지에 들어간 함정의 설명만 붙인다. */
function withTraps(stem: string, correct: Frac, body: string, notes: Array<[Frac, string]>): Built {
  const kept: Array<[Frac, string]> = [];
  for (const [trap, note] of notes)
    if (
      inOpenUnit(trap) &&
      trap[1] <= Math.max(30, correct[1]) &&
      !same(trap, correct) &&
      !kept.some(([item]) => same(item, trap))
    )
      kept.push([trap, note]);
  if (!kept.length) throw new Error(`함정 선지 없음: ${stem}`);
  return { stem, correct, body, notes: kept };
}

// 1) 비복원 추출: N개 중 특수한 것 S개, k개를 동시에 고를 때 적어도 하나
const drawSeeds = [
  [8, 2, 3, "사내 사진전에 출품된 작품", "흑백 작품", "점", "골라 먼저 심사할"],
  [9, 3, 3, "주말 장터에 나온 화분", "다육 식물 화분", "개", "골라 진열대 앞줄에 놓을"],
  [9, 2, 3, "신제품 시음회에 준비한 음료", "무가당 음료", "잔", "골라 맛볼"],
  [10, 2, 3, "연구소 서버실의 저장 장치", "교체 시기가 지난 장치", "대", "골라 점검할"],
  [10, 3, 3, "사내 공모전에 접수된 제안서", "비용 절감 제안서", "건", "골라 1차 발표에 올릴"],
  [10, 4, 3, "도시락 가게에 들어온 주문", "저염식 주문", "건", "골라 먼저 조리할"],
  [9, 5, 2, "리조트의 빈 객실", "바다 전망 객실", "개", "단체 손님에게 배정할"],
  [11, 5, 2, "캠핑장의 빈자리", "전기 사용이 가능한 자리", "곳", "배정받을"],
  [11, 6, 2, "시립 합창단 단원", "테너", "명", "골라 무대 인사를 맡길"],
  [12, 3, 2, "무인 택배 보관함의 빈칸", "냉장 칸", "칸", "배정받을"],
  [12, 5, 2, "대여소에 세워 둔 공유 자전거", "전기 자전거", "대", "빌릴"],
  [12, 6, 2, "단편 영화제 상영작", "다큐멘터리", "편", "골라 관람할"],
  [8, 3, 3, "워크숍 조별 과제 주제", "현장 조사형 주제", "개", "뽑아 조에 배정할"],
  [7, 2, 2, "3층의 소회의실", "화상 장비가 있는 회의실", "곳", "예약할"],
] as const;

function buildDraw([N, S, k, pool, special, unit, verb]: (typeof drawSeeds)[number]): Built {
  const all = comb(N, k);
  const none = comb(N - S, k);
  const complement = fr(none, all);
  const correct = sub(ONE, complement);
  const single = fr(S, N);
  const naive = fr(S * k, N);
  if (!same(add(correct, complement), ONE)) throw new Error("비복원 추출 역검산 실패");
  if (none + (all - none) !== all || all - none <= 0) throw new Error("비복원 추출 경우의 수 오류");
  return withTraps(
    `${pool} ${N}${unit} 중 ${asTopic(special)} ${S}${unit}이다. 이 가운데 ${asObject(`${k}${unit}`)} 무작위로 ${verb} 때, ${asSubject(special)} 적어도 한 ${unit} 포함될 확률은?`,
    correct,
    `전체 경우는 ${N}C${k}=${all}가지이고, ${asSubject(special)} 하나도 포함되지 않는 경우는 나머지 ${N - S}${unit}에서만 고르는 ${N - S}C${k}=${none}가지입니다. 적어도 한 ${unit} 포함될 확률은 여사건을 빼서 1-${none}/${all}=${txt(correct)}입니다.`,
    [
      [complement, "하나도 포함되지 않을 확률입니다."],
      [naive, `한 ${unit}만 뽑을 때의 확률 ${txt(single)}의 ${k}배로, ${asSubject(`여러 ${unit}`)} 함께 포함되는 경우를 중복해서 센 값입니다.`],
    ],
  );
}

// 2) 두 집단에서 함께 고를 때 양쪽이 적어도 하나씩 포함될 확률
const eachSeeds = [
  [4, 5, 3, "한 구청 민원실에는", "오전 근무자", "오후 근무자", "명", "뽑아 친절 교육에 보낼"],
  [3, 6, 3, "과일 바구니에는", "사과", "배", "개", "꺼내 손님상에 올릴"],
  [3, 7, 3, "연구실 냉장고에는", "대조군 시약", "실험군 시약", "병", "꺼내 분석할"],
  [4, 6, 3, "사내 풋살 동호회에는", "수비수", "공격수", "명", "뽑아 친선전 선발로 내보낼"],
  [5, 6, 3, "어린이 도서관 행사장에는", "그림책 작가", "동화 작가", "명", "골라 첫 사인회를 맡길"],
  [2, 6, 3, "화물 창고 입구에는", "냉동 컨테이너", "일반 컨테이너", "대", "골라 먼저 하역할"],
  [2, 7, 3, "사진관 예약 명단에는", "가족 손님", "개인 손님", "팀", "골라 오전 촬영을 배정할"],
  [3, 4, 3, "고객 설문 응답지 묶음에는", "만족 응답지", "불만족 응답지", "장", "뽑아 사례로 소개할"],
  [3, 7, 4, "요리 경연 본선에는", "한식 참가자", "양식 참가자", "명", "뽑아 결승 조를 짤"],
  [2, 6, 4, "전시장 창고에는", "대형 조형물", "소형 조형물", "점", "골라 입구에 배치할"],
] as const;

function buildEach([a, b, k, ctx, A, B, unit, verb]: (typeof eachSeeds)[number]): Built {
  const all = comb(a + b, k);
  const onlyA = comb(a, k);
  const onlyB = comb(b, k);
  const complement = fr(onlyA + onlyB, all);
  const correct = sub(ONE, complement);
  if (!same(add(correct, complement), ONE)) throw new Error("양쪽 포함 역검산 실패");
  const onlyAText =
    onlyA === 0
      ? `${asTopic(A)} ${a}${unit}뿐이라 ${A}만 ${k}${unit} 고르는 경우는 없고,`
      : `${A}만 고르는 경우는 ${a}C${k}=${onlyA}가지이고,`;
  const notes: Array<[Frac, string]> = [[complement, "한쪽 집단에서만 뽑힐 확률입니다."]];
  if (onlyA > 0)
    notes.push([sub(ONE, fr(onlyB, all)), `${B}만 뽑히는 경우만 빼고 ${A}만 뽑히는 경우를 빠뜨린 값입니다.`]);
  else notes.push([fr(onlyB, all), `${B}만 뽑힐 확률로, 구하는 사건의 여사건입니다.`]);
  return withTraps(
    `${ctx} ${A} ${a}${unit}, ${B} ${asSubject(`${b}${unit}`)} 있다. 이 중 ${asObject(`${k}${unit}`)} 무작위로 ${verb} 때, ${togetherWith(A)} ${asSubject(B)} 적어도 한 ${unit}씩 포함될 확률은?`,
    correct,
    `전체 경우는 ${a + b}C${k}=${all}가지입니다. 한쪽만 뽑히는 경우를 빼면 되는데, ${onlyAText} ${B}만 고르는 경우는 ${b}C${k}=${onlyB}가지입니다. 따라서 적어도 한 ${unit}씩 포함될 확률은 1-${onlyA + onlyB}/${all}=${txt(correct)}입니다.`,
    notes,
  );
}

// 3) k=3개를 고를 때 특수한 것이 적어도 두 개 포함될 확률
const twoPlusSeeds = [
  [8, 3, "학술 대회에 접수된 포스터", "해외 연구진 포스터", "편", "골라 우수작 후보로 올릴"],
  [8, 5, "시식 코너에 준비된 떡", "팥소가 든 떡", "개", "집어 맛볼"],
  [10, 4, "마라톤 동호회 회원", "풀코스 완주 경험자", "명", "뽑아 대회 선발대로 보낼"],
  [10, 6, "사내 주차장 등록 차량", "전기차", "대", "골라 충전 시설 설문을 받을"],
  [12, 5, "응급실 야간 근무 신청자", "숙련 간호사", "명", "뽑아 첫 주 근무를 맡길"],
  [12, 7, "가구점 전시 의자", "원목 의자", "개", "골라 할인 행사에 내놓을"],
  [6, 4, "라디오 게시판에 올라온 사연", "여행 사연", "편", "골라 방송에서 소개할"],
  [5, 3, "학교 축제 공연 신청 팀", "댄스 팀", "팀", "뽑아 개막 무대에 세울"],
  [7, 5, "농산물 직판장의 수박", "당도가 높은 수박", "통", "골라 선물 상자에 담을"],
  [10, 5, "정비소에 입고된 오토바이", "배터리 교체가 필요한 오토바이", "대", "골라 먼저 정비할"],
] as const;

function buildTwoPlus([N, S, pool, special, unit, verb]: (typeof twoPlusSeeds)[number]): Built {
  const all = comb(N, 3);
  const zero = comb(N - S, 3);
  const one = S * comb(N - S, 2);
  const two = comb(S, 2) * (N - S);
  const three = comb(S, 3);
  if (zero + one + two + three !== all) throw new Error("적어도 두 개 역검산 실패");
  const correct = sub(ONE, fr(zero + one, all));
  if (!same(correct, fr(two + three, all))) throw new Error("적어도 두 개 직접 계산 불일치");
  const zeroText =
    zero === 0
      ? `나머지가 ${N - S}${unit}뿐이라 ${asSubject(special)} 0${unit}인 경우는 없으므로, 여사건은 1${unit}인 경우 ${S}×${N - S}C2=${one}가지뿐입니다.`
      : `여사건은 ${asSubject(special)} 0${unit}인 경우 ${N - S}C3=${zero}가지와 1${unit}인 경우 ${S}×${N - S}C2=${one}가지를 합한 ${zero + one}가지입니다.`;
  return withTraps(
    `${pool} ${N}${unit} 중 ${asTopic(special)} ${S}${unit}이다. 이 가운데 ${asObject(`3${unit}`)} 무작위로 ${verb} 때, ${asSubject(special)} 적어도 두 ${unit} 포함될 확률은?`,
    correct,
    `전체 경우는 ${N}C3=${all}가지입니다. ${zeroText} 따라서 적어도 두 ${unit} 포함될 확률은 1-${zero + one}/${all}=${txt(correct)}입니다.`,
    [
      [sub(ONE, fr(zero, all)), `적어도 한 ${unit} 포함될 확률입니다.`],
      [fr(two, all), `정확히 두 ${unit}인 경우만 세고 세 ${unit} 모두 포함되는 경우를 빠뜨린 값입니다.`],
    ],
  );
}

// 4) 서로 독립인 사건들 중 적어도 하나가 일어날 확률
type IndepSeed = {
  intro: string;
  items: Array<[string, number, number]>;
  event: string;
  goal: string;
};
const indepSeeds: IndepSeed[] = [
  { intro: "사내 자격시험에 두 사람이 응시했다.", items: [["김 대리", 1, 3], ["이 주임", 1, 5]], event: "합격할", goal: "두 사람 중 적어도 한 명이 합격할" },
  { intro: "신입 영업 사원 두 명이 각자 다른 거래처에 제안서를 냈다.", items: [["첫 번째 사원", 2, 5], ["두 번째 사원", 1, 3]], event: "계약을 따낼", goal: "적어도 한 명이 계약을 따낼" },
  { intro: "양궁 동아리 회원 세 명이 과녁 중앙을 한 번씩 노린다.", items: [["갑", 1, 2], ["을", 1, 3], ["병", 1, 4]], event: "중앙에 맞힐", goal: "적어도 한 명이 중앙에 맞힐" },
  { intro: "정전에 대비해 비상 발전기 두 대를 갖춰 두었다.", items: [["1호 발전기", 2, 3], ["2호 발전기", 3, 4]], event: "정전 즉시 가동될", goal: "적어도 한 대가 정전 즉시 가동될" },
  { intro: "품절된 운동화의 재입고 알림을 두 온라인 쇼핑몰에 신청했다.", items: [["A쇼핑몰", 3, 5], ["B쇼핑몰", 1, 2]], event: "이번 주에 재입고할", goal: "적어도 한 곳이 이번 주에 재입고할" },
  { intro: "바다낚시 대회에서 두 참가자가 첫 한 시간 동안 낚시를 한다.", items: [["민수", 1, 4], ["지훈", 1, 5]], event: "대어를 낚을", goal: "적어도 한 명이 대어를 낚을" },
  { intro: "소설 원고를 두 출판사에 투고했다.", items: [["가 출판사", 2, 7], ["나 출판사", 1, 2]], event: "출간을 제안할", goal: "적어도 한 곳이 출간을 제안할" },
  { intro: "탐사 대원 세 명이 각자 다른 지층에서 화석을 찾는다.", items: [["첫째 대원", 1, 3], ["둘째 대원", 2, 5], ["셋째 대원", 1, 2]], event: "화석을 발견할", goal: "적어도 한 명이 화석을 발견할" },
  { intro: "회사 건물 1층과 2층에 음료 자판기가 한 대씩 있다.", items: [["1층 자판기", 1, 6], ["2층 자판기", 3, 5]], event: "생수 품절 상태일", goal: "적어도 한 대가 생수 품절 상태일" },
  { intro: "창고에 연기 감지기와 열 감지기를 하나씩 달았다.", items: [["연기 감지기", 3, 4], ["열 감지기", 2, 5]], event: "초기 화재를 감지할", goal: "적어도 하나가 초기 화재를 감지할" },
  { intro: "세 팀이 서로 다른 공사 입찰에 참여했다.", items: [["기획팀", 1, 4], ["설계팀", 1, 3], ["시공팀", 2, 5]], event: "낙찰받을", goal: "적어도 한 팀이 낙찰받을" },
  { intro: "퀴즈 대회 결승에서 두 사람이 마지막 문제를 각자 푼다.", items: [["서연", 3, 8], ["도윤", 1, 3]], event: "정답을 맞힐", goal: "적어도 한 명이 정답을 맞힐" },
  { intro: "늦잠을 막으려고 알람 두 개를 맞춰 두었다.", items: [["휴대전화 알람", 2, 3], ["탁상시계 알람", 1, 5]], event: "잠을 깨울", goal: "적어도 하나가 잠을 깨울" },
  { intro: "카페 계산대 앞에 손님 두 명이 줄을 서 있다.", items: [["앞 손님", 3, 10], ["뒤 손님", 1, 2]], event: "할인 쿠폰을 쓸", goal: "적어도 한 명이 할인 쿠폰을 쓸" },
  { intro: "중고 카메라 매장 세 곳에 원하는 모델의 재고를 문의했다.", items: [["동문점", 1, 5], ["서문점", 1, 4], ["남문점", 1, 3]], event: "원하는 모델을 보유하고 있을", goal: "적어도 한 곳이 원하는 모델을 보유하고 있을" },
];

function buildIndep(seed: IndepSeed): Built {
  const probs = seed.items.map(([, n, d]) => fr(n, d));
  const fails = probs.map((p) => sub(ONE, p));
  const none = fails.reduce(mul, ONE);
  const correct = sub(ONE, none);
  const allSucceed = probs.reduce(mul, ONE);
  const sum = probs.reduce(add, [0, 1] as Frac);
  if (!same(add(correct, none), ONE)) throw new Error("독립 사건 역검산 실패");
  const facts = seed.items
    .map(([name], i) => `${asSubject(name)} ${seed.event} 확률은 ${txt(probs[i])}`)
    .join(", ");
  const tail = inOpenUnit(sum) ? "" : " 각 확률을 그대로 더하면 1 이상이 되어 확률이 될 수 없으므로 덧셈으로는 구할 수 없습니다.";
  return withTraps(
    `${seed.intro} ${facts}이다. 각자의 결과가 서로 영향을 주지 않을 때, ${seed.goal} 확률은?`,
    correct,
    `적어도 하나가 일어나는 사건의 여사건은 모두 일어나지 않는 경우입니다. 각각 일어나지 않을 확률은 ${fails.map(txt).join(", ")}이고 서로 독립이므로 모두 일어나지 않을 확률은 ${fails.map(txt).join("×")}=${txt(none)}입니다. 따라서 구하는 확률은 1-${txt(none)}=${txt(correct)}입니다.${tail}`,
    [
      [none, "모두 일어나지 않을 확률입니다."],
      [sum, "각 확률을 그대로 더해 동시에 일어나는 경우를 두 번 센 값입니다."],
      [allSucceed, "모두 일어날 확률입니다."],
    ],
  );
}

// 5) 같은 시행을 독립적으로 n번 반복할 때 적어도 한 번
const repeatSeeds = [
  [1, 3, 2, "현우가 3점 슛을 한 번 던져 성공할 확률은", "3점 슛을", "던질 때, 적어도 한 번 성공할 확률은?"],
  [1, 4, 2, "편의점 경품 응모에 한 번 참여해 당첨될 확률은", "경품 응모에", "참여할 때, 적어도 한 번 당첨될 확률은?"],
  [2, 5, 2, "게임 속 장비 강화를 한 번 시도해 성공할 확률은", "강화를", "시도할 때, 적어도 한 번 성공할 확률은?"],
  [1, 2, 3, "공정한 동전 한 개를 던져 앞면이 나올 확률은", "동전을", "던질 때, 적어도 한 번 앞면이 나올 확률은?"],
  [1, 5, 2, "한 타자가 한 타석에서 안타를 칠 확률은", "타석에", "들어설 때, 적어도 한 번 안타를 칠 확률은?"],
  [1, 3, 3, "행사장 원판을 한 번 돌려 당첨 칸에 멈출 확률은", "원판을", "돌릴 때, 적어도 한 번 당첨 칸에 멈출 확률은?"],
  [3, 5, 2, "수습 제빵사가 마카롱 반죽 한 판을 매끈하게 구워 낼 확률은", "반죽을", "구울 때, 적어도 한 번 매끈하게 구워 낼 확률은?"],
  [2, 3, 2, "촬영용 드론이 한 번의 비행에서 목표 지점에 정확히 착륙할 확률은", "착륙 비행을", "시도할 때, 적어도 한 번 정확히 착륙할 확률은?"],
  [1, 6, 2, "주사위 한 개를 던져 6의 눈이 나올 확률은", "주사위를", "던질 때, 적어도 한 번 6의 눈이 나올 확률은?"],
  [3, 4, 2, "훈련 조종사가 모의 착륙 평가를 한 번 치러 통과할 확률은", "평가를", "치를 때, 적어도 한 번 통과할 확률은?"],
  [2, 3, 3, "오래된 승용차가 추운 아침에 한 번의 시도로 시동이 걸릴 확률은", "시동을", "걸어 볼 때, 적어도 한 번 시동이 걸릴 확률은?"],
] as const;

function buildRepeat([n, d, times, first, pre, suf]: (typeof repeatSeeds)[number]): Built {
  const p = fr(n, d);
  const q = sub(ONE, p);
  let none: Frac = ONE;
  let all: Frac = ONE;
  for (let i = 0; i < times; i += 1) {
    none = mul(none, q);
    all = mul(all, p);
  }
  const correct = sub(ONE, none);
  if (!same(add(correct, none), ONE)) throw new Error("반복 시행 역검산 실패");
  return withTraps(
    `${first} ${txt(p)}이다. ${pre} 서로 독립적으로 ${times}번 ${suf}`,
    correct,
    `한 번에 일어나지 않을 확률은 1-${txt(p)}=${txt(q)}입니다. ${times}번 모두 일어나지 않을 확률은 (${txt(q)})^${times}=${txt(none)}이므로, 적어도 한 번 일어날 확률은 1-${txt(none)}=${txt(correct)}입니다.`,
    [
      [none, "한 번도 일어나지 않을 확률입니다."],
      [fr(n * times, d), `한 번의 확률 ${txt(p)}의 ${times}배로, 여러 번 일어나는 경우를 중복해서 센 값입니다.`],
      [all, `${times}번 모두 일어날 확률입니다.`],
    ],
  );
}

const built: Built[] = [
  ...drawSeeds.map(buildDraw),
  ...eachSeeds.map(buildEach),
  ...twoPlusSeeds.map(buildTwoPlus),
  ...indepSeeds.map(buildIndep),
  ...repeatSeeds.map(buildRepeat),
];

if (built.length !== 60) throw new Error(`확률 추가 문항 수 오류: ${built.length}`);

// 함정 조합과 정답 자리를 함께 바꿔 보며, 지금까지 가장 적게 쓰인 자리를 골라 정답 위치를 고르게 퍼뜨린다.
const positionCounts = [0, 0, 0, 0, 0];
const arranged = built.map((item) => {
  const traps = item.notes.map(([trap]) => trap);
  const subsets = Array.from({ length: (1 << traps.length) - 1 }, (_, m) =>
    traps.filter((__, j) => ((m + 1) >> j) & 1),
  ).sort((a, b) => b.length - a.length);
  const options = [0, 1, 2, 3, 4].flatMap((rank) => {
    for (const subset of subsets) {
      const result = arrange(item.correct, subset, rank);
      if (result.answer === rank) return [result];
    }
    return [];
  });
  if (!options.length) throw new Error(`선지 배치 실패: ${item.stem}`);
  const pick = options.reduce((best, result) =>
    positionCounts[result.answer] < positionCounts[best.answer] ? result : best,
  );
  positionCounts[pick.answer] += 1;
  return pick;
});
if (positionCounts.some((count) => count < 10 || count > 14))
  throw new Error(`확률 정답 위치 분포 불균형: ${positionCounts.join("/")}`);

export const CM_PROBABILITY_EXTRA: ExampleQuestion[] = built.map((item, i) => {
  const { choices, answer } = arranged[i];
  if (choices[answer] !== txt(item.correct)) throw new Error("정답 선지 불일치");
  if (!/적어도/.test(item.stem)) throw new Error("적어도 조건 누락");
  const trapNotes = item.notes
    .filter(([trap]) => choices.includes(txt(trap)))
    .map(([trap, note]) => `${txt(trap)} 선지는 ${note}`);
  return defineQuestion(CATEGORY, KIND_ID, KIND_NAME, 20 + i, {
    stem: item.stem,
    choices,
    answer,
    explanation: [item.body, ...trapNotes].join(" "),
  });
});
