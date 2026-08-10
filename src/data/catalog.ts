import type { ProblemVisual } from "../types";

export interface ExampleQuestion {
  id: string;
  categoryId?: string;
  kindId?: string;
  typeLabel?: string;
  stem: string;
  passage: string;
  passageLabel?: string;
  box?: string;
  visuals?: ProblemVisual[];
  choices: string[];
  answer: number;
  explanation: string;
}

export interface ProblemKind {
  id: string;
  name: string;
  description: string;
  tip: string;
  tutorialId: string;
}

export interface Subtype {
  id: string;
  name: string;
  description: string;
  kinds: ProblemKind[];
}

export interface Category {
  id: string;
  number: string;
  name: string;
  description: string;
  color: string;
  subtypes: Subtype[];
  examples: ExampleQuestion[];
}

const kind = (id: string, name: string, description: string, tip: string): ProblemKind => ({
  id,
  name,
  description,
  tip,
  tutorialId: `book-${id}`,
});

const examples: Record<string, ExampleQuestion[]> = {
  verbal: [],
  data: [],
  math: [],
  logic: [],
  sequence: [],
};

export const CATEGORIES: Category[] = [
  {
    id: "verbal-comprehension",
    number: "01",
    name: "언어이해",
    color: "#ea002c",
    description:
      "긴 글에서 중심 내용과 세부 정보를 판단하는 영역입니다. 핵심어와 문장 사이의 관계를 정확히 확인해야 합니다.",
    subtypes: [
      {
        id: "topic",
        name: "주제 찾기",
        description:
          "글 전체의 중심 메시지를 찾는 유형입니다. 반복되는 핵심어와 결론을 먼저 확인해야 합니다.",
        kinds: [
          kind(
            "verbal-topic",
            "주제 판단",
            "첫 문장과 마지막 문장을 연결해 중심 주장을 찾습니다.",
            "선지를 보기 전에 글을 한 문장으로 요약하고, 일부 사례만 담은 선지와 지나치게 넓은 선지를 지웁니다.",
          ),
        ],
      },
      {
        id: "blank",
        name: "빈칸",
        description:
          "문맥에 맞는 내용이나 문장의 위치를 찾는 유형입니다. 빈칸 앞뒤의 연결 표현과 반복되는 말을 확인해야 합니다.",
        kinds: [
          kind(
            "verbal-blank-single",
            "빈칸 한 곳",
            "전후 문맥으로 한 빈칸의 내용을 완성합니다.",
            "빈칸과 가까운 문장의 구체적 설명을 근거로 잡고 글 전체의 결론과 같은 방향인지 확인합니다.",
          ),
          kind(
            "verbal-blank-position",
            "문장 삽입 위치",
            "보기 문장이 들어갈 여러 위치 중 하나를 고릅니다.",
            "보기부터 읽어 접속사와 지시어, 반복 키워드를 표시하고 앞뒤 두 문장이 모두 자연스러운 위치만 남깁니다.",
          ),
        ],
      },
      {
        id: "content-match",
        name: "내용 일치와 불일치",
        description:
          "본문과 선지의 내용이 같은지 판단하는 유형입니다. 수치와 범위, 순서와 서술어의 작은 차이를 놓치지 않아야 합니다.",
        kinds: [
          kind(
            "verbal-match-predicate",
            "서술어와 조건, 표현 차이",
            "행동과 조건이 바뀐 선지를 찾습니다.",
            "선지의 주어보다 서술어와 조건어를 먼저 표시해 본문의 표현과 일대일로 대조합니다.",
          ),
          kind(
            "verbal-match-range",
            "범위와 수치, 시간, 통계 차이",
            "범위나 숫자가 바뀐 선지를 찾습니다.",
            "숫자 옆의 단위와 기준 시점을 함께 묶어 보고 전체와 일부 같은 범위 표현을 반드시 확인합니다.",
          ),
          kind(
            "verbal-match-order",
            "순서 차이",
            "사건이나 절차의 선후가 바뀐 선지를 찾습니다.",
            "본문의 과정을 짧은 화살표로 정리한 뒤 선지의 순서와 비교합니다.",
          ),
          kind(
            "verbal-match-unmentioned",
            "언급되지 않은 내용",
            "본문에 없는 정보를 섞은 선지를 찾습니다.",
            "상식적으로 맞아 보여도 본문에서 근거 문장을 찾지 못하면 미언급으로 판단합니다.",
          ),
        ],
      },
      {
        id: "paragraph-order",
        name: "순서 배열",
        description:
          "여러 문단을 자연스러운 흐름으로 배열하는 유형입니다. 도입 문단을 찾고 지시어와 인과관계를 연결해야 합니다.",
        kinds: [
          kind(
            "verbal-paragraph-order",
            "문단 순서 배열",
            "여러 문단을 자연스러운 흐름으로 배열합니다.",
            "대상을 처음 소개하는 문단을 시작으로 잡고 지시어와 접속사, 원인과 결과를 연결합니다.",
          ),
        ],
      },
      {
        id: "understanding-inference",
        name: "이해와 추론",
        description:
          "본문의 의미를 파악하고 근거를 결합해 결론을 찾는 유형입니다. 글 밖의 상식을 더하지 않고 제시된 내용만 사용해야 합니다.",
        kinds: [
          kind(
            "verbal-understanding",
            "내용 이해",
            "본문에 직접 제시된 의미를 정확히 파악합니다.",
            "선지의 목적어와 서술어를 나눠 본문의 같은 대상과 직접 비교합니다.",
          ),
          kind(
            "verbal-inference",
            "내용 추론",
            "둘 이상의 근거에서 성립하는 결론을 찾습니다.",
            "본문 밖 상식은 배제하고 두 개 이상의 문장이 함께 뒷받침하는 최소한의 결론을 고릅니다.",
          ),
        ],
      },
      {
        id: "counterargument",
        name: "주장 반박",
        description:
          "주장과 근거의 연결을 약화하는 내용을 찾는 유형입니다. 결론이 성립하려면 필요한 전제부터 확인해야 합니다.",
        kinds: [
          kind(
            "verbal-counterargument",
            "반박 판단",
            "주장의 전제나 인과관계를 무너뜨립니다.",
            "결론과 근거를 분리한 뒤, 근거가 같아도 결론이 성립하지 않는 사례를 우선 찾습니다.",
          ),
        ],
      },
    ],
    examples: examples.verbal,
  },
  {
    id: "data-analysis",
    number: "02",
    name: "자료해석",
    color: "#c8755a",
    description:
      "표와 그래프의 수치를 비교하고 계산하는 영역입니다. 필요한 값과 계산 순서를 먼저 정해야 합니다.",
    subtypes: [
      {
        id: "no-calculator",
        name: "계산기 없이 푸는 선지",
        description:
          "자료의 추이와 크기를 계산기 없이 판단하는 유형입니다. 자릿수와 증감 방향을 먼저 확인해야 합니다.",
        kinds: [
          kind(
            "data-trend",
            "증감 추이",
            "기간별 증가와 감소 방향을 판단합니다.",
            "숫자를 입력하지 말고 시작값부터 마우스로 따라가며 방향이 바뀌는 지점만 확인합니다.",
          ),
          kind(
            "data-magnitude",
            "대소 비교",
            "항목 간 크기와 순위를 비교합니다.",
            "앞자리와 자릿수를 먼저 비교하고 비슷한 값만 끝자리까지 확인합니다.",
          ),
          kind(
            "data-simple-sum",
            "단순 합과 차 비교",
            "암산 가능한 합과 차를 비교합니다.",
            "두 값을 더할 때 십의 자리 합으로 후보를 먼저 줄이고 비슷한 항목만 일의 자리까지 계산합니다.",
          ),
          kind(
            "data-easy-rate",
            "쉬운 증감률",
            "10%, 25%, 50%처럼 바로 보이는 비율을 판단합니다.",
            "기준값의 10%와 25%를 먼저 만들어 증가량과 대조합니다.",
          ),
          kind(
            "data-easy-chain",
            "쉬운 3단계 이상 계산",
            "간단한 연산이 이어지는 선지를 처리합니다.",
            "중간값을 정확히 적기보다 약분과 자릿수 생략을 먼저 해 암산 가능한 식으로 줄입니다.",
          ),
        ],
      },
      {
        id: "calculator-fast",
        name: "계산기로 빨리 푸는 선지",
        description:
          "비중과 평균을 짧은 계산으로 구하는 유형입니다. 분자와 분모를 정한 뒤 필요한 값만 입력해야 합니다.",
        kinds: [
          kind(
            "data-share-rate",
            "비중과 증감률",
            "전체 대비 비중이나 전년 대비 증감률을 구합니다.",
            "증감률은 차이÷이전값, 비중은 부분÷전체 순서로 입력하고 선지 정밀도까지만 읽습니다.",
          ),
          kind(
            "data-average",
            "평균",
            "여러 항목의 평균을 구하거나 비교합니다.",
            "기준값을 정한 뒤 각 값의 편차가 서로 상쇄되는지 확인하고 남는 편차만 항목 수로 나눕니다.",
          ),
          kind(
            "data-derived-value",
            "특정값 계산과 비교",
            "자료의 비율로 숨은 실제값을 구합니다.",
            "일부 값과 비율이 주어지면 일부 값을 비율로 나누어 전체값을 구합니다.",
          ),
        ],
      },
      {
        id: "calculator-slow",
        name: "계산이 오래 걸리는 선지",
        description:
          "여러 항목을 반복해서 계산하고 비교하는 유형입니다. 공통값을 재사용하고 계산할 선지의 순서를 정해야 합니다.",
        kinds: [
          kind(
            "data-multi-calculation",
            "반복 계산",
            "연도나 항목별 값을 여러 번 계산합니다.",
            "같은 항목의 구간별 증가액을 한 번씩 계산해 메모하고 여러 판단에 재사용합니다.",
          ),
        ],
      },
    ],
    examples: examples.data,
  },
  {
    id: "creative-math",
    number: "03",
    name: "창의수리",
    color: "#d8a12d",
    description:
      "주어진 상황을 식으로 바꾸어 답을 구하는 영역입니다. 변하지 않는 값과 수량 사이의 관계를 먼저 찾아야 합니다.",
    subtypes: [
      {
        id: "concentration",
        name: "농도",
        description:
          "용액을 섞거나 물과 성분을 더한 뒤 농도를 구하는 유형입니다. 혼합 전후에도 유지되는 성분량을 먼저 계산해야 합니다.",
        kinds: [
          kind(
            "math-concentration-mix",
            "농도 혼합",
            "서로 다른 농도의 용액을 섞습니다.",
            "최종 농도를 사이에 놓고 농도 차이의 반대 비로 두 용액의 양을 배분합니다.",
          ),
          kind(
            "math-concentration-add",
            "물과 성분 첨가",
            "물이나 성분을 더한 뒤 농도를 구합니다.",
            "농도식을 바로 세우지 말고 변하지 않는 소금의 양부터 계산합니다.",
          ),
          kind(
            "math-concentration-ratio",
            "농도 차이와 양",
            "농도 차이와 용액량의 반비례를 활용합니다.",
            "최종 농도와 각 농도의 차이를 구해 교차 비율로 놓으면 연립방정식을 피할 수 있습니다.",
          ),
        ],
      },
      {
        id: "population-change",
        name: "인원 수 변동",
        description:
          "두 집단의 인원 변화로 원래 인원이나 변동 후 인원을 구하는 유형입니다. 전체 인원과 증감 후 인원을 각각 식으로 세워야 합니다.",
        kinds: [
          kind(
            "math-population-equation",
            "연립방정식",
            "두 집단의 합과 증감 후 합을 식으로 만듭니다.",
            "집단을 A, B로 두고 전체 식과 증감 후 식을 세운 뒤 계수를 맞춰 하나를 소거합니다.",
          ),
          kind(
            "math-population-multiple",
            "배수 판정",
            "정수 조건으로 가능한 선지를 빠르게 거릅니다.",
            "20% 증가한 결과는 원래 인원의 6/5이므로 조정 뒤 인원이 6의 배수인지 먼저 확인합니다.",
          ),
        ],
      },
      {
        id: "price",
        name: "원가와 정가, 판매가",
        description:
          "원가와 정가, 판매가의 관계를 구하는 유형입니다. 할인율과 이익률의 기준 금액을 구분해야 합니다.",
        kinds: [
          kind(
            "math-price-profit",
            "할인과 이익",
            "원가와 정가, 판매가의 관계를 계산합니다.",
            "이익률의 기준은 원가이므로 원가에 1과 이익률의 합을 곱해 판매가를 구합니다.",
          ),
        ],
      },
      {
        id: "counting",
        name: "경우의 수",
        description:
          "선택하거나 배치할 수 있는 경우의 수를 구하는 유형입니다. 순서의 유무와 동시에 일어나는 조건을 먼저 구분해야 합니다.",
        kinds: [
          kind(
            "math-count-sum-product",
            "합의 법칙과 곱의 법칙",
            "동시에 일어나는지 나뉘어 일어나는지 구분합니다.",
            "경우가 서로 겹치지 않으면 더하고, 단계가 연속되면 각 단계의 수를 곱합니다.",
          ),
          kind(
            "math-count-factorial",
            "일렬 배열",
            "서로 다른 대상을 한 줄로 세웁니다.",
            "n명을 모두 세우면 n!이고, 고정 자리가 있으면 그 자리를 제외한 대상만 팩토리얼로 계산합니다.",
          ),
          kind(
            "math-count-permutation",
            "순열",
            "일부를 뽑아 순서 있게 배치합니다.",
            "뽑힌 순서가 결과를 바꾸면 조합이 아니라 nPr을 사용합니다.",
          ),
          kind(
            "math-count-combination",
            "조합",
            "순서 없이 일부를 선택합니다.",
            "선정 순서가 달라도 같은 팀이면 nCr로 계산하고 중복 집계를 하지 않습니다.",
          ),
          kind(
            "math-count-bundle",
            "묶음 배치",
            "붙거나 일정 간격을 둔 대상을 묶어 셉니다.",
            "붙어야 하는 대상을 한 덩어리로 보고 전체 덩어리를 배열한 뒤 묶음 내부 순서를 곱합니다.",
          ),
          kind(
            "math-count-separated",
            "서로 붙지 않는 배치",
            "특정 대상들이 이웃하지 않게 배치합니다.",
            "전체 배열에서 제한 대상이 붙어 있는 배열을 빼면 서로 붙지 않는 배열을 빠르게 구할 수 있습니다.",
          ),
          kind(
            "math-count-group",
            "조 배정",
            "사람을 여러 조로 나눕니다.",
            "조 이름 유무를 확인하고 이름 없는 같은 크기 조라면 조의 순서만큼 다시 나눕니다.",
          ),
          kind(
            "math-count-select",
            "특정인 선정",
            "반드시 포함되거나 제외되는 사람 조건을 처리합니다.",
            "적어도 한 명 조건은 전체에서 한 명도 뽑히지 않는 여사건을 빼는 방식이 빠릅니다.",
          ),
          kind(
            "math-count-circle",
            "원순열",
            "원형으로 앉는 배치를 계산합니다.",
            "회전해 같은 배열을 하나로 보므로 한 명을 고정하고 나머지만 배열합니다.",
          ),
        ],
      },
      {
        id: "probability",
        name: "확률",
        description:
          "전체 경우 중 조건을 만족하는 경우의 비율을 구하는 유형입니다. 직접 세기 복잡하면 반대 사건부터 확인해야 합니다.",
        kinds: [
          kind(
            "math-probability-basic",
            "조건에 해당하는 확률",
            "전체 경우 중 조건을 만족하는 경우를 셉니다.",
            "직접 세기 복잡하면 반대 사건을 구해 전체에서 빼는 여사건을 먼저 검토합니다.",
          ),
          kind(
            "math-probability-conditional",
            "조건부 확률",
            "이미 주어진 조건 안에서 다시 확률을 구합니다.",
            "분모를 전체가 아니라 주어진 조건을 만족하는 경우로 바꾼 뒤 교집합을 분자로 둡니다.",
          ),
        ],
      },
      {
        id: "distance-speed-time",
        name: "거리와 속력, 시간",
        description:
          "거리와 속력, 시간의 관계를 이용하는 유형입니다. 이동 방향에 따라 속력의 합과 차를 구분해야 합니다.",
        kinds: [
          kind(
            "math-distance-same",
            "같은 거리",
            "왕복처럼 거리가 같은 이동을 비교합니다.",
            "거리=속력×시간에서 공통 거리를 지우고 속력과 시간의 반비례만 비교합니다.",
          ),
          kind(
            "math-distance-train",
            "기차와 터널",
            "기차가 터널이나 사람을 통과하는 시간을 구합니다.",
            "기차가 터널을 완전히 통과할 때 이동 거리는 기차 길이와 터널 길이의 합입니다.",
          ),
          kind(
            "math-distance-relative",
            "만남과 추월",
            "두 대상의 상대속력으로 시간을 구합니다.",
            "반대 방향은 속력을 더하고 같은 방향 추월은 속력 차이를 사용합니다.",
          ),
        ],
      },
      {
        id: "work-rate",
        name: "일률",
        description:
          "여러 대상이 일을 끝내는 시간을 구하는 유형입니다. 전체 작업량을 정하고 각 대상의 시간당 작업량을 계산해야 합니다.",
        kinds: [
          kind(
            "math-work-single",
            "단독 작업",
            "한 대상의 작업 속도를 구합니다.",
            "전체 작업량을 1로 놓고 완료 시간으로 나누면 하루 작업량을 바로 구할 수 있습니다.",
          ),
          kind(
            "math-work-together",
            "협력 작업",
            "여러 대상이 함께 일하는 시간을 구합니다.",
            "각자의 단위 시간당 작업량을 더한 뒤 전체 작업량을 합산 속도로 나눕니다.",
          ),
          kind(
            "math-work-partial",
            "부분 작업",
            "중간에 합류하거나 이탈하는 상황을 계산합니다.",
            "구간을 나눠 이미 끝낸 작업량을 먼저 빼고 남은 양만 다음 속도로 계산합니다.",
          ),
          kind(
            "math-work-capacity",
            "역량 차이",
            "사람이나 기계별 효율 차이를 반영합니다.",
            "기준 대상의 일률을 1로 놓고 배수 관계로 바꾼 뒤 총 일률을 계산합니다.",
          ),
        ],
      },
      {
        id: "other-math",
        name: "기타 응용수리",
        description:
          "나이와 과부족 조건을 식으로 바꾸는 유형입니다. 같은 시점의 수량끼리 비교하고 마지막 묶음의 조건을 확인해야 합니다.",
        kinds: [
          kind(
            "math-age",
            "나이",
            "현재와 과거, 미래의 나이 관계를 구합니다.",
            "현재 나이를 변수로 두고 몇 년 후에는 두 사람 모두 같은 수만큼 더해진다는 점을 식에 반영합니다.",
          ),
          kind(
            "math-shortage-surplus",
            "과부족",
            "의자나 텐트의 남고 모자라는 조건을 풉니다.",
            "전체 인원을 두 방식으로 각각 표현해 같은 값으로 놓고, 마지막 묶음의 인원 조건을 빠뜨리지 않습니다.",
          ),
        ],
      },
    ],
    examples: examples.math,
  },
  {
    id: "verbal-reasoning",
    number: "04",
    name: "언어추리",
    color: "#5f8f6b",
    description:
      "명제와 여러 조건을 연결해 반드시 참인 결론을 찾는 영역입니다. 조건을 짧게 기호화하고 확정되는 정보부터 정리해야 합니다.",
    subtypes: [
      {
        id: "proposition",
        name: "명제",
        description:
          "여러 명제를 연결해 결론이나 빠진 전제를 찾는 유형입니다. 모든 명제의 방향과 어떤 명제의 존재 관계를 구분해야 합니다.",
        kinds: [
          kind(
            "logic-conclusion-blank",
            "결론 빈칸",
            "두 전제를 연결해 결론을 완성합니다.",
            "두 전제에서 공통으로 등장하는 중간 개념을 지우고 남은 작은 집합과 큰 집합을 연결합니다.",
          ),
          kind(
            "logic-premise-small",
            "전제 빈칸 작은 것 겹침",
            "결론의 작은 집합이 전제와 겹치는 경우를 풉니다.",
            "결론에서 작은 집합을 먼저 찾아 같은 출발점을 가진 전제를 대입합니다.",
          ),
          kind(
            "logic-premise-large",
            "전제 빈칸 큰 것 겹침",
            "결론의 큰 집합이 전제와 겹치는 경우를 풉니다.",
            "도착 집합을 고정하고 그 집합으로 이어지는 화살표의 시작점을 역으로 찾습니다.",
          ),
          kind(
            "logic-chain",
            "복수 명제 연결",
            "2~5개의 명제를 연쇄적으로 연결합니다.",
            "현재 참이라고 확정된 명제에서 시작해 화살표 방향으로 연결하고 필요한 경우에만 대우를 사용합니다.",
          ),
          kind(
            "logic-some-amo",
            "어떤–모든 명제 연결",
            "어떤 두 개와 모든 한 개가 포함된 관계를 판단합니다.",
            "어떤의 존재 관계를 먼저 표시하고, 모든 명제가 그 관계를 확장할 때만 결론을 확정합니다.",
          ),
          kind(
            "logic-some-mmo",
            "전칭 명제와 존재 조건",
            "모든 두 개와 어떤 한 개가 포함된 관계를 판단합니다.",
            "모든 관계의 방향을 먼저 하나로 연결한 뒤 어떤 대상이 놓일 수 있는 범위를 확인합니다.",
          ),
        ],
      },
      {
        id: "conditional",
        name: "조건추리",
        description:
          "순서와 자리, 숫자와 참거짓 조건을 만족하도록 배치하는 유형입니다. 고정 조건과 불가능한 경우를 먼저 표시해야 합니다.",
        kinds: [
          kind(
            "logic-linear",
            "일렬 배치",
            "순서나 자리를 일렬로 정합니다.",
            "선후 관계를 하나의 연결 묶음으로 만들고 바로 앞뒤 조건과 고정 자리부터 배치합니다.",
          ),
          kind(
            "logic-item",
            "항목 배치",
            "요일이나 그룹별로 대상을 배치합니다.",
            "표의 행과 열을 먼저 만들고, 고정 대상과 불가능한 칸부터 표시합니다.",
          ),
          kind(
            "logic-number",
            "숫자 배치",
            "각 대상에게 서로 다른 숫자를 할당합니다.",
            "최댓값과 최솟값, 합 조건으로 가능한 범위를 줄인 뒤 남은 숫자를 배치합니다.",
          ),
          kind(
            "logic-truth",
            "거짓말",
            "참말과 거짓말 관계를 판단합니다.",
            "같은 말과 반대 말을 한 사람을 먼저 묶고, 한 진술만 가정해 전체 모순 여부를 확인합니다.",
          ),
        ],
      },
    ],
    examples: examples.logic,
  },
  {
    id: "sequence-reasoning",
    number: "05",
    name: "수열추리",
    color: "#6f6aa8",
    description:
      "수의 변화 규칙을 찾아 빈칸이나 다음 항을 구하는 영역입니다. 차이와 비율을 먼저 보고 반복되는 연산을 확인해야 합니다.",
    subtypes: [
      {
        id: "integer-sequence",
        name: "정수 수열",
        description:
          "정수 사이의 규칙을 찾아 다음 수를 구하는 유형입니다. 인접한 항의 차이와 비율을 차례로 확인해야 합니다.",
        kinds: [
          kind(
            "sequence-arithmetic",
            "등차수열",
            "항 사이에 같은 수를 더하거나 뺍니다.",
            "인접한 항의 차이를 먼저 적고 일정하면 즉시 다음 항에 적용합니다.",
          ),
          kind(
            "sequence-geometric",
            "등비수열",
            "항 사이에 같은 수를 곱하거나 나눕니다.",
            "값이 빠르게 커지거나 작아지면 차이보다 먼저 앞 항으로 나눈 비율을 확인합니다.",
          ),
          kind(
            "sequence-difference",
            "계차수열",
            "항의 차이가 다시 일정한 규칙을 가집니다.",
            "첫 번째 차이가 일정하지 않으면 차이끼리 다시 빼 두 번째 계차를 확인합니다.",
          ),
          kind(
            "sequence-power",
            "제곱수와 세제곱수",
            "제곱수나 세제곱수의 변형을 찾습니다.",
            "4, 9, 16, 25처럼 익숙한 제곱수 근처의 ±1 변형인지 먼저 봅니다.",
          ),
          kind(
            "sequence-factorial",
            "팩토리얼",
            "1!, 2!, 3!처럼 곱이 누적되는 규칙을 찾습니다.",
            "항 사이의 비율이 2, 3, 4처럼 커지면 팩토리얼을 의심합니다.",
          ),
          kind(
            "sequence-fibonacci",
            "피보나치",
            "앞의 두 항을 이용해 다음 항을 만듭니다.",
            "세 번째 항부터 앞 두 수의 합이나 차인지 확인하고 같은 연산이 반복되는지 봅니다.",
          ),
          kind(
            "sequence-mixed",
            "혼합 계산",
            "덧셈과 곱셈 등 둘 이상의 연산이 반복됩니다.",
            "한 연산으로 설명되지 않으면 ×a±b 형태를 작은 정수부터 대입합니다.",
          ),
        ],
      },
      {
        id: "fraction-decimal",
        name: "분수와 소수 수열",
        description:
          "분수나 소수의 변화 규칙을 찾는 유형입니다. 분자와 분모, 정수부와 소수부를 나누어 확인해야 합니다.",
        kinds: [
          kind(
            "sequence-fraction",
            "분수 수열",
            "분자와 분모의 규칙을 따로 찾습니다.",
            "분수를 섣불리 소수로 바꾸지 말고 분자와 분모를 두 개의 수열로 나눠 봅니다.",
          ),
          kind(
            "sequence-decimal",
            "소수 수열",
            "정수부와 소수부 또는 자릿수 이동을 확인합니다.",
            "소수점을 유지한 채 앞 항으로 나눈 비율을 확인하고 같은 배수가 반복되는지 봅니다.",
          ),
        ],
      },
    ],
    examples: examples.sequence,
  },
];

const markers = ["①", "②", "③", "④", "⑤"];
export const choiceMarker = (index: number) => markers[index] ?? String(index + 1);
