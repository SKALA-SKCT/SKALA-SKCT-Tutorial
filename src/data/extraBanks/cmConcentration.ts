import type { ExampleQuestion } from "../catalog";
import { defineQuestion } from "../exampleBanks/bankUtils";

// cm-concentration-1: 문제 세트와 랜덤 문제에만 쓰는 추가 문항 60개 (id 번호 21~80)
const CATEGORY = "creative-math";
const KIND = "cm-concentration-1";
const KIND_NAME = "농도 혼합 계산";

function hasFinalConsonant(value: string) {
  const code = value.charCodeAt(value.length - 1);
  return code >= 0xac00 && code <= 0xd7a3 ? (code - 0xac00) % 28 !== 0 : false;
}
function withJosa(value: string, consonant: string, vowel: string) {
  return `${value}${hasFinalConsonant(value) ? consonant : vowel}`;
}
const asTopic = (value: string) => withJosa(value, "은", "는");
const asObject = (value: string) => withJosa(value, "을", "를");
const togetherWith = (value: string) => withJosa(value, "과", "와");

/** 소수 둘째 자리까지만 보이고 부동소수점 꼬리는 지운다. */
function nt(value: number) {
  const rounded = Number(value.toFixed(2));
  return Number.isInteger(rounded) ? rounded.toLocaleString("en-US") : String(rounded);
}

/** 시드 조합이 깔끔한 값을 만들지 못하면 빌드 단계에서 바로 멈춘다. */
function check(condition: boolean, message: string) {
  if (!condition) throw new Error(`[${KIND}] 검산 실패: ${message}`);
}
/** 부동소수점 꼬리만 걷어 낸다. 실제로 나누어떨어지지 않는 값은 그대로 두어 check에서 걸린다. */
function snap(value: number) {
  return Math.abs(value - Math.round(value)) < 1e-9 ? Math.round(value) : value;
}
function isClean(value: number) {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-9;
}

const STEPS = [1, 2, 5, 10, 20, 25, 50, 100];

/**
 * 실전 선지처럼 같은 간격으로 오름차순 배열하고, 정답 자리는 문항 번호로 고르게 돌린다.
 * 섞은 농도처럼 값이 놓일 수 있는 범위가 정해진 문제는 범위 밖 선지가 계산 없이 지워지므로
 * bounds(양 끝 제외) 안에 다섯 값이 모두 들어가도록 간격을 줄이고, 그래도 안 되면 정답 자리를 옮긴다.
 */
function sortedChoices(correct: number, unit: string, position: number, bounds?: [number, number]) {
  check(Number.isInteger(correct) && correct > 0, `정답이 양의 정수가 아님: ${correct}`);
  const [lo, hi] = bounds ?? [0, Infinity];
  const gaps = [...STEPS].reverse().filter((step) => step <= correct / 5);
  const positions = [0, 1, 2, 3, 4].sort((a, b) => Math.abs(a - position) - Math.abs(b - position));
  for (const p of positions)
    for (const gap of gaps) {
      const values = [0, 1, 2, 3, 4].map((k) => correct + gap * (k - p));
      if (values[0] > lo && values[4] < hi)
        return { choices: values.map((value) => `${nt(value)}${unit}`), answer: p };
    }
  throw new Error(`[${KIND}] 선지 범위 부족: ${correct} (${lo}, ${hi})`);
}

type Material = "salt" | "sugar";
const MAT = {
  salt: { mat: "소금물", solute: "소금" },
  sugar: { mat: "설탕물", solute: "설탕" },
} as const;

interface Built {
  stem: string;
  correct: number;
  unit: "%" | "g";
  explanation: string;
  bounds?: [number, number];
}

// 1) 두 용액을 섞은 뒤 농도
const mixSeeds: Array<[string, Material, number, number, number, number]> = [
  ["김치 공장에서 배추를 절일 소금물을 준비하고 있다.", "salt", 4, 300, 12, 100],
  ["제과점에서 과일 조림에 쓸 설탕물을 배합하고 있다.", "sugar", 9, 200, 18, 400],
  ["해양 생물 연구실에서 수조에 넣을 소금물을 맞추고 있다.", "salt", 5, 300, 20, 200],
  ["음료 연구원이 시음용으로 만든 설탕물 두 병을 한 병에 모으려 한다.", "sugar", 7, 250, 16, 500],
  ["고등학교 화학 실험 시간에 두 모둠이 만든 소금물을 한 비커에 모았다.", "salt", 3, 300, 13, 200],
  ["간장 양조장에서 서로 다른 탱크에 담긴 소금물을 합치려 한다.", "salt", 11, 360, 26, 240],
];
const mixQuestions: Built[] = mixSeeds.map(([ctx, m, c1, w1, c2, w2]) => {
  const { mat, solute } = MAT[m];
  const s1 = (c1 * w1) / 100;
  const s2 = (c2 * w2) / 100;
  const total = w1 + w2;
  const answer = snap(((s1 + s2) / total) * 100);
  check(Number.isInteger(answer), `혼합 농도 ${answer}`);
  check(Math.abs((answer * total) / 100 - (s1 + s2)) < 1e-9, "혼합 역검산");
  const average = (c1 + c2) / 2;
  return {
    stem: `${ctx} 농도 ${c1}%인 ${mat} ${w1}g과 농도 ${c2}%인 ${mat} ${w2}g을 섞었다. 섞은 ${mat}의 농도는 몇 %인가?`,
    correct: answer,
    unit: "%",
    bounds: [Math.min(c1, c2), Math.max(c1, c2)],
    explanation: `두 ${mat}에 녹아 있는 ${solute}의 양은 ${c1}×${w1}/100=${nt(s1)}g, ${c2}×${w2}/100=${nt(s2)}g으로 모두 ${nt(s1 + s2)}g입니다. 이를 전체 ${total}g으로 나누면 ${nt(s1 + s2)}÷${total}×100=${answer}%입니다.${average !== answer ? ` 두 농도를 단순 평균한 ${nt(average)}%는 두 용액의 양이 다르다는 점을 반영하지 않은 값이라 틀립니다.` : ""}`,
  };
});

// 2) 한쪽 양을 알고 목표 농도에 맞출 다른 쪽 양
const addSeeds: Array<[string, Material, number, number, number, number]> = [
  ["장아찌를 담그려는 가정에서 소금물 농도를 새로 맞추고 있다.", "salt", 6, 300, 16, 10],
  ["양봉 농가에서 꿀벌 먹이로 줄 설탕물의 농도를 조절하고 있다.", "sugar", 20, 150, 8, 12],
  ["치즈 공방에서 치즈를 담가 둘 소금물을 보충하고 있다.", "salt", 5, 240, 25, 9],
  ["카페에서 음료에 넣을 설탕물의 단맛을 맞추고 있다.", "sugar", 30, 250, 10, 18],
  ["식물 생리 연구소에서 염분 스트레스 실험에 쓸 소금물을 준비하고 있다.", "salt", 4, 420, 14, 8],
  ["젓갈 가공 공장에서 두 탱크의 소금물을 한 통에 섞으려 한다.", "salt", 15, 360, 3, 11],
];
const addQuestions: Built[] = addSeeds.map(([ctx, m, c1, w1, c2, t]) => {
  const { mat, solute } = MAT[m];
  const x = snap((w1 * (t - c1)) / (c2 - t));
  check(Number.isInteger(x) && x > 0, `추가량 ${x}`);
  const soluteTotal = (c1 * w1 + c2 * x) / 100;
  check(Math.abs((soluteTotal / (w1 + x)) * 100 - t) < 1e-9, "추가량 역검산");
  return {
    stem: `${ctx} 농도 ${c1}%인 ${mat} ${w1}g에 농도 ${c2}%인 ${asObject(mat)} 섞어 농도 ${t}%인 ${asObject(mat)} 만들려고 한다. 섞어야 할 농도 ${c2}%인 ${mat}의 양은 몇 g인가?`,
    correct: x,
    unit: "g",
    explanation: `섞을 농도 ${c2}%인 ${mat}의 양을 x g이라 하면 ${c1}×${w1}+${c2}x=${t}(${w1}+x)입니다. 정리하면 ${Math.abs(c1 - t) * w1}=${Math.abs(c2 - t)}x이므로 x=${x}g입니다. 검산하면 ${solute} ${nt(soluteTotal)}g이 전체 ${w1 + x}g에 녹아 있어 농도가 ${t}%로 맞습니다.`,
  };
});

// 3) 전체 양과 목표 농도가 주어질 때 각 용액의 양
type TotalAsk = "low" | "high" | "diff" | "solute";
const totalSeeds: Array<[string, Material, number, number, number, number, TotalAsk]> = [
  ["수산 시장의 생선 가게에서 손질한 생선을 담글 소금물을 만들고 있다.", "salt", 6, 21, 11, 450, "high"],
  ["잼 공장에서 과일을 졸이기 전에 쓸 설탕물을 배합하고 있다.", "sugar", 8, 24, 18, 640, "low"],
  ["젤리 제조업체에서 조림용 설탕물을 준비하고 있다.", "sugar", 12, 32, 17, 800, "diff"],
  ["제과 실습실 조교가 학생 실습용 설탕물을 한꺼번에 만들고 있다.", "sugar", 5, 35, 23, 500, "solute"],
  ["식혜를 만드는 가게에서 단맛을 맞출 설탕물을 섞고 있다.", "sugar", 9, 19, 15, 550, "high"],
  ["해수풀 관리 업체가 풀에 채울 소금물을 배합하고 있다.", "salt", 14, 29, 20, 750, "diff"],
];
const totalQuestions: Built[] = totalSeeds.map(([ctx, m, c1, c2, t, T, ask]) => {
  const { mat, solute } = MAT[m];
  const high = snap((T * (t - c1)) / (c2 - c1));
  const low = T - high;
  check(Number.isInteger(high) && high > 0 && low > 0, `분배량 ${high}`);
  check(Math.abs(((c1 * low + c2 * high) / T) - t) < 1e-9, "분배 역검산");
  const soluteHigh = (c2 * high) / 100;
  const correct = { low, high, diff: Math.abs(high - low), solute: soluteHigh }[ask];
  const question = {
    low: `섞은 농도 ${c1}%인 ${mat}의 양은 몇 g인가?`,
    high: `섞은 농도 ${c2}%인 ${mat}의 양은 몇 g인가?`,
    diff: `섞은 두 ${mat}의 양의 차이는 몇 g인가?`,
    solute: `섞은 농도 ${c2}%인 ${mat}에 녹아 있던 ${solute}의 양은 몇 g인가?`,
  }[ask];
  const tail = {
    low: `묻는 것은 농도 ${c1}%인 쪽이므로 ${low}g이 답이고, ${high}g은 반대쪽 양입니다.`,
    high: `묻는 것은 농도 ${c2}%인 쪽이므로 ${high}g이 답이고, ${low}g은 반대쪽 양입니다.`,
    diff: `따라서 두 양의 차이는 ${Math.max(high, low)}-${Math.min(high, low)}=${correct}g입니다.`,
    solute: `이 용액에 녹아 있던 ${asTopic(solute)} ${high}×${c2}/100=${nt(soluteHigh)}g입니다.`,
  }[ask];
  check(Number.isInteger(correct), `정답 ${correct}`);
  return {
    stem: `${ctx} ${togetherWith(`농도 ${c1}%인 ${mat}`)} 농도 ${c2}%인 ${asObject(mat)} 섞어 농도 ${t}%인 ${mat} ${T}g을 만들었다. ${question}`,
    correct,
    unit: "g",
    explanation: `농도 ${c2}%인 ${mat}의 양을 y g이라 하면 농도 ${c1}%인 쪽은 (${T}-y)g입니다. ${c1}(${T}-y)+${c2}y=${t}×${T}에서 ${c2 - c1}y=${(t - c1) * T}, y=${high}g이고 농도 ${c1}%인 쪽은 ${low}g입니다. ${tail}`,
  };
});

// 4) 물 증발
const evapSeeds: Array<[string, Material, number, number, number, "water" | "conc"]> = [
  ["천일염 체험장에서 소금물을 햇볕 아래 두어 졸이고 있다.", "salt", 4, 600, 6, "water"],
  ["조청 공방에서 설탕물을 끓여 졸이고 있다.", "sugar", 9, 700, 15, "water"],
  ["과학관 전시팀이 결정 만들기 시연용 소금물을 가열하고 있다.", "salt", 10, 600, 200, "conc"],
  ["소스 공장에서 간장 베이스로 쓸 소금물을 농축하고 있다.", "salt", 8, 900, 20, "water"],
  ["시럽 제조사가 설탕물을 농축 설비에 넣어 물을 날리고 있다.", "sugar", 12, 450, 150, "conc"],
  ["담수화 연구팀이 농축수 대신 쓸 소금물 시료의 물을 증발시키고 있다.", "salt", 15, 640, 24, "water"],
];
const evapQuestions: Built[] = evapSeeds.map(([ctx, m, c1, W, v, mode]) => {
  const { mat, solute } = MAT[m];
  const s = (c1 * W) / 100;
  if (mode === "water") {
    const remain = snap((s / v) * 100);
    const x = W - remain;
    check(Number.isInteger(x) && x > 0, `증발량 ${x}`);
    check(Math.abs((s / (W - x)) * 100 - v) < 1e-9, "증발 역검산");
    return {
      stem: `${ctx} 농도 ${c1}%인 ${mat} ${W}g에서 물을 증발시켜 농도를 ${v}%로 높이려고 한다. 증발시켜야 할 물의 양은 몇 g인가?`,
      correct: x,
      unit: "g",
      explanation: `물이 증발해도 ${solute} ${nt(s)}g은 그대로 남습니다. 농도가 ${v}%가 되려면 전체가 ${nt(s)}÷${v}×100=${remain}g이어야 하므로 증발시킬 물은 ${W}-${remain}=${x}g입니다. 증발 후 남는 ${mat}의 양 ${remain}g을 답으로 고르면 틀립니다.`,
    };
  }
  const answer = snap((s / (W - v)) * 100);
  check(Number.isInteger(answer), `증발 후 농도 ${answer}`);
  return {
    stem: `${ctx} 농도 ${c1}%인 ${mat} ${W}g에서 물 ${v}g을 증발시켰다. 남은 ${mat}의 농도는 몇 %인가?`,
    correct: answer,
    unit: "%",
    explanation: `${solute} ${nt(s)}g은 그대로이고 전체는 ${W}-${v}=${W - v}g으로 줄어듭니다. 농도는 ${nt(s)}÷${W - v}×100=${answer}%입니다. 증발 전 무게 ${W}g으로 나누면 처음 농도 ${c1}%가 그대로 나와 틀립니다.`,
  };
});

// 5) 물 추가
const waterSeeds: Array<[string, Material, number, number, number, "water" | "total"]> = [
  ["식당 주방에서 너무 짜게 만든 육수용 소금물을 묽히고 있다.", "salt", 18, 400, 12, "water"],
  ["스포츠 음료 시제품을 만드는 연구원이 설탕물을 희석하고 있다.", "sugar", 25, 360, 15, "water"],
  ["수족관 직원이 어항에 넣기 전 진한 소금물을 묽히고 있다.", "salt", 16, 250, 10, "water"],
  ["학교 급식실에서 채소 세척용 소금물을 희석하고 있다.", "salt", 21, 500, 14, "water"],
  ["꽃꽂이 교실에서 꽃병에 넣을 진한 설탕물을 묽히고 있다.", "sugar", 30, 200, 8, "total"],
  ["구청 제설 작업반이 도로에 뿌릴 진한 소금물을 희석하고 있다.", "salt", 9, 800, 6, "water"],
];
const waterQuestions: Built[] = waterSeeds.map(([ctx, m, c1, W, c2, mode]) => {
  const { mat, solute } = MAT[m];
  const s = (c1 * W) / 100;
  const total = snap((s / c2) * 100);
  const x = total - W;
  check(Number.isInteger(x) && x > 0, `추가 물 ${x}`);
  check(Math.abs((s / (W + x)) * 100 - c2) < 1e-9, "희석 역검산");
  if (mode === "total")
    return {
      stem: `${ctx} 농도 ${c1}%인 ${mat} ${W}g에 물을 넣어 농도를 ${c2}%로 낮추었다. 물을 넣은 뒤 ${mat} 전체의 양은 몇 g인가?`,
      correct: total,
      unit: "g",
      explanation: `물을 넣어도 ${solute} ${nt(s)}g은 변하지 않습니다. 이 양이 전체의 ${c2}%이므로 전체는 ${nt(s)}÷${c2}×100=${total}g입니다. 넣은 물만 구한 ${x}g은 묻는 값이 아닙니다.`,
    };
  return {
    stem: `${ctx} 농도 ${c1}%인 ${mat} ${W}g에 물을 넣어 농도를 ${c2}%로 낮추려고 한다. 넣어야 할 물의 양은 몇 g인가?`,
    correct: x,
    unit: "g",
    explanation: `${solute} ${nt(s)}g이 전체의 ${c2}%가 되어야 하므로 물을 넣은 뒤 전체는 ${nt(s)}÷${c2}×100=${total}g입니다. 처음 ${W}g을 빼면 넣을 물은 ${x}g입니다. 전체 양 ${total}g을 그대로 답으로 쓰면 처음 용액까지 물로 센 셈이라 틀립니다.`,
  };
});

// 6) 용질 추가
const soluteSeeds: Array<[string, Material, number, number, number]> = [
  ["피클을 담그던 요리사가 소금물이 싱거워 소금을 더 넣으려 한다.", "salt", 10, 540, 19],
  ["제빵사가 빵 표면에 바를 설탕물을 더 달게 만들려 한다.", "sugar", 8, 460, 20],
  ["연어 염장 업체가 절임용 소금물을 더 진하게 만들려 한다.", "salt", 5, 380, 24],
  ["과일 꼬치 가게에서 코팅용 설탕물에 설탕을 보태려 한다.", "sugar", 12, 616, 23],
  ["초등학교 교사가 달걀 띄우기 실험을 위해 소금물에 소금을 더 녹이려 한다.", "salt", 20, 600, 25],
  ["된장 공방에서 장 담글 소금물을 더 진하게 만들려 한다.", "salt", 4, 340, 15],
];
const soluteQuestions: Built[] = soluteSeeds.map(([ctx, m, c1, W, c2]) => {
  const { mat, solute } = MAT[m];
  const s = (c1 * W) / 100;
  const x = snap((W * (c2 - c1)) / (100 - c2));
  check(Number.isInteger(x) && x > 0, `추가 용질 ${x}`);
  check(Math.abs(((s + x) / (W + x)) * 100 - c2) < 1e-9, "용질 추가 역검산");
  const naive = (W * (c2 - c1)) / 100;
  return {
    stem: `${ctx} 농도 ${c1}%인 ${mat} ${W}g에 ${asObject(solute)} 더 넣어 농도를 ${c2}%로 높이려고 한다. 더 넣어야 할 ${solute}의 양은 몇 g인가?`,
    correct: x,
    unit: "g",
    explanation: `더 넣을 ${asObject(solute)} x g이라 하면 ${solute}의 양은 ${nt(s)}+x, 전체는 ${W}+x이므로 100(${nt(s)}+x)=${c2}(${W}+x)입니다. 정리하면 ${100 - c2}x=${W * (c2 - c1)}, x=${x}g입니다. 전체 무게가 ${W}g 그대로라고 보면 ${nt(naive)}g이 나오지만, 넣은 ${solute}만큼 전체 무게도 늘어나므로 틀립니다.`,
  };
});

// 7) 일부를 덜어 내고 물이나 다른 용액으로 채움
const replaceSeeds: Array<[string, Material, number, number, number, number]> = [
  ["캠핑장 관리인이 설거지용 소금물 통을 관리하고 있다.", "salt", 12, 500, 0, 9],
  ["천연 염색 공방에서 매염용 소금물 통을 손보고 있다.", "salt", 20, 400, 0, 15],
  ["새우 양식장 직원이 수조의 소금물을 교체하고 있다.", "salt", 18, 600, 6, 14],
  ["생물 실습실 조교가 세포 관찰용 소금물을 교체하고 있다.", "salt", 16, 450, 4, 12],
  ["호떡 가게에서 반죽용 설탕물 통을 다시 채우고 있다.", "sugar", 25, 480, 10, 20],
  ["찜질방 운영자가 족욕용 소금물 통의 물을 갈고 있다.", "salt", 9, 810, 0, 7],
];
const replaceQuestions: Built[] = replaceSeeds.map(([ctx, m, c1, W, c3, c2]) => {
  const { mat, solute } = MAT[m];
  const x = snap((W * (c1 - c2)) / (c1 - c3));
  check(Number.isInteger(x) && x > 0 && x < W, `덜어 낸 양 ${x}`);
  check(Math.abs((c1 * (W - x) + c3 * x) / W - c2) < 1e-9, "교체 역검산");
  const filler = c3 === 0 ? "물" : `농도 ${c3}%인 ${mat}`;
  return {
    stem: `${ctx} 농도 ${c1}%인 ${mat} ${W}g에서 일부를 덜어 내고, 덜어 낸 양만큼 ${asObject(filler)} 부었더니 농도가 ${c2}%가 되었다. 덜어 낸 ${mat}의 양은 몇 g인가?`,
    correct: x,
    unit: "g",
    explanation:
      c3 === 0
        ? `덜어 낸 양을 x g이라 하면 남은 ${asTopic(solute)} ${c1}(${W}-x)/100g이고, 물을 부어 전체는 다시 ${W}g이 됩니다. ${c1}(${W}-x)=${c2}×${W}에서 ${c1}x=${W * (c1 - c2)}, x=${x}g입니다. 검산하면 남은 ${solute} ${nt((c1 * (W - x)) / 100)}g이 ${W}g의 ${c2}%와 같습니다.`
        : `덜어 낸 양을 x g이라 하면 ${solute}의 양은 ${c1}(${W}-x)/100+${c3}x/100이고 전체는 다시 ${W}g입니다. ${c1}(${W}-x)+${c3}x=${c2}×${W}에서 ${c1 - c3}x=${W * (c1 - c2)}, x=${x}g입니다. 부은 용액에도 ${asObject(solute)} 넣어 계산해야 하며, 물로 보고 풀면 ${nt((W * (c1 - c2)) / c1)}g이 나와 틀립니다.`,
  };
});

// 8) 증발시킨 만큼 다른 용액이나 용질로 채움
const refillSeeds: Array<[string, Material, number, number, number, number]> = [
  ["염전 견학 프로그램에서 소금물 시연을 하고 있다.", "salt", 5, 600, 20, 9],
  ["홍삼 정과 공방에서 설탕물을 졸여 쓰고 있다.", "sugar", 8, 450, 18, 12],
  ["해조류 가공 공장에서 세척용 소금물 수조를 관리하고 있다.", "salt", 10, 750, 25, 16],
  ["창고에 보관하던 소금물 통에서 물이 조금 날아갔다.", "salt", 6, 500, 100, 14],
  ["밤 조림 가게에서 조림용 설탕물을 끓이고 있다.", "sugar", 12, 350, 100, 20],
  ["소금 결정 관찰 수업에서 비커 속 소금물을 데우고 있다.", "salt", 4, 600, 100, 13],
];
const refillQuestions: Built[] = refillSeeds.map(([ctx, m, c1, W, c3, c2]) => {
  const { mat, solute } = MAT[m];
  const s = (c1 * W) / 100;
  const x = snap((W * (c2 - c1)) / c3);
  check(Number.isInteger(x) && x > 0 && x < W - s, `증발량 ${x}`);
  check(Math.abs(((s + (c3 * x) / 100) / W) * 100 - c2) < 1e-9, "증발 보충 역검산");
  const byPureSolute = c3 === 100;
  const filler = byPureSolute ? solute : `농도 ${c3}%인 ${mat}`;
  const wrongWeight = (W * (c2 - c1)) / (100 - c2);
  return {
    stem: `${ctx} 농도 ${c1}%인 ${mat} ${W}g에서 물을 얼마간 증발시킨 뒤, 증발한 물의 양만큼 ${asObject(filler)} ${byPureSolute ? "넣었더니" : "부었더니"} 농도가 ${c2}%가 되었다. 증발시킨 물의 양은 몇 g인가?`,
    correct: x,
    unit: "g",
    explanation: byPureSolute
      ? `증발시킨 물과 넣은 ${solute}의 양을 모두 x g이라 하면 전체는 ${W}g 그대로이고 ${asTopic(solute)} ${nt(s)}+x g이 됩니다. ${nt(s)}+x=${W}×${c2}/100=${nt((W * c2) / 100)}에서 x=${x}g입니다. 증발한 물과 넣은 ${asTopic(solute)} 양이 같아 전체 무게가 유지된다는 점을 놓치고 전체를 (${W}+x)g으로 두면 ${nt(wrongWeight)}g이 나와 틀립니다.`
      : `증발시킨 물을 x g이라 하면 부은 용액도 x g이라 전체는 다시 ${W}g입니다. ${solute}의 양은 ${nt(s)}+${c3}x/100이므로 ${c1 * W}+${c3}x=${c2 * W}에서 x=${x}g입니다. 검산하면 ${solute} ${nt(s + (c3 * x) / 100)}g이 ${W}g에 녹아 농도가 ${c2}%입니다.`,
  };
});

// 9) 섞은 뒤 물을 더 넣었을 때 모르는 농도 구하기
const unknownSeeds: Array<[string, Material, number, number, number, number, number]> = [
  ["물류 창고에서 제설용 소금물 두 통 가운데 한 통의 라벨이 떨어졌다.", "salt", 6, 300, 200, 100, 7],
  ["요리 경연 참가자가 농도를 적어 두지 않은 소금물을 쓰려 한다.", "salt", 10, 400, 200, 200, 9],
  ["식품 검사원이 농도를 모르는 설탕물 시료를 조사하고 있다.", "sugar", 15, 200, 300, 100, 12],
  ["수족관 창고에서 농도 표시가 지워진 소금물 통이 나왔다.", "salt", 4, 500, 200, 100, 7],
  ["주스 공장 연구원이 농도 기록이 빠진 설탕물 원액을 확인하고 있다.", "sugar", 20, 300, 200, 100, 17],
  ["농업기술센터에서 볍씨 고르기에 쓸 소금물 통의 농도를 점검하고 있다.", "salt", 8, 500, 300, 200, 10],
];
const unknownQuestions: Built[] = unknownSeeds.map(([ctx, m, c1, w1, w2, w, t]) => {
  const { mat, solute } = MAT[m];
  const total = w1 + w2 + w;
  const a = snap((t * total - c1 * w1) / w2);
  check(Number.isInteger(a) && a > 0 && a < 100, `모르는 농도 ${a}`);
  check(Math.abs((c1 * w1 + a * w2) / total - t) < 1e-9, "모르는 농도 역검산");
  const withoutWater = (t * (w1 + w2) - c1 * w1) / w2;
  return {
    stem: `${ctx} 농도 ${c1}%인 ${mat} ${w1}g과 농도를 모르는 ${mat} ${w2}g을 섞은 뒤 물 ${w}g을 더 넣었더니 농도가 ${t}%가 되었다. 농도를 모르던 ${mat}의 농도는 몇 %인가?`,
    correct: a,
    unit: "%",
    explanation: `모르는 농도를 a%라 하면 ${solute}의 양은 ${c1}×${w1}/100+a×${w2}/100이고, 물까지 더한 전체 ${total}g의 ${t}%와 같습니다. ${c1 * w1}+${w2}a=${t * total}에서 a=${a}%입니다. 물 ${w}g을 빼고 ${w1 + w2}g 기준으로 풀면 ${nt(withoutWater)}%가 나와 틀립니다.`,
  };
});

// 10) 여러 단계를 거치는 농도 계산 (답은 모두 최종 농도)
const multiQuestions: Built[] = [
  (() => {
    const parts = [[10, 200], [16, 300], [4, 100]] as const;
    const s = parts.reduce((sum, [c, w]) => sum + (c * w) / 100, 0);
    const W = parts.reduce((sum, [, w]) => sum + w, 0);
    const answer = snap((s / W) * 100);
    check(Number.isInteger(answer), `세 용액 농도 ${answer}`);
    return {
      stem: `축제 부스 세 곳에서 쓰고 남은 소금물을 한 통에 모았다. 농도 10%인 소금물 200g, 농도 16%인 소금물 300g, 농도 4%인 소금물 100g을 모두 섞었다. 섞은 소금물의 농도는 몇 %인가?`,
      correct: answer,
      unit: "%" as const,
      bounds: [4, 16] as [number, number],
      explanation: `소금의 양은 20g, 48g, 4g으로 모두 ${nt(s)}g이고 전체는 ${W}g입니다. ${nt(s)}÷${W}×100=${answer}%입니다. 세 농도를 단순 평균한 10%는 양의 차이를 무시한 값이라 틀립니다.`,
    };
  })(),
  (() => {
    const parts = [[24, 150], [8, 200], [12, 150]] as const;
    const s = parts.reduce((sum, [c, w]) => sum + (c * w) / 100, 0);
    const W = parts.reduce((sum, [, w]) => sum + w, 0);
    const answer = snap((s / W) * 100);
    check(Number.isInteger(answer), `세 설탕물 농도 ${answer}`);
    return {
      stem: `음료 개발팀이 시제품으로 만든 설탕물 세 가지를 한 통에 부었다. 농도 24%인 설탕물 150g, 농도 8%인 설탕물 200g, 농도 12%인 설탕물 150g을 섞은 설탕물의 농도는 몇 %인가?`,
      correct: answer,
      unit: "%" as const,
      bounds: [8, 24] as [number, number],
      explanation: `설탕의 양은 36g, 16g, 18g으로 모두 ${nt(s)}g이고 전체는 ${W}g입니다. ${nt(s)}÷${W}×100=${answer}%입니다. 양이 가장 많은 농도 8% 용액의 비중이 커서 단순 평균 ${nt((24 + 8 + 12) / 3)}%보다 낮은 값이 나옵니다.`,
    };
  })(),
  (() => {
    const s = (12 * 300 + 30 * 200) / 100;
    const W = 300 + 200 + 100;
    const answer = snap((s / W) * 100);
    check(Number.isInteger(answer), `혼합 후 희석 ${answer}`);
    return {
      stem: `과일 가공 공장에서 조림용으로 농도 12%인 설탕물 300g과 농도 30%인 설탕물 200g을 섞은 뒤 물 100g을 더 부었다. 완성된 설탕물의 농도는 몇 %인가?`,
      correct: answer,
      unit: "%" as const,
      explanation: `설탕의 양은 36g+60g=${nt(s)}g이고, 물까지 더한 전체는 ${W}g입니다. ${nt(s)}÷${W}×100=${answer}%입니다. 물을 빼고 500g으로 나누면 ${nt((s / 500) * 100)}%가 되어 틀립니다.`,
    };
  })(),
  (() => {
    const s = (5 * 400 + 11 * 200) / 100;
    const W = 400 + 200 - 180;
    const answer = snap((s / W) * 100);
    check(Number.isInteger(answer), `혼합 후 증발 ${answer}`);
    return {
      stem: `갯벌 체험관에서 농도 5%인 소금물 400g과 농도 11%인 소금물 200g을 섞은 뒤 끓여서 물 180g을 날려 보냈다. 남은 소금물의 농도는 몇 %인가?`,
      correct: answer,
      unit: "%" as const,
      bounds: [7, Infinity] as [number, number],
      explanation: `소금의 양은 20g+22g=${nt(s)}g이고 증발 후 전체는 600-180=${W}g입니다. ${nt(s)}÷${W}×100=${answer}%입니다. 증발 전 600g으로 나누면 섞은 직후 농도 7%가 나오므로 증발을 반영하지 않은 값입니다.`,
    };
  })(),
  (() => {
    const s = (15 * 400) / 100 + 20;
    const W = 400 + 20 + 80;
    const answer = snap((s / W) * 100);
    check(Number.isInteger(answer), `소금과 물 추가 ${answer}`);
    return {
      stem: `두부 공장에서 농도 15%인 소금물 400g에 소금 20g을 녹인 다음 물 80g을 더 부었다. 이렇게 만든 소금물의 농도는 몇 %인가?`,
      correct: answer,
      unit: "%" as const,
      explanation: `소금은 처음 60g에 20g이 더해져 ${nt(s)}g이고, 전체는 400+20+80=${W}g입니다. ${nt(s)}÷${W}×100=${answer}%입니다. 넣은 소금 20g을 전체 무게에 더하지 않으면 ${nt((s / 480) * 100)}%가 되어 틀립니다.`,
    };
  })(),
  (() => {
    const s = (8 * (500 - 100)) / 100 + (20 * 200) / 100;
    const W = 500 - 100 + 200;
    const answer = snap((s / W) * 100);
    check(Number.isInteger(answer), `덜어 낸 뒤 혼합 ${answer}`);
    return {
      stem: `냉면 가게에서 농도 8%인 소금물 500g 가운데 100g을 퍼내 다른 곳에 쓰고, 남은 소금물에 농도 20%인 소금물 200g을 부었다. 섞은 소금물의 농도는 몇 %인가?`,
      correct: answer,
      unit: "%" as const,
      bounds: [8, 20] as [number, number],
      explanation: `남은 400g에 든 소금은 32g이고 새로 부은 200g에 든 소금은 40g이라 모두 ${nt(s)}g입니다. 전체 ${W}g으로 나누면 ${answer}%입니다. 퍼낸 100g을 빼지 않고 500g에 든 소금 40g으로 계산하면 ${nt(((40 + 40) / 700) * 100)}%가 되어 틀립니다.`,
    };
  })(),
];

const built: Built[] = [
  ...mixQuestions,
  ...addQuestions,
  ...totalQuestions,
  ...evapQuestions,
  ...waterQuestions,
  ...soluteQuestions,
  ...replaceQuestions,
  ...refillQuestions,
  ...unknownQuestions,
  ...multiQuestions,
];
check(built.length === 60, `문항 수 ${built.length}`);
check(new Set(built.map((item) => item.stem)).size === 60, "중복 지문");
built.forEach((item) => check(isClean(item.correct), `정답 ${item.correct}`));

export const CM_CONCENTRATION_EXTRA: ExampleQuestion[] = built.map((item, i) =>
  defineQuestion(CATEGORY, KIND, KIND_NAME, 20 + i, {
    stem: item.stem,
    ...sortedChoices(item.correct, item.unit, i % 5, item.bounds),
    explanation: item.explanation,
  }),
);
