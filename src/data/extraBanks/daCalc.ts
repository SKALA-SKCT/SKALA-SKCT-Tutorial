import type { ExampleQuestion } from "../catalog";
import { defineQuestion, rotateChoices, tableVisual } from "../exampleBanks/bankUtils";

// da-calc-1: 문제 세트와 랜덤 문제에만 쓰는 추가 문항 60개 (id 번호 21~80)

const CATEGORY = "data-analysis";
const MARKERS = ["①", "②", "③", "④", "⑤"];

const PERIOD_SETS = [
  ["2022년", "2023년", "2024년"],
  ["2021년", "2022년", "2023년"],
  ["2023년", "2024년", "2025년"],
  ["1분기", "2분기", "3분기"],
];

interface Topic {
  title: string;
  /** 합계를 말할 때 쓰는 묶음 이름 (예: 4개 지점). */
  group: string;
  measure: string;
  unit: string;
  labels: string[];
  scale: number;
}

const topic = (
  title: string,
  group: string,
  measure: string,
  unit: string,
  labels: string[],
  scale: number,
): Topic => ({ title, group, measure, unit, labels, scale });

const TOPICS: Topic[] = [
  topic("은행 지점별 적금 신규 계좌 수", "지점", "신규 계좌 수", "좌", ["본점", "역삼지점", "판교지점", "수원지점"], 1200),
  topic("생산 라인별 불량품 수", "라인", "불량품 수", "개", ["1라인", "2라인", "3라인", "4라인"], 300),
  topic("수영장 강습반별 수강생 수", "강습반", "수강생 수", "명", ["새벽반", "오전반", "오후반", "저녁반"], 150),
  topic("관광버스 코스별 예약 인원", "코스", "예약 인원", "명", ["역사코스", "미식코스", "자연코스", "야경코스"], 900),
  topic("품목별 농협 수매량", "품목", "수매량", "톤", ["쌀", "보리", "콩", "참깨"], 2000),
  topic("사내 식당 메뉴별 배식 인원", "메뉴", "배식 인원", "명", ["한식", "양식", "중식", "분식"], 3000),
  topic("장르별 방송 프로그램 제작 편수", "장르", "제작 편수", "편", ["예능", "드라마", "교양", "다큐멘터리"], 120),
  topic("무인 세탁소 지점별 이용 건수", "지점", "이용 건수", "건", ["시청점", "대학점", "역전점", "공단점"], 1500),
  topic("숙박 유형별 예약 건수", "유형", "예약 건수", "건", ["호텔", "리조트", "펜션", "게스트하우스"], 4000),
  topic("전통시장별 상품권 사용액", "시장", "상품권 사용액", "백만 원", ["중앙시장", "동문시장", "서문시장", "남문시장"], 800),
  topic("수목원 구역별 관람객 수", "구역", "관람객 수", "백 명", ["침엽수원", "약용식물원", "습지원", "암석원"], 200),
  topic("연수원 과정별 수료 인원", "과정", "수료 인원", "명", ["신입과정", "리더과정", "직무과정", "어학과정"], 500),
  topic("창고별 재고 수량", "창고", "재고 수량", "천 개", ["가동창고", "나동창고", "다동창고", "라동창고"], 400),
  topic("아동센터별 등록 아동 수", "센터", "등록 아동 수", "명", ["해맑음센터", "꿈나무센터", "새싹센터", "무지개센터"], 60),
  topic("정수장별 정수 처리량", "정수장", "정수 처리량", "천 톤", ["북부정수장", "남부정수장", "동부정수장", "서부정수장"], 900),
  topic("구별 LED 가로등 교체 수", "구", "가로등 교체 수", "개", ["중구", "동구", "서구", "남구"], 700),
  topic("제과 품목별 생산량", "품목", "생산량", "천 개", ["식빵", "크루아상", "케이크", "쿠키"], 300),
  topic("기업군별 해외 전시회 참가 기업 수", "기업군", "참가 기업 수", "개", ["대기업", "중견기업", "중소기업", "소상공인"], 250),
  topic("연령대별 평생교육 수강생 수", "연령대", "수강생 수", "명", ["20대", "30대", "40대", "50대", "60대"], 900),
  topic("수거 장소별 폐의약품 수거량", "장소", "수거량", "kg", ["주민센터", "약국", "보건소", "복지관"], 500),
  topic("세차 방식별 이용 건수", "방식", "이용 건수", "건", ["자동세차", "손세차", "셀프세차", "스팀세차"], 1800),
  topic("빙상 종목별 등록 선수 수", "종목", "등록 선수 수", "명", ["쇼트트랙", "피겨스케이팅", "스피드스케이팅", "아이스하키"], 400),
  topic("사내 공모전 부문별 응모 건수", "부문", "응모 건수", "건", ["아이디어", "디자인", "영상", "논문"], 250),
  topic("신선식품별 폐기량", "품목", "폐기량", "kg", ["우유", "두부", "샐러드", "과일"], 600),
  topic("공유 오피스 지점별 이용 좌석 수", "지점", "이용 좌석 수", "석", ["강남점", "성수점", "여의도점", "판교점"], 900),
  topic("보건소별 예방접종 건수", "보건소", "예방접종 건수", "건", ["동부보건소", "서부보건소", "남부보건소", "북부보건소"], 3000),
  topic("등록 방식별 반려동물 등록 수", "방식", "등록 수", "마리", ["내장형칩", "외장형칩", "인식표", "비문인식"], 2500),
  topic("좌석 등급별 공연 티켓 판매량", "등급", "판매량", "석", ["VIP석", "R석", "S석", "A석"], 1500),
  topic("용도별 드론 신고 대수", "용도", "신고 대수", "대", ["촬영용", "방제용", "배송용", "측량용"], 800),
  topic("품목별 해외 직구 통관 건수", "품목", "통관 건수", "천 건", ["의류", "화장품", "전자기기", "건강식품"], 1200),
  topic("스터디카페 이용권별 판매 건수", "이용권", "판매 건수", "건", ["1일권", "주간권", "월간권", "시간권"], 1100),
  topic("청년 주택 단지별 입주 세대 수", "단지", "입주 세대 수", "세대", ["가람단지", "나래단지", "다솜단지", "라온단지"], 300),
  topic("수종별 조림 면적", "수종", "조림 면적", "ha", ["소나무", "편백", "상수리나무", "자작나무"], 700),
  topic("식재료별 학교 급식 사용량", "식재료", "사용량", "kg", ["잡곡", "돼지고기", "닭고기", "달걀"], 1800),
  topic("캠퍼스별 기숙사 입사생 수", "캠퍼스", "입사생 수", "명", ["본캠퍼스", "의학캠퍼스", "예술캠퍼스", "공학캠퍼스"], 1200),
  topic("터미널별 승차권 발매 건수", "터미널", "발매 건수", "천 건", ["동부터미널", "서부터미널", "남부터미널", "고속터미널"], 250),
  topic("전통주 종류별 출고량", "종류", "출고량", "천 병", ["막걸리", "약주", "청주", "과실주"], 900),
  topic("부서별 연차 사용 일수", "부서", "연차 사용 일수", "일", ["인사팀", "재무팀", "영업팀", "개발팀"], 400),
  topic("설치 장소별 공공 와이파이 접속 건수", "장소", "접속 건수", "만 건", ["버스정류장", "공원", "전통시장", "주민센터"], 500),
  topic("체험 농장별 방문 학생 수", "농장", "방문 학생 수", "명", ["딸기농장", "목장", "양봉농장", "버섯농장"], 1300),
  topic("해외 공장별 생산 설비 대수", "공장", "설비 대수", "대", ["베트남공장", "인도공장", "멕시코공장", "폴란드공장"], 350),
  topic("분야별 전자책 판매량", "분야", "판매량", "천 권", ["소설", "경제경영", "자기계발", "과학"], 150),
  topic("요금제별 가입 회선 수", "요금제", "가입 회선 수", "천 회선", ["기본형", "표준형", "무제한형", "청소년형"], 700),
  topic("보일러 유형별 교체 건수", "유형", "교체 건수", "건", ["가스보일러", "전기보일러", "기름보일러", "히트펌프"], 900),
  topic("산후조리원별 이용 산모 수", "조리원", "이용 산모 수", "명", ["가온조리원", "누리조리원", "다솜조리원", "새봄조리원"], 200),
  topic("박람회 부스 유형별 배정 부스 수", "유형", "배정 부스 수", "개", ["기업관", "창업관", "해외관", "체험관"], 180),
  topic("거래 유형별 부동산 중개 계약 건수", "유형", "계약 건수", "건", ["매매", "전세", "월세", "분양권"], 1600),
  topic("실내 암벽장 지점별 회원 수", "지점", "회원 수", "명", ["강동점", "강서점", "강남점", "강북점"], 600),
  topic("방과후 교실 강좌별 수강생 수", "강좌", "수강생 수", "명", ["코딩", "로봇", "미술", "바둑"], 200),
  topic("운송 수단별 수출 화물량", "수단", "화물량", "천 톤", ["해상", "항공", "철도", "육로"], 2500),
  topic("시간대별 주차장 입차 대수", "시간대", "입차 대수", "대", ["오전", "점심", "오후", "저녁"], 1400),
  topic("분야별 시민 강좌 개설 수", "분야", "개설 강좌 수", "개", ["인문", "경제", "건강", "예술"], 90),
  topic("교량별 하루 통행 차량 수", "교량", "통행 차량 수", "천 대", ["가람대교", "누리대교", "한빛대교", "솔내대교"], 120),
  topic("업종별 소상공인 대출 지원 건수", "업종", "지원 건수", "건", ["음식업", "소매업", "서비스업", "제조업"], 1500),
  topic("품목별 중고 기부 물품 수", "품목", "기부 물품 수", "점", ["의류", "도서", "장난감", "생활용품"], 2500),
  topic("정비창별 항공기 정비 건수", "정비창", "정비 건수", "건", ["제1정비창", "제2정비창", "제3정비창", "제4정비창"], 160),
  topic("농기계 종류별 임대 건수", "종류", "임대 건수", "건", ["트랙터", "이앙기", "콤바인", "관리기"], 700),
  topic("양조장별 수제 맥주 생산량", "양조장", "생산량", "천 L", ["가람양조장", "누리양조장", "한결양조장", "솔내양조장"], 250),
  topic("인쇄물 종류별 주문량", "종류", "주문량", "천 부", ["명함", "전단지", "포스터", "책자"], 600),
  topic("가맹 업종별 지역 화폐 결제 건수", "업종", "결제 건수", "만 건", ["음식점", "학원", "병원", "마트"], 300),
];

function hasFinalConsonant(value: string) {
  const last = value.charAt(value.length - 1);
  if (/\d/.test(last)) return "0136780".includes(last);
  const code = value.charCodeAt(value.length - 1);
  return code >= 0xac00 && code <= 0xd7a3 ? (code - 0xac00) % 28 !== 0 : false;
}

const asTopic = (value: string) => `${value}${hasFinalConsonant(value) ? "은" : "는"}`;
const asSubject = (value: string) => `${value}${hasFinalConsonant(value) ? "이" : "가"}`;
const asWith = (value: string) => `${value}${hasFinalConsonant(value) ? "과" : "와"}`;

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const pick = <T,>(items: T[], random: () => number) => items[Math.floor(random() * items.length)];
const fmt = (value: number) => value.toLocaleString("en-US");
/** 해설에 쓰는 근삿값. 소수 둘째 자리까지만 보인다. */
const approx = (value: number, digits = 1) => Number(value.toFixed(digits)).toLocaleString("en-US");
/** 나누어떨어지면 등호, 아니면 근사 기호를 붙인다. */
const near = (value: number, digits = 1) =>
  `${Number(value.toFixed(digits)) === value ? "=" : "≒"} ${approx(value, digits)}`;
const distinct = (values: number[]) => new Set(values).size === values.length;

interface Row {
  label: string;
  cells: number[];
}

const rate = (from: number, to: number) => ((to - from) / from) * 100;
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

/**
 * 증가율 순위와 증가량 순위가 해설에서 소수 첫째 자리로 구분되도록 차이를 벌려 둔다.
 * 순위가 비슷하게 붙으면 반올림한 값만으로는 1위를 가를 수 없다.
 */
function buildRows(index: number, labels: string[], scale: number): Row[] {
  for (let attempt = 0; attempt < 2000; attempt += 1) {
    const random = mulberry32(index * 6007 + attempt * 99991 + 5);
    const grow = (value: number) => Math.round(value * (1 + (random() * 0.45 - 0.15)));
    const rows = labels.map((label) => {
      const first = Math.round(scale * (0.4 + 1.2 * random()));
      const second = grow(first);
      return { label, cells: [first, second, grow(second)] };
    });
    const increases = rows.map((row) => row.cells[2] - row.cells[1]);
    const rates = rows.map((row) => rate(row.cells[1], row.cells[2]));
    const sortedRates = [...rates].sort((a, b) => b - a);
    const sortedIncreases = [...increases].sort((a, b) => b - a);
    const rateGaps = sortedRates.slice(1).map((value, k) => sortedRates[k] - value);
    if (
      rows.every((row) => row.cells.every((value) => value > 0) && distinct(row.cells)) &&
      [0, 1, 2].every((period) => distinct(rows.map((row) => row.cells[period]))) &&
      distinct(increases) &&
      sortedIncreases[0] > 0 &&
      sortedIncreases[0] - sortedIncreases[1] >= 2 &&
      sortedRates[0] > 0 &&
      rateGaps.every((gap) => gap >= 0.4) &&
      increases.some((value) => value < 0)
    )
      return rows;
  }
  throw new Error(`표 생성 실패: ${index}`);
}

interface Claim {
  template: string;
  text: string;
  truth: boolean;
  fact: string;
}

interface Pair {
  t: Claim;
  f: Claim;
}

/**
 * ‘x% 이상/미만’ 문장의 기준값을 고른다.
 * 실제 값과 기준값 사이를 0.3%p 이상 띄워 반올림 방식에 따라 판단이 갈리지 않게 한다.
 */
function thresholds(actual: number, random: () => number) {
  const floor = Math.floor(actual);
  const below = [floor, floor - 1, floor - 2].filter((t) => t > 0 && actual - t >= 0.3);
  const above = [floor + 1, floor + 2, floor + 3].filter((t) => t - actual >= 0.3);
  return { below: pick(below.length ? below : [floor - 3], random), above: pick(above, random) };
}

/** 기준값 문장을 만든다. ‘이상’과 ‘미만’ 중 어느 쪽을 쓸지는 문항마다 달리 고른다. */
function thresholdPair(
  template: string,
  actual: number,
  random: () => number,
  sentence: (value: number, bound: "이상" | "미만") => string,
  check: (value: number, bound: "이상" | "미만") => boolean,
  fact: string,
): Pair {
  const { below, above } = thresholds(actual, random);
  const useAtLeast = random() < 0.6;
  const trueValue = useAtLeast ? below : above;
  const falseValue = useAtLeast ? above : below;
  const bound = useAtLeast ? "이상" : "미만";
  const pair = {
    t: { template, truth: true, fact, text: sentence(trueValue, bound) },
    f: { template, truth: false, fact, text: sentence(falseValue, bound) },
  };
  if (!check(trueValue, bound) || check(falseValue, bound))
    throw new Error(`기준값 판정 오류: ${pair.t.text}`);
  return pair;
}

/** 정확한 값을 적는 거짓 문장은 실제 값에서 10~25%쯤 어긋나게 한다. */
function wrongExact(actual: number, random: () => number) {
  const step = actual >= 1000 ? 10 : actual >= 100 ? 5 : 1;
  const delta = Math.max(step, Math.round((actual * (0.1 + random() * 0.15)) / step) * step);
  return actual - delta > 0 && random() < 0.5 ? actual - delta : actual + delta;
}

function buildClaims(topicItem: Topic, periods: string[], rows: Row[], random: () => number) {
  const { group, measure, unit } = topicItem;
  const n = rows.length;
  const setName = `${n}개 ${group}`;
  const totals = [0, 1, 2].map((period) => sum(rows.map((row) => row.cells[period])));
  const value = (amount: number) => `${fmt(amount)}${unit}`;
  const claims = new Map<string, Pair>();
  const order = shuffle(rows, random);
  const periodPick = () => Math.floor(random() * 3);

  // 1. 한 항목의 증가율 또는 감소율
  {
    // 변화율이 1.5%보다 작으면 ‘x% 이상’의 기준값을 0%보다 크게 잡을 수 없다.
    const options = order.flatMap((item) =>
      [[0, 1], [1, 2]]
        .filter(([p, q]) => Math.abs(rate(item.cells[p], item.cells[q])) >= 1.5)
        .map(([p, q]) => ({ row: item, from: p, to: q })),
    );
    const { row, from, to } = options[Math.floor(random() * Math.min(2, options.length))];
    const [a, b] = [row.cells[from], row.cells[to]];
    const word = b > a ? "증가율" : "감소율";
    const actual = Math.abs(rate(a, b));
    claims.set(
      "growth",
      thresholdPair(
        "growth",
        actual,
        random,
        (t, bound) =>
          `${periods[to]} ${row.label} ${measure}의 ${periods[from]} 대비 ${asTopic(word)} ${t}% ${bound}이다.`,
        (t, bound) => (bound === "이상" ? Math.abs(b - a) * 100 >= t * a : Math.abs(b - a) * 100 < t * a),
        `${periods[to]} ${row.label} ${measure}의 ${periods[from]} 대비 ${asTopic(word)} ${fmt(Math.abs(b - a))} ÷ ${fmt(a)} × 100 ${near(actual)}%입니다.`,
      ),
    );
  }

  // 2. 합계에서 한 항목이 차지하는 비중
  {
    const row = order[1];
    const period = periodPick();
    const v = row.cells[period];
    const total = totals[period];
    const actual = (v / total) * 100;
    claims.set(
      "share",
      thresholdPair(
        "share",
        actual,
        random,
        (t, bound) =>
          `${periods[period]} ${setName} ${measure} 합계에서 ${asSubject(row.label)} 차지하는 비중은 ${t}% ${bound}이다.`,
        (t, bound) => (bound === "이상" ? v * 100 >= t * total : v * 100 < t * total),
        `${periods[period]} ${setName} 합계는 ${value(total)}이고, ${row.label}의 비중은 ${fmt(v)} ÷ ${fmt(total)} × 100 ${near(actual)}%입니다.`,
      ),
    );
  }

  // 3. 조사기간 평균
  {
    const row = order[2];
    const total = sum(row.cells);
    const average = total / 3;
    const step = average >= 1000 ? 10 : average >= 200 ? 5 : 1;
    const low = Math.floor(average / step) * step;
    const candidatesBelow = [low, low - step].filter((t) => t > 0 && t <= average);
    const candidatesAbove = [low + step, low + 2 * step].filter((t) => t > average);
    const useAtLeast = random() < 0.6;
    const trueValue = useAtLeast ? pick(candidatesBelow, random) : pick(candidatesAbove, random);
    const falseValue = useAtLeast ? pick(candidatesAbove, random) : pick(candidatesBelow, random);
    const bound = useAtLeast ? "이상" : "미만";
    const sentence = (t: number) =>
      `조사기간 동안 ${row.label} ${measure}의 평균은 ${value(t)} ${bound}이다.`;
    const check = (t: number) => (useAtLeast ? total >= t * 3 : total < t * 3);
    if (!check(trueValue) || check(falseValue)) throw new Error(`평균 판정 오류: ${sentence(trueValue)}`);
    const fact = `${row.label}의 세 기간 합은 ${value(total)}이므로 평균은 ${fmt(total)} ÷ 3 ${near(average)}${unit}입니다.`;
    claims.set("average", {
      t: { template: "average", truth: true, fact, text: sentence(trueValue) },
      f: { template: "average", truth: false, fact, text: sentence(falseValue) },
    });
  }

  // 4. 같은 기간 두 항목의 차이
  {
    const [left, right] = [order[3 % n], order[(3 + 1) % n]];
    const period = periodPick();
    const gap = Math.abs(left.cells[period] - right.cells[period]);
    const wrong = wrongExact(gap, random);
    const sentence = (amount: number) =>
      `${periods[period]} ${asWith(left.label)} ${right.label}의 ${measure} 차이는 ${value(amount)}이다.`;
    const fact = `${periods[period]} ${left.label} ${value(left.cells[period])}, ${right.label} ${value(right.cells[period])}이므로 차이는 ${value(gap)}입니다.`;
    if (wrong === gap) throw new Error("차이 오답이 정답과 같습니다.");
    claims.set("gap", {
      t: { template: "gap", truth: true, fact, text: sentence(gap) },
      f: { template: "gap", truth: false, fact, text: sentence(wrong) },
    });
  }

  // 5. 첫 기간과 마지막 기간 합계의 차이
  {
    const change = totals[2] - totals[0];
    const size = Math.abs(change);
    const word = change > 0 ? "많다" : "적다";
    const wrong = wrongExact(size, random);
    const sentence = (amount: number) =>
      `${periods[2]} ${setName} ${measure} 합계는 ${periods[0]}보다 ${value(amount)} ${word}.`;
    const fact = `${setName} 합계는 ${periods[0]} ${value(totals[0])}, ${periods[2]} ${value(totals[2])}이므로 차이는 ${value(size)}입니다.`;
    if (size === 0 || wrong === size) throw new Error("합계 차이 오류");
    claims.set("total", {
      t: { template: "total", truth: true, fact, text: sentence(size) },
      f: { template: "total", truth: false, fact, text: sentence(wrong) },
    });
  }

  // 6. 두 항목의 배수 비교
  {
    const period = periodPick();
    const ranked = [...rows].sort((a, b) => b.cells[period] - a.cells[period]);
    const pairs = ranked.flatMap((big, x) =>
      ranked.slice(x + 1).map((small) => [big, small] as const),
    );
    const usable = pairs.filter(([big, small]) => big.cells[period] / small.cells[period] >= 1.25);
    const [big, small] = usable.length ? pick(usable, random) : [ranked[0], ranked[n - 1]];
    const a = big.cells[period];
    const b = small.cells[period];
    const ratio = a / b;
    const tenth = Math.floor(ratio * 10);
    const below = [tenth, tenth - 1].filter((k) => k >= 11 && ratio * 10 - k >= 0.2);
    const above = [tenth + 1, tenth + 2].filter((k) => k - ratio * 10 >= 0.2);
    const useAtLeast = random() < 0.6;
    const trueK = useAtLeast ? pick(below.length ? below : [tenth - 1], random) : pick(above, random);
    const falseK = useAtLeast ? pick(above, random) : pick(below.length ? below : [tenth - 1], random);
    const bound = useAtLeast ? "이상" : "미만";
    const sentence = (k: number) =>
      `${periods[period]} ${big.label}의 ${asTopic(measure)} ${small.label}의 ${k / 10}배 ${bound}이다.`;
    const check = (k: number) => (useAtLeast ? a * 10 >= k * b : a * 10 < k * b);
    if (trueK < 11 || !check(trueK) || check(falseK)) throw new Error(`배수 판정 오류: ${sentence(trueK)}`);
    const fact = `${periods[period]} ${big.label} ${value(a)}, ${small.label} ${value(b)}이므로 ${fmt(a)} ÷ ${fmt(b)} ${near(ratio, 2)}배입니다.`;
    claims.set("ratio", {
      t: { template: "ratio", truth: true, fact, text: sentence(trueK) },
      f: { template: "ratio", truth: false, fact, text: sentence(falseK) },
    });
  }

  // 7, 8. 증가량 1위와 증가율 1위. 둘이 다르면 증가량 1위를 증가율 오답으로 써서 함정을 만든다.
  const increaseOf = (row: Row) => row.cells[2] - row.cells[1];
  const rateOf = (row: Row) => rate(row.cells[1], row.cells[2]);
  const byIncrease = [...rows].sort((a, b) => increaseOf(b) - increaseOf(a));
  const byRate = [...rows].sort((a, b) => rateOf(b) - rateOf(a));
  const increaseList = rows
    .map((row) => `${row.label} ${increaseOf(row) > 0 ? "+" : ""}${fmt(increaseOf(row))}`)
    .join(", ");
  const rateList = rows.map((row) => `${row.label} 약 ${approx(rateOf(row))}%`).join(", ");
  {
    const sentence = (row: Row) =>
      `${periods[1]} 대비 ${periods[2]} ${measure} 증가량이 가장 큰 ${asTopic(group)} ${row.label}이다.`;
    const fact = `${periods[1]} 대비 ${periods[2]} 증가량은 ${increaseList}(${unit})이므로 가장 큰 ${asTopic(group)} ${byIncrease[0].label}입니다.`;
    claims.set("maxIncrease", {
      t: { template: "maxIncrease", truth: true, fact, text: sentence(byIncrease[0]) },
      f: { template: "maxIncrease", truth: false, fact, text: sentence(byIncrease[1]) },
    });
  }
  {
    const trap = byIncrease[0] !== byRate[0] ? byIncrease[0] : byRate[1];
    const sentence = (row: Row) =>
      `${periods[1]} 대비 ${periods[2]} ${measure} 증가율이 가장 높은 ${asTopic(group)} ${row.label}이다.`;
    const fact = `${periods[1]} 대비 ${periods[2]} 증가율은 ${rateList}이므로 가장 높은 ${asTopic(group)} ${byRate[0].label}입니다.`;
    claims.set("maxRate", {
      t: { template: "maxRate", truth: true, fact, text: sentence(byRate[0]) },
      f: { template: "maxRate", truth: false, fact, text: sentence(trap) },
    });
  }

  // 9. 첫 기간 대비 마지막 기간 증가율이 기준 이상인 항목 수
  {
    const overall = rows.map((row) => rate(row.cells[0], row.cells[2]));
    const options = [5, 10, 15, 20, 25, 30].filter((t) => {
      const count = overall.filter((r) => r >= t).length;
      return overall.every((r) => Math.abs(r - t) >= 0.5) && count >= 1 && count <= n - 1;
    });
    if (options.length) {
      const t = pick(options, random);
      const count = rows.filter((row) => (row.cells[2] - row.cells[0]) * 100 >= t * row.cells[0]).length;
      const wrong = count + (count === n || (count > 0 && random() < 0.5) ? -1 : 1);
      const sentence = (k: number) =>
        `${periods[0]} 대비 ${periods[2]} ${measure} 증가율이 ${t}% 이상인 ${asTopic(group)} ${k}개이다.`;
      const list = rows.map((row, k) => `${row.label} 약 ${approx(overall[k])}%`).join(", ");
      const fact = `${periods[0]} 대비 ${periods[2]} 증가율은 ${list}이므로 ${t}% 이상인 ${asTopic(group)} ${count}개입니다.`;
      claims.set("count", {
        t: { template: "count", truth: true, fact, text: sentence(count) },
        f: { template: "count", truth: false, fact, text: sentence(wrong) },
      });
    }
  }

  // 10. 한 항목의 비중이 두 기간 사이에 늘었는지
  {
    const row = order[(5 + n) % n];
    const [from, to] = random() < 0.5 ? [0, 1] : [1, 2];
    const left = row.cells[to] * totals[from];
    const right = row.cells[from] * totals[to];
    if (left !== right) {
      const higher = left > right;
      const sentence = (up: boolean) =>
        `${asSubject(row.label)} ${setName} ${measure} 합계에서 차지하는 비중은 ${periods[from]}보다 ${periods[to]}에 더 ${up ? "높다" : "낮다"}.`;
      const fact = `${row.label}의 비중은 ${periods[from]} 약 ${approx((row.cells[from] / totals[from]) * 100)}%, ${periods[to]} 약 ${approx((row.cells[to] / totals[to]) * 100)}%입니다.`;
      claims.set("shift", {
        t: { template: "shift", truth: true, fact, text: sentence(higher) },
        f: { template: "shift", truth: false, fact, text: sentence(!higher) },
      });
    }
  }

  // 11. 합계의 증가율
  {
    const [a, b] = [totals[0], totals[2]];
    const word = b > a ? "증가율" : "감소율";
    const actual = Math.abs(rate(a, b));
    if (actual >= 1.5)
      claims.set(
        "totalRate",
        thresholdPair(
          "totalRate",
          actual,
          random,
          (t, bound) =>
            `${periods[2]} ${setName} ${measure} 합계의 ${periods[0]} 대비 ${asTopic(word)} ${t}% ${bound}이다.`,
          (t, bound) => (bound === "이상" ? Math.abs(b - a) * 100 >= t * a : Math.abs(b - a) * 100 < t * a),
          `${setName} 합계는 ${periods[0]} ${value(a)}, ${periods[2]} ${value(b)}이므로 ${asTopic(word)} 약 ${approx(actual)}%입니다.`,
        ),
      );
  }

  return claims;
}

const FALSE_ORDER = [
  "growth",
  "maxRate",
  "share",
  "gap",
  "ratio",
  "average",
  "count",
  "total",
  "shift",
  "maxIncrease",
  "totalRate",
];

export const DA_CALC_EXTRA: ExampleQuestion[] = TOPICS.map((topicItem, i) => {
  const periods = PERIOD_SETS[i % PERIOD_SETS.length];
  const rows = buildRows(i, topicItem.labels, topicItem.scale);
  const random = mulberry32(i * 4219 + 73);
  const claims = buildClaims(topicItem, periods, rows, random);
  let falseTemplate = FALSE_ORDER[i % FALSE_ORDER.length];
  for (let k = 1; !claims.has(falseTemplate); k += 1)
    falseTemplate = FALSE_ORDER[(i + k) % FALSE_ORDER.length];
  const falseClaim = claims.get(falseTemplate)!.f;
  // 참 선지 넷이 같은 항목만 다루면 표의 다른 부분을 볼 필요가 없어진다.
  // 먼저 서로 다른 항목을 다루는 선지로 채우고, 모자랄 때만 겹침을 허용한다.
  const labelsIn = (text: string) => rows.filter((row) => text.includes(row.label)).map((row) => row.label);
  const pool = shuffle(
    [...claims.keys()].filter((template) => template !== falseTemplate),
    random,
  );
  const chosen: string[] = [];
  const used = new Set(labelsIn(falseClaim.text));
  for (const strict of [true, false])
    for (const template of pool) {
      if (chosen.length === 4 || chosen.includes(template)) continue;
      // 합계 차이와 합계 증가율은 같은 두 수를 비교하므로 한 문항에 함께 넣지 않는다.
      const totalPair = ["total", "totalRate"];
      if (totalPair.includes(template) && [falseTemplate, ...chosen].some((t) => t !== template && totalPair.includes(t)))
        continue;
      const labels = labelsIn(claims.get(template)!.t.text);
      if (strict && labels.some((label) => used.has(label))) continue;
      chosen.push(template);
      labels.forEach((label) => used.add(label));
    }
  const trueClaims = chosen.map((template) => claims.get(template)!.t);
  if (trueClaims.length < 4) throw new Error(`참 선지 부족: ${topicItem.title}`);

  const { choices, answer } = rotateChoices(
    falseClaim.text,
    trueClaims.map((claim) => claim.text),
    i + 2,
  );
  const byText = new Map([falseClaim, ...trueClaims].map((claim) => [claim.text, claim]));
  const others = choices
    .map((choice, index) => ({ claim: byText.get(choice)!, index }))
    .filter(({ index }) => index !== answer)
    .map(({ claim, index }) => `${MARKERS[index]} ${claim.fact}`)
    .join(" ");

  return defineQuestion(CATEGORY, "da-calc-1", "표에서 옳지 않은 설명 찾기 (계산)", 20 + i, {
    stem: `다음은 ${topicItem.title}에 관한 자료이다. 이를 계산하여 판단한 설명으로 옳지 않은 것은?`,
    visuals: tableVisual(
      `da-calc-${21 + i}`,
      topicItem.title,
      periods,
      rows.map((row) => ({ label: row.label, cells: row.cells.map(fmt) })),
      topicItem.unit,
    ),
    choices,
    answer,
    explanation: `${falseClaim.fact} 따라서 ‘${falseClaim.text}’는 계산 결과와 맞지 않는 옳지 않은 설명이며, 정답은 ${MARKERS[answer]}입니다. 나머지 선지는 계산 결과와 일치합니다. ${others}`,
  });
});
