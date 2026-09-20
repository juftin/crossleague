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
import { getUrlParams, extractCustomLeagueIds, updateUrlParams } from "../state/urlParams.js";
import { BASE_URL, HASH_TAB_MAP } from "../state/constants.js";
import { cachedApiFetch } from "../state/cache.js";
import { getMaxPlayedWeek } from "../state/preferences.js";
import { initPlayersDb } from "../api/players.js";

export const App: React.FC = () => {
  const activeTab = useCrossLeagueStore(s => s.activeTab);
  const setActiveTab = useCrossLeagueStore(s => s.setActiveTab);
  const loading = useCrossLeagueStore(s => s.loading);
  const loadingText = useCrossLeagueStore(s => s.loadingText);
  const progress = useCrossLeagueStore(s => s.progress);
  const error = useCrossLeagueStore(s => s.error);
  const week = useCrossLeagueStore(s => s.week);
  const setWeek = useCrossLeagueStore(s => s.setWeek);
  const season = useCrossLeagueStore(s => s.season);
  const setSeason = useCrossLeagueStore(s => s.setSeason);
  const mode = useCrossLeagueStore(s => s.mode);
  const setMode = useCrossLeagueStore(s => s.setMode);
  const setPlatform = useCrossLeagueStore(s => s.setPlatform);
  const setTheme = useCrossLeagueStore(s => s.setTheme);
  const setUserName = useCrossLeagueStore(s => s.setUserName);
  const setUserId = useCrossLeagueStore(s => s.setUserId);
  const setUserAvatar = useCrossLeagueStore(s => s.setUserAvatar);
  const setSyncType = useCrossLeagueStore(s => s.setSyncType);
  const setCustomLeagueIds = useCrossLeagueStore(s => s.setCustomLeagueIds);
  const setSelectedLeagueIds = useCrossLeagueStore(s => s.setSelectedLeagueIds);
  const setRawRecords = useCrossLeagueStore(s => s.setRawRecords);
  const setLeaguesMap = useCrossLeagueStore(s => s.setLeaguesMap);
  const setAllLeaguesData = useCrossLeagueStore(s => s.setAllLeaguesData);
  const setNflState = useCrossLeagueStore(s => s.setNflState);
  const openSettingsModal = useCrossLeagueStore(s => s.openSettingsModal);
  const rawRecords = useCrossLeagueStore(s => s.rawRecords);
  const selectedLeagueIds = useCrossLeagueStore(s => s.selectedLeagueIds);

  const isInitializedRef = React.useRef(false);
  const prevParamsRef = React.useRef<{ week?: number; season?: number; mode?: string }>({});

  // Initialize from embedded report, URL parameters, or localStorage
  useEffect(() => {
    async function init() {
      const savedTheme = localStorage.getItem("crossleague_theme");
      setTheme(savedTheme === "light" ? "light" : "dark");

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

      // 2. Load stored preferences from storage & initialize player databases
      useCrossLeagueStore.getState().hydratePreferences();
      initPlayersDb();

      // 3. URL Query Parameter overrides
      const urlParams = getUrlParams();
      const currentStore = useCrossLeagueStore.getState();

      const urlPlatform = urlParams.platform
        ? urlParams.platform.toLowerCase() === "espn"
          ? "espn"
          : "sleeper"
        : null;
      const urlUser = urlParams.user ? urlParams.user.trim() : null;
      const urlLeagues = urlParams.leagues ? extractCustomLeagueIds(urlParams.leagues) : null;
      const urlSeason = urlParams.season ? Number(urlParams.season) : null;
      const urlWeek = urlParams.week ? Number(urlParams.week) : null;
      const urlMode = urlParams.mode
        ? urlParams.mode.toUpperCase() === "SEASON_ROLLUP"
          ? "SEASON_ROLLUP"
          : "WEEKLY"
        : null;

      const isUserDifferent =
        urlUser !== null && urlUser.toLowerCase() !== (currentStore.userName || "").toLowerCase();

      const targetPlatform = urlPlatform || currentStore.platform || "sleeper";

      if (urlPlatform) {
        setPlatform(urlPlatform);
      }

      if (targetPlatform === "espn") {
        if (urlLeagues && urlLeagues.length > 0) {
          useCrossLeagueStore.getState().setEspnCustomLeagueIds(urlLeagues);
        }
      } else {
        if (urlUser) {
          useCrossLeagueStore.getState().setSleeperSyncType("user");
          useCrossLeagueStore.getState().setSleeperUser(urlUser);
          if (urlLeagues && urlLeagues.length > 0) {
            useCrossLeagueStore.setState({ pendingLeagueIdsFilter: urlLeagues });
          }
          if (isUserDifferent) {
            setUserId("");
            setUserAvatar("");
            if (!urlLeagues) {
              setSelectedLeagueIds([]);
            }
          }
        } else if (urlLeagues && urlLeagues.length > 0) {
          useCrossLeagueStore.getState().setSleeperSyncType("leagues");
          useCrossLeagueStore.getState().setSleeperCustomLeagueIds(urlLeagues);
        }
      }

      if (urlSeason) setSeason(urlSeason);
      if (urlWeek) setWeek(urlWeek);
      if (urlMode) setMode(urlMode);

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
          if (
            !urlParams.season &&
            !localStorage.getItem("sleeper_season") &&
            !localStorage.getItem("crossleague:pref:season") &&
            nfl.season
          ) {
            setSeason(nfl.season);
          }
          if (
            !urlParams.week &&
            !localStorage.getItem("sleeper_week") &&
            !localStorage.getItem("crossleague:pref:week")
          ) {
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
      const storeState = useCrossLeagueStore.getState();
      const hasUser =
        Boolean(storeState.userName) ||
        (storeState.syncType === "leagues" && storeState.customLeagueIds.length > 0) ||
        Boolean(urlParams.user) ||
        Boolean(urlParams.leagues);

      if (hasUser) {
        await syncData(false);
      } else {
        openSettingsModal();
      }

      prevParamsRef.current = {
        week: useCrossLeagueStore.getState().week,
        season: useCrossLeagueStore.getState().season,
        mode: useCrossLeagueStore.getState().mode
      };
      isInitializedRef.current = true;
    }

    init();
  }, [
    setPlatform,
    setTheme,
    setSyncType,
    setCustomLeagueIds,
    setSelectedLeagueIds,
    setUserName,
    setUserId,
    setUserAvatar,
    setRawRecords,
    setLeaguesMap,
    setAllLeaguesData,
    setSeason,
    setWeek,
    setMode,
    setActiveTab,
    setNflState,
    openSettingsModal
  ]);

  // Re-sync when week, season, or mode changes (only on subsequent user updates)
  useEffect(() => {
    if (!isInitializedRef.current) {
      return;
    }
    const prev = prevParamsRef.current;
    if (prev.week === week && prev.season === season && prev.mode === mode) {
      return;
    }
    prevParamsRef.current = { week, season, mode };

    const s = useCrossLeagueStore.getState();
    const hasSource =
      Boolean(s.userName) ||
      (s.syncType === "leagues" && s.customLeagueIds.length > 0) ||
      (s.platform === "espn" && s.customLeagueIds.length > 0);

    if (hasSource && !(window as any).__CROSSLEAGUE_SNAPSHOT_DATA__) {
      syncData(false);
    }
  }, [week, season, mode]);

  // Sync URL query parameters when active league selection changes
  useEffect(() => {
    if (!isInitializedRef.current || (window as any).__CROSSLEAGUE_SNAPSHOT_DATA__) {
      return;
    }
    updateUrlParams(useCrossLeagueStore.getState());
  }, [selectedLeagueIds]);

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
    <div className="flex min-h-screen flex-col pt-16 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950 sm:pt-24 md:pt-44 lg:pt-36">
      <Header />

      {/* Main Content Container (Full-Width Fluid) */}
      <main className="w-full flex-1 space-y-4 px-3 pt-2 pb-24 sm:space-y-6 sm:px-8 sm:pt-2 sm:pb-8 lg:px-12">
        {/* Live Loading Bar */}
        {loading && (
          <div id="statusContainer" className="space-y-2 pb-2">
            <div className="flex justify-between text-xs font-bold text-slate-300 sm:text-sm">
              <span id="statusText" className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400"></span>
                {loadingText || "Loading rosters & matchups..."}
              </span>
              <span id="progressText" className="font-mono font-bold text-emerald-400">
                {progress}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-900/90 p-0.5">
              <div
                id="progressBar"
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-teal-300 shadow-lg shadow-emerald-500/40 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div
            id="errorBanner"
            className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-sm text-rose-200 backdrop-blur sm:text-base"
          >
            <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-rose-400" />
            <div id="errorMessage" className="font-semibold">
              {error}
            </div>
          </div>
        )}

        {/* Skeleton Loading Placeholder */}
        {loading && rawRecords.length === 0 && (
          <div id="skeletonLoader" className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="skeleton-loader h-48 rounded-2xl"></div>
              <div className="skeleton-loader h-52 rounded-2xl"></div>
              <div className="skeleton-loader h-48 rounded-2xl"></div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="skeleton-loader h-28 rounded-xl"></div>
              <div className="skeleton-loader h-28 rounded-xl"></div>
              <div className="skeleton-loader h-28 rounded-xl"></div>
              <div className="skeleton-loader h-28 rounded-xl"></div>
              <div className="skeleton-loader col-span-1 h-28 rounded-xl"></div>
            </div>
            <div className="skeleton-loader h-96 rounded-2xl"></div>
          </div>
        )}

        {/* Initial Placeholder State */}
        {rawRecords.length === 0 && !loading && (
          <div
            id="initialState"
            className="glass-card mx-auto my-12 max-w-3xl space-y-5 rounded-2xl border border-slate-800 p-16 text-center text-slate-400"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-xl">
              <Zap className="h-10 w-10 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-black text-white sm:text-3xl">
              Who Actually Ran the League?
            </h3>
            <p className="mx-auto max-w-lg text-base leading-relaxed text-slate-400">
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
      <footer className="mt-auto w-full border-t border-slate-900 bg-slate-950/80 py-7 text-center text-sm text-slate-500">
        <div className="flex w-full flex-col items-center justify-center gap-3 px-4 text-center sm:flex-row sm:px-8 lg:px-12">
          <div className="inline-flex items-center gap-1.5 font-semibold text-slate-400">
            <Zap className="h-4 w-4 text-emerald-400" />
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
