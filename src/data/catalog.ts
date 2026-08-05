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
        tutorialId: "single-blank",
        tutorialIds: ["main-idea-claim", "main-idea-title"],
      },
      {
        id: "content-match",
        name: "일치와 불일치",
        description: "선지와 지문의 세부 정보 비교가 중요합니다.",
        tip: "선지의 주체, 수치, 조건을 지문과 하나씩 비교합니다.",
        tutorialId: "single-blank",
        tutorialIds: ["content-match-correct", "content-match-incorrect"],
      },
      {
        id: "inference",
        name: "추론",
        description: "지문 속 근거를 연결하는 과정이 중요합니다.",
        tip: "지문 밖의 상식은 제외하고 확인된 근거만 연결합니다.",
        tutorialId: "single-blank",
        tutorialIds: ["inference-conclusion", "inference-attitude"],
      },
      {
        id: "blank-inference",
        name: "빈칸 채우기",
        description: "빈칸 앞뒤의 문맥과 흐름 파악이 중요합니다.",
        tip: "빈칸 뒤의 구체적인 설명을 정답 근거로 씁니다.",
        tutorialId: "single-blank",
        tutorialIds: ["blank-one", "blank-two"],
      },
      {
        id: "paragraph-order",
        name: "문단 배열",
        description: "접속어와 지시어 같은 연결 단서가 중요합니다.",
        tip: "독립적인 도입 문장을 먼저 찾고 연결 단서를 확인합니다.",
        tutorialId: "insertion",
        tutorialIds: ["order-three", "order-insertion"],
      },
      {
        id: "critique",
        name: "비판 및 평가",
        description: "주장의 전제와 논리적 허점 파악이 중요합니다.",
        tip: "결론이 성립하려면 반드시 필요한 전제를 찾습니다.",
        tutorialId: "single-blank",
        tutorialIds: ["critique-weaken", "critique-assumption"],
      },
      {
        id: "case-judgment",
        name: "사례 판단",
        description: "글의 원리와 사례의 공통점 파악이 중요합니다.",
        tip: "사례의 표면보다 원문과 공유하는 판단 기준을 찾습니다.",
        tutorialId: "single-blank",
        tutorialIds: ["case-application", "case-counterexample"],
      },
      {
        id: "writing-method",
        name: "서술 방식",
        description: "문단마다 맡고 있는 역할 파악이 중요합니다.",
        tip: "각 문단이 설명, 사례, 반론 중 어떤 역할인지 표시합니다.",
        tutorialId: "insertion",
        tutorialIds: ["writing-development", "writing-role"],
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
        tutorialId: "single-blank",
      },
      {
        id: "data-calculation",
        name: "자료계산",
        description: "필요한 값만 골라 정확히 계산하는 것이 중요합니다.",
        tip: "정확한 계산 전에 선지 간격으로 어림값을 확인합니다.",
        tutorialId: "single-blank",
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
        tutorialId: "single-blank",
      },
      {
        id: "distance-speed-time",
        name: "거리, 속력, 시간",
        description: "단위를 맞추고 세 값의 관계를 세우는 것이 중요합니다.",
        tip: "거리=속력×시간 관계를 기준으로 같은 단위부터 맞춥니다.",
        tutorialId: "single-blank",
      },
      {
        id: "concentration-ratio",
        name: "농도와 비율",
        description: "변하지 않는 성분량을 찾는 것이 중요합니다.",
        tip: "변하지 않는 전체량이나 성분량을 먼저 찾습니다.",
        tutorialId: "single-blank",
      },
      {
        id: "counting-probability",
        name: "경우의 수와 확률",
        description: "순서와 중복 가능 여부를 구분하는 것이 중요합니다.",
        tip: "순서 고려 여부와 중복 가능 여부를 먼저 확인합니다.",
        tutorialId: "single-blank",
      },
      {
        id: "work-rate",
        name: "작업량",
        description: "대상별 작업 속도를 하나로 합치는 것이 중요합니다.",
        tip: "전체 작업량을 최소공배수로 두면 일률 계산이 단순해집니다.",
        tutorialId: "single-blank",
      },
      {
        id: "cost",
        name: "비용",
        description: "기준 금액과 비율의 적용 순서가 중요합니다.",
        tip: "기준 금액을 100으로 놓고 비율 변화를 순서대로 적용합니다.",
        tutorialId: "single-blank",
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
        tip: "모든, 어떤, 아닌의 범위를 기호로 단순화합니다.",
        tutorialId: "insertion",
      },
      {
        id: "line-order",
        name: "조건추리 줄 세우기",
        description: "확정되는 앞뒤 관계부터 연결하는 것이 중요합니다.",
        tip: "확정되는 앞뒤 관계를 하나의 연결 묶음으로 만듭니다.",
        tutorialId: "insertion",
      },
      {
        id: "table-matching",
        name: "조건추리 테이블",
        description: "불가능한 조합부터 지우는 것이 중요합니다.",
        tip: "불가능한 칸부터 지우고 하나만 남는 행과 열을 찾습니다.",
        tutorialId: "insertion",
      },
      {
        id: "possible-impossible",
        name: "조건추리 가능 여부",
        description: "금지 조건을 먼저 확인하는 것이 중요합니다.",
        tip: "금지 조건을 먼저 표시하면 가능한 경우가 빠르게 줄어듭니다.",
        tutorialId: "insertion",
      },
      {
        id: "grid-arrangement",
        name: "조건추리 격자 배치",
        description: "제약이 많은 위치부터 채우는 것이 중요합니다.",
        tip: "모서리, 중앙, 인접 칸처럼 제약이 큰 위치부터 채웁니다.",
        tutorialId: "insertion",
      },
      {
        id: "information-organizing",
        name: "조건추리 정보정리",
        description: "흩어진 조건을 한눈에 정리하는 것이 중요합니다.",
        tip: "같이 움직이는 조건과 서로 배제되는 조건을 구분합니다.",
        tutorialId: "insertion",
      },
      {
        id: "truth-game-basic",
        name: "진실게임 기본",
        description: "한 진술을 가정하고 모순을 확인하는 것이 중요합니다.",
        tip: "진술 하나를 참으로 가정한 뒤 전체 조건의 모순을 확인합니다.",
        tutorialId: "insertion",
      },
      {
        id: "truth-game-assumption",
        name: "진실게임 참 거짓 가정",
        description: "가정마다 발생하는 모순을 기록하는 것이 중요합니다.",
        tip: "가정마다 모순이 발생하는 지점을 표로 기록합니다.",
        tutorialId: "insertion",
      },
      {
        id: "truth-game-multiple",
        name: "진실게임 복수 진술",
        description: "사람별 진술과 참인 문장의 수 정리가 중요합니다.",
        tip: "사람별 진술을 묶고 참인 진술의 개수를 먼저 계산합니다.",
        tutorialId: "insertion",
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
        tutorialId: "insertion",
      },
      {
        id: "various-sequences",
        name: "여러 가지 수열",
        description: "수열을 나누어 여러 규칙을 확인하는 것이 중요합니다.",
        tip: "홀수 번째와 짝수 번째 항을 나누고 차이의 차이도 확인합니다.",
        tutorialId: "insertion",
      },
      {
        id: "special-sequences",
        name: "특수 규칙 수열",
        description: "익숙한 수와 반복되는 계산 확인이 중요합니다.",
        tip: "익숙한 규칙이 없으면 항을 묶어 반복되는 계산 순서를 찾습니다.",
        tutorialId: "insertion",
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
