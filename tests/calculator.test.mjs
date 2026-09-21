import assert from "node:assert/strict";
import test from "node:test";

import { calculate, finishCalculation, nextExpression, startNextCalculation } from "../src/components/exam/calculatorLogic.ts";

test("소수 입력을 유지해 21.3을 10으로 나눈다", () => {
  let state = { expression: "0", calculated: false };
  for (const value of ["2", "1", ".", "3", "÷", "1", "0"]) {
    state = {
      expression: nextExpression(state, value),
      calculated: false,
    };
  }

  assert.equal(state.expression, "21.3÷10");
  assert.equal(calculate(state.expression), 2.13);
});

test("계산 결과는 다음 입력 전까지 현재 결과로 남고 이후 최신 기록의 아래에 쌓인다", () => {
  const finished = finishCalculation("2+3", []);

  assert.deepEqual(finished, {
    expression: "5",
    history: [],
    pendingRecord: "2+3 = 5",
    calculated: true,
  });
  assert.deepEqual(startNextCalculation(finished, "4"), {
    expression: "4",
    history: ["2+3 = 5"],
    pendingRecord: null,
    calculated: false,
  });
});
