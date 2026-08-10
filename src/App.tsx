import { useEffect, useState } from "react";
import { PROBLEMS } from "./data/problems";
import { CATEGORIES, type ExampleQuestion, type ProblemKind, type Subtype } from "./data/catalog";
import {
  balancedAllQuestions,
  balancedCategoryQuestions,
  questionsForTutorial,
} from "./data/tutorialQuestionGroups";
import Home from "./components/Home";
import TutorialPlayer from "./components/TutorialPlayer";
import SiteHeader from "./components/SiteHeader";
import CategoryPage from "./components/CategoryPage";
import StudyHub from "./components/StudyHub";
import ExampleQuiz, { type PracticeResult } from "./components/ExampleQuiz";
import ExampleResult from "./components/ExampleResult";
import RandomHub from "./components/RandomHub";

type RouteMode = "tutorial" | "examples" | "result" | null;
interface RouteState {
  categoryId: string | null;
  subtypeId: string | null;
  mode: RouteMode;
  kindId: string | null;
  randomScope: string | null;
}
interface PracticeSession {
  title: string;
  questions: ExampleQuestion[];
  returnPath: string;
  resultPath: string;
}

const tutorialPrefixByCategory: Record<string, string> = {
  "verbal-comprehension": "vc-",
  "data-analysis": "da-",
  "creative-math": "cm-",
  "verbal-reasoning": "vr-",
  "sequence-reasoning": "sr-",
};

const TUTORIAL_CATEGORIES = CATEGORIES.map((category) => {
  const prefix = tutorialPrefixByCategory[category.id];
  const kinds: ProblemKind[] = PROBLEMS.filter(
    (problem) => prefix && problem.id.startsWith(prefix),
  ).map((problem) => ({
    id: problem.id,
    name: problem.internalTypeName,
    description: problem.typeSummary,
    tip: problem.strategy,
    tutorialId: problem.id,
  }));

  return {
    ...category,
    subtypes: [
      {
        id: `${category.id}-tutorials`,
        name: `${category.name} 문제 유형`,
        description: category.description,
        kinds,
      },
    ],
  };
});

function Page({
  route,
  navigate,
  startPractice,
  session,
  result,
  finishPractice,
  leaveResult,
}: {
  route: RouteState;
  navigate: (path: string) => void;
  startPractice: (config: PracticeSession) => void;
  session: PracticeSession | null;
  result: PracticeResult | null;
  finishPractice: (value: PracticeResult) => void;
  leaveResult: () => void;
}) {
  if (route.categoryId === "random") {
    if (route.mode === "examples" && session)
      return (
        <ExampleQuiz
          title={session.title}
          questions={session.questions}
          onFinish={finishPractice}
        />
      );
    if (route.mode === "result" && result)
      return <ExampleResult result={result} onLeave={leaveResult} />;
    return (
      <RandomHub
        categories={TUTORIAL_CATEGORIES}
        onBack={() => navigate("/")}
        onSelect={(category) => {
          const questions = balancedCategoryQuestions(category.id);
          startPractice({
            title: `${category.name} 랜덤 예시문제`,
            questions,
            returnPath: "/random",
            resultPath: `/random/${category.id}/result`,
          });
          navigate(`/random/${category.id}/examples`);
        }}
        onAll={() => {
          const questions = balancedAllQuestions();
          startPractice({
            title: "전체 영역 랜덤 예시문제",
            questions,
            returnPath: "/random",
            resultPath: "/random/all/result",
          });
          navigate("/random/all/examples");
        }}
      />
    );
  }
  const category = TUTORIAL_CATEGORIES.find((item) => item.id === route.categoryId) ?? null;
  const subtype: Subtype | null =
    category?.subtypes.find((item) => item.id === route.subtypeId) ?? null;
  const kind: ProblemKind | null = subtype?.kinds.find((item) => item.id === route.kindId) ?? null;
  if (category && subtype && kind && route.mode === "tutorial") {
    const tutorial = PROBLEMS.find((problem) => problem.id === kind.tutorialId);
    if (tutorial)
      return (
        <TutorialPlayer
          problems={[tutorial]}
          title={`${category.name} ${kind.name} 풀이 튜토리얼`}
          onBack={() => navigate(`/${category.id}/${subtype.id}/${kind.id}`)}
        />
      );
  }
  if (category && subtype && kind && route.mode === "examples" && session)
    return (
      <ExampleQuiz title={session.title} questions={session.questions} onFinish={finishPractice} />
    );
  if (category && subtype && kind && route.mode === "result" && result)
    return <ExampleResult result={result} onLeave={leaveResult} />;
  if (category && subtype && kind)
    return (
      <StudyHub
        category={category}
        kind={kind}
        onBack={() => navigate(`/${category.id}`)}
        onTutorial={() => navigate(`/${category.id}/${subtype.id}/${kind.id}/tutorial`)}
        onExamples={() => {
          startPractice({
            title: `${category.name} ${kind.name} 예시문제`,
            questions: questionsForTutorial(kind.id),
            returnPath: `/${category.id}/${subtype.id}/${kind.id}`,
            resultPath: `/${category.id}/${subtype.id}/${kind.id}/result`,
          });
          navigate(`/${category.id}/${subtype.id}/${kind.id}/examples`);
        }}
      />
    );
  if (category)
    return (
      <CategoryPage
        category={category}
        onBack={() => navigate("/")}
        onSelect={(nextSubtype, nextKind) =>
          navigate(`/${category.id}/${nextSubtype.id}/${nextKind.id}`)
        }
      />
    );
  return (
    <Home
      categories={TUTORIAL_CATEGORIES}
      onSelect={(id) => navigate(`/${id}`)}
      onRandom={() => navigate("/random")}
    />
  );
}

export default function App() {
  const readRoute = (): RouteState => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts[0] === "random")
      return {
        categoryId: "random",
        subtypeId: null,
        kindId: null,
        randomScope: parts[1] ?? null,
        mode: parts[2] === "examples" || parts[2] === "result" ? parts[2] : null,
      };
    const [categoryId = null, subtypeId = null, kindId = null, modeValue = null] = parts;
    const mode: RouteMode =
      modeValue === "tutorial" || modeValue === "examples" || modeValue === "result"
        ? modeValue
        : null;
    return { categoryId, subtypeId, kindId, mode, randomScope: null };
  };
  const [route, setRoute] = useState(readRoute);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [result, setResult] = useState<PracticeResult | null>(null);
  useEffect(() => {
    const sync = () => setRoute(readRoute());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setRoute(readRoute());
    window.scrollTo(0, 0);
  };
  const finishPractice = (value: PracticeResult) => {
    setResult(value);
    if (session) navigate(session.resultPath);
  };
  const leaveResult = () => {
    const path = session?.returnPath ?? "/";
    setSession(null);
    setResult(null);
    navigate(path);
  };
  const examMode = route.mode === "tutorial" || route.mode === "examples";
  return (
    <div className="app-shell">
      {!examMode && <SiteHeader />}
      <main className={`app${examMode ? " exam-app" : ""}`}>
        <Page
          route={route}
          navigate={navigate}
          startPractice={(config) => {
            setSession(config);
            setResult(null);
          }}
          session={session}
          result={result}
          finishPractice={finishPractice}
          leaveResult={leaveResult}
        />
      </main>
    </div>
  );
}
