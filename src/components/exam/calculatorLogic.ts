export function calculate(source: string) {
  const safe = source
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
  if (!/^[\d+\-*/().\s]+$/.test(safe)) throw new Error("invalid");
  const result = Function(`"use strict"; return (${safe})`)();
  if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("invalid");
  return Math.round(result * 1e8) / 1e8;
}

interface CalculatorInputState {
  expression: string;
  calculated: boolean;
}

export function nextExpression({ expression, calculated }: CalculatorInputState, value: string) {
  // 직전 결과나 오류 뒤에 숫자를 누르면 새 식을 시작한다.
  if (expression === "오류" || (calculated && /[\d.(]/.test(value))) {
    return value === "." ? "0." : value;
  }
  if (/\d/.test(value) && expression === "0") return value;
  // 연산자를 연달아 누르면 마지막 연산자를 교체한다.
  if (/^[+\-×÷]$/.test(value) && /[+\-×÷]$/.test(expression)) {
    return expression.slice(0, -1) + value;
  }
  return expression + value;
}
