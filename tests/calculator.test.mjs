import assert from "node:assert/strict";
import test from "node:test";

import { calculate, nextExpression } from "../src/components/exam/calculatorLogic.ts";

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
