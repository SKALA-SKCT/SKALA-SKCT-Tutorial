import type { ExampleQuestion } from "../catalog";
import { defineQuestion } from "../exampleBanks/bankUtils";

// cm-dst-1: 문제 세트와 랜덤 문제에만 쓰는 추가 문항 60개 (id 번호 21~80)

const CATEGORY = "creative-math";
const KIND_ID = "cm-dst-1";
const KIND_NAME = "거리, 속력, 시간 (거리 동일)";

function hasFinalConsonant(value: string) {
  const code = value.charCodeAt(value.length - 1);
  return code >= 0xac00 && code <= 0xd7a3 ? (code - 0xac00) % 28 !== 0 : false;
}
function withJosa(value: string, consonant: string, vowel: string) {
  return `${value}${hasFinalConsonant(value) ? consonant : vowel}`;
}
const asTopic = (value: string) => withJosa(value, "은", "는");
const asSubject = (value: string) => withJosa(value, "이", "가");
const togetherWith = (value: string) => withJosa(value, "과", "와");

function assertInt(value: number, label: string) {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${label} 값이 양의 정수가 아님: ${value}`);
  return value;
}

/** 분을 "1시간 45분"처럼 읽기 쉬운 표기로 바꾼다. */
function timeText(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}분`;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}
const km = (value: number) => `${value}km`;
const kmh = (value: number) => `시속 ${value}km`;
const min = (value: number) => `${value}분`;
const sec = (value: number) => `${value}초`;

function stepFor(value: number) {
  return Math.max(1, Math.round(value / 12));
}

/** 함정 값을 넣고 나머지를 정답 주변의 같은 간격 값으로 채워, 정답이 오름차순 rank번째에 오게 한다. */
function arrange(correct: number, traps: number[], rank: number, step: number) {
  const chosen = traps.filter((t, i) => t !== correct && traps.indexOf(t) === i);
  const pool: number[] = [];
  for (let k = 1; k <= 8; k += 1) pool.push(correct - k * step, correct + k * step);
  const free = pool.filter((v) => v > 0 && !chosen.includes(v));
  const lower = free.filter((v) => v < correct).sort((a, b) => b - a);
  const upper = free.filter((v) => v > correct).sort((a, b) => a - b);
  const remaining = 4 - chosen.length;
  const below = chosen.filter((v) => v < correct).length;
  const wantBelow = Math.max(0, Math.min(remaining, rank - below));
  const fills = lower.slice(0, wantBelow);
  fills.push(...upper.slice(0, remaining - fills.length));
  if (fills.length < remaining) fills.push(...lower.slice(wantBelow, wantBelow + remaining - fills.length));
  const all = [correct, ...chosen, ...fills].sort((a, b) => a - b);
  if (all.length !== 5 || new Set(all).size !== 5) throw new Error(`선지 구성 실패: ${correct} / ${all.join(", ")}`);
  return all;
}

interface Built {
  stem: string;
  correct: number;
  format: (value: number) => string;
  step: number;
  body: string;
  notes: Array<[number, string]>;
}

function build(
  stem: string,
  correct: number,
  format: (value: number) => string,
  body: string,
  notes: Array<[number, string]>,
  step = stepFor(correct),
): Built {
  assertInt(correct, "정답");
  const kept = notes.filter(
    ([value], i) =>
      Number.isInteger(value) && value > 0 && value !== correct && notes.findIndex(([v]) => v === value) === i,
  );
  return { stem, correct, format, step, body, notes: kept };
}

// 1) 같은 길 왕복: 갈 때와 올 때 속력이 다르고 총 시간이 주어질 때 편도 거리
const roundTripSeeds = [
  [4, 20, 10, "지우는", "호숫가 전망대", "걸어갔고", "자전거를 타고 왔다"],
  [3, 8, 6, "민재는", "산 중턱 약수터", "걸어 올라갔고", "산악자전거를 타고 내려왔다"],
  [4, 10, 5, "수아는", "동네 도서관", "걸어갔고", "전동 킥보드를 탔다"],
  [15, 45, 45, "농부는", "읍내 농기계 정비소", "경운기를 몰고 갔고", "정비를 마친 경운기를 트럭에 싣고 왔다"],
  [40, 60, 48, "영업 사원은", "거래처 공장", "출근 시간대의 막히는 도로를 달렸고", "한산해진 도로를 달렸다"],
  [12, 18, 36, "자전거 동호회는", "고개 너머 해안 마을", "오르막 위주의 길을 달렸고", "내리막 위주가 된 같은 길을 달렸다"],
  [16, 40, 20, "대학생 윤호는", "교외 캠퍼스", "자전거로 갔고", "학교 셔틀버스를 탔다"],
  [12, 24, 12, "배달 기사는", "산업 단지 구내식당", "국물 음식을 싣고 조심스럽게 달렸고", "빈 배달통으로 달렸다"],
  [15, 24, 30, "철인 3종 훈련생은", "훈련 코스의 반환 지점", "달려서 갔고", "자전거를 탔다"],
  [30, 40, 30, "관광객은", "섬 반대편 해변", "순환 버스를 탔고", "택시를 탔다"],
  [8, 10, 20, "달리기 동호회원은", "강 상류 쉼터", "천천히 달려갔고", "속도를 높여 달려왔다"],
  [80, 120, 180, "출장자는", "지방 사업장", "눈길을 조심해서 달렸고", "제설이 끝난 도로를 달렸다"],
  [6, 18, 9, "견학 온 학생들은", "해안 풍력 단지", "빠른 걸음으로 걸어갔고", "전기 셔틀을 탔다"],
] as const;

function buildRoundTrip([v1, v2, d, who, place, how1, how2]: (typeof roundTripSeeds)[number]): Built {
  const go = assertInt((d * 60) / v1, "갈 때 시간");
  const back = assertInt((d * 60) / v2, "올 때 시간");
  const total = go + back;
  if ((d * (v1 + v2) * 60) / (v1 * v2) !== total) throw new Error("왕복 역검산 실패");
  const meanTrap = (total / 60) * ((v1 + v2) / 2) / 2;
  return build(
    `${who} ${place}에 갈 때는 시속 ${v1}km로 ${how1}, 돌아올 때는 같은 길을 시속 ${v2}km로 ${how2}. 왕복에 걸린 시간이 모두 ${timeText(total)}일 때, ${place}까지의 거리는?`,
    d,
    km,
    `갈 때와 올 때는 같은 거리이므로 편도 거리를 xkm로 두면 x/${v1}+x/${v2}=${total}/60입니다. 이 식을 풀면 x=${d}이고, 실제로 갈 때 ${timeText(go)}, 올 때 ${asSubject(timeText(back))} 걸려 합이 ${timeText(total)}입니다.`,
    [
      [2 * d, "왕복 전체 거리로, 편도 거리를 묻는 질문의 답이 아닙니다."],
      [meanTrap, `두 속력의 산술평균 시속 ${(v1 + v2) / 2}km로 왕복했다고 보고 계산한 값입니다. 같은 거리에서는 느린 구간에 더 오래 머물러 산술평균을 쓸 수 없습니다.`],
    ],
    d < 10 ? 1 : d < 30 ? 2 : d < 100 ? 6 : 15,
  );
}

// 2) 왕복 평균 속력, 또는 평균 속력으로 한쪽 속력 구하기
const averageSeeds = [
  [40, 60, "avg", "통근 버스는", "연수원"],
  [70, 30, "avg", "견인차는", "고장 차량이 멈춘 터널 입구"],
  [12, 24, "avg", "자전거로 출퇴근하는 소희는", "회사"],
  [10, 15, "avg", "인라인스케이트 강사는", "공원 반환점"],
  [60, 90, "avg", "렌터카를 빌린 여행객은", "공항"],
  [72, 36, "avg", "출동한 소방차는", "산불 현장 진입로"],
  [20, 30, "avg", "스쿠터를 탄 수리 기사는", "고객의 집"],
  [48, 80, "other", "캠핑카는", "산속 캠핑장"],
  [30, 45, "other", "관광 열차는", "종착역"],
  [56, 42, "other", "환자를 태우러 간 구급차는", "시립 병원"],
  [24, 40, "other", "산악 오토바이 동호회는", "임도 정상"],
  [14, 35, "other", "요트는", "등대가 있는 섬"],
] as const;

function buildAverage([v1, v2, mode, who, place]: (typeof averageSeeds)[number]): Built {
  const avg = assertInt((2 * v1 * v2) / (v1 + v2), "평균 속력");
  const arithmetic = (v1 + v2) / 2;
  if ((2 * 1) / (1 / v1 + 1 / v2) - avg > 1e-9) throw new Error("평균 속력 역검산 실패");
  if (mode === "avg")
    return build(
      `${who} ${place}까지 갈 때는 시속 ${v1}km, 같은 길로 돌아올 때는 시속 ${v2}km로 달렸다. 왕복 전체의 평균 속력은?`,
      avg,
      kmh,
      `갈 때와 올 때는 같은 거리이므로 편도 거리를 d로 두면 전체 거리는 2d, 전체 시간은 d/${v1}+d/${v2}입니다. 평균 속력은 2d÷(d/${v1}+d/${v2})=2×${v1}×${v2}÷(${v1}+${v2})=${avg}km/h입니다.`,
      [[arithmetic, `두 속력을 단순 평균한 값입니다. 같은 거리라도 느린 쪽에서 시간이 더 걸리므로 평균 속력은 이보다 작습니다.`]],
    );
  const wrong = 2 * avg - v1;
  return build(
    `${who} ${place}까지 갈 때 시속 ${v1}km로 달린 뒤 같은 길로 돌아왔다. 왕복 전체의 평균 속력이 시속 ${avg}km였다면 돌아올 때의 속력은?`,
    v2,
    kmh,
    `갈 때와 올 때는 같은 거리이므로 평균 속력은 2×${v1}×v÷(${v1}+v)=${avg}입니다. 정리하면 ${2 * v1 - avg}v=${avg * v1}이므로 v=${v2}km/h입니다. 검산하면 2×${v1}×${v2}÷${v1 + v2}=${avg}입니다.`,
    [[wrong, `평균 속력을 두 속력의 산술평균으로 착각해 (${v1}+v)÷2=${avg}의 식으로 푼 값입니다.`]],
  );
}

// 3) 같은 거리를 다른 속력으로 이동할 때 도착 시간 차이, 또는 느린 쪽 속력
const gapSeeds = [
  [30, 60, 45, "diff", "택시", "시내버스", "기차역", "컨벤션 센터"],
  [20, 40, 24, "diff", "전동 스쿠터", "마을버스", "대학 정문", "시립 미술관"],
  [9, 6, 4, "diff", "형", "동생", "집", "외갓집"],
  [35, 70, 50, "diff", "승합차", "캠핑 트레일러를 끄는 차", "고속도로 휴게소", "야영장"],
  [16, 8, 6, "diff", "경보 선수", "일반 참가자", "출발선", "결승선"],
  [21, 14, 6, "diff", "자전거를 탄 누나", "걸어가는 동생", "캠핑장", "읍내 장터"],
  [36, 48, 36, "speed", "공항 리무진", "순환 버스", "시청 앞 정류장", "국제공항"],
  [45, 90, 60, "speed", "고속 여객선", "화물선", "항구", "섬의 선착장"],
  [10, 15, 10, "speed", "로드 자전거", "생활 자전거", "공원 입구", "댐 전망대"],
  [42, 84, 56, "speed", "소방 지휘차", "급수차", "소방서", "화재 현장"],
  [50, 100, 75, "speed", "직행 버스", "완행 버스", "터미널", "온천 마을"],
  [27, 18, 12, "speed", "선두 주자", "후미 주자", "출발선", "반환점"],
] as const;

function buildGap([d, fast, slow, mode, A, B, start, dest]: (typeof gapSeeds)[number]): Built {
  const tFast = assertInt((d * 60) / fast, "빠른 쪽 시간");
  const tSlow = assertInt((d * 60) / slow, "느린 쪽 시간");
  const diff = assertInt(tSlow - tFast, "도착 시간 차");
  if (mode === "diff") {
    const wrong = (d / (fast - slow)) * 60;
    return build(
      `${togetherWith(A)} ${asTopic(B)} ${start}에서 동시에 출발해 ${d}km 떨어진 ${dest}까지 같은 길로 이동한다. ${asTopic(A)} 시속 ${fast}km, ${asTopic(B)} 시속 ${slow}km로 일정하게 이동할 때, ${asSubject(A)} ${B}보다 몇 분 먼저 도착하는가?`,
      diff,
      min,
      `두 쪽 모두 같은 거리 ${d}km를 이동합니다. ${asTopic(A)} ${d}÷${fast}시간=${tFast}분, ${asTopic(B)} ${d}÷${slow}시간=${tSlow}분이 걸리므로 차이는 ${diff}분입니다.`,
      [[wrong, `거리를 두 속력의 차 ${fast - slow}km/h로 나눈 값으로, 두 쪽이 같은 거리를 가는 데 걸린 시간의 차와는 다릅니다.`]],
      diff < 20 ? 2 : diff < 60 ? 5 : 10,
    );
  }
  const shrunk = tFast - diff;
  const wrong = shrunk > 0 ? (d * 60) / shrunk : 0;
  return build(
    `${togetherWith(A)} ${asTopic(B)} ${start}에서 동시에 출발해 ${d}km 떨어진 ${dest}까지 같은 거리를 이동했다. ${asTopic(A)} 시속 ${fast}km로 일정하게 달려 ${B}보다 ${diff}분 먼저 도착했다. ${B}의 속력은?`,
    slow,
    kmh,
    `같은 거리 ${d}km를 ${asSubject(A)} 가는 데 ${d}÷${fast}시간=${tFast}분이 걸렸으므로 ${asTopic(B)} ${tFast}+${diff}=${tSlow}분이 걸렸습니다. 따라서 ${B}의 속력은 ${d}÷(${tSlow}/60)=${slow}km/h입니다.`,
    [[wrong, `${B}의 시간을 ${tFast}-${diff}분으로 잘못 잡아 계산한 값입니다. 늦게 도착한 쪽은 시간이 더 걸립니다.`]],
  );
}

// 4) 속력에 따라 늦거나 일찍 도착할 때 거리, 또는 정시에 도착하는 속력
const lateSeeds = [
  [3, 5, 5, 80, "dist", "소윤이는", "학교", "등교 시각"],
  [40, 60, 60, 80, "dist", "김 과장은", "고객사", "미팅 시작 시각"],
  [12, 18, 18, 70, "dist", "자전거 동호회원 태민이는", "집결 장소", "모임 시각"],
  [5, 8, 10, 100, "dist", "순례길 여행자는", "다음 숙소", "체크인 마감 시각"],
  [45, 60, 90, 110, "dist", "공연 기획자는", "지방 공연장", "리허설 시각"],
  [50, 75, 75, 72, "dist", "이삿짐 트럭은", "새집", "약속한 시각"],
  [16, 24, 12, 36, "dist", "음식 배달원은", "주문 고객의 집", "도착 예정 시각"],
  [30, 36, 45, 80, "dist", "견학 버스는", "과학관", "입장 예약 시각"],
  [40, 60, 48, 60, "speed", "면접자 준호는", "면접장", "면접 시각"],
  [60, 90, 90, 72, "speed", "행사 물품 운송 차량은", "박람회장", "개막 시각"],
  [4, 6, 3, 36, "speed", "초등학생 하준이는", "학원", "수업 시작 시각"],
  [48, 80, 60, 60, "speed", "웨딩카 기사는", "예식장", "예식 시작 시각"],
  [10, 20, 15, 60, "speed", "인라인스케이트를 타는 서진이는", "공원 행사장", "행사 시작 시각"],
] as const;

function buildLate([v1, v2, d, onTime, mode, who, dest, deadline]: (typeof lateSeeds)[number]): Built {
  const slowTime = assertInt((d * 60) / v1, "느린 속력 시간");
  const fastTime = assertInt((d * 60) / v2, "빠른 속력 시간");
  const late = assertInt(slowTime - onTime, "늦은 시간");
  const early = assertInt(onTime - fastTime, "이른 시간");
  const solved = ((late + early) / 60) * ((v1 * v2) / (v2 - v1));
  if (Math.abs(solved - d) > 1e-9) throw new Error("지각 조건 역검산 실패");
  const setup = `${who} ${dest}에 ${deadline}까지 도착하려고 한다. 시속 ${v1}km로 가면 ${deadline}보다 ${late}분 늦고, 시속 ${v2}km로 가면 ${early}분 일찍 도착한다. 어느 속력으로 가든 같은 거리를 이동한다.`;
  const distanceWork = `두 경우 모두 같은 거리를 가므로 거리를 xkm로 두면 x/${v1}-x/${v2}=(${late}+${early})/60입니다. 이를 풀면 x=${d}입니다.`;
  if (mode === "dist") {
    const wrong = (Math.abs(late - early) / 60) * ((v1 * v2) / (v2 - v1));
    return build(
      `${setup} ${dest}까지의 거리는?`,
      d,
      km,
      `${distanceWork} 검산하면 시속 ${v1}km로는 ${timeText(slowTime)}, 시속 ${v2}km로는 ${asSubject(timeText(fastTime))} 걸려 차이가 ${late + early}분입니다.`,
      [[wrong, `두 시간 차를 더하지 않고 빼서 ${Math.abs(late - early)}분으로 계산한 값입니다.`]],
      d < 10 ? 1 : d < 30 ? 2 : d < 60 ? 5 : 10,
    );
  }
  const speed = assertInt((d * 60) / onTime, "정시 속력");
  return build(
    `${setup} ${deadline}에 정확히 맞춰 도착하려면 어떤 속력으로 가야 하는가?`,
    speed,
    kmh,
    `${distanceWork} 시속 ${v1}km로 가면 ${slowTime}분이 걸리고 이는 ${late}분 늦은 것이므로, 남은 시간은 ${onTime}분입니다. 따라서 필요한 속력은 ${d}÷(${onTime}/60)=${speed}km/h입니다.`,
    [[(v1 + v2) / 2, `두 속력의 산술평균입니다. 늦는 시간과 이른 시간이 달라 정시 속력은 산술평균과 일치하지 않습니다.`]],
  );
}

// 5) 같은 거리를 순풍과 역풍, 또는 움직이는 통로에서 오갈 때
const assistSeeds = [
  ["wind", "관광용 경비행기가", "두 도시의 공항", 600, 120, 180],
  ["own", "응급 환자를 옮기는 헬기가", "두 병원", 240, 60, 90],
  ["wind", "택배 드론이", "물류 거점과 아파트 단지", 12, 20, 30],
  ["own", "사이클 선수가", "해안 도로의 두 반환점", 18, 45, 60],
  ["wind", "로드 자전거 동호회가", "강변 자전거길의 두 쉼터", 30, 60, 90],
  ["own", "화물기가", "두 국제공항", 900, 90, 120],
  ["wind", "경주용 비둘기가", "비둘기 집과 방사 지점", 60, 50, 75],
  ["own", "산불 감시 드론이", "전망대와 능선 초소", 20, 30, 40],
] as const;

function buildAssist([mode, who, places, d, t1, t2]: (typeof assistSeeds)[number]): Built {
  const g1 = assertInt((d * 60) / t1, "순풍 속력");
  const g2 = assertInt((d * 60) / t2, "역풍 속력");
  const own = assertInt((g1 + g2) / 2, "자체 속력");
  const wind = assertInt((g1 - g2) / 2, "바람 속력");
  if (own + wind !== g1 || own - wind !== g2) throw new Error("바람 역검산 실패");
  const setup = `${who} ${places} 사이 ${d}km를 오갔다. 같은 거리를 뒷바람을 받으며 갈 때는 ${timeText(t1)}, 맞바람을 맞으며 돌아올 때는 ${asSubject(timeText(t2))} 걸렸다. 바람의 속력과 바람이 없을 때의 속력은 각각 일정하다.`;
  const work = `같은 거리 ${d}km를 갈 때는 ${d}÷(${t1}/60)=${g1}km/h, 올 때는 ${d}÷(${t2}/60)=${g2}km/h로 이동했습니다. 바람이 없을 때의 속력을 v, 바람의 속력을 w로 두면 v+w=${g1}, v-w=${g2}입니다.`;
  if (mode === "wind")
    return build(
      `${setup} 바람의 속력은?`,
      wind,
      kmh,
      `${work} 두 식을 빼서 2로 나누면 w=${wind}km/h입니다.`,
      [
        [g1 - g2, "두 속력의 차를 2로 나누지 않은 값입니다."],
        [own, "바람이 없을 때의 속력입니다."],
      ],
    );
  return build(
    `${setup} 바람이 없을 때의 속력은?`,
    own,
    kmh,
    `${work} 두 식을 더해 2로 나누면 v=${own}km/h입니다.`,
    [
      [g1, "뒷바람을 받을 때의 속력으로, 바람의 도움이 더해진 값입니다."],
      [wind, "바람의 속력입니다."],
    ],
  );
}

const walkwaySeeds = [
  [80, 48, "공항의 무빙워크에 가만히 서 있으면 끝까지 가는 데", "무빙워크 위에서 진행 방향으로 걸으면", "무빙워크 옆 일반 통로를 같은 걸음 속력으로 걸으면"],
  [45, 18, "지하철역 에스컬레이터에 가만히 서 있으면 위층까지", "움직이는 에스컬레이터를 걸어 오르면", "점검으로 멈춘 에스컬레이터를 같은 걸음 속력으로 걸어 오르면"],
] as const;

function buildWalkway([stand, onMoving, standText, walkText, askText]: (typeof walkwaySeeds)[number]): Built {
  const floor = assertInt((stand * onMoving) / (stand - onMoving), "걷는 시간");
  if (Math.abs(1 / onMoving - (1 / stand + 1 / floor)) > 1e-12) throw new Error("무빙워크 역검산 실패");
  return build(
    `${standText} ${stand}초가 걸리고, ${walkText} ${onMoving}초가 걸린다. ${askText} 같은 거리를 가는 데 몇 초가 걸리는가?`,
    floor,
    sec,
    `같은 거리를 1로 두면 통로의 속력은 1/${stand}, 통로 위에서 걸을 때의 속력은 1/${onMoving}입니다. 걸음 속력은 1/${onMoving}-1/${stand}=1/${floor}이므로 걷기만 하면 ${floor}초가 걸립니다.`,
    [
      [stand - onMoving, "두 시간의 차로, 속력의 차가 아닌 시간의 차를 구한 값입니다."],
      [stand + onMoving, "두 시간을 더한 값으로, 속력을 합치는 관계를 반대로 적용했습니다."],
    ],
    10,
  );
}

const built: Built[] = [
  ...roundTripSeeds.map(buildRoundTrip),
  ...averageSeeds.map(buildAverage),
  ...gapSeeds.map(buildGap),
  ...lateSeeds.map(buildLate),
  ...assistSeeds.map(buildAssist),
  ...walkwaySeeds.map(buildWalkway),
];

if (built.length !== 60) throw new Error(`거리 추가 문항 수 오류: ${built.length}`);

// 함정 조합과 정답 자리를 함께 바꿔 보며, 지금까지 가장 적게 쓰인 자리를 골라 정답 위치를 고르게 퍼뜨린다.
const positionCounts = [0, 0, 0, 0, 0];
const arranged = built.map((item) => {
  const traps = item.notes.map(([value]) => value);
  const subsets = Array.from({ length: 1 << traps.length }, (_, m) =>
    traps.filter((__, j) => (m >> j) & 1),
  ).sort((a, b) => b.length - a.length);
  const options = [0, 1, 2, 3, 4].flatMap((rank) => {
    for (const subset of subsets) {
      const values = arrange(item.correct, subset, rank, item.step);
      if (values.indexOf(item.correct) === rank) return [values];
    }
    return [];
  });
  if (!options.length) throw new Error(`선지 배치 실패: ${item.stem}`);
  const pick = options.reduce((best, values) =>
    positionCounts[values.indexOf(item.correct)] < positionCounts[best.indexOf(item.correct)] ? values : best,
  );
  positionCounts[pick.indexOf(item.correct)] += 1;
  return pick;
});
if (positionCounts.some((count) => count < 10 || count > 14))
  throw new Error(`거리 정답 위치 분포 불균형: ${positionCounts.join("/")}`);

export const CM_DISTANCE_EXTRA: ExampleQuestion[] = built.map((item, i) => {
  const values = arranged[i];
  const choices = values.map(item.format);
  const answer = values.indexOf(item.correct);
  const trapNotes = item.notes
    .filter(([value]) => values.includes(value))
    .map(([value, note]) => `${asTopic(item.format(value))} ${note}`);
  const explanation = [item.body, ...trapNotes].join(" ");
  if (!/같은 거리/.test(`${item.stem} ${explanation}`)) throw new Error("같은 거리 조건 누락");
  return defineQuestion(CATEGORY, KIND_ID, KIND_NAME, 20 + i, { stem: item.stem, choices, answer, explanation });
});
