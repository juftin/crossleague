import React, { useEffect } from "react";
import { Zap, AlertCircle } from "lucide-react";
import { useCrossLeagueStore } from "../state/useCrossLeagueStore.js";
import { Header } from "./header/Header.tsx";
import { AwardsTab } from "./tabs/AwardsTab.tsx";
import { LeaderboardTab } from "./tabs/LeaderboardTab.tsx";
import { VisualsTab } from "./tabs/VisualsTab.tsx";
import { LeagueGridTab } from "./tabs/LeagueGridTab.tsx";
import { LuckTab } from "./tabs/LuckTab.tsx";
import { PlayersTab } from "./tabs/PlayersTab.tsx";
import { LuckModal } from "./modals/LuckModal.tsx";
import { ToastContainer } from "./common/Toast.tsx";
import { MobileBottomNav } from "./common/MobileBottomNav.tsx";
import { syncData } from "../services/syncService.js";
import { getUrlParams } from "../state/urlParams.js";
import { BASE_URL, HASH_TAB_MAP } from "../state/constants.js";
import { cachedApiFetch } from "../state/cache.js";
import { getMaxPlayedWeek } from "../state/preferences.js";

export const App: React.FC = () => {
  const activeTab = useCrossLeagueStore(s => s.activeTab);
  const setActiveTab = useCrossLeagueStore(s => s.setActiveTab);
  const loading = useCrossLeagueStore(s => s.loading);
  const loadingText = useCrossLeagueStore(s => s.loadingText);
  const progress = useCrossLeagueStore(s => s.progress);
  const error = useCrossLeagueStore(s => s.error);
  const setError = useCrossLeagueStore(s => s.setError);
  const week = useCrossLeagueStore(s => s.week);
  const setWeek = useCrossLeagueStore(s => s.setWeek);
  const season = useCrossLeagueStore(s => s.season);
  const setSeason = useCrossLeagueStore(s => s.setSeason);
  const mode = useCrossLeagueStore(s => s.mode);
  const setMode = useCrossLeagueStore(s => s.setMode);
  const platform = useCrossLeagueStore(s => s.platform);
  const setPlatform = useCrossLeagueStore(s => s.setPlatform);
  const userName = useCrossLeagueStore(s => s.userName);
  const setUserName = useCrossLeagueStore(s => s.setUserName);
  const setSyncType = useCrossLeagueStore(s => s.setSyncType);
  const setCustomLeagueIds = useCrossLeagueStore(s => s.setCustomLeagueIds);
  const setNflState = useCrossLeagueStore(s => s.setNflState);
  const openSettingsModal = useCrossLeagueStore(s => s.openSettingsModal);
  const rawRecords = useCrossLeagueStore(s => s.rawRecords);

  // Initialize from embedded report, URL parameters, or localStorage
  useEffect(() => {
    async function init() {
      // 1. Load a snapshot fixture when generating visual regression screenshots.
      const snapshot = (window as any).__CROSSLEAGUE_SNAPSHOT_DATA__;
      if (snapshot) {
        useCrossLeagueStore.setState({
          platform: snapshot.platform || "sleeper",
          mode: snapshot.mode || "WEEKLY",
          season: Number(snapshot.season) || new Date().getFullYear(),
          week: Number(snapshot.week) || 1,
          userId: snapshot.user?.id || "",
          userName: snapshot.user?.name || "",
          userAvatar: snapshot.user?.avatar || "",
          rawRecords: snapshot.records || [],
          leaguesMap: snapshot.leaguesMap || {},
          allLeaguesData: snapshot.allLeaguesData || [],
          selectedLeagueIds: snapshot.selectedLeagueIds || Object.keys(snapshot.leaguesMap || {}),
          sleeperPlayersDb: snapshot.sleeperPlayersDb || {},
          espnPlayersDb: snapshot.espnPlayersDb || {},
          nflState: snapshot.nflState || {},
          loading: false,
          error: null,
          isSettingsOpen: false
        });
        return;
      }

      // 2. Load stored preferences from localStorage
      const savedPlatform = localStorage.getItem("crossleague_platform");
      if (savedPlatform === "espn" || savedPlatform === "sleeper") {
        setPlatform(savedPlatform);
      }
      const savedSyncType = localStorage.getItem("sleeper_sync_type");
      if (savedSyncType === "leagues" || savedSyncType === "user") {
        setSyncType(savedSyncType);
      }
      const savedCustomLeagues = localStorage.getItem("sleeper_custom_league_ids");
      if (savedCustomLeagues) {
        try {
          const parsed = JSON.parse(savedCustomLeagues);
          if (Array.isArray(parsed)) setCustomLeagueIds(parsed.filter(Boolean));
        } catch {}
      }
      const savedUser =
        localStorage.getItem("sleeper_username") || localStorage.getItem("sleeper_user_id");
      if (savedUser) setUserName(savedUser);
      const savedSeason = localStorage.getItem("sleeper_season");
      if (savedSeason) setSeason(Number(savedSeason));
      const savedWeek = localStorage.getItem("sleeper_week");
      if (savedWeek) setWeek(Number(savedWeek));
      const savedMode = localStorage.getItem("sleeper_mode");
      if (savedMode === "WEEKLY" || savedMode === "SEASON_ROLLUP") {
        setMode(savedMode);
      }

      // 3. URL Query Parameter overrides
      const urlParams = getUrlParams();
      if (urlParams.platform) {
        setPlatform(urlParams.platform.toLowerCase() === "espn" ? "espn" : "sleeper");
      }
      if (urlParams.user) {
        setSyncType("user");
        setUserName(urlParams.user.trim());
      }
      if (urlParams.leagues) {
        const ids = urlParams.leagues
          .split(",")
          .map((id: string) => id.trim())
          .filter(Boolean);
        setCustomLeagueIds(ids);
        if (!urlParams.user) setSyncType("leagues");
      }
      if (urlParams.season) setSeason(Number(urlParams.season));
      if (urlParams.week) setWeek(Number(urlParams.week));
      if (urlParams.mode) {
        setMode(urlParams.mode.toUpperCase() === "SEASON_ROLLUP" ? "SEASON_ROLLUP" : "WEEKLY");
      }

      // 4. Tab from hash
      if (typeof window !== "undefined" && window.location.hash) {
        const h = window.location.hash.replace("#", "").toLowerCase();
        if (HASH_TAB_MAP[h]) {
          setActiveTab(HASH_TAB_MAP[h], false);
        }
      }

      // 5. NFL State Metadata fetch
      try {
        const nflData = await cachedApiFetch(`${BASE_URL}/state/nfl`, {
          ttlMs: 2 * 60 * 60 * 1000
        });
        if (nflData) {
          const nfl = {
            season: parseInt(nflData.season, 10) || new Date().getFullYear(),
            week: parseInt(nflData.week, 10) || 1,
            display_week: parseInt(nflData.display_week, 10) || parseInt(nflData.week, 10) || 1,
            season_type: nflData.season_type || "regular"
          };
          setNflState(nfl);
          if (!urlParams.season && !localStorage.getItem("sleeper_season") && nfl.season) {
            setSeason(nfl.season);
          }
          if (!urlParams.week && !localStorage.getItem("sleeper_week")) {
            const defaultWeek = nfl.display_week || nfl.week || 1;
            if (defaultWeek >= 1 && defaultWeek <= 18) {
              setWeek(defaultWeek);
            }
          }
        }
      } catch (e) {
        console.warn("Could not fetch NFL state:", e);
      }

      // 6. Check if user is set, then auto-sync
      const currentStore = useCrossLeagueStore.getState();
      const hasUser =
        Boolean(currentStore.userName) ||
        (currentStore.syncType === "leagues" && currentStore.customLeagueIds.length > 0) ||
        Boolean(urlParams.user) ||
        Boolean(urlParams.leagues);

      if (hasUser) {
        syncData(false);
      } else {
        openSettingsModal();
      }
    }

    init();
  }, [
    setPlatform,
    setSyncType,
    setCustomLeagueIds,
    setUserName,
    setSeason,
    setWeek,
    setMode,
    setActiveTab,
    setNflState,
    openSettingsModal
  ]);

  // Re-sync when week, season, or mode changes (only on subsequent updates)
  const isInitialMount = React.useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const s = useCrossLeagueStore.getState();
    const hasSource =
      Boolean(s.userName) ||
      (s.syncType === "leagues" && s.customLeagueIds.length > 0) ||
      (s.platform === "espn" && s.customLeagueIds.length > 0);

    if (hasSource && !(window as any).__CROSSLEAGUE_SNAPSHOT_DATA__) {
      syncData(false);
    }
  }, [week, season, mode]);

  // Arrow Keybindings (Left / Right arrow for weeks)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      const maxPlayed = getMaxPlayedWeek();
      if (e.key === "ArrowLeft") {
        if (week > 1) {
          e.preventDefault();
          setWeek(week - 1);
        }
      } else if (e.key === "ArrowRight") {
        if (week < maxPlayed) {
          e.preventDefault();
          setWeek(week + 1);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [week, setWeek]);

  // Sync hash changes
  useEffect(() => {
    function handleHashChange() {
      const h = window.location.hash.replace("#", "").toLowerCase();
      if (HASH_TAB_MAP[h]) {
        setActiveTab(HASH_TAB_MAP[h], false);
      }
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [setActiveTab]);

  return (
    <div className="text-slate-100 min-h-screen antialiased flex flex-col pt-16 sm:pt-36 selection:bg-emerald-500 selection:text-slate-950">
      <Header />

      {/* Main Content Container (Full-Width Fluid) */}
      <main className="flex-1 w-full px-3 sm:px-8 lg:px-12 pt-1 pb-24 sm:pt-0 sm:pb-8 space-y-4 sm:space-y-6">
        {/* Live Loading Bar */}
        {loading && (
          <div id="statusContainer" className="space-y-2 pb-2">
            <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-300">
              <span id="statusText" className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                {loadingText || "Loading rosters & matchups..."}
              </span>
              <span id="progressText" className="font-mono text-emerald-400 font-bold">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-slate-900/90 rounded-full h-2.5 p-0.5 border border-slate-800 overflow-hidden">
              <div
                id="progressBar"
                className="bg-gradient-to-r from-emerald-500 via-cyan-400 to-teal-300 h-full rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/40"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div
            id="errorBanner"
            className="bg-rose-950/40 border border-rose-500/30 text-rose-200 rounded-xl p-4 text-sm sm:text-base flex items-start gap-3 backdrop-blur"
          >
            <AlertCircle className="w-6 h-6 flex-shrink-0 text-rose-400 mt-0.5" />
            <div id="errorMessage" className="font-semibold">
              {error}
            </div>
          </div>
        )}

        {/* Skeleton Loading Placeholder */}
        {loading && rawRecords.length === 0 && (
          <div id="skeletonLoader" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="h-48 rounded-2xl skeleton-loader"></div>
              <div className="h-52 rounded-2xl skeleton-loader"></div>
              <div className="h-48 rounded-2xl skeleton-loader"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="h-28 rounded-xl skeleton-loader"></div>
              <div className="h-28 rounded-xl skeleton-loader"></div>
              <div className="h-28 rounded-xl skeleton-loader"></div>
              <div className="h-28 rounded-xl skeleton-loader"></div>
              <div className="h-28 rounded-xl skeleton-loader col-span-1"></div>
            </div>
            <div className="h-96 rounded-2xl skeleton-loader"></div>
          </div>
        )}

        {/* Initial Placeholder State */}
        {rawRecords.length === 0 && !loading && (
          <div
            id="initialState"
            className="glass-card rounded-2xl p-16 text-center text-slate-400 space-y-5 border border-slate-800 max-w-3xl mx-auto my-12"
          >
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
              <Zap className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Who Actually Ran the League?
            </h3>
            <p className="text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
              Drop your Sleeper handle above to stack all your squads and league rivals on one
              universal power board.
            </p>
          </div>
        )}

        {/* Content Area (Full-Width) */}
        {rawRecords.length > 0 && (
          <div id="reportContent" className="space-y-6">
            {activeTab === "awards" && <AwardsTab />}
            {activeTab === "leaderboard" && <LeaderboardTab />}
            {activeTab === "visuals" && <VisualsTab />}
            {activeTab === "leagueGrid" && <LeagueGridTab />}
            {activeTab === "luck" && <LuckTab />}
            {activeTab === "players" && <PlayersTab />}
          </div>
        )}
      </main>

      {/* Footer (Full-Width Fluid) */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-7 text-center text-sm text-slate-500 mt-auto w-full">
        <div className="w-full px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <div className="text-slate-400 font-semibold inline-flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>CrossLeague • Fantasy Football Power Rankings</span>
          </div>
        </div>
      </footer>

      {/* Global Modals & Controls */}
      <LuckModal />
      <ToastContainer />
      <MobileBottomNav />
    </div>
  );
};
