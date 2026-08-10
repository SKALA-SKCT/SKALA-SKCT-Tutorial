import { readFile, readdir } from "node:fs/promises";
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
  const { PROBLEMS } = await server.ssrLoadModule("/src/data/problems.ts");
  const failures = [];
  const fail = (id, message) => failures.push(`${id}: ${message}`);
  const categoryByPrefix = {
    vc: { id: "verbal-comprehension", name: "언어이해" },
    da: { id: "data-analysis", name: "자료해석" },
    cm: { id: "creative-math", name: "창의수리" },
    vr: { id: "verbal-reasoning", name: "언어추리" },
    sr: { id: "sequence-reasoning", name: "수열추리" },
  };
  const expectedKinds = PROBLEMS.map((problem) => ({
    category: categoryByPrefix[problem.id.split("-")[0]],
    kind: { id: problem.id, name: problem.internalTypeName },
  }));
  const kindMap = new Map(expectedKinds.map(({ category, kind }) => [kind.id, { category, kind }]));
  const ids = new Set();
  const substantiveQuestions = new Map();
  const visibleQuestionsByKind = new Map();
  const countByKind = new Map();
  const answerPositions = new Map();
  const correctChoicesByKind = new Map();
  const explanationsByKind = new Map();
  const answerCueCounts = new Map();
  const ABSOLUTE_ANSWER_CUE =
    /(항상|모든|절대|완전히|전혀|무관|반드시|오직|영구히|언제나|한 번도|무조건)/;
  const numericValue = (choice) => {
    const match = choice
      .replaceAll(",", "")
      .match(/^(-?\d+(?:\.\d+)?)(?:\/(-?\d+(?:\.\d+)?))?(?:%|시간|일|초|명|개|건|g|세|원)?$/);
    return match ? Number(match[1]) / (match[2] ? Number(match[2]) : 1) : choice;
  };
  const normalizeVisible = (value) =>
    value
      .replace(/\[연습\s*\d+\]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const similarity = (left, right) => {
    const a = normalizeVisible(left);
    const b = normalizeVisible(right);
    if (!a.length || !b.length) return a === b ? 1 : 0;
    let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1) {
      const current = [i];
      for (let j = 1; j <= b.length; j += 1) {
        current[j] = Math.min(
          current[j - 1] + 1,
          previous[j] + 1,
          previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        );
      }
      previous = current;
    }
    return 1 - previous[b.length] / Math.max(a.length, b.length);
  };
  const cellNumber = (value) => Number(String(value).replaceAll(",", ""));
  const evaluateReadingChoice = (question, choice) => {
    const table = question.visuals?.find((visual) => visual.type === "table");
    if (!table) return null;
    const yearIndex = (year) => table.columns.indexOf(year);
    const valueOf = (row, year) => cellNumber(row.cells[yearIndex(year)]);
    const rowByLabel = new Map(table.rows.map((row) => [row.label, row]));
    let match = choice.match(/^2024년 값이 가장 큰 항목은 (.+)이다\.$/);
    if (match) {
      const row = rowByLabel.get(match[1]);
      if (!row) return null;
      const maximum = Math.max(...table.rows.map((item) => valueOf(item, "2024년")));
      return valueOf(row, "2024년") === maximum;
    }
    match = choice.match(/^2022년 값이 가장 작은 항목은 (.+)이다\.$/);
    if (match) {
      const row = rowByLabel.get(match[1]);
      if (!row) return null;
      const minimum = Math.min(...table.rows.map((item) => valueOf(item, "2022년")));
      return valueOf(row, "2022년") === minimum;
    }
    match = choice.match(/^2023년보다 2024년 값이 줄어든 항목은 (\d+)개이다\.$/);
    if (match)
      return (
        table.rows.filter((row) => valueOf(row, "2024년") < valueOf(row, "2023년"))
          .length === Number(match[1])
      );
    match = choice.match(/^2022년보다 2024년 값이 늘어난 항목은 (\d+)개이다\.$/);
    if (match)
      return (
        table.rows.filter((row) => valueOf(row, "2024년") > valueOf(row, "2022년"))
          .length === Number(match[1])
      );
    match = choice.match(/^조사 기간 내내 값이 늘어난 항목은 (\d+)개이다\.$/);
    if (match)
      return (
        table.rows.filter(
          (row) =>
            valueOf(row, "2022년") < valueOf(row, "2023년") &&
            valueOf(row, "2023년") < valueOf(row, "2024년"),
        ).length === Number(match[1])
      );
    match = choice.match(/^(.+)의 값이 가장 컸던 해는 (2022년|2023년|2024년)이다\.$/);
    if (match) {
      const row = rowByLabel.get(match[1]);
      if (!row) return null;
      const values = table.columns.map((year) => valueOf(row, year));
      return valueOf(row, match[2]) === Math.max(...values);
    }
    for (const left of table.rows) {
      const prefix = `${left.label}의 2024년 값은 `;
      if (!choice.startsWith(prefix)) continue;
      for (const right of table.rows) {
        if (choice === `${prefix}${right.label}보다 크다.`)
          return valueOf(left, "2024년") > valueOf(right, "2024년");
      }
      match = choice
        .slice(prefix.length)
        .match(/^2022년보다 ([\d,.]+)(.+?) (많다|적다)\.$/);
      if (match) {
        const displayedDifference = Number(match[1].replaceAll(",", ""));
        const actualDifference = valueOf(left, "2024년") - valueOf(left, "2022년");
        return (
          match[3] === (actualDifference >= 0 ? "많다" : "적다") &&
          displayedDifference === Math.abs(actualDifference)
        );
      }
    }
    return null;
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
    if (!correctChoicesByKind.has(question.kindId))
      correctChoicesByKind.set(question.kindId, new Set());
    correctChoicesByKind.get(question.kindId).add(question.choices[question.answer]);
    if (!explanationsByKind.has(question.kindId))
      explanationsByKind.set(question.kindId, new Set());
    explanationsByKind.get(question.kindId).add(question.explanation);
    if (question.kindId === "vc-main-idea-1" || question.kindId === "vc-blank-1") {
      const cueCount = question.choices.filter(
        (choice, index) => index !== question.answer && ABSOLUTE_ANSWER_CUE.test(choice),
      ).length;
      answerCueCounts.set(question.kindId, (answerCueCounts.get(question.kindId) ?? 0) + cueCount);
    }
    if (question.kindId === "vc-content-match-1" || question.kindId === "vc-inference-1") {
      const cueCount = ABSOLUTE_ANSWER_CUE.test(question.choices[question.answer]) ? 1 : 0;
      answerCueCounts.set(question.kindId, (answerCueCounts.get(question.kindId) ?? 0) + cueCount);
    }

    const metadata = kindMap.get(question.kindId);
    if (!metadata) fail(question.id, `등록되지 않은 세부 유형 ${question.kindId}`);
    else {
      if (question.categoryId !== metadata.category.id) fail(question.id, "대표 유형 ID 불일치");
      if (question.typeLabel !== `${metadata.category.name} / ${metadata.kind.name}`)
        fail(question.id, "화면 유형 표기 불일치");
    }

    if (!question.stem?.trim()) fail(question.id, "질문 없음");
    if (/\[연습\s*\d+\]/.test(question.stem)) fail(question.id, "연습 번호가 질문에 노출됨");
    if (!question.explanation?.trim()) fail(question.id, "해설 없음");
    if (question.choices?.length !== 5) fail(question.id, "보기 5개가 아님");
    if (new Set(question.choices).size !== question.choices.length) fail(question.id, "중복 보기");
    if (new Set(question.choices.map(numericValue)).size !== question.choices.length)
      fail(question.id, "표현만 다르고 값이 같은 보기");
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= 5)
      fail(question.id, "정답 인덱스 오류");
    if (
      question.categoryId !== "creative-math" &&
      !question.passage?.trim() &&
      !question.box?.trim() &&
      !question.visuals?.length
    )
      fail(question.id, "판단에 필요한 지문, 보기, 시각 자료 없음");

    const text = [
      question.stem,
      question.passage,
      question.box,
      question.explanation,
      ...question.choices,
    ].join(" ");
    if (/NaN|undefined|Infinity/.test(text)) fail(question.id, "잘못된 계산 결과 노출");
    if (/[·ㆍ・‧∙•]/.test(text)) fail(question.id, "금지된 중간점 문자 노출");
    if (/\d\.\d{5,}/.test(text)) fail(question.id, "부동소수점 오차 노출");
    if (/서비스은|경로을|검사을|수요을/.test(text)) fail(question.id, "조사 사용 오류");
    if (FALLBACK_CHOICES.some((choice) => question.choices.includes(choice)))
      fail(question.id, "오답 선지가 예비 문구로 채워짐");
    if (question.categoryId === "data-analysis" && !question.visuals?.length)
      fail(question.id, "자료해석 시각 자료 없음");
    if (question.categoryId === "sequence-reasoning" && !question.visuals?.length)
      fail(question.id, "수열추리 시각 자료 없음");
    if (question.categoryId === "verbal-comprehension") {
      const passageLength = question.passage?.replace(/\s/g, "").length ?? 0;
      // 에듀윌·해커스 기출 지문을 공백 없이 세어 보면 짧은 문항도 300자 안팎이다.
      // 아래 값은 현재 문제은행이 실제로 지키고 있는 하한이며, 지문을 줄이는 수정이 들어오면 여기서 걸린다.
      const minimumPassageLength = {
        "vc-main-idea-1": 300,
        "vc-blank-1": 250,
        "vc-insertion-1": 330,
        "vc-paragraph-order-1": 340,
        "vc-content-match-1": 255,
        "vc-inference-1": 255,
        "vc-critique-1": 245,
      }[question.kindId];
      if (minimumPassageLength && passageLength < minimumPassageLength)
        fail(
          question.id,
          `언어이해 지문이 실전형 최소 분량보다 짧음 (${passageLength}자, 기준 ${minimumPassageLength}자)`,
        );
    }

    // 8/3일을 2.67일로 적으면 표시된 정답이 실제 답과 달라 정답이 없는 문제가 된다.
    // 창의수리와 수열추리의 선지는 소수 두 자리까지만 허용해 반올림한 값이 정답 자리에 오지 못하게 막는다.
    if (question.categoryId === "creative-math" || question.categoryId === "sequence-reasoning") {
      const rounded = question.choices.filter((choice) => /\d\.\d{3,}/.test(choice));
      if (rounded.length) fail(question.id, `반올림한 값이 선지에 노출됨: ${rounded.join(", ")}`);
    }

    // 같은 대상을 두고 값만 다른 선지가 나란히 있으면 둘 중 하나가 답이라는 사실이 드러난다.
    const choiceSubjects = question.choices
      .map((choice) => choice.match(/^(\S+?)의/))
      .filter(Boolean)
      .map((match) => match[1]);
    const duplicatedSubject = choiceSubjects.find(
      (subject, index) => choiceSubjects.indexOf(subject) !== index,
    );
    if (question.categoryId === "data-analysis" && duplicatedSubject)
      fail(question.id, `같은 대상을 가리키는 선지가 둘 이상: ${duplicatedSubject}`);

    const typeChecks = {
      "da-reading-1": /옳지 않은/,
      "da-calc-1": /옳지 않은/,
      "cm-probability-1": /적어도/,
      "cm-dst-1": /같은 거리/,
      "sr-arithgeo-1": /등비수열/,
      "sr-various-1": /홀수 번째.*짝수 번째|짝수 번째.*홀수 번째/,
      "sr-special-1": /차이.*반복|반복.*차이/,
    };
    const typePattern = typeChecks[question.kindId];
    if (typePattern && !typePattern.test(`${question.stem} ${question.explanation}`))
      fail(question.id, "세부 유형의 핵심 조건이 질문과 해설에 드러나지 않음");

    if (question.kindId === "da-reading-1") {
      const truthValues = question.choices.map((choice) => evaluateReadingChoice(question, choice));
      if (truthValues.some((value) => value === null))
        fail(question.id, "표에서 직접 검증할 수 없는 자료해석 선지가 있음");
      else {
        const falseIndexes = truthValues
          .map((value, index) => (value ? -1 : index))
          .filter((index) => index >= 0);
        if (falseIndexes.length !== 1)
          fail(
            question.id,
            `거짓 선지가 ${falseIndexes.length}개임: ${falseIndexes.map((index) => index + 1).join(", ")}번 (정확히 1개 필요)`,
          );
        else if (falseIndexes[0] !== question.answer)
          fail(question.id, `표에서 계산한 정답은 ${falseIndexes[0] + 1}번임`);
      }
    }

    if (question.kindId === "vc-insertion-1") {
      const statedPositions = [...question.explanation.matchAll(/\(([A-E])\)/g)].map(
        (match) => `(${match[1]})`,
      );
      const statedPosition = statedPositions.at(-1);
      if (!statedPosition) fail(question.id, "문장 삽입 해설에 정답 위치가 없음");
      else if (statedPosition !== question.choices[question.answer])
        fail(question.id, "문장 삽입 해설의 위치와 등록 정답이 불일치");
    }

    const answerMarker = question.explanation.match(/정답(?:은|:)\s*(?:([①②③④⑤])|([1-5])번)/);
    if (answerMarker) {
      const markers = ["①", "②", "③", "④", "⑤"];
      const stated = answerMarker[1]
        ? markers.indexOf(answerMarker[1])
        : Number(answerMarker[2]) - 1;
      if (stated !== question.answer) fail(question.id, "해설에 적힌 정답 번호와 실제 정답 불일치");
    }

    const substantiveKey = JSON.stringify([
      normalizeVisible(question.stem),
      normalizeVisible(question.passage),
      question.box,
      question.visuals,
      [...question.choices].sort(),
    ]);
    if (substantiveQuestions.has(substantiveKey))
      fail(question.id, `${substantiveQuestions.get(substantiveKey)}와 동일한 문항`);
    substantiveQuestions.set(substantiveKey, question.id);

    const visualText = (question.visuals ?? [])
      .map((visual) => {
        if (visual.type === "sequence") return visual.items.map((item) => item.value).join(" ");
        if (visual.type === "table")
          return [
            visual.title,
            ...visual.columns,
            ...visual.rows.flatMap((row) => [row.label, ...row.cells]),
          ].join(" ");
        return [
          visual.title,
          ...visual.categories,
          ...visual.series.flatMap((series) => series.values),
        ].join(" ");
      })
      .join(" ");
    const visible = normalizeVisible(
      [question.stem, question.passage, question.box, visualText].join(" "),
    );
    const previousVisible = visibleQuestionsByKind.get(question.kindId) ?? [];
    for (const previous of previousVisible) {
      if (
        visible.length > 60 &&
        previous.text.length > 60 &&
        similarity(visible, previous.text) > 0.985
      )
        fail(question.id, `${previous.id}와 화면 내용이 지나치게 유사함`);
    }
    previousVisible.push({ id: question.id, text: visible });
    visibleQuestionsByKind.set(question.kindId, previousVisible);
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

  // 스무 문항이 같은 해설을 쓰면 왜 그 선지가 답인지 알려 주지 못한다.
  for (const [kindId, texts] of explanationsByKind)
    if (texts.size < 18)
      fail(kindId, `해설이 문항별로 다르지 않음 (고유 해설 ${texts.size}개 / 20문항)`);

  if ((correctChoicesByKind.get("vc-paragraph-order-1")?.size ?? 0) < 4)
    fail("vc-paragraph-order-1", "문단 배열 정답 순서가 충분히 다양하지 않음");

  // 극단 표현이 오답이나 정답에 반복되면 지문을 읽지 않고도 답을 고를 수 있다.
  for (const kindId of [
    "vc-main-idea-1",
    "vc-blank-1",
    "vc-content-match-1",
    "vc-inference-1",
  ]) {
    const cueCount = answerCueCounts.get(kindId) ?? 0;
    if (cueCount > 5)
      fail(kindId, `정답을 노출하는 극단 표현이 과다함 (${cueCount}개, 허용 5개)`);
  }

  const sourceUrls = [new URL("../src/data/exampleQuestions.ts", import.meta.url)];
  const bankDirectory = new URL("../src/data/exampleBanks/", import.meta.url);
  for (const filename of await readdir(bankDirectory)) {
    if (filename.endsWith(".ts")) sourceUrls.push(new URL(filename, bankDirectory));
  }
  for (const sourceUrl of sourceUrls) {
    const source = await readFile(sourceUrl, "utf8");
    for (const line of source.split("\n")) {
      const match = line.match(HARDCODED_PARTICLE);
      if (match)
        fail(
          sourceUrl.pathname.split("/").at(-1),
          `치환값 뒤 조사 고정: ${match.join(", ")} — ${line.trim()}`,
        );
    }
  }

  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      `검증 완료: ${questions.length}문항, ${expectedKinds.length}개 세부 유형, 중복/구조/표기/시각 자료 오류 0건`,
    );
  }
} finally {
  await server.close();
}
