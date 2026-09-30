import { useEffect, useState } from "react";
import type { Category } from "../data/catalog";
import { SET_SIZE, setsForCategory, type ProblemSet } from "../data/problemSets";
import { getSetRecords, type SetRecord } from "../api/setRecords";

const RECENT_RECORD_COUNT = 3;

function scoreOf(set: ProblemSet, record: SetRecord): number {
  return set.questions.filter((question) => record.answers[question.id] === question.answer).length;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SetList({
  category,
  onBack,
  onStart,
  onViewRecord,
}: {
  category: Category;
  onBack: () => void;
  onStart: (set: ProblemSet) => void;
  onViewRecord: (set: ProblemSet, record: SetRecord) => void;
}) {
  const [records, setRecords] = useState<SetRecord[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const sets = setsForCategory(category.id);

  useEffect(() => {
    getSetRecords()
      .then(setRecords)
      .catch(() => setLoadFailed(true));
  }, []);

  return (
    <section className="catalog-page">
      <button className="btn-back" onClick={onBack}>
        ← 문제 세트
      </button>
      <header className="catalog-head">
        <div>
          <h1>{category.name} 문제 세트</h1>
          <p>
            세부 유형을 고르게 섞은 {SET_SIZE}문제 세트입니다. 풀고 나면 점수와 결과가 기록됩니다.
          </p>
        </div>
      </header>
      {loadFailed && (
        <p className="set-notice">기록을 불러오지 못했습니다. 로그인 상태를 확인해 주세요.</p>
      )}
      <div className="set-grid">
        {sets.map((set) => {
          const attempts = (records ?? []).filter((record) => record.setId === set.id).reverse();
          const best = attempts.length
            ? Math.max(...attempts.map((record) => scoreOf(set, record)))
            : null;
          return (
            <article className={`set-card category-${category.id}`} key={set.id}>
              <header>
                <h2>세트 {set.number}</h2>
                <span>{best === null ? "기록 없음" : `최고 ${best}/${SET_SIZE}`}</span>
              </header>
              {attempts.length > 0 && (
                <ul className="set-records" aria-label={`세트 ${set.number} 응시 기록`}>
                  {attempts.slice(0, RECENT_RECORD_COUNT).map((record) => (
                    <li key={record.id}>
                      <button type="button" onClick={() => onViewRecord(set, record)}>
                        <span>{formatDate(record.createdAt)}</span>
                        <b>
                          {scoreOf(set, record)}/{SET_SIZE}
                        </b>
                        <small>결과 보기</small>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {attempts.length > RECENT_RECORD_COUNT && (
                <p className="set-record-more">
                  최근 {RECENT_RECORD_COUNT}회만 표시합니다. 총 {attempts.length}회 응시했습니다.
                </p>
              )}
              <button type="button" className="set-start" onClick={() => onStart(set)}>
                {attempts.length ? "다시 풀기" : "문제 풀기"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
