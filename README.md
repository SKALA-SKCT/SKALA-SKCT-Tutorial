# SKCT 유형별 풀이 튜토리얼

SKCT 언어 영역 문제를 **유형별로 "어떻게 접근하고 어떤 순서로 읽어야 하는지"** 단계별로
안내하는 학습용 샘플 앱입니다. `다음 →` 버튼을 누를 때마다 해설이 한 단계씩 공개되고,
그 단계에서 봐야 할 지문 문장이 형광펜처럼 강조됩니다.

현재 두 가지 유형이 샘플로 들어 있습니다.

| 유형 | 공략 포인트 |
| --- | --- |
| **빈칸 1개 (빈칸 추론)** | 선지보다 **지문을 먼저** 읽고, 빈칸 뒤의 구체적 설명에서 근거를 찾습니다. |
| **문장 삽입 (위치 A~E)** | **`<보기>`를 먼저** 읽고, 보기 속 단서(접속어·지시어·키워드)로 들어갈 자리를 찾습니다. |

## 기술 스택

- **Vite + React (TypeScript)** — 프론트엔드
- **Cloudflare Workers + Static Assets** (`@cloudflare/vite-plugin`) — 배포
  - 정적 React 앱을 Worker가 서빙하고, `worker/index.ts`의 `/api/*` 자리는
    향후 **Claude API로 해설을 자동 생성**하는 백엔드를 얹을 공간입니다.

## 실행

```bash
npm install
npm run dev      # 개발 서버 (Vite + workerd) — http://localhost:5173
```

## 빌드 / 배포

```bash
npm run build    # 타입 체크(client + worker) 후 vite build
npm run deploy   # build 후 wrangler deploy (최초 1회 `npx wrangler login` 필요)
```

## 프로젝트 구조

```
src/
  data/problems.ts     # ★ 문제 + 단계별 해설 데이터 (여기만 고치면 문제 추가)
  types.ts             # Problem / Segment / Step / Choice 타입
  components/
    Home.tsx           # 유형 목록 카드
    TutorialPlayer.tsx # 튜토리얼 진행(단계 상태 관리)
    Passage.tsx        # 지문 렌더링 + 문장 하이라이트/디밍
    Choices.tsx        # 선지 + 정답 공개
    GuidePanel.tsx     # 진행바 + 해설 + 이전/다음 버튼
  index.css            # 전체 스타일
worker/index.ts        # Cloudflare Worker (정적 자산 서빙 + /api/* 예약)
wrangler.jsonc         # Workers 설정 (assets 바인딩, SPA fallback)
```

## 문제 추가하는 법

`src/data/problems.ts`의 `PROBLEMS` 배열에 항목을 추가하면 됩니다.

1. `passage`를 **문장 단위 `Segment`** 로 쪼갭니다. 문단 시작 문장에는 `newParagraph: true`,
   삽입형의 `(A)~(E)` 자리는 `kind: "position"` 을 줍니다.
2. `steps` 배열에 해설을 순서대로 적고, 각 단계에서 강조할 문장 id를 `highlight`에 넣습니다.
   - `<보기>`를 강조하려면 `highlightBox: true`
   - 선지를 강조하려면 `highlightChoices: ["2"]`
   - 정답을 공개하는 단계에는 `reveal: true`
3. `answerId`에 정답 선지 id를 지정합니다.

> 새 유형을 넣을 때 `type` 값(`single-blank` / `insertion`)에 따라 상단 배지 색과
> "지문 먼저 / 보기 먼저" 태그가 자동으로 붙습니다. 완전히 새로운 유형이라면
> `ProblemType`(`src/types.ts`)에 값을 추가하세요.

## 향후 확장 (선택)

Workers를 쓰는 이유이자 다음 단계입니다. `worker/index.ts`의 `/api/*` 분기에
Claude API를 호출하는 엔드포인트를 추가하면, 문제 지문만 넣어도 단계별 해설을
자동 생성하도록 발전시킬 수 있습니다. (프론트/백엔드가 같은 배포에 있으므로 서비스 추가가 필요 없습니다.)
