import type { ExampleQuestion } from "../catalog";
import { defineQuestion, rotateChoices } from "../exampleBanks/bankUtils";

const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : Math.abs(a);
const fraction = (n: number, d = 1) => {
  const divisor = gcd(n, d);
  return d / divisor === 1 ? String(n / divisor) : `${n / divisor}/${d / divisor}`;
};
const scenes = ["문서 분류", "제품 포장", "도서 정리", "부품 검사", "창고 정비", "자료 입력"];
const seeds = [
  [12, 18, 2], [15, 20, 3], [18, 30, 4],
  [24, 36, 5], [20, 28, 2], [30, 40, 6],
];

export const CM_WORK_EXTRA: ExampleQuestion[] = Array.from({ length: 60 }, (_, i) => {
  const mode = Math.floor(i / 6);
  const j = i % 6;
  const [a, b, t] = seeds[j];
  const task = scenes[j];
  let stem: string;
  let explanation: string;
  let n: number;
  let d: number;
  if (mode === 0) {
    n = t * (a + b) + (a - t) * b;
    d = a + b;
    stem = `${task} 작업을 A는 혼자 ${a}시간, B는 혼자 ${b}시간에 끝낸다. A가 먼저 ${t}시간 일한 뒤 B가 합류해 남은 일을 함께 했다. 처음 시작한 때부터 완료까지 몇 시간이 걸렸는가? 두 사람의 시간당 작업량은 일정하다.`;
    explanation = `처음 끝낸 양은 ${t}/${a}이고 남은 양은 ${a - t}/${a}입니다. 합산 일률은 (${a}+${b})/(${a}×${b})이므로 합류 후 ${fraction((a - t) * b, a + b)}시간이 더 필요합니다. 먼저 일한 ${t}시간을 더해 총 ${fraction(n, d)}시간입니다.`;
  } else if (mode === 1) {
    n = a * b - t * (a + b);
    d = a;
    stem = `${task} 작업을 혼자 끝내는 데 A는 ${a}시간, B는 ${b}시간이 필요하다. 두 사람이 함께 ${t}시간 작업한 뒤 A가 다른 업무로 빠지고 B가 남은 일을 마쳤다. A가 빠진 뒤부터 몇 시간이 더 걸렸는가? 시간당 작업량은 변하지 않는다.`;
    explanation = `함께 끝낸 양은 ${t}×(1/${a}+1/${b})입니다. 이를 전체 1에서 빼고 B의 일률 1/${b}의 값으로 나누면 ${b}-${t}×${b}/${a}-${t}=${fraction(n, d)}시간입니다. 질문은 이탈 후의 시간이므로 앞의 ${t}시간은 더하지 않습니다.`;
  } else if (mode === 2) {
    const together = 4 + j;
    n = a * together;
    d = a - together;
    stem = `A와 B가 같은 양의 ${task} 작업을 함께 하면 ${together}시간 만에 끝낸다. A가 혼자 하면 ${a}시간 걸린다. 두 사람의 일률이 일정하고 서로의 작업을 방해하지 않을 때 B 혼자 끝내는 데 걸리는 시간은?`;
    explanation = `합산 일률 1/${together}에서 A의 일률 1/${a}의 값을 빼면 B의 일률은 ${a - together}/(${a}×${together})입니다. 전체 작업량 1을 이 값으로 나누면 ${fraction(n, d)}시간입니다. 완료 시간끼리 빼면 일률 차이를 반영하지 못합니다.`;
  } else if (mode === 3) {
    const u = 8 + j, v = 10 + 2 * j, w = 12 + 3 * j;
    n = 2 * u * v * w;
    d = u * v + u * w + v * w;
    stem = `동일한 ${task} 작업을 A와 B는 함께 ${u}시간, B와 C는 함께 ${v}시간, A와 C는 함께 ${w}시간에 마친다. 세 사람의 개별 일률은 일정하고 서로 간섭하지 않는다. 세 사람이 처음부터 함께 하면 완료까지 몇 시간이 필요한가?`;
    explanation = `세 조합의 일률 1/${u}, 1/${v}, 1/${w}의 값을 더하면 각 사람의 일률이 두 번씩 포함됩니다. 따라서 세 사람의 합산 일률은 이 합의 절반이고, 완료 시간은 2÷(1/${u}+1/${v}+1/${w})=${fraction(n, d)}시간입니다.`;
  } else if (mode === 4) {
    const m = 3 + j, h = 9 + j, k = 5 + j, first = 2 + j;
    n = m * (h - first);
    d = k;
    stem = `성능이 같은 기계 ${m}대로 ${task} 작업을 하면 ${h}시간에 끝난다. 이 기계들이 ${first}시간 작업한 뒤 같은 성능의 기계를 추가하여 총 ${k}대로 남은 작업을 했다. 기계를 늘린 뒤 작업을 마칠 때까지 걸린 시간은? 교체 시간은 없고 작업량은 기계 수에 비례한다.`;
    explanation = `전체 작업량은 ${m}×${h}=${m * h} 기계 시간이고 이미 끝낸 양은 ${m}×${first}=${m * first} 기계 시간입니다. 남은 ${n} 기계 시간을 ${k}대가 나누어 처리하므로 ${fraction(n, d)}시간입니다.`;
  } else if (mode === 5) {
    const r = 2 + j % 3;
    n = a - t;
    d = 1 + r;
    stem = `A는 ${task} 작업을 혼자 ${a}시간에 끝낸다. B의 시간당 작업량은 A의 ${r}배이다. A가 혼자 ${t}시간 작업한 뒤 B가 합류했다. 이후 두 사람이 함께 남은 작업을 마치는 데 몇 시간이 걸리는가? 두 사람의 작업 속도는 일정하다.`;
    explanation = `A가 ${t}/${a}만큼 끝냈으므로 남은 양은 ${a - t}/${a}입니다. B의 일률은 ${r}/${a}, 합산 일률은 ${1 + r}/${a}입니다. 남은 양을 합산 일률로 나누면 ${fraction(n, d)}시간입니다.`;
  } else if (mode === 6) {
    const c = 24 + 6 * j;
    const first = 1 + j % 2;
    n = a * b * c - first * (a * b + a * c + b * c);
    d = a * (b + c);
    stem = `같은 ${task} 작업을 혼자 하는 데 A는 ${a}시간, B는 ${b}시간, C는 ${c}시간이 걸린다. 세 사람이 함께 ${first}시간 일한 뒤 A가 빠지고 B와 C가 끝까지 일했다. A가 빠진 뒤 추가로 필요한 시간은? 각 사람의 일률은 일정하다.`;
    explanation = `처음 끝낸 양은 ${first}×(1/${a}+1/${b}+1/${c})입니다. 남은 양을 B와 C의 합산 일률 (1/${b}+1/${c})의 값으로 나누면 ${fraction(n, d)}시간입니다. 처음 구간에서 A가 한 작업까지 남은 양에서 빼야 합니다.`;
  } else if (mode === 7) {
    const fill = 6 + j, drain = 15 + 2 * j, first = 1 + j % 3;
    n = (fill - first) * drain;
    d = drain - fill;
    stem = `빈 물탱크를 급수관 하나로 채우면 ${fill}시간, 가득 찬 탱크를 배수관 하나로 비우면 ${drain}시간 걸린다. 빈 탱크에 급수관만 ${first}시간 열었다가 배수관도 열었다. 두 관을 함께 연 시점부터 탱크가 가득 찰 때까지 몇 시간이 걸리는가? 유량은 일정하다.`;
    explanation = `남은 용량은 ${fill - first}/${fill}입니다. 두 관을 함께 열면 시간당 1/${fill}-1/${drain}만큼 채워집니다. 남은 용량을 순유입률로 나누면 ${fraction(n, d)}시간입니다. 배수관의 일률은 급수관의 일률에서 빼야 합니다.`;
  } else if (mode === 8) {
    let remaining = a * b, elapsed = 0, turns = 0;
    while (remaining > 0) {
      const rate = turns % 2 === 0 ? b : a;
      if (remaining <= rate) {
        n = elapsed * rate + remaining;
        d = rate;
        break;
      }
      remaining -= rate;
      elapsed++;
      turns++;
    }
    stem = `A는 ${task} 작업을 혼자 ${a}시간, B는 혼자 ${b}시간에 끝낸다. A부터 시작해 두 사람이 한 시간씩 번갈아 일하며, 일이 끝나는 즉시 멈춘다. 작업 시작부터 완료까지 몇 시간이 걸리는가? 교대 시간은 없고 각자의 일률은 일정하다.`;
    explanation = `전체 작업량을 ${a * b} 단위로 잡으면 A는 한 시간에 ${b}, B는 ${a} 단위를 처리합니다. ${elapsed}시간 동안 교대한 뒤 ${remaining} 단위가 남고 다음 작업자의 시간당 작업량은 ${d!}입니다. 마지막 구간 ${fraction(remaining, d!)}시간을 더하면 ${fraction(n!, d!)}시간입니다.`;
  } else {
    const first = 1 + j % 2, stop = 1 + j % 3;
    n = 2 * (a * b - first * (a + b)) + (first + stop) * (2 * b + a);
    d = 2 * b + a;
    stem = `같은 ${task} 작업을 A는 혼자 ${a}시간, B는 혼자 ${b}시간에 마친다. 두 사람이 함께 ${first}시간 일한 뒤 장비 점검으로 ${stop}시간 모두 쉬었다. 이후 A는 원래 속도, B는 원래 속도의 절반으로 일해 남은 작업을 끝냈다. 휴식까지 포함한 전체 경과 시간은?`;
    explanation = `첫 구간의 작업량은 ${first}×(1/${a}+1/${b})입니다. 재개 후 합산 일률은 1/${a}+1/(2×${b})이므로 남은 작업에는 ${fraction(2 * (a * b - first * (a + b)), 2 * b + a)}시간이 필요합니다. 첫 작업 ${first}시간과 휴식 ${stop}시간을 더하면 ${fraction(n, d)}시간입니다.`;
  }
  if (!Number.isInteger(n!) || !Number.isInteger(d!) || n! <= 0 || d! <= 0)
    throw new Error(`일률 문항 계산 오류: ${i}`);
  const correct = `${fraction(n!, d!)}시간`;
  const distractors = [-2, -1, 1, 2].map(k => `${fraction(n! + k * d!, d!)}시간`);
  return defineQuestion("creative-math", "cm-work-1", "협력 작업 일률", 20 + i, {
    stem, ...rotateChoices(correct, distractors, i), explanation,
  });
});
