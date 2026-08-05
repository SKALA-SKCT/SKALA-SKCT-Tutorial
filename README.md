# SKCT 유형별 풀이 튜토리얼

SKCT의 출제 분류와 풀이 전략을 기준으로 **언어이해, 자료해석, 창의수리, 언어추리,
수열추리**를 단계별로 학습하는 튜토리얼 앱입니다. 흐름은 다음과 같습니다.

`5개 영역, 세부 유형, 풀이 튜토리얼, 세부 유형 종류`

현재 21개 세부 유형 아래 65개 세부 유형 종류가 있으며, 모든 종류에 독립적인 문제와
5단계 해설, 실전 풀이 팁이 연결되어 있습니다. 튜토리얼 상단의 번호로 같은 세부 유형에
속한 종류를 전환할 수 있습니다.

## 기술 스택

- **Vite + React (TypeScript)** 프론트엔드
- **Cloudflare Workers + Static Assets** (`@cloudflare/vite-plugin`) 배포
  - 정적 React 앱을 Worker가 서빙하고, `worker/index.ts`의 `/api/*` 자리는
    향후 **Claude API로 해설을 자동 생성**하는 백엔드를 얹을 공간입니다.

## 실행

```bash
npm install
npm run dev      # 개발 서버 (Vite + workerd) http://localhost:5173
```

## 빌드 / 배포

```bash
npm run build    # 타입 체크(client + worker) 후 vite build
npm run deploy   # build 후 wrangler deploy (최초 1회 `npx wrangler login` 필요)
```

## 프로젝트 구조

```
src/
  data/catalog.ts      # 5개 영역, 세부 유형, 세부 유형 종류와 실전 팁
  data/bookTutorials.ts # 65개 튜토리얼 문제와 단계별 해설
  data/problems.ts     # 튜토리얼 문제 진입점
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

`src/data/catalog.ts`에 세부 유형 종류를 등록하고 `src/data/bookTutorials.ts`에 같은 id의
문제를 추가하면 됩니다.

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
