import { createServer } from "vite";

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
