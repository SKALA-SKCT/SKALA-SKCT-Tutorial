import { useEffect, useState } from "react";
import type { Category } from "../data/catalog";
import { SET_SIZE, scoreOf, setsForCategory, type ProblemSet } from "../data/problemSets";
import { getSetRecords, type SetRecord } from "../api/setRecords";

export default function SetList({
  category,
  onBack,
  onStart,
  onResult,
}: {
  category: Category;
  onBack: () => void;
  onStart: (set: ProblemSet) => void;
  onResult: (set: ProblemSet) => void;
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
            세부 유형을 고르게 섞은 {SET_SIZE}문제 세트입니다. 여러 번 응시할 수 있고 회차별 결과가
            기록됩니다.
          </p>
        </div>
      </header>
      {loadFailed && (
        <p className="set-notice">기록을 불러오지 못했습니다. 로그인 상태를 확인해 주세요.</p>
      )}
      <div className="set-list" role="table" aria-label="문제 세트 목록">
        <div className="set-list-row set-list-head" role="row">
          <span role="columnheader">세트</span>
          <span role="columnheader">응시</span>
          <span role="columnheader">최고 점수</span>
          <span role="columnheader">최근 점수</span>
          <span role="columnheader" aria-label="응시와 결과" />
        </div>
        {sets.map((set) => {
          const attempts = (records ?? []).filter((record) => record.setId === set.id);
          const scores = attempts.map((record) => scoreOf(set, record));
          const latest = scores.at(-1);
          return (
            <div className="set-list-row" role="row" key={set.id}>
              <strong role="cell">세트 {set.number}</strong>
              <span role="cell" data-label="응시">
                {attempts.length}회
              </span>
              <span role="cell" data-label="최고 점수">
                {scores.length ? `${Math.max(...scores)}/${SET_SIZE}` : "-"}
              </span>
              <span role="cell" data-label="최근 점수">
                {latest === undefined ? "-" : `${latest}/${SET_SIZE}`}
              </span>
              <div role="cell" className="set-list-actions">
                <button
                  type="button"
                  className="set-result-button"
                  disabled={attempts.length === 0}
                  onClick={() => onResult(set)}
                >
                  결과 보기
                </button>
                <button type="button" className="set-start" onClick={() => onStart(set)}>
                  {attempts.length ? "재응시" : "응시하기"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
