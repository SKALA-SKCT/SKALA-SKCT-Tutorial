import { useEffect, useReducer } from "react";

const HISTORY_LIMIT = 2;
const KEY_INPUTS = [".", "+", "-", "×", "÷", "(", ")", "%"];

function calculate(source: string) {
  const safe = source
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
  if (!/^[\d+\-*/().\s]+$/.test(safe)) throw new Error("invalid");
  const result = Function(`"use strict"; return (${safe})`)();
  if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("invalid");
  return Math.round(result * 1e8) / 1e8;
}

interface State {
  expression: string;
  history: string[];
  calculated: boolean;
}

type Action = { type: "input"; value: string } | { type: "clear" } | { type: "equals" };

const initialState: State = { expression: "0", history: [], calculated: false };

function nextExpression({ expression, calculated }: State, value: string) {
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

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "input":
      return { ...state, expression: nextExpression(state, action.value), calculated: false };
    case "clear":
      return { ...state, expression: "0", calculated: false };
    case "equals":
      try {
        const result = String(calculate(state.expression));
        return {
          expression: result,
          history: [`${state.expression} = ${result}`, ...state.history].slice(0, HISTORY_LIMIT),
          calculated: true,
        };
      } catch {
        return { ...state, expression: "오류", calculated: true };
      }
  }
}

function keyAction(event: KeyboardEvent): Action | null {
  const value = event.key === "*" ? "×" : event.key === "/" ? "÷" : event.key;
  if (/^\d$/.test(value) || KEY_INPUTS.includes(value)) return { type: "input", value };
  if (event.key === "Enter" || event.key === "=") return { type: "equals" };
  if (event.key === "Escape") return { type: "clear" };
  return null;
}

function buttonAction(value: string): Action {
  if (value === "C") return { type: "clear" };
  if (value === "=") return { type: "equals" };
  return { type: "input", value };
}

export default function Calculator() {
  const [{ expression, history }, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.matches("input, textarea")) return;
      const action = keyAction(event);
      if (action) dispatch(action);
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, []);

  const button = (label: string, value = label, className = "") => (
    <button key={label} className={className} onClick={() => dispatch(buttonAction(value))}>
      {label}
    </button>
  );

  return (
    <div className="calculator">
      <div className="calc-history">
        {history.length ? (
          history.map((item) => <p key={item}>{item}</p>)
        ) : (
          <span>최근 계산 기록</span>
        )}
      </div>
      <div className="calc-display">{expression}</div>
      <div className="calc-grid">
        {button("C", "C", "span-three operator")}
        {button("(", "(", "operator")}
        {button(")", ")", "operator")}
        {["7", "8", "9"].map((n) => button(n))}
        {button("÷", "÷", "operator")}
        {button("×", "×", "operator")}
        {["4", "5", "6"].map((n) => button(n))}
        {button("−", "-", "operator")}
        {button("+", "+", "operator")}
        {["1", "2", "3"].map((n) => button(n))}
        {button("%", "%", "operator")}
        {button("=", "=", "equals")}
        {button("0", "0", "span-three")}
        {button(".")}
      </div>
    </div>
  );
}
