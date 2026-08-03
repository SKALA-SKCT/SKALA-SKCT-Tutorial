import type { Problem } from "../types";

/**
 * Sample problems. Each `passage` is split into segments so a step can
 * highlight one sentence (or one (A)~(E) slot) at a time, and each `steps`
 * entry mirrors the friendly, click-through explanation for that type.
 */
export const PROBLEMS: Problem[] = [
  {
    id: "single-blank",
    type: "single-blank",
    typeLabel: "빈칸 추론 · 빈칸 1개",
    typeSummary: "빈칸이 한 군데 뚫려 있는 문제",
    strategy:
      "빈칸이 한 군데면 선지부터 보지 말고 지문을 처음부터 읽으세요. 빈칸 바로 뒤에 이어지는 '구체적인 설명'이 곧 정답의 근거가 됩니다.",
    stem: "다음 글의 빈칸 ① ________ 에 들어갈 내용으로 가장 적절한 것은?",
    passage: [
      {
        id: "p1",
        newParagraph: true,
        text: "중국 AI 스타트업 딥시크(DeepSeek)는 R1 모델을 발표하며 글로벌 AI 시장에 충격을 주었다.",
      },
      {
        id: "p2",
        text: "특히, 이 모델은 단 600만 달러(약 80억 원)의 비용과 2개월 만에 개발되었다고 주장하며 기존 AI 연구 방식과 비용 구조를 뒤흔들었다.",
      },
      {
        id: "p3",
        text: "기존 AI 모델들은 개발에 수십억 달러의 비용과 수년간의 연구 기간이 필요했기 때문에, 딥시크의 등장은 AI 업계의 패러다임 변화를 예고하고 있다.",
      },
      {
        id: "p4",
        newParagraph: true,
        text: "특히, ① ________ 에서 딥시크의 등장은 기존 시장의 원리를 변화시키며, 예상치 못한 파급력을 보여주고 있다.",
      },
      {
        id: "p5",
        text: "예를 들어, 딥시크 AI는 엔비디아의 고성능 칩(H100)이 아닌 저사양 칩(H800) 2,048개로 학습하여 기존의 GPU 수요 논리를 뒤집었다.",
      },
      {
        id: "p6",
        newParagraph: true,
        text: "이로 인해 엔비디아 주가는 17% 폭락하며 미국 증시 역사상 하루 최대 손실을 기록했다.",
      },
      {
        id: "p7",
        text: "또한, SK하이닉스(-10%), 대만 TSMC(-13%) 등 글로벌 반도체 기업들도 큰 타격을 입었다.",
      },
      {
        id: "p8",
        text: "반면, 애플은 AI 배포 플랫폼을 보유한 덕분에 오히려 주가가 상승하는 모습을 보였다.",
      },
    ],
    choices: [
      { id: "1", marker: "①", text: "AI 모델의 개발 비용과 시간 단축" },
      { id: "2", marker: "②", text: "엔비디아 및 반도체 기업들의 주가 폭락" },
      { id: "3", marker: "③", text: "AI 기술을 활용한 글로벌 기업들의 경쟁 변화" },
      { id: "4", marker: "④", text: "혼합 전문가 모델을 활용한 최적화된 AI 성능" },
      { id: "5", marker: "⑤", text: "AI 소프트웨어 시장의 확장과 대중화" },
    ],
    answerId: "2",
    steps: [
      {
        narration:
          "지문을 처음부터 읽어 볼게요. 첫 문장에서 이 글의 주제가 ‘딥시크(DeepSeek)’라는 걸 알 수 있습니다.",
        highlight: ["p1"],
      },
      {
        narration:
          "딥시크가 AI 시장에 충격을 주었고, 기존 AI 연구 방식과 비용 구조를 뒤흔들었다고 말합니다. 글의 큰 방향을 잡아 두세요.",
        highlight: ["p2", "p3"],
      },
      {
        narration:
          "‘특히 ①에서 딥시크의 등장이 큰 영향을 줬다’고 합니다. 그렇다면 이 뒤에 이어지는 내용이 바로 ①에 대한 ‘구체적인 설명’입니다. 여기에 정답의 근거가 있어요.",
        highlight: ["p4"],
      },
      {
        narration:
          "곧바로 예시가 나옵니다. 엔비디아의 칩(H100·H800) 이야기네요. 딥시크가 GPU 수요 논리를 뒤집었다는 내용입니다.",
        highlight: ["p5"],
      },
      {
        narration:
          "그 결과 엔비디아 주가가 17% 폭락하고, SK하이닉스·TSMC 같은 반도체 기업도 큰 타격을 입었습니다. 반면 애플은 상승했죠. 즉 ①의 구체적 설명은 ‘엔비디아·반도체 기업의 주가’에 관한 것입니다.",
        highlight: ["p6", "p7", "p8"],
      },
      {
        narration:
          "이제 선지를 봅니다. ①에는 ‘엔비디아와 반도체 기업’에 대한 내용이 들어가야 합니다. ②번만 정확히 이에 해당하죠. 정답은 ②입니다.",
        highlight: ["p6", "p7", "p8"],
        highlightChoices: ["2"],
        reveal: true,
      },
    ],
  },

  {
    id: "insertion",
    type: "insertion",
    typeLabel: "문장 삽입 · 위치 여러 곳",
    typeSummary: "<보기> 문장이 들어갈 위치를 (A)~(E)에서 고르는 문제",
    strategy:
      "삽입 위치가 여러 곳(A~E)이면 <보기>부터 읽으세요. 보기 속 접속어·지시어·키워드가 ‘앞 문장에 무엇이 와야 하는지’ 알려주는 단서입니다. 그 단서를 들고 지문을 읽으며 자리를 찾으세요.",
    stem: "다음 글의 흐름상 <보기>의 내용이 들어가기에 가장 적절한 곳은?",
    box: "국내에서도 AI 기반 유전자 분석 기술이 항노화 화장품 및 재생 의학 분야에서 활용되며, 최근 한 연구에서는 이를 통해 피부 세포의 노화 과정을 조절하는 핵심 인자를 발견하여 새로운 개발이 진행되고 있다.",
    passage: [
      {
        id: "s1",
        newParagraph: true,
        text: "노화 과정의 조절과 역학을 목표로 하는 연구가 빠르게 발전하고 있다.",
      },
      {
        id: "s2",
        text: "최근에는 딥러닝 기반의 유전자 분석 기술이 등장하면서, 특정 유전자가 노화 속도에 미치는 영향을 정밀하게 분석할 수 있게 되었다.",
      },
      { id: "posA", kind: "position", text: "(A)" },
      {
        id: "s3",
        text: "특히, AI를 활용한 유전자 스크리닝 기법은 세포 노화의 주요 원인을 규명하고, 이를 억제시킬 수 있는 물질을 발견하는 데 기여하고 있다.",
      },
      { id: "posB", kind: "position", text: "(B)" },
      {
        id: "s4",
        text: "이러한 기술은 노화의 근본적 원인을 예방하고 치료하는 데 도움을 줄 뿐만 아니라, 건강 수명을 연장하는 가능성을 제시하고 있다.",
      },
      { id: "posC", kind: "position", text: "(C)" },
      {
        id: "s5",
        text: "최근 해외 연구에서는 AI 기반 유전자 분석 기술을 활용하여, 노화된 피부 세포를 젊은 상태로 되돌리는 데 성공한 사례도 보고되고 있다.",
      },
      { id: "posD", kind: "position", text: "(D)" },
      {
        id: "s6",
        text: "이처럼 노화 예방뿐만 아니라, 항노화 화장품 및 재생 의학 분야에서도 큰 주목을 받고 있으며, 일부 실험 결과 활성화된 DNA 수정도 기대된다.",
      },
      { id: "posE", kind: "position", text: "(E)" },
      {
        id: "s7",
        text: "하지만, AI를 활용한 유전자 치료 기술이 아직 초기 단계인 만큼, 장기적인 안전성과 윤리적 문제에 대한 논의도 필요하다는 지적이 제기되고 있다.",
      },
    ],
    choices: [
      { id: "1", marker: "①", text: "(A)" },
      { id: "2", marker: "②", text: "(B)" },
      { id: "3", marker: "③", text: "(C)" },
      { id: "4", marker: "④", text: "(D)" },
      { id: "5", marker: "⑤", text: "(E)" },
    ],
    answerId: "4",
    steps: [
      {
        narration:
          "이 유형은 <보기>부터 읽는 게 핵심입니다. 먼저 보기 내용을 확인해 볼게요.",
        highlightBox: true,
      },
      {
        narration:
          "보기는 ‘국내에서도’ 항노화 화장품·재생 의학에 AI 유전자 분석을 활용했다는 내용입니다. ‘국내에서도’라는 말은 앞에 ‘해외 사례’가 먼저 나온다는 신호예요. 또 글의 주제가 ‘노화’라는 것도 알 수 있습니다.",
        highlightBox: true,
      },
      {
        narration:
          "이제 지문을 읽습니다. 노화 과정의 조절·역학을 연구하고 있다는 도입부네요.",
        highlight: ["s1"],
      },
      {
        narration:
          "딥러닝으로 더 정밀하게 분석하게 됐다는 내용입니다. 아직 해외 사례도, 항노화 화장품 이야기도 없으니 (A)에는 들어갈 수 없습니다.",
        highlight: ["s2", "posA"],
      },
      {
        narration:
          "유전자 스크리닝 기법이 기여하고 있다는 내용입니다. ‘스크리닝’이라는 단어에 부담 가질 필요 없이 ‘새 기법이 도움을 주는구나’ 정도만 파악하면 됩니다. (B)에도 아직 들어갈 수 없어요.",
        highlight: ["s3", "posB"],
      },
      {
        narration:
          "이 기술이 건강 수명 연장에 도움이 된다는 내용입니다. 여전히 보기와 연결되는 ‘해외 연구’나 ‘항노화 화장품’ 얘기가 없으니 (C)도 아닙니다.",
        highlight: ["s4", "posC"],
      },
      {
        narration:
          "‘최근 해외 연구’가 등장했습니다! 보기는 ‘국내’ 연구 내용이었죠. 해외 연구 뒤에는 국내 연구가 이어질 확률이 큽니다. (D) 자리를 주목하세요.",
        highlight: ["s5", "posD"],
      },
      {
        narration:
          "다음 문장을 보면 ‘이처럼 노화 예방뿐 아니라 항노화 화장품·재생 의학 분야에서도 주목받는다’고 합니다. 보기도 바로 이 ‘항노화 화장품’을 말하고 있어요. 그래서 보기는 (D)에 들어갑니다. 정답은 ④ (D)입니다.",
        highlight: ["s6", "posD"],
        highlightChoices: ["4"],
        reveal: true,
      },
    ],
  },
];
