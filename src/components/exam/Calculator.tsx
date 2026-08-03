import { useCallback, useEffect, useState } from "react";

function calculate(source: string) {
  const safe = source.replaceAll("×", "*").replaceAll("÷", "/").replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
  if (!/^[\d+\-*/().\s]+$/.test(safe)) throw new Error("invalid");
  const result = Function(`"use strict"; return (${safe})`)();
  if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("invalid");
  return Math.round(result * 1e8) / 1e8;
}

export default function Calculator() {
  const [expression, setExpression] = useState("0");
  const [history, setHistory] = useState<string[]>([]);
  const [calculated, setCalculated] = useState(false);
  const input = useCallback((value: string) => { setExpression((current) => { if (current === "오류" || (calculated && /[\d.(]/.test(value))) return value === "." ? "0." : value; if (/\d/.test(value) && current === "0") return value; if (/^[+\-×÷]$/.test(value) && /[+\-×÷]$/.test(current)) return current.slice(0, -1) + value; return current + value; }); setCalculated(false); }, [calculated]);
  const clear = useCallback(() => { setExpression("0"); setCalculated(false); }, []);
  const equals = useCallback(() => { setExpression((current) => { try { const result = String(calculate(current)); setHistory((items) => [`${current} = ${result}`, ...items].slice(0, 2)); return result; } catch { return "오류"; } }); setCalculated(true); }, []);
  useEffect(() => { const keydown = (event: KeyboardEvent) => { if (event.target instanceof HTMLElement && event.target.matches("input, textarea")) return; const value = event.key === "*" ? "×" : event.key === "/" ? "÷" : event.key; if (/^\d$/.test(value) || [".", "+", "-", "×", "÷", "(", ")", "%"].includes(value)) input(value); else if (event.key === "Enter" || event.key === "=") equals(); else if (event.key === "Escape") clear(); }; window.addEventListener("keydown", keydown); return () => window.removeEventListener("keydown", keydown); }, [clear, equals, input]);
  const button = (label: string, value = label, className = "") => <button key={label} className={className} onClick={() => value === "C" ? clear() : value === "=" ? equals() : input(value)}>{label}</button>;
  return <div className="calculator">
    <div className="calc-history">{history.length ? history.map((item) => <p key={item}>{item}</p>) : <span>최근 계산 기록</span>}</div>
    <div className="calc-display">{expression}</div>
    <div className="calc-grid">
      {button("C", "C", "span-three operator")}{button("(", "(", "operator")}{button(")", ")", "operator")}
      {["7","8","9"].map((n) => button(n))}{button("÷","÷","operator")}{button("×","×","operator")}
      {["4","5","6"].map((n) => button(n))}{button("−","-","operator")}{button("+","+","operator")}
      {["1","2","3"].map((n) => button(n))}{button("%","%","operator")}{button("=","=","equals")}
      {button("0","0","span-three")}{button(".")}
    </div>
  </div>;
}
