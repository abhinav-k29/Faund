import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Camera,
  CheckCircle2,
  Compass,
  Home as HomeIcon,
  Layers,
  Leaf,
  Target,
  UserRound,
  Map as MapIcon,
} from "lucide-react";
import { Context, Draft } from "./context";
import { config } from "./config";
import { repository, activeConsent } from "./store";
import { Logo, Credits } from "./ui";
import { Welcome, ConsentPage, Profile } from "./participation";
import { Home, Explore as FieldGuide, Collection, Tasks, Sites } from "./pages";
const DiscoveryMap = React.lazy(() =>
  import("./observation-map").then((m) => ({ default: m.DiscoveryMap })),
);
import { ExploreWorlds, CharacterPage, CommunityViewer } from "./worlds";
import {
  Scanner,
  Identify,
  Record,
  CardPage,
  Unlock,
  Contributions,
} from "./discovery";
const Researcher = React.lazy(() =>
  import("./research").then((m) => ({ default: m.Researcher })),
);
const Showcase = React.lazy(() =>
  import("./research").then((m) => ({ default: m.Showcase })),
);
import "./style.css";
import "./upgrades.css";
function Navigation() {
  const items = [
    ["/home", HomeIcon, "Home"],
    ["/map", MapIcon, "Map"],
    ["/scan", Camera, "Scan"],
    ["/collection", Layers, "Collection"],
    ["/explore", Compass, "Explore"],
  ] as const;
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map(([url, Icon, label]) => (
        <NavLink
          key={url}
          to={url}
          className={({ isActive }) =>
            `${isActive ? "active " : ""}${label === "Scan" ? "scan-nav" : ""}`
          }
        >
          <span>
            <Icon size={23} />
          </span>
          <small>{label}</small>
        </NavLink>
      ))}
    </nav>
  );
}
function Gate() {
  const { state } = React.useContext(Context);
  if (!activeConsent(state)) return <Navigate to="/consent" replace />;
  return (
    <>
      <div className="topbar">
        <Logo />
        <Link
          className="avatar"
          to="/profile"
          aria-label="Open explorer profile"
        >
          <UserRound size={20} />
        </Link>
      </div>
      <main className="content">
        <Outlet />
      </main>
      <Navigation />
    </>
  );
}
function App() {
  const [state, setState] = useState(repository.load);
  const [draft, setDraft] = useState<Draft>({});
  const [message, setMessage] = useState("");
  const loc = useLocation();
  useEffect(() => {
    document.title = config.name;
    const sync = (e: StorageEvent) => {
      if (e.key === config.storageKey) setState(repository.load());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    try {
      repository.save(state);
    } catch {
      setMessage("Storage is full. Remove photo records or reset the demo.");
    }
  }, [state]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loc.pathname]);
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);
  const wide =
    loc.pathname.startsWith("/researcher-demo") || loc.pathname === "/showcase";
  return (
    <Context.Provider
      value={{ state, setState, draft, setDraft, toast: setMessage }}
    >
      <div className={wide ? "wide-shell" : "app-shell"}>
        {!wide && (
          <div className="desktop-note">
            <Leaf />
            <span>
              A little curiosity.
              <br />
              <strong>A world of discovery.</strong>
            </span>
            <p>
              A working concept for nature lovers
              <br />
              and biodiversity research.
            </p>
            <Link to="/researcher-demo">
              Researcher demonstration <ArrowUpRight size={15} />
            </Link>
            <Link to="/showcase">
              Presentation showcase <ArrowUpRight size={15} />
            </Link>
            <small>Local prototype · no external submissions</small>
          </div>
        )}
        <div className={wide ? "" : "mobile-app"}>
          <React.Suspense
            fallback={
              <div className="route-loading">
                <Leaf size={28} />
                <p>Opening a little wonder…</p>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/consent" element={<ConsentPage />} />
              <Route element={<Gate />}>
                <Route path="/home" element={<Home />} />
                <Route path="/map" element={<DiscoveryMap />} />
                <Route path="/explore" element={<ExploreWorlds />} />
                <Route path="/field-guide" element={<FieldGuide />} />
                <Route path="/character/:id" element={<CharacterPage />} />
                <Route path="/community/:id" element={<CommunityViewer />} />
                <Route path="/scan" element={<Scanner />} />
                <Route path="/identify/:id" element={<Identify />} />
                <Route path="/record/:id" element={<Record />} />
                <Route path="/card/:id" element={<CardPage />} />
                <Route path="/unlock/:id" element={<Unlock />} />
                <Route path="/collection" element={<Collection />} />
                <Route path="/ecosystem" element={<ExploreWorlds />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/contributions" element={<Contributions />} />
                <Route path="/sites" element={<Sites />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/credits" element={<Credits />} />
              </Route>
              <Route path="/researcher-demo" element={<Researcher />} />
              <Route path="/showcase" element={<Showcase />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </React.Suspense>
        </div>
      </div>
      {message && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          {message}
        </div>
      )}
    </Context.Provider>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
