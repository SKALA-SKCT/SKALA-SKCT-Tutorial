export interface ExampleQuestion {
  id: string;
  stem: string;
  passage: string;
  choices: string[];
  answer: number;
  explanation: string;
}

export interface Subtype {
  id: string;
  name: string;
  description: string;
  tip: string;
  tutorialId: string;
  tutorialIds?: string[];
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

const markers = ["①", "②", "③", "④", "⑤"];

export const CATEGORIES: Category[] = [
  {
    id: "verbal-comprehension",
    number: "01",
    name: "언어이해",
    color: "#ea002c",
    description: "지문의 핵심 주장과 문장 사이의 논리 관계를 정확히 파악해야 합니다.",
    subtypes: [
      {
        id: "main-idea",
        name: "주제 파악",
        description: "글 전체를 대표하는 중심 주장 파악이 중요합니다.",
        tip: "첫 문장과 결론 문장을 연결해 한 문장으로 요약합니다.",
        tutorialId: "vc-main-idea-1",
        tutorialIds: ["vc-main-idea-1"],
      },
      {
        id: "content-match",
        name: "일치와 불일치",
        description: "선지와 지문의 세부 정보 비교가 중요합니다.",
        tip: "선지의 주체, 수치, 조건을 지문과 하나씩 비교합니다.",
        tutorialId: "vc-content-match-1",
        tutorialIds: ["vc-content-match-1"],
      },
      {
        id: "inference",
        name: "추론",
        description: "본문과 선지를 대조해 적절하지 않은 추론을 가려내는 것이 중요합니다.",
        tip: "선지 키워드를 먼저 잡고, 본문에 없거나 반대·과장된 선지를 걸러냅니다.",
        tutorialId: "vc-inference-1",
        tutorialIds: ["vc-inference-1"],
      },
      {
        id: "blank-inference",
        name: "빈칸 채우기",
        description: "빈칸 앞뒤의 문맥과 흐름 파악이 중요합니다.",
        tip: "빈칸 뒤의 구체적인 설명을 정답 근거로 씁니다.",
        tutorialId: "vc-blank-1",
        tutorialIds: ["vc-blank-1"],
      },
      {
        id: "paragraph-order",
        name: "문단 배열",
        description: "접속어와 지시어 같은 연결 단서가 중요합니다.",
        tip: "독립적인 도입 문장을 먼저 찾고 연결 단서를 확인합니다.",
        tutorialId: "vc-paragraph-order-1",
        tutorialIds: ["vc-paragraph-order-1"],
      },
      {
        id: "sentence-insertion",
        name: "문장 삽입",
        description: "<보기> 문장이 들어갈 위치를 (A)~(E)에서 고르는 유형입니다.",
        tip: "<보기>의 접속어·지시어를 먼저 읽고 앞에 올 내용을 예측합니다.",
        tutorialId: "vc-insertion-1",
        tutorialIds: ["vc-insertion-1"],
      },
      {
        id: "critique",
        name: "비판 및 평가",
        description: "글의 중심 주장을 파악하고 이를 반박하는 내용을 찾는 것이 중요합니다.",
        tip: "찬성·무관한 선지를 걸러내고 주장의 한계·문제점을 지적하는 선지를 고릅니다.",
        tutorialId: "vc-critique-1",
        tutorialIds: ["vc-critique-1"],
      },
    ],
    examples: [
      {
        id: "v1",
        stem: "밑줄 친 표현과 의미가 가장 가까운 것은?",
        passage: "새 제도는 단기 성과보다 장기적인 안목에서 접근해야 한다.",
        choices: ["즉흥적인 판단", "넓고 먼 관점", "과거의 경험", "엄격한 기준", "빠른 실행"],
        answer: 1,
        explanation: "‘장기적인 안목’은 현재보다 먼 미래까지 내다보는 넓은 관점을 뜻합니다.",
      },
      {
        id: "v2",
        stem: "문맥상 빈칸에 가장 적절한 말은?",
        passage: "자료가 충분하지 않을 때는 결론을 서두르기보다 판단을 (   )해야 한다.",
        choices: ["유보", "강화", "반복", "공개", "확정"],
        answer: 0,
        explanation: "자료가 부족하므로 판단을 미루어 두는 ‘유보’가 자연스럽습니다.",
      },
    ],
  },
  {
    id: "data-analysis",
    number: "02",
    name: "자료해석",
    color: "#c8755a",
    description: "표와 그래프에서 필요한 수치를 찾아 비교하고 계산해야 합니다.",
    subtypes: [
      {
        id: "data-reading",
        name: "자료이해",
        description: "단위와 기준 시점을 먼저 확인하는 것이 중요합니다.",
        tip: "단위와 기준 시점을 먼저 확인하고 선지별로 필요한 값만 찾습니다.",
        tutorialId: "da-reading-1",
      },
      {
        id: "data-calculation",
        name: "자료계산",
        description: "필요한 값만 골라 정확히 계산하는 것이 중요합니다.",
        tip: "정확한 계산 전에 선지 간격으로 어림값을 확인합니다.",
        tutorialId: "da-calc-1",
      },
    ],
    examples: [
      {
        id: "d1",
        stem: "다음 자료에 대한 설명으로 옳은 것은?",
        passage:
          "A제품 판매량: 2024년 120개, 2025년 150개\nB제품 판매량: 2024년 200개, 2025년 220개",
        choices: [
          "A제품은 20% 증가했다",
          "A제품은 25% 증가했다",
          "B제품은 20% 증가했다",
          "2025년 두 제품의 합은 350개다",
          "두 제품의 증가량은 같다",
        ],
        answer: 1,
        explanation:
          "A제품은 120개에서 150개로 30개 증가했으며, 증가율은 30을 120으로 나눈 25%입니다.",
      },
      {
        id: "d2",
        stem: "다음 자료에서 2025년 전체 인원은?",
        passage:
          "2024년 전체 인원은 500명이다. 2025년 남성 300명은 전년보다 20% 증가했고, 여성 인원은 전년보다 10% 감소했다.",
        choices: ["500명", "510명", "525명", "540명", "550명"],
        answer: 2,
        explanation:
          "2024년 남성은 250명, 여성은 250명입니다. 2025년 여성은 225명이므로 전체는 525명입니다.",
      },
    ],
  },
  {
    id: "creative-math",
    number: "03",
    name: "창의수리",
    color: "#d8a12d",
    description: "문제의 조건을 식으로 바꾸어 필요한 값을 효율적으로 구해야 합니다.",
    subtypes: [
      {
        id: "arithmetic",
        name: "사칙연산",
        description: "계산 순서를 단순하게 정리하는 것이 중요합니다.",
        tip: "복잡한 조건을 미지수 하나로 정리하고 계산 순서를 단순화합니다.",
        tutorialId: "cm-arithmetic-1",
      },
      {
        id: "distance-speed-time",
        name: "거리, 속력, 시간",
        description: "단위를 맞추고 세 값의 관계를 세우는 것이 중요합니다.",
        tip: "거리=속력×시간 관계를 기준으로 같은 단위부터 맞춥니다.",
        tutorialId: "cm-dst-1",
      },
      {
        id: "concentration-ratio",
        name: "농도와 비율",
        description: "변하지 않는 성분량을 찾는 것이 중요합니다.",
        tip: "변하지 않는 전체량이나 성분량을 먼저 찾습니다.",
        tutorialId: "cm-concentration-1",
      },
      {
        id: "counting-probability",
        name: "경우의 수와 확률",
        description: "순서와 중복 가능 여부를 구분하는 것이 중요합니다.",
        tip: "순서 고려 여부와 중복 가능 여부를 먼저 확인합니다.",
        tutorialId: "cm-probability-1",
      },
      {
        id: "work-rate",
        name: "작업량",
        description: "대상별 작업 속도를 하나로 합치는 것이 중요합니다.",
        tip: "전체 작업량을 최소공배수로 두면 일률 계산이 단순해집니다.",
        tutorialId: "cm-work-1",
      },
      {
        id: "cost",
        name: "비용",
        description: "기준 금액과 비율의 적용 순서가 중요합니다.",
        tip: "기준 금액을 100으로 놓고 비율 변화를 순서대로 적용합니다.",
        tutorialId: "cm-cost-1",
      },
    ],
    examples: [
      {
        id: "m1",
        stem: "10% 소금물 300g에 물 200g을 넣으면 농도는?",
        passage: "소금의 양은 변하지 않는다고 가정한다.",
        choices: ["4%", "5%", "6%", "8%", "10%"],
        answer: 2,
        explanation: "소금은 30g이고 전체 소금물은 500g이므로 농도는 6%입니다.",
      },
      {
        id: "m2",
        stem: "A가 혼자 6일, B가 혼자 3일 걸리는 일을 함께하면 며칠이 걸리는가?",
        passage: "두 사람의 하루 작업량은 일정하다.",
        choices: ["1일", "2일", "3일", "4일", "4.5일"],
        answer: 1,
        explanation: "하루 작업량은 A가 1/6, B가 1/3이고 합은 1/2이므로 2일이 걸립니다.",
      },
    ],
  },
  {
    id: "verbal-reasoning",
    number: "04",
    name: "언어추리",
    color: "#5f8f6b",
    description: "여러 명제와 조건을 논리적으로 연결해 가능한 결론을 찾아야 합니다.",
    subtypes: [
      {
        id: "proposition",
        name: "명제추리",
        description: "명제의 범위와 대우 관계 파악이 중요합니다.",
        tip: "확정된 전제부터 찾아 대우를 이용해 전제들을 연쇄로 잇습니다.",
        tutorialId: "vr-proposition-1",
      },
      {
        id: "condition-reasoning",
        name: "조건추리",
        description: "조건을 기호로 정리하고 확정되는 관계부터 연결하는 것이 중요합니다.",
        tip: "순서 문제는 맨 앞·맨 뒤에 못 오는 사람을 지워 자리를 좁힙니다.",
        tutorialId: "vr-condition-1",
      },
      {
        id: "truth-game",
        name: "진실게임",
        description: "진술 사이의 동일·반대 관계를 잡고 경우를 나눠 판단하는 것이 중요합니다.",
        tip: "참·거짓을 항목으로 바꾸고, 한 사람을 가정해 경우를 만든 뒤 항상 참인 선지를 고릅니다.",
        tutorialId: "vr-truth-1",
      },
    ],
    examples: [
      {
        id: "l1",
        stem: "다음 조건에서 반드시 세 번째인 사람은?",
        passage:
          "A, B, C, D가 한 줄로 선다. A는 B보다 앞선다. C는 B의 바로 뒤에 선다. D는 A보다 앞선다.",
        choices: ["A", "B", "C", "D", "결정할 수 없음"],
        answer: 1,
        explanation: "가능한 순서는 D-A-B-C뿐이므로 세 번째는 B입니다.",
      },
      {
        id: "l2",
        stem: "거짓말을 한 사람은?",
        passage:
          "A: B가 범인이다. B: C가 범인이다. C: 나는 범인이 아니다. 세 사람 중 범인은 한 명이고 범인만 거짓말을 한다.",
        choices: ["A", "B", "C", "A와 B", "결정할 수 없음"],
        answer: 1,
        explanation:
          "B가 범인이라면 B의 말은 거짓이고 A와 C의 말은 참이 되어 모든 조건을 만족합니다.",
      },
    ],
  },
  {
    id: "sequence-reasoning",
    number: "05",
    name: "수열추리",
    color: "#6f6aa8",
    description: "숫자의 반복과 변화 규칙을 발견해 빈칸이나 다음 항을 구해야 합니다.",
    subtypes: [
      {
        id: "arithmetic-geometric",
        name: "등차수열과 등비수열",
        description: "항 사이의 차이와 비율 확인이 중요합니다.",
        tip: "먼저 항 사이의 차이를 보고 일정하지 않으면 비율을 확인합니다.",
        tutorialId: "sr-arithgeo-1",
      },
      {
        id: "various-sequences",
        name: "여러 가지 수열",
        description: "수열을 나누어 여러 규칙을 확인하는 것이 중요합니다.",
        tip: "홀수 번째와 짝수 번째 항을 나누고 차이의 차이도 확인합니다.",
        tutorialId: "sr-various-1",
      },
      {
        id: "special-sequences",
        name: "특수 규칙 수열",
        description: "익숙한 수와 반복되는 계산 확인이 중요합니다.",
        tip: "익숙한 규칙이 없으면 항을 묶어 반복되는 계산 순서를 찾습니다.",
        tutorialId: "sr-special-1",
      },
    ],
    examples: [
      {
        id: "s1",
        stem: "다음 수열의 빈칸에 들어갈 수는?",
        passage: "3, 7, 11, 15, (   )",
        choices: ["17", "18", "19", "20", "21"],
        answer: 2,
        explanation: "앞 항에 4를 더하는 등차수열이므로 다음 수는 19입니다.",
      },
      {
        id: "s2",
        stem: "다음 수열의 빈칸에 들어갈 수는?",
        passage: "2, 5, 4, 10, 6, 15, 8, (   )",
        choices: ["16", "18", "20", "22", "24"],
        answer: 2,
        explanation: "홀수 번째 항은 2, 4, 6, 8이고 짝수 번째 항은 5, 10, 15, 20입니다.",
      },
    ],
  },
];

export const choiceMarker = (index: number) => markers[index] ?? String(index + 1);
