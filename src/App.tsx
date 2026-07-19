import React, { useState, useEffect } from "react";
import {
  Compass,
  Sparkles,
  Grid,
  Users,
  Zap,
  Heart,
  Clock,
  ArrowLeft,
  Share2,
  Flame,
  Menu,
  X,
  ChevronRight,
  Info,
  Play,
  FlaskConical,
  Globe,
  Moon,
  Sun,
  Settings
} from "lucide-react";
import { Game, GameCategory, UserProgress } from "./types";
import { GAMES_DB } from "./data";
import { TRANSLATIONS } from "./translations";

// Games Import
import GameRenderer from "./games/GameRenderer";

const LIVE_GAME_PATHS: Record<string, string> = {
  "ball-sort-puzzle": "/games/ball-sort-puzzle/",
};

type InfoPageId = "about" | "privacy" | "terms";
type ActiveTab = "home" | "favorites" | "recently-played" | InfoPageId;

const INFO_PAGE_PATHS: Record<InfoPageId, string> = {
  about: "/about",
  privacy: "/privacy",
  terms: "/terms",
};

const getInitialGameId = () => {
  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  return Object.entries(LIVE_GAME_PATHS).find(([, path]) => path.replace(/\/+$/, "") === currentPath)?.[0] || null;
};

const getInitialTab = (): ActiveTab => {
  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const infoPage = Object.entries(INFO_PAGE_PATHS).find(([, path]) => path === currentPath)?.[0] as InfoPageId | undefined;
  return infoPage || "home";
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(getInitialTab);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(getInitialGameId);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Settings
  const [language, setLanguage] = useState<"en" | "zh">("zh");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Local State persistence (Streak, Favorites, Recently Played)
  const [progress, setProgress] = useState<UserProgress>({
    streak: 0,
    lastPlayedDate: "",
    recentlyPlayedIds: [],
    favoriteIds: [],
    highScores: {}
  });

  // Recent Game Score / Feedback
  const [latestResult, setLatestResult] = useState<{ score: number; shareText: string } | null>(null);

  // Load language, theme, and progress from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("curiohole_lang") as "en" | "zh";
    const savedTheme = localStorage.getItem("curiohole_theme") as "dark" | "light";
    if (savedLang) setLanguage(savedLang);
    if (savedTheme) setTheme(savedTheme);

    const savedProgress = localStorage.getItem("curiohole_progress") || localStorage.getItem("curious_minds_progress");
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setProgress(parsed);
      } catch (e) {
        console.error("Error reading progress", e);
      }
    } else {
      const initial: UserProgress = {
        streak: 0,
        lastPlayedDate: "",
        recentlyPlayedIds: [],
        favoriteIds: [],
        highScores: {}
      };
      localStorage.setItem("curiohole_progress", JSON.stringify(initial));
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const gameId = getInitialGameId();
      setSelectedGameId(gameId);
      setActiveTab(gameId ? "home" : getInitialTab());
      setIsPlaying(Boolean(gameId));
      setLatestResult(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleLanguageChange = (lang: "en" | "zh") => {
    setLanguage(lang);
    localStorage.setItem("curiohole_lang", lang);
  };

  const handleThemeChange = (t: "dark" | "light") => {
    setTheme(t);
    localStorage.setItem("curiohole_theme", t);
  };

  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem("curiohole_progress", JSON.stringify(newProgress));
  };

  // Streak update function
  const handleUpdateStreak = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = progress.streak;
    if (progress.lastPlayedDate === yesterdayStr) {
      newStreak += 1;
    } else if (progress.lastPlayedDate !== todayStr) {
      newStreak = 1; // broken streak, restart
    }

    saveProgress({
      ...progress,
      streak: newStreak,
      lastPlayedDate: todayStr
    });
  };

  const handleToggleFavorite = (gameId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFavorite = progress.favoriteIds.includes(gameId);
    let updatedFavorites = [...progress.favoriteIds];
    if (isFavorite) {
      updatedFavorites = updatedFavorites.filter((id) => id !== gameId);
    } else {
      updatedFavorites.push(gameId);
    }
    saveProgress({
      ...progress,
      favoriteIds: updatedFavorites
    });
  };

  const handleSelectGame = (gameId: string) => {
    setSelectedGameId(gameId);
    setIsPlaying(true);
    setLatestResult(null);

    const gamePath = LIVE_GAME_PATHS[gameId];
    if (gamePath && window.location.pathname !== gamePath) {
      window.history.pushState({}, "", gamePath);
    }

    // Track recently played
    let updatedRecent = [gameId, ...progress.recentlyPlayedIds.filter((id) => id !== gameId)];
    if (updatedRecent.length > 5) {
      updatedRecent = updatedRecent.slice(0, 5);
    }
    saveProgress({
      ...progress,
      recentlyPlayedIds: updatedRecent
    });
  };

  const handleGoHome = () => {
    setSelectedGameId(null);
    setIsPlaying(false);
    setLatestResult(null);
    setActiveTab("home");
    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }
  };

  const handleNavigateTab = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setSelectedGameId(null);
    setIsPlaying(false);
    setLatestResult(null);

    const nextPath = tabId === "home" || tabId === "favorites" || tabId === "recently-played"
      ? "/"
      : INFO_PAGE_PATHS[tabId];

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
  };

  const handlePlayGame = () => {
    setIsPlaying(true);
    setLatestResult(null);
  };

  const handleGameCompleted = (score: number, shareText: string) => {
    setLatestResult({ score, shareText });
    
    // Save high score if higher
    if (selectedGameId) {
      const currentHigh = progress.highScores[selectedGameId] || 0;
      if (score > currentHigh) {
        saveProgress({
          ...progress,
          highScores: {
            ...progress.highScores,
            [selectedGameId]: score
          }
        });
      }
    }
  };

  // Translation helper
  const getTranslation = (key: keyof typeof TRANSLATIONS.en, replaces?: Record<string, any>) => {
    let str = TRANSLATIONS[language][key] || TRANSLATIONS.en[key] || "";
    if (replaces) {
      Object.entries(replaces).forEach(([k, val]) => {
        str = str.replace(`{{${k}}}`, String(val));
      });
    }
    return str;
  };

  // Dynamic style mappings for light/dark themes
  const styles = {
    bg: theme === "dark" ? "bg-[#0b0c0f] text-gray-200" : "bg-[#f8fafc] text-slate-800",
    card: theme === "dark" ? "bg-[#141519] border-gray-800/80" : "bg-white border-slate-200/80 shadow-sm",
    cardHover: theme === "dark" ? "hover:bg-[#1a1b20] hover:border-gray-700" : "hover:bg-slate-50 hover:border-slate-300 hover:shadow-md",
    textTitle: theme === "dark" ? "text-white" : "text-slate-900",
    textMuted: theme === "dark" ? "text-gray-400" : "text-slate-500",
    textMutedLight: theme === "dark" ? "text-gray-500" : "text-slate-400",
    bgSubtle: theme === "dark" ? "bg-gray-950/60 border-gray-900" : "bg-slate-100/60 border-slate-200",
    bgNested: theme === "dark" ? "bg-gray-950" : "bg-slate-50",
    border: theme === "dark" ? "border-gray-800" : "border-slate-200",
    sidebar: theme === "dark" ? "bg-[#141519] border-gray-800/80" : "bg-white border-slate-200 shadow-sm",
    input: theme === "dark" ? "bg-gray-950 border-gray-800 text-white" : "bg-white border-slate-200 text-slate-900",
    overlay: theme === "dark" ? "bg-black/60" : "bg-slate-900/40"
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "FlaskConical":
        return <FlaskConical className="w-4 h-4" />;
      case "Compass":
        return <Compass className="w-4 h-4" />;
      case "Sparkles":
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case "Grid":
        return <Grid className="w-4 h-4 text-emerald-400" />;
      case "Users":
        return <Users className="w-4 h-4 text-[#ff007f]" />;
      case "Zap":
        return <Zap className="w-4 h-4 text-red-400" />;
      default:
        return <Compass className="w-4 h-4" />;
    }
  };

  const selectedGame = GAMES_DB.find((g) => g.id === selectedGameId);

  const infoPageContent: Record<InfoPageId, {
    title: string;
    intro: string;
    sections: { title: string; body: string }[];
  }> = {
    about: {
      title: "About CurioHole",
      intro:
        "CurioHole is a small collection of quick browser games made for short breaks, light mental warmups, and relaxing play. The site is designed to be simple: open a game, understand it quickly, and start playing without installing anything.",
      sections: [
        {
          title: "What we build",
          body:
            "We focus on tiny games that work well in a browser: logic puzzles, visual pattern games, reaction challenges, and casual party-style ideas. Ball Sort Puzzle is the first live game, and more games can be added to the same portal over time."
        },
        {
          title: "How CurioHole works",
          body:
            "The current games run directly in your browser. You do not need to download an app, create an account, or pay before playing. Basic preferences such as theme, language, favorites, and recent games may be stored locally in your browser."
        }
      ]
    },
    privacy: {
      title: "Privacy Policy",
      intro:
        "CurioHole is built to be lightweight and low-friction. The current version does not require user accounts, email addresses, passwords, or payment information.",
      sections: [
        {
          title: "Information stored in your browser",
          body:
            "CurioHole may use local browser storage to remember display settings, favorite games, recent games, streaks, and high scores. This data stays on your device unless your browser or device syncs it through services you control."
        },
        {
          title: "Analytics and advertising",
          body:
            "The current site may be updated in the future to use privacy-conscious analytics or advertising tools. If those tools are added, this policy should be updated to explain what is collected and why."
        },
        {
          title: "Third-party links",
          body:
            "CurioHole may link to third-party websites or platforms. Their privacy practices are controlled by their own policies, not by CurioHole."
        }
      ]
    },
    terms: {
      title: "Terms of Use",
      intro:
        "By using CurioHole, you agree to use the website and games for personal entertainment and casual learning purposes.",
      sections: [
        {
          title: "Free browser games",
          body:
            "CurioHole provides lightweight browser games on an as-is basis. We try to keep the site available and working, but we do not guarantee that every game or feature will always be uninterrupted or error-free."
        },
        {
          title: "Acceptable use",
          body:
            "Please do not misuse the site, attempt to disrupt the service, copy the site in a misleading way, or use automated traffic that harms performance for other visitors."
        },
        {
          title: "Changes to the site",
          body:
            "CurioHole may update, remove, rename, or add games and pages over time. These terms may also be updated as the site grows."
        }
      ]
    }
  };

  // Group games dynamically into the three user-friendly categories
  const categoriesWithGames = [
    {
      id: "puzzle",
      title: language === "zh" ? "🧠 益智脑洞" : "🧠 Puzzles & Logic",
      games: GAMES_DB.filter(g => g.category === GameCategory.PUZZLE)
    },
    {
      id: "reaction",
      title: language === "zh" ? "⚡ 反应手速" : "⚡ Reaction Arcade",
      games: GAMES_DB.filter(g => g.category === GameCategory.REACTION)
    },
    {
      id: "party",
      title: language === "zh" ? "🔮 聚会趣味" : "🔮 Party & Friends",
      games: GAMES_DB.filter(g => g.category === GameCategory.PARTY)
    }
  ];

  const favoriteGames = GAMES_DB.filter(g => progress.favoriteIds.includes(g.id));
  const recentlyPlayedGames = GAMES_DB.filter(g => progress.recentlyPlayedIds.includes(g.id));

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans selection:bg-[#00ffcc] selection:text-gray-950 transition-colors duration-300 ${styles.bg}`}>
      
      {/* Mobile Header Banner */}
      <div className={`md:hidden flex items-center justify-between px-4 py-3.5 sticky top-0 z-50 shadow-md border-b ${styles.sidebar}`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleGoHome}>
          <div className="w-8 h-8 bg-[#00ffcc]/10 border border-[#00ffcc]/40 rounded-lg flex items-center justify-center text-[#00ffcc] font-display font-bold text-base shadow-sm">
            C
          </div>
          <span className={`font-display font-bold text-base tracking-wide ${styles.textTitle}`}>
            {getTranslation("brandName")}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {progress.streak > 0 && (
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-md text-amber-500 font-mono text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
              <span>{progress.streak}</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1.5 rounded-lg border transition-colors ${
              theme === "light" 
                ? "text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-200" 
                : "text-gray-400 bg-gray-950/40 hover:text-white hover:bg-gray-800 border-gray-900"
            }`}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop & Mobile Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 md:static md:block z-40 transform transition-transform duration-300 flex flex-col h-full border-r ${
          styles.sidebar
        } ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Sidebar Header Logo */}
        <div
          onClick={() => {
            handleGoHome();
            setIsSidebarOpen(false);
          }}
          className={`p-5 border-b flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity ${styles.border}`}
        >
          <div className="w-9 h-9 bg-[#00ffcc]/10 border border-[#00ffcc]/30 rounded-xl flex items-center justify-center text-[#00ffcc] font-display font-black text-lg shadow-lg shadow-[#00ffcc]/5">
            C
          </div>
          <div>
            <h1 className={`font-display font-bold text-base tracking-tight ${styles.textTitle}`}>
              {getTranslation("brandName")}
            </h1>
            <p className={`text-[10px] font-medium ${styles.textMuted}`}>
              {getTranslation("brandSubtitle")}
            </p>
          </div>
        </div>

        {/* Navigation & Categories list */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Nav Section */}
          <div className="space-y-1">
            <button
              onClick={() => {
                handleGoHome();
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                activeTab === "home" && !selectedGameId
                  ? theme === "light"
                    ? "bg-slate-100 text-[#00ccaa] shadow-sm border border-slate-200"
                    : "bg-gray-950 text-[#00ffcc] shadow-sm border border-gray-800"
                  : theme === "light"
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-950/40"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{getTranslation("homeBase")}</span>
            </button>
          </div>

          {/* Expanded Game List Section */}
          <div className="space-y-5">
            {categoriesWithGames.map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold">
                  {cat.title}
                </div>
                <div className="space-y-0.5">
                  {cat.games.map((game) => {
                    const isActive = selectedGameId === game.id;
                    return (
                      <button
                        key={game.id}
                        onClick={() => {
                          handleSelectGame(game.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                          isActive
                            ? theme === "light"
                              ? "bg-slate-100 text-[#00ccaa] shadow-sm border border-slate-200"
                              : "bg-gray-950 text-[#00ffcc] shadow-sm border border-gray-800"
                            : theme === "light"
                            ? "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            : "text-gray-400 hover:text-gray-200 hover:bg-gray-950/40"
                        }`}
                      >
                        <span className="opacity-85 shrink-0">
                          {getIconComponent(game.icon)}
                        </span>
                        <span className="truncate">{game.name}</span>
                        {game.id === "ball-sort-puzzle" && (
                          <span className="ml-auto bg-[#00ffcc]/10 text-[#00ccaa] text-[9px] px-1 rounded font-bold scale-90">
                            {language === "zh" ? "可玩" : "Live"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* My Corner Section */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold mb-2">
              {getTranslation("myCorner")}
            </div>
            {[
              { id: "favorites", label: getTranslation("favorites"), icon: <Heart className="w-4 h-4 text-[#ff007f]" /> },
              { id: "recently-played", label: getTranslation("recentlyPlayed"), icon: <Clock className="w-4 h-4 text-blue-400" /> },
              { id: "about", label: getTranslation("about"), icon: <Info className="w-4 h-4" /> },
              { id: "privacy", label: getTranslation("privacy"), icon: <Info className="w-4 h-4" /> },
              { id: "terms", label: getTranslation("terms"), icon: <Info className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  handleNavigateTab(tab.id as ActiveTab);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                  activeTab === tab.id && !selectedGameId
                    ? theme === "light"
                      ? "bg-slate-100 text-[#00ccaa] shadow-sm border border-slate-200"
                      : "bg-gray-950 text-[#00ffcc] shadow-sm border border-gray-800"
                    : theme === "light"
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-950/40"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Section inside Sidebar */}
          <div className="pt-4 border-t border-gray-800/20 space-y-1">
            <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold mb-3 flex items-center gap-1">
              <Settings className="w-3 h-3" />
              <span>{getTranslation("settingsTitle")}</span>
            </div>
            
            {/* Lang toggle button bar */}
            <div className="px-3 space-y-1.5 mb-3">
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>{getTranslation("settingsLang")}</span>
              </span>
              <div className={`grid grid-cols-2 gap-1 p-0.5 rounded-lg border ${
                theme === "light" ? "bg-slate-100 border-slate-200" : "bg-gray-950 border-gray-900"
              }`}>
                <button
                  onClick={() => handleLanguageChange("zh")}
                  className={`py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    language === "zh"
                      ? "bg-[#00ffcc] text-gray-950"
                      : theme === "light"
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={`py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    language === "en"
                      ? "bg-[#00ffcc] text-gray-950"
                      : theme === "light"
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Theme toggle button bar */}
            <div className="px-3 space-y-1.5">
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                {theme === "light" ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3" />}
                <span>{getTranslation("settingsTheme")}</span>
              </span>
              <div className={`grid grid-cols-2 gap-1 p-0.5 rounded-lg border ${
                theme === "light" ? "bg-slate-100 border-slate-200" : "bg-gray-950 border-gray-900"
              }`}>
                <button
                  onClick={() => handleThemeChange("dark")}
                  className={`py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    theme === "dark"
                      ? "bg-[#00ffcc] text-gray-950"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Moon className="w-2.5 h-2.5" />
                  <span>{language === "zh" ? "深色" : "Dark"}</span>
                </button>
                <button
                  onClick={() => handleThemeChange("light")}
                  className={`py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    theme === "light"
                      ? "bg-[#00ffcc] text-gray-950"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Sun className="w-2.5 h-2.5" />
                  <span>{language === "zh" ? "浅色" : "Light"}</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer Stats */}
        <div className={`p-4 border-t space-y-3 ${styles.border}`}>
          <div className={`flex items-center justify-between p-3 rounded-xl border ${styles.bgSubtle}`}>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20" />
              <div>
                <div className="text-[10px] font-mono text-gray-500 uppercase font-bold">{getTranslation("activeStreak")}</div>
                <div className={`text-sm font-display font-bold ${styles.textTitle}`}>
                  {progress.streak} {progress.streak === 1 ? getTranslation("day") : getTranslation("days")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className={`fixed inset-0 z-30 md:hidden ${styles.overlay}`}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto max-w-5xl mx-auto w-full space-y-8">
        
        {/* App Title & Greeting (Desktop Only) */}
        <div className={`hidden md:flex justify-between items-center pb-2 border-b ${styles.border}`}>
          <div>
            <h1 className={`text-xl font-display font-bold ${styles.textTitle}`}>
              {selectedGameId
                ? selectedGame?.name
                : activeTab === "home"
                ? `${getTranslation("brandName")} 🧪`
                : activeTab === "favorites"
                ? getTranslation("favorites")
                : activeTab === "recently-played"
                ? getTranslation("recentlyPlayed")
                : infoPageContent[activeTab].title}
            </h1>
            <p className={`text-xs mt-1 ${styles.textMuted}`}>
              {selectedGameId 
                ? (language === "zh" && selectedGameId === "ball-sort-puzzle" ? "试管药剂颜色分类，极简脑力热身" : selectedGame?.description) 
                : "Tiny browser games to play in your break. No downloads, instant play."}
            </p>
          </div>
          {progress.streak > 0 && (
            <div className={`flex items-center gap-2 border px-3.5 py-1.5 rounded-xl ${
              theme === "light" ? "bg-amber-50 border-amber-200" : "bg-[#222328] border-gray-800"
            }`}>
              <Flame className="w-5 h-5 text-amber-500 fill-current animate-pulse" />
              <span className="font-mono text-sm font-bold text-amber-500">
                {getTranslation("streakStatus", { streak: progress.streak })}
              </span>
            </div>
          )}
        </div>

        {/* Game Logic Router */}
        {selectedGameId ? (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => {
                handleGoHome();
              }}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-[#00ffcc] text-sm font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{getTranslation("backToPortal")}</span>
            </button>

            {/* Active Gameplay Screen */}
            <div className={`rounded-2xl border p-4 shadow-xl ${
              theme === "light" ? "bg-slate-50/50 border-slate-200" : "bg-[#1c1d21] border-gray-800"
            }`}>
              <GameRenderer
                gameId={selectedGameId}
                gameName={selectedGame?.name || "Game"}
                language={language}
                theme={theme}
                onGameCompleted={handleGameCompleted}
                onUpdateStreak={handleUpdateStreak}
                onPlayFallback={() => {
                  handleSelectGame("ball-sort-puzzle");
                }}
              />
            </div>

            {/* Score Report / Feedback Summary Banner */}
            {latestResult && (
              <div className={`border p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md ${
                theme === "light" ? "bg-white border-slate-200" : "bg-gradient-to-r from-gray-900 to-[#1c1d21] border-gray-800"
              }`}>
                <div>
                  <div className="text-xs font-mono text-[#00ffcc] uppercase tracking-wider font-bold">Game Completed!</div>
                  <h4 className={`text-base font-display font-semibold mt-1 ${styles.textTitle}`}>
                    Awesome performance. Score of <span className="text-amber-500">{latestResult.score}</span> achieved!
                  </h4>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(latestResult.shareText);
                    alert(getTranslation("copiedAlert"));
                  }}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs py-2 px-4 rounded-xl transition-all border border-gray-800 cursor-pointer flex items-center gap-2 shrink-0 shadow"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#00ffcc]" />
                  <span>{getTranslation("copyResult")}</span>
                </button>
              </div>
            )}

            {/* Game details screen displayed below the game area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className={`md:col-span-2 rounded-2xl border p-6 md:p-8 space-y-6 ${styles.card}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#00ffcc]/10 border border-[#00ffcc]/30 rounded-xl flex items-center justify-center text-[#00ffcc]">
                      {selectedGame && getIconComponent(selectedGame.icon)}
                    </div>
                    <div>
                      <h2 className={`text-xl font-display font-bold tracking-tight ${styles.textTitle}`}>
                        {selectedGame?.name}
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedGame?.tags.map((t) => (
                          <span key={t} className={`border text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            theme === "light" ? "bg-slate-100 border-slate-200 text-slate-500" : "bg-gray-950 border-gray-800 text-gray-400"
                          }`}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleToggleFavorite(selectedGameId, e)}
                    className={`p-2 border rounded-xl transition-colors cursor-pointer ${
                      theme === "light" ? "bg-slate-100 border-slate-200 hover:bg-slate-200" : "bg-gray-950 hover:bg-[#222328] border-gray-800"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        progress.favoriteIds.includes(selectedGameId)
                          ? "text-[#ff007f] fill-[#ff007f]"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                </div>

                <p className={`leading-relaxed text-sm ${styles.textMuted}`}>
                  {selectedGameId === "ball-sort-puzzle" && language === "zh" 
                    ? "五彩斑斓的小球混装在化学试剂瓶中。通过空瓶子作为媒介进行倒水和转移，使得每一个瓶子里只有同一种颜色！极度舒适、释放压力的逻辑分类拼图。"
                    : selectedGame?.description}
                </p>

                <div className={`border-t pt-5 space-y-4 ${styles.border}`}>
                  <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">
                    {language === "zh" ? "玩法规则说明" : "How to play"}
                  </h3>
                  <p className={`text-sm leading-relaxed border p-4 rounded-xl ${
                    theme === "light" ? "bg-slate-50 border-slate-100 text-slate-600" : "bg-gray-950/40 border-gray-900 text-gray-400"
                  }`}>
                    {selectedGameId === "ball-sort-puzzle" && language === "zh"
                      ? "点击任意试管，可以选中其顶部的小球。再点击另一个有空间、或者最顶部小球颜色相同的试管进行倾倒。把所有颜色全部分类好即宣告成功！"
                      : selectedGame?.howToPlay}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">
                    {language === "zh" ? "为什么你会喜欢它" : "Why you'll like it"}
                  </h3>
                  <p className={`text-sm leading-relaxed border p-4 rounded-xl ${
                    theme === "light" ? "bg-slate-50 border-slate-100 text-slate-600" : "bg-gray-950/40 border-gray-900 text-gray-400"
                  }`}>
                    {selectedGameId === "ball-sort-puzzle" && language === "zh"
                      ? "游戏不设倒计时和体力限制，支持无限次撤销（Undo）。极其适合在上班摸鱼、等车、课间休息等碎片时间，让大脑来一次轻松有氧体操！"
                      : selectedGame?.whyYouWillLikeIt}
                  </p>
                </div>

                {selectedGame?.seoContent && (
                  <div className={`border-t pt-6 space-y-6 ${styles.border}`}>
                    <section className="space-y-3">
                      <h2 className={`text-lg font-display font-bold ${styles.textTitle}`}>
                        {selectedGame.name} Online
                      </h2>
                      <p className={`text-sm leading-7 ${styles.textMuted}`}>
                        {selectedGame.seoContent.overview}
                      </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <section className={`rounded-xl border p-4 space-y-3 ${
                        theme === "light" ? "bg-slate-50 border-slate-100" : "bg-gray-950/40 border-gray-900"
                      }`}>
                        <h3 className={`text-sm font-display font-bold ${styles.textTitle}`}>
                          Game Rules
                        </h3>
                        <ul className={`space-y-2 text-sm leading-relaxed ${styles.textMuted}`}>
                          {selectedGame.seoContent.rules.map((rule) => (
                            <li key={rule} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#00ffcc] shrink-0" />
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section className={`rounded-xl border p-4 space-y-3 ${
                        theme === "light" ? "bg-slate-50 border-slate-100" : "bg-gray-950/40 border-gray-900"
                      }`}>
                        <h3 className={`text-sm font-display font-bold ${styles.textTitle}`}>
                          Tips and Strategy
                        </h3>
                        <ul className={`space-y-2 text-sm leading-relaxed ${styles.textMuted}`}>
                          {selectedGame.seoContent.tips.map((tip) => (
                            <li key={tip} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    </div>

                    {selectedGame.seoContent.sections.map((section) => (
                      <section key={section.title} className="space-y-2">
                        <h2 className={`text-base font-display font-bold ${styles.textTitle}`}>
                          {section.title}
                        </h2>
                        <p className={`text-sm leading-7 ${styles.textMuted}`}>
                          {section.body}
                        </p>
                      </section>
                    ))}

                    <section className="space-y-3">
                      <h2 className={`text-base font-display font-bold ${styles.textTitle}`}>
                        Ball Sort Puzzle FAQ
                      </h2>
                      <div className="space-y-3">
                        {selectedGame.seoContent.faqs.map((faq) => (
                          <details
                            key={faq.question}
                            className={`rounded-xl border p-4 ${
                              theme === "light" ? "bg-slate-50 border-slate-100" : "bg-gray-950/40 border-gray-900"
                            }`}
                          >
                            <summary className={`cursor-pointer text-sm font-semibold ${styles.textTitle}`}>
                              {faq.question}
                            </summary>
                            <p className={`mt-3 text-sm leading-relaxed ${styles.textMuted}`}>
                              {faq.answer}
                            </p>
                          </details>
                        ))}
                      </div>
                    </section>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Performance stats panel */}
                <div className={`rounded-2xl border p-5 space-y-4 ${styles.card}`}>
                  <h3 className={`font-display font-bold text-sm ${styles.textTitle}`}>{getTranslation("statistics")}</h3>
                  
                  <div className="space-y-3">
                    <div className={`flex justify-between items-center py-2 border-b ${styles.border}`}>
                      <span className="text-xs font-mono text-gray-500">{getTranslation("avgDuration")}</span>
                      <span className={`text-xs font-semibold flex items-center gap-1 ${styles.textTitle}`}>
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {selectedGame?.playTime}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center py-2 border-b ${styles.border}`}>
                      <span className="text-xs font-mono text-gray-500">{getTranslation("cognitiveLoad")}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        selectedGame?.difficulty === "Easy" ? "bg-green-900/10 text-green-500 border border-green-500/20" :
                        selectedGame?.difficulty === "Medium" ? "bg-amber-900/10 text-amber-500 border border-amber-500/20" :
                        "bg-red-900/10 text-red-500 border border-red-500/20"
                      }`}>
                        {selectedGame ? getTranslation(`difficulty${selectedGame.difficulty}` as any) : ""}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center py-2 border-b ${styles.border}`}>
                      <span className="text-xs font-mono text-gray-500">{getTranslation("playerMode")}</span>
                      <span className={`text-xs font-semibold ${styles.textTitle}`}>
                        {selectedGame?.players === "Solo" && language === "zh" ? "单人益智" : selectedGame?.players}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs font-mono text-gray-500">{getTranslation("personalBest")}</span>
                      <span className="text-xs font-bold font-mono text-[#00ccaa]">
                        {selectedGame 
                          ? progress.highScores[selectedGame.id] 
                            ? `${progress.highScores[selectedGame.id]} ${language === "zh" ? "分" : "pts"}`
                            : getTranslation("noRecord") 
                          : getTranslation("noRecord")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Related mini games recommendation */}
                <div className={`rounded-2xl border p-5 space-y-4 ${styles.bgSubtle}`}>
                  <h3 className="font-display font-bold text-gray-400 text-xs uppercase tracking-wider">{getTranslation("relatedPuzzles")}</h3>
                  <div className="space-y-3">
                    {GAMES_DB.filter((g) => g.id !== selectedGameId).slice(0, 2).map((rg) => (
                      <div
                        key={rg.id}
                        onClick={() => handleSelectGame(rg.id)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          theme === "light" 
                            ? "bg-white border-slate-100 hover:border-slate-200" 
                            : "bg-gray-950/40 border-gray-900 hover:border-gray-800"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          theme === "light" ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-gray-900 border-gray-800 text-gray-400"
                        }`}>
                          {getIconComponent(rg.icon)}
                        </div>
                        <div>
                          <h4 className={`text-xs font-display font-bold ${styles.textTitle}`}>{rg.name}</h4>
                          <p className="text-[10px] text-gray-500">{rg.playTime} • {getTranslation(`difficulty${rg.difficulty}` as any)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Main Views */
          <div className="space-y-8">
            
            {/* HERO Header Area */}
            {activeTab === "home" && (
              <div className={`rounded-3xl border p-6 md:p-10 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 ${styles.card}`}>
                <div className="absolute inset-0 bg-radial from-[#00ffcc]/5 to-transparent rounded-3xl pointer-events-none" />
                <div className="space-y-3 max-w-lg text-center md:text-left relative z-10">
                  <span className="inline-flex bg-[#00ffcc]/10 border border-[#00ffcc]/30 text-[#00ffcc] text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                    {language === "zh" ? "碎片时间脑洞沙盒" : "TINY BRAIN SANDBOX"}
                  </span>
                  <h2 className={`text-3xl md:text-4xl font-display font-black leading-tight ${styles.textTitle}`}>
                    Tiny Games for <span className="text-[#00ffcc]">CurioHole</span>
                  </h2>
                  <p className={`text-sm leading-relaxed ${styles.textMuted}`}>
                    {language === "zh" 
                      ? "欢迎来到脑洞小游戏实验室！这里精选收集了各种治愈、益智和竞技类微型沙盒游戏。免下载，免登录，点开即玩。随时随地给大脑来一次轻松的有氧体操。"
                      : "Welcome to CurioHole Sandbox! Play interactive brain-training mini games designed for quick cognitive breaks. No downloads, no registration—just instant fun."}
                  </p>
                </div>

                {/* Animated decoration graphic */}
                <div className="relative w-36 h-36 hidden md:flex items-center justify-center shrink-0">
                  <div className="absolute w-32 h-32 border border-gray-800/10 rounded-full animate-spin [animation-duration:15s]" />
                  <div className="absolute w-24 h-24 border border-[#00ffcc]/10 rounded-full animate-spin [animation-duration:8s]" />
                  <div className="w-14 h-14 bg-gray-900 border-2 border-[#00ffcc] rounded-full flex items-center justify-center text-[#00ffcc] text-2xl shadow-2xl shadow-[#00ffcc]/20">
                    🧪
                  </div>
                </div>
              </div>
            )}

            {/* Category Listing Gallery */}
            {activeTab === "home" && (
              <div className="space-y-10">
                {categoriesWithGames.map((cat) => (
                  <div key={cat.id} className="space-y-5">
                    <div className="flex items-center gap-2 border-b pb-2 border-gray-800/10">
                      <h3 className={`text-lg font-display font-bold ${styles.textTitle}`}>
                        {cat.title}
                      </h3>
                      <span className="text-xs font-mono text-gray-500">
                        ({cat.games.length})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {cat.games.map((game) => {
                        const isBallSort = game.id === "ball-sort-puzzle";
                        return (
                          <div
                            key={game.id}
                            onClick={() => handleSelectGame(game.id)}
                            className={`rounded-2xl p-5 border space-y-4 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${styles.card} ${styles.cardHover} hover:-translate-y-1`}
                          >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00ffcc]/5 via-transparent to-transparent pointer-events-none" />
                            
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border group-hover:text-[#00ffcc] transition-colors ${
                                  theme === "light" ? "bg-slate-50 border-slate-200" : "bg-gray-950 border-gray-900"
                                }`}>
                                  {getIconComponent(game.icon)}
                                </div>
                                <span className="text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-500 px-2 py-0.5 rounded-md">
                                  {game.playTime}
                                </span>
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className={`text-base font-display font-bold tracking-tight ${styles.textTitle}`}>
                                    {game.name}
                                  </h4>
                                  {isBallSort ? (
                                    <span className="bg-[#00ffcc]/10 border border-[#00ffcc]/30 text-[#00ccaa] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                                      {language === "zh" ? "可玩" : "Live"}
                                    </span>
                                  ) : (
                                    <span className="bg-amber-500/5 border border-amber-500/20 text-amber-500 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                                      {language === "zh" ? "敬请期待" : "Soon"}
                                    </span>
                                  )}
                                </div>
                                <p className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${styles.textMuted}`}>
                                  {game.id === "ball-sort-puzzle" && language === "zh"
                                    ? "五彩药剂小球分类拼图，极其解压的大脑有氧体操。"
                                    : game.description}
                                </p>
                              </div>
                            </div>

                            <div className={`space-y-3 pt-3 border-t ${styles.border}`}>
                              <div className="flex flex-wrap gap-1">
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                  theme === "light" ? "bg-slate-100 text-slate-500" : "bg-gray-950 text-gray-500"
                                }`}>
                                  {game.players === "Solo" && language === "zh" ? "单人益智" : game.players}
                                </span>
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                  theme === "light" ? "bg-slate-100 text-slate-500" : "bg-gray-950 text-gray-500"
                                }`}>
                                  {getTranslation(`difficulty${game.difficulty}` as any)}
                                </span>
                              </div>

                              <button className={`w-full border text-xs font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                                theme === "light"
                                  ? isBallSort
                                    ? "bg-[#00ffcc] hover:bg-[#00e6b8] text-gray-950 border-transparent"
                                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                                  : isBallSort
                                  ? "bg-gray-900 group-hover:bg-[#00ffcc] group-hover:text-gray-950 border-gray-800 group-hover:border-transparent text-gray-300"
                                  : "bg-gray-950 text-gray-500 border-gray-900"
                              }`}>
                                <span>{isBallSort ? getTranslation("playNow") : getTranslation("comingSoon")}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List of games for Favorites tab */}
            {activeTab === "favorites" && (
              <div className="space-y-5">
                <div className={`flex justify-between items-center pb-2 border-b ${styles.border}`}>
                  <h3 className={`text-lg font-display font-bold ${styles.textTitle}`}>
                    {getTranslation("favorites")}
                  </h3>
                  <span className="text-xs font-mono text-gray-500">
                    {favoriteGames.length} {language === "zh" ? "款游戏" : "games"}
                  </span>
                </div>

                {favoriteGames.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteGames.map((game) => (
                      <div
                        key={game.id}
                        onClick={() => handleSelectGame(game.id)}
                        className={`rounded-2xl p-5 border space-y-4 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${styles.card} ${styles.cardHover}`}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border group-hover:text-[#00ffcc] transition-colors ${
                              theme === "light" ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-gray-950 border-gray-900 text-gray-400"
                            }`}>
                              {getIconComponent(game.icon)}
                            </div>
                            <span className="text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-500 px-2 py-0.5 rounded-md">
                              {game.playTime}
                            </span>
                          </div>

                          <div>
                            <h4 className={`text-base font-display font-bold tracking-tight ${styles.textTitle}`}>
                              {game.name}
                            </h4>
                            <p className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${styles.textMuted}`}>
                              {game.id === "ball-sort-puzzle" && language === "zh"
                                ? "试管药剂颜色物理分装。"
                                : game.description}
                            </p>
                          </div>
                        </div>

                        <div className={`space-y-3 pt-3 border-t ${styles.border}`}>
                          <div className="flex flex-wrap gap-1">
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              theme === "light" ? "bg-slate-100 text-slate-500" : "bg-gray-950 text-gray-500"
                            }`}>
                              {game.players === "Solo" && language === "zh" ? "单人" : game.players}
                            </span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              theme === "light" ? "bg-slate-100 text-slate-500" : "bg-gray-950 text-gray-500"
                            }`}>
                              {getTranslation(`difficulty${game.difficulty}` as any)}
                            </span>
                          </div>
                          
                          <button className={`w-full border text-xs font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                            theme === "light"
                              ? "bg-slate-50 hover:bg-[#00ffcc] hover:text-gray-950 hover:border-transparent text-slate-700 border-slate-200"
                              : "bg-gray-900 group-hover:bg-[#00ffcc] group-hover:text-gray-950 border-gray-800 group-hover:border-transparent text-gray-300"
                          }`}>
                            <span>{getTranslation("playNow")}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-16 rounded-2xl border ${styles.card}`}>
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className={`font-display text-sm ${styles.textTitle}`}>
                      {language === "zh" ? "收藏夹空空如也" : "No favorites yet"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* List of games for Recently Played tab */}
            {activeTab === "recently-played" && (
              <div className="space-y-5">
                <div className={`flex justify-between items-center pb-2 border-b ${styles.border}`}>
                  <h3 className={`text-lg font-display font-bold ${styles.textTitle}`}>
                    {getTranslation("recentlyPlayed")}
                  </h3>
                  <span className="text-xs font-mono text-gray-500">
                    {recentlyPlayedGames.length} {language === "zh" ? "款游戏" : "games"}
                  </span>
                </div>

                {recentlyPlayedGames.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentlyPlayedGames.map((game) => (
                      <div
                        key={game.id}
                        onClick={() => handleSelectGame(game.id)}
                        className={`rounded-2xl p-5 border space-y-4 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${styles.card} ${styles.cardHover}`}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border group-hover:text-[#00ffcc] transition-colors ${
                              theme === "light" ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-gray-950 border-gray-900 text-gray-400"
                            }`}>
                              {getIconComponent(game.icon)}
                            </div>
                            <span className="text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-500 px-2 py-0.5 rounded-md">
                              {game.playTime}
                            </span>
                          </div>

                          <div>
                            <h4 className={`text-base font-display font-bold tracking-tight ${styles.textTitle}`}>
                              {game.name}
                            </h4>
                            <p className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${styles.textMuted}`}>
                              {game.id === "ball-sort-puzzle" && language === "zh"
                                ? "试管药剂颜色分类拼图"
                                : game.description}
                            </p>
                          </div>
                        </div>

                        <div className={`space-y-3 pt-3 border-t ${styles.border}`}>
                          <div className="flex flex-wrap gap-1">
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              theme === "light" ? "bg-slate-100 text-slate-500" : "bg-gray-950 text-gray-500"
                            }`}>
                              {game.players === "Solo" && language === "zh" ? "单人" : game.players}
                            </span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              theme === "light" ? "bg-slate-100 text-slate-500" : "bg-gray-950 text-gray-500"
                            }`}>
                              {getTranslation(`difficulty${game.difficulty}` as any)}
                            </span>
                          </div>
                          
                          <button className={`w-full border text-xs font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                            theme === "light"
                              ? "bg-slate-50 hover:bg-[#00ffcc] hover:text-gray-950 hover:border-transparent text-slate-700 border-slate-200"
                              : "bg-gray-900 group-hover:bg-[#00ffcc] group-hover:text-gray-950 border-gray-800 group-hover:border-transparent text-gray-300"
                          }`}>
                            <span>{getTranslation("playNow")}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-16 rounded-2xl border ${styles.card}`}>
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className={`font-display text-sm ${styles.textTitle}`}>
                      {language === "zh" ? "暂无最近玩过的记录" : "No recently played games"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Trust and legal info pages */}
            {(activeTab === "about" || activeTab === "privacy" || activeTab === "terms") && (
              <div className={`rounded-2xl border p-6 md:p-8 space-y-7 max-w-3xl mx-auto ${styles.card}`}>
                <div className="space-y-3 text-center md:text-left">
                  <div className="w-14 h-14 bg-[#00ffcc]/10 border border-[#00ffcc]/30 rounded-2xl flex items-center justify-center text-[#00ffcc] mx-auto md:mx-0 shadow-lg">
                    {activeTab === "about" ? "🧪" : activeTab === "privacy" ? "🔒" : "📄"}
                  </div>
                  <h2 className={`text-2xl font-display font-bold ${styles.textTitle}`}>
                    {infoPageContent[activeTab].title}
                  </h2>
                  <p className={`text-sm leading-relaxed ${styles.textMuted}`}>
                    {infoPageContent[activeTab].intro}
                  </p>
                </div>

                <div className={`space-y-4 pt-5 border-t ${styles.border}`}>
                  {infoPageContent[activeTab].sections.map((section) => (
                    <section key={section.title} className={`p-5 rounded-xl border ${styles.bgSubtle}`}>
                      <h3 className={`font-display font-semibold text-sm ${styles.textTitle}`}>
                        {section.title}
                      </h3>
                      <p className={`text-sm mt-2 leading-7 ${styles.textMuted}`}>
                        {section.body}
                      </p>
                    </section>
                  ))}
                </div>

                <div className="text-center pt-6 text-xs text-gray-500 font-mono">
                  {getTranslation("crew")}
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
