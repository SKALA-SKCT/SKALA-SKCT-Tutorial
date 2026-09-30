import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";
const mockRoot = new URL("../SKALA-SKCT-MockTest/", import.meta.url);
const subjectOf = { "verbal-comprehension": "언어이해", "data-analysis": "자료해석", "creative-math": "창의수리", "verbal-reasoning": "언어추리", "sequence-reasoning": "수열추리" };
const norm = value => String(value ?? "").replace(/\s+/g, "");
const grams = value => new Set(Array.from({ length: Math.max(0, value.length - 2) }, (_, i) => value.slice(i, i + 3)));
const overlap = (a, b) => {
  let count = 0;
  for (const gram of a) if (b.has(gram)) count++;
  return 2 * count / Math.max(1, a.size + b.size);
};
const loader = registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(specifier.startsWith(".") && !/\.[cm]?[jt]sx?$/.test(specifier) ? `${specifier}.ts` : specifier, context);
  },
});
try {
  const { EXTRA_QUESTION_BANK: extra } = await import("./src/data/extraQuestions.ts");
  const { EXAMPLE_QUESTION_BANK: base } = await import("./src/data/exampleQuestions.ts");
  const verified = JSON.parse(await readFile(new URL("src/lib/pdf-verified-text.json", mockRoot), "utf8"));
  const ocr = JSON.parse(await readFile(process.env.OCR_PATH ?? "/private/tmp/skct-mock-ocr-verified.json", "utf8"));
  const mock = [];
  const missing = [];
  for (const filename of await readdir(new URL("data/", mockRoot))) {
    if (!/^round-\d+\.json$/.test(filename)) continue;
    const round = filename.match(/\d+/)[0];
    for (const q of JSON.parse(await readFile(new URL(`data/${filename}`, mockRoot), "utf8"))) {
      const override = verified[`${round}:${q.number}`] ?? {};
      const imageUrl = override.imageUrl ?? q.imageUrl;
      const imageText = imageUrl ? ocr[fileURLToPath(new URL(`public${imageUrl}`, mockRoot))] : "";
      if (imageUrl && !imageText) missing.push(`${filename}#${q.number}`);
      const text = norm([override.body ?? q.body, imageText].join(""));
      mock.push({ id: `${filename}#${q.number}`, subject: q.subject, g: grams(text) });
    }
  }
  if (missing.length) throw new Error(`모의고사 이미지 인식 누락 ${missing.length}개: ${missing.slice(0, 10).join(", ")}`);
  const text = q => norm(q.passage
    ? [q.passage, q.box].join("")
    : [q.stem, JSON.stringify(q.visuals ?? [], (key, value) => key === "id" ? undefined : value)].join(""));
  const threshold = Number(process.env.T ?? 0.65);
  const hits = [];
  const sequence = q => q.visuals?.find(v => v.type === "sequence")?.items.map(item => item.value.trim()) ?? null;
  const prepared = bank => bank.map(q => ({ q, g: grams(text(q)), values: sequence(q) }));
  const baseG = prepared(base);
  const extraG = prepared(extra);
  const compare = (q, g, otherId, otherG, source) => {
    const score = overlap(g, otherG);
    if (score > threshold) hits.push({ id: q.id, otherId, source, score: Number(score.toFixed(3)) });
  };
  const compareQuestion = (q, g, values, other, source) => {
    if (values && other.values) {
      if (values.length !== other.values.length) return;
      const score = values.filter((value, index) => value === other.values[index]).length / values.length;
      if (score > threshold) hits.push({ id: q.id, otherId: other.q.id, source, score });
    } else compare(q, g, other.q.id, other.g, source);
  };
  for (const [i, { q, g, values }] of extraG.entries()) {
    for (const m of mock) if (m.subject === subjectOf[q.categoryId]) compare(q, g, m.id, m.g, "mock");
    for (const other of baseG) if (other.q.categoryId === q.categoryId) compareQuestion(q, g, values, other, "base");
    for (const other of extraG.slice(i + 1)) if (other.q.categoryId === q.categoryId) compareQuestion(q, g, values, other, "extra");
  }
  hits.sort((a, b) => b.score - a.score);
  console.log(`추가 ${extra.length}문항, 모의고사 ${mock.length}문항, 유사도 ${threshold} 초과 후보 ${hits.length}쌍`);
  console.log(JSON.stringify(hits, null, 2));
} finally { loader.deregister(); }
