import type { Problem } from "../../types";
import { defineTutorial } from "../tutorialBuilder";

/**
 * 창의수리 (Creative math) guided tutorials.
 *
 * These are word problems: the question lives in `stem`, `passage` is empty,
 * and each step narrates one part of the worked solution. The final step
 * highlights the answer choice and reveals it.
 */
export const CREATIVE_MATH_TUTORIALS: Problem[] = [
  defineTutorial({
    id: "cm-concentration-1",
    internalTypeName: "농도(소금물 혼합) 계산",
    strategy:
      "농도 문제는 ‘용질(소금·설탕)의 양은 섞기 전후가 같다’가 핵심이에요. 두 용액을 섞을 때는 공식 (C1−C3)×W1 = (C3−C2)×W2 (C3=최종 농도, W=양)를 쓰면 빠릅니다. 즉 ‘각 농도와 최종 농도의 차 × 양’이 서로 같습니다.",
    stem: "설탕 함유율이 30%인 A사 설탕물 600g과 B사 설탕물 400g을 섞었더니 설탕 함유율이 26%인 설탕물이 되었다고 할 때, B사 설탕물의 설탕 함유율은 몇 %인가?",
    passage: [],
    choices: ["18%", "20%", "22%", "24%", "28%"],
    answer: 2,
    steps: [
      {
        narration:
          "주어진 값을 정리해요. A: 600g·농도 30%(C1), B: 400g·농도 C2(구할 값), 최종: 26%(C3). ‘섞기 전후 설탕의 양이 같다’를 이용합니다.",
      },
      {
        narration:
          "공식 (C1−C3)×W1 = (C3−C2)×W2 에 대입합니다. (30−26)×600 = (26−C2)×400, 즉 4×600 = 400×(26−C2).",
      },
      {
        narration: "좌변 2,400 = 400×(26−C2) → 26−C2 = 6 → C2 = 20.",
      },
      {
        narration: "따라서 B사 설탕물의 함유율은 20%, 정답은 ②입니다.",
        highlightChoices: [2],
        reveal: true,
      },
    ],
  }),

  defineTutorial({
    id: "cm-arithmetic-1",
    internalTypeName: "증감 연립방정식",
    strategy:
      "두 대상의 증감을 다루는 문제는 미지수 2개로 연립방정식을 세웁니다. ①처음 합 식(A+B=합), ②증감 적용 식(예: 1.1A+0.8B=변화 후 합)을 세우고 소거법으로 풀어요. 특히 ‘무엇을 구하는지’(작년 값인지 올해 값인지)를 먼저 확인해야 실수를 줄입니다.",
    stem: "2023년 A사업장과 B사업장 인원 수의 합은 300명이었는데, 2024년에는 A사업장 인원 수가 전년 대비 10% 증가하고, B사업장 인원 수가 전년 대비 20% 감소하여 두 사업장 인원 수의 합이 285명이 되었다. 2024년 기준 A사업장 인원 수는 몇 명인가?",
    passage: [],
    choices: ["160명", "165명", "170명", "175명", "180명"],
    answer: 2,
    steps: [
      {
        narration: "두 대상 A, B를 미지수로 둡니다. 2023년 합: A + B = 300.",
      },
      {
        narration:
          "2024년엔 A가 10% 증가(1.1A), B가 20% 감소(0.8B)했고 합이 285. → 1.1A + 0.8B = 285.",
      },
      {
        narration:
          "A를 구하려고 B를 소거해요. 첫 식 ×0.8 → 0.8A + 0.8B = 240. 둘째 식에서 빼면 0.3A = 45 → A = 150 (이건 2023년 값).",
      },
      {
        narration:
          "문제는 ‘2024년 A’를 물었어요. 2024년 A = 1.1 × 150 = 165명. 정답은 ②입니다. (150으로 착각하지 않기!)",
        highlightChoices: [2],
        reveal: true,
      },
    ],
  }),

  defineTutorial({
    id: "cm-cost-1",
    internalTypeName: "원가 구하기",
    strategy:
      "원가·정가·판매가 문제는 두 관계식으로 풉니다. ①판매가 = 정가 × (100−할인%)/100, ②이익 = 판매가 − 원가. ‘원가의 50% 이익’은 판매가 = 원가 × 1.5를 뜻해요. 구하는 값(주로 원가)을 미지수로 두고 식을 세우세요.",
    stem: "정가 75,000원인 신발을 20% 할인 판매했을 때, 원가의 50%만큼 이익이 발생한다고 한다. 이때 신발의 원가를 고르면?",
    passage: [],
    choices: ["30,000원", "35,000원", "40,000원", "45,000원", "50,000원"],
    answer: 3,
    steps: [
      {
        narration:
          "구할 값인 원가를 x로 둡니다. 먼저 실제 판매가를 구해요. 정가 75,000원을 20% 할인 → 판매가 = 75,000 × 0.8 = 60,000원.",
      },
      {
        narration:
          "‘원가의 50% 이익’은 판매가 = 원가 + 원가×0.5 = 원가 × 1.5 라는 뜻이에요. 즉 60,000 = x × 1.5.",
      },
      {
        narration: "x = 60,000 ÷ 1.5 = 40,000. 따라서 원가는 40,000원, 정답은 ③입니다.",
        highlightChoices: [3],
        reveal: true,
      },
    ],
  }),

  defineTutorial({
    id: "cm-probability-1",
    internalTypeName: "‘적어도 하나’ 확률 (여사건)",
    strategy:
      "확률 = (조건에 맞는 경우의 수) ÷ (전체 경우의 수). ‘적어도 하나’ 같은 조건은 여사건(전체 − 반대 경우)으로 푸는 게 빨라요. 뽑는 순서가 상관없으면 조합(nCr)을 씁니다.",
    stem: "A~H 8명 중 3명을 팀원으로 선정하고자 할 때, A, B, C 중 적어도 한 명 이상이 선정될 확률은?",
    passage: [],
    choices: ["19/28", "21/28", "23/28", "25/28", "27/28"],
    answer: 3,
    steps: [
      {
        narration:
          "확률 = (조건에 맞는 경우) ÷ (전체 경우). 전체는 8명 중 3명 선정이니 8C3 = 56가지예요.",
      },
      {
        narration:
          "‘적어도 한 명’은 여사건이 편해요. 반대 경우 = A·B·C가 한 명도 안 뽑히는 경우 = 나머지 5명 중 3명 = 5C3 = 10가지.",
      },
      {
        narration: "조건을 만족하는 경우 = 전체 − 반대 = 56 − 10 = 46가지.",
      },
      {
        narration: "확률 = 46/56 = 23/28. 정답은 ③입니다.",
        highlightChoices: [3],
        reveal: true,
      },
    ],
  }),

  defineTutorial({
    id: "cm-dst-1",
    internalTypeName: "거리·속력·시간 (거리 동일)",
    strategy:
      "거리 = 속력 × 시간. 거리가 같으면 속력과 시간은 반비례예요. 속력 비가 a:b면 시간 비는 b:a. 시간 비를 미지수 k로 두고, 주어진 시간 차로 k를 구하면 거리가 나옵니다.",
    stem: "철수와 영희는 각각 같은 거리를 이동했다. 철수는 시속 60km, 영희는 시속 40km로 이동했고, 철수는 영희보다 30분 더 빨리 도착했다. 철수와 영희가 이동한 거리는 몇 km인가?",
    passage: [],
    choices: ["40km", "60km", "80km", "100km", "120km"],
    answer: 2,
    steps: [
      {
        narration:
          "거리가 같으면 속력과 시간은 반비례예요. 속력 비가 철수:영희 = 60:40 = 3:2 이므로, 시간 비는 반대로 2:3.",
      },
      {
        narration:
          "시간을 2k, 3k로 둡니다. 철수가 30분(½시간) 빨리 도착했으니 시간 차 3k − 2k = k = ½시간.",
      },
      {
        narration:
          "철수의 시간 = 2k = 1시간. 거리 = 속력 × 시간 = 60 × 1 = 60km. 정답은 ②입니다.",
        highlightChoices: [2],
        reveal: true,
      },
    ],
  }),

  defineTutorial({
    id: "cm-work-1",
    internalTypeName: "협력 작업 일률",
    strategy:
      "일률(작업 속도) = 작업량 ÷ 시간. 전체 작업량을 1로 두면, 혼자 t일 걸리는 사람의 일률은 1/t. 함께 하면 일률을 더하고(협력 일률), 걸리는 시간 = 1 ÷ 협력 일률입니다.",
    stem: "과수원의 과일을 모두 수확하는 데 A는 6일, B는 3일이 걸린다고 한다. 두 사람이 함께 과수원의 과일을 모두 수확하는 데 걸리는 일수를 고르면?",
    passage: [],
    choices: ["1일", "2일", "3일", "4일", "5일"],
    answer: 2,
    steps: [
      {
        narration:
          "전체 작업량을 1로 두면, 혼자 t일 걸리는 사람의 하루 일률은 1/t. A의 일률 = 1/6, B의 일률 = 1/3.",
      },
      {
        narration:
          "함께 하면 일률을 더해요. 협력 일률 = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2 (하루에 전체의 절반).",
      },
      {
        narration: "걸리는 시간 = 작업량 ÷ 협력 일률 = 1 ÷ (1/2) = 2일. 정답은 ②입니다.",
        highlightChoices: [2],
        reveal: true,
      },
    ],
  }),
];
