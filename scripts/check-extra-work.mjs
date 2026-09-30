import assert from "node:assert/strict";
import { registerHooks } from "node:module";

const loader = registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(specifier.startsWith(".") && !/\.[cm]?[jt]sx?$/.test(specifier) ? `${specifier}.ts` : specifier, context);
  },
});
try {
  const { CM_WORK_EXTRA: questions } = await import("../src/data/extraBanks/cmWork.ts");
  assert.equal(questions.length, 60);
  const value = choice => {
    const parts = choice.replace("시간", "").split("/").map(Number);
    return parts[0] / (parts[1] ?? 1);
  };
  for (const [i, q] of questions.entries()) {
    const mode = Math.floor(i / 6);
    const numbers = [...q.stem.matchAll(/(\d+)(?:시간|배|대)/g)].map(match => Number(match[1]));
    const duration = value(q.choices[q.answer]);
    let completed;
    if (mode === 0) {
      const [a, b, first] = numbers;
      assert(duration > first);
      completed = first / a + (duration - first) * (1 / a + 1 / b);
    } else if (mode === 1) {
      const [a, b, first] = numbers;
      completed = first * (1 / a + 1 / b) + duration / b;
    } else if (mode === 2) {
      const [together, a] = numbers;
      completed = together * (1 / a + 1 / duration);
    } else if (mode === 3) {
      const [ab, bc, ac] = numbers;
      const rateA = (1 / ab + 1 / ac - 1 / bc) / 2;
      const rateB = 1 / ab - rateA;
      const rateC = 1 / ac - rateA;
      assert(rateA > 0 && rateB > 0 && rateC > 0);
      completed = duration * (rateA + rateB + rateC);
    } else if (mode === 4) {
      const [machines, total, first, increased] = numbers;
      const machineRate = 1 / (machines * total);
      completed = first * machines * machineRate + duration * increased * machineRate;
    } else if (mode === 5) {
      const [a, multiplier, first] = numbers;
      completed = first / a + duration * (1 + multiplier) / a;
    } else if (mode === 6) {
      const [a, b, c, first] = numbers;
      completed = first * (1 / a + 1 / b + 1 / c) + duration * (1 / b + 1 / c);
    } else if (mode === 7) {
      const [fill, drain, first] = numbers;
      completed = first / fill + duration / fill - duration / drain;
    } else if (mode === 8) {
      const [a, b] = numbers;
      const hours = Math.floor(duration + 1e-10);
      const pairs = Math.floor(hours / 2);
      completed = pairs * (1 / a + 1 / b) + (hours % 2) / a;
      completed += (duration - hours) / (hours % 2 === 0 ? a : b);
      assert(completed - 1 / Math.max(a, b) < 1);
    } else {
      const [a, b, first, rest] = numbers;
      assert(duration > first + rest);
      completed = first * (1 / a + 1 / b) + (duration - first - rest) * (1 / a + 1 / (2 * b));
    }
    assert(Math.abs(completed - 1) < 1e-10, `${q.id}: 작업량 ${completed}`);
    const choices = q.choices.map(value);
    assert(choices.every(t => Number.isFinite(t) && t > 0));
    assert.equal(new Set(choices).size, 5);
    assert(choices.some(t => t < duration) && choices.some(t => t > duration));
  }
  console.log("협력 작업 추가 60문항: 지문 수치 역산과 선지 검증 통과");
  const { CM_CONCENTRATION_EXTRA: concentrations } = await import("../src/data/extraBanks/cmConcentration.ts");
  assert.equal(concentrations.length, 60);
  for (const [i, q] of concentrations.entries()) {
    const mode = Math.floor(i / 6);
    const numbers = [...q.stem.matchAll(/(\d+)(?:%|g)/g)].map(match => Number(match[1]));
    const answer = Number(q.choices[q.answer].replace(/[,%g]/g, ""));
    let salt, total, target;
    if (mode === 0) {
      const [c1, w1, c2, w2] = numbers;
      salt = c1 * w1 / 100 + c2 * w2 / 100; total = w1 + w2; target = answer;
    } else if (mode === 1) {
      const [c1, w1, c2, t] = numbers;
      salt = c1 * w1 / 100 + c2 * answer / 100; total = w1 + answer; target = t;
    } else if (mode === 2) {
      const [lowRate, highRate, t, weight] = numbers;
      let high;
      if (q.stem.includes("녹아 있던")) high = answer * 100 / highRate;
      else if (q.stem.includes("양의 차이")) {
        const candidates = [(weight + answer) / 2, (weight - answer) / 2];
        high = candidates.find(h => Math.abs((lowRate * (weight - h) + highRate * h) / weight - t) < 1e-10);
        assert.notEqual(high, undefined);
      } else high = q.stem.includes(`섞은 농도 ${highRate}%인`) ? answer : weight - answer;
      assert(high > 0 && high < weight);
      salt = (lowRate * (weight - high) + highRate * high) / 100; total = weight; target = t;
    } else if (mode === 3) {
      const [c, weight, t] = numbers;
      salt = c * weight / 100;
      total = weight - (q.choices[q.answer].endsWith("g") ? answer : t);
      target = q.choices[q.answer].endsWith("g") ? t : answer;
    } else if (mode === 4) {
      const [c, weight, t] = numbers;
      salt = c * weight / 100; total = q.stem.includes("전체의 양") ? answer : weight + answer; target = t;
    } else if (mode === 5) {
      const [c, weight, t] = numbers;
      salt = c * weight / 100 + answer; total = weight + answer; target = t;
    } else if (mode === 6 || mode === 7) {
      const [c, weight] = numbers;
      const filler = numbers.length === 4 ? numbers[2] : mode === 6 ? 0 : 100;
      target = numbers.at(-1); total = weight;
      assert(answer > 0 && answer < weight);
      salt = (c * (mode === 6 ? weight - answer : weight) + filler * answer) / 100;
    } else if (mode === 8) {
      const [c, w1, w2, water, t] = numbers;
      salt = (c * w1 + answer * w2) / 100; total = w1 + w2 + water; target = t;
    } else {
      const j = i % 6;
      target = answer;
      if (j < 2) {
        salt = 0; total = 0;
        for (let k = 0; k < numbers.length; k += 2) { salt += numbers[k] * numbers[k + 1] / 100; total += numbers[k + 1]; }
      } else if (j < 4) {
        const [c1, w1, c2, w2, water] = numbers;
        salt = (c1 * w1 + c2 * w2) / 100; total = w1 + w2 + (j === 2 ? water : -water);
      } else if (j === 4) {
        const [c, weight, added, water] = numbers;
        salt = c * weight / 100 + added; total = weight + added + water;
      } else {
        const [c1, w1, removed, c2, w2] = numbers;
        salt = (c1 * (w1 - removed) + c2 * w2) / 100; total = w1 - removed + w2;
      }
    }
    assert(salt > 0 && salt < total);
    assert(Math.abs(salt * 100 / total - target) < 1e-10, `${q.id}: 농도 역산 오류`);
  }
  console.log("농도 추가 60문항: 지문 수치와 용질 보존 검증 통과");

  const { DA_CALC_EXTRA: calculated } = await import("../src/data/extraBanks/daCalc.ts");
  const checkedPatterns = new Set();
  for (const q of calculated) {
    const table = q.visuals.find(v => v.type === "table");
    const rows = table.rows.map(row => ({ label: row.label, values: row.cells.map(v => Number(String(v).replaceAll(",", ""))) }));
    const total = period => rows.reduce((sum, row) => sum + row.values[period], 0);
    const truths = q.choices.map(choice => {
      const periods = [...choice.matchAll(/(\d{4}년|\d분기)/g)].map(m => table.columns.indexOf(m[1]));
      assert(periods.every(p => p >= 0));
      const referenced = rows.filter(row => choice.includes(row.label));
      const bound = choice.includes("이상") ? "이상" : "미만";
      const compare = (actual, threshold) => bound === "이상" ? actual >= threshold : actual < threshold;
      let match;
      if ((match = choice.match(/(증가율|감소율)[은는] ([\d.]+)% (이상|미만)이다\.$/))) {
        checkedPatterns.add(choice.includes("합계의") ? "totalRate" : "growth");
        const [to, from] = periods;
        const row = referenced[0];
        const a = choice.includes("합계의") ? total(from) : row.values[from];
        const b = choice.includes("합계의") ? total(to) : row.values[to];
        assert(match[1] === (b > a ? "증가율" : "감소율"));
        return compare(Math.abs(b - a) * 100, Number(match[2]) * a);
      }
      if ((match = choice.match(/비중은 ([\d.]+)% (이상|미만)이다\.$/))) {
        checkedPatterns.add("share");
        assert.equal(referenced.length, 1);
        return compare(referenced[0].values[periods[0]] * 100, Number(match[1]) * total(periods[0]));
      }
      if ((match = choice.match(/평균은 ([\d,]+).+ (이상|미만)이다\.$/))) {
        checkedPatterns.add("average");
        assert.equal(referenced.length, 1);
        return compare(referenced[0].values.reduce((a,b) => a+b, 0), Number(match[1].replaceAll(",", "")) * table.columns.length);
      }
      if ((match = choice.match(/차이는 ([\d,]+).+이다\.$/))) {
        checkedPatterns.add("gap");
        assert.equal(referenced.length, 2);
        return Math.abs(referenced[0].values[periods[0]] - referenced[1].values[periods[0]]) === Number(match[1].replaceAll(",", ""));
      }
      if ((match = choice.match(/합계는 .+보다 ([\d,]+).+ (많다|적다)\.$/))) {
        checkedPatterns.add("total");
        const delta = total(periods[0]) - total(periods[1]);
        return Math.abs(delta) === Number(match[1].replaceAll(",", "")) && (delta > 0 ? "많다" : "적다") === match[2];
      }
      if ((match = choice.match(/([\d.]+)배 (이상|미만)이다\.$/))) {
        checkedPatterns.add("ratio");
        assert.equal(referenced.length, 2);
        const ordered = [...referenced].sort((a,b) => choice.indexOf(a.label) - choice.indexOf(b.label));
        return compare(ordered[0].values[periods[0]], Number(match[1]) * ordered[1].values[periods[0]]);
      }
      if (choice.includes("증가량이 가장 큰") || choice.includes("증가율이 가장 높은")) {
        const isRate = choice.includes("증가율이");
        checkedPatterns.add(isRate ? "maxRate" : "maxIncrease");
        const [from,to] = periods;
        const change = row => (row.values[to] - row.values[from]) / (isRate ? row.values[from] : 1);
        const winner = [...rows].sort((a,b) => change(b) - change(a))[0];
        return choice.endsWith(`${winner.label}이다.`);
      }
      if ((match = choice.match(/증가율이 (\d+)% 이상인 .+[은는] (\d+)개이다\.$/))) {
        checkedPatterns.add("count");
        const [from,to] = periods;
        return rows.filter(row => (row.values[to] - row.values[from]) * 100 >= Number(match[1]) * row.values[from]).length === Number(match[2]);
      }
      if ((match = choice.match(/차지하는 비중은 .+에 더 (높다|낮다)\.$/))) {
        checkedPatterns.add("shift");
        assert.equal(referenced.length, 1);
        const [from,to] = periods;
        const delta = referenced[0].values[to] * total(from) - referenced[0].values[from] * total(to);
        return (delta > 0 ? "높다" : "낮다") === match[1];
      }
      throw new Error(`${q.id}: 해석하지 못한 선지: ${choice}`);
    });
    assert.deepEqual(truths, q.choices.map((_,i) => i !== q.answer), `${q.id}: 참과 거짓 판정 오류`);
  }
  assert.equal(calculated.length, 60);
  assert.equal(checkedPatterns.size, 11);
  console.log("자료해석 계산 60문항, 선지 300개: 11가지 계산 판정 검증 통과");

  const { CM_PROBABILITY_EXTRA: probabilities } = await import("../src/data/extraBanks/cmProbability.ts");
  for (const [i, q] of probabilities.entries()) {
    const fractions = [...q.stem.matchAll(/(\d+)\/(\d+)/g)].map(m => [Number(m[1]), Number(m[2])]);
    const units = [...q.stem.matchAll(/(\d+)(?:점|개|잔|대|건|곳|명|칸|편|장|팀|병|통)/g)].map(m => Number(m[1]));
    let actual;
    if (i < 34) {
      const bothGroups = i >= 14 && i < 24;
      const n = bothGroups ? units[0] + units[1] : units[0];
      const special = bothGroups ? units[0] : units[1];
      const picked = units[2];
      assert(Number.isInteger(picked));
      let successes = 0, possibilities = 0;
      for (let mask = 0; mask < 2 ** n; mask++) {
        let selected = 0, selectedSpecial = 0;
        for (let item = 0; item < n; item++) if (mask & (1 << item)) {
          selected++; if (item < special) selectedSpecial++;
        }
        if (selected !== picked) continue;
        possibilities++;
        if (bothGroups ? selectedSpecial > 0 && selectedSpecial < picked : selectedSpecial >= (i >= 24 ? 2 : 1)) successes++;
      }
      actual = successes / possibilities;
    } else {
      const trials = i < 49 ? fractions : Array.from({ length: Number(q.stem.match(/독립적으로 (\d+)번/)[1]) }, () => fractions[0]);
      actual = 0;
      for (let mask = 1; mask < 2 ** trials.length; mask++) {
        let probability = 1;
        for (const [trial, [n,d]] of trials.entries()) probability *= ((mask & (1 << trial)) ? n : d - n) / d;
        actual += probability;
      }
    }
    const [n,d] = q.choices[q.answer].split("/").map(Number);
    assert(Math.abs(actual - n / d) < 1e-12, `${q.id}: 직접 열거 확률 오류`);
    for (const choice of q.choices) { const [a,b] = choice.split("/").map(Number); assert(a > 0 && a < b); }
  }
  assert.equal(probabilities.length, 60);
  console.log("확률 추가 60문항: 표본 결과 직접 열거 검증 통과");



} finally {
  loader.deregister();
}
