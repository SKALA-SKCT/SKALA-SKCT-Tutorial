const PRACTICE_PREFIX = /^\[연습 \d+\]\s*/;

export function displayQuestionStem(stem: string): string {
  return stem.replace(PRACTICE_PREFIX, "");
}
