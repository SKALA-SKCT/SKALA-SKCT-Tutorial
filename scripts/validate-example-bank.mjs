import { readFile } from "node:fs/promises";
import { createServer } from "vite";

/**
 * 템플릿 문자열에서 치환값 바로 뒤에 조사를 직접 적으면 값에 따라 조사가 어긋난다.
 * 표면 문장만 보고는 조사와 어간을 구분할 수 없으므로 생성기 소스에서 막는다.
 */
const HARDCODED_PARTICLE = /\}(은|는|이|가|을|를|과|와|으로|로)(?=[\s.,)?"`])/g;

/** 오답 후보가 모자랄 때만 쓰이는 예비 문구. 실제 선지에 등장하면 생성 로직 결함이다. */
const FALLBACK_CHOICES = [
  "조건만으로 구할 수 없다",
  "제시된 값 중에는 없다",
  "모든 값이 가능하다",
  "조건이 서로 모순된다",
];

const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });

try {
  const { EXAMPLE_QUESTION_BANK: questions } = await server.ssrLoadModule(
    "/src/data/exampleQuestions.ts",
  );
  const { CATEGORIES } = await server.ssrLoadModule("/src/data/catalog.ts");
  const failures = [];
  const fail = (id, message) => failures.push(`${id}: ${message}`);
  const expectedKinds = CATEGORIES.flatMap((category) =>
    category.subtypes.flatMap((subtype) => subtype.kinds.map((kind) => ({ category, kind }))),
  );
  const kindMap = new Map(expectedKinds.map(({ category, kind }) => [kind.id, { category, kind }]));
  const ids = new Set();
  const substantiveQuestions = new Map();
  const countByKind = new Map();
  const answerPositions = new Map();
  const numericValue = (choice) => {
    const match = choice
      .replaceAll(",", "")
      .match(/^(-?\d+(?:\.\d+)?)(?:\/(-?\d+(?:\.\d+)?))?(?:%|시간|일|초|명|개|건|g|세|원)?$/);
    return match ? Number(match[1]) / (match[2] ? Number(match[2]) : 1) : choice;
  };

  if (questions.length !== expectedKinds.length * 20)
    fail("bank", `문항 수 ${questions.length}개 (예상 ${expectedKinds.length * 20}개)`);

  for (const question of questions) {
    if (ids.has(question.id)) fail(question.id, "중복 ID");
    ids.add(question.id);
    countByKind.set(question.kindId, (countByKind.get(question.kindId) ?? 0) + 1);
    if (!answerPositions.has(question.kindId))
      answerPositions.set(question.kindId, [0, 0, 0, 0, 0]);
    answerPositions.get(question.kindId)[question.answer] += 1;

    const metadata = kindMap.get(question.kindId);
    if (!metadata) fail(question.id, `등록되지 않은 세부 유형 ${question.kindId}`);
    else {
      if (question.categoryId !== metadata.category.id) fail(question.id, "대표 유형 ID 불일치");
      if (question.typeLabel !== `${metadata.category.name} / ${metadata.kind.name}`)
        fail(question.id, "화면 유형 표기 불일치");
    }

    if (!question.stem?.trim()) fail(question.id, "질문 없음");
    if (!question.explanation?.trim()) fail(question.id, "해설 없음");
    if (question.choices?.length !== 5) fail(question.id, "보기 5개가 아님");
    if (new Set(question.choices).size !== question.choices.length) fail(question.id, "중복 보기");
    if (new Set(question.choices.map(numericValue)).size !== question.choices.length)
      fail(question.id, "표현만 다르고 값이 같은 보기");
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= 5)
      fail(question.id, "정답 인덱스 오류");
    if (!question.passage?.trim() && !question.box?.trim() && !question.visuals?.length)
      fail(question.id, "판단에 필요한 지문·보기·시각 자료 없음");

    const text = [
      question.stem,
      question.passage,
      question.box,
      question.explanation,
      ...question.choices,
    ].join(" ");
    if (/NaN|undefined|Infinity/.test(text)) fail(question.id, "잘못된 계산 결과 노출");
    if (/\d\.\d{5,}/.test(text)) fail(question.id, "부동소수점 오차 노출");
    if (/서비스은|경로을|검사을|수요을/.test(text)) fail(question.id, "조사 사용 오류");
    if (FALLBACK_CHOICES.some((choice) => question.choices.includes(choice)))
      fail(question.id, "오답 선지가 예비 문구로 채워짐");
    if (question.categoryId === "data-analysis" && !question.visuals?.length)
      fail(question.id, "자료해석 시각 자료 없음");
    if (question.categoryId === "sequence-reasoning" && !question.visuals?.length)
      fail(question.id, "수열추리 시각 자료 없음");

    const substantiveKey = JSON.stringify([
      question.stem,
      question.passage,
      question.box,
      question.visuals,
      [...question.choices].sort(),
    ]);
    if (substantiveQuestions.has(substantiveKey))
      fail(question.id, `${substantiveQuestions.get(substantiveKey)}와 동일한 문항`);
    substantiveQuestions.set(substantiveKey, question.id);
  }

  for (const { kind } of expectedKinds)
    if (countByKind.get(kind.id) !== 20)
      fail(kind.id, `문항 수 ${countByKind.get(kind.id) ?? 0}개 (예상 20개)`);

  // 정답 번호가 한두 자리에 몰리면 문제를 풀지 않고도 답을 찍을 수 있다.
  for (const [kindId, positions] of answerPositions) {
    const used = positions.filter((count) => count > 0).length;
    if (used < 4) fail(kindId, `정답 번호 분포 ${positions.join("/")} (사용된 자리 ${used}개)`);
    if (positions.some((count) => count > 10))
      fail(kindId, `정답 번호 분포 ${positions.join("/")} (한 자리에 절반 초과)`);
  }

  const source = await readFile(
    new URL("../src/data/exampleQuestions.ts", import.meta.url),
    "utf8",
  );
  for (const line of source.split("\n")) {
    const match = line.match(HARDCODED_PARTICLE);
    if (match)
      fail("exampleQuestions.ts", `치환값 뒤 조사 고정: ${match.join(", ")} — ${line.trim()}`);
  }

  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      `검증 완료: ${questions.length}문항 · ${expectedKinds.length}개 세부 유형 · 중복/구조/표기/시각 자료 오류 0건`,
    );
  }
} finally {
  await server.close();
}
