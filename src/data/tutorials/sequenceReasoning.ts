import type { Problem } from "../../types";
import { defineTutorial } from "../tutorialBuilder";

/**
 * 수열추리 (Sequence reasoning) guided tutorials.
 *
 * The number sequence sits in `passage` (one segment) and the step narration
 * walks the rule; the final step reveals the answer choice.
 */
export const SEQUENCE_REASONING_TUTORIALS: Problem[] = [
  defineTutorial({
    id: "sr-arithgeo-1",
    internalTypeName: "등비수열 (일정한 비)",
    strategy:
      "먼저 항 사이의 ‘차이’가 일정한지(등차) 보고, 아니면 ‘비’가 일정한지(등비) 확인하세요. 분수나 소수라도 ‘몇을 더하거나 곱하면 다음 항이 되는지’만 찾으면 됩니다. 등비는 매 항에 같은 수를 곱해요.",
    stem: "다음 수들이 일정한 규칙을 따를 때, 빈칸에 들어갈 수로 알맞은 것은?",
    passage: ["1/2,  2/3,  8/9,  32/27,  ( )"],
    choices: ["64/81", "64/243", "128/243", "128/81", "128/9"],
    answer: 4,
    steps: [
      {
        narration:
          "먼저 항 사이의 관계를 봐요. 뺄셈(등차)이 일정하지 않으니, 분수라 ‘몇을 곱하면 다음 항이 되는지’를 확인합니다.",
        highlight: [1],
      },
      {
        narration:
          "1/2 × ? = 2/3 → 4/3. 2/3 × 4/3 = 8/9 ✓, 8/9 × 4/3 = 32/27 ✓. 매번 4/3을 곱하는 등비수열이에요.",
        highlight: [1],
      },
      {
        narration: "따라서 빈칸 = 32/27 × 4/3 = 128/81. 정답은 ④입니다.",
        highlightChoices: [4],
        reveal: true,
      },
    ],
  }),

  defineTutorial({
    id: "sr-various-1",
    internalTypeName: "여러 가지 수열 (홀짝 분리)",
    strategy:
      "전체가 하나의 규칙으로 안 풀리면 수열을 ‘홀수 항 / 짝수 항’으로 나눠 보세요. 두 묶음이 각각 다른 규칙(등차, 등비, 나눗셈 등)을 따르는 경우가 많아요. 빈칸이 몇 번째 항인지 확인하고 그 묶음의 규칙만 적용합니다.",
    stem: "다음 수들이 일정한 규칙을 따를 때, 빈칸에 들어갈 수로 알맞은 것은?",
    passage: ["18/5,  5/9,  9/5,  5/27,  9/10,  5/81,  ( )"],
    choices: ["81/10", "81/5", "18/20", "9/20", "18/4"],
    answer: 4,
    steps: [
      {
        narration:
          "전체가 하나의 규칙이 아니면 ‘홀수 항 / 짝수 항’으로 나눠 봐요. 홀수 번째: 18/5, 9/5, 9/10, ( ). 짝수 번째: 5/9, 5/27, 5/81.",
        highlight: [1],
      },
      {
        narration:
          "짝수 항은 분모가 9 → 27 → 81, 매번 ÷3. 홀수 항은 18/5 → 9/5 → 9/10, 매번 ÷2. 빈칸은 7번째(홀수 항)예요.",
        highlight: [1],
      },
      {
        narration: "따라서 빈칸 = 9/10 ÷ 2 = 9/20. 정답은 ④입니다.",
        highlightChoices: [4],
        reveal: true,
      },
    ],
  }),

  defineTutorial({
    id: "sr-special-1",
    internalTypeName: "특수 규칙 수열 (반복 차이)",
    strategy:
      "익숙한 등차나 등비가 안 보이면 ‘차이(계차)’나 ‘반복되는 연산’을 의심하세요. 항 사이 차이를 쭉 적어 −3, +0.5처럼 반복 패턴이 있는지 보고, 규칙을 찾으면 원하는 항까지 그대로 이어 계산합니다.",
    stem: "다음과 같이 일정한 규칙으로 숫자를 나열할 때, 열 번째 항의 값으로 알맞은 것은?",
    passage: ["8.5,  5.5,  6.0,  3.0,  3.5,  0.5,  1.0,  …"],
    choices: ["-4.5", "-4.0", "-3.5", "0.5", "1.5"],
    answer: 1,
    steps: [
      {
        narration:
          "항 사이의 ‘차이’를 봐요. 8.5→5.5은 −3.0, 5.5→6.0은 +0.5, 6.0→3.0은 −3.0, 3.0→3.5은 +0.5…",
        highlight: [1],
      },
      {
        narration:
          "즉 −3.0과 +0.5가 번갈아 반복되는 수열이에요. 7번째 항 1.0부터 규칙을 이어가면 됩니다.",
        highlight: [1],
      },
      {
        narration:
          "1.0 − 3.0 = −2.0(8항), −2.0 + 0.5 = −1.5(9항), −1.5 − 3.0 = −4.5(10항). 정답은 ①입니다.",
        highlightChoices: [1],
        reveal: true,
      },
    ],
  }),
];
