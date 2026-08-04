import { useEffect, useState } from "react";
import { PROBLEMS } from "./data/problems";
import { CATEGORIES, type Subtype } from "./data/catalog";
import Home from "./components/Home";
import TutorialPlayer from "./components/TutorialPlayer";
import SiteHeader from "./components/SiteHeader";
import CategoryPage from "./components/CategoryPage";
import StudyHub from "./components/StudyHub";
import ExampleQuiz from "./components/ExampleQuiz";

type RouteMode = "tutorial" | "examples" | null;
interface RouteState {
  categoryId: string | null;
  subtypeId: string | null;
  mode: RouteMode;
}

interface PageProps {
  route: RouteState;
  navigate: (path: string) => void;
}

function Page({ route, navigate }: PageProps) {
  const category = CATEGORIES.find((item) => item.id === route.categoryId) ?? null;
  const subtype: Subtype | null =
    category?.subtypes.find((item) => item.id === route.subtypeId) ?? null;

  if (category && subtype && route.mode === "tutorial") {
    const tutorial = PROBLEMS.find((problem) => problem.id === subtype.tutorialId);
    if (tutorial) {
      return (
        <TutorialPlayer
          problem={tutorial}
          title={`${category.name} ${subtype.name} 풀이 튜토리얼`}
          onBack={() => navigate(`/${category.id}/${subtype.id}`)}
        />
      );
    }
  }

  if (category && subtype && route.mode === "examples") {
    return (
      <ExampleQuiz
        category={category}
        subtype={subtype}
        onBack={() => navigate(`/${category.id}/${subtype.id}`)}
      />
    );
  }

  if (category && subtype) {
    return (
      <StudyHub
        category={category}
        subtype={subtype}
        onBack={() => navigate(`/${category.id}`)}
        onTutorial={() => navigate(`/${category.id}/${subtype.id}/tutorial`)}
        onExamples={() => navigate(`/${category.id}/${subtype.id}/examples`)}
      />
    );
  }

  if (category) {
    return (
      <CategoryPage
        category={category}
        onBack={() => navigate("/")}
        onSelect={(item) => navigate(`/${category.id}/${item.id}`)}
      />
    );
  }

  return <Home categories={CATEGORIES} onSelect={(id) => navigate(`/${id}`)} />;
}

export default function App() {
  const readRoute = (): RouteState => {
    const [, categoryId = null, subtypeId = null, routeMode = null] =
      window.location.pathname.split("/");
    const mode: RouteMode = routeMode === "tutorial" || routeMode === "examples" ? routeMode : null;
    return { categoryId, subtypeId, mode };
  };
  const [route, setRoute] = useState(readRoute);
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
  const examMode = route.mode === "tutorial" || route.mode === "examples";

  return (
    <div className="app-shell">
      {!examMode && <SiteHeader />}
      <main className={`app${examMode ? " exam-app" : ""}`}>
        <Page route={route} navigate={navigate} />
      </main>
    </div>
  );
}
