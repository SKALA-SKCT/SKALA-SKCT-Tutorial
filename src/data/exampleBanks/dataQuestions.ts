import type { ExampleQuestion } from "../catalog";
import { defineQuestion, rotateChoices, tableVisual } from "./bankUtils";

const CATEGORY = "data-analysis";

function hasFinalConsonant(value: string) {
  const code = value.charCodeAt(value.length - 1);
  return code >= 0xac00 && code <= 0xd7a3 ? (code - 0xac00) % 28 !== 0 : false;
}

const asSubject = (value: string) => `${value}${hasFinalConsonant(value) ? "이" : "가"}`;

/**
 * 선지의 참·거짓을 손으로 적지 않고 표에서 직접 계산한다.
 * 값을 손으로 적어 두면 표를 고칠 때 선지가 조용히 틀린 설명이 되기 때문이다.
 */
interface Claim {
  /** 같은 형식의 참·거짓 문장을 한 문항에 함께 넣지 않기 위한 표식. */
  template: string;
  text: string;
  truth: boolean;
}

const YEARS = ["2022년", "2023년", "2024년"] as const;

interface Row {
  label: string;
  cells: number[];
}

function formatNumber(value: number) {
  return Number(value.toFixed(1)).toLocaleString("en-US");
}

/** 백분율은 실제 시험처럼 소수 첫째 자리까지만 쓴다. */
function percent(value: number) {
  return Number(value.toFixed(1));
}

function pickFalseAndTrue(claims: Claim[], seed: number) {
  const falses = claims.filter((claim) => !claim.truth);
  const chosen = falses[seed % falses.length];
  // 같은 형식의 참 문장이 함께 들어가면 두 선지만 비교해도 정답이 드러난다.
  const trues = claims.filter((claim) => claim.truth && claim.template !== chosen.template);
  if (!falses.length || trues.length < 4)
    throw new Error(`선지 후보 부족: 거짓 ${falses.length}개, 참 ${trues.length}개`);
  const wrongs: string[] = [];
  for (let offset = 0; offset < trues.length && wrongs.length < 4; offset += 1) {
    const candidate = trues[(seed + offset) % trues.length].text;
    if (!wrongs.includes(candidate)) wrongs.push(candidate);
  }
  return { correct: chosen.text, wrongs };
}

const readingTopics = [
  ["지역별 전기 사용량", "MWh"],
  ["제품군별 판매량", "천 개"],
  ["지점별 방문객 수", "백 명"],
  ["부서별 처리 건수", "건"],
  ["국가별 수출액", "백만 달러"],
  ["과목별 응시자 수", "명"],
  ["노선별 운송량", "톤"],
  ["매장별 매출액", "백만 원"],
  ["품목별 생산량", "천 대"],
  ["센터별 상담 건수", "건"],
  ["지역별 강수량", "mm"],
  ["기업별 연구비", "억 원"],
  ["학교별 도서 대출", "권"],
  ["공장별 가동 시간", "시간"],
  ["서비스별 가입자 수", "천 명"],
  ["농가별 출하량", "톤"],
  ["팀별 프로젝트 수", "개"],
  ["도시별 재활용량", "톤"],
  ["채널별 광고 노출", "만 회"],
  ["병원별 검진 인원", "명"],
] as const;

const readingLabels = ["A", "B", "C", "D", "E"];
const firstSteps = [12, -8, 5, 21, -3, 9, -14, 17];
const secondSteps = [7, 15, -6, 11, -12, 4, 19, -9];

function readingRows(index: number, title: string): Row[] {
  // ‘노선별 운송량’인데 행 이름이 A지역이면 표와 제목이 어긋난다. 제목의 분류 기준을 그대로 쓴다.
  const unitName = title.split("별")[0];
  return readingLabels.map((label, row) => {
    const start = 120 + ((row * 23 + index * 17) % 90);
    const first = firstSteps[(row + index) % firstSteps.length];
    const second = secondSteps[(row * 2 + index) % secondSteps.length];
    return {
      label: `${label} ${unitName}`,
      cells: [start, start + first, start + first + second],
    };
  });
}

/**
 * 같은 형식의 문장을 참 버전과 거짓 버전으로 함께 만들어 둔다.
 * 정답은 늘 거짓 문장이고, 나머지 네 개는 서로 다른 형식의 참 문장이라
 * 문장 모양만 보고 정답을 고를 수 없다.
 */
function readingClaims(rows: Row[], unit: string): Claim[] {
  const claims: Claim[] = [];
  const push = (template: string, text: string, truth: boolean) =>
    claims.push({ template, text, truth });
  const byYear = (year: number) => [...rows].sort((a, b) => b.cells[year] - a.cells[year]);
  const rising = rows.filter((row) => row.cells[0] < row.cells[1] && row.cells[1] < row.cells[2]);
  const droppedLastYear = rows.filter((row) => row.cells[2] < row.cells[1]);
  const grewOverall = rows.filter((row) => row.cells[2] > row.cells[0]);

  const ranked2024 = byYear(2);
  const max2024 = ranked2024[0].cells[2];
  const belowMax2024 = ranked2024.find((row) => row.cells[2] < max2024);
  if (!belowMax2024) throw new Error("2024년 최댓값과 구분되는 행이 없습니다.");
  push("top", `2024년 값이 가장 큰 항목은 ${ranked2024[0].label}이다.`, true);
  push("top", `2024년 값이 가장 큰 항목은 ${belowMax2024.label}이다.`, false);

  const bottom2022 = [...rows].sort((a, b) => a.cells[0] - b.cells[0]);
  const min2022 = bottom2022[0].cells[0];
  const aboveMin2022 = bottom2022.find((row) => row.cells[0] > min2022);
  if (!aboveMin2022) throw new Error("2022년 최솟값과 구분되는 행이 없습니다.");
  push("bottom", `2022년 값이 가장 작은 항목은 ${bottom2022[0].label}이다.`, true);
  push("bottom", `2022년 값이 가장 작은 항목은 ${aboveMin2022.label}이다.`, false);

  push("dropped", `2023년보다 2024년 값이 줄어든 항목은 ${droppedLastYear.length}개이다.`, true);
  push(
    "dropped",
    `2023년보다 2024년 값이 줄어든 항목은 ${droppedLastYear.length + 1}개이다.`,
    false,
  );

  push("grew", `2022년보다 2024년 값이 늘어난 항목은 ${grewOverall.length}개이다.`, true);
  push("grew", `2022년보다 2024년 값이 늘어난 항목은 ${grewOverall.length + 1}개이다.`, false);

  push("rising", `조사 기간 내내 값이 늘어난 항목은 ${rising.length}개이다.`, true);
  push("rising", `조사 기간 내내 값이 늘어난 항목은 ${rising.length + 2}개이다.`, false);

  const [left, right] = [ranked2024[0], ranked2024[4]];
  push("compare", `${left.label}의 2024년 값은 ${right.label}보다 크다.`, true);
  push("compare", `${right.label}의 2024년 값은 ${left.label}보다 크다.`, false);

  const peakRow = rows[2];
  const peakValue = Math.max(...peakRow.cells);
  const peakYear = peakRow.cells.indexOf(peakValue);
  const nonPeakYear = peakRow.cells.findIndex((value) => value < peakValue);
  if (nonPeakYear < 0) throw new Error(`${peakRow.label}의 연도별 값이 모두 같습니다.`);
  push("peak", `${peakRow.label}의 값이 가장 컸던 해는 ${YEARS[peakYear]}이다.`, true);
  push("peak", `${peakRow.label}의 값이 가장 컸던 해는 ${YEARS[nonPeakYear]}이다.`, false);

  const swing = rows[1];
  const change = swing.cells[2] - swing.cells[0];
  const direction = change >= 0 ? "많다" : "적다";
  push(
    "swing",
    `${swing.label}의 2024년 값은 2022년보다 ${Math.abs(change)}${unit} ${direction}.`,
    true,
  );
  push(
    "swing",
    `${swing.label}의 2024년 값은 2022년보다 ${Math.abs(change) + 5}${unit} ${direction}.`,
    false,
  );

  return claims;
}

export const DATA_READING_QUESTIONS: ExampleQuestion[] = readingTopics.map(
  ([title, unit], index) => {
    const rows = readingRows(index, title);
    const claims = readingClaims(rows, unit);
    const { correct, wrongs } = pickFalseAndTrue(claims, index);
    const max2024 = Math.max(...rows.map((row) => row.cells[2]));
    const max2024Labels = rows
      .filter((row) => row.cells[2] === max2024)
      .map((row) => row.label)
      .join(", ");
    const min2022 = Math.min(...rows.map((row) => row.cells[0]));
    const min2022Labels = rows
      .filter((row) => row.cells[0] === min2022)
      .map((row) => row.label)
      .join(", ");
    return defineQuestion(CATEGORY, "da-reading-1", "표에서 옳지 않은 설명 찾기", index, {
      stem: `다음은 ${title}에 관한 자료이다. 이에 대한 설명으로 옳지 않은 것은?`,
      visuals: tableVisual(`da-reading-${index + 1}`, title, [...YEARS], rows, unit),
      ...rotateChoices(correct, wrongs, index),
      explanation: `${title} 표의 2024년 최댓값은 ${formatNumber(max2024)}${unit}(${max2024Labels}), 2022년 최솟값은 ${formatNumber(min2022)}${unit}(${min2022Labels})이며, 2023년보다 2024년 값이 줄어든 항목은 ${rows.filter((row) => row.cells[2] < row.cells[1]).length}개입니다. 동률까지 포함해 이 값들과 대조하면 ‘${correct}’만 표와 어긋납니다.`,
    });
  },
);

const calculationTopics = [
  ["온라인 서비스 이용자", "천 명"],
  ["친환경 차량 등록", "대"],
  ["지역 축제 방문객", "백 명"],
  ["신제품 주문량", "건"],
  ["공공 자전거 이용", "천 건"],
  ["해외 지사 매출", "백만 원"],
  ["직원 교육 이수", "명"],
  ["모바일 결제 건수", "만 건"],
  ["문화시설 관람객", "백 명"],
  ["의료 장비 생산", "대"],
  ["태양광 발전량", "MWh"],
  ["택배 물동량", "천 상자"],
  ["장학금 지급액", "백만 원"],
  ["고객 만족 응답", "건"],
  ["스마트 공장 도입", "곳"],
  ["지역별 고용 인원", "명"],
  ["교육 과정 신청", "건"],
  ["연구 과제 예산", "백만 원"],
  ["공항 노선 이용객", "천 명"],
  ["농산물 온라인 판매", "백만 원"],
] as const;

const calculationLabels = ["가 부문", "나 부문", "다 부문", "라 부문"];

/**
 * 증가율과 비중이 소수 첫째 자리에서 깔끔하게 떨어지도록 2023년 값을 100의 배수로 잡고,
 * 증가율은 5% 단위로만 준다. 실제 시험도 계산이 떨어지는 값으로 출제된다.
 */
function calculationRows(index: number): Row[] {
  const bases = [400, 600, 500, 800, 700, 900, 300, 1000];
  const growths = [10, 25, -5, 20, 15, -10, 30, 5];
  return calculationLabels.map((label, row) => {
    const before = bases[(row * 3 + index) % bases.length] + row * 100;
    const growth = growths[(row + index * 2) % growths.length];
    return { label, cells: [before, before + (before * growth) / 100] };
  });
}

function calculationClaims(rows: Row[], unit: string): Claim[] {
  const claims: Claim[] = [];
  const push = (template: string, text: string, truth: boolean) =>
    claims.push({ template, text, truth });
  const total2024 = rows.reduce((sum, row) => sum + row.cells[1], 0);
  const total2023 = rows.reduce((sum, row) => sum + row.cells[0], 0);

  const growthRow = rows[0];
  const growthRate = percent(
    ((growthRow.cells[1] - growthRow.cells[0]) / growthRow.cells[0]) * 100,
  );
  const growthWord = growthRate >= 0 ? "증가" : "감소";
  push(
    "growth",
    `${growthRow.label}의 2024년 값은 2023년 대비 ${Math.abs(growthRate)}% ${growthWord}했다.`,
    true,
  );
  push(
    "growth",
    `${growthRow.label}의 2024년 값은 2023년 대비 ${Math.abs(growthRate) + 5}% ${growthWord}했다.`,
    false,
  );

  const shareRow = rows[1];
  const share = percent((shareRow.cells[1] / total2024) * 100);
  push(
    "share",
    `2024년 전체에서 ${asSubject(shareRow.label)} 차지하는 비중은 약 ${share}%이다.`,
    true,
  );
  push(
    "share",
    `2024년 전체에서 ${asSubject(shareRow.label)} 차지하는 비중은 약 ${percent(share + 6)}%이다.`,
    false,
  );

  const average = total2023 / rows.length;
  push("average", `2023년 네 부문의 평균은 ${formatNumber(average)}${unit}이다.`, true);
  push("average", `2023년 네 부문의 평균은 ${formatNumber(average + 25)}${unit}이다.`, false);

  const totalGap = total2024 - total2023;
  const gapWord = totalGap >= 0 ? "크다" : "작다";
  push(
    "total",
    `2024년 네 부문의 합계는 2023년보다 ${formatNumber(Math.abs(totalGap))}${unit} ${gapWord}.`,
    true,
  );
  push(
    "total",
    `2024년 네 부문의 합계는 2023년보다 ${formatNumber(Math.abs(totalGap) + 100)}${unit} ${gapWord}.`,
    false,
  );

  const biggestRise = [...rows].sort((a, b) => b.cells[1] - b.cells[0] - (a.cells[1] - a.cells[0]));
  push("rise", `2023년 대비 증가량이 가장 큰 부문은 ${biggestRise[0].label}이다.`, true);
  push("rise", `2023년 대비 증가량이 가장 큰 부문은 ${biggestRise[1].label}이다.`, false);

  const ranked2024 = [...rows].sort((a, b) => b.cells[1] - a.cells[1]);
  const ratioTop = ranked2024[0];
  const ratioBottom = ranked2024[rows.length - 1];
  const ratio = percent(ratioTop.cells[1] / ratioBottom.cells[1]);
  push("ratio", `2024년 ${ratioTop.label}의 값은 ${ratioBottom.label}의 약 ${ratio}배이다.`, true);
  push(
    "ratio",
    `2024년 ${ratioTop.label}의 값은 ${ratioBottom.label}의 약 ${percent(ratio + 0.8)}배이다.`,
    false,
  );

  return claims;
}

export const DATA_CALCULATION_QUESTIONS: ExampleQuestion[] = calculationTopics.map(
  ([title, unit], index) => {
    const rows = calculationRows(index);
    const claims = calculationClaims(rows, unit);
    const { correct, wrongs } = pickFalseAndTrue(claims, index + 2);
    return defineQuestion(CATEGORY, "da-calc-1", "표에서 옳지 않은 설명 찾기 (계산)", index, {
      stem: `다음은 ${title}에 관한 자료이다. 이를 계산하여 판단한 설명으로 옳지 않은 것은?`,
      visuals: tableVisual(`da-calc-${index + 1}`, title, ["2023년", "2024년"], rows, unit),
      ...rotateChoices(correct, wrongs, index + 2),
      explanation: `표의 값으로 증가율, 비중, 합계를 직접 계산하면 나머지 네 설명은 모두 맞습니다. ‘${correct}’만 계산 결과와 맞지 않으므로 옳지 않은 설명입니다.`,
    });
  },
);

export const DATA_EXAMPLE_QUESTIONS = [...DATA_READING_QUESTIONS, ...DATA_CALCULATION_QUESTIONS];
