import type { ExampleQuestion } from "../catalog";
import { defineQuestion, rotateChoices } from "./bankUtils";

const CATEGORY = "verbal-reasoning";

function hasFinalConsonant(value: string) {
  const code = value.charCodeAt(value.length - 1);
  return code >= 0xac00 && code <= 0xd7a3 ? (code - 0xac00) % 28 !== 0 : false;
}

function topic(value: string) {
  return `${value}${hasFinalConsonant(value) ? "은" : "는"}`;
}

function subject(value: string) {
  return `${value}${hasFinalConsonant(value) ? "이" : "가"}`;
}

function togetherWith(value: string) {
  return `${value}${hasFinalConsonant(value) ? "과" : "와"}`;
}

function allStatement(a: string, b: string) {
  return `모든 ${topic(a)} ${b}이다.`;
}

function someStatement(a: string, b: string) {
  return `어떤 ${topic(a)} ${b}이다.`;
}

function noStatement(a: string, b: string) {
  return `어떤 ${a}도 ${subject(b)} 아니다.`;
}

/**
 * 실제 시험의 명제 문제는 전제가 세 개 이상이고 대우까지 거쳐야 결론이 나온다.
 * 전제 두 개짜리는 읽자마자 답이 보여 연습이 되지 않으므로 네 개념을 쓴다.
 */
const conceptSets = [
  ["연구원", "분석가", "문제 해결자", "현장 감독자"],
  ["친환경 제품", "재활용 가능 제품", "자원 절약 제품", "일회용 포장재"],
  ["온라인 강의 수강생", "자기주도 학습자", "계획 실천자", "중도 포기자"],
  ["정기 점검 차량", "안전 기준 충족 차량", "운행 허가 차량", "운행 정지 차량"],
  ["우수 사원", "목표 달성자", "성과급 대상자", "재교육 대상자"],
  ["도서관 회원", "자료 검색 가능자", "전자책 이용자", "출입 제한 대상자"],
  ["신제품", "품질 검사 통과품", "출고 가능품", "폐기 대상품"],
  ["교육 이수자", "평가 응시자", "자격 심사 대상자", "재이수 대상자"],
  ["등록 선수", "훈련 참가자", "대회 출전자", "출전 정지 선수"],
  ["보안 인증 기기", "내부망 접속 기기", "자료 열람 기기", "반출 금지 기기"],
  ["지역 주민", "공공시설 이용자", "문화행사 신청자", "타 지역 신청자"],
  ["계약 고객", "서비스 가입자", "할인 대상자", "해지 예정 고객"],
  ["정회원", "의결권 보유자", "총회 참석자", "자격 정지 회원"],
  ["검수 완료 문서", "승인 요청 문서", "최종 결재 문서", "반려 문서"],
  ["예약 승객", "탑승권 발급자", "출국장 입장자", "탑승 거절 승객"],
  ["임상 참여자", "건강 검사 완료자", "연구 자료 제공자", "참여 제외자"],
  ["창업 기업", "지원 심사 통과 기업", "보조금 수령 기업", "심사 탈락 기업"],
  ["농산물 인증품", "온라인 판매품", "전국 배송품", "반품 대상품"],
  ["프로젝트 관리자", "일정 조정자", "회의 소집자", "권한 위임자"],
  ["장학생 후보", "서류 합격자", "면접 대상자", "지원 자격 미달자"],
] as const;

export const PROPOSITION_QUESTIONS: ExampleQuestion[] = conceptSets.map(([a, b, c, d], index) => {
  const mode = index % 4;
  if (mode === 0) {
    // A ⊆ B ⊆ C ⊆ D 이므로 모든 A는 D이다.
    const correct = allStatement(a, d);
    return defineQuestion(CATEGORY, "vr-proposition-1", "명제와 삼단논법 추리", index, {
      stem: "다음 세 전제가 모두 참일 때 반드시 참인 결론은?",
      passage: `${allStatement(a, b)}\n${allStatement(b, c)}\n${allStatement(c, d)}`,
      ...rotateChoices(
        correct,
        // '어떤 D는 B이다'류는 포함 관계상 실제로 참이 되어 정답이 둘이 된다. 방향이 반대인 전칭만 오답으로 쓴다.
        [allStatement(d, a), noStatement(a, d), allStatement(c, a), allStatement(d, b)],
        index,
      ),
      explanation: `${a}의 범위가 ${b}, ${b}의 범위가 ${c}, ${c}의 범위가 ${d} 안에 차례로 들어갑니다. 포함 관계를 이어 붙이면 ${allStatement(a, d)} 나머지 선지는 포함 방향이 반대이거나 전제만으로는 알 수 없는 관계입니다.`,
    });
  }
  if (mode === 1) {
    // A ⊆ B, B ∩ C = ∅, D ⊆ C 이므로 A와 D는 겹칠 수 없다.
    const correct = noStatement(a, d);
    return defineQuestion(CATEGORY, "vr-proposition-1", "명제와 삼단논법 추리", index, {
      stem: "다음 세 전제가 모두 참일 때 반드시 참인 결론은?",
      passage: `${allStatement(a, b)}\n${noStatement(b, c)}\n${allStatement(d, c)}`,
      ...rotateChoices(
        correct,
        [allStatement(a, d), someStatement(d, a), allStatement(d, b), someStatement(a, c)],
        index,
      ),
      explanation: `${a}의 범위는 ${b} 안에 있고 ${d}의 범위는 ${c} 안에 있습니다. ${togetherWith(b)} ${c}의 범위가 서로 겹치지 않으므로 그 안에 든 ${togetherWith(a)} ${d}도 겹칠 수 없습니다. 따라서 ${noStatement(a, d)}`,
    });
  }
  if (mode === 2) {
    // A와 B의 공통 대상이 있고 B ⊆ C ⊆ D 이므로 그 대상은 D에도 속한다.
    const correct = someStatement(a, d);
    return defineQuestion(CATEGORY, "vr-proposition-1", "명제와 삼단논법 추리", index, {
      stem: "다음 세 전제로부터 확실히 도출되는 것은?",
      passage: `${someStatement(a, b)}\n${allStatement(b, c)}\n${allStatement(c, d)}`,
      ...rotateChoices(
        correct,
        [allStatement(a, d), noStatement(a, d), allStatement(d, a), noStatement(b, d)],
        index,
      ),
      explanation: `첫 번째 전제로 ${togetherWith(a)} ${b}에 함께 속하는 대상이 존재합니다. 그 대상은 ${b}에 속하므로 ${c}에, 다시 ${d}에 속하게 되어 ${someStatement(a, d)} 모든 ${topic(a)} ${d}라고까지는 말할 수 없습니다.`,
    });
  }
  // 결론까지 포함 관계를 잇는 데 빠진 고리 하나를 찾는 유형이다.
  const correct = allStatement(b, c);
  return defineQuestion(CATEGORY, "vr-proposition-1", "명제와 삼단논법 추리", index, {
    stem: "다음 논증이 성립하려면 빈칸에 들어가야 하는 전제는?",
    passage: `${allStatement(a, b)}\n(빈칸)\n${allStatement(c, d)}\n따라서 ${allStatement(a, d)}`,
    ...rotateChoices(
      correct,
      [allStatement(c, b), someStatement(b, c), noStatement(b, c), allStatement(d, b)],
      index,
    ),
    explanation: `결론이 나오려면 ${a}에서 ${d}까지 포함 관계가 끊기지 않아야 합니다. 첫 전제가 ${a}에서 ${b}까지, 마지막 전제가 ${c}에서 ${d}까지 잇고 있으므로 빠진 고리는 ${togetherWith(b)} ${c} 사이를 잇는 '${allStatement(b, c)}'입니다.`,
  });
});

const nameSets = [
  ["민수", "서연", "지호", "하늘", "윤아"],
  ["가람", "나래", "도윤", "라온", "미르"],
  ["현우", "수빈", "준서", "예린", "태호"],
  ["다온", "보라", "시우", "유진", "채원"],
  ["건우", "다혜", "로이", "민지", "성호"],
  ["나윤", "도현", "세아", "우진", "하람"],
  ["기현", "라희", "민재", "소율", "정우"],
  ["가온", "누리", "도하", "리안", "서우"],
  ["경민", "보민", "수호", "예나", "지민"],
  ["다인", "로운", "시현", "유나", "태민"],
  ["규리", "동하", "선우", "아린", "재현"],
  ["나경", "민호", "소민", "유찬", "하진"],
  ["도영", "루아", "세진", "예준", "채린"],
  ["강민", "다솜", "민혁", "수아", "지안"],
  ["나린", "도겸", "서진", "유림", "현서"],
  ["건희", "라윤", "시온", "주원", "하윤"],
  ["규빈", "다빈", "민석", "예은", "지율"],
  ["나현", "동우", "서현", "유빈", "태윤"],
  ["도훈", "로아", "수민", "예성", "채민"],
  ["가현", "민규", "소현", "유성", "하준"],
] as const;

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]];
  const result: T[][] = [];
  items.forEach((item, index) => {
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    for (const tail of permutations(rest)) result.push([item, ...tail]);
  });
  return result;
}

interface OrderConstraint {
  text: string;
  holds: (position: Record<string, number>) => boolean;
}

const ORDINALS = ["첫 번째", "두 번째", "세 번째", "네 번째", "다섯 번째"];

/**
 * 실제 조건추리는 조건 몇 개를 조합해야 순서가 하나로 좁혀진다.
 * 'A는 B보다 앞', 'B는 C보다 앞'처럼 전부 이어 붙인 조건은 읽는 즉시 순서가 나와 문제가 되지 않는다.
 * 그래서 조건 후보를 만들어 두고, 답이 하나로 확정될 때까지만 골라 붙인다.
 */
function buildOrderConstraints(order: readonly string[], seed: number, askPosition: number) {
  const target: Record<string, number> = {};
  order.forEach((name, index) => {
    target[name] = index;
  });
  const pool: OrderConstraint[] = [];
  for (let i = 0; i < order.length; i += 1) {
    for (let j = 0; j < order.length; j += 1) {
      if (i === j) continue;
      const [left, right] = [order[i], order[j]];
      if (target[left] < target[right])
        pool.push({
          text: `${topic(left)} ${right}보다 앞에 선다.`,
          holds: (position) => position[left] < position[right],
        });
      if (target[right] - target[left] === 1)
        pool.push({
          text: `${topic(right)} ${left}의 바로 뒤에 선다.`,
          holds: (position) => position[right] - position[left] === 1,
        });
      if (Math.abs(target[left] - target[right]) === 2)
        pool.push({
          text: `${togetherWith(left)} ${right} 사이에는 한 명이 서 있다.`,
          holds: (position) => Math.abs(position[left] - position[right]) === 2,
        });
    }
    const name = order[i];
    // 묻는 자리를 그대로 알려 주는 조건이 섞이면 나머지 조건을 볼 필요가 없어진다.
    if (target[name] !== askPosition)
      pool.push({
        text: `${topic(name)} ${ORDINALS[target[name]]}에 선다.`,
        holds: (position) => position[name] === target[name],
      });
    if (target[name] !== 0)
      pool.push({
        text: `${topic(name)} 맨 앞에 서지 않는다.`,
        holds: (position) => position[name] !== 0,
      });
    if (target[name] !== order.length - 1)
      pool.push({
        text: `${topic(name)} 맨 뒤에 서지 않는다.`,
        holds: (position) => position[name] !== order.length - 1,
      });
  }

  const everyOrder = permutations(order).map((candidate) => {
    const position: Record<string, number> = {};
    candidate.forEach((name, index) => {
      position[name] = index;
    });
    return position;
  });

  const chosen: OrderConstraint[] = [];
  let survivors = everyOrder;
  for (let step = 0; step < pool.length && survivors.length > 1; step += 1) {
    const candidate = pool[(seed * 7 + step * 3) % pool.length];
    if (chosen.some((item) => item.text === candidate.text)) continue;
    const narrowed = survivors.filter((position) => candidate.holds(position));
    if (narrowed.length === survivors.length) continue;
    chosen.push(candidate);
    survivors = narrowed;
  }
  if (survivors.length !== 1) throw new Error(`조건추리 해가 유일하지 않음: ${order.join(",")}`);

  // 없어도 답이 하나로 남는 조건은 빼서, 실제 시험처럼 조건 서너 개만 남긴다.
  const minimal = [...chosen];
  for (let step = minimal.length - 1; step >= 0; step -= 1) {
    const trimmed = minimal.filter((_, position) => position !== step);
    const remaining = everyOrder.filter((position) =>
      trimmed.every((constraint) => constraint.holds(position)),
    );
    if (remaining.length === 1) minimal.splice(step, 1);
  }
  return minimal.map((item) => item.text);
}

const arrangements = [
  [2, 0, 4, 1, 3],
  [1, 3, 0, 4, 2],
  [4, 2, 1, 3, 0],
  [0, 3, 2, 4, 1],
  [3, 1, 4, 0, 2],
] as const;

export const CONDITION_QUESTIONS: ExampleQuestion[] = nameSets.map((names, index) => {
  const order = arrangements[index % arrangements.length].map((position) => names[position]);
  const askPosition = [0, 4, 2, 1, 3][index % 5];
  const positionName =
    askPosition === 0
      ? "맨 앞"
      : askPosition === names.length - 1
        ? "맨 뒤"
        : `${ORDINALS[askPosition]}`;
  const correct = order[askPosition];
  const conditions = buildOrderConstraints(order, index + 1, askPosition);
  return defineQuestion(CATEGORY, "vr-condition-1", "조건에 따른 순서 배치", index, {
    stem: `다섯 사람이 한 줄로 설 때 ${positionName}에 서는 사람은?`,
    passage: conditions.join("\n"),
    passageLabel: "조건",
    ...rotateChoices(
      correct,
      names.filter((name) => name !== correct),
      index,
    ),
    explanation: `조건을 차례로 좁히면 가능한 줄 세우기는 ${order.join(" → ")} 하나뿐입니다. 따라서 ${positionName}에는 ${subject(correct)} 섭니다.`,
  });
});

const truthScenarios = [
  "분실된 열쇠를 가져간 사람",
  "회의 자료를 수정한 사람",
  "마지막 쿠키를 먹은 사람",
  "실험 장비를 옮긴 사람",
  "예약 시간을 바꾼 사람",
  "보고서를 먼저 제출한 사람",
  "창문을 닫은 사람",
  "프로젝트 파일을 삭제한 사람",
  "택배를 대신 받은 사람",
  "회의실을 예약한 사람",
  "알람을 끈 사람",
  "공용 카드를 사용한 사람",
  "화분에 물을 준 사람",
  "공지문을 게시한 사람",
  "프린터 용지를 채운 사람",
  "냉장고 온도를 조절한 사람",
  "자료실 문을 잠근 사람",
  "일정을 변경한 사람",
  "장비 점검을 완료한 사람",
  "회의록을 작성한 사람",
] as const;

type Claim = { text: string; truth: (culprit: number) => boolean };

/**
 * 네 사람이 같은 사람을 지목하고 한 사람만 다른 이름을 대는 구성은 다수결로 끝나 추리가 되지 않는다.
 * 부인, 지목, 부정, 다른 사람의 진술에 대한 평가를 섞고,
 * 모든 범인 후보를 대입해 조건을 만족하는 경우가 하나뿐인 조합만 문제로 낸다.
 */
function buildTruthCase(names: readonly string[], seed: number) {
  const size = names.length;
  const plans: Array<{ liarCount: number; claims: Claim[] }> = [];
  for (let shift = 0; shift < size; shift += 1) {
    for (let liarCount = 1; liarCount <= 2; liarCount += 1) {
      const claims: Claim[] = [];
      for (let speaker = 0; speaker < size; speaker += 1) {
        const other = (speaker + 1 + shift) % size;
        const another = (speaker + 2 + shift) % size;
        const kind = (speaker + shift + seed) % 4;
        if (kind === 0)
          claims.push({
            text: `${names[speaker]}: “나는 아니다.”`,
            truth: (culprit) => culprit !== speaker,
          });
        else if (kind === 1)
          claims.push({
            text: `${names[speaker]}: “${subject(names[other])} 그 일을 했다.”`,
            truth: (culprit) => culprit === other,
          });
        else if (kind === 2)
          claims.push({
            text: `${names[speaker]}: “${topic(names[another])} 그 일을 하지 않았다.”`,
            truth: (culprit) => culprit !== another,
          });
        else
          claims.push({
            text: `${names[speaker]}: “${names[other]}의 말은 거짓이다.”`,
            truth: (culprit) => !claims[other]?.truth(culprit),
          });
      }
      // 마지막 화자가 아직 만들어지지 않은 진술을 가리키면 판정이 불가능하다.
      const resolvable = claims.every((claim) => {
        try {
          claim.truth(0);
          return true;
        } catch {
          return false;
        }
      });
      if (resolvable) plans.push({ liarCount, claims });
    }
  }

  for (let offset = 0; offset < plans.length; offset += 1) {
    const plan = plans[(seed + offset) % plans.length];
    const consistent: number[] = [];
    for (let culprit = 0; culprit < size; culprit += 1) {
      const liars = plan.claims.filter((claim) => !claim.truth(culprit)).length;
      if (liars === plan.liarCount) consistent.push(culprit);
    }
    if (consistent.length === 1)
      return { culprit: consistent[0], liarCount: plan.liarCount, claims: plan.claims };
  }
  throw new Error(`진실게임 해가 유일하지 않음: ${names.join(",")}`);
}

export const TRUTH_GAME_QUESTIONS: ExampleQuestion[] = truthScenarios.map((scenario, index) => {
  const names = nameSets[index];
  const { culprit, liarCount, claims } = buildTruthCase(names, index);
  const target = names[culprit];
  const liars = claims
    .map((claim, speaker) => ({ speaker, lying: !claim.truth(culprit) }))
    .filter((item) => item.lying)
    .map((item) => names[item.speaker]);
  return defineQuestion(CATEGORY, "vr-truth-1", "진실게임", index, {
    stem: `다섯 사람 중 ${liarCount === 1 ? "한" : "두"} 명만 거짓을 말했다. 실제로 ${topic(scenario)} 누구인가?`,
    passage: claims.map((claim) => claim.text).join("\n"),
    passageLabel: "진술",
    ...rotateChoices(
      target,
      names.filter((name) => name !== target),
      index,
    ),
    explanation: `다섯 사람을 차례로 대입해 보면 ${subject(target)} 한 경우에만 거짓인 진술이 정확히 ${liarCount}개(${liars.join(", ")})가 됩니다. 다른 사람을 대입하면 거짓인 진술의 수가 조건과 맞지 않으므로 답은 ${target}입니다.`,
  });
});

export const LOGIC_EXAMPLE_QUESTIONS = [
  ...PROPOSITION_QUESTIONS,
  ...CONDITION_QUESTIONS,
  ...TRUTH_GAME_QUESTIONS,
];
