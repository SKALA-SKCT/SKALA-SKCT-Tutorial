import type { ProblemVisual } from "../types";
import { CATEGORIES, type ExampleQuestion, type ProblemKind } from "./catalog";

type Draft = Omit<ExampleQuestion, "id" | "categoryId" | "kindId" | "typeLabel">;

const markers = ["①", "②", "③", "④", "⑤"];
const comma = (value: number) => value.toLocaleString("ko-KR");
const roundedDecimal = (value: number) => String(Math.round(value * 10000) / 10000);
const finalCode = (text: string) => {
  const code = text.charCodeAt(text.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 ? code % 28 : -1;
};
const hasBatchim = (text: string) => finalCode(text) > 0;
const topic = (text: string) => `${text}${hasBatchim(text) ? "은" : "는"}`;
const subject = (text: string) => `${text}${hasBatchim(text) ? "이" : "가"}`;
const object = (text: string) => `${text}${hasBatchim(text) ? "을" : "를"}`;
const withAnd = (text: string) => `${text}${hasBatchim(text) ? "과" : "와"}`;
/** 받침이 없거나 ㄹ 받침이면 "로", 그 외에는 "으로". */
const withRo = (text: string) => {
  const code = finalCode(text);
  return `${text}${code === 0 || code === 8 || code === -1 ? "로" : "으로"}`;
};
/** 숫자를 한국어로 읽었을 때의 끝소리. 0=받침 없음, 1=ㄹ 받침, 2=그 밖의 받침 */
const numberFinal = (value: number) => {
  const last = Math.abs(Math.round(value)) % 10;
  if (last !== 0) return [0, 1, 0, 2, 0, 0, 2, 1, 1, 0][last];
  const absolute = Math.abs(Math.round(value));
  if (absolute === 0) return 0;
  if (absolute % 100 !== 0) return 2; // 십
  if (absolute % 1000 !== 0) return 2; // 백
  return 0; // 천, 만
};
/** "30이었고" / "32였고" 처럼 숫자 뒤 서술격 조사를 맞춘다. */
const numberWas = (value: number) => `${comma(value)}${numberFinal(value) === 0 ? "였" : "이었"}`;
/** "25로" / "33으로" 처럼 숫자 뒤 부사격 조사를 맞춘다. */
const numberTo = (value: number) => `${comma(value)}${numberFinal(value) === 2 ? "으로" : "로"}`;
const numberSubject = (value: number) => `${comma(value)}${numberFinal(value) === 0 ? "가" : "이"}`;
const numberObject = (value: number) => `${comma(value)}${numberFinal(value) === 0 ? "를" : "을"}`;
const numberAnd = (value: number) => `${comma(value)}${numberFinal(value) === 0 ? "와" : "과"}`;

/**
 * 세부 유형마다 정답 위치 20개를 미리 섞어 둔다.
 * 정답 번호가 문항 순서와 무관해지고, 다섯 위치에 정확히 4번씩 배분된다.
 */
const slotPlanCache = new Map<string, number[]>();
const slotPlan = (kindId: string) => {
  const cached = slotPlanCache.get(kindId);
  if (cached) return cached;
  const slots = Array.from({ length: 20 }, (_, i) => i % 5);
  let seed = [...kindId].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 7);
  for (let i = slots.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const j = seed % (i + 1);
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  slotPlanCache.set(kindId, slots);
  return slots;
};
let activeSlots = slotPlan("default");
const slotFor = (index: number) => activeSlots[index % activeSlots.length];

function choicesWithAnswer(correct: string, wrong: string[], index: number) {
  const answer = slotFor(index);
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

/**
 * 수치형 선지는 실제 시험처럼 오름차순으로 배열하고,
 * 정답이 놓일 순위만 유형별 배치 계획에서 가져온다.
 */
function numberChoices(value: number, gap: number, index: number, suffix = "") {
  const answer = slotFor(index);
  const room = answer > 0 ? (value * 0.9) / answer : gap;
  const step = Number.isInteger(gap)
    ? Math.max(1, Math.min(gap, Math.floor(room)))
    : Math.min(gap, room);
  const offsets = [
    ...Array.from({ length: answer }, (_, i) => i - answer),
    0,
    ...Array.from({ length: 4 - answer }, (_, i) => i + 1),
  ];
  return { choices: offsets.map((o) => `${comma(value + step * o)}${suffix}`), answer };
}

/**
 * 값이 있는 선지를 오름차순으로 배열하되, 정답보다 작은 오답을 몇 개 둘지를
 * 배치 계획에서 가져와 정답의 순위가 한 자리에 고정되지 않게 한다.
 */
interface ValueChoice {
  value: number;
  text: string;
}
function rankedChoices(correct: ValueChoice, pool: ValueChoice[], index: number) {
  const slot = slotFor(index);
  const seen = new Set([correct.text]);
  const unique = pool.filter((item) => {
    if (seen.has(item.text) || Math.abs(item.value - correct.value) < 1e-9) return false;
    seen.add(item.text);
    return true;
  });
  const below = unique
    .filter((item) => item.value < correct.value)
    .sort((a, b) => b.value - a.value);
  const above = unique
    .filter((item) => item.value > correct.value)
    .sort((a, b) => a.value - b.value);
  const take = Math.max(Math.min(slot, below.length), 4 - above.length);
  const picked = [...below.slice(0, take), ...above.slice(0, 4 - take), correct].sort(
    (a, b) => a.value - b.value,
  );
  return { choices: picked.map((item) => item.text), answer: picked.indexOf(correct) };
}

const numericValue = (choice: string) => {
  const match = choice
    .replaceAll(",", "")
    .match(/^(-?\d+(?:\.\d+)?)(?:\/(-?\d+(?:\.\d+)?))?(?:%|시간|일|초|분|명|개|건|g|세|가지|원)?$/);
  return match ? Number(match[1]) / (match[2] ? Number(match[2]) : 1) : null;
};

/** 값으로 비교할 수 있는 선지는 오름차순으로 정렬한다. */
function sortNumericChoices(draft: Draft): Draft {
  const values = draft.choices.map(numericValue);
  if (values.some((value) => value === null)) return draft;
  const correct = draft.choices[draft.answer];
  const choices = draft.choices
    .map((choice, i) => ({ choice, value: values[i] as number }))
    .sort((a, b) => a.value - b.value)
    .map((item) => item.choice);
  return { ...draft, choices, answer: choices.indexOf(correct) };
}

const subjects = [
  [
    "공공 체육시설",
    "시간대별 이용량",
    "시설 수",
    "혼잡 시간에 운영 인력을 재배치",
    "대기 시간이 줄었다",
    "같은 기간에 인근 공사가 끝나 시설로 들어오는 동선이 원활해졌다",
  ],
  [
    "지역 도서관",
    "좌석별 체류 시간",
    "보유 도서 수",
    "학습 공간과 협업 공간을 분리",
    "소음 민원이 감소했다",
    "같은 기간에 시험 기간이 끝나 저녁 이용자 수가 크게 줄었다",
  ],
  [
    "공유 우산 서비스",
    "대여소별 반납률",
    "대여소 수",
    "날씨와 이동 경로에 맞춰 우산을 재배치",
    "품절 시간이 짧아졌다",
    "같은 기간에 강수일이 크게 줄어 우산 대여 수요가 감소했다",
  ],
  [
    "산업 안전 교육",
    "공정별 사고 기록",
    "교육 횟수",
    "위험 공정에 실습 시간을 집중",
    "초기 대응 속도가 빨라졌다",
    "같은 기간에 공장 비상 알림 시스템이 새 장비로 교체됐다",
  ],
  [
    "학교 급식",
    "메뉴별 잔반량",
    "메뉴 가짓수",
    "잔반 원인을 반영해 배식량을 조절",
    "식재료 폐기가 감소했다",
    "같은 기간에 급식 이용 학생 수가 크게 감소했다",
  ],
  [
    "도심 배송",
    "권역별 주문 밀도",
    "배송 차량 수",
    "주문 밀도에 따라 출발 거점을 조정",
    "평균 배송 시간이 줄었다",
    "같은 기간에 전체 주문량이 크게 감소했다",
  ],
  [
    "하천 산책로",
    "구간별 보행량",
    "벤치 수",
    "이용 시간과 그늘 위치에 맞춰 휴식 시설을 이동",
    "낮 시간 이용률이 높아졌다",
    "같은 기간에 산책로 진입로를 막던 공사가 끝났다",
  ],
  [
    "고객 상담",
    "문의 유형별 처리 시간",
    "상담 인원",
    "반복 문의를 자동 분류하고 복합 문의를 전담 배정",
    "첫 답변 시간이 짧아졌다",
    "같은 기간에 전체 고객 문의 건수가 크게 감소했다",
  ],
  [
    "사내 회의",
    "안건별 결정 지연 원인",
    "회의 횟수",
    "결정 담당자와 기한을 회의 전에 지정",
    "미완료 안건이 감소했다",
    "같은 기간에 회의당 안건 수가 절반으로 줄었다",
  ],
  [
    "전기차 충전소",
    "시간대별 충전 수요",
    "충전기 수",
    "회전율이 낮은 지점의 장비를 수요 지점으로 이전",
    "대기 차량이 줄었다",
    "같은 기간에 해당 권역의 전기차 충전 수요가 크게 감소했다",
  ],
  [
    "박물관 안내",
    "전시실별 체류 경로",
    "안내판 수",
    "갈림길 중심으로 안내 정보를 재배치",
    "길 찾기 문의가 감소했다",
    "같은 기간에 박물관 전체 방문객 수가 크게 감소했다",
  ],
  [
    "재활용 수거",
    "요일별 배출량",
    "수거함 수",
    "배출량에 따라 수거 주기를 다르게 적용",
    "넘침 신고가 줄었다",
    "같은 기간에 재활용품 총배출량이 크게 감소했다",
  ],
  [
    "원격 진료 예약",
    "진료과별 취소 시간",
    "예약 가능 인원",
    "취소 가능성이 높은 시간에 대기 명단을 연동",
    "빈 진료 시간이 감소했다",
    "같은 기간에 전체 진료 예약 수요가 크게 증가했다",
  ],
  [
    "공장 설비 점검",
    "장비별 고장 전조",
    "정기 점검 횟수",
    "전조가 나타난 장비를 우선 점검",
    "갑작스러운 정지가 줄었다",
    "같은 기간에 고장이 잦던 노후 장비가 새 장비로 교체됐다",
  ],
  [
    "문화 강좌",
    "과정별 중도 이탈 시점",
    "개설 과정 수",
    "이탈이 많은 차시에 보충 활동을 배치",
    "수료율이 높아졌다",
    "같은 기간에 교육 수료자에게 인사 평가 가점을 주는 제도가 도입됐다",
  ],
  [
    "농산물 보관",
    "품목별 온도 변화",
    "창고 면적",
    "품목별 적정 온도로 보관 구역을 분리",
    "폐기 비율이 감소했다",
    "같은 기간에 입고 농산물의 초기 품질 기준이 강화됐다",
  ],
  [
    "통근 버스",
    "정류장별 승차 인원",
    "운행 횟수",
    "혼잡 노선의 정차 순서와 배차를 조정",
    "정시 도착률이 높아졌다",
    "같은 기간에 노선 주변의 장기 도로 공사가 끝났다",
  ],
  [
    "온라인 교육",
    "차시별 재생 중단 구간",
    "영상 길이",
    "중단이 많은 구간에 짧은 확인 문제를 배치",
    "완강률이 높아졌다",
    "같은 기간에 교육 이수자에게 자격 수당을 지급하기 시작했다",
  ],
  [
    "보행 신호",
    "교차로별 대기 인원",
    "신호등 수",
    "시간대별 보행량에 따라 신호 시간을 조절",
    "무단 횡단이 줄었다",
    "같은 기간에 해당 교차로의 무단 횡단 단속이 강화됐다",
  ],
  [
    "사내 문서 검색",
    "검색어별 실패 기록",
    "문서 수",
    "동의어와 최신 문서 가중치를 검색에 반영",
    "재검색 횟수가 감소했다",
    "같은 기간에 전 직원을 대상으로 문서 검색 교육을 실시했다",
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
  const [subject, evidence, oldMetric, action, result, alternativeCause] = subjects[index];
  const before = 30 + index;
  const after = before - (5 + (index % 4));
  const passage = `${subject} 운영자는 초기 성과를 ${withRo(oldMetric)}만 판단했다. 그러나 이용자가 체감하는 불편은 수량이 늘어난 뒤에도 계속됐다. 운영자는 ${object(evidence)} 조사해 불편이 특정 조건에 집중된다는 사실을 확인했다. 이에 ${action}했다. 조정 전 평균 불편 지수는 ${numberWas(before)}고 조정 후에는 ${numberTo(after)} 낮아졌다. 이 사례는 투입 규모보다 이용 과정에서 얻은 근거를 운영 결정에 반영하는 일이 중요함을 보여준다.`;
  return { subject, evidence, oldMetric, action, result, alternativeCause, before, after, passage };
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
      explanation: `글은 ${object(s.evidence)} 근거로 운영 방식을 바꾸고 불편을 줄인 과정을 설명하므로 ${subject(correct)} 중심 내용입니다.`,
    };
  }
  if (kindId === "verbal-blank-single") {
    const passage = `${s.passage.split(". ").slice(0, 5).join(". ")}. 따라서 효과적인 운영은 투입량보다 ______에 가까워야 한다.`;
    const correct = `${s.evidence}에서 확인한 조건에 맞춘 조정`;
    const c = choicesWithAnswer(
      correct,
      [
        `${s.oldMetric}의 일률적인 확대`,
        "조사 없이 내리는 즉시 결정",
        "기존 운영 방식의 무조건 유지",
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
    const target = slotFor(index);
    const positions = ["(A)", "(B)", "(C)", "(D)", "(E)"];
    const before = `${s.subject} 운영자는 ${subject(s.oldMetric)} 늘면 서비스 품질도 자연스럽게 높아질 것으로 기대했다.`;
    const after = `실제로는 ${s.evidence}에 따라 불편이 집중되는 조건이 달랐다.`;
    // 배경 → 기대(보기가 반전하는 지점) → 실제 → 결과 순서라야 어느 위치에서 끊어도 흐름이 유지된다.
    const background = [
      `${topic(s.subject)} 최근 몇 년 사이 이용이 꾸준히 늘었다.`,
      `운영자는 이용자 수와 ${object(s.oldMetric)} 매달 집계해 공개해 왔다.`,
      `초기 개선안은 대부분 ${object(s.oldMetric)} 늘리는 데 집중됐다.`,
      `예산이 확보될 때마다 같은 방식의 확충이 이어졌다.`,
    ];
    const consequence = [
      `이후 운영자는 ${object(s.evidence)} 조사해 불편이 집중되는 조건을 확인했다.`,
      `조사 결과를 바탕으로 ${s.action}했다.`,
      `조정 뒤에는 ${s.result}.`,
      `운영자는 같은 방식으로 다음 개선 과제를 정하기로 했다.`,
    ];
    const sentences = [
      ...background.slice(0, target),
      before,
      after,
      ...consequence.slice(0, 4 - target),
    ];
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
      explanation: `보기의 ‘그러나’는 투입 확대에 대한 기대를 반전하고 실제 이용 조건의 차이로 이어지므로 ${positions[target]} 위치가 적절합니다.`,
    };
  }
  if (kindId === "verbal-match-predicate") {
    const correct = `조정 뒤 불편 지수는 ${s.before}보다 높아졌다`;
    const c = choicesWithAnswer(
      correct,
      [
        `운영자는 ${object(s.evidence)} 조사했다`,
        `${s.action}했다`,
        `조정 전 불편 지수는 ${numberWas(s.before)}다`,
        `조정 뒤 불편 지수는 ${numberWas(s.after)}다`,
      ],
      index,
    );
    return {
      stem: "다음 글의 내용과 일치하지 않는 것은?",
      passage: s.passage,
      ...c,
      explanation: `불편 지수는 ${s.before}에서 ${numberTo(s.after)} 낮아졌으므로 높아졌다는 선지가 본문과 일치하지 않습니다.`,
    };
  }
  if (kindId === "verbal-match-range") {
    const correct = `조정 전 평균 불편 지수는 ${numberWas(s.before)}다`;
    const c = choicesWithAnswer(
      correct,
      [
        `조정 전 지수는 ${numberWas(s.after)}다`,
        `조정 후 지수는 ${numberWas(s.before)}다`,
        `모든 이용자의 불편이 완전히 사라졌다`,
        `${topic(s.oldMetric)} 감소했다는 수치가 제시됐다`,
      ],
      index,
    );
    return {
      stem: "다음 글의 내용과 일치하는 것은?",
      passage: s.passage,
      ...c,
      explanation: `본문은 조정 전 평균 불편 지수를 ${numberTo(s.before)} 직접 제시합니다.`,
    };
  }
  if (kindId === "verbal-match-order") {
    const correct = `${s.action}한 뒤 ${object(s.evidence)} 처음 조사했다`;
    const c = choicesWithAnswer(
      correct,
      [
        `${object(s.evidence)} 조사한 뒤 운영 방식을 조정했다`,
        `초기에는 ${withRo(s.oldMetric)} 성과를 판단했다`,
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
    // 내용 순서는 문제 인식 → 조사 → 조정 → 결과로 고정하고, 문단 기호만 유형별로 다르게 붙인다.
    const contents = [
      `${s.subject} 운영자는 기존 방식으로 이용자 불편을 해결하기 어렵다고 판단했다.`,
      `먼저 ${object(s.evidence)} 조사해 불편이 집중되는 조건을 확인했다.`,
      `조사 결과를 바탕으로 ${s.action}했다.`,
      `그 결과 ${s.result}.`,
    ];
    const labelOrders = [
      ["나", "라", "다", "가"],
      ["다", "가", "라", "나"],
      ["라", "다", "가", "나"],
      ["가", "다", "나", "라"],
      ["나", "가", "라", "다"],
    ];
    const labels = labelOrders[index % labelOrders.length];
    const marks = ["가", "나", "다", "라"];
    const passage = marks.map((mark) => `(${mark}) ${contents[labels.indexOf(mark)]}`).join("\n");
    const correct = labels.join(", ");
    const wrong = [
      [labels[1], labels[0], labels[2], labels[3]].join(", "),
      [labels[0], labels[2], labels[1], labels[3]].join(", "),
      [labels[0], labels[1], labels[3], labels[2]].join(", "),
      [labels[3], labels[0], labels[1], labels[2]].join(", "),
    ];
    const c = choicesWithAnswer(correct, wrong, index);
    return {
      stem: "다음 글의 (가)~(라)를 문맥에 맞게 순서대로 배열한 것은?",
      passage,
      ...c,
      explanation: `문제 인식인 (${labels[0]}), 조사인 (${labels[1]}), 조정인 (${labels[2]}), 결과인 (${labels[3]})의 순서가 자연스럽습니다.`,
    };
  }
  if (kindId === "verbal-understanding") {
    const correct = `운영자는 ${object(s.oldMetric)} 늘리는 대신 ${s.evidence}에서 확인한 조건을 반영했다`;
    // 정답만 길면 길이로 답이 드러나므로 오답도 같은 길이의 서술문으로 맞춘다.
    const c = choicesWithAnswer(
      correct,
      [
        `운영자는 ${object(s.evidence)} 확인하기 전에 ${object(s.oldMetric)} 먼저 줄였다`,
        `운영자는 ${object(s.oldMetric)} 늘리자 이용자 불편이 곧바로 사라졌다고 밝혔다`,
        `운영자는 이용자 조사를 생략하고 기존 운영 방식을 그대로 유지하기로 했다`,
        `운영자는 ${s.evidence}에서 확인한 조건을 조정 대상에서 제외하기로 했다`,
      ],
      index,
    );
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
  const correct = s.alternativeCause;
  const c = choicesWithAnswer(
    correct,
    [
      `조정 뒤에도 ${object(s.evidence)} 기록했다`,
      `운영자가 결과를 공개했다`,
      `${object(s.oldMetric)} 함께 집계했다`,
      `일부 이용자는 조정 내용을 알고 있었다`,
    ],
    index,
  );
  return {
    stem: "운영 방식의 조정이 지표 개선의 원인이라는 주장에 대한 반박으로 가장 적절한 것은?",
    passage: s.passage,
    ...c,
    explanation: `같은 기간에 발생한 별도의 변화도 지표를 개선할 수 있으므로 운영 조정만을 원인으로 단정하기 어렵습니다.`,
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
    // 문항마다 꺾이는 구간을 바꿔 정답 문장이 고정되지 않도록 한다.
    const shapes = [
      { values: [base, base + 8, base + 3, base + 14], correct: 1 },
      { values: [base + 10, base + 2, base + 6, base + 12], correct: 0 },
      { values: [base, base + 6, base + 13, base + 7], correct: 2 },
      { values: [base, base + 5, base + 11, base + 18], correct: 3 },
      { values: [base + 18, base + 12, base + 7, base], correct: 4 },
    ];
    const shape = shapes[index % shapes.length];
    const values = shape.values;
    // "…구간에서만"으로 한정해야 전 구간 감소 자료에서 복수 정답이 생기지 않는다.
    const statements = [
      "1분기에서 2분기 구간에서만 감소하였다",
      "2분기에서 3분기 구간에서만 감소하였다",
      "3분기에서 4분기 구간에서만 감소하였다",
      "네 분기 내내 증가하였다",
      "네 분기 내내 감소하였다",
    ];
    const visual: ProblemVisual = {
      type: "bar-chart",
      id: `trend-${index}`,
      title: "분기별 처리 건수",
      unit: "건",
      categories: ["1분기", "2분기", "3분기", "4분기"],
      series: [{ id: `trend-series-${index}`, name: "처리 건수", values, color: "#c8755a" }],
    };
    const correct = statements[shape.correct];
    const c = choicesWithAnswer(
      correct,
      statements.filter((statement) => statement !== correct),
      index,
    );
    const detail =
      shape.correct === 3
        ? `${values.join(" → ")}건으로 한 번도 줄지 않았습니다.`
        : shape.correct === 4
          ? `${values.join(" → ")}건으로 한 번도 늘지 않았습니다.`
          : `${shape.correct + 1}분기 ${values[shape.correct]}건에서 ${shape.correct + 2}분기 ${values[shape.correct + 1]}건으로 감소했습니다.`;
    return {
      stem: "다음 자료에 대한 설명으로 옳은 것은?",
      passage: "",
      visuals: [visual],
      ...c,
      explanation: detail,
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
    // 다섯 선지를 같은 형식으로 맞춰 길이만 보고 정답을 고르지 못하게 한다.
    const column = index % 2 === 0 ? 1 : 2;
    const period = column === 1 ? "상반기" : "하반기";
    const columnValues = rowValues.map((row) => row[column] as number);
    const winner = columnValues.indexOf(Math.max(...columnValues));
    const statement = (i: number) =>
      `${period} 완료 건수는 ${labels[i]} 부서가 ${columnValues[i]}건으로 가장 많다`;
    const c = choicesWithAnswer(
      statement(winner),
      labels
        .map((_, i) => i)
        .filter((i) => i !== winner)
        .map(statement),
      index,
    );
    return {
      stem: "다음 자료에 대한 설명으로 옳은 것은?",
      passage: "",
      visuals: [visual],
      ...c,
      explanation: `${period} 열에서 가장 큰 값은 ${labels[winner]} 부서의 ${columnValues[winner]}건입니다. 나머지 선지는 건수는 맞지만 최댓값이 아닙니다.`,
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
    const statement = (i: number) => `${labels[i]} 지점의 상반기 합계가 ${sums[i]}건으로 가장 많다`;
    const c = choicesWithAnswer(
      statement(winner),
      labels
        .map((_, i) => i)
        .filter((i) => i !== winner)
        .map(statement),
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
    const rates = [10, 20, 25, 50];
    const rate = rates[index % rates.length];
    const prior = 160 + index * 20;
    const current = prior + (prior * rate) / 100;
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
      `A 제품의 증가율은 ${rate}%이다`,
      [
        ...rates
          .filter((value) => value !== rate)
          .map((value) => `A 제품의 증가율은 ${value}%이다`),
        "두 제품의 증가량은 같다",
      ],
      index,
    );
    return {
      stem: "다음 자료에 대한 설명으로 옳은 것은?",
      passage: "",
      visuals: [visual],
      ...c,
      explanation: `A 제품은 ${prior}개에서 ${current}개로 ${current - prior}개 늘었고, 증가량은 전년 값의 ${rate}%입니다.`,
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
    const shares = [30, 25, 20, 15, 10];
    const amounts = shares.map((share) => (total * share) / 100);
    const visual = tableVisual(
      `share-${index}`,
      "제품군별 매출",
      ["제품군", "매출"],
      labels.map((label, i) => [label, amounts[i]] as [string, number]),
      "백만 원",
    );
    // 문항마다 묻는 제품군을 바꿔 정답 문장이 반복되지 않게 한다.
    const pick = index % shares.length;
    const other = (pick + 2) % shares.length;
    const c = choicesWithAnswer(
      `${labels[pick]} 제품군의 전체 매출 비중은 ${shares[pick]}%이다`,
      [
        `${labels[pick]} 제품군의 전체 매출 비중은 ${shares[pick] + 5}%이다`,
        `${labels[pick]} 제품군의 전체 매출 비중은 ${shares[pick] - 5}%이다`,
        `${labels[other]} 제품군의 전체 매출 비중은 ${shares[pick]}%이다`,
        `A와 B 제품군의 매출 합은 전체의 60%이다`,
      ],
      index,
    );
    return {
      stem: "다음 자료에 대한 설명으로 옳은 것은?",
      passage: `전체 매출은 ${comma(total)}백만 원이다.`,
      visuals: [visual],
      ...c,
      explanation: `${numberObject(amounts[pick])} 전체 ${numberTo(total)} 나누면 ${shares[pick] / 100}이므로 ${shares[pick]}%입니다.`,
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
      explanation: `${numberObject(center)} 기준으로 편차가 -12, -5, 0, 5, 12로 상쇄되므로 평균은 ${center}건입니다.`,
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
  // 문항마다 참·거짓 조합을 바꿔 정답이 항상 "ㄱ, ㄴ, ㄷ"이 되지 않게 한다.
  const falseOne = index % 4; // 0이면 모두 참, 1~3이면 해당 항목만 거짓
  const shown = [
    falseOne === 1 ? 12 + 3 : 12,
    falseOne === 2 ? 18 - 4 : 18,
    falseOne === 3 ? 30 + 5 : 30,
  ];
  const box = `ㄱ. A의 2024년 증가액은 ${shown[0]}억 원이다.\nㄴ. A의 2025년 증가액은 ${shown[1]}억 원이다.\nㄷ. A의 2년간 총 증가액은 ${shown[2]}억 원이다.`;
  const combos = ["ㄱ, ㄴ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄷ", "ㄱ, ㄴ"];
  const correct = combos[falseOne];
  const c = choicesWithAnswer(
    correct,
    combos.filter((combo) => combo !== correct).concat("ㄱ"),
    index,
  );
  const wrongLabel = ["", "ㄱ", "ㄴ", "ㄷ"][falseOne];
  return {
    stem: "다음 자료에 대한 설명으로 옳은 것만을 <보기>에서 모두 고른 것은?",
    passage: "",
    visuals: [visual],
    box,
    ...c,
    explanation:
      `A의 값은 ${p0}, ${p1}, ${p2}이므로 구간별 증가액은 12와 18이고 2년간 총 증가액은 30입니다. ` +
      (falseOne === 0
        ? "따라서 ㄱ, ㄴ, ㄷ이 모두 옳습니다."
        : `${wrongLabel}의 수치만 자료와 다르므로 정답은 ${correct}입니다.`),
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
    const c = rankedChoices(
      { value: rounded, text: `${rounded}%` },
      [-7, -5, -3, -1.5, 1.5, 3, 5, 7]
        .map((offset) => Math.round((rounded + offset) * 10) / 10)
        .filter((value) => value > 0)
        .map((value) => ({ value, text: `${value}%` })),
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
    // 목표 농도를 옮겨 정답 비율이 1:1로 고정되지 않게 한다.
    const ratios = [
      [1, 1],
      [1, 2],
      [2, 1],
      [1, 3],
      [3, 1],
    ];
    const [p, q] = ratios[index % ratios.length];
    const low = 4 + index,
      high = low + 12,
      target = (q * high + p * low) / (p + q);
    const correct = `${p}:${q}`;
    const c = choicesWithAnswer(
      correct,
      ratios.map(([a, b]) => `${a}:${b}`).filter((value) => value !== correct),
      index,
    );
    return {
      stem: `${low}%와 ${high}% 용액을 섞어 ${target}% 용액을 만들 때 두 용액의 양의 비는?`,
      passage: "두 용액 외에 물이나 용질을 추가하지 않는다.",
      ...c,
      explanation: `${low}% 용액과 목표의 차이는 ${target - low}%p, ${high}% 용액과의 차이는 ${high - target}%p이므로 양의 비는 그 반대인 ${correct}입니다.`,
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
      explanation: `A+B=${total}, 1.1A+0.9B=${changed} 두 식을 연립하면 A=${a}명입니다.`,
    };
  }
  if (kindId === "math-population-multiple") {
    const original = 50 + index * 5,
      after = (original * 6) / 5;
    // 오답은 6의 배수가 되지 않도록 6과 서로소인 간격만 사용한다.
    const slot = slotFor(index);
    const below = [-2, -5, -8, -11].slice(0, slot).reverse();
    const above = [2, 5, 8, 11].slice(0, 4 - slot);
    const choices = [...below, 0, ...above].map((offset) => `${comma(after + offset)}명`);
    return {
      stem: "인원을 정확히 20% 늘린 뒤 인원으로 가능한 것은?",
      passage: "조정 전후 인원은 모두 자연수이며 반올림하지 않는다.",
      choices,
      answer: slot,
      explanation: `조정 뒤 인원은 원래 인원의 6/5이므로 6의 배수여야 합니다. 선지 중 6으로 나누어떨어지는 값은 ${after}명뿐입니다.`,
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
    const n = 4 + (index % 5),
      answer = factorial(n),
      c = numberChoices(answer, Math.max(2, Math.round(answer / 10)), index);
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
    const n = 4 + (index % 5),
      answer = factorial(n - 1) * 2,
      c = numberChoices(answer, Math.max(2, Math.round(answer / 8)), index);
    return {
      stem: `${countScenario} 참가자 ${n}명을 한 줄로 세울 때 A와 B가 이웃하는 경우의 수는?`,
      passage: `A와 B를 포함한 ${n}명은 모두 서로 다르다.`,
      ...c,
      explanation: `A와 B를 한 묶음으로 보면 ${n - 1}개 대상을 배열하고 묶음 내부 순서 2가지를 곱하므로 ${answer}가지입니다.`,
    };
  }
  if (kindId === "math-count-separated") {
    const n = 4 + (index % 5),
      answer = factorial(n) - factorial(n - 1) * 2,
      c = numberChoices(answer, Math.max(2, Math.round(answer / 8)), index);
    return {
      stem: `${countScenario} 참가자 ${n}명을 한 줄로 세울 때 A와 B가 이웃하지 않는 경우의 수는?`,
      passage: `A와 B를 포함한 ${n}명은 모두 서로 다르다.`,
      ...c,
      explanation: `전체 ${n}!에서 A와 B가 붙는 ${n - 1}!×2를 빼면 ${answer}가지입니다.`,
    };
  }
  if (kindId === "math-count-group") {
    const n = [6, 8, 10, 12][index % 4],
      r = n / 2,
      answer = combination(n, r) / 2,
      c = numberChoices(answer, Math.max(2, Math.round(answer / 6)), index);
    return {
      stem: `${countScenario} 참가자 ${n}명을 ${r}명씩 이름 없는 두 조로 나누는 경우의 수는?`,
      passage: "두 조의 이름은 없으며 조의 순서만 다른 경우는 같게 센다.",
      ...c,
      explanation: `한 조를 고르는 ${n}C${r}에서 두 조가 뒤바뀐 중복을 2로 나누면 ${answer}가지입니다.`,
    };
  }
  if (kindId === "math-count-select") {
    const n = 6 + (index % 5),
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
    const n = 4 + (index % 5),
      answer = factorial(n - 1),
      c = numberChoices(answer, Math.max(2, Math.round(answer / 8)), index);
    return {
      stem: `${countScenario} 참가자 ${n}명이 원탁에 앉는 경우의 수는?`,
      passage: "회전하여 같은 배치는 하나로 센다.",
      ...c,
      explanation: `한 명을 고정하고 나머지 ${n - 1}명을 배열하므로 (${n}-1)!=${answer}가지입니다.`,
    };
  }
  if (kindId === "math-probability-basic") {
    // 다섯 선지를 서로 다른 사건의 확률로 두고, 발문이 그중 하나를 지정한다.
    const failDen = 4 + (index % 3),
      den = failDen ** 2,
      success = failDen - 1;
    const events = [
      {
        ask: "한 번 이상 성공할",
        value: fractionText(den - 1, den),
        why: `두 번 모두 실패할 확률 1/${den}의 여사건입니다`,
      },
      {
        ask: "두 번 모두 성공할",
        value: fractionText(success * success, den),
        why: `성공 확률 ${success}/${failDen}의 제곱입니다`,
      },
      {
        ask: "두 번 모두 실패할",
        value: fractionText(1, den),
        why: `실패 확률 1/${failDen}의 제곱입니다`,
      },
      {
        ask: "정확히 한 번만 성공할",
        value: fractionText(2 * success, den),
        why: `성공과 실패의 순서가 두 가지이므로 ${success}/${den}에 2를 곱합니다`,
      },
      {
        ask: "한 번 이상 실패할",
        value: fractionText(2 * failDen - 1, den),
        why: `두 번 모두 성공할 확률 ${success * success}/${den}의 여사건입니다`,
      },
    ];
    const picked = events[index % events.length];
    const c = choicesWithAnswer(
      picked.value,
      events.filter((event) => event !== picked).map((event) => event.value),
      index,
    );
    return {
      stem: `${probabilityScenarios[index]} 과정에서 독립적인 두 번의 시도 중 ${picked.ask} 확률은?`,
      passage: `각 시도의 성공 확률은 ${success}/${failDen}이며, 두 시도의 결과는 서로 독립이다.`,
      ...c,
      explanation: `${picked.why}. 따라서 ${picked.value}입니다.`,
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
    // 0과 1은 계산 없이 지워지므로 제외하고, 정답 위아래로 후보를 고루 둔다.
    const pool = [
      ...Array.from({ length: sample - 1 }, (_, i) => [i + 1, sample] as const),
      [1, 3] as const,
      [2, 3] as const,
      [1, 4] as const,
      [3, 4] as const,
      [2, 5] as const,
      [3, 5] as const,
      [1, 2] as const,
    ].map(([numerator, denominator]) => ({
      value: numerator / denominator,
      text: fractionText(numerator, denominator),
    }));
    const c = rankedChoices({ value: favorable / sample, text: correct }, pool, index);
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
      exact = Number.isInteger(answer * 100),
      c = numberChoices(rounded, 0.25, index, "시간");
    return {
      stem: "같은 거리를 더 빠른 속력으로 이동할 때 걸리는 시간은?",
      passage: `시속 ${speed1}km로 ${time1}시간 이동한 거리를 시속 ${speed2}km로 이동한다. 필요한 경우 소수 셋째 자리에서 반올림한다.`,
      ...c,
      explanation: `거리는 ${distance}km이고 ${distance}÷${speed2}${exact ? "=" : "≈"}${rounded}시간입니다.`,
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
      b = 70 + index * 2,
      answer = 0.5 + 0.5 * (index % 5), // 0.5~2.5시간
      distance = (a + b) * answer,
      c = numberChoices(answer, 0.25, index, "시간");
    return {
      stem: "서로 마주 오는 두 차량이 만날 때까지 걸리는 시간은?",
      passage: `두 차량 사이 거리는 ${distance}km이고 속력은 각각 시속 ${a}km와 ${b}km이다.`,
      ...c,
      explanation: `상대속력은 ${a + b}km/h이므로 ${distance}÷${a + b}=${answer}시간입니다.`,
    };
  }
  if (kindId === "math-work-single") {
    const days = 6 + (index % 8),
      c = rankedChoices(
        { value: 1 / days, text: `1/${days}` },
        [-4, -3, -2, -1, 1, 2, 3, 4]
          .map((offset) => days + offset)
          .filter((value) => value >= 2)
          .map((value) => ({ value: 1 / value, text: `1/${value}` })),
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
    const a = 6 + (index % 5) * 3,
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
    const c = rankedChoices(
      { value: numerator / denominator, text: rate },
      [
        [1, totalDays] as const,
        [numerator, totalDays] as const,
        [numerator - 1, denominator] as const,
        [numerator + 1, denominator] as const,
        [1, 2] as const,
        [1, 4] as const,
        [2, 3] as const,
        [3, 4] as const,
      ].map(([n, d]) => ({ value: n / d, text: fractionText(n, d) })),
      index,
    );
    return {
      stem: `${workScenario}에서 B의 하루 작업량은 전체의 얼마인가?`,
      passage: `A는 혼자 ${totalDays}일 만에 ${workScenario} 작업을 끝낸다. A가 ${worked}일 일한 뒤 남은 작업을 B가 2일 동안 완료했다. 전체 작업량은 1이다.`,
      ...c,
      explanation: `A가 2일 동안 2/${totalDays}만큼 끝냈고 남은 ${numerator}/${totalDays}만큼을 B가 2일에 처리하므로 B의 하루 작업량은 ${rate}입니다.`,
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
    // 자녀 나이가 많아질수록 배수를 낮춰 부모 나이가 비현실적으로 커지지 않게 한다.
    const child = 8 + (index % 12),
      years = 3 + (index % 5),
      ratio = child <= 14 ? 3 : 2,
      parent = ratio * (child + years) - years;
    const c = numberChoices(child, 1, index, "세");
    return {
      stem: "자녀의 현재 나이는?",
      passage: `현재 부모와 자녀의 나이 합은 ${parent + child}세이다. ${years}년 후 부모의 나이는 자녀의 나이의 ${ratio}배이다.`,
      ...c,
      explanation: `자녀를 x로 두면 부모는 ${parent + child}-x이고, ${years}년 후 ${parent + child}-x+${years}=${ratio}(x+${years})를 풀면 x=${child}세입니다.`,
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
    const correct = `모든 ${topic(a)} ${c}이다`,
      x = choicesWithAnswer(
        correct,
        [
          `모든 ${topic(c)} ${a}이다`,
          `어떤 ${a}도 ${subject(c)} 아니다`,
          `모든 ${topic(b)} ${a}이다`,
          `어떤 ${topic(c)} ${subject(b)} 아니다`,
        ],
        index,
      );
    return {
      stem: "다음 전제가 모두 참일 때 반드시 참인 결론은?",
      passage: `모든 ${topic(a)} ${b}이다.\n모든 ${topic(b)} ${c}이다.`,
      ...x,
      explanation: `${subject(a)} ${b}에 포함되고 ${subject(b)} ${c}에 포함되므로 모든 ${topic(a)} ${c}입니다.`,
    };
  }
  if (kindId === "logic-premise-small") {
    const correct = `모든 ${topic(a)} ${b}이다`,
      x = choicesWithAnswer(
        correct,
        [
          `모든 ${topic(b)} ${a}이다`,
          `어떤 ${topic(a)} ${subject(b)} 아니다`,
          `모든 ${topic(c)} ${a}이다`,
          `어떤 ${topic(b)} ${c}이다`,
        ],
        index,
      );
    return {
      stem: "결론이 반드시 성립하도록 빈칸에 들어갈 전제로 적절한 것은?",
      passage: `빈칸\n모든 ${topic(b)} ${c}이다.\n결론: 모든 ${topic(a)} ${c}이다.`,
      ...x,
      explanation: `작은 집합인 ${a}에서 ${withRo(b)} 이어지는 전제가 있어야 기존 전제와 연결됩니다.`,
    };
  }
  if (kindId === "logic-premise-large") {
    // 결론과 같은 문장("모든 a는 c이다")은 그 자체로 결론을 보장하므로 선지에서 제외한다.
    const correct = `모든 ${topic(b)} ${c}이다`,
      x = choicesWithAnswer(
        correct,
        [
          `모든 ${topic(c)} ${b}이다`,
          `어떤 ${topic(b)} ${subject(c)} 아니다`,
          `어떤 ${topic(b)} ${c}이다`,
          `어떤 ${topic(c)} ${a}이다`,
        ],
        index,
      );
    return {
      stem: "결론이 반드시 성립하도록 빈칸에 들어갈 전제로 적절한 것은?",
      passage: `모든 ${topic(a)} ${b}이다.\n빈칸\n결론: 모든 ${topic(a)} ${c}이다.`,
      ...x,
      explanation: `도착 집합 ${withRo(c)} 이어지려면 모든 ${subject(b)} ${c}라는 전제가 필요합니다.`,
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
    // 정답만 내용 문장이고 오답은 기호 문장이면 형식으로 답이 드러나므로 모두 내용 문장으로 맞춘다.
    const correct = propositions.S,
      x = choicesWithAnswer(
        correct,
        [
          `${action}하지 않는다`,
          `${object(evidence)} 조사하지 않는다`,
          propositions.T,
          `${topic(service)} 운영 개선 대상이 아니다`,
        ],
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
    const correct = `어떤 ${topic(a)} ${c}이다`,
      x = choicesWithAnswer(
        correct,
        [
          `모든 ${topic(a)} ${c}이다`,
          `어떤 ${c}도 ${subject(a)} 아니다`,
          `모든 ${topic(c)} ${b}이다`,
          `어떤 ${topic(a)} ${subject(b)} 아니다`,
        ],
        index,
      );
    return {
      stem: "다음 전제가 모두 참일 때 반드시 참인 것은?",
      passage: `어떤 ${topic(a)} ${b}이다.\n모든 ${topic(b)} ${c}이다.`,
      ...x,
      explanation: `실제로 존재하는 ${a} 중 ${b}인 대상은 모든 ${subject(b)} ${c}라는 전제에 따라 ${c}이기도 합니다.`,
    };
  }
  if (kindId === "logic-some-mmo") {
    const correct = `어떤 ${topic(a)} ${c}이다`,
      x = choicesWithAnswer(
        correct,
        [
          `모든 ${topic(c)} ${a}이다`,
          `어떤 ${a}도 ${subject(c)} 아니다`,
          `어떤 ${topic(b)} ${subject(a)} 아니다`,
          `모든 ${topic(a)} ${subject(b)} 아니다`,
        ],
        index,
      );
    return {
      stem: "다음 전제가 모두 참일 때 반드시 참인 것은?",
      passage: `모든 ${topic(a)} ${b}이다.\n모든 ${topic(b)} ${c}이다.\n어떤 ${subject(a)} 존재한다.`,
      ...x,
      explanation: `존재하는 ${topic(a)} ${object(b)} 거쳐 ${c}에도 포함되므로 어떤 ${topic(a)} ${c}입니다.`,
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
      explanation: `${order[0]}, ${order[1]}, ${subject(order[2])} 앞의 세 자리를 이루고 뒤의 두 자리에는 ${order[3]}, ${subject(order[4])} 오므로 세 번째는 ${target}입니다.`,
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
    // 남겨 두는 두 수를 문항마다 바꿔 정답이 항상 3이 되지 않게 한다.
    const pairs = [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [2, 5],
    ];
    const [small, large] = pairs[index % pairs.length];
    const fixed = [1, 2, 3, 4, 5].filter((value) => value !== small && value !== large);
    const target = small,
      p = condition([
        `${topic(names[0])} ${numberObject(fixed[0])} 받는다.`,
        `${topic(names[4])} ${numberObject(fixed[2])} 받는다.`,
        `${topic(names[2])} ${names[1]}보다 큰 수를 받는다.`,
        `${withAnd(names[1])} ${subject(names[2])} 받은 수의 합은 ${small + large}이다.`,
        `${topic(names[3])} ${numberObject(fixed[1])} 받는다.`,
      ]);
    const x = choicesWithAnswer(
      String(target),
      ["1", "2", "3", "4", "5"].filter((value) => value !== String(target)),
      index,
    );
    return {
      stem: `다음 조건을 만족할 때 ${subject(names[1])} 받는 수는?`,
      passage: p,
      passageLabel: "조건",
      ...x,
      explanation: `${fixed[0]}, ${fixed[1]}, ${numberSubject(fixed[2])} 이미 사용됐고 남은 ${numberAnd(small)} ${large}의 합은 ${small + large}입니다. ${subject(names[2])} 더 크므로 ${topic(names[1])} ${target}입니다.`,
    };
  }
  const liar = names[1],
    p = `${names[0]}: ${subject(liar)} 거짓말한다.\n${liar}: ${subject(names[2])} 거짓말한다.\n${names[2]}: ${subject(names[3])} 참말한다.\n${names[3]}: ${subject(liar)} 거짓말한다.`;
  const x = choicesWithAnswer(liar, [names[0], names[2], names[3], "알 수 없다"], index);
  return {
    stem: "네 사람 중 한 명만 거짓말할 때 거짓말하는 사람은?",
    passage: p,
    ...x,
    explanation: `첫째와 넷째 사람의 같은 진술이 참이면 ${subject(liar)} 유일한 거짓말쟁이가 되고 나머지 진술도 모순 없이 성립합니다.`,
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
      explanation: `앞 항에 ${numberObject(ratio)} 곱하므로 다음 수는 ${answer}입니다.`,
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
      explanation: `각 항은 2²부터 이어지는 제곱수에 ${numberObject(offset)} 더한 값이므로 다음 수는 ${answer}입니다.`,
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
      explanation: `각 항에 2를 곱하고 ${numberObject(add)} 더하므로 다음 수는 ${answer}입니다.`,
    };
  }
  if (kindId === "sequence-fraction") {
    const offset = index + 1,
      a = offset + 4,
      b = offset + 5,
      nextA = offset + 5,
      nextB = offset + 6;
    const correct = `${a * nextB}/${b * nextA}`,
      c = rankedChoices(
        { value: (a * nextB) / (b * nextA), text: correct },
        [
          [a, b] as const,
          [nextA, nextB] as const,
          [a * nextA, b * nextB] as const,
          [offset + 5, offset + 7] as const,
          [b * nextA, a * nextB] as const,
          [b * nextB, a * nextA] as const,
          [b, a] as const,
        ].map(([n, d]) => ({ value: n / d, text: `${n}/${d}` })),
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
    c = rankedChoices(
      { value: answer, text: correct },
      [
        answer / 3,
        answer / 2,
        answer - 1,
        answer - 0.6,
        answer + 0.6,
        answer + 1,
        answer * 1.5,
        answer * 2,
      ]
        .map((value) => Math.round(value * 10000) / 10000)
        .map((value) => ({ value, text: roundedDecimal(value) })),
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
  activeSlots = slotPlan(kind.id);
  const draft = kind.id.startsWith("verbal-")
    ? verbalQuestion(kind.id, index)
    : kind.id.startsWith("data-")
      ? dataQuestion(kind.id, index)
      : kind.id.startsWith("math-")
        ? mathQuestion(kind.id, index)
        : kind.id.startsWith("logic-")
          ? logicQuestion(kind.id, index)
          : sequenceQuestion(kind.id, index);
  // (A)~(E) 위치 선지는 순서 자체가 의미이므로 정렬하지 않는다.
  if (draft.choices.every((choice) => /^\([A-E]\)$/.test(choice))) return draft;
  return sortNumericChoices(draft);
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
