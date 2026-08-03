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
interface RouteState { categoryId: string | null; subtypeId: string | null; mode: RouteMode }

export default function App() {
  const readRoute = (): RouteState => {
    const [, categoryId = null, subtypeId = null, routeMode = null] = window.location.pathname.split("/");
    const mode: RouteMode = routeMode === "tutorial" || routeMode === "examples" ? routeMode : null;
    return { categoryId, subtypeId, mode };
  };
  const [route, setRoute] = useState(readRoute);
  useEffect(() => { const sync = () => setRoute(readRoute()); window.addEventListener("popstate", sync); return () => window.removeEventListener("popstate", sync); }, []);
  const navigate = (path: string) => { window.history.pushState({}, "", path); setRoute(readRoute()); window.scrollTo(0, 0); };
  const categoryId = route.categoryId;
  const category = CATEGORIES.find((item) => item.id === categoryId) ?? null;
  const subtype: Subtype | null = category?.subtypes.find((item) => item.id === route.subtypeId) ?? null;
  const mode = route.mode;
  const tutorial = PROBLEMS.find((problem) => problem.id === subtype?.tutorialId) ?? null;
  const examMode = mode === "tutorial" || mode === "examples";

  return (
    <div className="app-shell">
      {!examMode && <SiteHeader />}
      <main className={`app${examMode ? " exam-app" : ""}`}>
        {category && subtype && mode === "tutorial" && tutorial ? <TutorialPlayer problem={tutorial} title={`${category.name} ${subtype.name} 풀이 튜토리얼`} onBack={() => navigate(`/${category.id}/${subtype.id}`)} />
          : category && subtype && mode === "examples" ? <ExampleQuiz category={category} subtype={subtype} onBack={() => navigate(`/${category.id}/${subtype.id}`)} />
          : category && subtype ? <StudyHub category={category} subtype={subtype} onBack={() => navigate(`/${category.id}`)} onTutorial={() => navigate(`/${category.id}/${subtype.id}/tutorial`)} onExamples={() => navigate(`/${category.id}/${subtype.id}/examples`)} />
          : category ? <CategoryPage category={category} onBack={() => navigate("/")} onSelect={(item) => navigate(`/${category.id}/${item.id}`)} />
          : <Home categories={CATEGORIES} onSelect={(id) => navigate(`/${id}`)} />}
      </main>
    </div>
  );
}
