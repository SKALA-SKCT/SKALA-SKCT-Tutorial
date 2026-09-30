import type { ExampleQuestion } from "../catalog";
import { defineQuestion, rotateChoices, tableVisual } from "../exampleBanks/bankUtils";

// da-reading-1: 문제 세트와 랜덤 문제에만 쓰는 추가 문항 60개 (id 번호 21~80)

const CATEGORY = "data-analysis";
const YEARS = ["2022년", "2023년", "2024년"] as const;
const MARKERS = ["①", "②", "③", "④", "⑤"];

/** 검증 스크립트가 표에서 직접 참과 거짓을 계산할 수 있는 문장 형식만 쓴다. */
interface Claim {
  template: string;
  text: string;
  truth: boolean;
  /** 해설에 쓰는 실제 값 설명. */
  fact: string;
}

interface Row {
  label: string;
  cells: number[];
}

/** [표 제목, 단위, 행 이름, 기준 규모] */
const TOPICS: Array<[string, string, string[], number]> = [
  ["연령대별 헌혈 참여자 수", "백 명", ["10대", "20대", "30대", "40대", "50대"], 60],
  ["어종별 어획량", "톤", ["고등어", "오징어", "갈치", "멸치", "참조기"], 900],
  ["체육시설별 이용 인원", "백 명", ["수영장", "체력단련실", "빙상장", "테니스장", "풋살장"], 150],
  ["박물관별 교육 프로그램 참가자 수", "명", ["역사박물관", "과학박물관", "민속박물관", "해양박물관", "철도박물관"], 700],
  ["공원별 주말 방문 차량 수", "대", ["한빛공원", "솔숲공원", "호수공원", "은행공원", "달빛공원"], 1500],
  ["업종별 창업 건수", "건", ["음식점", "카페", "편의점", "미용실", "학원"], 400],
  ["보호소별 유기동물 입양 건수", "건", ["동부보호소", "서부보호소", "남부보호소", "북부보호소", "중앙보호소"], 120],
  ["캠핑장별 예약 건수", "건", ["계곡캠핑장", "해변캠핑장", "숲속캠핑장", "호숫가캠핑장", "고원캠핑장"], 800],
  ["요일별 택시 호출 건수", "천 건", ["월요일", "화요일", "수요일", "목요일", "금요일"], 45],
  ["차종별 고속도로 통행량", "천 대", ["승용차", "승합차", "화물차", "버스", "특수차"], 300],
  ["쇼핑몰별 반품 건수", "건", ["가람몰", "나래몰", "다온몰", "라온몰", "미소몰"], 2000],
  ["가공식품별 수입량", "톤", ["치즈", "버터", "분유", "초콜릿", "설탕"], 3000],
  ["학과별 졸업생 수", "명", ["기계공학과", "전자공학과", "화학공학과", "건축학과", "산업공학과"], 150],
  ["댐별 저수량", "백만 m³", ["가람댐", "누리댐", "도담댐", "미르댐", "솔내댐"], 400],
  ["관측소별 폭염 일수", "일", ["해안관측소", "내륙관측소", "산간관측소", "도심관측소", "분지관측소"], 20],
  ["민원 유형별 접수 건수", "건", ["교통", "환경", "주택", "복지", "안전"], 900],
  ["화물 품목별 철도 수송량", "천 톤", ["시멘트", "석탄", "컨테이너", "철강", "유류"], 500],
  ["호텔별 객실 판매 수", "실", ["해오름호텔", "바다숲호텔", "별빛호텔", "구름호텔", "산들호텔"], 5000],
  ["카페 메뉴별 판매량", "잔", ["아메리카노", "카페라테", "녹차라테", "레몬에이드", "자몽주스"], 3000],
  ["대학별 외국인 유학생 수", "명", ["가온대학교", "나래대학교", "다솜대학교", "한결대학교", "새빛대학교"], 600],
  ["산업단지별 입주 기업 수", "개", ["동부산단", "서부산단", "남부산단", "북부산단", "중부산단"], 200],
  ["언어별 번역 의뢰 건수", "건", ["영어", "중국어", "일본어", "독일어", "스페인어"], 700],
  ["광역시별 공영주차장 면수", "면", ["대전", "광주", "대구", "울산", "부산"], 8000],
  ["과일별 도매 거래량", "톤", ["사과", "배", "복숭아", "포도", "감귤"], 1200],
  ["연구소별 특허 출원 건수", "건", ["소재연구소", "에너지연구소", "바이오연구소", "반도체연구소", "로봇연구소"], 150],
  ["대여소별 공유 킥보드 대여 건수", "건", ["역전대여소", "시청대여소", "대학대여소", "공원대여소", "시장대여소"], 2500],
  ["가전제품별 수리 접수 건수", "건", ["냉장고", "세탁기", "에어컨", "텔레비전", "청소기"], 1100],
  ["수산 가공품별 생산량", "톤", ["어묵", "젓갈", "건오징어", "맛살", "훈제연어"], 800],
  ["스키장별 입장객 수", "백 명", ["설봉스키장", "은빛스키장", "백설스키장", "하늘스키장", "눈꽃스키장"], 300],
  ["우체국별 등기 우편 접수량", "백 통", ["중앙우체국", "역전우체국", "시장우체국", "신도시우체국", "공단우체국"], 250],
  ["전시회별 참관객 수", "백 명", ["가구박람회", "도서전", "식품박람회", "게임쇼", "캠핑박람회"], 400],
  ["설치 장소별 무인 민원발급기 발급 건수", "건", ["구청", "지하철역", "병원", "대형마트", "대학교"], 1300],
  ["산지별 한우 출하 두수", "두", ["횡성", "홍천", "영주", "함평", "장수"], 900],
  ["공예 분야별 체험 참가 인원", "명", ["도자기", "목공", "가죽공예", "향초", "한지공예"], 350],
  ["차량 정비 항목별 작업 건수", "건", ["엔진오일", "타이어", "브레이크", "배터리", "냉각수"], 1600],
  ["해변별 피서객 수", "천 명", ["은모래해변", "솔밭해변", "몽돌해변", "백사장해변", "갯바위해변"], 250],
  ["영화 장르별 관객 수", "만 명", ["액션", "코미디", "드라마", "공포", "애니메이션"], 600],
  ["사고 유형별 손해보험 접수 건수", "건", ["차량파손", "도난", "화재", "침수", "누수"], 900],
  ["제설제 종류별 사용량", "톤", ["염화칼슘", "소금", "친환경제설제", "모래", "염수"], 700],
  ["둘레길 구간별 완주자 수", "명", ["1구간", "2구간", "3구간", "4구간", "5구간"], 900],
  ["선박 종류별 입항 척수", "척", ["유조선", "컨테이너선", "여객선", "어선", "화물선"], 400],
  ["서버별 장애 발생 건수", "건", ["인증서버", "결제서버", "검색서버", "메일서버", "파일서버"], 60],
  ["휴게소별 이용 차량 수", "천 대", ["가람휴게소", "솔재휴게소", "달맞이휴게소", "매화휴게소", "청솔휴게소"], 350],
  ["연구 분야별 논문 게재 건수", "편", ["인공지능", "신소재", "기후", "유전체", "양자"], 250],
  ["섬별 관광객 수", "백 명", ["가파도", "우도", "청산도", "비금도", "외연도"], 500],
  ["원산지별 원두 수입량", "톤", ["브라질", "콜롬비아", "에티오피아", "베트남", "과테말라"], 4000],
  ["보험 상품별 신규 계약 건수", "건", ["종신보험", "암보험", "자동차보험", "여행자보험", "치아보험"], 3000],
  ["수선 품목별 의뢰 건수", "건", ["바지", "셔츠", "외투", "원피스", "가방"], 300],
  ["동물병원 진료 항목별 건수", "건", ["예방접종", "피부질환", "치과진료", "건강검진", "중성화수술"], 500],
  ["도로 등급별 포트홀 보수 건수", "건", ["고속도로", "국도", "지방도", "시도", "군도"], 600],
  ["인증 종류별 인증 농가 수", "곳", ["유기농", "무농약", "저탄소", "친환경축산", "우수관리"], 400],
  ["한옥마을별 숙박객 수", "명", ["가람마을", "누리마을", "한빛마을", "솔내마을", "달빛마을"], 1500],
  ["어린이집별 입소 대기 아동 수", "명", ["해님어린이집", "별님어린이집", "달님어린이집", "꽃님어린이집", "숲속어린이집"], 40],
  ["단지별 커뮤니티센터 이용 인원", "명", ["1단지", "2단지", "3단지", "4단지", "5단지"], 2200],
  ["야구장별 관중 수", "천 명", ["청룡구장", "백호구장", "주작구장", "현무구장", "기린구장"], 600],
  ["약국별 조제 건수", "건", ["중앙약국", "새봄약국", "온누리약국", "하나약국", "우리약국"], 1800],
  ["웹툰 장르별 연재 작품 수", "편", ["로맨스", "판타지", "무협", "일상", "스릴러"], 120],
  ["렌터카 차급별 대여 건수", "건", ["경차", "소형", "중형", "대형", "승합"], 1400],
  ["전망대별 입장객 수", "백 명", ["하늘타워", "바다타워", "구름타워", "별빛타워", "노을타워"], 350],
  ["종목별 심판 자격 등록자 수", "명", ["축구", "농구", "배구", "야구", "핸드볼"], 500],
];

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

const fmt = (value: number) => value.toLocaleString("en-US");
const distinct = (values: number[]) => new Set(values).size === values.length;

/** 동률이 생기면 ‘가장 큰 항목’이 둘이 되므로 연도별 값과 행별 값이 모두 서로 다르게 뽑는다. */
function buildRows(index: number, labels: string[], scale: number): Row[] {
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const random = mulberry32(index * 7919 + attempt * 104729 + 17);
    const step = () => 1 + (random() * 0.36 - 0.14);
    const rows = labels.map((label) => {
      const first = Math.round(scale * (0.55 + 0.9 * random()));
      const second = Math.round(first * step());
      const third = Math.round(second * step());
      return { label, cells: [first, second, third] };
    });
    const n = rows.length;
    const dropped = rows.filter((row) => row.cells[2] < row.cells[1]).length;
    const grew = rows.filter((row) => row.cells[2] > row.cells[0]).length;
    const rising = rows.filter((row) => row.cells[0] < row.cells[1] && row.cells[1] < row.cells[2]).length;
    if (
      rows.every((row) => row.cells.every((value) => value > 0) && distinct(row.cells)) &&
      [0, 1, 2].every((year) => distinct(rows.map((row) => row.cells[year]))) &&
      dropped >= 1 &&
      dropped <= n - 1 &&
      grew >= 1 &&
      grew <= n - 1 &&
      rising >= 1 &&
      rising <= n - 2
    )
      return rows;
  }
  throw new Error(`표 생성 실패: ${index}`);
}

function names(rows: Row[]) {
  return rows.map((row) => row.label).join(", ");
}

/** 개수를 묻는 거짓 문장은 실제 개수에서 하나만 어긋나게 해 눈대중으로 고르지 못하게 한다. */
function nearbyCount(actual: number, max: number, random: () => number) {
  const options = [actual - 1, actual + 1].filter((value) => value >= 0 && value <= max);
  return options[Math.floor(random() * options.length)];
}

function buildClaims(rows: Row[], unit: string, random: () => number) {
  const claims = new Map<string, { t: Claim; f: Claim }>();
  const n = rows.length;
  const cell = (row: Row, year: number) => `${fmt(row.cells[year])}${unit}`;

  const by2024 = [...rows].sort((a, b) => b.cells[2] - a.cells[2]);
  const topFact = `2024년 값이 가장 큰 항목은 ${by2024[0].label}(${cell(by2024[0], 2)})이고, 두 번째는 ${by2024[1].label}(${cell(by2024[1], 2)})입니다.`;
  claims.set("top", {
    t: { template: "top", truth: true, fact: topFact, text: `2024년 값이 가장 큰 항목은 ${by2024[0].label}이다.` },
    f: { template: "top", truth: false, fact: topFact, text: `2024년 값이 가장 큰 항목은 ${by2024[1].label}이다.` },
  });

  const by2022 = [...rows].sort((a, b) => a.cells[0] - b.cells[0]);
  const bottomFact = `2022년 값이 가장 작은 항목은 ${by2022[0].label}(${cell(by2022[0], 0)})이고, 두 번째로 작은 항목은 ${by2022[1].label}(${cell(by2022[1], 0)})입니다.`;
  claims.set("bottom", {
    t: { template: "bottom", truth: true, fact: bottomFact, text: `2022년 값이 가장 작은 항목은 ${by2022[0].label}이다.` },
    f: { template: "bottom", truth: false, fact: bottomFact, text: `2022년 값이 가장 작은 항목은 ${by2022[1].label}이다.` },
  });

  const dropped = rows.filter((row) => row.cells[2] < row.cells[1]);
  const droppedFact = `2023년보다 2024년 값이 줄어든 항목은 ${names(dropped)} 총 ${dropped.length}개입니다.`;
  claims.set("dropped", {
    t: { template: "dropped", truth: true, fact: droppedFact, text: `2023년보다 2024년 값이 줄어든 항목은 ${dropped.length}개이다.` },
    f: { template: "dropped", truth: false, fact: droppedFact, text: `2023년보다 2024년 값이 줄어든 항목은 ${nearbyCount(dropped.length, n, random)}개이다.` },
  });

  const grew = rows.filter((row) => row.cells[2] > row.cells[0]);
  const grewFact = `2022년보다 2024년 값이 늘어난 항목은 ${names(grew)} 총 ${grew.length}개입니다.`;
  claims.set("grew", {
    t: { template: "grew", truth: true, fact: grewFact, text: `2022년보다 2024년 값이 늘어난 항목은 ${grew.length}개이다.` },
    f: { template: "grew", truth: false, fact: grewFact, text: `2022년보다 2024년 값이 늘어난 항목은 ${nearbyCount(grew.length, n, random)}개이다.` },
  });

  const rising = rows.filter((row) => row.cells[0] < row.cells[1] && row.cells[1] < row.cells[2]);
  const risingFact = `2022년에서 2024년까지 해마다 값이 늘어난 항목은 ${names(rising)} 총 ${rising.length}개입니다.`;
  claims.set("rising", {
    t: { template: "rising", truth: true, fact: risingFact, text: `조사 기간 내내 값이 늘어난 항목은 ${rising.length}개이다.` },
    f: { template: "rising", truth: false, fact: risingFact, text: `조사 기간 내내 값이 늘어난 항목은 ${nearbyCount(rising.length, n, random)}개이다.` },
  });

  // ‘○○의’로 시작하는 선지 셋은 서로 다른 행을 가리키게 한다.
  const order = shuffle(rows, random);
  const [peakRow, swingRow, pairA, pairB] = order;
  const [bigger, smaller] = pairA.cells[2] > pairB.cells[2] ? [pairA, pairB] : [pairB, pairA];
  const compareFact = `2024년 값은 ${bigger.label} ${cell(bigger, 2)}, ${smaller.label} ${cell(smaller, 2)}입니다.`;
  claims.set("compare", {
    t: { template: "compare", truth: true, fact: compareFact, text: `${bigger.label}의 2024년 값은 ${smaller.label}보다 크다.` },
    f: { template: "compare", truth: false, fact: compareFact, text: `${smaller.label}의 2024년 값은 ${bigger.label}보다 크다.` },
  });

  const peakValue = Math.max(...peakRow.cells);
  const peakYear = peakRow.cells.indexOf(peakValue);
  const otherYears = [0, 1, 2].filter((year) => year !== peakYear);
  const wrongYear = otherYears[Math.floor(random() * otherYears.length)];
  const peakFact = `${peakRow.label}의 값은 2022년 ${cell(peakRow, 0)}, 2023년 ${cell(peakRow, 1)}, 2024년 ${cell(peakRow, 2)}이므로 ${YEARS[peakYear]}에 가장 컸습니다.`;
  claims.set("peak", {
    t: { template: "peak", truth: true, fact: peakFact, text: `${peakRow.label}의 값이 가장 컸던 해는 ${YEARS[peakYear]}이다.` },
    f: { template: "peak", truth: false, fact: peakFact, text: `${peakRow.label}의 값이 가장 컸던 해는 ${YEARS[wrongYear]}이다.` },
  });

  const change = swingRow.cells[2] - swingRow.cells[0];
  const size = Math.abs(change);
  const direction = change > 0 ? "많다" : "적다";
  const flipped = change > 0 ? "적다" : "많다";
  const delta = Math.max(1, Math.round(size * (0.08 + random() * 0.15)));
  const variant = Math.floor(random() * 3);
  const wrongSwing =
    variant === 0 || size - delta <= 0
      ? `${fmt(size + delta)}${unit} ${direction}`
      : variant === 1
        ? `${fmt(size - delta)}${unit} ${direction}`
        : `${fmt(size)}${unit} ${flipped}`;
  const swingFact = `${swingRow.label}의 값은 2022년 ${cell(swingRow, 0)}, 2024년 ${cell(swingRow, 2)}이므로 2024년 값이 ${fmt(size)}${unit} ${change > 0 ? "많습니다" : "적습니다"}.`;
  claims.set("swing", {
    t: { template: "swing", truth: true, fact: swingFact, text: `${swingRow.label}의 2024년 값은 2022년보다 ${fmt(size)}${unit} ${direction}.` },
    f: { template: "swing", truth: false, fact: swingFact, text: `${swingRow.label}의 2024년 값은 2022년보다 ${wrongSwing}.` },
  });

  return claims;
}

/**
 * 검증 스크립트와 같은 규칙으로 문장의 참과 거짓을 다시 계산한다.
 * 생성 로직이 의도한 참, 거짓과 다르면 문항을 만들지 않고 멈춘다.
 */
function evaluate(rows: Row[], text: string): boolean {
  const byLabel = new Map(rows.map((row) => [row.label, row]));
  let match = text.match(/^2024년 값이 가장 큰 항목은 (.+)이다\.$/);
  if (match) return byLabel.get(match[1])!.cells[2] === Math.max(...rows.map((row) => row.cells[2]));
  match = text.match(/^2022년 값이 가장 작은 항목은 (.+)이다\.$/);
  if (match) return byLabel.get(match[1])!.cells[0] === Math.min(...rows.map((row) => row.cells[0]));
  match = text.match(/^2023년보다 2024년 값이 줄어든 항목은 (\d+)개이다\.$/);
  if (match) return rows.filter((row) => row.cells[2] < row.cells[1]).length === Number(match[1]);
  match = text.match(/^2022년보다 2024년 값이 늘어난 항목은 (\d+)개이다\.$/);
  if (match) return rows.filter((row) => row.cells[2] > row.cells[0]).length === Number(match[1]);
  match = text.match(/^조사 기간 내내 값이 늘어난 항목은 (\d+)개이다\.$/);
  if (match)
    return (
      rows.filter((row) => row.cells[0] < row.cells[1] && row.cells[1] < row.cells[2]).length ===
      Number(match[1])
    );
  match = text.match(/^(.+)의 값이 가장 컸던 해는 (2022년|2023년|2024년)이다\.$/);
  if (match) {
    const row = byLabel.get(match[1])!;
    return row.cells[YEARS.indexOf(match[2] as (typeof YEARS)[number])] === Math.max(...row.cells);
  }
  match = text.match(/^(.+)의 2024년 값은 2022년보다 ([\d,]+).+ (많다|적다)\.$/);
  if (match) {
    const row = byLabel.get(match[1])!;
    const actual = row.cells[2] - row.cells[0];
    return match[3] === (actual >= 0 ? "많다" : "적다") && Number(match[2].replaceAll(",", "")) === Math.abs(actual);
  }
  match = text.match(/^(.+)의 2024년 값은 (.+)보다 크다\.$/);
  if (match) return byLabel.get(match[1])!.cells[2] > byLabel.get(match[2])!.cells[2];
  throw new Error(`판정할 수 없는 문장: ${text}`);
}

const TEMPLATE_ORDER = ["top", "swing", "dropped", "compare", "grew", "peak", "rising", "bottom"];

export const DA_READING_EXTRA: ExampleQuestion[] = TOPICS.map(([title, unit, labels, scale], i) => {
  const rows = buildRows(i, labels, scale);
  const random = mulberry32(i * 3571 + 911);
  const claims = buildClaims(rows, unit, random);
  const falseTemplate = TEMPLATE_ORDER[(i + Math.floor(i / 8)) % TEMPLATE_ORDER.length];
  const falseClaim = claims.get(falseTemplate)!.f;
  const trueClaims = shuffle(
    TEMPLATE_ORDER.filter((template) => template !== falseTemplate),
    random,
  )
    .slice(0, 4)
    .map((template) => claims.get(template)!.t);
  for (const claim of [falseClaim, ...trueClaims])
    if (evaluate(rows, claim.text) !== claim.truth) throw new Error(`참거짓 불일치: ${claim.text}`);

  const { choices, answer } = rotateChoices(
    falseClaim.text,
    trueClaims.map((claim) => claim.text),
    i,
  );
  const byText = new Map([falseClaim, ...trueClaims].map((claim) => [claim.text, claim]));
  const others = choices
    .map((choice, index) => ({ claim: byText.get(choice)!, index }))
    .filter(({ index }) => index !== answer)
    .map(({ claim, index }) => `${MARKERS[index]} ${claim.fact}`)
    .join(" ");

  return defineQuestion(CATEGORY, "da-reading-1", "표에서 옳지 않은 설명 찾기", 20 + i, {
    stem: `다음은 ${title}에 관한 자료이다. 이에 대한 설명으로 옳지 않은 것은?`,
    visuals: tableVisual(
      `da-reading-${21 + i}`,
      title,
      [...YEARS],
      rows.map((row) => ({ label: row.label, cells: row.cells.map(fmt) })),
      unit,
    ),
    choices,
    answer,
    explanation: `${falseClaim.fact} 따라서 ‘${falseClaim.text}’는 표와 맞지 않는 옳지 않은 설명이며, 정답은 ${MARKERS[answer]}입니다. 나머지 선지는 표와 일치합니다. ${others}`,
  });
});
