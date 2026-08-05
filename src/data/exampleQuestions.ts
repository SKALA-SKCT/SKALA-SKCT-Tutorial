import type { ProblemVisual } from "../types";
import { CATEGORIES, type ExampleQuestion, type ProblemKind } from "./catalog";

type Draft = Omit<ExampleQuestion, "id" | "categoryId" | "kindId" | "typeLabel">;

const markers = ["①", "②", "③", "④", "⑤"];
const comma = (value: number) => value.toLocaleString("ko-KR");
const roundedDecimal = (value: number) => String(Math.round(value * 10000) / 10000);
const hasBatchim = (text: string) => {
  const code = text.charCodeAt(text.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
};
const topic = (text: string) => `${text}${hasBatchim(text) ? "은" : "는"}`;
const subject = (text: string) => `${text}${hasBatchim(text) ? "이" : "가"}`;
const object = (text: string) => `${text}${hasBatchim(text) ? "을" : "를"}`;
const withAnd = (text: string) => `${text}${hasBatchim(text) ? "과" : "와"}`;

function choicesWithAnswer(correct: string, wrong: string[], index: number) {
  const answer = index % 5;
  const fallback = [
    "조건만으로 구할 수 없다",
    "제시된 값 중에는 없다",
    "모든 값이 가능하다",
    "조건이 서로 모순된다",
  ];
  const choices = [...new Set(wrong.filter((choice) => choice !== correct))];
  for (const choice of fallback)
    if (choices.length < 4 && !choices.includes(choice) && choice !== correct) choices.push(choice);
  choices.splice(4);
  choices.splice(answer, 0, correct);
  return { choices, answer };
}

function numberChoices(value: number, gap: number, index: number, suffix = "") {
  const wrong = [-2, -1, 1, 2].map((offset) => `${comma(value + gap * offset)}${suffix}`);
  return choicesWithAnswer(`${comma(value)}${suffix}`, wrong, index);
}

const subjects = [
  [
    "공공 체육시설",
    "시간대별 이용량",
    "시설 수",
    "혼잡 시간에 운영 인력을 재배치",
    "대기 시간이 줄었다",
  ],
  [
    "지역 도서관",
    "좌석별 체류 시간",
    "보유 도서 수",
    "학습 공간과 협업 공간을 분리",
    "소음 민원이 감소했다",
  ],
  [
    "공유 우산 서비스",
    "대여소별 반납률",
    "대여소 수",
    "날씨와 이동 경로에 맞춰 우산을 재배치",
    "품절 시간이 짧아졌다",
  ],
  [
    "산업 안전 교육",
    "공정별 사고 기록",
    "교육 횟수",
    "위험 공정에 실습 시간을 집중",
    "초기 대응 속도가 빨라졌다",
  ],
  [
    "학교 급식",
    "메뉴별 잔반량",
    "메뉴 가짓수",
    "잔반 원인을 반영해 배식량을 조절",
    "식재료 폐기가 감소했다",
  ],
  [
    "도심 배송",
    "권역별 주문 밀도",
    "배송 차량 수",
    "주문 밀도에 따라 출발 거점을 조정",
    "평균 배송 시간이 줄었다",
  ],
  [
    "하천 산책로",
    "구간별 보행량",
    "벤치 수",
    "이용 시간과 그늘 위치에 맞춰 휴식 시설을 이동",
    "낮 시간 이용률이 높아졌다",
  ],
  [
    "고객 상담",
    "문의 유형별 처리 시간",
    "상담 인원",
    "반복 문의를 자동 분류하고 복합 문의를 전담 배정",
    "첫 답변 시간이 짧아졌다",
  ],
  [
    "사내 회의",
    "안건별 결정 지연 원인",
    "회의 횟수",
    "결정 담당자와 기한을 회의 전에 지정",
    "미완료 안건이 감소했다",
  ],
  [
    "전기차 충전소",
    "시간대별 충전 수요",
    "충전기 수",
    "회전율이 낮은 지점의 장비를 수요 지점으로 이전",
    "대기 차량이 줄었다",
  ],
  [
    "박물관 안내",
    "전시실별 체류 경로",
    "안내판 수",
    "갈림길 중심으로 안내 정보를 재배치",
    "길 찾기 문의가 감소했다",
  ],
  [
    "재활용 수거",
    "요일별 배출량",
    "수거함 수",
    "배출량에 따라 수거 주기를 다르게 적용",
    "넘침 신고가 줄었다",
  ],
  [
    "원격 진료 예약",
    "진료과별 취소 시간",
    "예약 가능 인원",
    "취소 가능성이 높은 시간에 대기 명단을 연동",
    "빈 진료 시간이 감소했다",
  ],
  [
    "공장 설비 점검",
    "장비별 고장 전조",
    "정기 점검 횟수",
    "전조가 나타난 장비를 우선 점검",
    "갑작스러운 정지가 줄었다",
  ],
  [
    "문화 강좌",
    "과정별 중도 이탈 시점",
    "개설 과정 수",
    "이탈이 많은 차시에 보충 활동을 배치",
    "수료율이 높아졌다",
  ],
  [
    "농산물 보관",
    "품목별 온도 변화",
    "창고 면적",
    "품목별 적정 온도로 보관 구역을 분리",
    "폐기 비율이 감소했다",
  ],
  [
    "통근 버스",
    "정류장별 승차 인원",
    "운행 횟수",
    "혼잡 노선의 정차 순서와 배차를 조정",
    "정시 도착률이 높아졌다",
  ],
  [
    "온라인 교육",
    "차시별 재생 중단 구간",
    "영상 길이",
    "중단이 많은 구간에 짧은 확인 문제를 배치",
    "완강률이 높아졌다",
  ],
  [
    "보행 신호",
    "교차로별 대기 인원",
    "신호등 수",
    "시간대별 보행량에 따라 신호 시간을 조절",
    "무단 횡단이 줄었다",
  ],
  [
    "사내 문서 검색",
    "검색어별 실패 기록",
    "문서 수",
    "동의어와 최신 문서 가중치를 검색에 반영",
    "재검색 횟수가 감소했다",
  ],
] as const;

const countScenarios = [
  "신입사원 연수",
  "연구 발표회",
  "고객 간담회",
  "안전 워크숍",
  "품질 개선 회의",
  "물류 교육",
  "서비스 기획 행사",
  "설비 점검 교육",
  "제품 출시 설명회",
  "지역 축제 운영",
  "채용 설명회",
  "기술 세미나",
  "공정 개선 발표회",
  "시장조사 워크숍",
  "환경 캠페인",
  "예산 심의회",
  "보안 교육",
  "업무 인수인계 회의",
  "재고조사 교육",
  "성과 공유회",
] as const;

const workScenarios = [
  "보고서 작성",
  "제품 포장",
  "자료 검수",
  "설비 점검",
  "주문 분류",
  "재고 정리",
  "문서 전산화",
  "표본 분석",
  "부품 조립",
  "화물 적재",
  "데이터 입력",
  "도면 검토",
  "품질 검사",
  "장비 세척",
  "설문 집계",
  "좌석 배치",
  "서류 분류",
  "상품 진열",
  "기록 대조",
  "안내문 발송",
] as const;

const probabilityScenarios = [
  "부품 검사",
  "통신 연결",
  "센서 작동",
  "시제품 테스트",
  "비상 호출",
  "데이터 전송",
  "품질 판정",
  "보안 인증",
  "장비 시동",
  "표본 채취",
  "신호 감지",
  "오류 복구",
  "배송 확인",
  "결제 승인",
  "예약 접수",
  "문서 변환",
  "위치 측정",
  "재고 인식",
  "온도 감지",
  "경보 전송",
] as const;

function verbalSource(index: number) {
  const [subject, evidence, oldMetric, action, result] = subjects[index];
  const before = 30 + index;
  const after = before - (5 + (index % 4));
  const passage = `${subject} 운영자는 초기 성과를 ${oldMetric}로만 판단했다. 그러나 이용자가 체감하는 불편은 수량이 늘어난 뒤에도 계속됐다. 운영자는 ${object(evidence)} 조사해 불편이 특정 조건에 집중된다는 사실을 확인했다. 이에 ${action}했다. 조정 전 평균 불편 지수는 ${before}였고 조정 후에는 ${after}로 낮아졌다. 이 사례는 투입 규모보다 이용 과정에서 얻은 근거를 운영 결정에 반영하는 일이 중요함을 보여준다.`;
  return { subject, evidence, oldMetric, action, result, before, after, passage };
}

function verbalQuestion(kindId: string, index: number): Draft {
  const s = verbalSource(index);
  const commonWrong = [
    `${s.subject}의 운영을 전면 중단해야 한다`,
    `${s.oldMetric}만 늘리면 모든 불편이 해결된다`,
    `이용자 조사는 운영 성과와 관계가 없다`,
    `운영 방식은 조정 뒤에도 바뀌지 않았다`,
  ];

  if (kindId === "verbal-topic") {
    const correct = `이용 근거를 반영한 ${s.subject} 운영 개선`;
    const c = choicesWithAnswer(correct, commonWrong, index);
    return {
      stem: "다음 글의 주제로 가장 적절한 것은?",
      passage: s.passage,
      ...c,
      explanation: `글은 ${object(s.evidence)} 근거로 운영 방식을 바꾸고 불편을 줄인 과정을 설명하므로 ${correct}이 중심 내용입니다.`,
    };
  }
  if (kindId === "verbal-blank-single") {
    const passage = `${s.passage.split(". ").slice(0, 5).join(". ")}. 따라서 효과적인 운영은 투입량보다 ______에 가까워야 한다.`;
    const correct = "이용 근거에 따른 지속적인 조정";
    const c = choicesWithAnswer(
      correct,
      [
        "일률적인 수량 확대",
        "조사 없는 즉시 결정",
        "기존 방식의 무조건 유지",
        "성과 측정의 전면 중단",
      ],
      index,
    );
    return {
      stem: "다음 글의 빈칸에 들어갈 내용으로 가장 적절한 것은?",
      passage,
      ...c,
      explanation: `${object(s.evidence)} 조사해 ${s.action}한 뒤 지표가 개선됐으므로 빈칸에는 근거에 따른 조정이 들어가야 합니다.`,
    };
  }
  if (kindId === "verbal-blank-position") {
    const target = index % 5;
    const positions = ["(A)", "(B)", "(C)", "(D)", "(E)"];
    const before = `${s.subject} 운영자는 ${s.oldMetric}가 늘면 서비스 품질도 자연스럽게 높아질 것으로 기대했다.`;
    const after = `실제로는 ${s.evidence}에 따라 불편이 집중되는 조건이 달랐다.`;
    const fillers = [
      `${topic(s.subject)} 여러 지역에서 이용되고 있다.`,
      `운영자는 매달 시설 현황을 공개했다.`,
      `${s.action}하는 방안도 검토했다.`,
      `조정 뒤에는 ${s.result}.`,
    ];
    const sentences = [...fillers];
    sentences.splice(target, 0, before, after);
    const passage =
      sentences
        .slice(0, 5)
        .map((text, i) => `${text} ${positions[i]}`)
        .join(" ") + ` ${sentences.slice(5).join(" ")}`;
    return {
      stem: "다음 글의 (A)~(E) 중 <보기>의 문장이 들어갈 위치로 가장 적절한 곳은?",
      passage,
      box: "그러나 투입 규모가 커진다고 해서 이용자의 불편이 항상 줄어드는 것은 아니다.",
      choices: positions,
      answer: target,
      explanation: `보기의 ‘그러나’는 투입 확대에 대한 기대를 반전하고 실제 이용 조건의 차이로 이어지므로 ${positions[target]}가 적절합니다.`,
    };
  }
  if (kindId === "verbal-match-predicate") {
    const correct = `조정 뒤 불편 지수는 ${s.before}보다 높아졌다`;
    const c = choicesWithAnswer(
      correct,
      [
        `운영자는 ${object(s.evidence)} 조사했다`,
        `${s.action}했다`,
        `조정 전 불편 지수는 ${s.before}였다`,
        `조정 뒤 불편 지수는 ${s.after}였다`,
      ],
      index,
    );
    return {
      stem: "다음 글의 내용과 일치하지 않는 것은?",
      passage: s.passage,
      ...c,
      explanation: `불편 지수는 ${s.before}에서 ${s.after}로 낮아졌으므로 높아졌다는 선지가 본문과 일치하지 않습니다.`,
    };
  }
  if (kindId === "verbal-match-range") {
    const correct = `조정 전 평균 불편 지수는 ${s.before}였다`;
    const c = choicesWithAnswer(
      correct,
      [
        `조정 전 지수는 ${s.after}였다`,
        `조정 후 지수는 ${s.before}였다`,
        `모든 이용자의 불편이 완전히 사라졌다`,
        `${s.oldMetric}는 감소했다는 수치가 제시됐다`,
      ],
      index,
    );
    return {
      stem: "다음 글의 내용과 일치하는 것은?",
      passage: s.passage,
      ...c,
      explanation: `본문에 조정 전 평균 불편 지수가 ${s.before}이라고 직접 제시되어 있습니다.`,
    };
  }
  if (kindId === "verbal-match-order") {
    const correct = `${s.action}한 뒤 ${object(s.evidence)} 처음 조사했다`;
    const c = choicesWithAnswer(
      correct,
      [
        `${object(s.evidence)} 조사한 뒤 운영 방식을 조정했다`,
        `초기에는 ${s.oldMetric}로 성과를 판단했다`,
        `운영 조정 뒤 지표를 다시 측정했다`,
        `수량 확대 뒤에도 불편이 이어졌다`,
      ],
      index,
    );
    return {
      stem: "다음 글의 내용과 일치하지 않는 것은?",
      passage: s.passage,
      ...c,
      explanation: `${s.evidence} 조사 후 ${s.action}했으므로 두 절차의 순서를 바꾼 선지가 일치하지 않습니다.`,
    };
  }
  if (kindId === "verbal-match-unmentioned") {
    const correct = `${s.subject} 이용 요금을 절반으로 낮췄다`;
    const c = choicesWithAnswer(
      correct,
      [
        `${s.oldMetric} 중심의 초기 평가`,
        `${s.evidence} 조사`,
        `${s.action}한 조정`,
        `조정 전후 지표 비교`,
      ],
      index,
    );
    return {
      stem: "다음 글에서 언급되지 않은 것은?",
      passage: s.passage,
      ...c,
      explanation: `이용 요금 조정은 본문에서 언급되지 않았습니다.`,
    };
  }
  if (kindId === "verbal-paragraph-order") {
    const parts = [
      `(가) 그 결과 ${s.result}.`,
      `(나) ${s.subject} 운영자는 기존 방식으로 이용자 불편을 해결하기 어렵다고 판단했다.`,
      `(다) 조사 결과를 바탕으로 ${s.action}했다.`,
      `(라) 먼저 ${object(s.evidence)} 조사해 불편이 집중되는 조건을 확인했다.`,
    ];
    const passage = parts.join("\n");
    const correct = "나, 라, 다, 가";
    const c = choicesWithAnswer(
      correct,
      ["가, 나, 라, 다", "나, 다, 라, 가", "라, 나, 다, 가", "나, 라, 가, 다"],
      index,
    );
    return {
      stem: "다음 글의 (가)~(라)를 문맥에 맞게 순서대로 배열한 것은?",
      passage,
      ...c,
      explanation: `문제 인식인 (나), 조사인 (라), 조정인 (다), 결과인 (가)의 순서가 자연스럽습니다.`,
    };
  }
  if (kindId === "verbal-understanding") {
    const correct = `운영자는 투입량보다 이용 조건을 반영하는 방향으로 방식을 바꿨다`;
    const c = choicesWithAnswer(correct, commonWrong, index);
    return {
      stem: "다음 글을 이해한 내용으로 가장 적절한 것은?",
      passage: s.passage,
      ...c,
      explanation: `${object(s.evidence)} 조사해 ${s.action}했으므로 이용 조건을 반영한 운영 전환으로 이해할 수 있습니다.`,
    };
  }
  if (kindId === "verbal-inference") {
    const correct = `${object(s.evidence)} 계속 측정하면 운영 방식을 추가로 조정할 수 있다`;
    const c = choicesWithAnswer(correct, commonWrong, index);
    return {
      stem: "다음 글을 읽고 추론한 내용으로 가장 적절한 것은?",
      passage: s.passage,
      ...c,
      explanation: `본문은 조사 결과에 따라 운영을 조정하고 지표를 다시 확인하므로 같은 근거를 계속 측정하면 후속 조정이 가능하다고 추론할 수 있습니다.`,
    };
  }
  const correct = `같은 시기에 ${s.subject} 주변의 접근성이 크게 개선됐다`;
  const c = choicesWithAnswer(
    correct,
    [
      `조정 뒤에도 ${object(s.evidence)} 기록했다`,
      `운영자가 결과를 공개했다`,
      `${s.oldMetric}를 함께 집계했다`,
      `일부 이용자는 조정 내용을 알고 있었다`,
    ],
    index,
  );
  return {
    stem: "운영 방식의 조정이 지표 개선의 원인이라는 주장에 대한 반박으로 가장 적절한 것은?",
    passage: s.passage,
    ...c,
    explanation: `같은 시기의 접근성 개선은 지표 변화가 운영 조정이 아닌 다른 원인에서 비롯됐을 가능성을 제시합니다.`,
  };
}

function tableVisual(
  id: string,
  title: string,
  columns: string[],
  rows: Array<[string, ...(string | number)[]]>,
  unit?: string,
): ProblemVisual {
  return {
    type: "table",
    id,
    title,
    columns,
    unit,
    rows: rows.map((row, i) => ({
      id: `${id}-r${i + 1}`,
      label: String(row[0]),
      cells: row.slice(1),
    })),
  };
}

function dataQuestion(kindId: string, index: number): Draft {
  const base = 70 + index * 3;
  const labels = ["A", "B", "C", "D", "E"];
  if (kindId === "data-trend") {
    const values = [base, base + 8, base + 3, base + 14];
    const visual: ProblemVisual = {
      type: "bar-chart",
      id: `trend-${index}`,
      title: "분기별 처리 건수",
      unit: "건",
      categories: ["1분기", "2분기", "3분기", "4분기"],
      series: [{ id: `trend-series-${index}`, name: "처리 건수", values, color: "#c8755a" }],
    };
    const correct = "2분기에서 3분기에 감소하였다";
    const c = choicesWithAnswer(
      correct,
      [
        "모든 분기에 증가하였다",
        "1분기가 가장 많다",
        "3분기가 가장 많다",
        "4분기는 1분기보다 적다",
      ],
      index,
    );
    return {
      stem: "다음 자료에 대한 설명으로 옳은 것은?",
      passage: "",
      visuals: [visual],
      ...c,
      explanation: `2분기 ${base + 8}건에서 3분기 ${base + 3}건으로 감소했습니다.`,
    };
  }
  const rowValues = labels.map(
    (label, i) => [label, base + i * 7, base + i * 5 + (i % 2 ? 9 : 2)] as [string, number, number],
  );
  if (kindId === "data-magnitude") {
    const visual = tableVisual(
      `magnitude-${index}`,
      "부서별 완료 건수",
      ["부서", "상반기", "하반기"],
      rowValues,
      "건",
    );
    const max = rowValues[4][1];
    const correct = `상반기 완료 건수는 E 부서가 ${max}건으로 가장 많다`;
    const c = choicesWithAnswer(
      correct,
      [
        "상반기는 A 부서가 가장 많다",
        "하반기는 A 부서가 가장 많다",
        "C 부서의 두 기간 값은 같다",
        "모든 부서가 하반기에 감소했다",
      ],
      index,
    );
    return {
      stem: "다음 자료에 대한 설명으로 옳은 것은?",
      passage: "",
      visuals: [visual],
      ...c,
      explanation: `상반기 열에서 가장 큰 값은 E 부서의 ${max}건입니다.`,
    };
  }
  if (kindId === "data-simple-sum") {
    const sums = rowValues.map((r) => r[1] + r[2]);
    const winner = sums.indexOf(Math.max(...sums));
    const visual = tableVisual(
      `sum-${index}`,
      "지점별 접수 건수",
      ["지점", "1분기", "2분기"],
      rowValues,
      "건",
    );
    const correct = `${labels[winner]} 지점의 상반기 합계가 ${sums[winner]}건으로 가장 많다`;
    const c = choicesWithAnswer(
      correct,
      labels
        .filter((_, i) => i !== winner)
        .map((x, i) => `${x} 지점의 상반기 합계가 ${sums[i]}건으로 가장 많다`),
      index,
    );
    return {
      stem: "다음 자료에 대한 설명으로 옳은 것은?",
      passage: "",
      visuals: [visual],
      ...c,
      explanation: `각 지점의 두 분기 값을 더하면 최댓값은 ${labels[winner]} 지점의 ${sums[winner]}건입니다.`,
    };
  }
  if (kindId === "data-easy-rate") {
    const prior = 160 + index * 8;
    const current = (prior * 5) / 4;
    const visual = tableVisual(
      `rate-${index}`,
      "제품별 판매량",
      ["구분", "전년", "금년"],
      [
        ["A 제품", prior, current],
        ["B 제품", prior + 20, prior + 30],
      ],
      "개",
    );
    const c = choicesWithAnswer(
      "A 제품의 증가율은 25%이다",
      [
        "A 제품의 증가율은 20%이다",
        "A 제품의 증가율은 50%이다",
        "B 제품의 증가율은 25%이다",
        "두 제품의 증가량은 같다",
      ],
      index,
    );
    return {
      stem: "다음 자료에 대한 설명으로 옳은 것은?",
      passage: "",
      visuals: [visual],
      ...c,
      explanation: `A 제품은 ${prior}개에서 ${current}개로 ${current - prior}개 증가했고, 증가량은 전년 값의 25%입니다.`,
    };
  }
  if (kindId === "data-easy-chain") {
    const total = 800 + index * 40;
    const tech = total / 2;
    const grade = tech / 5;
    const visual = tableVisual(
      `chain-${index}`,
      "직군 구성과 평가 비율",
      ["구분", "인원", "A등급 비율"],
      [
        ["기술직", tech, "20%"],
        ["지원직", total - tech, "10%"],
      ],
      "명",
    );
    const c = choicesWithAnswer(
      `기술직 A등급은 전체의 10%인 ${grade}명이다`,
      [
        `기술직 A등급은 ${tech}명이다`,
        `기술직 A등급은 전체의 20%이다`,
        `지원직 A등급은 전체의 20%이다`,
        `전체 A등급은 ${total}명이다`,
      ],
      index,
    );
    return {
      stem: "다음 자료에 대한 설명으로 옳은 것은?",
      passage: `전체 임직원은 ${total}명이다.`,
      visuals: [visual],
      ...c,
      explanation: `기술직 비중 50%에 A등급 비율 20%를 곱하면 전체의 10%, 즉 ${grade}명입니다.`,
    };
  }
  if (kindId === "data-share-rate") {
    const total = 1000 + index * 100;
    const a = total * 0.3;
    const visual = tableVisual(
      `share-${index}`,
      "제품군별 매출",
      ["제품군", "매출"],
      [
        ["A", a],
        ["B", total * 0.25],
        ["C", total * 0.2],
        ["D", total * 0.15],
        ["E", total * 0.1],
      ],
      "백만 원",
    );
    const c = choicesWithAnswer(
      "A 제품군의 전체 매출 비중은 30%이다",
      [
        "A 제품군의 비중은 3%이다",
        "B 제품군의 비중은 30%이다",
        "C 제품군의 비중은 25%이다",
        "E 제품군의 비중은 20%이다",
      ],
      index,
    );
    return {
      stem: "다음 자료에 대한 설명으로 옳은 것은?",
      passage: `전체 매출은 ${comma(total)}백만 원이다.`,
      visuals: [visual],
      ...c,
      explanation: `${comma(a)}을 전체 ${comma(total)}으로 나누면 0.3이므로 30%입니다.`,
    };
  }
  if (kindId === "data-average") {
    const center = 100 + index * 2;
    const values = [center - 12, center - 5, center, center + 5, center + 12];
    const visual = tableVisual(
      `average-${index}`,
      "지점별 처리 건수",
      ["지점", "처리 건수"],
      labels.map((x, i) => [x, values[i]] as [string, number]),
      "건",
    );
    const c = numberChoices(center, 2, index, "건");
    return {
      stem: "다섯 지점의 평균 처리 건수는?",
      passage: "",
      visuals: [visual],
      ...c,
      explanation: `${center}을 기준으로 편차가 -12, -5, 0, 5, 12로 상쇄되므로 평균은 ${center}건입니다.`,
    };
  }
  if (kindId === "data-derived-value") {
    const total = 400 + index * 20;
    const count = total * 0.3;
    const visual = tableVisual(
      `derived-${index}`,
      "응답 결과",
      ["응답", "인원", "비율"],
      [
        ["만족", count, "30%"],
        ["그 외", "미상", "70%"],
      ],
      "명",
    );
    const c = numberChoices(total, 20, index, "명");
    return {
      stem: "전체 응답자 수는?",
      passage: "",
      visuals: [visual],
      ...c,
      explanation: `전체의 30%가 ${count}명이므로 ${count}÷0.3=${total}명입니다.`,
    };
  }
  const p0 = 80 + index * 4,
    p1 = p0 + 12,
    p2 = p1 + 18;
  const visual = tableVisual(
    `multi-${index}`,
    "사업부별 영업이익",
    ["사업부", "2023년", "2024년", "2025년"],
    [
      ["A", p0, p1, p2],
      ["B", p0 + 10, p1 + 5, p2 + 8],
    ],
    "억 원",
  );
  const box =
    "ㄱ. A의 2024년 증가액은 12억 원이다.\nㄴ. A의 2025년 증가액은 18억 원이다.\nㄷ. A의 2년간 총 증가액은 30억 원이다.";
  const c = choicesWithAnswer("ㄱ, ㄴ, ㄷ", ["ㄱ", "ㄴ", "ㄱ, ㄴ", "ㄴ, ㄷ"], index);
  return {
    stem: "다음 자료에 대한 설명으로 옳은 것만을 <보기>에서 모두 고른 것은?",
    passage: "",
    visuals: [visual],
    box,
    ...c,
    explanation: `A의 값은 ${p0}, ${p1}, ${p2}이므로 증가액은 각각 12와 18이고 전체 증가는 30입니다. 따라서 ㄱ, ㄴ, ㄷ이 모두 옳습니다.`,
  };
}

const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
const combination = (n: number, r: number) => factorial(n) / (factorial(r) * factorial(n - r));
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const fractionText = (numerator: number, denominator: number) => {
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
};

function mathQuestion(kindId: string, index: number): Draft {
  const countScenario = countScenarios[index];
  const workScenario = workScenarios[index];
  if (kindId === "math-concentration-mix") {
    const low = 10 + (index % 3) * 5,
      high = low + 30,
      target = low + 10;
    const total = 300 + index * 30,
      lowAmount = (total * (high - target)) / (high - low);
    const c = numberChoices(lowAmount, 10, index, "g");
    return {
      stem: `${low}% 용액과 ${high}% 용액을 섞어 ${target}% 용액 ${total}g을 만들 때 ${low}% 용액의 양은?`,
      passage: "혼합 과정에서 용질의 양은 보존된다.",
      ...c,
      explanation: `농도 차이의 반대 비는 ${high - target}:${target - low}=2:1이므로 전체의 2/3인 ${lowAmount}g입니다.`,
    };
  }
  if (kindId === "math-concentration-add") {
    const initial = 300 + index * 20,
      rate = 20,
      water = 100 + index * 10,
      salt = (initial * rate) / 100,
      result = (salt / (initial + water)) * 100;
    const rounded = Math.round(result * 10) / 10;
    const c = choicesWithAnswer(
      `${rounded}%`,
      [
        `${Math.max(1, rounded - 5)}%`,
        `${rounded + 5}%`,
        `${rounded + 10}%`,
        `${Math.round((salt / water) * 100)}%`,
      ],
      index,
    );
    return {
      stem: "물을 추가한 뒤 용액의 농도는?",
      passage: `${rate}% 소금물 ${initial}g에 물 ${water}g을 넣는다. 필요한 경우 소수 둘째 자리에서 반올림한다.`,
      ...c,
      explanation: `소금 ${salt}g은 변하지 않고 전체는 ${initial + water}g이므로 농도는 ${rounded}%입니다.`,
    };
  }
  if (kindId === "math-concentration-ratio") {
    const low = 5 + index,
      high = low + 20,
      target = low + 10;
    const c = choicesWithAnswer("1:1", ["1:2", "2:1", "1:3", "3:1"], index);
    return {
      stem: `${low}%와 ${high}% 용액을 섞어 ${target}% 용액을 만들 때 두 용액의 양의 비는?`,
      passage: "두 용액 외에 물이나 용질을 추가하지 않는다.",
      ...c,
      explanation: `목표 농도와 두 농도의 차이가 각각 10%p로 같으므로 양의 비는 1:1입니다.`,
    };
  }
  if (kindId === "math-population-equation") {
    const a = 80 + index * 5,
      b = 120 + index * 5,
      total = a + b,
      changed = Math.round(a * 1.1 + b * 0.9);
    const c = numberChoices(a, 5, index, "명");
    return {
      stem: "원래 A 집단의 인원은?",
      passage: `A와 B의 합은 ${total}명이다. A가 10% 늘고 B가 10% 줄면 합은 ${changed}명이 된다. 모든 인원은 자연수이다.`,
      ...c,
      explanation: `A+B=${total}, 1.1A+0.9B=${changed}를 연립하면 A=${a}명입니다.`,
    };
  }
  if (kindId === "math-population-multiple") {
    const original = 50 + index * 5,
      after = (original * 6) / 5;
    const c = numberChoices(after, 6, index, "명");
    return {
      stem: "인원을 정확히 20% 늘린 뒤 인원으로 가능한 것은?",
      passage: "조정 전후 인원은 모두 자연수이며 반올림하지 않는다.",
      ...c,
      explanation: `조정 뒤 인원은 원래 인원의 6/5이므로 6의 배수여야 하며, 선지 중 ${after}명이 조건을 만족합니다.`,
    };
  }
  if (kindId === "math-price-profit") {
    const cost = 40000 + index * 2000,
      rate = 25,
      sale = cost * 1.25;
    const c = numberChoices(sale, 1000, index, "원");
    return {
      stem: "상품 한 개의 판매가는?",
      passage: `원가가 ${comma(cost)}원인 상품에 원가의 ${rate}%만큼 이익을 붙인다. 추가 비용과 할인은 없다.`,
      ...c,
      explanation: `${comma(cost)}×1.25=${comma(sale)}원이므로 판매가는 ${comma(sale)}원입니다.`,
    };
  }
  if (kindId === "math-count-sum-product") {
    const transport = 3 + (index % 4),
      menu = 4 + (index % 3),
      answer = transport * menu,
      c = numberChoices(answer, 1, index);
    return {
      stem: `${countScenario} 참가자가 이동 방법과 식사 메뉴를 하나씩 정하는 경우의 수는?`,
      passage: `이용 가능한 이동 방법은 ${transport}개, 식사 메뉴는 ${menu}개이며 두 선택은 서로 독립적이다.`,
      ...c,
      explanation: `두 선택은 연속된 단계이므로 ${transport}×${menu}=${answer}가지입니다.`,
    };
  }
  if (kindId === "math-count-factorial") {
    const n = 5 + (index % 3),
      answer = factorial(n),
      c = numberChoices(answer, Math.max(2, factorial(n - 2)), index);
    return {
      stem: `${countScenario}에서 서로 다른 ${n}명의 발표 순서를 정하는 경우의 수는?`,
      passage: "모든 발표자는 한 번씩 발표하며 같은 순서는 하나로 센다.",
      ...c,
      explanation: `서로 다른 ${n}명을 일렬로 배열하므로 ${n}!=${answer}가지입니다.`,
    };
  }
  if (kindId === "math-count-permutation") {
    const n = 5 + (index % 4),
      answer = n * (n - 1),
      c = numberChoices(answer, 2, index);
    return {
      stem: `${countScenario} 후보 ${n}명 중 팀장과 부팀장을 한 명씩 정하는 경우의 수는?`,
      passage: "한 사람이 두 직책을 함께 맡을 수 없다.",
      ...c,
      explanation: `직책에 따라 결과가 달라지므로 ${n}P2=${n}×${n - 1}=${answer}가지입니다.`,
    };
  }
  if (kindId === "math-count-combination") {
    const n = 5 + (index % 5),
      answer = combination(n, 2),
      c = numberChoices(answer, 2, index);
    return {
      stem: `${countScenario} 후보 ${n}명 중 역할 구분 없이 두 명을 선발하는 경우의 수는?`,
      passage: "선발 순서가 달라도 같은 두 사람이면 같은 경우로 센다.",
      ...c,
      explanation: `순서가 없으므로 ${n}C2=${answer}가지입니다.`,
    };
  }
  if (kindId === "math-count-bundle") {
    const n = 4 + (index % 3),
      answer = factorial(n - 1) * 2,
      c = numberChoices(answer, 2, index);
    return {
      stem: `${countScenario} 참가자 ${n}명을 한 줄로 세울 때 A와 B가 이웃하는 경우의 수는?`,
      passage: `A와 B를 포함한 ${n}명은 모두 서로 다르다.`,
      ...c,
      explanation: `A와 B를 한 묶음으로 보면 ${n - 1}개 대상을 배열하고 묶음 내부 순서 2가지를 곱하므로 ${answer}가지입니다.`,
    };
  }
  if (kindId === "math-count-separated") {
    const n = 4 + (index % 3),
      answer = factorial(n) - factorial(n - 1) * 2,
      c = numberChoices(answer, 2, index);
    return {
      stem: `${countScenario} 참가자 ${n}명을 한 줄로 세울 때 A와 B가 이웃하지 않는 경우의 수는?`,
      passage: `A와 B를 포함한 ${n}명은 모두 서로 다르다.`,
      ...c,
      explanation: `전체 ${n}!에서 A와 B가 붙는 ${n - 1}!×2를 빼면 ${answer}가지입니다.`,
    };
  }
  if (kindId === "math-count-group") {
    const n = index % 2 ? 8 : 6,
      r = n / 2,
      answer = combination(n, r) / 2,
      c = numberChoices(answer, Math.max(2, n / 2), index);
    return {
      stem: `${countScenario} 참가자 ${n}명을 ${r}명씩 이름 없는 두 조로 나누는 경우의 수는?`,
      passage: "두 조의 이름은 없으며 조의 순서만 다른 경우는 같게 센다.",
      ...c,
      explanation: `한 조를 고르는 ${n}C${r}에서 두 조가 뒤바뀐 중복을 2로 나누면 ${answer}가지입니다.`,
    };
  }
  if (kindId === "math-count-select") {
    const n = 6 + (index % 3),
      answer = combination(n, 2) - combination(n - 2, 2),
      c = numberChoices(answer, 2, index);
    return {
      stem: `${countScenario} 후보 ${n}명 중 두 명을 뽑되 A와 B 중 적어도 한 명을 포함하는 경우의 수는?`,
      passage: "선발 순서는 구분하지 않는다.",
      ...c,
      explanation: `전체 ${n}C2에서 A와 B가 모두 빠지는 ${n - 2}C2를 빼면 ${answer}가지입니다.`,
    };
  }
  if (kindId === "math-count-circle") {
    const n = 5 + (index % 3),
      answer = factorial(n - 1),
      c = numberChoices(answer, Math.max(2, factorial(n - 3)), index);
    return {
      stem: `${countScenario} 참가자 ${n}명이 원탁에 앉는 경우의 수는?`,
      passage: "회전하여 같은 배치는 하나로 센다.",
      ...c,
      explanation: `한 명을 고정하고 나머지 ${n - 1}명을 배열하므로 (${n}-1)!=${answer}가지입니다.`,
    };
  }
  if (kindId === "math-probability-basic") {
    const failDen = 2 + (index % 4),
      den = failDen ** 2,
      num = den - 1;
    const probabilityChoices = [
      ...Array.from({ length: den - 1 }, (_, numerator) => fractionText(numerator + 1, den)),
      "0",
      "1/2",
      "1",
    ].filter(
      (value, choiceIndex, values) =>
        value !== `${num}/${den}` && values.indexOf(value) === choiceIndex,
    );
    const c = choicesWithAnswer(`${num}/${den}`, probabilityChoices, index);
    return {
      stem: `${probabilityScenarios[index]} 과정에서 독립적인 두 번의 시도 중 한 번 이상 성공할 확률은?`,
      passage: `각 시도의 실패 확률은 1/${failDen}이며, 두 시도의 결과는 서로 독립이다.`,
      ...c,
      explanation: `두 번 모두 실패할 확률은 1/${failDen}×1/${failDen}=1/${den}이므로 여사건의 확률은 ${num}/${den}입니다.`,
    };
  }
  if (kindId === "math-probability-conditional") {
    const maximum = 8 + index * 2,
      threshold = Math.floor(maximum / 2),
      sample = maximum / 2,
      favorable = Array.from({ length: maximum }, (_, i) => i + 1).filter(
        (v) => v % 2 === 0 && v > threshold,
      ).length,
      correct = fractionText(favorable, sample);
    const probabilityChoices = Array.from({ length: sample + 1 }, (_, numerator) =>
      numerator === 0 ? "0" : numerator === sample ? "1" : fractionText(numerator, sample),
    ).filter((value) => value !== correct);
    const c = choicesWithAnswer(correct, probabilityChoices, index);
    return {
      stem: `1부터 ${maximum}까지의 정수 중 하나를 같은 확률로 고른다. 고른 수가 짝수일 때 ${threshold}보다 클 확률은?`,
      passage: "이미 짝수를 골랐다는 조건 안에서 표본공간을 다시 정한다.",
      ...c,
      explanation: `짝수는 ${sample}개이고 그중 ${threshold}보다 큰 짝수는 ${favorable}개이므로 조건부 확률은 ${correct}입니다.`,
    };
  }
  if (kindId === "math-distance-same") {
    const speed1 = 40 + index * 5,
      time1 = 2 + (index % 3),
      distance = speed1 * time1,
      speed2 = speed1 + 20,
      answer = distance / speed2;
    const rounded = Math.round(answer * 100) / 100,
      c = numberChoices(rounded, 0.25, index, "시간");
    return {
      stem: "같은 거리를 더 빠른 속력으로 이동할 때 걸리는 시간은?",
      passage: `시속 ${speed1}km로 ${time1}시간 이동한 거리를 시속 ${speed2}km로 이동한다.`,
      ...c,
      explanation: `거리는 ${distance}km이고 ${distance}÷${speed2}=${rounded}시간입니다.`,
    };
  }
  if (kindId === "math-distance-train") {
    const train = 150 + index * 5,
      tunnel = 250 + index * 5,
      speed = 20,
      answer = (train + tunnel) / speed,
      c = numberChoices(answer, 2, index, "초");
    return {
      stem: "기차가 터널을 완전히 통과하는 데 걸리는 시간은?",
      passage: `길이 ${train}m인 기차가 길이 ${tunnel}m인 터널을 초속 ${speed}m로 달린다.`,
      ...c,
      explanation: `완전 통과 거리는 ${train}+${tunnel}=${train + tunnel}m이므로 ${answer}초입니다.`,
    };
  }
  if (kindId === "math-distance-relative") {
    const a = 50 + index * 2,
      b = 60 + index * 3,
      distance = a + b,
      answer = 1,
      c = numberChoices(answer, 0.25, index, "시간");
    return {
      stem: "서로 마주 오는 두 차량이 만날 때까지 걸리는 시간은?",
      passage: `두 차량 사이 거리는 ${distance}km이고 속력은 각각 시속 ${a}km와 ${b}km이다.`,
      ...c,
      explanation: `상대속력은 ${a + b}km/h이므로 ${distance}÷${a + b}=1시간입니다.`,
    };
  }
  if (kindId === "math-work-single") {
    const days = 5 + (index % 8),
      c = choicesWithAnswer(
        `1/${days}`,
        [`1/${days - 2}`, `1/${days - 1}`, `1/${days + 1}`, `1/${days + 2}`],
        index,
      );
    return {
      stem: `${workScenario}에서 A의 하루 작업량은 전체의 얼마인가?`,
      passage: `A가 혼자 일정한 속도로 일하면 ${workScenario} 작업 전체를 ${days}일 만에 끝낸다. 전체 작업량은 1이다.`,
      ...c,
      explanation: `전체 작업량 1을 ${days}일로 나누면 하루 작업량은 1/${days}입니다.`,
    };
  }
  if (kindId === "math-work-together") {
    const a = 6 + (index % 3) * 3,
      b = a * 2,
      answer = 1 / (1 / a + 1 / b),
      c = numberChoices(answer, 1, index, "일");
    return {
      stem: `${workScenario} 작업을 A와 B가 함께 하면 며칠이 걸리는가?`,
      passage: `A는 혼자 ${a}일, B는 혼자 ${b}일 만에 ${workScenario} 작업을 끝낸다.`,
      ...c,
      explanation: `하루 작업량은 1/${a}+1/${b}=1/${answer}이므로 ${answer}일입니다.`,
    };
  }
  if (kindId === "math-work-partial") {
    const totalDays = 6 + (index % 4) * 2,
      worked = 2,
      numerator = totalDays - worked,
      denominator = totalDays * 2,
      rate = fractionText(numerator, denominator);
    const c = choicesWithAnswer(
      rate,
      [
        `1/${totalDays}`,
        fractionText(numerator, totalDays),
        fractionText(numerator - 1, denominator),
        "1/2",
      ],
      index,
    );
    return {
      stem: `${workScenario}에서 B의 하루 작업량은 전체의 얼마인가?`,
      passage: `A는 혼자 ${totalDays}일 만에 ${workScenario} 작업을 끝낸다. A가 ${worked}일 일한 뒤 남은 작업을 B가 2일 동안 완료했다. 전체 작업량은 1이다.`,
      ...c,
      explanation: `A가 2/${totalDays}을 끝낸 뒤 남은 ${numerator}/${totalDays}을 B가 2일에 처리하므로 B의 하루 작업량은 ${rate}입니다.`,
    };
  }
  if (kindId === "math-work-capacity") {
    const unit = 8 + index,
      bRatio = 2,
      total = unit * (1 + bRatio),
      c = numberChoices(unit, 2, index, "개");
    return {
      stem: "A의 하루 생산량은?",
      passage: `B는 A의 ${bRatio}배를 생산하고 두 사람이 하루에 합계 ${total}개를 생산한다.`,
      ...c,
      explanation: `A의 생산량을 x라 하면 x+${bRatio}x=${total}이므로 x=${unit}개입니다.`,
    };
  }
  if (kindId === "math-age") {
    const child = 10 + index,
      years = 5,
      ratio = 3,
      parent = ratio * (child + years) - years;
    const c = numberChoices(child, 1, index, "세");
    return {
      stem: "자녀의 현재 나이는?",
      passage: `현재 부모와 자녀의 나이 합은 ${parent + child}세이다. ${years}년 후 부모의 나이는 자녀의 나이의 ${ratio}배이다.`,
      ...c,
      explanation: `자녀를 x로 두면 부모는 ${parent + child}-x이고 ${years}년 후 관계식을 풀어 x=${child}세를 얻습니다.`,
    };
  }
  const chairs = 12 + index * 4,
    people = chairs * 3 + 4,
    left = chairs - people / 4;
  const c = numberChoices(chairs, 1, index, "개");
  return {
    stem: "의자는 모두 몇 개인가?",
    passage: `한 의자에 3명씩 앉으면 4명이 서고, 한 의자에 4명씩 앉으면 빈 의자가 ${left}개 남는다.`,
    ...c,
    explanation: `의자 수를 x라 하면 전체 인원은 3x+4이고 4(x-${left})와 같으므로 x=${chairs}개입니다.`,
  };
}

const conceptSets = [
  ["품질 분석가", "데이터 검토자", "근거 중심 판단자"],
  ["설비 관리자", "안전 교육 이수자", "위험 대응자"],
  ["서비스 기획자", "고객 조사자", "문제 발견자"],
  ["공정 기술자", "표준 준수자", "기록 작성자"],
  ["물류 담당자", "경로 분석자", "시간 절약자"],
  ["교육 담당자", "학습 분석자", "과정 개선자"],
  ["보안 담당자", "접근 기록 검토자", "위험 차단자"],
  ["재고 관리자", "수요 예측자", "발주 조정자"],
  ["환경 조사원", "표본 수집자", "오염 분석자"],
  ["예산 담당자", "지출 검토자", "비용 절감자"],
  ["상담 관리자", "문의 분류자", "응답 개선자"],
  ["배송 기획자", "주문 분석자", "경로 조정자"],
  ["시설 운영자", "이용량 조사자", "혼잡 개선자"],
  ["생산 관리자", "불량 기록자", "공정 개선자"],
  ["채용 담당자", "지원서 검토자", "면접 평가자"],
  ["연구 책임자", "실험 설계자", "결과 검증자"],
  ["회의 진행자", "안건 정리자", "결정 기록자"],
  ["교통 분석가", "승차량 조사자", "배차 조정자"],
  ["에너지 관리자", "사용량 측정자", "효율 개선자"],
  ["문서 관리자", "검색 기록 분석자", "분류 체계 개선자"],
] as const;

const logicNamePool = [
  "가온",
  "나래",
  "다온",
  "라온",
  "마루",
  "민수",
  "서윤",
  "지호",
  "하린",
  "도윤",
  "유진",
  "시우",
  "예린",
  "준호",
  "소연",
  "현우",
  "지민",
  "태윤",
  "수아",
  "건우",
  "다현",
  "우진",
  "채원",
  "선우",
] as const;

function logicQuestion(kindId: string, index: number): Draft {
  const [baseA, baseB, baseC] = conceptSets[index % conceptSets.length];
  const a = baseA,
    b = baseB,
    c = baseC;
  const condition = (lines: string[]) => lines.map((x, i) => `㉠㉡㉢㉣㉤`[i] + ` ${x}`).join("\n");
  if (kindId === "logic-conclusion-blank") {
    const correct = `모든 ${a}는 ${c}이다`,
      x = choicesWithAnswer(
        correct,
        [
          `모든 ${c}는 ${a}이다`,
          `어떤 ${a}도 ${c}가 아니다`,
          `모든 ${b}는 ${a}이다`,
          `어떤 ${c}는 ${b}가 아니다`,
        ],
        index,
      );
    return {
      stem: "다음 전제가 모두 참일 때 반드시 참인 결론은?",
      passage: `모든 ${a}는 ${b}이다.\n모든 ${b}는 ${c}이다.`,
      ...x,
      explanation: `${a}가 ${b}에 포함되고 ${b}가 ${c}에 포함되므로 모든 ${a}는 ${c}입니다.`,
    };
  }
  if (kindId === "logic-premise-small") {
    const correct = `모든 ${a}는 ${b}이다`,
      x = choicesWithAnswer(
        correct,
        [
          `모든 ${b}는 ${a}이다`,
          `어떤 ${a}는 ${b}가 아니다`,
          `모든 ${c}는 ${a}이다`,
          `어떤 ${b}는 ${c}이다`,
        ],
        index,
      );
    return {
      stem: "결론이 반드시 성립하도록 빈칸에 들어갈 전제로 적절한 것은?",
      passage: `빈칸\n모든 ${b}는 ${c}이다.\n결론: 모든 ${a}는 ${c}이다.`,
      ...x,
      explanation: `작은 집합인 ${a}에서 ${b}로 이어지는 전제가 있어야 기존 전제와 연결됩니다.`,
    };
  }
  if (kindId === "logic-premise-large") {
    const correct = `모든 ${b}는 ${c}이다`,
      x = choicesWithAnswer(
        correct,
        [
          `모든 ${c}는 ${b}이다`,
          `어떤 ${b}는 ${c}가 아니다`,
          `모든 ${a}는 ${c}이다`,
          `어떤 ${c}는 ${a}이다`,
        ],
        index,
      );
    return {
      stem: "결론이 반드시 성립하도록 빈칸에 들어갈 전제로 적절한 것은?",
      passage: `모든 ${a}는 ${b}이다.\n빈칸\n결론: 모든 ${a}는 ${c}이다.`,
      ...x,
      explanation: `도착 집합 ${c}로 이어지려면 모든 ${b}가 ${c}라는 전제가 필요합니다.`,
    };
  }
  if (kindId === "logic-chain") {
    const start = index % 2 ? "P" : "Q";
    const [service, evidence, , action, result] = subjects[index];
    const propositions = {
      P: `${topic(service)} 운영 개선 대상이다`,
      Q: `${object(evidence)} 조사한다`,
      R: `${action}한다`,
      S: result,
      T: "추가 조사를 중단한다",
    };
    const correct = propositions.S,
      x = choicesWithAnswer(
        correct,
        ["R은 거짓이다", "Q는 거짓이다", propositions.T, "P는 거짓이다"],
        index,
      );
    return {
      stem: "다음 명제가 모두 참일 때 반드시 참인 것은?",
      passage: `P: ${propositions.P}.\nQ: ${propositions.Q}.\nR: ${propositions.R}.\nS: ${propositions.S}.\nT: ${propositions.T}.\nP이면 Q이다.\nQ이면 R이다.\nR이면 S이다.\n${start}이다.\nS가 아니면 T이다.`,
      ...x,
      explanation: `확정된 ${start}에서 화살표 방향으로 연결하면 R을 거쳐 S인 ‘${correct}’가 반드시 참입니다.`,
    };
  }
  if (kindId === "logic-some-amo") {
    const correct = `어떤 ${a}는 ${c}이다`,
      x = choicesWithAnswer(
        correct,
        [
          `모든 ${a}는 ${c}이다`,
          `어떤 ${c}도 ${a}가 아니다`,
          `모든 ${c}는 ${b}이다`,
          `어떤 ${a}는 ${b}가 아니다`,
        ],
        index,
      );
    return {
      stem: "다음 전제가 모두 참일 때 반드시 참인 것은?",
      passage: `어떤 ${a}는 ${b}이다.\n모든 ${b}는 ${c}이다.`,
      ...x,
      explanation: `실제로 존재하는 ${a} 중 ${b}인 대상은 모든 ${b}가 ${c}라는 전제에 따라 ${c}이기도 합니다.`,
    };
  }
  if (kindId === "logic-some-mmo") {
    const correct = `어떤 ${a}는 ${c}이다`,
      x = choicesWithAnswer(
        correct,
        [
          `모든 ${c}는 ${a}이다`,
          `어떤 ${a}도 ${c}가 아니다`,
          `어떤 ${b}는 ${a}가 아니다`,
          `모든 ${a}는 ${b}가 아니다`,
        ],
        index,
      );
    return {
      stem: "다음 전제가 모두 참일 때 반드시 참인 것은?",
      passage: `모든 ${a}는 ${b}이다.\n모든 ${b}는 ${c}이다.\n어떤 ${a}가 존재한다.`,
      ...x,
      explanation: `존재하는 ${a}는 ${b}를 거쳐 ${c}에도 포함되므로 어떤 ${a}는 ${c}입니다.`,
    };
  }
  const names = Array.from(
    { length: 5 },
    (_, offset) => logicNamePool[(index + offset) % logicNamePool.length],
  );
  if (kindId === "logic-linear") {
    const order = [...names];
    const target = order[2];
    const p = condition([
      `${topic(order[0])} ${order[1]}보다 앞선다.`,
      `${topic(order[1])} ${order[2]}의 바로 앞이다.`,
      `${topic(order[3])} ${order[2]}보다 뒤선다.`,
      `${topic(order[4])} ${order[3]}보다 뒤선다.`,
    ]);
    const x = choicesWithAnswer(
      target,
      order.filter((v) => v !== target),
      index,
    );
    return {
      stem: "다음 조건을 만족할 때 반드시 세 번째에 서는 사람은?",
      passage: p,
      passageLabel: "조건",
      ...x,
      explanation: `${order[0]}, ${order[1]}, ${order[2]}이 앞의 세 자리를 이루고 뒤의 두 자리에는 ${order[3]}, ${order[4]}가 오므로 세 번째는 ${target}입니다.`,
    };
  }
  if (kindId === "logic-item") {
    const target = names[2];
    const p = condition([
      `${topic(names[0])} 월요일이다.`,
      `${topic(names[1])} ${names[2]}의 바로 전날이다.`,
      `${topic(names[2])} 목요일과 금요일이 아니다.`,
      `${topic(names[3])} 목요일이다.`,
      `${topic(names[4])} 금요일이다.`,
    ]);
    const x = choicesWithAnswer(
      target,
      names.filter((v) => v !== target),
      index,
    );
    return {
      stem: "다음 조건을 만족할 때 수요일에 배정되는 사람은?",
      passage: p,
      passageLabel: "조건",
      ...x,
      explanation: `월요일, 목요일, 금요일이 고정되고 ${subject(names[1])} ${names[2]}의 바로 전날이므로 화요일과 수요일에 차례로 배치되어 수요일은 ${target}입니다.`,
    };
  }
  if (kindId === "logic-number") {
    const target = 3,
      p = condition([
        `${topic(names[0])} 1을 받는다.`,
        `${topic(names[4])} 5를 받는다.`,
        `${topic(names[2])} ${names[1]}보다 큰 수를 받는다.`,
        `${withAnd(names[1])} ${subject(names[2])} 받은 수의 합은 7이다.`,
        `${topic(names[3])} 2를 받는다.`,
      ]);
    const x = choicesWithAnswer(String(target), ["1", "2", "4", "5"], index);
    return {
      stem: `다음 조건을 만족할 때 ${names[1]}이 받는 수는?`,
      passage: p,
      passageLabel: "조건",
      ...x,
      explanation: `1, 2, 5가 사용됐고 남은 3과 4의 합은 7이며 ${names[2]}가 더 크므로 ${names[1]}은 3입니다.`,
    };
  }
  const liar = names[1],
    p = `${names[0]}: ${subject(liar)} 거짓말한다.\n${liar}: ${subject(names[2])} 거짓말한다.\n${names[2]}: ${subject(names[3])} 참말한다.\n${names[3]}: ${subject(liar)} 거짓말한다.`;
  const x = choicesWithAnswer(liar, [names[0], names[2], names[3], "알 수 없다"], index);
  return {
    stem: "네 사람 중 한 명만 거짓말할 때 거짓말하는 사람은?",
    passage: p,
    ...x,
    explanation: `첫째와 넷째 사람의 같은 진술이 참이면 ${liar}가 유일한 거짓말쟁이가 되고 나머지 진술도 모순 없이 성립합니다.`,
  };
}

function sequenceVisual(index: number, values: string[]): ProblemVisual {
  return {
    type: "sequence",
    id: `seq-${index}`,
    title: "<보기>",
    items: values.map((value, i) => ({ id: `seq-${index}-${i}`, value })),
  };
}

function sequenceQuestion(kindId: string, index: number): Draft {
  const start = 2 + index;
  if (kindId === "sequence-arithmetic") {
    const gap = 3 + (index % 6),
      vals = Array.from({ length: 5 }, (_, i) => start + i * gap),
      answer = vals[4] + gap,
      c = numberChoices(answer, 1, index);
    return {
      stem: "다음 <보기>의 수들이 일정한 규칙을 따를 때 빈칸에 들어갈 수는?",
      passage: "",
      visuals: [sequenceVisual(index, [...vals.map(String), "(   )"])],
      ...c,
      explanation: `각 항에 ${gap}씩 더하므로 ${vals[4]}+${gap}=${answer}입니다.`,
    };
  }
  if (kindId === "sequence-geometric") {
    const ratio = 2 + (index % 2),
      vals = Array.from({ length: 5 }, (_, i) => start * ratio ** i),
      answer = vals[4] * ratio,
      c = numberChoices(answer, ratio, index);
    return {
      stem: "다음 <보기>의 수들이 일정한 규칙을 따를 때 빈칸에 들어갈 수는?",
      passage: "",
      visuals: [sequenceVisual(index, [...vals.map(String), "(   )"])],
      ...c,
      explanation: `앞 항에 ${ratio}를 곱하므로 다음 수는 ${answer}입니다.`,
    };
  }
  if (kindId === "sequence-difference") {
    const vals = [start];
    let diff = 3;
    for (let i = 1; i < 6; i++) {
      vals.push(vals[i - 1] + diff);
      diff += 2;
    }
    const a = vals[3],
      b = vals[5],
      answer = a + b,
      c = numberChoices(answer, 2, index);
    return {
      stem: "다음 <보기>의 수들이 일정한 규칙을 따를 때 A+B의 값은?",
      passage: "",
      visuals: [
        sequenceVisual(index, [
          String(vals[0]),
          String(vals[1]),
          String(vals[2]),
          "( A )",
          String(vals[4]),
          "( B )",
        ]),
      ],
      ...c,
      explanation: `항의 차이가 3, 5, 7, 9, 11로 커지므로 A=${a}, B=${b}, A+B=${answer}입니다.`,
    };
  }
  if (kindId === "sequence-power") {
    const offset = index + 1,
      vals = Array.from({ length: 5 }, (_, i) => (i + 2) ** 2 + offset),
      answer = 7 ** 2 + offset,
      c = numberChoices(answer, 2, index);
    return {
      stem: "다음 <보기>의 수들이 일정한 규칙을 따를 때 빈칸에 들어갈 수는?",
      passage: "",
      visuals: [sequenceVisual(index, [...vals.map(String), "(   )"])],
      ...c,
      explanation: `각 항은 2²부터 이어지는 제곱수에 ${offset}을 더한 값이므로 다음 수는 ${answer}입니다.`,
    };
  }
  if (kindId === "sequence-factorial") {
    const scale = index + 1,
      vals = [1, 2, 6, 24].map((v) => v * scale),
      answer = 120 * scale,
      c = numberChoices(answer, scale * 6, index);
    return {
      stem: "다음 <보기>의 수들이 일정한 규칙을 따를 때 빈칸에 들어갈 수는?",
      passage: "",
      visuals: [sequenceVisual(index, [...vals.map(String), "(   )"])],
      ...c,
      explanation: `곱하는 수가 2, 3, 4, 5로 커지므로 ${vals[3]}×5=${answer}입니다.`,
    };
  }
  if (kindId === "sequence-fibonacci") {
    const a = 1 + index,
      b = 2 + index,
      vals = [a, b];
    for (let i = 2; i < 5; i++) vals.push(vals[i - 1] + vals[i - 2]);
    const answer = vals[3] + vals[4],
      c = numberChoices(answer, 1, index);
    return {
      stem: "다음 <보기>의 수들이 일정한 규칙을 따를 때 빈칸에 들어갈 수는?",
      passage: "",
      visuals: [sequenceVisual(index, [...vals.map(String), "(   )"])],
      ...c,
      explanation: `세 번째 항부터 앞의 두 항을 더하므로 ${vals[3]}+${vals[4]}=${answer}입니다.`,
    };
  }
  if (kindId === "sequence-mixed") {
    const add = 1 + (index % 5),
      vals = [start];
    for (let i = 1; i < 5; i++) vals.push(vals[i - 1] * 2 + add);
    const answer = vals[4] * 2 + add,
      c = numberChoices(answer, 2, index);
    return {
      stem: "다음 <보기>의 수들이 일정한 규칙을 따를 때 빈칸에 들어갈 수는?",
      passage: "",
      visuals: [sequenceVisual(index, [...vals.map(String), "(   )"])],
      ...c,
      explanation: `각 항에 2를 곱하고 ${add}을 더하므로 다음 수는 ${answer}입니다.`,
    };
  }
  if (kindId === "sequence-fraction") {
    const offset = index + 1,
      a = offset + 4,
      b = offset + 5,
      nextA = offset + 5,
      nextB = offset + 6;
    const correct = `${a * nextB}/${b * nextA}`,
      c = choicesWithAnswer(
        correct,
        [
          `${a}/${b}`,
          `${nextA}/${nextB}`,
          `${a * nextA}/${b * nextB}`,
          `${b * nextA}/${a * nextB}`,
        ],
        index,
      );
    return {
      stem: "다음 <보기>의 규칙에서 A/B의 값은?",
      passage: "",
      visuals: [
        sequenceVisual(index, [
          `${offset}/${offset + 1}`,
          `${offset + 1}/${offset + 2}`,
          `${offset + 2}/${offset + 3}`,
          `${offset + 3}/${offset + 4}`,
          `( A )`,
          `( B )`,
        ]),
      ],
      ...c,
      explanation: `A=${a}/${b}, B=${nextA}/${nextB}이므로 A/B=(${a}/${b})÷(${nextA}/${nextB})=${correct}입니다.`,
    };
  }
  const first = (index + 1) / 10,
    vals = Array.from({ length: 5 }, (_, i) => first * 3 ** i),
    answer = vals[4] * 3,
    shown = vals.map(roundedDecimal),
    correct = roundedDecimal(answer),
    c = choicesWithAnswer(
      correct,
      [answer / 3, answer - 1, answer + 1, answer * 2].map(roundedDecimal),
      index,
    );
  return {
    stem: "다음 <보기>의 수들이 일정한 규칙을 따를 때 빈칸에 들어갈 수는?",
    passage: "",
    visuals: [sequenceVisual(index, [...shown, "(   )"])],
    ...c,
    explanation: `앞 항에 3을 곱하므로 ${shown[4]}×3=${correct}입니다.`,
  };
}

function createDraft(kind: ProblemKind, index: number): Draft {
  if (kind.id.startsWith("verbal-")) return verbalQuestion(kind.id, index);
  if (kind.id.startsWith("data-")) return dataQuestion(kind.id, index);
  if (kind.id.startsWith("math-")) return mathQuestion(kind.id, index);
  if (kind.id.startsWith("logic-")) return logicQuestion(kind.id, index);
  return sequenceQuestion(kind.id, index);
}

export const EXAMPLE_QUESTION_BANK: ExampleQuestion[] = CATEGORIES.flatMap((category) =>
  category.subtypes.flatMap((subtype) =>
    subtype.kinds.flatMap((kind) =>
      Array.from({ length: 20 }, (_, index) => {
        const draft = createDraft(kind, index);
        return {
          ...draft,
          id: `example-${kind.id}-${index + 1}`,
          categoryId: category.id,
          kindId: kind.id,
          typeLabel: `${category.name} / ${kind.name}`,
        } satisfies ExampleQuestion;
      }),
    ),
  ),
);

export function questionsForKind(kindId: string) {
  return EXAMPLE_QUESTION_BANK.filter((question) => question.kindId === kindId);
}
export function questionsForCategory(categoryId: string) {
  return EXAMPLE_QUESTION_BANK.filter((question) => question.categoryId === categoryId);
}
export { markers as exampleChoiceMarkers };
