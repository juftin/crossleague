var CrossLeague = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/js/state/constants.js
  var constants_exports = {};
  __export(constants_exports, {
    BASE_URL: () => BASE_URL,
    ESPN_BASE_URL: () => ESPN_BASE_URL,
    ESPN_POS_MAP: () => ESPN_POS_MAP,
    ESPN_PRO_TEAMS: () => ESPN_PRO_TEAMS,
    HASH_TAB_MAP: () => HASH_TAB_MAP,
    TAB_HASH_MAP: () => TAB_HASH_MAP,
    TAB_ORDER: () => TAB_ORDER
  });
  var BASE_URL, ESPN_BASE_URL, ESPN_POS_MAP, ESPN_PRO_TEAMS, TAB_ORDER, TAB_HASH_MAP, HASH_TAB_MAP;
  var init_constants = __esm({
    "src/js/state/constants.js"() {
      BASE_URL = "https://api.sleeper.app/v1";
      ESPN_BASE_URL = "https://lm-api-reads.fantasy.espn.com";
      ESPN_POS_MAP = {
        1: "QB",
        2: "RB",
        3: "WR",
        4: "TE",
        5: "K",
        16: "DEF"
      };
      ESPN_PRO_TEAMS = {
        0: "FA",
        1: "ATL",
        2: "BUF",
        3: "CHI",
        4: "CIN",
        5: "CLE",
        6: "DAL",
        7: "DEN",
        8: "DET",
        9: "GB",
        10: "TEN",
        11: "IND",
        12: "KC",
        13: "LV",
        14: "LAR",
        15: "MIA",
        16: "MIN",
        17: "NE",
        18: "NO",
        19: "NYG",
        20: "NYJ",
        21: "PHI",
        22: "ARI",
        23: "PIT",
        24: "LAC",
        25: "SF",
        26: "SEA",
        27: "TB",
        28: "WSH",
        29: "CAR",
        30: "JAX",
        33: "BAL",
        34: "HOU"
      };
      TAB_ORDER = ["awards", "leaderboard", "visuals", "leagueGrid", "luck", "players"];
      TAB_HASH_MAP = {
        awards: "awards",
        leaderboard: "board",
        visuals: "analytics",
        leagueGrid: "leagues",
        luck: "luck",
        players: "players"
      };
      HASH_TAB_MAP = {
        awards: "awards",
        board: "leaderboard",
        leaderboard: "leaderboard",
        analytics: "visuals",
        visuals: "visuals",
        scores: "visuals",
        leagues: "leagueGrid",
        leaguegrid: "leagueGrid",
        luck: "luck",
        luckindex: "luck",
        players: "players",
        player: "players"
      };
    }
  });

  // src/js/state/store.js
  function getActiveRecords() {
    if (!state.rawRecords || state.rawRecords.length === 0) return [];
    if (!state.selectedLeagueIds || state.selectedLeagueIds.size === 0) return state.rawRecords;
    return state.rawRecords.filter((r) => state.selectedLeagueIds.has(r.leagueId));
  }
  function getActiveLeaguesMap() {
    if (!state.selectedLeagueIds || state.selectedLeagueIds.size === 0) return state.leaguesMap;
    const filtered = {};
    state.selectedLeagueIds.forEach((id) => {
      if (state.leaguesMap[id]) filtered[id] = state.leaguesMap[id];
    });
    return filtered;
  }
  var state;
  var init_store = __esm({
    "src/js/state/store.js"() {
      state = {
        currentPlatform: "sleeper",
        // "sleeper" | "espn"
        currentMode: "WEEKLY",
        // "WEEKLY" | "SEASON_ROLLUP"
        currentUserId: "",
        currentUserName: "",
        currentUserAvatar: "",
        rawRecords: [],
        // Single-week records or Season aggregated records
        leaguesMap: {},
        allLeaguesData: [],
        selectedLeagueIds: /* @__PURE__ */ new Set(),
        pendingLeagueIdsFilter: null,
        currentSyncType: "user",
        // "user" | "leagues"
        customLeagueIds: /* @__PURE__ */ new Set(),
        currentSortColumn: "Points",
        currentSortAsc: false,
        currentTierFilter: "ALL",
        searchQuery: "",
        expandedRowIds: /* @__PURE__ */ new Set(),
        espnPlayersDb: {},
        sleeperPlayersDb: null,
        isFetchingPlayersDb: false,
        currentMainPage: 1,
        currentMainPageSize: 25,
        scoreDistChartInstance: null,
        leagueAvgChartInstance: null,
        // Player Analytics State
        currentPlayerPositionFilter: "ALL",
        currentPlayerSearch: "",
        currentPlayerStatusFilter: "ALL",
        currentPlayerSortColumn: "points",
        currentPlayerSortAsc: false,
        expandedPlayerIds: /* @__PURE__ */ new Set(),
        lastAggregatedPlayers: [],
        currentPlayerPage: 1,
        currentPlayerPageSize: 25,
        // Luck Table & Analytics State
        currentLuckPage: 1,
        currentLuckPageSize: 25,
        currentLuckSearch: "",
        currentLuckCategory: "ALL",
        currentLuckSortColumn: "Luck",
        currentLuckSortAsc: false,
        // League Grid Pagination State
        currentGridPage: 1,
        currentGridPageSize: 9,
        // NFL State Tracking
        nflState: {
          season: (/* @__PURE__ */ new Date()).getFullYear(),
          week: 1,
          display_week: 1,
          season_type: "regular"
        }
      };
    }
  });

  // src/js/api/players.js
  async function initPlayersDb(onUpdateCallback = null) {
    if (state.sleeperPlayersDb && Object.keys(state.sleeperPlayersDb).length > 0) {
      return state.sleeperPlayersDb;
    }
    try {
      const cached = localStorage.getItem("sleeper_players_v3");
      if (cached) {
        state.sleeperPlayersDb = JSON.parse(cached);
      }
    } catch (e) {
      console.warn("Could not read player cache:", e);
    }
    try {
      const cachedEspn = localStorage.getItem("crossleague_espn_players_v1");
      if (cachedEspn) {
        state.espnPlayersDb = { ...state.espnPlayersDb, ...JSON.parse(cachedEspn) };
      }
    } catch (e) {
      console.warn("Could not read ESPN player cache:", e);
    }
    if (state.sleeperPlayersDb && Object.keys(state.sleeperPlayersDb).length > 0) {
      return state.sleeperPlayersDb;
    }
    if (state.isFetchingPlayersDb) return null;
    state.isFetchingPlayersDb = true;
    try {
      const res = await fetch("https://api.sleeper.app/v1/players/nfl");
      if (!res.ok) throw new Error("Failed to fetch players");
      const data = await res.json();
      const stripped = {};
      for (const pid in data) {
        const p = data[pid];
        const pos = (p.position || p.fantasy_positions?.[0] || "").toUpperCase();
        if (pos && ["QB", "RB", "WR", "TE", "K", "DEF"].includes(pos)) {
          stripped[pid] = {
            name: p.full_name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || (pos === "DEF" ? `${pid} DEF` : `Player ${pid}`),
            pos,
            team: p.team || (pos === "DEF" ? pid : "FA")
          };
        }
      }
      state.sleeperPlayersDb = stripped;
      try {
        localStorage.setItem("sleeper_players_v3", JSON.stringify(stripped));
      } catch {
      }
      if (typeof onUpdateCallback === "function") {
        onUpdateCallback();
      }
      return state.sleeperPlayersDb;
    } catch (err) {
      console.error("Could not load Sleeper player database:", err);
      return null;
    } finally {
      state.isFetchingPlayersDb = false;
    }
  }
  function getPlayerInfo(pid) {
    if (!pid || pid === "0") {
      return {
        id: "0",
        name: "Empty Slot",
        pos: "FLEX",
        team: "FA",
        headshotUrl: null,
        isDef: false
      };
    }
    if (state.espnPlayersDb && state.espnPlayersDb[pid]) {
      const p = state.espnPlayersDb[pid];
      const isDef = p.pos === "DEF";
      const cleanNumericId = String(pid).replace(/^espn_/, "");
      return {
        id: pid,
        name: p.name,
        pos: p.pos,
        team: p.team,
        isDef,
        headshotUrl: isDef && p.team ? `https://a.espncdn.com/i/teamlogos/nfl/500/${p.team.toLowerCase()}.png` : `https://a.espncdn.com/i/headshots/nfl/players/full/${cleanNumericId}.png`
      };
    }
    if (state.sleeperPlayersDb && state.sleeperPlayersDb[pid]) {
      const p = state.sleeperPlayersDb[pid];
      const isDef = p.pos === "DEF";
      return {
        id: pid,
        name: p.name,
        pos: p.pos,
        team: p.team,
        isDef,
        headshotUrl: isDef && p.team ? `https://sleepercdn.com/images/v2/icons/league/teams/nfl/${p.team.toLowerCase()}.png` : `https://sleepercdn.com/content/nfl/players/thumb/${pid}.jpg`
      };
    }
    const isEspn = String(pid).startsWith("espn_");
    const cleanNumeric = String(pid).replace(/^espn_/, "");
    return {
      id: pid,
      name: isEspn ? `Player #${cleanNumeric}` : `Player #${pid}`,
      pos: "FLEX",
      team: "FA",
      isDef: false,
      headshotUrl: isEspn ? `https://a.espncdn.com/i/headshots/nfl/players/full/${cleanNumeric}.png` : `https://sleepercdn.com/content/nfl/players/thumb/${pid}.jpg`
    };
  }
  function getPlayerPositionBadge(pos) {
    const p = (pos || "FLEX").toUpperCase();
    if (p === "QB")
      return `<span class="px-2 py-0.5 rounded text-[11px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">QB</span>`;
    if (p === "RB")
      return `<span class="px-2 py-0.5 rounded text-[11px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">RB</span>`;
    if (p === "WR")
      return `<span class="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">WR</span>`;
    if (p === "TE")
      return `<span class="px-2 py-0.5 rounded text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">TE</span>`;
    if (p === "K")
      return `<span class="px-2 py-0.5 rounded text-[11px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">K</span>`;
    if (p === "DEF")
      return `<span class="px-2 py-0.5 rounded text-[11px] font-black bg-slate-700/60 text-slate-300 border border-slate-600/40">DEF</span>`;
    return `<span class="px-2 py-0.5 rounded text-[11px] font-black bg-slate-800 text-slate-400 border border-slate-700">${p}</span>`;
  }
  var init_players = __esm({
    "src/js/api/players.js"() {
      init_store();
    }
  });

  // src/js/state/cache.js
  async function cachedApiFetch(url, options = {}) {
    const { forceRefresh = false, ttlMs = 15 * 60 * 1e3, ...fetchOptions } = options;
    const cacheKey = `crossleague_api_${url}`;
    if (!forceRefresh) {
      try {
        if (typeof sessionStorage !== "undefined") {
          const raw = sessionStorage.getItem(cacheKey);
          if (raw) {
            const entry = JSON.parse(raw);
            if (entry && Date.now() - entry.timestamp < (entry.ttlMs || ttlMs)) {
              return entry.data;
            }
          }
        }
      } catch {
      }
      if (memoryApiCache.has(cacheKey)) {
        const entry = memoryApiCache.get(cacheKey);
        if (entry && Date.now() - entry.timestamp < (entry.ttlMs || ttlMs)) {
          return entry.data;
        }
      }
    }
    const resp = await fetch(url, fetchOptions);
    if (!resp.ok) {
      throw new Error(`API error (${resp.status}): ${url}`);
    }
    const data = await resp.json();
    const cacheEntry = {
      timestamp: Date.now(),
      ttlMs,
      data
    };
    try {
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      }
    } catch {
    }
    memoryApiCache.set(cacheKey, cacheEntry);
    return data;
  }
  function clearApiCache() {
    memoryApiCache.clear();
    try {
      if (typeof sessionStorage !== "undefined") {
        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith("crossleague_api_")) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
      }
    } catch {
    }
  }
  function getCacheKey(user, season, mode, week) {
    const u = (user || "").toLowerCase().trim();
    return `crossleague_cache_${u}_${season}_${mode}_${week}`;
  }
  function isWeekFinished(season, week, nflState = state.nflState) {
    const s = parseInt(season, 10);
    const w = parseInt(week, 10);
    if (!nflState || !nflState.season) return false;
    if (s < nflState.season) return true;
    if (s === nflState.season) {
      if (nflState.season_type === "post") return true;
      const currentNflWeek = nflState.week || 1;
      return w < currentNflWeek;
    }
    return false;
  }
  function saveDataToCache(userId, userName, userAvatar, season, mode, week, records, leagues, allLeagues) {
    try {
      const payload = {
        version: "2.0",
        cachedAt: (/* @__PURE__ */ new Date()).toISOString(),
        isFinished: isWeekFinished(season, week),
        mode,
        user: {
          id: userId,
          name: userName,
          avatar: userAvatar
        },
        season,
        week,
        records,
        leaguesMap: leagues,
        allLeaguesData: allLeagues,
        selectedLeagueIds: Array.from(state.selectedLeagueIds),
        playersDb: state.sleeperPlayersDb || {},
        espnPlayersDb: state.espnPlayersDb || {}
      };
      const serialized = JSON.stringify(payload);
      const keys = /* @__PURE__ */ new Set();
      const userIdInput = document.getElementById("userIdInput");
      const queryUser = userIdInput ? userIdInput.value.trim() : "";
      if (queryUser) keys.add(getCacheKey(queryUser, season, mode, week));
      if (userName) keys.add(getCacheKey(userName, season, mode, week));
      if (userId) keys.add(getCacheKey(userId, season, mode, week));
      if (state.customLeagueIds && state.customLeagueIds.size > 0) {
        const sortedLeagueIds = Array.from(state.customLeagueIds).sort().join(",");
        keys.add(getCacheKey(`leagues:${sortedLeagueIds}`, season, mode, week));
      }
      keys.forEach((k) => {
        localStorage.setItem(k, serialized);
      });
    } catch (e) {
      console.warn("Could not save to localStorage cache:", e);
    }
  }
  function loadCachedData(data, callbacks = {}) {
    if (!data || !data.records || data.records.length === 0) return false;
    state.currentMode = data.mode || "WEEKLY";
    const modeSelect = document.getElementById("modeSelect");
    if (modeSelect) modeSelect.value = state.currentMode;
    state.currentUserId = data.user ? data.user.id : "";
    state.currentUserName = data.user ? data.user.name : "";
    state.currentUserAvatar = data.user ? data.user.avatar : "";
    const userIdInput = document.getElementById("userIdInput");
    const seasonInput = document.getElementById("seasonInput");
    const weekInput = document.getElementById("weekInput");
    if (userIdInput) {
      const saved = localStorage.getItem("sleeper_user_id");
      if (saved) {
        userIdInput.value = saved;
      } else if (state.currentUserName) {
        userIdInput.value = state.currentUserName || state.currentUserId;
      }
    }
    if (seasonInput && data.season) {
      seasonInput.value = String(data.season);
    }
    if (weekInput && data.week) {
      weekInput.value = String(data.week);
    }
    if (data.playersDb && Object.keys(data.playersDb).length > 0) {
      state.sleeperPlayersDb = data.playersDb;
    }
    if (data.espnPlayersDb && Object.keys(data.espnPlayersDb).length > 0) {
      state.espnPlayersDb = { ...state.espnPlayersDb, ...data.espnPlayersDb };
    }
    state.rawRecords = (data.records || []).map((r) => ({
      ...r,
      efficiency: typeof r.efficiency === "number" && !isNaN(r.efficiency) ? r.efficiency : 100,
      benchPoints: typeof r.benchPoints === "number" && !isNaN(r.benchPoints) ? r.benchPoints : 0,
      outcome: r.outcome || "unpaired",
      winPct: typeof r.winPct === "number" && !isNaN(r.winPct) ? r.winPct : 0,
      startersList: Array.isArray(r.startersList) ? r.startersList : [],
      allPlayersList: Array.isArray(r.allPlayersList) ? r.allPlayersList : [],
      playersPointsMap: r.playersPointsMap || {},
      startersPoints: Array.isArray(r.startersPoints) ? r.startersPoints : [],
      weeklyPlayerRecords: Array.isArray(r.weeklyPlayerRecords) ? r.weeklyPlayerRecords : []
    }));
    state.leaguesMap = data.leaguesMap || {};
    state.allLeaguesData = data.allLeaguesData && data.allLeaguesData.length > 0 ? data.allLeaguesData : Array.from(new Set(state.rawRecords.map((r) => r.leagueId))).map((lid) => {
      const sample = state.rawRecords.find((r) => r.leagueId === lid);
      return {
        league_id: lid,
        name: state.leaguesMap[lid] && state.leaguesMap[lid].name || sample && sample.league || `League ${lid}`,
        avatar: state.leaguesMap[lid] && state.leaguesMap[lid].avatar || sample && sample.leagueAvatar || null
      };
    });
    if (state.pendingLeagueIdsFilter && state.pendingLeagueIdsFilter.size > 0) {
      state.selectedLeagueIds = new Set(
        state.allLeaguesData.map((l) => l.league_id).filter((id) => state.pendingLeagueIdsFilter.has(id))
      );
      if (state.selectedLeagueIds.size === 0) {
        state.selectedLeagueIds = new Set(state.allLeaguesData.map((l) => l.league_id));
      }
      state.pendingLeagueIdsFilter = null;
    } else {
      state.selectedLeagueIds = new Set(
        data.selectedLeagueIds && data.selectedLeagueIds.length > 0 ? data.selectedLeagueIds : state.allLeaguesData.map((l) => l.league_id)
      );
    }
    const initialState = document.getElementById("initialState");
    const skeletonLoader = document.getElementById("skeletonLoader");
    const reportContent = document.getElementById("reportContent");
    const copyRecapBtn = document.getElementById("copyRecapBtn");
    const shareUrlBtn = document.getElementById("shareUrlBtn");
    const downloadReportBtn = document.getElementById("downloadReportBtn");
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    if (initialState) initialState.classList.add("hidden");
    if (skeletonLoader) skeletonLoader.classList.add("hidden");
    if (reportContent) reportContent.classList.remove("hidden");
    if (copyRecapBtn) copyRecapBtn.classList.remove("hidden");
    if (shareUrlBtn) shareUrlBtn.classList.remove("hidden");
    if (downloadReportBtn) downloadReportBtn.classList.remove("hidden");
    if (exportCsvBtn) exportCsvBtn.classList.remove("hidden");
    initPlayersDb();
    if (callbacks.updateUI) callbacks.updateUI();
    if (callbacks.renderDropdown) callbacks.renderDropdown();
    if (callbacks.refresh) callbacks.refresh();
    return true;
  }
  function tryLoadFromCache(overrideWeek = null, callbacks = {}) {
    try {
      const userIdInput = document.getElementById("userIdInput");
      const seasonInput = document.getElementById("seasonInput");
      const modeSelect = document.getElementById("modeSelect");
      const weekInput = document.getElementById("weekInput");
      let user = userIdInput ? userIdInput.value.trim() : "";
      if (!user && state.customLeagueIds && state.customLeagueIds.size > 0) {
        user = `leagues:${Array.from(state.customLeagueIds).sort().join(",")}`;
      }
      const season = seasonInput ? seasonInput.value : "";
      const mode = modeSelect ? modeSelect.value : "WEEKLY";
      const week = overrideWeek !== null ? parseInt(overrideWeek, 10) : weekInput ? parseInt(weekInput.value, 10) : 1;
      if (!user) return false;
      const key = getCacheKey(user, season, mode, week);
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.version === "2.0" && data.records && data.records.length > 0) {
          if (String(data.season) !== String(season)) return false;
          if (data.mode !== mode) return false;
          if (parseInt(data.week, 10) !== parseInt(week, 10)) return false;
          const cachedPlatform = data.records[0]?.platform || "sleeper";
          if (cachedPlatform !== state.currentPlatform) return false;
          if (state.currentSyncType === "leagues" && state.customLeagueIds.size > 0) {
            const cachedLids = new Set(
              (data.allLeaguesData || []).map(
                (l) => String(l.league_id).replace(/^(espn|sleeper):/, "")
              )
            );
            const expectedLids = Array.from(state.customLeagueIds).map(
              (id) => String(id).replace(/^(espn|sleeper):/, "")
            );
            const allMatch = expectedLids.every((id) => cachedLids.has(id));
            if (!allMatch) return false;
          }
          if (state.currentSyncType === "user" && userIdInput && userIdInput.value.trim()) {
            const queryUser = userIdInput.value.trim().toLowerCase();
            const cachedUserName = (data.user?.name || "").toLowerCase();
            const cachedUserId = (data.user?.id || "").toLowerCase();
            if (cachedUserName !== queryUser && cachedUserId !== queryUser) {
              return false;
            }
          }
          return loadCachedData(data, callbacks);
        }
      }
    } catch (e) {
      console.warn("Could not load from localStorage cache:", e);
    }
    return false;
  }
  var memoryApiCache;
  var init_cache = __esm({
    "src/js/state/cache.js"() {
      init_store();
      init_players();
      memoryApiCache = /* @__PURE__ */ new Map();
    }
  });

  // src/js/components/tabs.js
  function getCurrentlyActiveTab() {
    const viewAwards = document.getElementById("viewAwards");
    const viewLeaderboard = document.getElementById("viewLeaderboard");
    const viewVisuals = document.getElementById("viewVisuals");
    const viewLeagueGrid = document.getElementById("viewLeagueGrid");
    const viewLuck = document.getElementById("viewLuck");
    const viewPlayers = document.getElementById("viewPlayers");
    if (viewAwards && !viewAwards.classList.contains("hidden")) return "awards";
    if (viewLeaderboard && !viewLeaderboard.classList.contains("hidden")) return "leaderboard";
    if (viewVisuals && !viewVisuals.classList.contains("hidden")) return "visuals";
    if (viewLeagueGrid && !viewLeagueGrid.classList.contains("hidden")) return "leagueGrid";
    if (viewLuck && !viewLuck.classList.contains("hidden")) return "luck";
    if (viewPlayers && !viewPlayers.classList.contains("hidden")) return "players";
    return "awards";
  }
  function triggerConfetti() {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }
  function switchTab(tabName, updateHash = true, renderCallbacks = {}) {
    let target = tabName;
    if (!TAB_ORDER.includes(target)) {
      target = "awards";
    }
    const viewLeaderboard = document.getElementById("viewLeaderboard");
    const viewAwards = document.getElementById("viewAwards");
    const viewVisuals = document.getElementById("viewVisuals");
    const viewLeagueGrid = document.getElementById("viewLeagueGrid");
    const viewPlayers = document.getElementById("viewPlayers");
    const viewLuck = document.getElementById("viewLuck");
    const desktopInactive = "flex-1 w-full justify-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer active:scale-95 text-center";
    const desktopActive = "flex-1 w-full justify-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap font-bold cursor-pointer active:scale-95 shadow-sm text-center";
    const mobileInactive = "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all text-[10px] font-bold gap-1 min-w-[50px] text-slate-400 hover:text-slate-200 border border-transparent active:scale-95 touch-manipulation cursor-pointer";
    const mobileActive = "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all text-[10px] font-extrabold gap-1 min-w-[50px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 shadow-sm active:scale-95 touch-manipulation cursor-pointer";
    const tabMap = {
      awards: { desktop: "tabAwards", mobile: "mobileTabAwards" },
      leaderboard: { desktop: "tabLeaderboard", mobile: "mobileTabLeaderboard" },
      visuals: { desktop: "tabVisuals", mobile: "mobileTabVisuals" },
      leagueGrid: { desktop: "tabLeagueGrid", mobile: "mobileTabLeagueGrid" },
      luck: { desktop: "tabLuck", mobile: "mobileTabLuck" },
      players: { desktop: "tabPlayers", mobile: "mobileTabPlayers" }
    };
    TAB_ORDER.forEach((t) => {
      const dEl = document.getElementById(tabMap[t].desktop);
      const mEl = document.getElementById(tabMap[t].mobile);
      if (dEl) dEl.className = t === target ? desktopActive : desktopInactive;
      if (mEl) mEl.className = t === target ? mobileActive : mobileInactive;
    });
    if (viewLeaderboard) viewLeaderboard.classList.add("hidden");
    if (viewAwards) viewAwards.classList.add("hidden");
    if (viewVisuals) viewVisuals.classList.add("hidden");
    if (viewLeagueGrid) viewLeagueGrid.classList.add("hidden");
    if (viewPlayers) viewPlayers.classList.add("hidden");
    if (viewLuck) viewLuck.classList.add("hidden");
    if (target === "leaderboard") {
      if (viewLeaderboard) viewLeaderboard.classList.remove("hidden");
      if (renderCallbacks.onLeaderboard) renderCallbacks.onLeaderboard();
    } else if (target === "awards") {
      if (viewAwards) viewAwards.classList.remove("hidden");
      triggerConfetti();
      if (renderCallbacks.onAwards) renderCallbacks.onAwards();
    } else if (target === "visuals") {
      if (viewVisuals) viewVisuals.classList.remove("hidden");
      if (renderCallbacks.onVisuals) renderCallbacks.onVisuals();
    } else if (target === "leagueGrid") {
      if (viewLeagueGrid) viewLeagueGrid.classList.remove("hidden");
      if (renderCallbacks.onLeagueGrid) renderCallbacks.onLeagueGrid();
    } else if (target === "players") {
      if (viewPlayers) viewPlayers.classList.remove("hidden");
      if (renderCallbacks.onPlayers) renderCallbacks.onPlayers();
    } else if (target === "luck") {
      if (viewLuck) viewLuck.classList.remove("hidden");
      if (renderCallbacks.onLuck) renderCallbacks.onLuck();
    }
    if (updateHash && typeof window !== "undefined" && window.location) {
      const hash = TAB_HASH_MAP[target] || target;
      if (window.location.hash !== `#${hash}`) {
        history.replaceState(null, "", `#${hash}`);
      }
    }
  }
  function syncTabFromHash(renderCallbacks = {}) {
    if (typeof window === "undefined" || !window.location) return;
    const rawHash = (window.location.hash || "").replace(/^#/, "").toLowerCase();
    const targetTab = HASH_TAB_MAP[rawHash];
    if (targetTab) {
      switchTab(targetTab, false, renderCallbacks);
    }
  }
  var init_tabs = __esm({
    "src/js/components/tabs.js"() {
      init_constants();
    }
  });

  // src/js/state/urlParams.js
  var urlParams_exports = {};
  __export(urlParams_exports, {
    addCustomLeagueIds: () => addCustomLeagueIds,
    clearCustomLeagueIds: () => clearCustomLeagueIds,
    extractCustomLeagueIds: () => extractCustomLeagueIds,
    getUrlParams: () => getUrlParams,
    removeCustomLeagueId: () => removeCustomLeagueId,
    syncTabFromHash: () => syncTabFromHash
  });
  function extractCustomLeagueIds(rawStr) {
    if (!rawStr) return [];
    const parts = rawStr.split(/[\s,;\n\t]+/).map((s) => {
      let cleaned = s.trim().replace(/^#/, "");
      const urlMatch = cleaned.match(/leagueId=(\d+)/i);
      if (urlMatch) {
        cleaned = urlMatch[1];
      }
      return cleaned;
    }).filter((s) => s.length > 0 && /^\d+$/.test(s));
    return Array.from(new Set(parts));
  }
  function getUrlParams(searchStr) {
    const params = typeof searchStr === "string" ? new URLSearchParams(searchStr) : typeof window !== "undefined" && window.location ? new URLSearchParams(window.location.search) : new URLSearchParams("");
    const platform = params.get("platform") || params.get("plat") || params.get("p");
    const user = params.get("user") || params.get("u") || params.get("username") || params.get("userId");
    const season = params.get("season") || params.get("year");
    const week = params.get("week") || params.get("w");
    const mode = params.get("mode") || params.get("m");
    const leagues = params.get("leagues") || params.get("league_ids") || params.get("l");
    return { platform, user, season, week, mode, leagues };
  }
  function addCustomLeagueIds(str, renderChipsFn = null) {
    if (!str) return;
    const parts = extractCustomLeagueIds(str);
    if (parts.length === 0 && str.trim()) {
      return;
    }
    parts.forEach((id) => state.customLeagueIds.add(id));
    if (typeof renderChipsFn === "function") {
      renderChipsFn();
    }
    savePreferences();
    updateSettingsButtonBadge();
    const customLeaguesDropdownMenu = document.getElementById("customLeaguesDropdownMenu");
    const customLeaguesDropdownChevron = document.getElementById("customLeaguesDropdownChevron");
    const customLeaguesDropdownBtn = document.getElementById("customLeaguesDropdownBtn");
    if (customLeaguesDropdownMenu && customLeaguesDropdownMenu.classList.contains("hidden")) {
      customLeaguesDropdownMenu.classList.remove("hidden");
      if (customLeaguesDropdownChevron) customLeaguesDropdownChevron.classList.add("rotate-180");
      if (customLeaguesDropdownBtn) customLeaguesDropdownBtn.setAttribute("aria-expanded", "true");
    }
  }
  function removeCustomLeagueId(id, renderChipsFn = null) {
    state.customLeagueIds.delete(id);
    if (typeof renderChipsFn === "function") {
      renderChipsFn();
    }
    savePreferences();
    updateSettingsButtonBadge();
  }
  function clearCustomLeagueIds(renderChipsFn = null) {
    state.customLeagueIds.clear();
    if (typeof renderChipsFn === "function") {
      renderChipsFn();
    }
    savePreferences();
    updateSettingsButtonBadge();
  }
  var init_urlParams = __esm({
    "src/js/state/urlParams.js"() {
      init_store();
      init_preferences();
      init_tabs();
    }
  });

  // src/js/components/modal.js
  var modal_exports = {};
  __export(modal_exports, {
    closeLuckModal: () => closeLuckModal,
    closeSettingsModal: () => closeSettingsModal,
    openLuckModal: () => openLuckModal,
    openSettingsModal: () => openSettingsModal,
    toggleSettingsDropdown: () => toggleSettingsDropdown
  });
  function openSettingsModal() {
    const settingsModal = document.getElementById("settingsModal");
    const settingsBackdrop = document.getElementById("settingsBackdrop");
    const settingsDropdownChevron = document.getElementById("settingsDropdownChevron");
    const btnOpenSettingsModal = document.getElementById("btnOpenSettingsModal");
    const userIdInput = document.getElementById("userIdInput");
    if (settingsModal) {
      settingsModal.classList.remove("hidden");
      if (settingsBackdrop) settingsBackdrop.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");
      if (settingsDropdownChevron) settingsDropdownChevron.classList.add("rotate-180");
      if (btnOpenSettingsModal) btnOpenSettingsModal.setAttribute("aria-expanded", "true");
      if (userIdInput && window.innerWidth >= 640) {
        setTimeout(() => userIdInput.focus(), 50);
      }
    }
  }
  function closeSettingsModal() {
    const settingsModal = document.getElementById("settingsModal");
    const settingsBackdrop = document.getElementById("settingsBackdrop");
    const leagueDropdownMenu = document.getElementById("leagueDropdownMenu");
    const leagueDropdownChevron = document.getElementById("leagueDropdownChevron");
    const leagueDropdownBtn = document.getElementById("leagueDropdownBtn");
    const settingsDropdownChevron = document.getElementById("settingsDropdownChevron");
    const btnOpenSettingsModal = document.getElementById("btnOpenSettingsModal");
    if (settingsModal) {
      settingsModal.classList.add("hidden");
      if (settingsBackdrop) settingsBackdrop.classList.add("hidden");
      if (leagueDropdownMenu) leagueDropdownMenu.classList.add("hidden");
      if (leagueDropdownChevron) leagueDropdownChevron.classList.remove("rotate-180");
      if (leagueDropdownBtn) leagueDropdownBtn.setAttribute("aria-expanded", "false");
      const luckModal = document.getElementById("luckMethodologyModal");
      if (!luckModal || luckModal.classList.contains("hidden")) {
        document.body.classList.remove("overflow-hidden");
      }
      if (settingsDropdownChevron) settingsDropdownChevron.classList.remove("rotate-180");
      if (btnOpenSettingsModal) btnOpenSettingsModal.setAttribute("aria-expanded", "false");
    }
  }
  function toggleSettingsDropdown(e) {
    if (e) e.stopPropagation();
    const settingsModal = document.getElementById("settingsModal");
    const leagueDropdownMenu = document.getElementById("leagueDropdownMenu");
    const leagueDropdownChevron = document.getElementById("leagueDropdownChevron");
    const leagueDropdownBtn = document.getElementById("leagueDropdownBtn");
    if (settingsModal && !settingsModal.classList.contains("hidden")) {
      closeSettingsModal();
    } else {
      if (leagueDropdownMenu && !leagueDropdownMenu.classList.contains("hidden")) {
        leagueDropdownMenu.classList.add("hidden");
        if (leagueDropdownChevron) leagueDropdownChevron.classList.remove("rotate-180");
        if (leagueDropdownBtn) leagueDropdownBtn.setAttribute("aria-expanded", "false");
      }
      openSettingsModal();
    }
  }
  function openLuckModal() {
    const modal = document.getElementById("luckMethodologyModal");
    if (modal) {
      modal.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");
    }
  }
  function closeLuckModal() {
    const modal = document.getElementById("luckMethodologyModal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    }
  }
  var init_modal = __esm({
    "src/js/components/modal.js"() {
    }
  });

  // src/js/api/sleeper.js
  async function apiFetch(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    let ttlMs = 15 * 60 * 1e3;
    if (endpoint.includes("/state/nfl")) {
      ttlMs = 2 * 60 * 60 * 1e3;
    } else if (endpoint.includes("/matchups/") || endpoint.includes("/rosters")) {
      ttlMs = 60 * 60 * 1e3;
    }
    return await cachedApiFetch(url, { ...options, ttlMs });
  }
  async function resolveUser(inputVal) {
    const cleaned = (inputVal || "").trim();
    if (!cleaned) throw new Error("Please enter a Sleeper username or User ID.");
    if (/^\d+$/.test(cleaned)) {
      try {
        const userData2 = await apiFetch(`/user/${cleaned}`);
        if (userData2 && userData2.user_id) {
          return {
            userId: userData2.user_id,
            displayName: userData2.display_name || userData2.username || cleaned,
            avatar: userData2.avatar || ""
          };
        }
      } catch {
      }
      return {
        userId: cleaned,
        displayName: cleaned,
        avatar: ""
      };
    }
    const userData = await apiFetch(`/user/${cleaned}`);
    if (userData && userData.user_id) {
      return {
        userId: userData.user_id,
        displayName: userData.display_name || userData.username || cleaned,
        avatar: userData.avatar || ""
      };
    }
    throw new Error(`User "${cleaned}" not found on Sleeper.`);
  }
  function getAvatarUrl(avatarId) {
    if (!avatarId) return null;
    return `https://sleepercdn.com/avatars/thumbs/${avatarId}`;
  }
  function processWeeklyMatchups(matchupsRaw, rostersRaw, userMap, lid, lname, lavatar, targetWeek) {
    const rosterToOwner = {};
    for (const r of rostersRaw) {
      rosterToOwner[r.roster_id] = r.owner_id;
    }
    const weekRecords = [];
    const matchupGroups = {};
    for (const m of matchupsRaw || []) {
      const rid = m.roster_id;
      const ownerId = rosterToOwner[rid];
      const userInfo = userMap[ownerId] || {};
      const customPts = m.custom_points;
      const points = customPts !== null && customPts !== void 0 ? customPts : m.points || 0;
      const roundedPoints = Math.round(parseFloat(points || 0) * 100) / 100;
      const startersList = (m.starters || []).filter((pid) => pid && pid !== "0");
      const allPlayersList = (m.players || []).filter((pid) => pid && pid !== "0");
      const playersPointsMap = { ...m.players_points || {} };
      const startersPoints = (m.starters_points || []).map((p) => parseFloat(p || 0));
      startersList.forEach((pid, idx) => {
        if (pid && (playersPointsMap[pid] === void 0 || playersPointsMap[pid] === null) && startersPoints[idx] !== void 0) {
          playersPointsMap[pid] = startersPoints[idx];
        }
      });
      let benchPoints = 0;
      let highestBenchPlayer = { name: "Bench Player", points: 0 };
      const benchedIds = allPlayersList.filter((pid) => !startersList.includes(pid));
      if (benchedIds.length > 0 && Object.keys(playersPointsMap).length > 0) {
        benchedIds.forEach((pid) => {
          const pScore = parseFloat(playersPointsMap[pid] || 0);
          if (pScore > 0) {
            benchPoints += pScore;
            if (pScore > highestBenchPlayer.points) {
              highestBenchPlayer = { id: pid, points: pScore };
            }
          }
        });
      }
      const startersTotal = startersPoints.reduce((acc, p) => acc + p, 0);
      let optimalPoints = roundedPoints;
      if (allPlayersList.length > 0 && Object.keys(playersPointsMap).length > 0) {
        const sortedPlayerScores = Object.values(playersPointsMap).map((v) => parseFloat(v) || 0).sort((a, b) => b - a);
        const starterSlotCount = Math.max(1, startersList.length);
        const topPossibleSum = sortedPlayerScores.slice(0, starterSlotCount).reduce((a, b) => a + b, 0);
        optimalPoints = Math.max(roundedPoints, Math.round(topPossibleSum * 100) / 100);
      }
      const efficiency = roundedPoints > 0 && optimalPoints > 0 ? Math.min(100, Math.round(roundedPoints / optimalPoints * 100)) : 100;
      const record = {
        id: `${lid}-${rid}`,
        week: targetWeek,
        points: roundedPoints,
        manager: userInfo.displayName || "Unclaimed Roster",
        teamName: userInfo.teamName || `Team ${rid}`,
        league: lname,
        leagueId: lid,
        leagueAvatar: lavatar,
        ownerId,
        avatar: userInfo.avatar,
        matchupId: m.matchup_id,
        startersCount: startersList.length,
        startersList,
        allPlayersList,
        playersPointsMap,
        startersPoints,
        benchPoints: Math.round(benchPoints * 100) / 100,
        startersTotal: Math.round(startersTotal * 100) / 100,
        optimalPoints: Math.round(optimalPoints * 100) / 100,
        efficiency,
        highestBenchScore: Math.round(highestBenchPlayer.points * 100) / 100,
        // Matchup outcome placeholders
        outcome: "unpaired",
        // "win" | "loss" | "tie" | "unplayed" | "unpaired"
        opponentName: null,
        opponentTeam: null,
        opponentPoints: null,
        margin: 0
      };
      weekRecords.push(record);
      if (m.matchup_id !== void 0 && m.matchup_id !== null) {
        if (!matchupGroups[m.matchup_id]) matchupGroups[m.matchup_id] = [];
        matchupGroups[m.matchup_id].push(record);
      }
    }
    Object.values(matchupGroups).forEach((pair) => {
      if (pair.length === 2) {
        const [t1, t2] = pair;
        t1.opponentName = t2.manager;
        t1.opponentTeam = t2.teamName;
        t1.opponentPoints = t2.points;
        t1.margin = Math.round((t1.points - t2.points) * 100) / 100;
        t2.opponentName = t1.manager;
        t2.opponentTeam = t1.teamName;
        t2.opponentPoints = t1.points;
        t2.margin = Math.round((t2.points - t1.points) * 100) / 100;
        if (t1.points === 0 && t2.points === 0) {
          t1.outcome = "unplayed";
          t2.outcome = "unplayed";
        } else if (t1.points > t2.points) {
          t1.outcome = "win";
          t2.outcome = "loss";
        } else if (t1.points < t2.points) {
          t1.outcome = "loss";
          t2.outcome = "win";
        } else {
          t1.outcome = "tie";
          t2.outcome = "tie";
        }
      } else if (pair.length > 2) {
        const sortedPair = [...pair].sort((a, b) => b.points - a.points);
        const midIdx = Math.floor(sortedPair.length / 2);
        sortedPair.forEach((t, idx) => {
          if (t.points === 0) {
            t.outcome = "unplayed";
          } else if (idx < midIdx) {
            t.outcome = "win";
          } else if (idx > midIdx || sortedPair.length % 2 === 0) {
            t.outcome = "loss";
          } else {
            t.outcome = "tie";
          }
        });
      }
    });
    const unpairedTeams = weekRecords.filter((r) => r.outcome === "unpaired");
    if (unpairedTeams.length > 0 && weekRecords.length > 1) {
      const activeScores = weekRecords.map((r) => r.points).filter((p) => p > 0);
      if (activeScores.length > 0) {
        activeScores.sort((a, b) => a - b);
        const median = activeScores[Math.floor(activeScores.length / 2)] || 0;
        unpairedTeams.forEach((t) => {
          t.opponentName = "League Median";
          t.opponentTeam = "Median Benchmark";
          t.opponentPoints = median;
          t.margin = Math.round((t.points - median) * 100) / 100;
          if (t.points === 0) {
            t.outcome = "unplayed";
          } else if (t.points > median) {
            t.outcome = "win";
          } else if (t.points < median) {
            t.outcome = "loss";
          } else {
            t.outcome = "tie";
          }
        });
      }
    }
    const activeWeekSquads = weekRecords.filter(
      (r) => (r.points > 0 || r.startersTotal > 0) && r.outcome !== "unplayed"
    );
    const totalInLeague = activeWeekSquads.length;
    weekRecords.forEach((t) => {
      if (t.outcome === "unplayed" || totalInLeague <= 1) {
        t.allPlayWins = 0;
        t.allPlayLosses = 0;
        t.allPlayTies = 0;
        t.allPlayWinPct = 0;
        t.expectedWins = 0;
        t.actualWins = 0;
        t.luckIndex = 0;
        t.pointsAgainst = typeof t.opponentPoints === "number" ? t.opponentPoints : 0;
        return;
      }
      let apWins = 0;
      let apLosses = 0;
      let apTies = 0;
      activeWeekSquads.forEach((other) => {
        if (other.id === t.id) return;
        if (t.points > other.points) apWins++;
        else if (t.points < other.points) apLosses++;
        else apTies++;
      });
      const otherCount = totalInLeague - 1;
      const apWinPct = otherCount > 0 ? (apWins + 0.5 * apTies) / otherCount : 0;
      const expWins = Math.round(apWinPct * 100) / 100;
      const actWin = t.outcome === "win" ? 1 : t.outcome === "tie" ? 0.5 : 0;
      const luck = Math.round((actWin - expWins) * 100) / 100;
      t.allPlayWins = apWins;
      t.allPlayLosses = apLosses;
      t.allPlayTies = apTies;
      t.allPlayWinPct = Math.round(apWinPct * 100);
      t.expectedWins = expWins;
      t.actualWins = actWin;
      t.luckIndex = luck;
      t.pointsAgainst = typeof t.opponentPoints === "number" ? t.opponentPoints : 0;
    });
    return weekRecords;
  }
  var init_sleeper = __esm({
    "src/js/api/sleeper.js"() {
      init_constants();
      init_cache();
    }
  });

  // src/js/components/dom.js
  function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function createCardTitleWithInfo(title, infoText, badgeClasses = "text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700", isRightAligned = false) {
    const popoverAlignClass = isRightAligned ? "popover-right" : "";
    return `
    <div class="card-info-wrapper group">
      <button type="button" class="card-info-trigger ${badgeClasses} flex items-center gap-1.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label="More info about ${escapeHtml(title)}" aria-expanded="false">
        <span>${escapeHtml(title)}</span>
        <svg class="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
          <line x1="12" y1="16" x2="12" y2="12" stroke-width="2" stroke-linecap="round"></line>
          <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2.5" stroke-linecap="round"></line>
        </svg>
      </button>
      <div class="card-info-popover ${popoverAlignClass}" role="tooltip">
        <div class="font-bold text-white text-xs mb-1">${escapeHtml(title)}</div>
        <div class="text-slate-300 text-[11px] leading-relaxed font-normal">${escapeHtml(infoText)}</div>
      </div>
    </div>
  `;
  }
  function setLoading(isLoading, text = "Loading data from Sleeper API...") {
    const loadBtn = document.getElementById("loadBtn");
    const btnText = document.getElementById("btnText");
    const btnIcon = document.getElementById("btnIcon");
    const prevWeekBtn = document.getElementById("prevWeekBtn");
    const nextWeekBtn = document.getElementById("nextWeekBtn");
    const statusContainer = document.getElementById("statusContainer");
    const errorBanner = document.getElementById("errorBanner");
    const skeletonLoader = document.getElementById("skeletonLoader");
    const reportContent = document.getElementById("reportContent");
    const initialState = document.getElementById("initialState");
    const statusText = document.getElementById("statusText");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    if (isLoading) {
      if (loadBtn) {
        loadBtn.disabled = true;
        loadBtn.classList.add("opacity-75", "cursor-not-allowed");
      }
      if (btnText) btnText.textContent = "Loading...";
      if (btnIcon) btnIcon.classList.add("animate-spin");
      if (prevWeekBtn) prevWeekBtn.disabled = true;
      if (nextWeekBtn) nextWeekBtn.disabled = true;
      if (statusContainer) statusContainer.classList.remove("hidden");
      if (errorBanner) errorBanner.classList.add("hidden");
      if (skeletonLoader) skeletonLoader.classList.remove("hidden");
      if (reportContent) reportContent.classList.add("hidden");
      if (initialState) initialState.classList.add("hidden");
      if (statusText) {
        statusText.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> ${text}`;
      }
      if (progressBar) progressBar.style.width = "5%";
      if (progressText) progressText.textContent = "5%";
    } else {
      if (loadBtn) {
        loadBtn.disabled = false;
        loadBtn.classList.remove("opacity-75", "cursor-not-allowed");
      }
      if (btnText) btnText.textContent = "Load";
      if (btnIcon) btnIcon.classList.remove("animate-spin");
      updateWeekNavigatorUI();
      if (statusContainer) statusContainer.classList.add("hidden");
      if (skeletonLoader) skeletonLoader.classList.add("hidden");
    }
  }
  function updateProgress(percent, msg) {
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const statusText = document.getElementById("statusText");
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${Math.round(percent)}%`;
    if (msg && statusText) {
      statusText.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> ${msg}`;
    }
  }
  function showError(msg) {
    const errorMessage = document.getElementById("errorMessage");
    const errorBanner = document.getElementById("errorBanner");
    const initialState = document.getElementById("initialState");
    if (errorMessage) errorMessage.textContent = msg;
    if (errorBanner) errorBanner.classList.remove("hidden");
    setLoading(false);
    if (initialState) initialState.classList.remove("hidden");
  }
  var init_dom = __esm({
    "src/js/components/dom.js"() {
      init_preferences();
      init_sleeper();
      init_tabs();
      init_preferences();
    }
  });

  // src/js/components/dropdowns.js
  var dropdowns_exports = {};
  __export(dropdowns_exports, {
    renderCustomLeagueIdChips: () => renderCustomLeagueIdChips,
    renderLeagueDropdown: () => renderLeagueDropdown
  });
  function renderCustomLeagueIdChips() {
    const customLeagueIdsChips = document.getElementById("customLeagueIdsChips");
    const leagueIdsCountBadge = document.getElementById("leagueIdsCountBadge");
    const customLeaguesDropdownLabel = document.getElementById("customLeaguesDropdownLabel");
    if (!customLeagueIdsChips) return;
    customLeagueIdsChips.innerHTML = "";
    if (state.customLeagueIds.size === 0) {
      const placeholder = document.createElement("div");
      placeholder.id = "noLeagueIdsPlaceholder";
      placeholder.className = "text-[11px] text-slate-500 italic p-1";
      placeholder.textContent = "No League IDs added yet. Paste or enter IDs above.";
      customLeagueIdsChips.appendChild(placeholder);
    } else {
      state.customLeagueIds.forEach((id) => {
        const chip = document.createElement("div");
        chip.className = "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-mono group";
        chip.innerHTML = `
        <span class="text-[10px] text-emerald-400 font-bold">#</span>
        <span>${escapeHtml(id)}</span>
        <button
          type="button"
          class="text-slate-400 hover:text-rose-400 transition cursor-pointer ml-0.5 p-0.5"
          title="Remove League ID"
          aria-label="Remove League ${escapeHtml(id)}"
        >
          \u2715
        </button>
      `;
        const rmBtn = chip.querySelector("button");
        rmBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          removeCustomLeagueId(id, renderCustomLeagueIdChips);
        });
        customLeagueIdsChips.appendChild(chip);
      });
    }
    if (leagueIdsCountBadge) {
      leagueIdsCountBadge.textContent = `${state.customLeagueIds.size} ${state.customLeagueIds.size === 1 ? "ID" : "IDs"}`;
    }
    if (customLeaguesDropdownLabel) {
      if (state.customLeagueIds.size === 0) {
        customLeaguesDropdownLabel.textContent = "View Added IDs";
      } else if (state.customLeagueIds.size === 1) {
        customLeaguesDropdownLabel.textContent = "1 League ID Added";
      } else {
        customLeaguesDropdownLabel.textContent = `${state.customLeagueIds.size} League IDs Added`;
      }
    }
  }
  function renderLeagueDropdown(onFilterChangeCallback = null) {
    const leagueDropdownList = document.getElementById("leagueDropdownList");
    const leagueDropdownContainer = document.getElementById("leagueDropdownContainer");
    const leagueDropdownLabel = document.getElementById("leagueDropdownLabel");
    const leagueDropdownBadge = document.getElementById("leagueDropdownBadge");
    const selectAllLeaguesBtn = document.getElementById("selectAllLeaguesBtn");
    const clearAllLeaguesBtn = document.getElementById("clearAllLeaguesBtn");
    if (!leagueDropdownList) return;
    leagueDropdownList.innerHTML = "";
    if ((!state.allLeaguesData || state.allLeaguesData.length === 0) && state.rawRecords && state.rawRecords.length > 0) {
      state.allLeaguesData = Array.from(new Set(state.rawRecords.map((r) => r.leagueId))).map((lid) => {
        const sample = state.rawRecords.find((r) => r.leagueId === lid);
        return {
          league_id: lid,
          name: state.leaguesMap[lid] && state.leaguesMap[lid].name || sample && sample.league || `League ${lid}`,
          avatar: state.leaguesMap[lid] && state.leaguesMap[lid].avatar || sample && sample.leagueAvatar || null,
          platform: sample && sample.platform || (String(lid).startsWith("espn:") ? "espn" : "sleeper")
        };
      });
      if (state.selectedLeagueIds.size === 0) {
        state.selectedLeagueIds = new Set(state.allLeaguesData.map((l) => l.league_id));
      }
    }
    const total = state.allLeaguesData.length;
    const active = state.selectedLeagueIds.size;
    if (leagueDropdownContainer) {
      leagueDropdownContainer.classList.remove("hidden");
    }
    if (leagueDropdownLabel) {
      if (active === total && total > 0) {
        leagueDropdownLabel.textContent = `All Leagues (${total})`;
      } else if (active === 0 && total > 0) {
        leagueDropdownLabel.textContent = "No Leagues Selected";
      } else if (active === 1 && total > 0) {
        const singleId = Array.from(state.selectedLeagueIds)[0];
        const l = state.leaguesMap[singleId] || state.allLeaguesData.find((x) => x.league_id === singleId);
        leagueDropdownLabel.textContent = l ? l.name : "1 League Selected";
      } else if (total > 0) {
        leagueDropdownLabel.textContent = `${active} of ${total} Leagues Selected`;
      } else {
        leagueDropdownLabel.textContent = "No leagues synced yet";
      }
    }
    if (leagueDropdownBadge) {
      leagueDropdownBadge.textContent = total > 0 ? `${active} / ${total}` : "0";
      if (active === 0 && total > 0) {
        leagueDropdownBadge.className = "text-[10px] font-bold text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded-full border border-rose-500/30 font-mono";
      } else {
        leagueDropdownBadge.className = "text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-500/30 font-mono";
      }
    }
    if (selectAllLeaguesBtn) selectAllLeaguesBtn.disabled = total === 0;
    if (clearAllLeaguesBtn) clearAllLeaguesBtn.disabled = total === 0;
    if (total === 0) {
      leagueDropdownList.innerHTML = `
      <div class="text-[11px] text-slate-500 italic p-3 text-center">
        Sync your account or League IDs in Settings to view and filter active leagues.
      </div>
    `;
      return;
    }
    state.allLeaguesData.forEach((league) => {
      const lid = league.league_id;
      const lname = league.name || `League ${lid}`;
      const isChecked = state.selectedLeagueIds.has(lid);
      const squadCount = state.rawRecords.filter((r) => r.leagueId === lid).length;
      const isEspn = String(lid).startsWith("espn:") || league.platform === "espn";
      const platformBadge = isEspn ? `<span class="badge-espn text-[9px] font-bold px-1.5 py-0.5 rounded ml-1.5 align-middle">ESPN</span>` : `<span class="badge-sleeper text-[9px] font-bold px-1.5 py-0.5 rounded ml-1.5 align-middle">Sleeper</span>`;
      const item = document.createElement("label");
      item.className = "flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-800/80 transition cursor-pointer select-none border border-transparent hover:border-slate-700/50";
      item.innerHTML = `
      <input
        type="checkbox"
        value="${lid}"
        ${isChecked ? "checked" : ""}
        class="mt-1 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0 transition cursor-pointer flex-shrink-0"
      />
      <div class="flex-1 min-w-0 pr-1">
        <div class="text-xs font-bold text-slate-200 leading-snug break-words flex items-center flex-wrap gap-1">
          <span>${escapeHtml(lname)}</span>
          ${platformBadge}
        </div>
        <div class="text-[10px] text-slate-500 font-medium mt-0.5">
          ${squadCount} squads
        </div>
      </div>
    `;
      const cb = item.querySelector('input[type="checkbox"]');
      cb.addEventListener("change", (e) => {
        if (e.target.checked) {
          state.selectedLeagueIds.add(lid);
        } else {
          state.selectedLeagueIds.delete(lid);
        }
        renderLeagueDropdown(onFilterChangeCallback);
        if (typeof onFilterChangeCallback === "function") {
          onFilterChangeCallback();
        }
      });
      leagueDropdownList.appendChild(item);
    });
  }
  var init_dropdowns = __esm({
    "src/js/components/dropdowns.js"() {
      init_store();
      init_dom();
      init_urlParams();
    }
  });

  // src/js/state/preferences.js
  function setPlatform(platform) {
    state.currentPlatform = platform === "espn" ? "espn" : "sleeper";
    const platformSleeperBtn = document.getElementById("platformSleeperBtn");
    const platformEspnBtn = document.getElementById("platformEspnBtn");
    const syncTypeButtonsContainer = document.getElementById("syncTypeButtonsContainer");
    const userSyncPanel = document.getElementById("userSyncPanel");
    const leaguesSyncPanel = document.getElementById("leaguesSyncPanel");
    const customLeaguesLabel = document.getElementById("customLeaguesLabel");
    if (platformSleeperBtn && platformEspnBtn) {
      if (state.currentPlatform === "espn") {
        platformSleeperBtn.className = "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 text-xs";
        platformEspnBtn.className = "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-white bg-rose-900/80 border border-rose-500/40 shadow-sm flex items-center justify-center gap-1.5 text-xs font-bold";
        if (syncTypeButtonsContainer) syncTypeButtonsContainer.classList.add("hidden");
        if (userSyncPanel) userSyncPanel.classList.add("hidden");
        if (leaguesSyncPanel) leaguesSyncPanel.classList.remove("hidden");
        if (customLeaguesLabel) customLeaguesLabel.textContent = "ESPN League IDs (Public)";
        setSyncType("leagues");
      } else {
        platformSleeperBtn.className = "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-200 bg-slate-800 shadow-sm flex items-center justify-center gap-1.5 text-xs font-bold";
        platformEspnBtn.className = "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 text-xs";
        if (syncTypeButtonsContainer) syncTypeButtonsContainer.classList.remove("hidden");
        if (customLeaguesLabel) customLeaguesLabel.textContent = "Sleeper League IDs";
        setSyncType(state.currentSyncType || "user");
      }
    }
    savePreferences();
    updateSettingsButtonBadge();
  }
  function setSyncType(type) {
    state.currentSyncType = type;
    const syncTypeUserBtn = document.getElementById("syncTypeUserBtn");
    const syncTypeLeaguesBtn = document.getElementById("syncTypeLeaguesBtn");
    const userSyncPanel = document.getElementById("userSyncPanel");
    const leaguesSyncPanel = document.getElementById("leaguesSyncPanel");
    if (type === "leagues" || state.currentPlatform === "espn") {
      if (syncTypeUserBtn) {
        syncTypeUserBtn.className = "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5";
      }
      if (syncTypeLeaguesBtn) {
        syncTypeLeaguesBtn.className = "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-200 bg-slate-800 shadow-sm flex items-center justify-center gap-1.5";
      }
      if (userSyncPanel) userSyncPanel.classList.add("hidden");
      if (leaguesSyncPanel) leaguesSyncPanel.classList.remove("hidden");
    } else {
      if (syncTypeUserBtn) {
        syncTypeUserBtn.className = "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-200 bg-slate-800 shadow-sm flex items-center justify-center gap-1.5";
      }
      if (syncTypeLeaguesBtn) {
        syncTypeLeaguesBtn.className = "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5";
      }
      if (userSyncPanel) userSyncPanel.classList.remove("hidden");
      if (leaguesSyncPanel) leaguesSyncPanel.classList.add("hidden");
    }
    updateSettingsButtonBadge();
    savePreferences();
  }
  function populateSeasonOptions(defaultYear) {
    const seasonInput = document.getElementById("seasonInput");
    if (!seasonInput) return;
    const maxYear = Math.max(defaultYear + 1, 2026);
    const minYear = 2020;
    const currentVal = seasonInput.value;
    seasonInput.innerHTML = "";
    for (let y = maxYear; y >= minYear; y--) {
      const opt = document.createElement("option");
      opt.value = String(y);
      opt.textContent = String(y);
      seasonInput.appendChild(opt);
    }
    if (currentVal && Array.from(seasonInput.options).some((o) => o.value === currentVal)) {
      seasonInput.value = currentVal;
    } else {
      seasonInput.value = String(defaultYear);
    }
  }
  function getMaxPlayedWeek() {
    const seasonInput = document.getElementById("seasonInput");
    const selectedSeason = parseInt(seasonInput ? seasonInput.value : state.nflState.season, 10) || state.nflState.season;
    const currentNflSeason = state.nflState.season;
    if (selectedSeason < currentNflSeason) {
      return 18;
    } else if (selectedSeason > currentNflSeason) {
      return 1;
    } else {
      if (state.nflState.season_type === "post") {
        return 18;
      } else if (state.nflState.season_type === "pre") {
        return 1;
      } else {
        return Math.max(1, Math.min(18, state.nflState.display_week || state.nflState.week || 1));
      }
    }
  }
  function updateWeekNavigatorUI() {
    const weekInput = document.getElementById("weekInput");
    const seasonInput = document.getElementById("seasonInput");
    const weekDisplayValue = document.getElementById("weekDisplayValue");
    const headerWeekValue = document.getElementById("headerWeekValue");
    const headerSeasonValue = document.getElementById("headerSeasonValue");
    const playerSeasonBadge = document.getElementById("playerSeasonBadge");
    const weekStatusBadge = document.getElementById("weekStatusBadge");
    const prevWeekBtn = document.getElementById("prevWeekBtn");
    const nextWeekBtn = document.getElementById("nextWeekBtn");
    if (!weekInput) return;
    const maxPlayed = getMaxPlayedWeek();
    let currentWeek = parseInt(weekInput.value, 10) || 1;
    if (currentWeek > maxPlayed) {
      currentWeek = maxPlayed;
      weekInput.value = String(currentWeek);
      savePreferences();
    } else if (currentWeek < 1) {
      currentWeek = 1;
      weekInput.value = String(currentWeek);
      savePreferences();
    }
    const weekLabel = state.currentMode === "SEASON_ROLLUP" ? currentWeek === 1 ? "Week 1 Rollup" : `Weeks 1\u2013${currentWeek}` : `Week ${currentWeek}`;
    if (weekDisplayValue) weekDisplayValue.textContent = weekLabel;
    if (headerWeekValue) headerWeekValue.textContent = weekLabel;
    if (headerSeasonValue && seasonInput) headerSeasonValue.textContent = seasonInput.value;
    if (playerSeasonBadge && seasonInput) playerSeasonBadge.textContent = seasonInput.value;
    if (weekStatusBadge) {
      const selectedSeason = parseInt(seasonInput ? seasonInput.value : state.nflState.season, 10) || state.nflState.season;
      if (selectedSeason < state.nflState.season) {
        weekStatusBadge.textContent = "Final";
        weekStatusBadge.className = "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-400";
      } else if (currentWeek < maxPlayed) {
        weekStatusBadge.textContent = "Played";
        weekStatusBadge.className = "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-400";
      } else if (currentWeek === maxPlayed && state.nflState.season_type === "regular") {
        weekStatusBadge.textContent = "Current";
        weekStatusBadge.className = "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 animate-pulse";
      } else {
        weekStatusBadge.textContent = "Week 1";
        weekStatusBadge.className = "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-400";
      }
    }
    if (prevWeekBtn) {
      const canGoPrev = currentWeek > 1;
      prevWeekBtn.disabled = !canGoPrev;
      if (canGoPrev) {
        prevWeekBtn.classList.remove("opacity-40", "cursor-not-allowed");
        prevWeekBtn.classList.add("hover:bg-slate-800", "cursor-pointer");
        prevWeekBtn.title = `Previous Week (Week ${currentWeek - 1}) \u2022 Press \u2190`;
      } else {
        prevWeekBtn.classList.add("opacity-40", "cursor-not-allowed");
        prevWeekBtn.classList.remove("hover:bg-slate-800", "cursor-pointer");
        prevWeekBtn.title = "At first week (Week 1)";
      }
    }
    if (nextWeekBtn) {
      const canGoNext = currentWeek < maxPlayed;
      nextWeekBtn.disabled = !canGoNext;
      if (canGoNext) {
        nextWeekBtn.classList.remove("opacity-40", "cursor-not-allowed");
        nextWeekBtn.classList.add("hover:bg-slate-800", "cursor-pointer");
        nextWeekBtn.title = `Next Week (Week ${currentWeek + 1}) \u2022 Press \u2192`;
      } else {
        nextWeekBtn.classList.add("opacity-40", "cursor-not-allowed");
        nextWeekBtn.classList.remove("hover:bg-slate-800", "cursor-pointer");
        nextWeekBtn.title = `At current week (Week ${currentWeek})`;
      }
    }
  }
  function updateSettingsButtonBadge() {
    const userIdInput = document.getElementById("userIdInput");
    const seasonInput = document.getElementById("seasonInput");
    const settingsBtnUserBadge = document.getElementById("settingsBtnUserBadge");
    const btnOpenSettingsModal = document.getElementById("btnOpenSettingsModal");
    const headerSeasonValue = document.getElementById("headerSeasonValue");
    let u = "";
    if (state.currentSyncType === "leagues") {
      const count = state.customLeagueIds.size || (state.allLeaguesData ? state.allLeaguesData.length : 0);
      if (count > 0) {
        u = `${count} ${count === 1 ? "League" : "Leagues"}`;
      }
    } else {
      u = (userIdInput && typeof userIdInput.value === "string" ? userIdInput.value.trim() : "") || state.currentUserName || "";
    }
    if (settingsBtnUserBadge) {
      if (state.currentSyncType === "leagues" && u) {
        settingsBtnUserBadge.textContent = `\u{1F3C6} ${u}`;
        settingsBtnUserBadge.classList.remove("text-slate-400", "border-slate-700/60");
        settingsBtnUserBadge.classList.add("text-emerald-400", "border-emerald-500/30");
      } else if (u) {
        settingsBtnUserBadge.textContent = `@${u}`;
        settingsBtnUserBadge.classList.remove("text-slate-400", "border-slate-700/60");
        settingsBtnUserBadge.classList.add("text-emerald-400", "border-emerald-500/30");
      } else {
        settingsBtnUserBadge.textContent = "No sync source";
        settingsBtnUserBadge.classList.remove("text-emerald-400", "border-emerald-500/30");
        settingsBtnUserBadge.classList.add("text-slate-400", "border-slate-700/60");
      }
    }
    if (btnOpenSettingsModal) {
      if (state.currentSyncType === "leagues" && u) {
        btnOpenSettingsModal.title = `Settings (${u})`;
      } else {
        btnOpenSettingsModal.title = u ? `Settings (@${u})` : "User & League Settings";
      }
    }
    if (headerSeasonValue && seasonInput) {
      headerSeasonValue.textContent = seasonInput.value;
    }
  }
  function updateModeUI() {
    const modeSelect = document.getElementById("modeSelect");
    const headerBottomRow = document.getElementById("headerBottomRow");
    const weekLabelText = document.getElementById("weekLabelText");
    const scoreTierSelect = document.getElementById("scoreTierSelect");
    if (!modeSelect) return;
    state.currentMode = modeSelect.value;
    if (state.currentMode === "SEASON_ROLLUP") {
      if (headerBottomRow) headerBottomRow.classList.add("hidden");
      if (weekLabelText) weekLabelText.textContent = "Through Week";
      if (scoreTierSelect) {
        scoreTierSelect.innerHTML = `
        <option value="ALL">All Averages</option>
        <option value="BOOM">\u{1F525} Elite PPG (130+)</option>
        <option value="SOLID">\u26A1 Solid PPG (105 - 130)</option>
        <option value="COLD">\u{1F9CA} Sub-105 PPG</option>
      `;
      }
    } else {
      if (headerBottomRow) headerBottomRow.classList.remove("hidden");
      if (weekLabelText) weekLabelText.textContent = "Matchup Week";
      if (scoreTierSelect) {
        scoreTierSelect.innerHTML = `
        <option value="ALL">All Scores</option>
        <option value="BOOM">\u{1F525} Nuclear (140+ pts)</option>
        <option value="SOLID">\u26A1 Solid (100 - 140)</option>
        <option value="COLD">\u{1F9CA} Ice Cold (&lt; 100)</option>
      `;
      }
    }
    updateSettingsButtonBadge();
    updateWeekNavigatorUI();
  }
  function loadSavedPreferences() {
    const savedPlatform = localStorage.getItem("crossleague_platform");
    if (savedPlatform === "espn" || savedPlatform === "sleeper") {
      state.currentPlatform = savedPlatform;
    }
    const savedSyncType = localStorage.getItem("sleeper_sync_type");
    if (savedSyncType === "leagues" || savedSyncType === "user") {
      state.currentSyncType = savedSyncType;
    }
    const savedCustomLeagues = localStorage.getItem("sleeper_custom_league_ids");
    if (savedCustomLeagues) {
      try {
        const parsed = JSON.parse(savedCustomLeagues);
        if (Array.isArray(parsed)) {
          state.customLeagueIds = new Set(parsed.filter(Boolean));
        }
      } catch (e) {
        console.warn("Could not parse saved custom league IDs:", e);
      }
    }
    const userIdInput = document.getElementById("userIdInput");
    const seasonInput = document.getElementById("seasonInput");
    const weekInput = document.getElementById("weekInput");
    const modeSelect = document.getElementById("modeSelect");
    const savedUser = localStorage.getItem("sleeper_username") || localStorage.getItem("sleeper_user_id");
    if (savedUser && userIdInput) userIdInput.value = savedUser;
    const savedSeason = localStorage.getItem("sleeper_season");
    if (savedSeason && seasonInput) seasonInput.value = savedSeason;
    const savedWeek = localStorage.getItem("sleeper_week");
    if (savedWeek && weekInput) weekInput.value = savedWeek;
    const savedMode = localStorage.getItem("sleeper_mode");
    if (savedMode && modeSelect) {
      modeSelect.value = savedMode;
      state.currentMode = savedMode;
      updateModeUI();
    }
    setPlatform(state.currentPlatform);
    updateSettingsButtonBadge();
    updateWeekNavigatorUI();
  }
  function savePreferences() {
    const userIdInput = document.getElementById("userIdInput");
    const seasonInput = document.getElementById("seasonInput");
    const weekInput = document.getElementById("weekInput");
    const modeSelect = document.getElementById("modeSelect");
    localStorage.setItem("crossleague_platform", state.currentPlatform);
    localStorage.setItem("sleeper_sync_type", state.currentSyncType);
    if (userIdInput) {
      const username = userIdInput.value.trim();
      localStorage.setItem("sleeper_username", username);
      localStorage.setItem("sleeper_user_id", username);
    }
    if (seasonInput) localStorage.setItem("sleeper_season", seasonInput.value);
    if (weekInput) localStorage.setItem("sleeper_week", weekInput.value);
    if (modeSelect) localStorage.setItem("sleeper_mode", modeSelect.value);
    localStorage.setItem(
      "sleeper_custom_league_ids",
      JSON.stringify(Array.from(state.customLeagueIds))
    );
    updateSettingsButtonBadge();
  }
  async function initDefaults() {
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    populateSeasonOptions(currentYear);
    loadSavedPreferences();
    const userIdInput = document.getElementById("userIdInput");
    const seasonInput = document.getElementById("seasonInput");
    const weekInput = document.getElementById("weekInput");
    const modeSelect = document.getElementById("modeSelect");
    const { getUrlParams: getUrlParams2 } = await Promise.resolve().then(() => (init_urlParams(), urlParams_exports));
    const { openSettingsModal: openSettingsModal2, closeSettingsModal: closeSettingsModal2 } = await Promise.resolve().then(() => (init_modal(), modal_exports));
    const { renderCustomLeagueIdChips: renderCustomLeagueIdChips2, renderLeagueDropdown: renderLeagueDropdown2 } = await Promise.resolve().then(() => (init_dropdowns(), dropdowns_exports));
    const { BASE_URL: BASE_URL2 } = await Promise.resolve().then(() => (init_constants(), constants_exports));
    const urlParams = getUrlParams2();
    if (urlParams.platform) {
      setPlatform(urlParams.platform.toLowerCase() === "espn" ? "espn" : "sleeper");
    }
    if (urlParams.user) {
      state.currentSyncType = "user";
      if (userIdInput) userIdInput.value = urlParams.user.trim();
      state.currentUserName = urlParams.user.trim();
      state.currentUserId = "";
      state.customLeagueIds.clear();
      state.pendingLeagueIdsFilter = null;
    }
    if (urlParams.leagues) {
      const ids = urlParams.leagues.split(",").map((id) => id.trim()).filter(Boolean);
      state.pendingLeagueIdsFilter = new Set(ids);
      state.customLeagueIds.clear();
      ids.forEach((id) => state.customLeagueIds.add(id));
      if (!urlParams.user) {
        state.currentSyncType = "leagues";
        if (userIdInput) userIdInput.value = "";
        state.currentUserName = "";
        state.currentUserId = "";
      }
    }
    if (urlParams.season && seasonInput) {
      seasonInput.value = String(urlParams.season);
    } else if (!localStorage.getItem("sleeper_season") && seasonInput) {
      seasonInput.value = String(currentYear);
    }
    if (urlParams.week && weekInput) {
      weekInput.value = String(urlParams.week);
    }
    if (urlParams.mode && modeSelect) {
      const normalizedMode = urlParams.mode.toUpperCase() === "SEASON_ROLLUP" ? "SEASON_ROLLUP" : "WEEKLY";
      modeSelect.value = normalizedMode;
      state.currentMode = normalizedMode;
      updateModeUI();
    }
    setSyncType(state.currentSyncType);
    renderCustomLeagueIdChips2();
    try {
      const nflData = await cachedApiFetch(`${BASE_URL2}/state/nfl`, {
        ttlMs: 2 * 60 * 60 * 1e3
      });
      if (nflData) {
        state.nflState = {
          season: parseInt(nflData.season, 10) || currentYear,
          week: parseInt(nflData.week, 10) || 1,
          display_week: parseInt(nflData.display_week, 10) || parseInt(nflData.week, 10) || 1,
          season_type: nflData.season_type || "regular"
        };
        if (!urlParams.season && !localStorage.getItem("sleeper_season") && nflData.season && seasonInput) {
          seasonInput.value = String(nflData.season);
        }
        if (!urlParams.week && !localStorage.getItem("sleeper_week") && weekInput) {
          const defaultWeek = state.nflState.display_week || state.nflState.week || 1;
          if (defaultWeek >= 1 && defaultWeek <= 18) {
            weekInput.value = String(defaultWeek);
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch NFL state for defaults:", err);
    }
    const hasSharedLeagues = Boolean(
      state.pendingLeagueIdsFilter && state.pendingLeagueIdsFilter.size > 0 || state.currentSyncType === "leagues" && state.customLeagueIds.size > 0
    );
    const hasSavedUser = Boolean(urlParams.user) || Boolean(localStorage.getItem("sleeper_user_id")) || Boolean(userIdInput && userIdInput.value.trim()) || hasSharedLeagues;
    if (!hasSavedUser) {
      openSettingsModal2();
    } else {
      closeSettingsModal2();
    }
    updateSettingsButtonBadge();
    updateWeekNavigatorUI();
    renderLeagueDropdown2();
  }
  var init_preferences = __esm({
    "src/js/state/preferences.js"() {
      init_store();
      init_cache();
      if (typeof window !== "undefined") {
        window.addEventListener("pagehide", savePreferences);
      }
    }
  });

  // src/js/index.js
  var index_exports = {};
  __export(index_exports, {
    BASE_URL: () => BASE_URL,
    ESPN_BASE_URL: () => ESPN_BASE_URL,
    ESPN_POS_MAP: () => ESPN_POS_MAP,
    ESPN_PRO_TEAMS: () => ESPN_PRO_TEAMS,
    HASH_TAB_MAP: () => HASH_TAB_MAP,
    TAB_HASH_MAP: () => TAB_HASH_MAP,
    TAB_ORDER: () => TAB_ORDER,
    addCustomLeagueIds: () => addCustomLeagueIds,
    aggregatePlayers: () => aggregatePlayers,
    allPlayTiebreaker: () => allPlayTiebreaker,
    apiFetch: () => apiFetch,
    buildShareableUrl: () => buildShareableUrl,
    cachedApiFetch: () => cachedApiFetch,
    calculateAllPlay: () => calculateAllPlay,
    calculateLeagueAverages: () => calculateLeagueAverages,
    calculateLineupEfficiency: () => calculateLineupEfficiency,
    calculateLuckIndex: () => calculateLuckIndex,
    calculateMean: () => calculateMean,
    calculateMedian: () => calculateMedian,
    calculatePositionalMvps: () => calculatePositionalMvps,
    calculateStdDev: () => calculateStdDev,
    calculateSuperlatives: () => computeSuperlatives,
    changeLuckPage: () => changeLuckPage,
    changeMainPage: () => changeMainPage,
    changePlayerPage: () => changePlayerPage,
    clearAllData: () => clearAllData,
    clearApiCache: () => clearApiCache,
    clearCustomLeagueIds: () => clearCustomLeagueIds,
    closeLuckModal: () => closeLuckModal2,
    closeSettingsModal: () => closeSettingsModal,
    computePodium: () => computePodium,
    computeSuperlatives: () => computeSuperlatives,
    copyChatRecap: () => copyChatRecap,
    createCardTitleWithInfo: () => createCardTitleWithInfo,
    downloadReport: () => downloadReport,
    escapeHtml: () => escapeHtml,
    exportCsv: () => exportCsv,
    extractCustomLeagueIds: () => extractCustomLeagueIds,
    fallbackCopyText: () => fallbackCopyText,
    fetchEspnApi: () => fetchEspnApi,
    fetchEspnLeague: () => fetchEspnLeague,
    fetchLeaderboard: () => fetchLeaderboard,
    formatLuckBadge: () => formatLuckBadge,
    formatRecapText: () => formatRecapText,
    getActiveLeaguesMap: () => getActiveLeaguesMap,
    getActiveRecords: () => getActiveRecords,
    getAvatarUrl: () => getAvatarUrl,
    getCacheKey: () => getCacheKey,
    getCurrentlyActiveTab: () => getCurrentlyActiveTab,
    getLuckCategory: () => getLuckCategory,
    getMaxPlayedWeek: () => getMaxPlayedWeek,
    getPlayerInfo: () => getPlayerInfo,
    getPlayerPositionBadge: () => getPlayerPositionBadge,
    getUrlParams: () => getUrlParams,
    goToLuckPage: () => goToLuckPage,
    goToMainPage: () => goToMainPage,
    goToPlayerPage: () => goToPlayerPage,
    initDefaults: () => initDefaults,
    initPlayersDb: () => initPlayersDb,
    isEspnStarter: () => isEspnStarter,
    isWeekFinished: () => isWeekFinished,
    loadCachedData: () => loadCachedData,
    loadEmbeddedReport: () => loadEmbeddedReport,
    loadSavedPreferences: () => loadSavedPreferences,
    openLuckModal: () => openLuckModal2,
    openSettingsModal: () => openSettingsModal,
    parseRosterEntries: () => parseRosterEntries,
    populateSeasonOptions: () => populateSeasonOptions,
    processWeeklyMatchups: () => processWeeklyMatchups,
    refreshDashboard: () => refreshDashboard,
    removeCustomLeagueId: () => removeCustomLeagueId,
    renderCharts: () => renderCharts,
    renderCustomLeagueIdChips: () => renderCustomLeagueIdChips,
    renderLeagueDropdown: () => renderLeagueDropdown,
    renderLeagueGrid: () => renderLeagueGrid,
    renderLuckAnalytics: () => renderLuckAnalytics,
    renderLuckTable: () => renderLuckTable,
    renderPaginationButtons: () => renderPaginationButtons,
    renderPlayerAnalytics: () => renderPlayerAnalytics,
    renderPlayerLeaderboard: () => renderPlayerLeaderboard,
    renderPodium: () => renderPodium,
    renderPositionalMvpDeck: () => renderPositionalMvpDeck,
    renderSummaryCards: () => renderSummaryCards,
    renderSuperlatives: () => renderSuperlatives,
    renderTable: () => renderTable,
    resolveUser: () => resolveUser,
    saveDataToCache: () => saveDataToCache,
    savePreferences: () => savePreferences,
    setLoading: () => setLoading,
    setLuckPageSize: () => setLuckPageSize,
    setMainPageSize: () => setMainPageSize,
    setPlatform: () => setPlatform,
    setPlayerPageSize: () => setPlayerPageSize,
    setPlayerPositionFilter: () => setPlayerPositionFilter,
    setSyncType: () => setSyncType,
    setupEventListeners: () => setupEventListeners,
    shareReport: () => shareReport,
    shareUrl: () => shareUrl,
    showError: () => showError,
    showToast: () => showToast,
    sortLuckTable: () => sortLuckTable,
    sortPlayers: () => sortPlayers,
    sortTable: () => sortTable,
    startApp: () => startApp,
    state: () => state,
    switchTab: () => switchTab,
    syncTabFromHash: () => syncTabFromHash,
    togglePlayerRowExpand: () => togglePlayerRowExpand,
    toggleRowExpand: () => toggleRowExpand,
    toggleSettingsDropdown: () => toggleSettingsDropdown,
    triggerConfetti: () => triggerConfetti,
    tryLoadFromCache: () => tryLoadFromCache,
    updateModeUI: () => updateModeUI,
    updateProgress: () => updateProgress,
    updateSettingsButtonBadge: () => updateSettingsButtonBadge,
    updateWeekNavigatorUI: () => updateWeekNavigatorUI,
    wrapLabel: () => wrapLabel
  });
  init_constants();
  init_store();
  init_cache();
  init_preferences();
  init_urlParams();

  // src/js/analytics/allPlay.js
  function calculateAllPlay(teamScore, allScores) {
    let wins = 0;
    let losses = 0;
    let ties = 0;
    let matchedSelf = false;
    allScores.forEach((s) => {
      if (s === teamScore && !matchedSelf) {
        matchedSelf = true;
        return;
      }
      if (teamScore > s) wins++;
      else if (teamScore < s) losses++;
      else ties++;
    });
    const totalOpponents = Math.max(0, allScores.length - 1);
    const xw = totalOpponents > 0 ? (wins + ties * 0.5) / totalOpponents : 0;
    const totalGames = wins + losses + ties;
    const winPct = totalGames > 0 ? Math.round((wins + ties * 0.5) / totalGames * 1e3) / 10 : 0;
    return { wins, losses, ties, xw, winPct };
  }
  function allPlayTiebreaker(a, b) {
    const pctDiff = (b.allPlayWinPct || 0) - (a.allPlayWinPct || 0);
    if (pctDiff !== 0) return pctDiff;
    const ptsA = typeof a.totalPoints === "number" ? a.totalPoints : a.points || 0;
    const ptsB = typeof b.totalPoints === "number" ? b.totalPoints : b.points || 0;
    return ptsB - ptsA;
  }

  // src/js/analytics/luck.js
  function calculateLuckIndex(actualWins, expectedWins) {
    const luck = Number(actualWins || 0) - Number(expectedWins || 0);
    return Math.round(luck * 100) / 100;
  }
  function getLuckCategory(luckVal) {
    if (luckVal >= 0.5) return "LUCKY";
    if (luckVal <= -0.5) return "UNLUCKY";
    return "FAIR";
  }
  function formatLuckBadge(luckVal, _isSeason = false, actWinsStr = "0", expWinsStr = "0.00") {
    const val = Number(luckVal || 0);
    const formatted = val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2);
    if (val >= 0.5) {
      return `
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm cursor-help" title="\u{1F340} Lucky Schedule Draw: Gained +${val.toFixed(2)} bonus wins above expected (${actWinsStr} actual vs ${expWinsStr} expected based on scoring)">
        <span>\u{1F340}</span> ${formatted}
      </span>
    `;
    }
    if (val <= -0.5) {
      return `
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-mono font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm cursor-help" title="\u{1F494} Unlucky Schedule Draw: Lost ${Math.abs(val).toFixed(2)} wins below expected (${actWinsStr} actual vs ${expWinsStr} expected due to tough opponent scores)">
        <span>\u{1F494}</span> ${formatted}
      </span>
    `;
    }
    return `
    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-mono font-black bg-slate-800 text-slate-300 border border-slate-700 cursor-help" title="\u2696\uFE0F Fair Schedule: Actual outcome closely matches scoring performance (${val >= 0 ? "+" : ""}${val.toFixed(2)} vs ${expWinsStr} expected)">
      <span>\u2696\uFE0F</span> ${formatted}
    </span>
  `;
  }

  // src/js/analytics/efficiency.js
  function calculateLineupEfficiency(startersTotal, optimalTotal) {
    const actual = Number(startersTotal || 0);
    const optimal = Number(optimalTotal || 0);
    if (optimal <= 0) return 100;
    return Math.round(actual / optimal * 1e3) / 10;
  }

  // src/js/analytics/statistics.js
  function calculateStdDev(scores) {
    if (!scores || scores.length < 2) return 0;
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (scores.length - 1);
    return Math.round(Math.sqrt(variance) * 10) / 10;
  }
  function calculateMean(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }
  function calculateMedian(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }
  function calculateLeagueAverages(records = [], leaguesMap = {}) {
    const result = [];
    const groups = {};
    records.forEach((r) => {
      if (!groups[r.leagueId]) groups[r.leagueId] = [];
      groups[r.leagueId].push(r.points || 0);
    });
    Object.keys(groups).forEach((lid) => {
      const scores = groups[lid];
      const avg = calculateMean(scores);
      const leagueName = leaguesMap[lid]?.name || `League ${lid}`;
      result.push({
        leagueId: lid,
        name: leagueName,
        avgScore: Math.round(avg * 100) / 100,
        teamsCount: scores.length
      });
    });
    return result.sort((a, b) => b.avgScore - a.avgScore);
  }

  // src/js/analytics/superlatives.js
  function computePodium(records = []) {
    if (!records || records.length === 0) return [];
    const sorted = [...records].sort((a, b) => (b.points || 0) - (a.points || 0));
    return sorted.slice(0, 3);
  }
  function computeSuperlatives(records = [], isSeason = false) {
    if (!records || records.length === 0) {
      return { badBeat: null, luckyEscape: null, benchKing: null };
    }
    let badBeat = null;
    let luckyEscape = null;
    if (!isSeason) {
      const losers = records.filter((r) => r.outcome === "loss" && (r.points || 0) > 0).sort((a, b) => (b.points || 0) - (a.points || 0));
      badBeat = losers[0] || null;
      const winners = records.filter((r) => r.outcome === "win" && (r.points || 0) > 0).sort((a, b) => (a.points || 0) - (b.points || 0));
      luckyEscape = winners[0] || null;
    } else {
      const losingSquads = records.filter((r) => (r.losses || 0) > (r.wins || 0)).sort((a, b) => (b.totalPoints || b.points || 0) - (a.totalPoints || a.points || 0));
      badBeat = losingSquads[0] || [...records].sort((a, b) => (b.pointsAgainst || 0) - (a.pointsAgainst || 0))[0] || null;
      const winningSquads = records.filter((r) => (r.wins || 0) > (r.losses || 0)).sort((a, b) => (a.totalPoints || a.points || 0) - (b.totalPoints || b.points || 0));
      luckyEscape = winningSquads[0] || [...records].sort((a, b) => (a.pointsAgainst || 0) - (b.pointsAgainst || 0))[0] || null;
    }
    const sortedBench = records.filter((r) => (r.benchPoints || 0) > 0).sort((a, b) => (b.benchPoints || 0) - (a.benchPoints || 0));
    const benchKing = sortedBench[0] || null;
    return { badBeat, luckyEscape, benchKing };
  }

  // src/js/analytics/aggregation.js
  function aggregatePlayers(records = [], isSeason = false, targetWeek = 1, getPlayerInfoFn = (id) => ({ name: `Player #${id}`, pos: "FLEX", team: "FA" })) {
    const playerMap = {};
    if (isSeason) {
      (records || []).forEach((r) => {
        (r.weeklyPlayerRecords || []).forEach((wRec) => {
          const week = wRec.week;
          const ptsMap = wRec.playersPointsMap || {};
          const starters = new Set(wRec.startersList || []);
          const all = new Set(wRec.allPlayersList || []);
          const allPids = /* @__PURE__ */ new Set([...Object.keys(ptsMap), ...all, ...starters]);
          allPids.forEach((pid) => {
            if (!pid || pid === "0") return;
            const score = Math.round(parseFloat(ptsMap[pid] || 0) * 100) / 100;
            if (!playerMap[pid]) {
              playerMap[pid] = {
                id: pid,
                totalPoints: 0,
                weeklyScores: {},
                startedCount: 0,
                benchedCount: 0,
                ownersMap: {}
              };
            }
            playerMap[pid].totalPoints += score;
            if (score > 0 || ptsMap[pid] !== void 0) {
              playerMap[pid].weeklyScores[week] = score;
            }
            const isStarter = starters.has(pid);
            if (isStarter) {
              playerMap[pid].startedCount++;
            } else {
              playerMap[pid].benchedCount++;
            }
            const ownerKey = `${r.manager}::${r.leagueId}`;
            if (!playerMap[pid].ownersMap[ownerKey]) {
              playerMap[pid].ownersMap[ownerKey] = {
                manager: r.manager,
                teamName: r.teamName,
                league: r.league,
                leagueId: r.leagueId,
                avatar: r.avatar,
                starts: 0,
                benches: 0,
                weeksRostered: 0
              };
            }
            playerMap[pid].ownersMap[ownerKey].weeksRostered++;
            if (isStarter) playerMap[pid].ownersMap[ownerKey].starts++;
            else playerMap[pid].ownersMap[ownerKey].benches++;
          });
        });
      });
      const targetWeekNum = parseInt(targetWeek, 10) || 1;
      return Object.values(playerMap).map((p) => {
        const info = getPlayerInfoFn(p.id);
        const activeWeeks = Object.keys(p.weeklyScores).length;
        const gamesCount = activeWeeks > 0 ? activeWeeks : Math.max(1, targetWeekNum);
        const avgPpg = Math.round(p.totalPoints / gamesCount * 100) / 100;
        const roundedTotal = Math.round(p.totalPoints * 100) / 100;
        const totalRostered = p.startedCount + p.benchedCount;
        const startRate = totalRostered > 0 ? Math.round(p.startedCount / totalRostered * 100) : 0;
        const owners = Object.values(p.ownersMap);
        return {
          id: p.id,
          name: info.name,
          pos: info.pos,
          team: info.team,
          headshotUrl: info.headshotUrl,
          isDef: info.isDef,
          points: avgPpg,
          totalPoints: roundedTotal,
          avgPpg,
          gamesCount,
          weeklyScores: p.weeklyScores,
          startedCount: p.startedCount,
          benchedCount: p.benchedCount,
          rosteredCount: owners.length,
          totalAppearances: totalRostered,
          startRate,
          owners
        };
      });
    }
    (records || []).forEach((r) => {
      const ptsMap = r.playersPointsMap || {};
      const starters = new Set(r.startersList || []);
      const all = new Set(r.allPlayersList || []);
      const allPids = /* @__PURE__ */ new Set([...Object.keys(ptsMap), ...all, ...starters]);
      allPids.forEach((pid) => {
        if (!pid || pid === "0") return;
        const score = Math.round(parseFloat(ptsMap[pid] || 0) * 100) / 100;
        const isStarter = starters.has(pid);
        if (!playerMap[pid]) {
          playerMap[pid] = {
            id: pid,
            points: score,
            startedCount: 0,
            benchedCount: 0,
            owners: []
          };
        } else {
          if (score > playerMap[pid].points) {
            playerMap[pid].points = score;
          }
        }
        if (isStarter) {
          playerMap[pid].startedCount++;
        } else {
          playerMap[pid].benchedCount++;
        }
        playerMap[pid].owners.push({
          manager: r.manager,
          teamName: r.teamName,
          league: r.league,
          leagueId: r.leagueId,
          avatar: r.avatar,
          isStarter,
          points: score
        });
      });
    });
    return Object.values(playerMap).map((p) => {
      const info = getPlayerInfoFn(p.id);
      const totalRostered = p.startedCount + p.benchedCount;
      const startRate = totalRostered > 0 ? Math.round(p.startedCount / totalRostered * 100) : 0;
      return {
        id: p.id,
        name: info.name,
        pos: info.pos,
        team: info.team,
        headshotUrl: info.headshotUrl,
        isDef: info.isDef,
        points: p.points,
        startedCount: p.startedCount,
        benchedCount: p.benchedCount,
        rosteredCount: p.owners.length,
        totalAppearances: totalRostered,
        startRate,
        owners: p.owners
      };
    });
  }
  function calculatePositionalMvps(allPlayers = []) {
    const positions = ["QB", "RB", "WR", "TE", "K", "DEF"];
    const mvps = {};
    positions.forEach((pos) => {
      const matching = (allPlayers || []).filter((p) => (p.pos || "").toUpperCase() === pos && (p.points || 0) > 0).sort((a, b) => (b.points || 0) - (a.points || 0));
      mvps[pos] = matching[0] || null;
    });
    return mvps;
  }

  // src/js/api/index.js
  init_sleeper();

  // src/js/api/espn.js
  init_constants();
  init_store();
  init_cache();
  function isEspnStarter(slotId) {
    return slotId !== 20 && slotId !== 21;
  }
  async function fetchEspnApi(path, options = {}) {
    const urlsToTry = [
      `${ESPN_BASE_URL}${path}`,
      `https://corsproxy.io/?${encodeURIComponent(`${ESPN_BASE_URL}${path}`)}`
    ];
    let lastError = null;
    for (const targetUrl of urlsToTry) {
      try {
        const data = await cachedApiFetch(targetUrl, {
          headers: { Accept: "application/json" },
          ttlMs: 15 * 60 * 1e3,
          ...options
        });
        return data;
      } catch (err) {
        lastError = err;
        if (err.message.includes("access denied") || err.message.includes("not found")) {
          throw err;
        }
      }
    }
    throw new Error(
      `Could not connect to ESPN API (${lastError ? lastError.message : "CORS Error"}).`
    );
  }
  function parseRosterEntries(roster, targetWeekNum = 1) {
    const entries = roster && roster.entries || [];
    const startersList = [];
    const allPlayersList = [];
    const playersPointsMap = {};
    const startersPoints = [];
    let startersTotal = 0;
    let benchPoints = 0;
    let highestBenchScore = 0;
    entries.forEach((e) => {
      const p = e.playerPoolEntry && e.playerPoolEntry.player;
      if (!p) return;
      const pid = `espn_${p.id}`;
      let pts = 0;
      if (p.stats && Array.isArray(p.stats) && p.stats.length > 0) {
        const weekStat = p.stats.find(
          (s) => s.statSourceId === 0 && s.statSplitTypeId === 1 && s.scoringPeriodId === targetWeekNum
        );
        if (weekStat && typeof weekStat.appliedTotal === "number") {
          pts = weekStat.appliedTotal;
        } else {
          const scoringStat = p.stats.find((s) => s.statSourceId === 0 && s.statSplitTypeId === 1) || p.stats.find((s) => s.statSourceId === 0) || p.stats[0];
          if (scoringStat && typeof scoringStat.appliedTotal === "number") {
            pts = scoringStat.appliedTotal;
          }
        }
      } else if (typeof e.appliedStatTotal === "number") {
        pts = e.appliedStatTotal;
      } else if (e.playerPoolEntry && typeof e.playerPoolEntry.appliedStatTotal === "number" && targetWeekNum === 1) {
        pts = e.playerPoolEntry.appliedStatTotal;
      } else if (e.playerPoolEntry && e.playerPoolEntry.ratings && e.playerPoolEntry.ratings[0]) {
        pts = e.playerPoolEntry.ratings[0].totalPoints || 0;
      }
      pts = Math.round(parseFloat(pts || 0) * 100) / 100;
      const pos = ESPN_POS_MAP[p.defaultPositionId] || "FLEX";
      const teamAbbrev = ESPN_PRO_TEAMS[p.proTeamId] || "FA";
      state.espnPlayersDb[pid] = {
        name: p.fullName || `${p.firstName || ""} ${p.lastName || ""}`.trim() || `Player ${p.id}`,
        pos,
        team: teamAbbrev,
        isDef: pos === "DEF"
      };
      allPlayersList.push(pid);
      playersPointsMap[pid] = pts;
      if (isEspnStarter(e.lineupSlotId)) {
        startersList.push(pid);
        startersPoints.push(pts);
        startersTotal += pts;
      } else {
        benchPoints += pts;
        if (pts > highestBenchScore) highestBenchScore = pts;
      }
    });
    try {
      localStorage.setItem("crossleague_espn_players_v1", JSON.stringify(state.espnPlayersDb));
    } catch {
    }
    const sortedScores = Object.values(playersPointsMap).sort((a, b) => b - a);
    const starterCount = Math.max(1, startersList.length);
    const optimalPoints = Math.max(
      startersTotal,
      sortedScores.slice(0, starterCount).reduce((a, b) => a + b, 0)
    );
    return {
      startersList,
      allPlayersList,
      playersPointsMap,
      startersPoints,
      startersTotal: Math.round(startersTotal * 100) / 100,
      benchPoints: Math.round(benchPoints * 100) / 100,
      optimalPoints: Math.round(optimalPoints * 100) / 100,
      highestBenchScore: Math.round(highestBenchScore * 100) / 100
    };
  }
  async function fetchEspnLeague(rawId, season, targetWeek, mode) {
    const cleanId = String(rawId).replace(/^espn:/i, "").trim();
    const sNum = parseInt(season, 10) || 2024;
    const viewParams = "view=mTeam&view=mRoster&view=mMatchup&view=mMatchupScore&view=mSettings&view=mBoxscore&view=mMembers";
    const path = mode === "SEASON_ROLLUP" ? `/apis/v3/games/ffl/seasons/${sNum}/segments/0/leagues/${cleanId}?${viewParams}` : `/apis/v3/games/ffl/seasons/${sNum}/segments/0/leagues/${cleanId}?scoringPeriodId=${targetWeek}&${viewParams}`;
    let rawData;
    try {
      rawData = await fetchEspnApi(path);
    } catch (primaryErr) {
      if (primaryErr.message.includes("not found")) {
        try {
          const histPath = mode === "SEASON_ROLLUP" ? `/apis/v3/games/ffl/leagueHistory/${cleanId}?seasonId=${sNum}&${viewParams}` : `/apis/v3/games/ffl/leagueHistory/${cleanId}?seasonId=${sNum}&scoringPeriodId=${targetWeek}&${viewParams}`;
          rawData = await fetchEspnApi(histPath);
        } catch {
          throw primaryErr;
        }
      } else {
        throw primaryErr;
      }
    }
    const leagueObj = Array.isArray(rawData) ? rawData[0] : rawData;
    if (!leagueObj || !leagueObj.teams && !leagueObj.settings) {
      throw new Error(`Invalid ESPN League data returned for ID ${cleanId}`);
    }
    const lid = `espn:${cleanId}`;
    const lname = leagueObj.settings && leagueObj.settings.name || `ESPN League ${cleanId}`;
    const lavatar = null;
    const rosterCount = leagueObj.settings && leagueObj.settings.size || leagueObj.teams && leagueObj.teams.length || 10;
    const memberMap = {};
    (leagueObj.members || []).forEach((m) => {
      memberMap[m.id] = m.displayName || m.firstName || "Manager";
    });
    const teamMap = {};
    const teamRosters = {};
    (leagueObj.teams || []).forEach((t) => {
      const ownerId = t.owners && t.owners[0] || "";
      const mgr = memberMap[ownerId] || `Manager ${t.id}`;
      const tName = t.name || (t.location ? `${t.location} ${t.nickname || ""}`.trim() : `Team ${t.id}`);
      teamMap[t.id] = {
        id: t.id,
        teamName: tName,
        manager: mgr,
        logo: t.logo || null
      };
      if (t.roster) teamRosters[t.id] = t.roster;
    });
    const schedule = leagueObj.schedule || [];
    if (mode === "SEASON_ROLLUP") {
      const teamRollups = {};
      (leagueObj.teams || []).forEach((t) => {
        const tInfo = teamMap[t.id];
        teamRollups[t.id] = {
          id: `${lid}-${t.id}`,
          leagueId: lid,
          league: lname,
          leagueAvatar: lavatar,
          manager: tInfo.manager,
          teamName: tInfo.teamName,
          avatar: tInfo.logo,
          platform: "espn",
          weeklyScores: [],
          weeklyPlayerRecords: [],
          totalPoints: 0,
          totalBenchPoints: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          allPlayWins: 0,
          allPlayLosses: 0,
          allPlayTies: 0,
          expectedWins: 0,
          opponentPointsTotal: 0,
          efficiencies: []
        };
      });
      const weeksToFetch = [];
      for (let w = 1; w <= targetWeek; w++) weeksToFetch.push(w);
      const weeklyBoxscoreList = await Promise.all(
        weeksToFetch.map(
          (w) => fetchEspnApi(
            `/apis/v3/games/ffl/seasons/${sNum}/segments/0/leagues/${cleanId}?scoringPeriodId=${w}&view=mMatchup&view=mMatchupScore&view=mBoxscore&view=mRoster&view=mTeam`
          ).catch(() => null)
        )
      );
      for (let w = 1; w <= targetWeek; w++) {
        const wLeagueObj = Array.isArray(weeklyBoxscoreList[w - 1]) ? weeklyBoxscoreList[w - 1][0] : weeklyBoxscoreList[w - 1];
        const wTeamRosters = {};
        (wLeagueObj && wLeagueObj.teams || []).forEach((t) => {
          if (t.roster) wTeamRosters[t.id] = t.roster;
        });
        const wSchedule = wLeagueObj && wLeagueObj.schedule || schedule;
        const weekGames2 = wSchedule.filter((s) => s.matchupPeriodId === w);
        if (weekGames2.length === 0) continue;
        const weekRecords2 = [];
        weekGames2.forEach((m) => {
          if (!m.home || !teamRollups[m.home.teamId]) return;
          const homeId = m.home.teamId;
          const awayId = m.away ? m.away.teamId : null;
          const homeRoster = wTeamRosters[homeId] || teamRosters[homeId] || m.home && (m.home.rosterForMatchupPeriod || m.home.rosterForCurrentScoringPeriod || m.home.rosterForMatchupPeriodDelayed || m.home.roster) || null;
          const homeParsed = parseRosterEntries(homeRoster, w);
          const homePts = Math.round(
            parseFloat(
              m.home.totalPoints !== void 0 && m.home.totalPoints !== null ? m.home.totalPoints : homeParsed.startersTotal || 0
            ) * 100
          ) / 100;
          const awayRoster = m.away && (wTeamRosters[awayId] || teamRosters[awayId] || m.away.rosterForMatchupPeriod || m.away.rosterForCurrentScoringPeriod || m.away.rosterForMatchupPeriodDelayed || m.away.roster) || null;
          const awayParsed = parseRosterEntries(awayRoster, w);
          const awayPts = awayId && m.away ? Math.round(
            parseFloat(
              m.away.totalPoints !== void 0 && m.away.totalPoints !== null ? m.away.totalPoints : awayParsed.startersTotal || 0
            ) * 100
          ) / 100 : 0;
          const homeRec = {
            teamId: homeId,
            points: homePts,
            parsed: homeParsed,
            opponentPoints: awayPts,
            outcome: "unpaired"
          };
          weekRecords2.push(homeRec);
          if (awayId && teamRollups[awayId] && m.away) {
            const awayRec = {
              teamId: awayId,
              points: awayPts,
              parsed: awayParsed,
              opponentPoints: homePts,
              outcome: "unpaired"
            };
            weekRecords2.push(awayRec);
            if (homePts === 0 && awayPts === 0) {
              homeRec.outcome = "unplayed";
              awayRec.outcome = "unplayed";
            } else if (homePts > awayPts) {
              homeRec.outcome = "win";
              awayRec.outcome = "loss";
            } else if (homePts < awayPts) {
              homeRec.outcome = "loss";
              awayRec.outcome = "win";
            } else {
              homeRec.outcome = "tie";
              awayRec.outcome = "tie";
            }
          }
        });
        const activeSquads2 = weekRecords2.filter((r) => r.points > 0 && r.outcome !== "unplayed");
        weekRecords2.forEach((r) => {
          let apW = 0, apL = 0, apT = 0;
          activeSquads2.forEach((other) => {
            if (other.teamId === r.teamId) return;
            if (r.points > other.points) apW++;
            else if (r.points < other.points) apL++;
            else apT++;
          });
          const otherCount = activeSquads2.length - 1;
          const xw = otherCount > 0 ? (apW + 0.5 * apT) / otherCount : 0;
          const t = teamRollups[r.teamId];
          if (t && (r.points > 0 || r.parsed.startersTotal > 0)) {
            t.weeklyScores.push(r.points);
            t.weeklyPlayerRecords.push({
              week: w,
              startersList: r.parsed.startersList,
              allPlayersList: r.parsed.allPlayersList,
              playersPointsMap: r.parsed.playersPointsMap
            });
            t.totalPoints += r.points;
            t.totalBenchPoints += r.parsed.benchPoints;
            const eff = r.points > 0 && r.parsed.optimalPoints > 0 ? Math.min(100, Math.round(r.points / r.parsed.optimalPoints * 100)) : 100;
            t.efficiencies.push(eff);
            if (r.outcome === "win") t.wins++;
            else if (r.outcome === "loss") t.losses++;
            else if (r.outcome === "tie") t.ties++;
            t.allPlayWins += apW;
            t.allPlayLosses += apL;
            t.allPlayTies += apT;
            t.expectedWins += xw;
            t.opponentPointsTotal += r.opponentPoints;
          }
        });
      }
      const records = Object.values(teamRollups).map((t) => {
        const weeksCount = t.weeklyScores.length || 1;
        const avgPts = Math.round(t.totalPoints / weeksCount * 100) / 100;
        const roundedTotal = Math.round(t.totalPoints * 100) / 100;
        const stdDev = calculateStdDev(t.weeklyScores);
        const highScore = t.weeklyScores.length > 0 ? Math.max(...t.weeklyScores) : 0;
        const lowScore = t.weeklyScores.length > 0 ? Math.min(...t.weeklyScores) : 0;
        const avgEff = t.efficiencies.length > 0 ? Math.round(t.efficiencies.reduce((a, b) => a + b, 0) / t.efficiencies.length) : 100;
        const totalAp = t.allPlayWins + t.allPlayLosses + t.allPlayTies;
        const apWinPct = totalAp > 0 ? Math.round((t.allPlayWins + 0.5 * t.allPlayTies) / totalAp * 100) : 0;
        const actWins = t.wins + 0.5 * t.ties;
        const expWins = Math.round(t.expectedWins * 100) / 100;
        const seasonLuck = Math.round((actWins - expWins) * 100) / 100;
        const avgPa = weeksCount > 0 ? Math.round(t.opponentPointsTotal / weeksCount * 100) / 100 : 0;
        return {
          id: t.id,
          leagueId: t.leagueId,
          league: t.league,
          leagueAvatar: t.leagueAvatar,
          manager: t.manager,
          teamName: t.teamName,
          avatar: t.avatar,
          platform: "espn",
          points: avgPts,
          totalPoints: roundedTotal,
          avgPoints: avgPts,
          weeksCount,
          stdDev,
          highScore,
          lowScore,
          wins: t.wins,
          losses: t.losses,
          ties: t.ties,
          winPct: t.wins + t.losses + t.ties > 0 ? Math.round(t.wins / (t.wins + t.losses + t.ties) * 100) : 0,
          allPlayWins: t.allPlayWins,
          allPlayLosses: t.allPlayLosses,
          allPlayTies: t.allPlayTies,
          allPlayWinPct: apWinPct,
          expectedWins: expWins,
          actualWins: actWins,
          luckIndex: seasonLuck,
          pointsAgainst: avgPa,
          totalPointsAgainst: Math.round(t.opponentPointsTotal * 100) / 100,
          benchPoints: Math.round(t.totalBenchPoints / weeksCount * 100) / 100,
          efficiency: avgEff,
          startersTotal: avgPts,
          weeklyScores: t.weeklyScores,
          weeklyPlayerRecords: t.weeklyPlayerRecords
        };
      });
      return {
        leagueInfo: {
          league_id: lid,
          name: lname,
          avatar: lavatar,
          total_rosters: rosterCount,
          platform: "espn"
        },
        records
      };
    }
    const weekGames = schedule.filter((s) => s.matchupPeriodId === targetWeek);
    const weekRecords = [];
    weekGames.forEach((m) => {
      if (!m.home) return;
      const homeT = teamMap[m.home.teamId] || {
        teamName: `Team ${m.home.teamId}`,
        manager: "Manager",
        logo: null
      };
      const awayT = m.away ? teamMap[m.away.teamId] || {
        teamName: `Team ${m.away.teamId}`,
        manager: "Manager",
        logo: null
      } : null;
      const homeRoster = teamRosters[m.home.teamId] || m.home && (m.home.rosterForMatchupPeriod || m.home.rosterForCurrentScoringPeriod || m.home.rosterForMatchupPeriodDelayed || m.home.roster) || null;
      const homeParsed = parseRosterEntries(homeRoster, targetWeek);
      const homePts = Math.round(
        parseFloat(
          m.home.totalPoints !== void 0 && m.home.totalPoints !== null ? m.home.totalPoints : homeParsed.startersTotal || 0
        ) * 100
      ) / 100;
      const awayRoster = m.away && (teamRosters[m.away.teamId] || m.away.rosterForMatchupPeriod || m.away.rosterForCurrentScoringPeriod || m.away.rosterForMatchupPeriodDelayed || m.away.roster) || null;
      const awayParsed = parseRosterEntries(awayRoster, targetWeek);
      const awayPts = awayT && m.away ? Math.round(
        parseFloat(
          m.away.totalPoints !== void 0 && m.away.totalPoints !== null ? m.away.totalPoints : awayParsed.startersTotal || 0
        ) * 100
      ) / 100 : 0;
      const eff = homePts > 0 && homeParsed.optimalPoints > 0 ? Math.min(100, Math.round(homePts / homeParsed.optimalPoints * 100)) : 100;
      const homeRec = {
        id: `${lid}-${m.home.teamId}`,
        week: targetWeek,
        points: homePts,
        manager: homeT.manager,
        teamName: homeT.teamName,
        league: lname,
        leagueId: lid,
        leagueAvatar: lavatar,
        ownerId: String(m.home.teamId),
        avatar: homeT.logo,
        platform: "espn",
        matchupId: m.id || m.home.teamId,
        startersCount: homeParsed.startersList.length,
        startersList: homeParsed.startersList,
        allPlayersList: homeParsed.allPlayersList,
        playersPointsMap: homeParsed.playersPointsMap,
        startersPoints: homeParsed.startersPoints,
        benchPoints: homeParsed.benchPoints,
        startersTotal: homeParsed.startersTotal,
        optimalPoints: homeParsed.optimalPoints,
        efficiency: eff,
        highestBenchScore: homeParsed.highestBenchScore,
        outcome: "unpaired",
        opponentName: awayT ? awayT.manager : "Bye Week",
        opponentTeam: awayT ? awayT.teamName : "Bye",
        opponentPoints: awayPts,
        margin: Math.round((homePts - awayPts) * 100) / 100
      };
      weekRecords.push(homeRec);
      if (awayT && m.away) {
        const awayEff = awayPts > 0 && awayParsed.optimalPoints > 0 ? Math.min(100, Math.round(awayPts / awayParsed.optimalPoints * 100)) : 100;
        const awayRec = {
          id: `${lid}-${m.away.teamId}`,
          week: targetWeek,
          points: awayPts,
          manager: awayT.manager,
          teamName: awayT.teamName,
          league: lname,
          leagueId: lid,
          leagueAvatar: lavatar,
          ownerId: String(m.away.teamId),
          avatar: awayT.logo,
          platform: "espn",
          matchupId: m.id || m.home.teamId,
          startersCount: awayParsed.startersList.length,
          startersList: awayParsed.startersList,
          allPlayersList: awayParsed.allPlayersList,
          playersPointsMap: awayParsed.playersPointsMap,
          startersPoints: awayParsed.startersPoints,
          benchPoints: awayParsed.benchPoints,
          startersTotal: awayParsed.startersTotal,
          optimalPoints: awayParsed.optimalPoints,
          efficiency: awayEff,
          highestBenchScore: awayParsed.highestBenchScore,
          outcome: "unpaired",
          opponentName: homeT.manager,
          opponentTeam: homeT.teamName,
          opponentPoints: homePts,
          margin: Math.round((awayPts - homePts) * 100) / 100
        };
        weekRecords.push(awayRec);
        if (homePts === 0 && awayPts === 0) {
          homeRec.outcome = "unplayed";
          awayRec.outcome = "unplayed";
        } else if (homePts > awayPts) {
          homeRec.outcome = "win";
          awayRec.outcome = "loss";
        } else if (homePts < awayPts) {
          homeRec.outcome = "loss";
          awayRec.outcome = "win";
        } else {
          homeRec.outcome = "tie";
          awayRec.outcome = "tie";
        }
      }
    });
    const activeSquads = weekRecords.filter(
      (r) => (r.points > 0 || r.startersTotal > 0) && r.outcome !== "unplayed"
    );
    const totalInLeague = activeSquads.length;
    weekRecords.forEach((t) => {
      if (t.outcome === "unplayed" || totalInLeague <= 1) {
        t.allPlayWins = 0;
        t.allPlayLosses = 0;
        t.allPlayTies = 0;
        t.allPlayWinPct = 0;
        t.expectedWins = 0;
        t.actualWins = 0;
        t.luckIndex = 0;
        t.pointsAgainst = typeof t.opponentPoints === "number" ? t.opponentPoints : 0;
        return;
      }
      let apWins = 0, apLosses = 0, apTies = 0;
      activeSquads.forEach((other) => {
        if (other.id === t.id) return;
        if (t.points > other.points) apWins++;
        else if (t.points < other.points) apLosses++;
        else apTies++;
      });
      const otherCount = totalInLeague - 1;
      const apWinPct = otherCount > 0 ? (apWins + 0.5 * apTies) / otherCount : 0;
      const expWins = Math.round(apWinPct * 100) / 100;
      const actWin = t.outcome === "win" ? 1 : t.outcome === "tie" ? 0.5 : 0;
      const luck = Math.round((actWin - expWins) * 100) / 100;
      t.allPlayWins = apWins;
      t.allPlayLosses = apLosses;
      t.allPlayTies = apTies;
      t.allPlayWinPct = Math.round(apWinPct * 100);
      t.expectedWins = expWins;
      t.actualWins = actWin;
      t.luckIndex = luck;
      t.pointsAgainst = typeof t.opponentPoints === "number" ? t.opponentPoints : 0;
    });
    return {
      leagueInfo: {
        league_id: lid,
        name: lname,
        avatar: lavatar,
        total_rosters: rosterCount,
        platform: "espn"
      },
      records: weekRecords
    };
  }

  // src/js/api/index.js
  init_players();

  // src/js/index.js
  init_dom();

  // src/js/components/toast.js
  init_dom();
  function showToast(message, icon = "\u2728") {
    const toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = "toast-enter glass-card bg-slate-900/95 border border-emerald-500/40 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur pointer-events-auto";
    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.add("toast-visible");
      toast.classList.remove("toast-enter");
    });
    setTimeout(() => {
      toast.classList.add("toast-exit");
      toast.classList.remove("toast-visible");
      setTimeout(() => toast.remove(), 300);
    }, 3e3);
  }

  // src/js/index.js
  init_modal();

  // src/js/components/pagination.js
  function renderPaginationButtons(containerId, totalPages, curPage, onPageClickFnName) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    if (totalPages <= 1) return;
    const createBtn = (pageNum) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = String(pageNum);
      btn.onclick = () => {
        if (typeof window[onPageClickFnName] === "function") {
          window[onPageClickFnName](pageNum);
        }
      };
      if (pageNum === curPage) {
        btn.className = "w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-xs cursor-pointer shadow-sm transition flex items-center justify-center";
        btn.setAttribute("aria-current", "page");
      } else {
        btn.className = "w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 font-bold text-xs cursor-pointer transition flex items-center justify-center";
      }
      return btn;
    };
    const createEllipsis = () => {
      const span = document.createElement("span");
      span.className = "px-1 text-slate-500 font-bold text-xs select-none";
      span.textContent = "\u2026";
      return span;
    };
    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (curPage <= 4) {
        pages = [1, 2, 3, 4, 5, "...", totalPages];
      } else if (curPage >= totalPages - 3) {
        pages = [
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        ];
      } else {
        pages = [1, "...", curPage - 1, curPage, curPage + 1, "...", totalPages];
      }
    }
    pages.forEach((p) => {
      if (p === "...") {
        container.appendChild(createEllipsis());
      } else {
        container.appendChild(createBtn(p));
      }
    });
  }

  // src/js/index.js
  init_dropdowns();
  init_tabs();

  // src/js/components/podium.js
  init_store();
  init_sleeper();
  init_dom();
  function renderPodium(records = getActiveRecords()) {
    const podiumCards = document.getElementById("podiumCards");
    if (!podiumCards) return;
    podiumCards.innerHTML = "";
    const isSeason = state.currentMode === "SEASON_ROLLUP";
    const sorted = [...records || []].sort((a, b) => (b.points || 0) - (a.points || 0));
    const top3 = sorted.slice(0, 3);
    const podiumSlots = [
      {
        rank: 1,
        title: "1ST PLACE",
        medal: "\u{1F947}",
        glow: "gold-glow",
        color: "text-amber-400",
        orderClass: "order-1 md:order-2",
        cardClass: "md:min-h-[260px] p-4 sm:p-6",
        scoreSize: "text-3xl sm:text-4xl"
      },
      {
        rank: 2,
        title: "2ND PLACE",
        medal: "\u{1F948}",
        glow: "silver-glow",
        color: "text-slate-300",
        orderClass: "order-2 md:order-1",
        cardClass: "md:min-h-[230px] p-4 sm:p-5",
        scoreSize: "text-2xl sm:text-3xl"
      },
      {
        rank: 3,
        title: "3RD PLACE",
        medal: "\u{1F949}",
        glow: "bronze-glow",
        color: "text-amber-600",
        orderClass: "order-3 md:order-3",
        cardClass: "md:min-h-[205px] p-4 sm:p-5",
        scoreSize: "text-2xl sm:text-3xl"
      }
    ];
    podiumSlots.forEach((slot) => {
      const t = top3[slot.rank - 1];
      if (!t) return;
      const card = document.createElement("div");
      card.className = `glass-card ${slot.glow} ${slot.orderClass} ${slot.cardClass} rounded-2xl flex flex-col justify-between relative`;
      const metricLabel = isSeason ? "Average PPG" : "Total Points";
      const effVal = typeof t.efficiency === "number" && !isNaN(t.efficiency) ? t.efficiency : 100;
      const subMetric = isSeason ? `${(t.totalPoints || 0).toFixed(1)} Total PF \u2022 ${t.wins || 0}W-${t.losses || 0}L` : `Lineup Efficiency: ${effVal}%`;
      const avatarUrl = getAvatarUrl(t.avatar);
      const avatarSize = slot.rank === 1 ? "w-10 sm:w-11 h-10 sm:h-11" : "w-9 sm:w-10 h-9 sm:h-10";
      const avatarHtml = avatarUrl ? `<img src="${avatarUrl}" class="${avatarSize} rounded-full object-cover border border-slate-700 flex-shrink-0" alt="" onerror="this.remove()">` : "";
      const titleComponent = createCardTitleWithInfo(
        slot.title,
        slot.rank === 1 ? isSeason ? "1st Place Champion with highest average points per game across all leagues." : "Weekly Cross-League Champion with highest score." : slot.rank === 2 ? "2nd Place Runner-Up across all participating leagues." : "3rd Place Podium Finisher across all participating leagues.",
        `text-xs font-black tracking-wider uppercase ${slot.color} hover:underline`
      );
      card.innerHTML = `
      <div>
        <div class="flex items-center justify-between">
          ${titleComponent}
          <span class="text-2xl">${slot.medal}</span>
        </div>
        <div class="mt-3 flex items-center gap-3">
          ${avatarHtml}
          <div class="min-w-0 flex-1">
            <div class="text-base sm:text-xl font-black text-white truncate" title="${escapeHtml(t.manager)}">
              ${escapeHtml(t.manager)}
            </div>
            <div class="text-xs sm:text-sm text-slate-400 font-medium truncate mt-0.5" title="${escapeHtml(t.teamName)}">
              ${escapeHtml(t.teamName)}
            </div>
            <div class="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1 mt-1" title="League: ${escapeHtml(t.league)}">
              <span>\u{1F3C6}</span> <span class="truncate">${escapeHtml(t.league)}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 sm:mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div class="min-w-0">
          <div class="text-[10px] sm:text-xs uppercase font-bold text-slate-400 truncate">${metricLabel}</div>
          <div class="${slot.scoreSize} font-black ${slot.color} font-mono leading-none mt-1">
            ${t.points.toFixed(2)}
          </div>
        </div>
        <div class="text-[11px] sm:text-xs font-semibold text-slate-400 text-right min-w-0">
          ${subMetric}
        </div>
      </div>
    `;
      podiumCards.appendChild(card);
    });
  }

  // src/js/components/superlatives.js
  init_store();
  init_dom();
  function renderSuperlatives(records = getActiveRecords()) {
    const badBeatCard = document.getElementById("badBeatCard");
    const luckyEscapeCard = document.getElementById("luckyEscapeCard");
    const benchMvpCard = document.getElementById("benchMvpCard");
    if (!badBeatCard || !luckyEscapeCard || !benchMvpCard) return;
    if (!records || records.length === 0) return;
    const isSeason = state.currentMode === "SEASON_ROLLUP";
    if (badBeatCard.parentElement) {
      badBeatCard.parentElement.classList.remove("hidden");
    }
    const { badBeat, luckyEscape, benchKing } = computeSuperlatives(records, isSeason);
    if (badBeatCard) {
      badBeatCard.removeAttribute("title");
      if (!isSeason) {
        if (badBeat) {
          const titleComponent = createCardTitleWithInfo(
            "The Bad Beat \u{1F494}",
            "Highest-scoring squad across all leagues that lost their matchup this week.",
            "text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-500/30 hover:border-rose-400/70"
          );
          badBeatCard.innerHTML = `
          <div class="flex flex-col justify-between h-full space-y-3">
            <div>
              <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-rose-500/20">
                ${titleComponent}
                <div class="text-right flex-shrink-0">
                  <span class="text-lg sm:text-xl font-mono font-black text-rose-400">${badBeat.points.toFixed(2)} <span class="text-xs font-semibold text-rose-300/80">pts</span></span>
                </div>
              </div>
              <div class="mt-3 space-y-1">
                <div class="text-base sm:text-lg font-black text-white truncate" title="${escapeHtml(badBeat.manager)}">${escapeHtml(badBeat.manager)}</div>
                <div class="text-xs sm:text-sm text-slate-400 truncate" title="${escapeHtml(badBeat.teamName)}">${escapeHtml(badBeat.teamName)}</div>
                <div class="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1.5 pt-0.5" title="League: ${escapeHtml(badBeat.league)}">
                  <span class="text-xs flex-shrink-0">\u{1F3C6}</span>
                  <span class="truncate">${escapeHtml(badBeat.league)}</span>
                </div>
              </div>
            </div>
            <div class="pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 font-semibold truncate">
              Lost by ${Math.abs(badBeat.margin || 0).toFixed(2)} to ${escapeHtml(badBeat.opponentName || "Rival")}
            </div>
          </div>
        `;
        } else {
          const titleComponent = createCardTitleWithInfo(
            "The Bad Beat \u{1F494}",
            "Highest-scoring squad across all leagues that lost their matchup this week.",
            "text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700"
          );
          badBeatCard.innerHTML = `
          <div class="flex items-center justify-between">
            ${titleComponent}
          </div>
          <div class="text-xs sm:text-sm text-slate-500 italic mt-3">No completed matchup losses recorded.</div>
        `;
        }
      } else {
        if (badBeat) {
          const titleComponent = createCardTitleWithInfo(
            "Season Heartbreak \u{1F494}",
            "Highest scoring team across all leagues with a losing head-to-head record.",
            "text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-500/30 hover:border-rose-400/70"
          );
          badBeatCard.innerHTML = `
          <div class="flex flex-col justify-between h-full space-y-3">
            <div>
              <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-rose-500/20">
                ${titleComponent}
                <div class="text-right flex-shrink-0">
                  <span class="text-lg sm:text-xl font-mono font-black text-rose-400">${(badBeat.points || 0).toFixed(1)} <span class="text-xs font-semibold text-rose-300/80">PPG</span></span>
                </div>
              </div>
              <div class="mt-3 space-y-1">
                <div class="text-base sm:text-lg font-black text-white truncate" title="${escapeHtml(badBeat.manager)}">${escapeHtml(badBeat.manager)}</div>
                <div class="text-xs sm:text-sm text-slate-400 truncate" title="${escapeHtml(badBeat.teamName)}">${escapeHtml(badBeat.teamName)}</div>
                <div class="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1.5 pt-0.5" title="League: ${escapeHtml(badBeat.league)}">
                  <span class="text-xs flex-shrink-0">\u{1F3C6}</span>
                  <span class="truncate">${escapeHtml(badBeat.league)}</span>
                </div>
              </div>
            </div>
            <div class="pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 font-semibold truncate">
              ${badBeat.wins || 0}W-${badBeat.losses || 0}L (${badBeat.winPct || 0}%) \u2022 ${(badBeat.totalPoints || 0).toFixed(1)} Total PF
            </div>
          </div>
        `;
        }
      }
    }
    if (luckyEscapeCard) {
      luckyEscapeCard.removeAttribute("title");
      if (!isSeason) {
        if (luckyEscape) {
          const titleComponent = createCardTitleWithInfo(
            "The Lucky Escape \u{1FA84}",
            "Lowest-scoring squad across all leagues that managed to win their matchup this week.",
            "text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 hover:border-emerald-400/70"
          );
          luckyEscapeCard.innerHTML = `
          <div class="flex flex-col justify-between h-full space-y-3">
            <div>
              <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-emerald-500/20">
                ${titleComponent}
                <div class="text-right flex-shrink-0">
                  <span class="text-lg sm:text-xl font-mono font-black text-emerald-400">${luckyEscape.points.toFixed(2)} <span class="text-xs font-semibold text-emerald-300/80">pts</span></span>
                </div>
              </div>
              <div class="mt-3 space-y-1">
                <div class="text-base sm:text-lg font-black text-white truncate" title="${escapeHtml(luckyEscape.manager)}">${escapeHtml(luckyEscape.manager)}</div>
                <div class="text-xs sm:text-sm text-slate-400 truncate" title="${escapeHtml(luckyEscape.teamName)}">${escapeHtml(luckyEscape.teamName)}</div>
                <div class="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1.5 pt-0.5" title="League: ${escapeHtml(luckyEscape.league)}">
                  <span class="text-xs flex-shrink-0">\u{1F3C6}</span>
                  <span class="truncate">${escapeHtml(luckyEscape.league)}</span>
                </div>
              </div>
            </div>
            <div class="pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 font-semibold truncate">
              Won by ${Math.abs(luckyEscape.margin || 0).toFixed(2)} vs ${escapeHtml(luckyEscape.opponentName || "Rival")}
            </div>
          </div>
        `;
        } else {
          const titleComponent = createCardTitleWithInfo(
            "The Lucky Escape \u{1FA84}",
            "Lowest-scoring squad across all leagues that managed to win their matchup this week.",
            "text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700"
          );
          luckyEscapeCard.innerHTML = `
          <div class="flex items-center justify-between">
            ${titleComponent}
          </div>
          <div class="text-xs sm:text-sm text-slate-500 italic mt-3">No completed matchup wins recorded.</div>
        `;
        }
      } else {
        if (luckyEscape) {
          const titleComponent = createCardTitleWithInfo(
            "Teflon Squad \u{1FA84}",
            "Lowest scoring squad across all leagues that maintained a winning record.",
            "text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 hover:border-emerald-400/70"
          );
          luckyEscapeCard.innerHTML = `
          <div class="flex flex-col justify-between h-full space-y-3">
            <div>
              <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-emerald-500/20">
                ${titleComponent}
                <div class="text-right flex-shrink-0">
                  <span class="text-lg sm:text-xl font-mono font-black text-emerald-400">${(luckyEscape.points || 0).toFixed(1)} <span class="text-xs font-semibold text-emerald-300/80">PPG</span></span>
                </div>
              </div>
              <div class="mt-3 space-y-1">
                <div class="text-base sm:text-lg font-black text-white truncate" title="${escapeHtml(luckyEscape.manager)}">${escapeHtml(luckyEscape.manager)}</div>
                <div class="text-xs sm:text-sm text-slate-400 truncate" title="${escapeHtml(luckyEscape.teamName)}">${escapeHtml(luckyEscape.teamName)}</div>
                <div class="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1.5 pt-0.5" title="League: ${escapeHtml(luckyEscape.league)}">
                  <span class="text-xs flex-shrink-0">\u{1F3C6}</span>
                  <span class="truncate">${escapeHtml(luckyEscape.league)}</span>
                </div>
              </div>
            </div>
            <div class="pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 font-semibold truncate">
              ${luckyEscape.wins || 0}W-${luckyEscape.losses || 0}L (${luckyEscape.winPct || 0}%)
            </div>
          </div>
        `;
        }
      }
    }
    if (benchMvpCard) {
      benchMvpCard.removeAttribute("title");
      if (benchKing && benchKing.benchPoints > 0) {
        const titleComponent = createCardTitleWithInfo(
          "Bench Heavyweight \u{1FA91}",
          "Squad with the most bench points left unstarted on their roster.",
          "text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/30 hover:border-amber-400/70"
        );
        benchMvpCard.innerHTML = `
        <div class="flex flex-col justify-between h-full space-y-3">
          <div>
            <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-amber-500/20">
              ${titleComponent}
              <div class="text-right flex-shrink-0">
                <span class="text-lg sm:text-xl font-mono font-black text-amber-300">${benchKing.benchPoints.toFixed(2)} <span class="text-xs font-semibold text-amber-300/80">pts</span></span>
              </div>
            </div>
            <div class="mt-3 space-y-1">
              <div class="text-base sm:text-lg font-black text-white truncate" title="${escapeHtml(benchKing.manager)}">${escapeHtml(benchKing.manager)}</div>
              <div class="text-xs sm:text-sm text-slate-400 truncate" title="${escapeHtml(benchKing.teamName)}">${escapeHtml(benchKing.teamName)}</div>
              <div class="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1.5 pt-0.5" title="League: ${escapeHtml(benchKing.league)}">
                <span class="text-xs flex-shrink-0">\u{1F3C6}</span>
                <span class="truncate">${escapeHtml(benchKing.league)}</span>
              </div>
            </div>
          </div>
          <div class="pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 font-semibold truncate">
            ${benchKing.efficiency ?? 100}% Lineup Efficiency
          </div>
        </div>
      `;
      } else {
        const titleComponent = createCardTitleWithInfo(
          "Bench Heavyweight \u{1FA91}",
          "Squad with the most bench points left unstarted on their roster.",
          "text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700"
        );
        benchMvpCard.innerHTML = `
        <div class="flex items-center justify-between">
          ${titleComponent}
        </div>
        <div class="text-xs sm:text-sm text-slate-500 italic mt-3">No bench scoring recorded yet.</div>
      `;
      }
    }
  }

  // src/js/components/cards.js
  init_store();
  init_dom();
  function renderSummaryCards(records = getActiveRecords(), activeLeagues = getActiveLeaguesMap()) {
    const totalSquads = records.length;
    const totalActiveLeagues = Object.keys(activeLeagues || {}).length;
    const elLeagues = document.getElementById("statTotalLeagues");
    if (elLeagues) elLeagues.textContent = totalActiveLeagues;
    const elTeams = document.getElementById("statTotalTeams");
    if (elTeams) elTeams.textContent = totalSquads;
    if (totalSquads === 0) {
      if (document.getElementById("statHighScore"))
        document.getElementById("statHighScore").textContent = "0.00";
      if (document.getElementById("statHighTeam"))
        document.getElementById("statHighTeam").textContent = "-";
      if (document.getElementById("statLowScore"))
        document.getElementById("statLowScore").textContent = "0.00";
      if (document.getElementById("statLowTeam"))
        document.getElementById("statLowTeam").textContent = "-";
      if (document.getElementById("statAvgScore"))
        document.getElementById("statAvgScore").textContent = "0.00";
      if (document.getElementById("statMedianScore"))
        document.getElementById("statMedianScore").textContent = "Median: 0.00";
      if (document.getElementById("statTopLeagueAvg"))
        document.getElementById("statTopLeagueAvg").textContent = "0.00";
      if (document.getElementById("statTopLeagueName"))
        document.getElementById("statTopLeagueName").textContent = "-";
      return;
    }
    const sortedByPts = [...records].sort((a, b) => (b.points || 0) - (a.points || 0));
    const topOverall = sortedByPts[0];
    const lowestOverall = sortedByPts[sortedByPts.length - 1];
    if (document.getElementById("statHighScore")) {
      document.getElementById("statHighScore").textContent = topOverall ? topOverall.points.toFixed(2) : "0.00";
    }
    if (document.getElementById("statHighTeam")) {
      document.getElementById("statHighTeam").textContent = topOverall ? `${topOverall.manager} - ${topOverall.teamName}` : "-";
      document.getElementById("statHighTeam").title = topOverall ? `${topOverall.manager} (${topOverall.teamName})` : "";
    }
    if (document.getElementById("statHighLeague")) {
      document.getElementById("statHighLeague").innerHTML = topOverall ? `<span>\u{1F3C6}</span> <span class="truncate">${escapeHtml(topOverall.league)}</span>` : "-";
      document.getElementById("statHighLeague").title = topOverall ? `League: ${topOverall.league}` : "";
    }
    if (document.getElementById("statLowScore")) {
      document.getElementById("statLowScore").textContent = lowestOverall ? lowestOverall.points.toFixed(2) : "0.00";
    }
    if (document.getElementById("statLowTeam")) {
      document.getElementById("statLowTeam").textContent = lowestOverall ? `${lowestOverall.manager} - ${lowestOverall.teamName}` : "-";
      document.getElementById("statLowTeam").title = lowestOverall ? `${lowestOverall.manager} (${lowestOverall.teamName})` : "";
    }
    if (document.getElementById("statLowLeague")) {
      document.getElementById("statLowLeague").innerHTML = lowestOverall ? `<span>\u{1F3C6}</span> <span class="truncate">${escapeHtml(lowestOverall.league)}</span>` : "-";
      document.getElementById("statLowLeague").title = lowestOverall ? `League: ${lowestOverall.league}` : "";
    }
    const sumPts = records.reduce((acc, r) => acc + (r.points || 0), 0);
    const avgPts = sumPts / totalSquads;
    if (document.getElementById("statAvgScore")) {
      document.getElementById("statAvgScore").textContent = avgPts.toFixed(2);
    }
    const mid = Math.floor(sortedByPts.length / 2);
    const medianPts = sortedByPts.length % 2 !== 0 ? sortedByPts[mid].points : ((sortedByPts[mid - 1]?.points || 0) + (sortedByPts[mid]?.points || 0)) / 2;
    if (document.getElementById("statMedianScore")) {
      document.getElementById("statMedianScore").textContent = `Median: ${medianPts.toFixed(2)} pts`;
    }
    let topLeagueAvg = 0;
    let topLeagueName = "-";
    const leagues = activeLeagues || getActiveLeaguesMap();
    Object.keys(leagues).forEach((lid) => {
      const leagueTeams = records.filter((r) => r.leagueId === lid);
      if (leagueTeams.length > 0) {
        const lSum = leagueTeams.reduce((a, b) => a + (b.points || 0), 0);
        const lAvg = lSum / leagueTeams.length;
        if (lAvg > topLeagueAvg) {
          topLeagueAvg = lAvg;
          topLeagueName = leagues[lid].name || `League ${lid}`;
        }
      }
    });
    if (document.getElementById("statTopLeagueAvg")) {
      document.getElementById("statTopLeagueAvg").textContent = topLeagueAvg > 0 ? topLeagueAvg.toFixed(2) : "0.00";
    }
    if (document.getElementById("statTopLeagueName")) {
      document.getElementById("statTopLeagueName").innerHTML = topLeagueAvg > 0 ? `<span>\u{1F3C6}</span> <span class="truncate">${escapeHtml(topLeagueName)}</span>` : "-";
      document.getElementById("statTopLeagueName").title = topLeagueAvg > 0 ? topLeagueName : "";
    }
  }

  // src/js/components/table.js
  init_store();
  init_sleeper();
  init_dom();
  function renderTable(activeRecords = getActiveRecords()) {
    const rowCount = document.getElementById("rowCount");
    const tableBody = document.getElementById("tableBody");
    const noResultsFound = document.getElementById("noResultsFound");
    if (!tableBody) return;
    const isSeason = state.currentMode === "SEASON_ROLLUP";
    if (!activeRecords || activeRecords.length === 0) {
      if (rowCount) rowCount.textContent = "Showing 0 squads";
      tableBody.innerHTML = "";
      if (noResultsFound) {
        noResultsFound.classList.remove("hidden");
        const msgTitle = noResultsFound.querySelector(".font-bold");
        const msgSub = noResultsFound.querySelector(".text-xs");
        if (state.selectedLeagueIds.size === 0) {
          if (msgTitle) msgTitle.textContent = "No leagues selected.";
          if (msgSub)
            msgSub.textContent = "Select one or more leagues in the filter bar above to display rankings.";
        } else {
          if (msgTitle) msgTitle.textContent = "Nothing on the board matching that search.";
          if (msgSub) msgSub.textContent = "Try clearing the keyword search or resetting filters.";
        }
      }
      const pageInfo2 = document.getElementById("mainPageInfoText");
      if (pageInfo2) pageInfo2.textContent = "Showing 0 of 0";
      const btnPrev2 = document.getElementById("btnPrevMainPage");
      const btnNext2 = document.getElementById("btnNextMainPage");
      if (btnPrev2) btnPrev2.disabled = true;
      if (btnNext2) btnNext2.disabled = true;
      const pageBtnContainer = document.getElementById("mainPageNumberButtons");
      if (pageBtnContainer) pageBtnContainer.innerHTML = "";
      return;
    }
    const sortedMaster = [...activeRecords].sort((a, b) => (b.points || 0) - (a.points || 0));
    const maxScore = sortedMaster[0] ? sortedMaster[0].points || 0 : 100;
    const masterWithRank = sortedMaster.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      percentOfMax: maxScore > 0 ? Math.round((item.points || 0) / maxScore * 100) : 0
    }));
    let filtered = masterWithRank.filter((item) => {
      const pts = item.points || 0;
      if (isSeason) {
        if (state.currentTierFilter === "BOOM" && pts < 130) return false;
        if (state.currentTierFilter === "SOLID" && (pts < 105 || pts >= 130)) return false;
        if (state.currentTierFilter === "COLD" && pts >= 105) return false;
      } else {
        if (state.currentTierFilter === "BOOM" && pts < 140) return false;
        if (state.currentTierFilter === "SOLID" && (pts < 100 || pts >= 140)) return false;
        if (state.currentTierFilter === "COLD" && pts >= 100) return false;
      }
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        return (item.manager || "").toLowerCase().includes(q) || (item.teamName || "").toLowerCase().includes(q) || (item.league || "").toLowerCase().includes(q);
      }
      return true;
    });
    filtered.sort((a, b) => {
      let valA, valB;
      if (state.currentSortColumn === "Rank") {
        valA = a.rank;
        valB = b.rank;
      } else if (state.currentSortColumn === "Points") {
        valA = a.points || 0;
        valB = b.points || 0;
      } else if (state.currentSortColumn === "Manager") {
        valA = (a.manager || "").toLowerCase();
        valB = (b.manager || "").toLowerCase();
      } else if (state.currentSortColumn === "Team") {
        valA = (a.teamName || "").toLowerCase();
        valB = (b.teamName || "").toLowerCase();
      } else if (state.currentSortColumn === "League") {
        valA = (a.league || "").toLowerCase();
        valB = (b.league || "").toLowerCase();
      } else if (state.currentSortColumn === "Record") {
        if (isSeason) {
          valA = typeof a.winPct === "number" ? a.winPct : 0;
          valB = typeof b.winPct === "number" ? b.winPct : 0;
        } else {
          valA = a.outcome === "win" ? 1e3 + (a.margin || 0) : a.outcome === "tie" ? 500 : a.margin || -1e3;
          valB = b.outcome === "win" ? 1e3 + (b.margin || 0) : b.outcome === "tie" ? 500 : b.margin || -1e3;
        }
      } else if (state.currentSortColumn === "Efficiency") {
        valA = typeof a.efficiency === "number" ? a.efficiency : 0;
        valB = typeof b.efficiency === "number" ? b.efficiency : 0;
      } else {
        valA = a.points || 0;
        valB = b.points || 0;
      }
      if (valA < valB) return state.currentSortAsc ? -1 : 1;
      if (valA > valB) return state.currentSortAsc ? 1 : -1;
      return 0;
    });
    ["Rank", "Points", "Manager", "Team", "League", "Record", "Efficiency"].forEach((col) => {
      const icon = document.getElementById(`sortIcon${col}`) || document.getElementById(`sortIcon-${col}`);
      if (icon) {
        if (state.currentSortColumn === col) {
          icon.textContent = state.currentSortAsc ? "\u25B2" : "\u25BC";
          icon.className = "text-xs text-emerald-400";
        } else {
          icon.textContent = "";
          icon.className = "text-xs text-slate-500";
        }
      }
    });
    if (rowCount) {
      rowCount.textContent = `Showing ${filtered.length} of ${activeRecords.length} squads across ${state.selectedLeagueIds.size} leagues`;
    }
    tableBody.innerHTML = "";
    if (filtered.length === 0) {
      if (noResultsFound) noResultsFound.classList.remove("hidden");
      const pageInfo2 = document.getElementById("mainPageInfoText");
      if (pageInfo2) pageInfo2.textContent = "Showing 0 of 0";
      const btnPrev2 = document.getElementById("btnPrevMainPage");
      const btnNext2 = document.getElementById("btnNextMainPage");
      if (btnPrev2) btnPrev2.disabled = true;
      if (btnNext2) btnNext2.disabled = true;
      const pageBtnContainer = document.getElementById("mainPageNumberButtons");
      if (pageBtnContainer) pageBtnContainer.innerHTML = "";
      return;
    }
    if (noResultsFound) noResultsFound.classList.add("hidden");
    const totalCount = filtered.length;
    const pageSize = state.currentMainPageSize === Infinity ? totalCount : state.currentMainPageSize;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    if (state.currentMainPage > totalPages) state.currentMainPage = totalPages;
    if (state.currentMainPage < 1) state.currentMainPage = 1;
    const startIdx = (state.currentMainPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalCount);
    const pageSlice = filtered.slice(startIdx, endIdx);
    const pageInfo = document.getElementById("mainPageInfoText");
    if (pageInfo)
      pageInfo.textContent = totalCount === 0 ? "Showing 0 of 0" : `Showing ${startIdx + 1}\u2013${endIdx} of ${totalCount}`;
    const btnPrev = document.getElementById("btnPrevMainPage");
    const btnNext = document.getElementById("btnNextMainPage");
    if (btnPrev) btnPrev.disabled = state.currentMainPage <= 1 || totalCount === 0;
    if (btnNext) btnNext.disabled = state.currentMainPage >= totalPages || totalCount === 0;
    renderPaginationButtons(
      "mainPageNumberButtons",
      totalPages,
      state.currentMainPage,
      "goToMainPage"
    );
    pageSlice.forEach((r) => {
      const tr = document.createElement("tr");
      const isExpanded = state.expandedRowIds.has(r.id);
      const avatarUrl = getAvatarUrl(r.avatar);
      tr.className = "transition-colors hover:bg-slate-800/60";
      let rankBadge = `<span class="font-black text-slate-400 font-mono text-xs sm:text-base">#${r.rank}</span>`;
      if (r.rank === 1)
        rankBadge = `<span class="inline-flex items-center gap-1 font-black text-amber-300 text-xs sm:text-base">\u{1F947} #1</span>`;
      else if (r.rank === 2)
        rankBadge = `<span class="inline-flex items-center gap-1 font-black text-slate-200 text-xs sm:text-base">\u{1F948} #2</span>`;
      else if (r.rank === 3)
        rankBadge = `<span class="inline-flex items-center gap-1 font-black text-amber-500 text-xs sm:text-base">\u{1F949} #3</span>`;
      let matchupPill = "";
      if (isSeason) {
        matchupPill = `
        <div class="text-center">
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-black ${r.winPct >= 60 ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : r.winPct >= 40 ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-rose-500/15 text-rose-300 border border-rose-500/30"}">
            ${r.wins || 0}W - ${r.losses || 0}L${(r.ties || 0) > 0 ? ` - ${r.ties}T` : ""}
          </span>
          <div class="text-[10px] sm:text-xs text-slate-400 font-mono mt-0.5">${r.winPct || 0}% Win</div>
        </div>
      `;
      } else {
        if (r.outcome === "win") {
          matchupPill = `
          <div class="text-center">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              \u{1F7E2} W (+${Math.abs(r.margin || 0).toFixed(1)})
            </span>
            <div class="text-[10px] sm:text-xs text-slate-400 truncate max-w-[110px] sm:max-w-[130px] mt-0.5 font-medium" title="vs ${escapeHtml(r.opponentName || "Opponent")}">
              vs ${escapeHtml(r.opponentName || "Opp")}
            </div>
          </div>
        `;
        } else if (r.outcome === "loss") {
          matchupPill = `
          <div class="text-center">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
              \u{1F534} L (-${Math.abs(r.margin || 0).toFixed(1)})
            </span>
            <div class="text-[10px] sm:text-xs text-slate-400 truncate max-w-[110px] sm:max-w-[130px] mt-0.5 font-medium" title="vs ${escapeHtml(r.opponentName || "Opponent")}">
              vs ${escapeHtml(r.opponentName || "Opp")}
            </div>
          </div>
        `;
        } else if (r.outcome === "tie") {
          matchupPill = `
          <div class="text-center">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-slate-800 text-slate-300 border border-slate-700">
              \u26AA TIE
            </span>
          </div>
        `;
        } else if (r.outcome === "unplayed") {
          matchupPill = `
          <div class="text-center">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60 truncate max-w-[110px] sm:max-w-[130px]" title="vs ${escapeHtml(r.opponentName || "Opponent")}">
              vs ${escapeHtml(r.opponentName || "Opp")}
            </span>
            <div class="text-[10px] sm:text-xs text-slate-500 font-mono mt-0.5">Upcoming</div>
          </div>
        `;
        } else {
          matchupPill = `<span class="text-slate-600 text-[10px] sm:text-xs">-</span>`;
        }
      }
      const effVal = typeof r.efficiency === "number" && !isNaN(r.efficiency) ? r.efficiency : 100;
      const benchPtsVal = typeof r.benchPoints === "number" && !isNaN(r.benchPoints) ? r.benchPoints : 0;
      const efficiencyBadge = `
      <div class="text-center">
        <span class="text-xs sm:text-sm font-mono font-black ${effVal >= 90 ? "text-emerald-400" : effVal >= 75 ? "text-slate-300" : "text-amber-400"}">
          ${effVal}%
        </span>
        <div class="text-[10px] sm:text-xs text-slate-400 font-medium">${benchPtsVal.toFixed(1)} benched</div>
      </div>
    `;
      const avatarHtml = avatarUrl ? `<img src="${avatarUrl}" class="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-700 flex-shrink-0" alt="" onerror="this.remove()">` : "";
      tr.innerHTML = `
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">${rankBadge}</td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
        <div class="space-y-0.5 sm:space-y-1">
          <div class="font-mono text-sm sm:text-lg font-black ${r.rank <= 3 ? "text-emerald-400" : "text-white"}">
            ${(r.points || 0).toFixed(2)} <span class="text-[10px] sm:text-xs font-semibold text-slate-400">${isSeason ? "ppg" : "pts"}</span>
          </div>
          <div class="w-24 sm:w-36 bg-slate-800/90 rounded-full h-1 sm:h-1.5 overflow-hidden">
            <div class="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full" style="width: ${r.percentOfMax}%"></div>
          </div>
        </div>
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
        <div class="flex items-center gap-2 sm:gap-3">
          ${avatarHtml}
          <div class="min-w-0">
            <span class="font-black text-xs sm:text-base text-slate-100 truncate block">
              ${escapeHtml(r.manager)}
            </span>
          </div>
        </div>
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-[11px] sm:text-sm text-slate-300 font-medium truncate max-w-[140px] sm:max-w-[180px]">
        ${escapeHtml(r.teamName)}
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 text-slate-300 font-medium">
        <div class="text-[11px] sm:text-sm font-bold text-slate-200 break-words leading-snug max-w-[200px] sm:max-w-[260px] flex items-center flex-wrap gap-1">
          <span>${escapeHtml(r.league)}</span>
          ${String(r.leagueId).startsWith("espn:") || r.platform === "espn" ? `<span class="badge-espn text-[9px] font-bold px-1.5 py-0.5 rounded">ESPN</span>` : `<span class="badge-sleeper text-[9px] font-bold px-1.5 py-0.5 rounded">Sleeper</span>`}
        </div>
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 text-center whitespace-nowrap">
        ${matchupPill}
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 text-center whitespace-nowrap">
        ${efficiencyBadge}
      </td>

      <td class="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center whitespace-nowrap">
        <button
          onclick="toggleRowExpand('${r.id}')"
          class="p-1.5 sm:p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition text-[10px] sm:text-xs font-mono font-bold border border-slate-800 cursor-pointer"
          title="Toggle Details"
        >
          ${isExpanded ? "\u25B2" : "\u25BC"}
        </button>
      </td>
    `;
      tableBody.appendChild(tr);
      if (isExpanded) {
        const detailTr = document.createElement("tr");
        detailTr.className = "bg-slate-950/90 border-b border-slate-800";
        if (isSeason) {
          detailTr.innerHTML = `
          <td colspan="8" class="p-5">
            <div class="glass-card rounded-xl p-5 border border-slate-800/80 space-y-3.5">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 flex-wrap gap-2">
                <div class="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <span>\u{1F4C8} Season Consistency & Breakdown</span>
                </div>
                <div class="text-xs sm:text-sm text-slate-400 font-semibold">
                  Season High: <span class="font-black text-emerald-400 font-mono">${(r.highScore || 0).toFixed(2)} pts</span> \u2022
                  Season Low: <span class="font-black text-rose-400 font-mono">${(r.lowScore || 0).toFixed(2)} pts</span> \u2022
                  Consistency (Std Dev): <span class="font-black text-cyan-300 font-mono">\xB1${r.stdDev || 0}</span>
                </div>
              </div>

              <div class="text-xs sm:text-sm text-slate-300">
                <span class="font-bold text-slate-200">Weekly Score Progression:</span>
                <div class="flex flex-wrap gap-2 mt-2">
                  ${(r.weeklyScores || []).map(
            (pt, idx) => `
                    <span class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-slate-200">
                      W${idx + 1}: <span class="text-emerald-400 font-black">${parseFloat(pt || 0).toFixed(1)}</span>
                    </span>
                  `
          ).join("")}
                </div>
              </div>
            </div>
          </td>
        `;
        } else {
          detailTr.innerHTML = `
          <td colspan="8" class="p-5">
            <div class="glass-card rounded-xl p-5 border border-slate-800/80 space-y-3.5">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 flex-wrap gap-2">
                <div class="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <span>\u26A1 Starting Lineup vs Bench</span>
                  <span class="text-slate-400 font-normal">| Matchup #${r.matchupId || "N/A"}</span>
                </div>
                <div class="text-xs sm:text-sm text-slate-400 font-semibold">
                  Starters: <span class="font-black text-emerald-400 font-mono">${(r.startersTotal || 0).toFixed(2)} pts</span> \u2022
                  Bench: <span class="font-black text-slate-300 font-mono">${(r.benchPoints || 0).toFixed(2)} pts</span> \u2022
                  Optimal Potential: <span class="font-black text-amber-300 font-mono">${(r.optimalPoints || 0).toFixed(2)} pts</span> (${r.efficiency || 100}% efficiency)
                </div>
              </div>

              <div class="text-xs sm:text-sm text-slate-300">
                <span class="font-bold text-slate-200">Starter Point Breakdown:</span>
                <div class="flex flex-wrap gap-2 mt-2">
                  ${r.startersPoints && r.startersPoints.length > 0 ? r.startersPoints.map(
            (pt, idx) => `
                      <span class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-slate-200">
                        S${idx + 1}: <span class="text-emerald-400 font-black">${parseFloat(pt || 0).toFixed(1)}</span>
                      </span>
                    `
          ).join("") : '<span class="text-slate-500 italic">No individual starter data available.</span>'}
                </div>
              </div>
            </div>
          </td>
        `;
        }
        tableBody.appendChild(detailTr);
      }
    });
  }
  function toggleRowExpand(rowId) {
    if (state.expandedRowIds.has(rowId)) {
      state.expandedRowIds.delete(rowId);
    } else {
      state.expandedRowIds.add(rowId);
    }
    renderTable();
  }
  function setMainPageSize(size) {
    state.currentMainPageSize = size === "all" ? Infinity : parseInt(size, 10);
    state.currentMainPage = 1;
    renderTable();
  }
  function changeMainPage(delta) {
    state.currentMainPage += delta;
    renderTable();
  }
  function goToMainPage(page) {
    state.currentMainPage = page;
    renderTable();
  }
  function sortTable(column) {
    const colMap = {
      rank: "Rank",
      points: "Points",
      manager: "Manager",
      team: "Team",
      teamname: "Team",
      league: "League",
      matchup: "Record",
      record: "Record",
      efficiency: "Efficiency"
    };
    const targetCol = colMap[String(column).toLowerCase()] || column;
    if (state.currentSortColumn === targetCol) {
      state.currentSortAsc = !state.currentSortAsc;
    } else {
      state.currentSortColumn = targetCol;
      state.currentSortAsc = targetCol === "Rank" || targetCol === "Manager" || targetCol === "Team" || targetCol === "League";
    }
    state.currentMainPage = 1;
    renderTable();
  }

  // src/js/components/charts.js
  init_store();
  function wrapLabel(str, maxLen = 16, maxLines = 3) {
    if (!str) return "";
    const words = str.split(" ");
    const lines = [];
    let currentLine = "";
    for (const word of words) {
      if ((currentLine + (currentLine ? " " : "") + word).length <= maxLen) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        if (currentLine) lines.push(currentLine);
        if (word.length > maxLen) {
          let remaining = word;
          while (remaining.length > maxLen && lines.length < maxLines - 1) {
            lines.push(remaining.slice(0, maxLen));
            remaining = remaining.slice(maxLen);
          }
          currentLine = remaining;
        } else {
          currentLine = word;
        }
      }
      if (lines.length >= maxLines) break;
    }
    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    }
    return lines.length > 1 ? lines : lines[0] || str;
  }
  function renderCharts(records = getActiveRecords(), leagues = getActiveLeaguesMap()) {
    const distEl = document.getElementById("scoreDistChart");
    const avgEl = document.getElementById("leagueAvgChart");
    if (!distEl || !avgEl) return;
    if (typeof Chart === "undefined") return;
    const textColor = "#cbd5e1";
    const gridColor = "rgba(255, 255, 255, 0.08)";
    const buckets = {
      "< 80": 0,
      "80 - 100": 0,
      "100 - 120": 0,
      "120 - 140": 0,
      "140 - 160": 0,
      "160+": 0
    };
    (records || []).forEach((r) => {
      const pts = r.points || 0;
      if (pts < 80) buckets["< 80"]++;
      else if (pts < 100) buckets["80 - 100"]++;
      else if (pts < 120) buckets["100 - 120"]++;
      else if (pts < 140) buckets["120 - 140"]++;
      else if (pts < 160) buckets["140 - 160"]++;
      else buckets["160+"]++;
    });
    const distCtx = distEl.getContext("2d");
    if (state.scoreDistChartInstance) state.scoreDistChartInstance.destroy();
    state.scoreDistChartInstance = new Chart(distCtx, {
      type: "bar",
      data: {
        labels: Object.keys(buckets),
        datasets: [
          {
            label: "Squads",
            data: Object.values(buckets),
            backgroundColor: [
              "rgba(6, 182, 212, 0.55)",
              "rgba(16, 185, 129, 0.55)",
              "rgba(52, 211, 153, 0.65)",
              "rgba(245, 158, 11, 0.65)",
              "rgba(249, 115, 22, 0.75)",
              "rgba(239, 68, 68, 0.85)"
            ],
            borderColor: ["#06b6d4", "#10b981", "#34d399", "#f59e0b", "#f97316", "#ef4444"],
            borderWidth: 1.5,
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0f172a",
            titleColor: "#f8fafc",
            bodyFont: { size: 13 },
            titleFont: { size: 13, weight: "bold" },
            borderColor: "rgba(255, 255, 255, 0.15)",
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: "Plus Jakarta Sans", size: 12, weight: "bold" }
            }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              precision: 0,
              font: { family: "Plus Jakarta Sans", size: 12 }
            },
            beginAtZero: true
          }
        }
      }
    });
    const rawLeagueNames = [];
    const leagueLabels = [];
    const leagueAverages = [];
    const leagueHighs = [];
    Object.keys(leagues || {}).forEach((lid) => {
      const l = leagues[lid];
      const squadScores = (records || []).filter((r) => r.leagueId === lid).map((r) => r.points || 0);
      const scores = l && l.scores && l.scores.length > 0 ? l.scores : squadScores;
      if (scores && scores.length > 0) {
        const name = l && l.name || `League ${lid}`;
        rawLeagueNames.push(name);
        leagueLabels.push(wrapLabel(name, 16, 3));
        const sum = scores.reduce((a, b) => a + b, 0);
        leagueAverages.push(Math.round(sum / scores.length * 100) / 100);
        leagueHighs.push(Math.max(...scores));
      }
    });
    const avgCtx = avgEl.getContext("2d");
    if (state.leagueAvgChartInstance) state.leagueAvgChartInstance.destroy();
    state.leagueAvgChartInstance = new Chart(avgCtx, {
      type: "bar",
      data: {
        labels: leagueLabels,
        datasets: [
          {
            label: state.currentMode === "SEASON_ROLLUP" ? "League Avg PPG" : "League Avg",
            data: leagueAverages,
            backgroundColor: "rgba(99, 102, 241, 0.65)",
            borderColor: "#6366f1",
            borderWidth: 1.5,
            borderRadius: 6
          },
          {
            label: "High Score",
            data: leagueHighs,
            backgroundColor: "rgba(16, 185, 129, 0.65)",
            borderColor: "#10b981",
            borderWidth: 1.5,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: textColor,
              font: { family: "Plus Jakarta Sans", size: 12, weight: "bold" }
            }
          },
          tooltip: {
            backgroundColor: "#0f172a",
            titleColor: "#f8fafc",
            bodyFont: { size: 13 },
            titleFont: { size: 13, weight: "bold" },
            borderColor: "rgba(255, 255, 255, 0.15)",
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              title: function(tooltipItems) {
                const idx = tooltipItems[0].dataIndex;
                return rawLeagueNames[idx] || "";
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: "Plus Jakarta Sans", size: 11, weight: "bold" },
              autoSkip: false,
              maxRotation: 0
            }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: "Plus Jakarta Sans", size: 12 } },
            beginAtZero: true
          }
        }
      }
    });
  }

  // src/js/components/leagueGrid.js
  init_store();
  init_dom();
  function renderLeagueGrid(records = getActiveRecords(), leagues = getActiveLeaguesMap()) {
    const grid = document.getElementById("leagueCardsGrid");
    if (!grid) return;
    grid.innerHTML = "";
    const leagueKeys = Object.keys(leagues || {});
    if (leagueKeys.length === 0) {
      grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400 glass-card rounded-2xl border border-slate-800 space-y-3">
        <div class="text-4xl">\u{1F3DF}\uFE0F</div>
        <div class="font-bold text-lg text-slate-200">No leagues selected.</div>
        <div class="text-sm text-slate-400">Pick one or more leagues from the filter bar above to compare them here.</div>
      </div>
    `;
      return;
    }
    leagueKeys.forEach((lid) => {
      const league = leagues[lid];
      const leagueTeams = (records || []).filter((r) => r.leagueId === lid).sort((a, b) => (b.points || 0) - (a.points || 0));
      if (leagueTeams.length === 0) return;
      const sum = leagueTeams.reduce((acc, r) => acc + (r.points || 0), 0);
      const avg = (sum / leagueTeams.length).toFixed(2);
      const card = document.createElement("div");
      card.className = "glass-card rounded-2xl p-6 border border-slate-800 space-y-4";
      card.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-800 pb-3.5 gap-3">
        <div class="min-w-0 flex-1">
          <h3 class="font-black text-base sm:text-lg text-white break-words line-clamp-2 leading-snug" title="${escapeHtml(league.name)}">${escapeHtml(league.name)}</h3>
          <div class="text-xs text-slate-400 font-medium mt-1">${leagueTeams.length} squads active</div>
        </div>
        <span class="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs sm:text-sm font-mono font-bold text-emerald-400 flex-shrink-0">
          Avg: ${avg}
        </span>
      </div>

      <div class="space-y-2.5">
        <div class="text-xs font-black uppercase tracking-wider text-slate-400">Top 5 Performers</div>
        <div class="space-y-2">
          ${leagueTeams.slice(0, 5).map(
        (t, idx) => `
            <div class="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-900/70 border border-slate-800/60">
              <div class="flex items-center gap-2.5 truncate">
                <span class="font-black ${idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-600" : "text-slate-400"}">#${idx + 1}</span>
                <span class="truncate text-slate-200 font-semibold">${escapeHtml(t.manager)}</span>
              </div>
              <span class="font-mono font-black text-slate-100">${(t.points || 0).toFixed(2)}</span>
            </div>
          `
      ).join("")}
        </div>
      </div>
    `;
      grid.appendChild(card);
    });
  }

  // src/js/components/playerAnalytics.js
  init_store();
  init_dom();
  init_players();
  function renderPlayerAnalytics(records = getActiveRecords(), _leagues = getActiveLeaguesMap()) {
    const positionalMvpDeck = document.getElementById("positionalMvpDeck");
    const playerTableBody = document.getElementById("playerTableBody");
    const playerSeasonBadge = document.getElementById("playerSeasonBadge");
    const seasonInput = document.getElementById("seasonInput");
    const playerWeekBadge = document.getElementById("playerWeekBadge");
    const weekInput = document.getElementById("weekInput");
    if (!positionalMvpDeck || !playerTableBody) return;
    const isSeason = state.currentMode === "SEASON_ROLLUP";
    if (playerSeasonBadge && seasonInput) {
      playerSeasonBadge.textContent = seasonInput.value;
    }
    if (playerWeekBadge && weekInput) {
      playerWeekBadge.textContent = isSeason ? `Weeks 1 - ${weekInput.value} Rollup` : `Week ${weekInput.value}`;
    }
    const labelPoints = document.getElementById("labelPlayerPoints");
    if (labelPoints) {
      labelPoints.textContent = isSeason ? "Avg PPG" : "Points";
    }
    const targetWeek = weekInput ? parseInt(weekInput.value, 10) || 1 : 1;
    const allAggregated = aggregatePlayers(records, isSeason, targetWeek, getPlayerInfo);
    state.lastAggregatedPlayers = allAggregated;
    renderPositionalMvpDeck(allAggregated);
    renderPlayerLeaderboard(allAggregated);
  }
  function renderPositionalMvpDeck(allPlayers) {
    const positionalMvpDeck = document.getElementById("positionalMvpDeck");
    if (!positionalMvpDeck) return;
    positionalMvpDeck.innerHTML = "";
    const isSeason = state.currentMode === "SEASON_ROLLUP";
    const mvpSlots = [
      {
        pos: "QB",
        label: "Top QB",
        icon: "\u{1F3AF}",
        color: "text-rose-400",
        bg: "from-rose-500/20 via-slate-900/90 to-transparent",
        border: "border-rose-500/30"
      },
      {
        pos: "RB",
        label: "Top RB",
        icon: "\u26A1",
        color: "text-cyan-400",
        bg: "from-cyan-500/20 via-slate-900/90 to-transparent",
        border: "border-cyan-500/30"
      },
      {
        pos: "WR",
        label: "Top WR",
        icon: "\u{1F525}",
        color: "text-emerald-400",
        bg: "from-emerald-500/20 via-slate-900/90 to-transparent",
        border: "border-emerald-500/30"
      },
      {
        pos: "TE",
        label: "Top TE",
        icon: "\u{1F6E1}\uFE0F",
        color: "text-amber-400",
        bg: "from-amber-500/20 via-slate-900/90 to-transparent",
        border: "border-amber-500/30"
      },
      {
        pos: "K",
        label: "Top K",
        icon: "\u{1F45F}",
        color: "text-purple-400",
        bg: "from-purple-500/20 via-slate-900/90 to-transparent",
        border: "border-purple-500/30"
      },
      {
        pos: "DEF",
        label: "Top DEF",
        icon: "\u{1F3F0}",
        color: "text-slate-300",
        bg: "from-slate-700/30 via-slate-900/90 to-transparent",
        border: "border-slate-600/40"
      }
    ];
    mvpSlots.forEach((slot) => {
      const candidates = (allPlayers || []).filter((p) => p.pos === slot.pos).sort((a, b) => (b.points || 0) - (a.points || 0));
      const topPlayer = candidates[0];
      const card = document.createElement("div");
      card.className = `glass-card rounded-2xl p-4 flex flex-col justify-between border ${slot.border} bg-gradient-to-b ${slot.bg} transition hover:scale-[1.02] duration-200`;
      if (topPlayer && topPlayer.points > 0) {
        const bestOwner = topPlayer.owners && topPlayer.owners[0];
        const avatarImg = topPlayer.headshotUrl ? `<img src="${topPlayer.headshotUrl}" class="w-10 h-10 rounded-full object-cover border border-slate-700 bg-slate-800 flex-shrink-0" alt="" onerror="this.remove()">` : "";
        const titleComponent = createCardTitleWithInfo(
          `${slot.icon} ${slot.label}`,
          `Highest scoring ${slot.pos} across all participating leagues for this matchup period.`,
          `text-xs font-black uppercase tracking-wider ${slot.color} hover:underline`
        );
        card.innerHTML = `
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          ${titleComponent}
          <span class="text-xs font-mono font-bold text-slate-400">${escapeHtml(topPlayer.team || "FA")}</span>
        </div>

        <div class="my-2.5 flex items-center gap-2.5">
          ${avatarImg}
          <div class="min-w-0 flex-1">
            <div class="font-black text-sm text-white truncate" title="${escapeHtml(topPlayer.name)}">${escapeHtml(topPlayer.name)}</div>
            <div class="text-[11px] text-slate-400 font-semibold truncate">${escapeHtml(topPlayer.pos)} \u2022 ${topPlayer.startRate}% Started</div>
          </div>
        </div>

        <div class="pt-2 border-t border-white/10 flex items-end justify-between">
          <div>
            <div class="text-[10px] uppercase font-bold text-slate-400">${isSeason ? "Avg PPG" : "Points"}</div>
            <div class="text-xl font-mono font-black ${slot.color}">${(topPlayer.points || 0).toFixed(2)}</div>
          </div>
          ${bestOwner ? `
            <div class="text-[10px] text-slate-400 text-right truncate max-w-[120px]" title="Rostered by ${escapeHtml(bestOwner.manager)} in ${escapeHtml(bestOwner.league)}">
              <span class="text-slate-500 block">Top Owner</span>
              <span class="font-bold text-slate-300 truncate block">${escapeHtml(bestOwner.manager)}</span>
              <span class="text-slate-400 truncate block text-[10px]">\u{1F3C6} ${escapeHtml(bestOwner.league)}</span>
            </div>
          ` : ""}
        </div>
      `;
      } else {
        const titleComponent = createCardTitleWithInfo(
          `${slot.icon} ${slot.label}`,
          `Highest scoring ${slot.pos} across all participating leagues for this matchup period.`,
          `text-xs font-black uppercase tracking-wider ${slot.color} hover:underline`
        );
        card.innerHTML = `
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          ${titleComponent}
        </div>
        <div class="py-6 text-center text-xs text-slate-500 italic">No ${slot.pos} data recorded yet.</div>
      `;
      }
      positionalMvpDeck.appendChild(card);
    });
  }
  function renderPlayerLeaderboard(allPlayers = null) {
    const playerTableBody = document.getElementById("playerTableBody");
    const playerRowCount = document.getElementById("playerRowCount");
    const noPlayersFound = document.getElementById("noPlayersFound");
    const weekInput = document.getElementById("weekInput");
    if (!playerTableBody) return;
    playerTableBody.innerHTML = "";
    const isSeason = state.currentMode === "SEASON_ROLLUP";
    const targetWeek = weekInput ? parseInt(weekInput.value, 10) || 1 : 1;
    const playerList = allPlayers || (state.lastAggregatedPlayers.length > 0 ? state.lastAggregatedPlayers : aggregatePlayers(getActiveRecords(), isSeason, targetWeek, getPlayerInfo));
    const q = state.currentPlayerSearch.toLowerCase().trim();
    let filtered = (playerList || []).filter((p) => {
      if (state.currentPlayerPositionFilter === "FLEX") {
        if (!["RB", "WR", "TE"].includes(p.pos)) return false;
      } else if (state.currentPlayerPositionFilter !== "ALL") {
        if (p.pos !== state.currentPlayerPositionFilter) return false;
      }
      if (state.currentPlayerStatusFilter === "STARTERS" && p.startedCount === 0) return false;
      if (state.currentPlayerStatusFilter === "BENCH" && p.benchedCount === 0) return false;
      if (q) {
        const matchName = (p.name || "").toLowerCase().includes(q);
        const matchTeam = (p.team || "").toLowerCase().includes(q);
        const matchOwner = (p.owners || []).some(
          (o) => (o.manager || "").toLowerCase().includes(q) || (o.league || "").toLowerCase().includes(q)
        );
        if (!matchName && !matchTeam && !matchOwner) return false;
      }
      return true;
    });
    filtered.sort((a, b) => {
      let vA = a[state.currentPlayerSortColumn];
      let vB = b[state.currentPlayerSortColumn];
      if (typeof vA === "number" || typeof vB === "number") {
        vA = typeof vA === "number" ? vA : 0;
        vB = typeof vB === "number" ? vB : 0;
      } else if (typeof vA === "string" || typeof vB === "string") {
        vA = (vA || "").toLowerCase();
        vB = (vB || "").toLowerCase();
      }
      if (vA < vB) return state.currentPlayerSortAsc ? -1 : 1;
      if (vA > vB) return state.currentPlayerSortAsc ? 1 : -1;
      return 0;
    });
    if (playerRowCount) {
      playerRowCount.textContent = `Showing ${filtered.length} of ${playerList.length} players across selected leagues`;
    }
    if (filtered.length === 0) {
      if (noPlayersFound) {
        noPlayersFound.classList.remove("hidden");
        if (playerList.length === 0) {
          noPlayersFound.innerHTML = `
          <div class="text-3xl">\u{1F3C8}</div>
          <div class="font-bold text-slate-200">No player data available.</div>
          <div class="text-xs text-slate-400">Click "Fetch Cross-League Stats" above to load roster and player scores.</div>
        `;
        } else {
          noPlayersFound.innerHTML = `
          <div class="text-3xl">\u{1F3C8}</div>
          <div class="font-bold text-slate-200">No players match the current filters.</div>
          <div class="text-xs text-slate-500">Try changing the position filter or search terms.</div>
        `;
        }
      }
      const pageInfo2 = document.getElementById("playerPageInfoText");
      if (pageInfo2) pageInfo2.textContent = "Showing 0 of 0";
      const btnPrev2 = document.getElementById("btnPrevPlayerPage");
      const btnNext2 = document.getElementById("btnNextPlayerPage");
      if (btnPrev2) btnPrev2.disabled = true;
      if (btnNext2) btnNext2.disabled = true;
      const pageBtnContainer = document.getElementById("playerPageNumberButtons");
      if (pageBtnContainer) pageBtnContainer.innerHTML = "";
      return;
    }
    if (noPlayersFound) noPlayersFound.classList.add("hidden");
    const totalCount = filtered.length;
    const pageSize = state.currentPlayerPageSize === Infinity ? totalCount : state.currentPlayerPageSize;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    if (state.currentPlayerPage > totalPages) state.currentPlayerPage = totalPages;
    if (state.currentPlayerPage < 1) state.currentPlayerPage = 1;
    const startIdx = (state.currentPlayerPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalCount);
    const pageSlice = filtered.slice(startIdx, endIdx);
    const pageInfo = document.getElementById("playerPageInfoText");
    if (pageInfo)
      pageInfo.textContent = totalCount === 0 ? "Showing 0 of 0" : `Showing ${startIdx + 1}\u2013${endIdx} of ${totalCount}`;
    const btnPrev = document.getElementById("btnPrevPlayerPage");
    const btnNext = document.getElementById("btnNextPlayerPage");
    if (btnPrev) btnPrev.disabled = state.currentPlayerPage <= 1 || totalCount === 0;
    if (btnNext) btnNext.disabled = state.currentPlayerPage >= totalPages || totalCount === 0;
    renderPaginationButtons(
      "playerPageNumberButtons",
      totalPages,
      state.currentPlayerPage,
      "goToPlayerPage"
    );
    pageSlice.forEach((p, idx) => {
      const rank = startIdx + idx + 1;
      const tr = document.createElement("tr");
      tr.className = "transition-colors hover:bg-slate-800/60";
      const isExpanded = state.expandedPlayerIds.has(p.id);
      const avatarHtml = p.headshotUrl ? `<img src="${p.headshotUrl}" class="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-800 flex-shrink-0" alt="" onerror="this.remove()">` : "";
      const visibleOwners = (p.owners || []).slice(0, 3);
      const remainingCount = (p.owners || []).length - visibleOwners.length;
      const ownersHtml = p.owners && p.owners.length > 0 ? `
        <div class="flex flex-wrap items-center gap-1.5 max-w-md">
          ${visibleOwners.map(
        (o) => `
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${o.isStarter || o.starts > 0 ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30" : "bg-slate-900 text-slate-300 border border-slate-800"}">
              <span>${o.isStarter || o.starts > 0 ? "\u{1F7E2}" : "\u{1FA91}"}</span>
              <span class="truncate max-w-[110px]" title="${escapeHtml(o.manager)} \u2022 ${escapeHtml(o.league)}">${escapeHtml(o.manager)}</span>
            </span>
          `
      ).join("")}
          ${remainingCount > 0 ? `
            <span class="text-xs font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">+${remainingCount} more</span>
          ` : ""}
        </div>
      ` : `<span class="text-xs text-slate-500 italic">Free Agent / Unrostered</span>`;
      tr.innerHTML = `
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 text-center whitespace-nowrap font-mono font-black text-xs sm:text-sm ${rank <= 3 ? "text-amber-400" : "text-slate-400"}">
        #${rank}
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
        <div class="flex items-center gap-2 sm:gap-3">
          ${avatarHtml}
          <div class="min-w-0">
            <span class="font-black text-xs sm:text-base text-slate-100 truncate block">
              ${escapeHtml(p.name)}
            </span>
            <span class="text-[10px] sm:text-xs text-slate-400 font-semibold block">
              ${escapeHtml(p.team || "FA")} \u2022 ${escapeHtml(p.pos)}
            </span>
          </div>
        </div>
      </td>

      <td class="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center whitespace-nowrap">
        ${getPlayerPositionBadge(p.pos)}
      </td>

      <td class="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center whitespace-nowrap text-[11px] sm:text-xs font-bold text-slate-300 font-mono">
        ${escapeHtml(p.team || "FA")}
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
        <div class="font-mono text-sm sm:text-lg font-black text-emerald-400">
          ${(p.points || 0).toFixed(2)} <span class="text-[10px] sm:text-xs font-semibold text-slate-400">${isSeason ? "ppg" : "pts"}</span>
        </div>
        ${isSeason && p.totalPoints !== void 0 ? `
          <div class="text-[10px] sm:text-xs text-slate-400 font-mono">${p.totalPoints.toFixed(1)} total \u2022 ${p.gamesCount} wks</div>
        ` : ""}
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-center">
        <div class="space-y-0.5 sm:space-y-1 inline-block text-left">
          <div class="text-[10px] sm:text-xs font-mono font-bold text-slate-200">
            ${p.startRate}% <span class="text-slate-500 font-normal">(${p.startedCount}/${p.startedCount + p.benchedCount})</span>
          </div>
          <div class="w-16 sm:w-20 bg-slate-800 rounded-full h-1 sm:h-1.5 overflow-hidden">
            <div class="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full" style="width: ${p.startRate}%"></div>
          </div>
        </div>
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4">
        ${ownersHtml}
      </td>

      <td class="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center whitespace-nowrap">
        <button
          onclick="togglePlayerRowExpand('${p.id}')"
          class="p-1.5 sm:p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition text-[10px] sm:text-xs font-mono font-bold border border-slate-800 cursor-pointer"
          title="Toggle Roster Exposure Breakdown"
        >
          ${isExpanded ? "\u25B2" : "\u25BC"}
        </button>
      </td>
    `;
      playerTableBody.appendChild(tr);
      if (isExpanded) {
        const detailTr = document.createElement("tr");
        detailTr.className = "bg-slate-950/90 border-b border-slate-800";
        detailTr.innerHTML = `
        <td colspan="8" class="p-5">
          <div class="glass-card rounded-xl p-5 border border-slate-800/80 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 flex-wrap gap-2">
              <div class="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <span>\u{1F3C8} ${escapeHtml(p.name)} (${escapeHtml(p.pos)} - ${escapeHtml(p.team || "FA")})</span>
                <span class="text-slate-400 font-normal">| Cross-League Roster Exposure</span>
              </div>
              <div class="text-xs sm:text-sm text-slate-400 font-semibold font-mono">
                Started: <span class="text-emerald-400 font-black">${p.startedCount}</span> \u2022
                Benched: <span class="text-amber-400 font-black">${p.benchedCount}</span> \u2022
                Start Rate: <span class="text-cyan-300 font-black">${p.startRate}%</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              ${(p.owners || []).map(
          (o) => `
                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <div class="font-black text-sm text-white truncate">${escapeHtml(o.manager)}</div>
                    <div class="text-xs text-slate-400 truncate">${escapeHtml(o.teamName)}</div>
                    <div class="text-[11px] text-slate-400 font-bold mt-1 flex items-center gap-1 truncate">
                      <span>\u{1F3C6}</span>
                      <span class="truncate">${escapeHtml(o.league)}</span>
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <span class="px-2 py-0.5 rounded-full text-xs font-black ${o.isStarter || o.starts > 0 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}">
                      ${o.isStarter || o.starts > 0 ? "\u{1F7E2} Starter" : "\u{1FA91} Bench"}
                    </span>
                    ${o.starts !== void 0 && o.benches !== void 0 ? `
                      <div class="text-[10px] text-slate-500 font-mono mt-1">${o.starts} starts / ${o.benches} bench</div>
                    ` : ""}
                  </div>
                </div>
              `
        ).join("")}
            </div>
          </div>
        </td>
      `;
        playerTableBody.appendChild(detailTr);
      }
    });
  }
  function setPlayerPositionFilter(pos) {
    state.currentPlayerPositionFilter = pos;
    const posKeys = ["ALL", "QB", "RB", "WR", "TE", "FLEX", "K", "DEF"];
    posKeys.forEach((k) => {
      const btn = document.getElementById(`posFilter${k}`);
      if (btn) {
        if (k === pos) {
          btn.className = "px-3 py-1.5 rounded-lg text-xs font-black transition bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-pointer";
        } else {
          btn.className = "px-3 py-1.5 rounded-lg text-xs font-black text-slate-400 hover:text-white transition cursor-pointer";
        }
      }
    });
    state.currentPlayerPage = 1;
    renderPlayerLeaderboard();
  }
  function setPlayerPageSize(size) {
    state.currentPlayerPageSize = size === "all" ? Infinity : parseInt(size, 10);
    state.currentPlayerPage = 1;
    renderPlayerLeaderboard();
  }
  function changePlayerPage(delta) {
    state.currentPlayerPage += delta;
    renderPlayerLeaderboard();
  }
  function goToPlayerPage(page) {
    state.currentPlayerPage = page;
    renderPlayerLeaderboard();
  }
  function togglePlayerRowExpand(pid) {
    if (state.expandedPlayerIds.has(pid)) {
      state.expandedPlayerIds.delete(pid);
    } else {
      state.expandedPlayerIds.add(pid);
    }
    renderPlayerLeaderboard();
  }
  function sortPlayers(col) {
    if (state.currentPlayerSortColumn === col) {
      state.currentPlayerSortAsc = !state.currentPlayerSortAsc;
    } else {
      state.currentPlayerSortColumn = col;
      state.currentPlayerSortAsc = false;
    }
    const iconPts = document.getElementById("sortIconPlayerPoints");
    const iconRate = document.getElementById("sortIconPlayerStartRate");
    if (iconPts) {
      iconPts.textContent = state.currentPlayerSortColumn === "points" ? state.currentPlayerSortAsc ? "\u25B2" : "\u25BC" : "";
      iconPts.className = state.currentPlayerSortColumn === "points" ? "text-xs text-emerald-400" : "text-xs text-slate-500";
    }
    if (iconRate) {
      iconRate.textContent = state.currentPlayerSortColumn === "startRate" ? state.currentPlayerSortAsc ? "\u25B2" : "\u25BC" : "";
      iconRate.className = state.currentPlayerSortColumn === "startRate" ? "text-xs text-emerald-400" : "text-xs text-slate-500";
    }
    state.currentPlayerPage = 1;
    renderPlayerLeaderboard();
  }

  // src/js/components/luckAnalytics.js
  init_store();
  init_dom();
  function renderLuckAnalytics(records = getActiveRecords(), _leagues = getActiveLeaguesMap()) {
    if (!records || records.length === 0) return;
    const sortedByLuckDesc = [...records].sort((a, b) => (b.luckIndex || 0) - (a.luckIndex || 0));
    const sortedByLuckAsc = [...records].sort((a, b) => (a.luckIndex || 0) - (b.luckIndex || 0));
    const sortedByAllPlay = [...records].sort((a, b) => {
      const pctDiff = (b.allPlayWinPct || 0) - (a.allPlayWinPct || 0);
      if (pctDiff !== 0) return pctDiff;
      const ptsA = typeof a.totalPoints === "number" ? a.totalPoints : a.points || 0;
      const ptsB = typeof b.totalPoints === "number" ? b.totalPoints : b.points || 0;
      return ptsB - ptsA;
    });
    const sortedByPA = [...records].sort((a, b) => (b.pointsAgainst || 0) - (a.pointsAgainst || 0));
    const luckiest = sortedByLuckDesc[0];
    const unluckiest = sortedByLuckAsc[0];
    const allPlayLeader = sortedByAllPlay[0];
    const toughest = sortedByPA[0];
    const isSeason = state.currentMode === "SEASON_ROLLUP";
    const cardLuckiest = document.getElementById("luckLuckiestCard");
    const cardUnluckiest = document.getElementById("luckUnluckiestCard");
    const cardAllPlay = document.getElementById("luckAllPlayLeaderCard");
    const cardToughest = document.getElementById("luckToughestCard");
    if (luckiest) {
      const valEl = document.getElementById("statLuckiestVal");
      const teamEl = document.getElementById("statLuckiestTeam");
      const leagueEl = document.getElementById("statLuckiestLeague");
      const subEl = document.getElementById("statLuckiestSub");
      const luckVal = luckiest.luckIndex || 0;
      const luckStr = `${luckVal >= 0 ? "+" : ""}${luckVal.toFixed(2)}`;
      const expStr = (luckiest.expectedWins || 0).toFixed(2);
      const actStr = isSeason ? `${luckiest.wins} wins` : luckiest.outcome === "win" ? "1.0 win" : luckiest.outcome === "tie" ? "0.5 win" : "0.0 wins";
      if (valEl) {
        valEl.textContent = luckStr;
        valEl.title = `Luck Index: ${luckStr} (${actStr} actual vs ${expStr} expected wins)`;
      }
      if (teamEl) {
        teamEl.textContent = `${luckiest.manager} - ${luckiest.teamName}`;
        teamEl.title = `${luckiest.manager} (${luckiest.teamName})`;
      }
      if (leagueEl) {
        leagueEl.innerHTML = `<span>\u{1F3C6}</span> <span class="truncate">${escapeHtml(luckiest.league)}</span>`;
        leagueEl.title = `League: ${luckiest.league}`;
      }
      if (subEl) {
        subEl.textContent = isSeason ? `${luckiest.wins}W-${luckiest.losses}L (${luckiest.winPct}%) \u2022 ${luckiest.allPlayWins}W-${luckiest.allPlayLosses}L All-Play` : `${luckiest.outcome === "win" ? "Won Matchup" : "Lost Matchup"} \u2022 Exp: ${expStr} Wins`;
        subEl.title = isSeason ? `Season Record: ${luckiest.wins}W-${luckiest.losses}L vs All-Play: ${luckiest.allPlayWins}W-${luckiest.allPlayLosses}L (${luckiest.allPlayWinPct}% win rate)` : `Matchup: ${luckiest.outcome === "win" ? "Won" : "Lost"} vs Exp Wins: ${expStr}`;
      }
      if (cardLuckiest) {
        cardLuckiest.setAttribute(
          "title",
          `Luckiest Squad \u{1F340}: Awarded to ${luckiest.manager} in ${luckiest.league}. Gained ${luckStr} bonus wins above All-Play expectation (${actStr} vs ${expStr} expected).`
        );
      }
    }
    if (unluckiest) {
      const valEl = document.getElementById("statUnluckiestVal");
      const teamEl = document.getElementById("statUnluckiestTeam");
      const leagueEl = document.getElementById("statUnluckiestLeague");
      const subEl = document.getElementById("statUnluckiestSub");
      const luckVal = unluckiest.luckIndex || 0;
      const luckStr = `${luckVal >= 0 ? "+" : ""}${luckVal.toFixed(2)}`;
      const expStr = (unluckiest.expectedWins || 0).toFixed(2);
      const actStr = isSeason ? `${unluckiest.wins} wins` : unluckiest.outcome === "win" ? "1.0 win" : unluckiest.outcome === "tie" ? "0.5 win" : "0.0 wins";
      if (valEl) {
        valEl.textContent = luckStr;
        valEl.title = `Luck Index: ${luckStr} (${actStr} actual vs ${expStr} expected wins)`;
      }
      if (teamEl) {
        teamEl.textContent = `${unluckiest.manager} - ${unluckiest.teamName}`;
        teamEl.title = `${unluckiest.manager} (${unluckiest.teamName})`;
      }
      if (leagueEl) {
        leagueEl.innerHTML = `<span>\u{1F3C6}</span> <span class="truncate">${escapeHtml(unluckiest.league)}</span>`;
        leagueEl.title = `League: ${unluckiest.league}`;
      }
      if (subEl) {
        subEl.textContent = isSeason ? `${unluckiest.wins}W-${unluckiest.losses}L (${unluckiest.winPct}%) \u2022 ${unluckiest.allPlayWins}W-${unluckiest.allPlayLosses}L All-Play` : `${unluckiest.outcome === "win" ? "Won Matchup" : "Lost Matchup"} \u2022 Exp: ${expStr} Wins`;
        subEl.title = isSeason ? `Season Record: ${unluckiest.wins}W-${unluckiest.losses}L vs All-Play: ${unluckiest.allPlayWins}W-${unluckiest.allPlayLosses}L (${unluckiest.allPlayWinPct}% win rate)` : `Matchup: ${unluckiest.outcome === "win" ? "Won" : "Lost"} vs Exp Wins: ${expStr}`;
      }
      if (cardUnluckiest) {
        cardUnluckiest.setAttribute(
          "title",
          `Unluckiest Squad \u{1F494} (Tough Schedule): Awarded to ${unluckiest.manager} in ${unluckiest.league}. Underperformed All-Play expectation by ${Math.abs(luckVal).toFixed(2)} wins due to brutal opponent scores (${actStr} vs ${expStr} expected).`
        );
      }
    }
    if (allPlayLeader) {
      const valEl = document.getElementById("statAllPlayLeaderVal");
      const teamEl = document.getElementById("statAllPlayLeaderTeam");
      const leagueEl = document.getElementById("statAllPlayLeaderLeague");
      const subEl = document.getElementById("statAllPlayLeaderSub");
      if (valEl) {
        valEl.textContent = `${allPlayLeader.allPlayWinPct || 0}%`;
        valEl.title = `All-Play Win Rate: ${allPlayLeader.allPlayWinPct || 0}% (${allPlayLeader.allPlayWins}W - ${allPlayLeader.allPlayLosses}L${allPlayLeader.allPlayTies > 0 ? ` - ${allPlayLeader.allPlayTies}T` : ""})`;
      }
      if (teamEl) {
        teamEl.textContent = `${allPlayLeader.manager} - ${allPlayLeader.teamName}`;
        teamEl.title = `${allPlayLeader.manager} (${allPlayLeader.teamName})`;
      }
      if (leagueEl) {
        leagueEl.innerHTML = `<span>\u{1F3C6}</span> <span class="truncate">${escapeHtml(allPlayLeader.league)}</span>`;
        leagueEl.title = `League: ${allPlayLeader.league}`;
      }
      if (subEl) {
        subEl.textContent = isSeason ? `${allPlayLeader.allPlayWins}W-${allPlayLeader.allPlayLosses}L All-Play \u2022 ${(allPlayLeader.totalPoints || 0).toFixed(1)} PF` : `${allPlayLeader.allPlayWins}W-${allPlayLeader.allPlayLosses}L All-Play \u2022 ${(allPlayLeader.points || 0).toFixed(1)} pts`;
        subEl.title = `Simulated across all league rivals: ${allPlayLeader.allPlayWins} wins, ${allPlayLeader.allPlayLosses} losses`;
      }
      if (cardAllPlay) {
        cardAllPlay.setAttribute(
          "title",
          `All-Play Powerhouse \u{1F451} (True Dominance): Awarded to ${allPlayLeader.manager} in ${allPlayLeader.league} for achieving the highest All-Play win rate (${allPlayLeader.allPlayWinPct}%).`
        );
      }
    }
    if (toughest) {
      const valEl = document.getElementById("statToughestVal");
      const teamEl = document.getElementById("statToughestTeam");
      const leagueEl = document.getElementById("statToughestLeague");
      const subEl = document.getElementById("statToughestSub");
      const paStr = `${(toughest.pointsAgainst || 0).toFixed(1)} pts`;
      if (valEl) {
        valEl.textContent = paStr;
        valEl.title = `Points Against: ${(toughest.pointsAgainst || 0).toFixed(2)} pts ${isSeason ? "per game avg" : "allowed in matchup"}`;
      }
      if (teamEl) {
        teamEl.textContent = `${toughest.manager} - ${toughest.teamName}`;
        teamEl.title = `${toughest.manager} (${toughest.teamName})`;
      }
      if (leagueEl) {
        leagueEl.innerHTML = `<span>\u{1F3C6}</span> <span class="truncate">${escapeHtml(toughest.league)}</span>`;
        leagueEl.title = `League: ${toughest.league}`;
      }
      if (subEl) {
        subEl.textContent = isSeason ? `Avg Opponent Score (PA)` : `Opponent: ${toughest.opponentName || "Opp"}`;
        subEl.title = isSeason ? `Highest average opponent score across all weeks: ${(toughest.pointsAgainst || 0).toFixed(2)} PPG` : `Opponent score: ${(toughest.pointsAgainst || 0).toFixed(2)} pts`;
      }
      if (cardToughest) {
        cardToughest.setAttribute(
          "title",
          `Toughest Opponents \u{1F6E1}\uFE0F (Highest PA): Awarded to ${toughest.manager} in ${toughest.league} for enduring the most difficult opponent scoring schedule (${(toughest.pointsAgainst || 0).toFixed(2)} pts avg).`
        );
      }
    }
    renderLuckTable(records);
  }
  function setLuckPageSize(size) {
    state.currentLuckPageSize = size === "all" ? Infinity : parseInt(size, 10);
    state.currentLuckPage = 1;
    renderLuckTable();
  }
  function changeLuckPage(delta) {
    state.currentLuckPage += delta;
    renderLuckTable();
  }
  function goToLuckPage(page) {
    state.currentLuckPage = page;
    renderLuckTable();
  }
  function sortLuckTable(col) {
    if (state.currentLuckSortColumn === col) {
      state.currentLuckSortAsc = !state.currentLuckSortAsc;
    } else {
      state.currentLuckSortColumn = col;
      state.currentLuckSortAsc = col === "Rank" || col === "Manager" || col === "League";
    }
    state.currentLuckPage = 1;
    renderLuckTable();
  }
  function renderLuckTable(records = getActiveRecords()) {
    const tableBody = document.getElementById("luckTableBody");
    const rowCount = document.getElementById("luckRowCount");
    const noLuckFound = document.getElementById("noLuckFound");
    if (!tableBody) return;
    const isSeason = state.currentMode === "SEASON_ROLLUP";
    let filtered = (records || []).filter((r) => {
      const luckVal = r.luckIndex || 0;
      if (state.currentLuckCategory === "LUCKY" && luckVal <= 0.5) return false;
      if (state.currentLuckCategory === "FAIR" && (luckVal < -0.5 || luckVal > 0.5)) return false;
      if (state.currentLuckCategory === "UNLUCKY" && luckVal >= -0.5) return false;
      if (state.currentLuckSearch) {
        const q = state.currentLuckSearch.toLowerCase();
        return (r.manager || "").toLowerCase().includes(q) || (r.teamName || "").toLowerCase().includes(q) || (r.league || "").toLowerCase().includes(q);
      }
      return true;
    });
    ["Rank", "Manager", "League", "Actual", "AllPlay", "Expected", "Luck", "PF", "PA"].forEach(
      (col) => {
        const icon = document.getElementById(`sortIconLuck${col}`);
        if (icon) {
          if (state.currentLuckSortColumn === col) {
            icon.textContent = state.currentLuckSortAsc ? "\u25B2" : "\u25BC";
            icon.className = "text-xs text-emerald-400";
          } else {
            icon.textContent = "";
            icon.className = "text-xs text-slate-500";
          }
        }
      }
    );
    filtered.sort((a, b) => {
      let valA, valB;
      if (state.currentLuckSortColumn === "Rank") {
        valA = a.rank || 0;
        valB = b.rank || 0;
      } else if (state.currentLuckSortColumn === "Manager") {
        valA = (a.manager || "").toLowerCase();
        valB = (b.manager || "").toLowerCase();
      } else if (state.currentLuckSortColumn === "League") {
        valA = (a.league || "").toLowerCase();
        valB = (b.league || "").toLowerCase();
      } else if (state.currentLuckSortColumn === "Actual") {
        valA = typeof a.winPct === "number" ? a.winPct : a.actualWins || 0;
        valB = typeof b.winPct === "number" ? b.winPct : b.actualWins || 0;
      } else if (state.currentLuckSortColumn === "AllPlay") {
        valA = a.allPlayWinPct || 0;
        valB = b.allPlayWinPct || 0;
      } else if (state.currentLuckSortColumn === "Expected") {
        valA = a.expectedWins || 0;
        valB = b.expectedWins || 0;
      } else if (state.currentLuckSortColumn === "Luck") {
        valA = a.luckIndex || 0;
        valB = b.luckIndex || 0;
      } else if (state.currentLuckSortColumn === "PF") {
        valA = a.points || 0;
        valB = b.points || 0;
      } else if (state.currentLuckSortColumn === "PA") {
        valA = a.pointsAgainst || 0;
        valB = b.pointsAgainst || 0;
      } else {
        valA = a.luckIndex || 0;
        valB = b.luckIndex || 0;
      }
      if (valA < valB) return state.currentLuckSortAsc ? -1 : 1;
      if (valA > valB) return state.currentLuckSortAsc ? 1 : -1;
      const ptsA = typeof a.totalPoints === "number" ? a.totalPoints : a.points || 0;
      const ptsB = typeof b.totalPoints === "number" ? b.totalPoints : b.points || 0;
      return state.currentLuckSortAsc ? ptsA - ptsB : ptsB - ptsA;
    });
    if (rowCount) {
      rowCount.textContent = `Showing ${filtered.length} of ${(records || []).length} squads across ${state.selectedLeagueIds.size} leagues`;
    }
    if (filtered.length === 0) {
      tableBody.innerHTML = "";
      if (noLuckFound) noLuckFound.classList.remove("hidden");
      const pageInfo2 = document.getElementById("luckPageInfoText");
      if (pageInfo2) pageInfo2.textContent = "Showing 0 of 0";
      const btnPrev2 = document.getElementById("btnPrevLuckPage");
      const btnNext2 = document.getElementById("btnNextLuckPage");
      if (btnPrev2) btnPrev2.disabled = true;
      if (btnNext2) btnNext2.disabled = true;
      const pageBtnContainer = document.getElementById("luckPageNumberButtons");
      if (pageBtnContainer) pageBtnContainer.innerHTML = "";
      return;
    }
    if (noLuckFound) noLuckFound.classList.add("hidden");
    tableBody.innerHTML = "";
    const totalCount = filtered.length;
    const pageSize = state.currentLuckPageSize === Infinity ? totalCount : state.currentLuckPageSize;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    if (state.currentLuckPage > totalPages) state.currentLuckPage = totalPages;
    if (state.currentLuckPage < 1) state.currentLuckPage = 1;
    const startIdx = (state.currentLuckPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalCount);
    const pageSlice = filtered.slice(startIdx, endIdx);
    const pageInfo = document.getElementById("luckPageInfoText");
    if (pageInfo)
      pageInfo.textContent = totalCount === 0 ? "Showing 0 of 0" : `Showing ${startIdx + 1}\u2013${endIdx} of ${totalCount}`;
    const btnPrev = document.getElementById("btnPrevLuckPage");
    const btnNext = document.getElementById("btnNextLuckPage");
    if (btnPrev) btnPrev.disabled = state.currentLuckPage <= 1 || totalCount === 0;
    if (btnNext) btnNext.disabled = state.currentLuckPage >= totalPages || totalCount === 0;
    renderPaginationButtons(
      "luckPageNumberButtons",
      totalPages,
      state.currentLuckPage,
      "goToLuckPage"
    );
    pageSlice.forEach((r, idx) => {
      const rankNum = startIdx + idx + 1;
      const tr = document.createElement("tr");
      tr.className = "transition-colors hover:bg-slate-800/60";
      const avatarUrl = getAvatarUrl(r.avatar);
      const avatarHtml = avatarUrl ? `<img src="${avatarUrl}" class="w-8 h-8 rounded-full object-cover border border-slate-700 flex-shrink-0" alt="" onerror="this.remove()">` : "";
      let actualRecordHtml = "";
      if (isSeason) {
        const actWins = r.wins || 0;
        const actLosses = r.losses || 0;
        const actTies = r.ties || 0;
        actualRecordHtml = `
        <div class="text-center" title="Actual Head-to-Head Record: ${actWins}W - ${actLosses}L${actTies > 0 ? ` - ${actTies}T` : ""} (${r.winPct}% win rate)">
          <span class="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-black ${r.winPct >= 60 ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : r.winPct >= 40 ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-rose-500/15 text-rose-300 border border-rose-500/30"}">
            ${actWins}W - ${actLosses}L${actTies > 0 ? ` - ${actTies}T` : ""}
          </span>
          <div class="text-[10px] sm:text-xs text-slate-400 font-mono mt-0.5 font-medium">${r.winPct}%</div>
        </div>
      `;
      } else {
        const outcomeDesc = r.outcome === "win" ? `Won Matchup (+${Math.abs(r.margin || 0).toFixed(1)} pts vs ${r.opponentName || "Opponent"})` : r.outcome === "loss" ? `Lost Matchup (-${Math.abs(r.margin || 0).toFixed(1)} pts vs ${r.opponentName || "Opponent"})` : r.outcome === "tie" ? `Tied Matchup vs ${r.opponentName || "Opponent"}` : `Upcoming Matchup vs ${r.opponentName || "Opponent"}`;
        actualRecordHtml = `
        <div class="text-center" title="${escapeHtml(outcomeDesc)}">
          <span class="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-black ${r.outcome === "win" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : r.outcome === "loss" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}">
            ${r.outcome === "win" ? "\u{1F7E2} 1-0" : r.outcome === "loss" ? "\u{1F534} 0-1" : r.outcome === "tie" ? "\u26AA 0-0-1" : "Upcoming"}
          </span>
          <div class="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-medium truncate max-w-[100px] sm:max-w-[120px]" title="vs ${escapeHtml(r.opponentName || "Opp")}">vs ${escapeHtml(r.opponentName || "Opp")}</div>
        </div>
      `;
      }
      const allPlayHtml = `
      <div class="text-center" title="All-Play Record: ${r.allPlayWins || 0}W - ${r.allPlayLosses || 0}L${(r.allPlayTies || 0) > 0 ? ` - ${r.allPlayTies}T` : ""} (${r.allPlayWinPct || 0}% win rate against all league rivals)">
        <span class="font-mono text-[10px] sm:text-sm font-bold text-slate-200">
          ${r.allPlayWins || 0}W - ${r.allPlayLosses || 0}L${(r.allPlayTies || 0) > 0 ? ` - ${r.allPlayTies}T` : ""}
        </span>
        <div class="text-[10px] sm:text-xs font-mono text-cyan-400 font-semibold">${r.allPlayWinPct || 0}% Win</div>
      </div>
    `;
      const luckVal = r.luckIndex || 0;
      let luckBadge = "";
      const expWinsStr = (r.expectedWins || 0).toFixed(2);
      const actWinsStr = isSeason ? `${r.wins}W` : r.outcome === "win" ? "1.0" : r.outcome === "tie" ? "0.5" : "0.0";
      if (luckVal >= 0.5) {
        luckBadge = `
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm cursor-help" title="\u{1F340} Lucky Schedule Draw: Gained +${luckVal.toFixed(2)} bonus wins above expected (${actWinsStr} actual vs ${expWinsStr} expected based on scoring)">
          <span>\u{1F340}</span> +${luckVal.toFixed(2)}
        </span>
      `;
      } else if (luckVal <= -0.5) {
        luckBadge = `
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-mono font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm cursor-help" title="\u{1F494} Unlucky Schedule Draw: Lost ${Math.abs(luckVal).toFixed(2)} wins below expected (${actWinsStr} actual vs ${expWinsStr} expected due to tough opponent scores)">
          <span>\u{1F494}</span> ${luckVal.toFixed(2)}
        </span>
      `;
      } else {
        luckBadge = `
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-mono font-black bg-slate-800 text-slate-300 border border-slate-700 cursor-help" title="\u2696\uFE0F Fair Schedule: Actual outcome closely matches scoring performance (${luckVal >= 0 ? "+" : ""}${luckVal.toFixed(2)} vs ${expWinsStr} expected)">
          <span>\u2696\uFE0F</span> ${luckVal >= 0 ? "+" : ""}${luckVal.toFixed(2)}
        </span>
      `;
      }
      tr.innerHTML = `
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap font-mono font-black text-xs sm:text-sm text-slate-400">#${rankNum}</td>
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
        <div class="flex items-center gap-2 sm:gap-3">
          ${avatarHtml}
          <div class="min-w-0">
            <span class="font-bold text-xs sm:text-sm text-white truncate block" title="${escapeHtml(r.manager)}">${escapeHtml(r.manager)}</span>
            <span class="text-[10px] sm:text-xs text-slate-400 truncate block" title="${escapeHtml(r.teamName)}">${escapeHtml(r.teamName)}</span>
          </div>
        </div>
      </td>
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 text-[11px] sm:text-sm text-slate-300 font-medium max-w-[150px] sm:max-w-[200px] truncate" title="League: ${escapeHtml(r.league)}">
        <div class="flex items-center gap-1.5 truncate">
          <span class="text-slate-500">\u{1F3C6}</span>
          <span class="truncate">${escapeHtml(r.league)}</span>
          ${String(r.leagueId).startsWith("espn:") || r.platform === "espn" ? `<span class="badge-espn text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">ESPN</span>` : `<span class="badge-sleeper text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">Sleeper</span>`}
        </div>
      </td>
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-center">${actualRecordHtml}</td>
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-center">${allPlayHtml}</td>
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-center font-mono font-black text-xs sm:text-sm text-slate-200" title="Expected Wins: ${(r.expectedWins || 0).toFixed(2)} based on ${r.allPlayWinPct || 0}% All-Play win rate">
        ${(r.expectedWins || 0).toFixed(2)}
      </td>
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-center">${luckBadge}</td>
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-right font-mono font-bold text-xs sm:text-sm text-emerald-400" title="${isSeason ? `Total PF: ${(r.totalPoints || 0).toFixed(1)} pts across ${r.weeksCount || 1} weeks (${r.points.toFixed(2)} PPG)` : `Points Scored: ${r.points.toFixed(2)} pts`}">
        ${r.points.toFixed(2)} <span class="text-[10px] sm:text-xs font-normal text-slate-400">${isSeason ? "ppg" : "pts"}</span>
      </td>
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-right font-mono font-bold text-xs sm:text-sm text-slate-300" title="${isSeason ? `Total Opponent PA: ${(r.totalPointsAgainst || 0).toFixed(1)} pts allowed (${(r.pointsAgainst || 0).toFixed(2)} PPG)` : `Opponent Score Allowed: ${(r.pointsAgainst || 0).toFixed(2)} pts`}">
        ${(r.pointsAgainst || 0).toFixed(2)} <span class="text-[10px] sm:text-xs font-normal text-slate-400">${isSeason ? "ppg" : "pts"}</span>
      </td>
    `;
      tableBody.appendChild(tr);
    });
  }

  // src/js/export/recap.js
  init_store();
  init_dom();
  function formatRecapText(records, activeLeagues, options = {}) {
    const isSeason = options.isSeason ?? state.currentMode === "SEASON_ROLLUP";
    const week = options.week ?? 1;
    const season = options.season ?? "2026";
    const sorted = [...records].sort((a, b) => b.points - a.points);
    const first = sorted[0];
    const second = sorted[1];
    const third = sorted[2];
    const lowest = sorted[sorted.length - 1];
    const totalLeagues = Object.keys(activeLeagues).length;
    const totalSquads = records.length;
    let topLeagueAvg = 0;
    let topLeagueName = "N/A";
    Object.keys(activeLeagues).forEach((lid) => {
      const lTeams = records.filter((r) => r.leagueId === lid);
      if (lTeams.length > 0) {
        const avg = lTeams.reduce((a, b) => a + b.points, 0) / lTeams.length;
        if (avg > topLeagueAvg) {
          topLeagueAvg = avg;
          topLeagueName = activeLeagues[lid].name || `League ${lid}`;
        }
      }
    });
    const totalPointsSum = records.reduce((acc, r) => acc + (r.points || 0), 0);
    const avgScore = totalSquads > 0 ? totalPointsSum / totalSquads : 0;
    const sortedScores = [...records].map((r) => r.points || 0).sort((a, b) => a - b);
    const midIdx = Math.floor(sortedScores.length / 2);
    const medianScore = sortedScores.length % 2 !== 0 ? sortedScores[midIdx] : (sortedScores[midIdx - 1] + sortedScores[midIdx]) / 2;
    let badBeat = null;
    let luckyEscape = null;
    if (!isSeason) {
      const losers = records.filter((r) => r.outcome === "loss" && r.points > 0).sort((a, b) => b.points - a.points);
      badBeat = losers[0];
      const winners = records.filter((r) => r.outcome === "win" && r.points > 0).sort((a, b) => a.points - b.points);
      luckyEscape = winners[0];
    } else {
      const losingSquads = records.filter((r) => (r.losses || 0) > (r.wins || 0)).sort((a, b) => (b.totalPoints || b.points || 0) - (a.totalPoints || a.points || 0));
      badBeat = losingSquads[0] || [...records].sort((a, b) => (b.pointsAgainst || 0) - (a.pointsAgainst || 0))[0];
      const winningSquads = records.filter((r) => (r.wins || 0) > (r.losses || 0)).sort((a, b) => (a.totalPoints || a.points || 0) - (b.totalPoints || b.points || 0));
      luckyEscape = winningSquads[0] || [...records].sort((a, b) => (a.pointsAgainst || 0) - (b.pointsAgainst || 0))[0];
    }
    const sortedBench = records.filter((r) => (r.benchPoints || 0) > 0).sort((a, b) => b.benchPoints - a.benchPoints);
    const benchKing = sortedBench[0];
    const sortedByLuckDesc = [...records].sort((a, b) => (b.luckIndex || 0) - (a.luckIndex || 0));
    const luckiest = sortedByLuckDesc[0];
    const sortedByLuckAsc = [...records].sort((a, b) => (a.luckIndex || 0) - (b.luckIndex || 0));
    const unluckiest = sortedByLuckAsc[0];
    const sortedByAllPlay = [...records].sort((a, b) => {
      const pctDiff = (b.allPlayWinPct || 0) - (a.allPlayWinPct || 0);
      if (pctDiff !== 0) return pctDiff;
      const ptsA = typeof a.totalPoints === "number" ? a.totalPoints : a.points || 0;
      const ptsB = typeof b.totalPoints === "number" ? b.totalPoints : b.points || 0;
      return ptsB - ptsA;
    });
    const allPlayLeader = sortedByAllPlay[0];
    const titleText = isSeason ? `\u{1F3C8} Season-to-Date Fantasy Recap (Weeks 1-${week}, ${season})` : `\u{1F3C8} Week ${week} Fantasy Recap (${season})`;
    let plainText = "";
    let htmlText = "";
    if (isSeason) {
      plainText = `*${titleText}*

`;
      htmlText = `<p><strong>${escapeHtml(titleText)}</strong></p><br>`;
      plainText += `*The Podium (Avg PPG)*
`;
      htmlText += `<p><strong><u>The Podium (Avg PPG)</u></strong></p>`;
      if (first) {
        plainText += `\u2022 \u{1F947} *#1* ${first.manager} (${first.teamName}) \u2014 *${first.points.toFixed(2)} PPG* (${(first.totalPoints || 0).toFixed(1)} PF, ${first.wins || 0}W-${first.losses || 0}L) \u2022 _${first.league}_
`;
        htmlText += `<p>\u2022 \u{1F947} <strong>#1</strong> ${escapeHtml(first.manager)} (${escapeHtml(first.teamName)}) \u2014 <strong>${first.points.toFixed(2)} PPG</strong> (${(first.totalPoints || 0).toFixed(1)} PF, ${first.wins || 0}W-${first.losses || 0}L) \u2022 <em>${escapeHtml(first.league)}</em></p>`;
      }
      if (second) {
        plainText += `\u2022 \u{1F948} *#2* ${second.manager} (${second.teamName}) \u2014 *${second.points.toFixed(2)} PPG* (${(second.totalPoints || 0).toFixed(1)} PF, ${second.wins || 0}W-${second.losses || 0}L) \u2022 _${second.league}_
`;
        htmlText += `<p>\u2022 \u{1F948} <strong>#2</strong> ${escapeHtml(second.manager)} (${escapeHtml(second.teamName)}) \u2014 <strong>${second.points.toFixed(2)} PPG</strong> (${(second.totalPoints || 0).toFixed(1)} PF, ${second.wins || 0}W-${second.losses || 0}L) \u2022 <em>${escapeHtml(second.league)}</em></p>`;
      }
      if (third) {
        plainText += `\u2022 \u{1F949} *#3* ${third.manager} (${third.teamName}) \u2014 *${third.points.toFixed(2)} PPG* (${(third.totalPoints || 0).toFixed(1)} PF, ${third.wins || 0}W-${third.losses || 0}L) \u2022 _${third.league}_

`;
        htmlText += `<p>\u2022 \u{1F949} <strong>#3</strong> ${escapeHtml(third.manager)} (${escapeHtml(third.teamName)}) \u2014 <strong>${third.points.toFixed(2)} PPG</strong> (${(third.totalPoints || 0).toFixed(1)} PF, ${third.wins || 0}W-${third.losses || 0}L) \u2022 <em>${escapeHtml(third.league)}</em></p><br>`;
      } else {
        plainText += `
`;
        htmlText += `<br>`;
      }
      plainText += `*Superlatives Showcase*
`;
      htmlText += `<p><strong><u>Superlatives Showcase</u></strong></p>`;
      if (badBeat) {
        plainText += `\u2022 \u{1F494} *Season Heartbreak:* ${badBeat.manager} (${badBeat.teamName}) \u2014 *${(badBeat.points || 0).toFixed(1)} PPG* with a ${badBeat.wins || 0}W-${badBeat.losses || 0}L record \u2022 _${badBeat.league}_
`;
        htmlText += `<p>\u2022 \u{1F494} <strong>Season Heartbreak:</strong> ${escapeHtml(badBeat.manager)} (${escapeHtml(badBeat.teamName)}) \u2014 <strong>${(badBeat.points || 0).toFixed(1)} PPG</strong> with a ${badBeat.wins || 0}W-${badBeat.losses || 0}L record \u2022 <em>${escapeHtml(badBeat.league)}</em></p>`;
      }
      if (luckyEscape) {
        plainText += `\u2022 \u{1FA84} *Teflon Squad:* ${luckyEscape.manager} (${luckyEscape.teamName}) \u2014 *${(luckyEscape.points || 0).toFixed(1)} PPG* with a ${luckyEscape.wins || 0}W-${luckyEscape.losses || 0}L winning record \u2022 _${luckyEscape.league}_
`;
        htmlText += `<p>\u2022 \u{1FA84} <strong>Teflon Squad:</strong> ${escapeHtml(luckyEscape.manager)} (${escapeHtml(luckyEscape.teamName)}) \u2014 <strong>${(luckyEscape.points || 0).toFixed(1)} PPG</strong> with a ${luckyEscape.wins || 0}W-${luckyEscape.losses || 0}L winning record \u2022 <em>${escapeHtml(luckyEscape.league)}</em></p>`;
      }
      if (benchKing && benchKing.benchPoints > 0) {
        plainText += `\u2022 \u{1FA91} *Bench Heavyweight:* ${benchKing.manager} (${benchKing.teamName}) \u2014 *${benchKing.benchPoints.toFixed(1)} pts* left on bench (${benchKing.efficiency ?? 100}% Lineup Efficiency) \u2022 _${benchKing.league}_

`;
        htmlText += `<p>\u2022 \u{1FA91} <strong>Bench Heavyweight:</strong> ${escapeHtml(benchKing.manager)} (${escapeHtml(benchKing.teamName)}) \u2014 <strong>${benchKing.benchPoints.toFixed(1)} pts</strong> left on bench (${benchKing.efficiency ?? 100}% Lineup Efficiency) \u2022 <em>${escapeHtml(benchKing.league)}</em></p><br>`;
      } else {
        plainText += `
`;
        htmlText += `<br>`;
      }
      plainText += `*Schedule Luck & All-Play*
`;
      htmlText += `<p><strong><u>Schedule Luck & All-Play</u></strong></p>`;
      if (luckiest) {
        const luckStr = `${(luckiest.luckIndex || 0) >= 0 ? "+" : ""}${(luckiest.luckIndex || 0).toFixed(2)}`;
        plainText += `\u2022 \u{1F340} *Luckiest Squad:* ${luckiest.manager} \u2014 *${luckStr} Luck Index* (${luckiest.wins || 0}W actual vs ${(luckiest.expectedWins || 0).toFixed(2)} xW) \u2022 _${luckiest.league}_
`;
        htmlText += `<p>\u2022 \u{1F340} <strong>Luckiest Squad:</strong> ${escapeHtml(luckiest.manager)} \u2014 <strong>${luckStr} Luck Index</strong> (${luckiest.wins || 0}W actual vs ${(luckiest.expectedWins || 0).toFixed(2)} xW) \u2022 <em>${escapeHtml(luckiest.league)}</em></p>`;
      }
      if (unluckiest) {
        const unluckStr = `${(unluckiest.luckIndex || 0) >= 0 ? "+" : ""}${(unluckiest.luckIndex || 0).toFixed(2)}`;
        plainText += `\u2022 \u{1F494} *Toughest Schedule:* ${unluckiest.manager} \u2014 *${unluckStr} Luck Index* (${unluckiest.wins || 0}W actual vs ${(unluckiest.expectedWins || 0).toFixed(2)} xW) \u2022 _${unluckiest.league}_
`;
        htmlText += `<p>\u2022 \u{1F494} <strong>Toughest Schedule:</strong> ${escapeHtml(unluckiest.manager)} \u2014 <strong>${unluckStr} Luck Index</strong> (${unluckiest.wins || 0}W actual vs ${(unluckiest.expectedWins || 0).toFixed(2)} xW) \u2022 <em>${escapeHtml(unluckiest.league)}</em></p>`;
      }
      if (allPlayLeader) {
        plainText += `\u2022 \u26A1 *All-Play Dominance:* ${allPlayLeader.manager} \u2014 *${allPlayLeader.allPlayWinPct || 0}% All-Play Win Rate* (${allPlayLeader.allPlayWins || 0}W-${allPlayLeader.allPlayLosses || 0}L) \u2022 _${allPlayLeader.league}_

`;
        htmlText += `<p>\u2022 \u26A1 <strong>All-Play Dominance:</strong> ${escapeHtml(allPlayLeader.manager)} \u2014 <strong>${allPlayLeader.allPlayWinPct || 0}% All-Play Win Rate</strong> (${allPlayLeader.allPlayWins || 0}W-${allPlayLeader.allPlayLosses || 0}L) \u2022 <em>${escapeHtml(allPlayLeader.league)}</em></p><br>`;
      } else {
        plainText += `
`;
        htmlText += `<br>`;
      }
      plainText += `*Overview*
`;
      htmlText += `<p><strong><u>Overview</u></strong></p>`;
      plainText += `\u2022 \u{1F451} *Power League:* ${topLeagueName} (Avg: *${topLeagueAvg.toFixed(2)} PPG*)
`;
      htmlText += `<p>\u2022 \u{1F451} <strong>Power League:</strong> ${escapeHtml(topLeagueName)} (Avg: <strong>${topLeagueAvg.toFixed(2)} PPG</strong>)</p>`;
      if (first && lowest) {
        plainText += `\u2022 \u{1F525} *Peak PPG:* ${first.points.toFixed(2)} (${first.manager}) | \u2744\uFE0F *Lowest PPG:* ${lowest.points.toFixed(2)} (${lowest.manager})
`;
        htmlText += `<p>\u2022 \u{1F525} <strong>Peak PPG:</strong> ${first.points.toFixed(2)} (${escapeHtml(first.manager)}) | \u2744\uFE0F <strong>Lowest PPG:</strong> ${lowest.points.toFixed(2)} (${escapeHtml(lowest.manager)})</p>`;
      }
      plainText += `\u2022 \u{1F4C8} *Benchmark:* Avg: *${avgScore.toFixed(2)} PPG* | Median: *${medianScore.toFixed(2)} PPG*
`;
      htmlText += `<p>\u2022 \u{1F4C8} <strong>Benchmark:</strong> Avg: <strong>${avgScore.toFixed(2)} PPG</strong> | Median: <strong>${medianScore.toFixed(2)} PPG</strong></p>`;
      plainText += `\u2022 \u{1F3DF}\uFE0F *Scope:* ${totalLeagues} Leagues | ${totalSquads} Squads`;
      htmlText += `<p>\u2022 \u{1F3DF}\uFE0F <strong>Scope:</strong> ${totalLeagues} Leagues | ${totalSquads} Squads</p>`;
    } else {
      plainText = `*${titleText}*

`;
      htmlText = `<p><strong>${escapeHtml(titleText)}</strong></p><br>`;
      plainText += `*The Podium (Top Scores)*
`;
      htmlText += `<p><strong><u>The Podium (Top Scores)</u></strong></p>`;
      if (first) {
        plainText += `\u2022 \u{1F947} *#1* ${first.manager} (${first.teamName}) \u2014 *${first.points.toFixed(2)} pts* \u2022 _${first.league}_
`;
        htmlText += `<p>\u2022 \u{1F947} <strong>#1</strong> ${escapeHtml(first.manager)} (${escapeHtml(first.teamName)}) \u2014 <strong>${first.points.toFixed(2)} pts</strong> \u2022 <em>${escapeHtml(first.league)}</em></p>`;
      }
      if (second) {
        plainText += `\u2022 \u{1F948} *#2* ${second.manager} (${second.teamName}) \u2014 *${second.points.toFixed(2)} pts* \u2022 _${second.league}_
`;
        htmlText += `<p>\u2022 \u{1F948} <strong>#2</strong> ${escapeHtml(second.manager)} (${escapeHtml(second.teamName)}) \u2014 <strong>${second.points.toFixed(2)} pts</strong> \u2022 <em>${escapeHtml(second.league)}</em></p>`;
      }
      if (third) {
        plainText += `\u2022 \u{1F949} *#3* ${third.manager} (${third.teamName}) \u2014 *${third.points.toFixed(2)} pts* \u2022 _${third.league}_

`;
        htmlText += `<p>\u2022 \u{1F949} <strong>#3</strong> ${escapeHtml(third.manager)} (${escapeHtml(third.teamName)}) \u2014 <strong>${third.points.toFixed(2)} pts</strong> \u2022 <em>${escapeHtml(third.league)}</em></p><br>`;
      } else {
        plainText += `
`;
        htmlText += `<br>`;
      }
      plainText += `*Superlatives Showcase*
`;
      htmlText += `<p><strong><u>Superlatives Showcase</u></strong></p>`;
      if (badBeat) {
        plainText += `\u2022 \u{1F494} *The Bad Beat:* ${badBeat.manager} (${badBeat.teamName}) scored *${badBeat.points.toFixed(2)} pts* and lost by ${Math.abs(badBeat.margin || 0).toFixed(2)} to ${badBeat.opponentName || "rival"} \u2022 _${badBeat.league}_
`;
        htmlText += `<p>\u2022 \u{1F494} <strong>The Bad Beat:</strong> ${escapeHtml(badBeat.manager)} (${escapeHtml(badBeat.teamName)}) scored <strong>${badBeat.points.toFixed(2)} pts</strong> and lost by ${Math.abs(badBeat.margin || 0).toFixed(2)} to ${escapeHtml(badBeat.opponentName || "rival")} \u2022 <em>${escapeHtml(badBeat.league)}</em></p>`;
      }
      if (luckyEscape) {
        plainText += `\u2022 \u{1FA84} *The Lucky Escape:* ${luckyEscape.manager} (${luckyEscape.teamName}) won with *${luckyEscape.points.toFixed(2)} pts* vs ${luckyEscape.opponentName || "rival"} \u2022 _${luckyEscape.league}_
`;
        htmlText += `<p>\u2022 \u{1FA84} <strong>The Lucky Escape:</strong> ${escapeHtml(luckyEscape.manager)} (${escapeHtml(luckyEscape.teamName)}) won with <strong>${luckyEscape.points.toFixed(2)} pts</strong> vs ${escapeHtml(luckyEscape.opponentName || "rival")} \u2022 <em>${escapeHtml(luckyEscape.league)}</em></p>`;
      }
      if (benchKing && benchKing.benchPoints > 0) {
        plainText += `\u2022 \u{1FA91} *Bench Heavyweight:* ${benchKing.manager} (${benchKing.teamName}) left *${benchKing.benchPoints.toFixed(2)} pts* on bench (${benchKing.efficiency ?? 100}% Lineup Efficiency) \u2022 _${benchKing.league}_

`;
        htmlText += `<p>\u2022 \u{1FA91} <strong>Bench Heavyweight:</strong> ${escapeHtml(benchKing.manager)} (${escapeHtml(benchKing.teamName)}) left <strong>${benchKing.benchPoints.toFixed(2)} pts</strong> on bench (${benchKing.efficiency ?? 100}% Lineup Efficiency) \u2022 <em>${escapeHtml(benchKing.league)}</em></p><br>`;
      } else {
        plainText += `
`;
        htmlText += `<br>`;
      }
      plainText += `*Schedule Luck & All-Play*
`;
      htmlText += `<p><strong><u>Schedule Luck & All-Play</u></strong></p>`;
      if (luckiest) {
        const luckStr = `${(luckiest.luckIndex || 0) >= 0 ? "+" : ""}${(luckiest.luckIndex || 0).toFixed(2)}`;
        plainText += `\u2022 \u{1F340} *Luckiest Draw:* ${luckiest.manager} \u2014 *${luckStr} Luck Index* (${(luckiest.expectedWins || 0).toFixed(2)} xW) \u2022 _${luckiest.league}_
`;
        htmlText += `<p>\u2022 \u{1F340} <strong>Luckiest Draw:</strong> ${escapeHtml(luckiest.manager)} \u2014 <strong>${luckStr} Luck Index</strong> (${(luckiest.expectedWins || 0).toFixed(2)} xW) \u2022 <em>${escapeHtml(luckiest.league)}</em></p>`;
      }
      if (unluckiest) {
        const unluckStr = `${(unluckiest.luckIndex || 0) >= 0 ? "+" : ""}${(unluckiest.luckIndex || 0).toFixed(2)}`;
        plainText += `\u2022 \u{1F494} *Toughest Draw:* ${unluckiest.manager} \u2014 *${unluckStr} Luck Index* (${(unluckiest.expectedWins || 0).toFixed(2)} xW) \u2022 _${unluckiest.league}_
`;
        htmlText += `<p>\u2022 \u{1F494} <strong>Toughest Draw:</strong> ${escapeHtml(unluckiest.manager)} \u2014 <strong>${unluckStr} Luck Index</strong> (${(unluckiest.expectedWins || 0).toFixed(2)} xW) \u2022 <em>${escapeHtml(unluckiest.league)}</em></p>`;
      }
      if (allPlayLeader) {
        plainText += `\u2022 \u26A1 *All-Play Leader:* ${allPlayLeader.manager} \u2014 *${allPlayLeader.allPlayWinPct || 0}% Win Rate* (${allPlayLeader.allPlayWins || 0}W-${allPlayLeader.allPlayLosses || 0}L) \u2022 _${allPlayLeader.league}_

`;
        htmlText += `<p>\u2022 \u26A1 <strong>All-Play Leader:</strong> ${escapeHtml(allPlayLeader.manager)} \u2014 <strong>${allPlayLeader.allPlayWinPct || 0}% Win Rate</strong> (${allPlayLeader.allPlayWins || 0}W-${allPlayLeader.allPlayLosses || 0}L) \u2022 <em>${escapeHtml(allPlayLeader.league)}</em></p><br>`;
      } else {
        plainText += `
`;
        htmlText += `<br>`;
      }
      plainText += `*Overview*
`;
      htmlText += `<p><strong><u>Overview</u></strong></p>`;
      plainText += `\u2022 \u{1F451} *Power League:* ${topLeagueName} (Avg: *${topLeagueAvg.toFixed(2)} pts*)
`;
      htmlText += `<p>\u2022 \u{1F451} <strong>Power League:</strong> ${escapeHtml(topLeagueName)} (Avg: <strong>${topLeagueAvg.toFixed(2)} pts</strong>)</p>`;
      if (first && lowest) {
        plainText += `\u2022 \u{1F525} *Peak Score:* ${first.points.toFixed(2)} pts (${first.manager}) | \u2744\uFE0F *Lowest Score:* ${lowest.points.toFixed(2)} pts (${lowest.manager})
`;
        htmlText += `<p>\u2022 \u{1F525} <strong>Peak Score:</strong> ${first.points.toFixed(2)} pts (${escapeHtml(first.manager)}) | \u2744\uFE0F <strong>Lowest Score:</strong> ${lowest.points.toFixed(2)} pts (${escapeHtml(lowest.manager)})</p>`;
      }
      plainText += `\u2022 \u{1F4C8} *Benchmark:* Avg: *${avgScore.toFixed(2)} pts* | Median: *${medianScore.toFixed(2)} pts* | Spread: *${(first.points - lowest.points).toFixed(2)} pts*
`;
      htmlText += `<p>\u2022 \u{1F4C8} <strong>Benchmark:</strong> Avg: <strong>${avgScore.toFixed(2)} pts</strong> | Median: <strong>${medianScore.toFixed(2)} pts</strong> | Spread: <strong>${(first.points - lowest.points).toFixed(2)} pts</strong></p>`;
      plainText += `\u2022 \u{1F3DF}\uFE0F *Scope:* ${totalLeagues} Leagues | ${totalSquads} Squads`;
      htmlText += `<p>\u2022 \u{1F3DF}\uFE0F <strong>Scope:</strong> ${totalLeagues} Leagues | ${totalSquads} Squads</p>`;
    }
    return { plainText, htmlText };
  }
  function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const copyRecapBtnText = document.getElementById("copyRecapBtnText");
    try {
      document.execCommand("copy");
      showToast("Recap copied to clipboard!", "\u{1F4CB}");
      if (copyRecapBtnText) {
        const orig = copyRecapBtnText.textContent;
        copyRecapBtnText.textContent = "Recap Copied! \u{1F4CB}";
        setTimeout(() => {
          copyRecapBtnText.textContent = orig;
        }, 2500);
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      showError("Could not copy to clipboard. Please copy manually from the table.");
    }
    document.body.removeChild(textArea);
  }
  async function copyChatRecap() {
    const activeRecords = getActiveRecords();
    if (!activeRecords || activeRecords.length === 0) {
      showError("No data available to generate chat recap.");
      return;
    }
    const isSeason = state.currentMode === "SEASON_ROLLUP";
    const weekInput = document.getElementById("weekInput");
    const seasonInput = document.getElementById("seasonInput");
    const copyRecapBtnText = document.getElementById("copyRecapBtnText");
    const week = weekInput ? parseInt(weekInput.value, 10) : 1;
    const season = seasonInput ? seasonInput.value : "2026";
    const activeLeagues = getActiveLeaguesMap();
    const { plainText, htmlText } = formatRecapText(activeRecords, activeLeagues, {
      isSeason,
      week,
      season
    });
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard && navigator.clipboard.write) {
        const item = new ClipboardItem({
          "text/html": new Blob([htmlText], { type: "text/html" }),
          "text/plain": new Blob([plainText], { type: "text/plain" })
        });
        await navigator.clipboard.write([item]);
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(plainText);
      } else {
        fallbackCopyText(plainText);
        return;
      }
      showToast("Recap copied to clipboard!", "\u{1F4CB}");
      if (copyRecapBtnText) {
        const orig = copyRecapBtnText.textContent;
        copyRecapBtnText.textContent = "Recap Copied! \u{1F4CB}";
        setTimeout(() => {
          copyRecapBtnText.textContent = orig;
        }, 2500);
      }
    } catch (err) {
      console.warn("ClipboardItem write failed, fallback to plain text:", err);
      fallbackCopyText(plainText);
    }
  }

  // src/js/export/csv.js
  init_store();
  function exportCsv() {
    const activeRecords = getActiveRecords();
    if (!activeRecords.length) return;
    const sorted = [...activeRecords].sort((a, b) => b.points - a.points);
    const isSeason = state.currentMode === "SEASON_ROLLUP";
    const weekInput = document.getElementById("weekInput");
    const seasonInput = document.getElementById("seasonInput");
    const weekVal = weekInput ? weekInput.value : "1";
    const seasonVal = seasonInput ? seasonInput.value : "2026";
    let headers, rows;
    if (isSeason) {
      headers = [
        "Rank",
        "Avg PPG",
        "Total PF",
        "Points Against",
        "Manager",
        "Team Name",
        "League",
        "League ID",
        "Wins",
        "Losses",
        "Ties",
        "Win %",
        "All-Play Record",
        "All-Play Win %",
        "Expected Wins",
        "Luck Index",
        "Std Dev",
        "Lineup Efficiency %"
      ];
      rows = sorted.map((r, i) => [
        i + 1,
        r.points,
        r.totalPoints || 0,
        r.pointsAgainst || 0,
        `"${(r.manager || "").replace(/"/g, '""')}"`,
        `"${(r.teamName || "").replace(/"/g, '""')}"`,
        `"${(r.league || "").replace(/"/g, '""')}"`,
        r.leagueId,
        r.wins || 0,
        r.losses || 0,
        r.ties || 0,
        `${r.winPct || 0}%`,
        `"${r.allPlayWins || 0}-${r.allPlayLosses || 0}${r.allPlayTies > 0 ? `-${r.allPlayTies}` : ""}"`,
        `${r.allPlayWinPct || 0}%`,
        (r.expectedWins || 0).toFixed(2),
        (r.luckIndex || 0).toFixed(2),
        r.stdDev || 0,
        `${r.efficiency ?? 100}%`
      ]);
    } else {
      headers = [
        "Rank",
        "Points",
        "Points Against",
        "Manager",
        "Team Name",
        "League",
        "League ID",
        "Week",
        "Matchup Result",
        "Opponent",
        "Margin",
        "All-Play Record",
        "Expected Wins",
        "Luck Index",
        "Starters Total",
        "Bench Points",
        "Lineup Efficiency %"
      ];
      rows = sorted.map((r, i) => [
        i + 1,
        r.points,
        r.pointsAgainst || 0,
        `"${(r.manager || "").replace(/"/g, '""')}"`,
        `"${(r.teamName || "").replace(/"/g, '""')}"`,
        `"${(r.league || "").replace(/"/g, '""')}"`,
        r.leagueId,
        r.week,
        r.outcome || "N/A",
        `"${(r.opponentName || "").replace(/"/g, '""')}"`,
        r.margin || 0,
        `"${r.allPlayWins || 0}-${r.allPlayLosses || 0}${r.allPlayTies > 0 ? `-${r.allPlayTies}` : ""}"`,
        (r.expectedWins || 0).toFixed(2),
        (r.luckIndex || 0).toFixed(2),
        r.startersTotal || 0,
        r.benchPoints || 0,
        `${r.efficiency ?? 100}%`
      ]);
    }
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `crossleague_${state.currentMode.toLowerCase()}_week_${weekVal}_${seasonVal}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // src/js/export/share.js
  init_store();
  init_tabs();
  init_dom();
  function buildShareableUrl() {
    const seasonInput = document.getElementById("seasonInput");
    const weekInput = document.getElementById("weekInput");
    const modeSelect = document.getElementById("modeSelect");
    const season = seasonInput ? seasonInput.value : "2024";
    const week = weekInput ? weekInput.value : "1";
    const mode = state.currentMode || (modeSelect ? modeSelect.value : "WEEKLY");
    const currentTab = getCurrentlyActiveTab();
    const url = new URL(window.location.href);
    url.search = "";
    if (state.currentPlatform === "espn") url.searchParams.set("platform", "espn");
    if (season) url.searchParams.set("season", season);
    if (week) url.searchParams.set("week", week);
    if (mode) url.searchParams.set("mode", mode);
    let leagueIds = [];
    if (state.selectedLeagueIds && state.selectedLeagueIds.size > 0) {
      leagueIds = Array.from(state.selectedLeagueIds);
    } else if (state.allLeaguesData && state.allLeaguesData.length > 0) {
      leagueIds = state.allLeaguesData.map((l) => l.league_id);
    } else if (state.customLeagueIds && state.customLeagueIds.size > 0) {
      leagueIds = Array.from(state.customLeagueIds);
    }
    const cleanLeagueIds = leagueIds.map(
      (id) => String(id).replace(/^(espn|sleeper):/i, "").trim()
    ).filter(Boolean);
    if (cleanLeagueIds.length > 0) {
      url.searchParams.set("leagues", cleanLeagueIds.join(","));
    }
    url.hash = `#${currentTab}`;
    return url.toString();
  }
  async function shareUrl() {
    const shareableUrl = buildShareableUrl();
    const shareUrlBtnText = document.getElementById("shareUrlBtnText");
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareableUrl);
      } else {
        const ta = document.createElement("textarea");
        ta.value = shareableUrl;
        ta.style.position = "fixed";
        ta.style.left = "-999999px";
        ta.style.top = "-999999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      showToast("Shareable link copied to clipboard!", "\u{1F517}");
      if (shareUrlBtnText) {
        const orig = shareUrlBtnText.textContent;
        shareUrlBtnText.textContent = "Link Copied! \u{1F517}";
        setTimeout(() => {
          shareUrlBtnText.textContent = orig;
        }, 2500);
      }
    } catch (err) {
      console.error("Failed to copy URL:", err);
      showError("Could not copy link to clipboard.");
    }
  }

  // src/js/export/report.js
  init_store();
  init_players();
  init_dom();
  init_dropdowns();
  async function downloadReport() {
    return shareReport();
  }
  async function shareReport() {
    if (!state.rawRecords || state.rawRecords.length === 0) {
      showError("No data available to generate report. Please sync a Sleeper or ESPN account first.");
      return;
    }
    try {
      await initPlayersDb();
    } catch (e) {
      console.warn("Could not prefetch player DB for export:", e);
    }
    const weekInput = document.getElementById("weekInput");
    const seasonInput = document.getElementById("seasonInput");
    const downloadReportBtnText = document.getElementById("downloadReportBtnText");
    const shareReportBtnText = document.getElementById("shareReportBtnText");
    const week = weekInput ? parseInt(weekInput.value, 10) : 1;
    const season = seasonInput ? seasonInput.value : "2026";
    const exportedLeagueIds = Array.from(state.selectedLeagueIds);
    const exportedRecords = state.rawRecords.filter((r) => state.selectedLeagueIds.has(r.leagueId));
    const exportedLeaguesMap = {};
    const exportedAllLeaguesData = [];
    for (const lid of exportedLeagueIds) {
      if (state.leaguesMap[lid]) exportedLeaguesMap[lid] = state.leaguesMap[lid];
      const leagueEntry = state.allLeaguesData.find((l) => l.league_id === lid);
      if (leagueEntry) exportedAllLeaguesData.push(leagueEntry);
    }
    const payload = {
      version: "2.0",
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      mode: state.currentMode,
      user: {
        id: state.currentUserId,
        name: state.currentUserName,
        avatar: state.currentUserAvatar
      },
      season,
      week,
      records: exportedRecords,
      leaguesMap: exportedLeaguesMap,
      allLeaguesData: exportedAllLeaguesData,
      selectedLeagueIds: exportedLeagueIds,
      playersDb: state.sleeperPlayersDb || {},
      espnPlayersDb: state.espnPlayersDb || {}
    };
    let cssContent = "";
    const cssCandidates = [
      "dist/styles.min.css",
      "styles.min.css",
      "styles.css",
      "src/css/styles.css"
    ];
    for (const candidate of cssCandidates) {
      try {
        const cssResp = await fetch(candidate);
        if (cssResp.ok) {
          cssContent = await cssResp.text();
          break;
        }
      } catch {
      }
    }
    let jsContent = "";
    const jsCandidates = ["dist/app.min.js", "app.min.js", "app.js", "src/js/index.js"];
    for (const candidate of jsCandidates) {
      try {
        const jsResp = await fetch(candidate);
        if (jsResp.ok) {
          jsContent = await jsResp.text();
          break;
        }
      } catch {
      }
    }
    let html = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
    const existingScriptPattern = new RegExp(
      '<script id="embedded-report-data">[\\s\\S]*?<\/script>\\n?',
      "gi"
    );
    html = html.replace(existingScriptPattern, "");
    if (cssContent) {
      html = html.replace(
        /<link[^>]*href=["'][^"']*styles(\.min)?\.css["'][^>]*>/gi,
        () => `<style>
${cssContent}
</style>`
      );
    }
    if (jsContent) {
      const sOpen = "<script>";
      const sClose = "<\/script>";
      const scriptPattern = new RegExp(
        `<script[^>]*src=["'][^"']*(app|index)(\\.min)?\\.js["'][^>]*><\/script>`,
        "gi"
      );
      html = html.replace(scriptPattern, () => `${sOpen}
${jsContent}
${sClose}`);
    }
    const jsonStr = JSON.stringify(payload).replace(new RegExp("<\/script", "gi"), "<\\/script");
    const openTag = '<script id="embedded-report-data">';
    const closeTag = "<\/script>";
    const embeddedScript = `${openTag}
  window.__EMBEDDED_REPORT__ = ${jsonStr};
${closeTag}
`;
    if (html.includes("</head>")) {
      html = html.replace("</head>", () => `${embeddedScript}</head>`);
    } else {
      html = embeddedScript + html;
    }
    const filename = "crossleague.html";
    try {
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1e4);
      showToast("Report downloaded successfully!", "\u{1F4C1}");
    } catch (err) {
      console.error("Blob download error:", err);
      showError("Failed to generate download file. Please try again.");
    }
    if (downloadReportBtnText) {
      const originalText = downloadReportBtnText.textContent;
      downloadReportBtnText.textContent = "Report Downloaded! \u{1F4C1}";
      setTimeout(() => {
        downloadReportBtnText.textContent = originalText;
      }, 2500);
    }
    if (shareReportBtnText && shareReportBtnText !== downloadReportBtnText) {
      const originalText = shareReportBtnText.textContent;
      shareReportBtnText.textContent = "Report Downloaded! \u{1F4C1}";
      setTimeout(() => {
        shareReportBtnText.textContent = originalText;
      }, 2500);
    }
  }
  function loadEmbeddedReport(data, refreshFn) {
    if (!data) return false;
    const modeSelect = document.getElementById("modeSelect");
    const userIdInput = document.getElementById("userIdInput");
    const seasonInput = document.getElementById("seasonInput");
    const weekInput = document.getElementById("weekInput");
    const reportContent = document.getElementById("reportContent");
    const initialState = document.getElementById("initialState");
    const skeletonLoader = document.getElementById("skeletonLoader");
    const syncControlCenter = document.getElementById("syncControlCenter");
    const liveSyncIndicator = document.getElementById("liveSyncIndicator");
    const headerSeasonBadge = document.getElementById("headerSeasonBadge");
    const headerWeekBadge = document.getElementById("headerWeekBadge");
    const btnOpenSettingsModal = document.getElementById("btnOpenSettingsModal");
    const snapshotSubtitle = document.getElementById("snapshotSubtitle");
    const snapshotIndicator = document.getElementById("snapshotIndicator");
    const shareUrlBtn = document.getElementById("shareUrlBtn");
    const downloadReportBtn = document.getElementById("downloadReportBtn");
    const shareReportBtn = document.getElementById("shareReportBtn");
    const copyRecapBtn = document.getElementById("copyRecapBtn");
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    state.currentMode = data.mode || "WEEKLY";
    if (modeSelect) modeSelect.value = state.currentMode;
    updateModeUI();
    state.currentUserId = data.user ? data.user.id : "";
    state.currentUserName = data.user ? data.user.name : "";
    state.currentUserAvatar = data.user ? data.user.avatar : "";
    if (userIdInput && state.currentUserName) {
      userIdInput.value = state.currentUserName || state.currentUserId;
    }
    if (seasonInput && data.season) {
      seasonInput.value = String(data.season);
    }
    if (weekInput && data.week) {
      weekInput.value = String(data.week);
    }
    if (data.playersDb && Object.keys(data.playersDb).length > 0) {
      state.sleeperPlayersDb = data.playersDb;
    }
    if (data.espnPlayersDb && Object.keys(data.espnPlayersDb).length > 0) {
      state.espnPlayersDb = { ...state.espnPlayersDb, ...data.espnPlayersDb };
    }
    state.rawRecords = (data.records || []).map((r) => ({
      ...r,
      efficiency: typeof r.efficiency === "number" && !isNaN(r.efficiency) ? r.efficiency : 100,
      benchPoints: typeof r.benchPoints === "number" && !isNaN(r.benchPoints) ? r.benchPoints : 0,
      outcome: r.outcome || "unpaired",
      winPct: typeof r.winPct === "number" && !isNaN(r.winPct) ? r.winPct : 0,
      startersList: Array.isArray(r.startersList) ? r.startersList : [],
      allPlayersList: Array.isArray(r.allPlayersList) ? r.allPlayersList : [],
      playersPointsMap: r.playersPointsMap || {},
      startersPoints: Array.isArray(r.startersPoints) ? r.startersPoints : [],
      weeklyPlayerRecords: Array.isArray(r.weeklyPlayerRecords) ? r.weeklyPlayerRecords : []
    }));
    state.leaguesMap = data.leaguesMap || {};
    state.allLeaguesData = data.allLeaguesData || [];
    state.selectedLeagueIds = new Set(
      data.selectedLeagueIds || state.allLeaguesData.map((l) => l.league_id)
    );
    setLoading(false);
    if (initialState) initialState.classList.add("hidden");
    if (skeletonLoader) skeletonLoader.classList.add("hidden");
    if (syncControlCenter) syncControlCenter.classList.add("hidden");
    if (liveSyncIndicator) liveSyncIndicator.classList.add("hidden");
    if (headerSeasonBadge) headerSeasonBadge.classList.add("hidden");
    if (headerWeekBadge) headerWeekBadge.classList.add("hidden");
    if (btnOpenSettingsModal) btnOpenSettingsModal.classList.add("hidden");
    const dateFormatted = data.generatedAt ? new Date(data.generatedAt).toLocaleDateString(void 0, {
      year: "numeric",
      month: "short",
      day: "numeric"
    }) : "";
    if (snapshotSubtitle) {
      const modeTitle = state.currentMode === "SEASON_ROLLUP" ? `Season Rollup (Weeks 1\u2013${data.week || 1})` : `Week ${data.week || 1}`;
      snapshotSubtitle.textContent = `\u{1F4C1} ${modeTitle} \u2022 ${data.season || 2024} NFL Season${dateFormatted ? " \u2022 Generated " + dateFormatted : ""}`;
      snapshotSubtitle.classList.remove("hidden");
    }
    if (snapshotIndicator) {
      snapshotIndicator.classList.remove("hidden");
      snapshotIndicator.title = `Embedded Snapshot${dateFormatted ? " created on " + dateFormatted : ""}`;
    }
    if (reportContent) reportContent.classList.remove("hidden");
    if (shareUrlBtn) shareUrlBtn.classList.add("hidden");
    if (downloadReportBtn) downloadReportBtn.classList.add("hidden");
    if (shareReportBtn) shareReportBtn.classList.add("hidden");
    if (copyRecapBtn) copyRecapBtn.classList.add("hidden");
    if (exportCsvBtn) exportCsvBtn.classList.add("hidden");
    initPlayersDb();
    renderLeagueDropdown();
    if (typeof refreshFn === "function") {
      refreshFn();
    }
    return true;
  }

  // src/js/index.js
  init_store();
  init_constants();
  init_cache();
  init_preferences();
  init_urlParams();
  init_sleeper();
  init_players();
  init_dom();
  init_modal();
  init_preferences();
  init_dropdowns();
  init_tabs();
  async function fetchLeaderboard() {
    const userIdInput = document.getElementById("userIdInput");
    const seasonInput = document.getElementById("seasonInput");
    const weekInput = document.getElementById("weekInput");
    const modeSelect = document.getElementById("modeSelect");
    const initialState = document.getElementById("initialState");
    const reportContent = document.getElementById("reportContent");
    const copyRecapBtn = document.getElementById("copyRecapBtn");
    const shareUrlBtn = document.getElementById("shareUrlBtn");
    const downloadReportBtn = document.getElementById("downloadReportBtn");
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    const isLeaguesSync = state.currentSyncType === "leagues" || state.currentPlatform === "espn";
    const inputVal = userIdInput ? userIdInput.value.trim() : "";
    const season = seasonInput ? seasonInput.value : "2024";
    const targetWeek = weekInput ? parseInt(weekInput.value, 10) : 1;
    const mode = modeSelect ? modeSelect.value : "WEEKLY";
    const hasPendingLeagues = Boolean(
      state.pendingLeagueIdsFilter && state.pendingLeagueIdsFilter.size > 0
    );
    const hasCustomLeagues = Boolean(state.customLeagueIds && state.customLeagueIds.size > 0);
    let targetIds = [];
    if (isLeaguesSync || state.currentPlatform === "espn" || !inputVal && (hasPendingLeagues || hasCustomLeagues)) {
      targetIds = hasPendingLeagues ? Array.from(state.pendingLeagueIdsFilter) : Array.from(state.customLeagueIds);
      if (targetIds.length === 0) {
        showError(
          state.currentPlatform === "espn" ? "Please enter at least one ESPN League ID." : "Please enter at least one League ID."
        );
        return;
      }
      savePreferences();
      setLoading(true, `Fetching data for ${targetIds.length} leagues...`);
    } else {
      if (!inputVal) {
        showError("Please enter a Sleeper username or numeric User ID.");
        return;
      }
      savePreferences();
      setLoading(true, "Looking up Sleeper profile...");
    }
    try {
      const combinedLeaguesData = [];
      const combinedRecords = [];
      state.leaguesMap = {};
      if (state.currentPlatform === "espn") {
        const espnTargetIds = targetIds.map(
          (rawId) => String(rawId).trim().replace(/^espn:/, "")
        );
        updateProgress(20, `Fetching ${espnTargetIds.length} ESPN leagues...`);
        let completedEspn = 0;
        await Promise.all(
          espnTargetIds.map(async (espnId) => {
            try {
              const res = await fetchEspnLeague(espnId, season, targetWeek, mode);
              if (res && res.leagueInfo) {
                combinedLeaguesData.push(res.leagueInfo);
                state.leaguesMap[res.leagueInfo.league_id] = {
                  name: res.leagueInfo.name,
                  avatar: res.leagueInfo.avatar,
                  platform: "espn",
                  rosterCount: res.leagueInfo.total_rosters,
                  scores: (res.records || []).map((r) => r.points)
                };
                (res.records || []).forEach((r) => combinedRecords.push(r));
              }
            } catch (err) {
              console.error(`Error loading ESPN league ${espnId}:`, err);
              showError(`Error loading ESPN League ${espnId}: ${err.message}`);
              throw err;
            } finally {
              completedEspn++;
              const percent = 20 + Math.round(completedEspn / espnTargetIds.length * 75);
              updateProgress(
                percent,
                `Loaded ${completedEspn}/${espnTargetIds.length} ESPN leagues...`
              );
            }
          })
        );
      } else {
        const sleeperTargetIds = targetIds.map(
          (rawId) => String(rawId).trim().replace(/^sleeper:/, "")
        );
        let sleeperLeaguesData = [];
        if (!isLeaguesSync && inputVal) {
          const [userObj] = await Promise.all([resolveUser(inputVal), initPlayersDb()]);
          state.currentUserId = userObj.userId;
          state.currentUserName = userObj.displayName;
          state.currentUserAvatar = userObj.avatar;
          updateProgress(15, "Fetching active Sleeper leagues...");
          sleeperLeaguesData = await apiFetch(`/user/${state.currentUserId}/leagues/nfl/${season}`);
        } else if (sleeperTargetIds.length > 0) {
          state.currentUserId = "";
          state.currentUserName = "";
          state.currentUserAvatar = "";
          updateSettingsButtonBadge();
          await initPlayersDb();
          updateProgress(15, "Fetching Sleeper league metadata...");
          const fetched = await Promise.all(
            sleeperTargetIds.map((lid) => apiFetch(`/league/${lid}`).catch(() => null))
          );
          sleeperLeaguesData = fetched.filter((l) => l && l.league_id);
        }
        if (sleeperLeaguesData && sleeperLeaguesData.length > 0) {
          sleeperLeaguesData.forEach((l) => {
            l.platform = "sleeper";
            combinedLeaguesData.push(l);
          });
          if (mode === "SEASON_ROLLUP") {
            const totalSleeper = sleeperLeaguesData.length;
            const teamRollups = {};
            let completedCalls = 0;
            await Promise.all(
              sleeperLeaguesData.map(async (league) => {
                const lid = league.league_id;
                const lname = league.name || `League ${lid}`;
                const lavatar = league.avatar || null;
                state.leaguesMap[lid] = {
                  name: lname,
                  avatar: lavatar,
                  platform: "sleeper",
                  rosterCount: league.total_rosters || 12,
                  scores: []
                };
                try {
                  const [usersRaw, rostersRaw] = await Promise.all([
                    apiFetch(`/league/${lid}/users`).catch(() => []),
                    apiFetch(`/league/${lid}/rosters`).catch(() => [])
                  ]);
                  const userMap = {};
                  for (const u of usersRaw) {
                    const uid = u.user_id;
                    const meta = u.metadata || {};
                    userMap[uid] = {
                      displayName: u.display_name || u.username || "Unknown",
                      teamName: meta.team_name || null,
                      avatar: u.avatar || null
                    };
                  }
                  const weeksToFetch = [];
                  for (let w = 1; w <= targetWeek; w++) weeksToFetch.push(w);
                  const weeklyMatchupsList = await Promise.all(
                    weeksToFetch.map((w) => apiFetch(`/league/${lid}/matchups/${w}`).catch(() => []))
                  );
                  weeksToFetch.forEach((w, idx) => {
                    const matchupsRaw = weeklyMatchupsList[idx];
                    const weekRecords = processWeeklyMatchups(
                      matchupsRaw,
                      rostersRaw,
                      userMap,
                      lid,
                      lname,
                      lavatar,
                      w
                    );
                    for (const r of weekRecords) {
                      const rosterId = r.id;
                      if (!teamRollups[rosterId]) {
                        teamRollups[rosterId] = {
                          id: rosterId,
                          leagueId: lid,
                          league: lname,
                          leagueAvatar: lavatar,
                          manager: r.manager,
                          teamName: r.teamName,
                          avatar: r.avatar,
                          totalPoints: 0,
                          totalBenchPoints: 0,
                          wins: 0,
                          losses: 0,
                          ties: 0,
                          allPlayWins: 0,
                          allPlayLosses: 0,
                          allPlayTies: 0,
                          expectedWins: 0,
                          opponentPointsTotal: 0,
                          weeklyScores: [],
                          efficiencies: [],
                          weeklyPlayerRecords: []
                        };
                      }
                      teamRollups[rosterId].totalPoints += r.points;
                      teamRollups[rosterId].totalBenchPoints += r.benchPoints || 0;
                      teamRollups[rosterId].weeklyScores.push(r.points);
                      teamRollups[rosterId].efficiencies.push(r.efficiency || 100);
                      teamRollups[rosterId].weeklyPlayerRecords.push({
                        week: w,
                        startersList: r.startersList || [],
                        allPlayersList: r.allPlayersList || [],
                        playersPointsMap: r.playersPointsMap || {}
                      });
                      if (r.result === "WIN" || r.outcome === "win") teamRollups[rosterId].wins += 1;
                      else if (r.result === "LOSS" || r.outcome === "loss")
                        teamRollups[rosterId].losses += 1;
                      else if (r.result === "TIE" || r.outcome === "tie")
                        teamRollups[rosterId].ties += 1;
                      teamRollups[rosterId].allPlayWins += r.allPlayWins;
                      teamRollups[rosterId].allPlayLosses += r.allPlayLosses;
                      teamRollups[rosterId].allPlayTies += r.allPlayTies;
                      teamRollups[rosterId].expectedWins += r.expectedWins;
                      teamRollups[rosterId].opponentPointsTotal += r.pointsAgainst || r.opponentPoints || 0;
                      state.leaguesMap[lid].scores.push(r.points);
                    }
                  });
                } catch (err) {
                  console.error(`Error loading season data for league ${lid}:`, err);
                } finally {
                  completedCalls++;
                  const percent = 25 + Math.round(completedCalls / totalSleeper * 70);
                  updateProgress(
                    percent,
                    `Processed ${completedCalls}/${totalSleeper} Sleeper leagues...`
                  );
                }
              })
            );
            const sleeperRollupRecords = Object.values(teamRollups).map((t) => {
              const weeksCount = t.weeklyScores.length || 1;
              const avgPts = Math.round(t.totalPoints / weeksCount * 100) / 100;
              const roundedTotal = Math.round(t.totalPoints * 100) / 100;
              const stdDev = calculateStdDev(t.weeklyScores);
              const highScore = t.weeklyScores.length > 0 ? Math.max(...t.weeklyScores) : 0;
              const lowScore = t.weeklyScores.length > 0 ? Math.min(...t.weeklyScores) : 0;
              const avgEff = t.efficiencies.length > 0 ? Math.round(t.efficiencies.reduce((a, b) => a + b, 0) / t.efficiencies.length) : 100;
              const totalAp = t.allPlayWins + t.allPlayLosses + t.allPlayTies;
              const apWinPct = totalAp > 0 ? Math.round((t.allPlayWins + 0.5 * t.allPlayTies) / totalAp * 100) : 0;
              const actWins = t.wins + 0.5 * t.ties;
              const expWins = Math.round(t.expectedWins * 100) / 100;
              const seasonLuck = Math.round((actWins - expWins) * 100) / 100;
              const avgPa = weeksCount > 0 ? Math.round(t.opponentPointsTotal / weeksCount * 100) / 100 : 0;
              return {
                id: t.id,
                leagueId: t.leagueId,
                league: t.league,
                leagueAvatar: t.leagueAvatar,
                manager: t.manager,
                teamName: t.teamName,
                avatar: t.avatar,
                platform: "sleeper",
                points: avgPts,
                totalPoints: roundedTotal,
                avgPoints: avgPts,
                weeksCount,
                stdDev,
                highScore,
                lowScore,
                wins: t.wins,
                losses: t.losses,
                ties: t.ties,
                winPct: t.wins + t.losses + t.ties > 0 ? Math.round(t.wins / (t.wins + t.losses + t.ties) * 100) : 0,
                allPlayWins: t.allPlayWins,
                allPlayLosses: t.allPlayLosses,
                allPlayTies: t.allPlayTies,
                allPlayWinPct: apWinPct,
                expectedWins: expWins,
                actualWins: actWins,
                luckIndex: seasonLuck,
                pointsAgainst: avgPa,
                totalPointsAgainst: Math.round(t.opponentPointsTotal * 100) / 100,
                benchPoints: Math.round(t.totalBenchPoints / weeksCount * 100) / 100,
                efficiency: avgEff,
                startersTotal: avgPts,
                weeklyScores: t.weeklyScores,
                weeklyPlayerRecords: t.weeklyPlayerRecords
              };
            });
            sleeperRollupRecords.forEach((r) => combinedRecords.push(r));
          } else {
            const totalSleeper = sleeperLeaguesData.length;
            let completedLeagues = 0;
            await Promise.all(
              sleeperLeaguesData.map(async (league) => {
                const lid = league.league_id;
                const lname = league.name || `League ${lid}`;
                const lavatar = league.avatar || null;
                state.leaguesMap[lid] = {
                  name: lname,
                  avatar: lavatar,
                  platform: "sleeper",
                  rosterCount: league.total_rosters || 12,
                  scores: []
                };
                try {
                  const [usersRaw, rostersRaw, matchupsRaw] = await Promise.all([
                    apiFetch(`/league/${lid}/users`).catch(() => []),
                    apiFetch(`/league/${lid}/rosters`).catch(() => []),
                    apiFetch(`/league/${lid}/matchups/${targetWeek}`).catch(() => [])
                  ]);
                  const userMap = {};
                  for (const u of usersRaw) {
                    const uid = u.user_id;
                    const meta = u.metadata || {};
                    userMap[uid] = {
                      displayName: u.display_name || u.username || "Unknown",
                      teamName: meta.team_name || null,
                      avatar: u.avatar || null
                    };
                  }
                  const weekRecords = processWeeklyMatchups(
                    matchupsRaw,
                    rostersRaw,
                    userMap,
                    lid,
                    lname,
                    lavatar,
                    targetWeek
                  );
                  weekRecords.forEach((r) => {
                    r.platform = "sleeper";
                    combinedRecords.push(r);
                    state.leaguesMap[lid].scores.push(r.points);
                  });
                } catch (err) {
                  console.error(`Error loading league ${lid}:`, err);
                } finally {
                  completedLeagues++;
                  const percent = 30 + Math.round(completedLeagues / totalSleeper * 65);
                  updateProgress(
                    percent,
                    `Loaded ${completedLeagues}/${totalSleeper} Sleeper leagues...`
                  );
                }
              })
            );
          }
        }
      }
      if (combinedRecords.length === 0) {
        showError(`No scores found for the requested season/week across selected platforms.`);
        return;
      }
      state.rawRecords = combinedRecords;
      state.allLeaguesData = combinedLeaguesData;
      if (state.pendingLeagueIdsFilter && state.pendingLeagueIdsFilter.size > 0) {
        state.selectedLeagueIds = new Set(
          combinedLeaguesData.map((l) => l.league_id).filter(
            (id) => state.pendingLeagueIdsFilter.has(id) || state.pendingLeagueIdsFilter.has(String(id).replace(/^espn:/, "")) || state.pendingLeagueIdsFilter.has(String(id).replace(/^sleeper:/, ""))
          )
        );
        if (state.selectedLeagueIds.size === 0) {
          state.selectedLeagueIds = new Set(combinedLeaguesData.map((l) => l.league_id));
        }
        state.pendingLeagueIdsFilter = null;
      } else {
        state.selectedLeagueIds = new Set(combinedLeaguesData.map((l) => l.league_id));
      }
      setLoading(false);
      if (initialState) initialState.classList.add("hidden");
      if (reportContent) reportContent.classList.remove("hidden");
      if (copyRecapBtn) copyRecapBtn.classList.remove("hidden");
      if (shareUrlBtn) shareUrlBtn.classList.remove("hidden");
      if (downloadReportBtn) downloadReportBtn.classList.remove("hidden");
      if (exportCsvBtn) exportCsvBtn.classList.remove("hidden");
      renderLeagueDropdown();
      refreshDashboard();
      saveDataToCache(
        state.currentUserId,
        state.currentUserName,
        state.currentUserAvatar,
        season,
        mode,
        targetWeek,
        state.rawRecords,
        state.leaguesMap,
        state.allLeaguesData
      );
      const sorted = [...state.rawRecords].sort((a, b) => b.points - a.points);
      if (sorted[0]) {
        triggerConfetti();
      }
    } catch (err) {
      console.error("fetchLeaderboard Error:", err);
      showError(err.message || "Failed to load league data.");
    }
  }
  function refreshDashboard() {
    state.currentMainPage = 1;
    state.currentPlayerPage = 1;
    state.currentLuckPage = 1;
    const activeRecords = getActiveRecords();
    const activeLeagues = getActiveLeaguesMap();
    renderPodium(activeRecords);
    renderSuperlatives(activeRecords);
    renderSummaryCards(activeRecords, activeLeagues);
    renderTable(activeRecords);
    renderCharts(activeRecords, activeLeagues);
    renderLeagueGrid(activeRecords, activeLeagues);
    renderPlayerAnalytics(activeRecords, activeLeagues);
    renderLuckAnalytics(activeRecords, activeLeagues);
  }
  function clearAllData() {
    const confirmed = window.confirm(
      "Are you sure you want to clear all stored data, cached leagues, credentials, and settings? This will reset CrossLeague to its default state."
    );
    if (!confirmed) return;
    try {
      localStorage.clear();
    } catch (e) {
      console.warn("Could not clear localStorage:", e);
    }
    state.rawRecords = [];
    state.allLeaguesData = [];
    state.leaguesMap = {};
    state.selectedLeagueIds.clear();
    state.customLeagueIds.clear();
    state.currentUserId = "";
    state.currentUserName = "";
    state.currentUserAvatar = "";
    state.currentPlatform = "sleeper";
    state.currentSyncType = "user";
    const userIdInput = document.getElementById("userIdInput");
    const customLeagueIdInput = document.getElementById("customLeagueIdInput");
    const seasonInput = document.getElementById("seasonInput");
    const weekInput = document.getElementById("weekInput");
    const modeSelect = document.getElementById("modeSelect");
    const reportContent = document.getElementById("reportContent");
    const initialState = document.getElementById("initialState");
    const skeletonLoader = document.getElementById("skeletonLoader");
    const syncControlCenter = document.getElementById("syncControlCenter");
    const liveSyncIndicator = document.getElementById("liveSyncIndicator");
    const headerSeasonBadge = document.getElementById("headerSeasonBadge");
    const headerWeekBadge = document.getElementById("headerWeekBadge");
    const shareUrlBtn = document.getElementById("shareUrlBtn");
    const copyRecapBtn = document.getElementById("copyRecapBtn");
    const downloadReportBtn = document.getElementById("downloadReportBtn");
    if (userIdInput) userIdInput.value = "";
    if (customLeagueIdInput) customLeagueIdInput.value = "";
    if (seasonInput) seasonInput.value = "2026";
    if (weekInput) weekInput.value = "1";
    if (modeSelect) modeSelect.value = "WEEKLY";
    setPlatform("sleeper");
    setSyncType("user");
    updateModeUI();
    renderCustomLeagueIdChips();
    renderLeagueDropdown();
    updateSettingsButtonBadge();
    if (reportContent) reportContent.classList.add("hidden");
    if (initialState) initialState.classList.remove("hidden");
    if (skeletonLoader) skeletonLoader.classList.add("hidden");
    if (syncControlCenter) syncControlCenter.classList.add("hidden");
    if (liveSyncIndicator) liveSyncIndicator.classList.add("hidden");
    if (headerSeasonBadge) headerSeasonBadge.classList.add("hidden");
    if (headerWeekBadge) headerWeekBadge.classList.add("hidden");
    if (shareUrlBtn) shareUrlBtn.classList.add("hidden");
    if (copyRecapBtn) copyRecapBtn.classList.add("hidden");
    if (downloadReportBtn) downloadReportBtn.classList.add("hidden");
    closeSettingsModal();
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    showToast("All data and cached settings cleared.", "\u{1F9F9}");
  }
  function openLuckModal2() {
    const modal = document.getElementById("luckMethodologyModal");
    if (modal) {
      modal.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");
    }
  }
  function closeLuckModal2() {
    const modal = document.getElementById("luckMethodologyModal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    }
  }
  if (typeof window !== "undefined") {
    window.switchTab = switchTab;
    window.getCurrentlyActiveTab = getCurrentlyActiveTab;
    window.toggleRowExpand = toggleRowExpand;
    window.sortTable = sortTable;
    window.goToMainPage = goToMainPage;
    window.setMainPageSize = setMainPageSize;
    window.changeMainPage = changeMainPage;
    window.goToPlayerPage = goToPlayerPage;
    window.setPlayerPageSize = setPlayerPageSize;
    window.changePlayerPage = changePlayerPage;
    window.setPlayerPositionFilter = setPlayerPositionFilter;
    window.togglePlayerRowExpand = togglePlayerRowExpand;
    window.sortPlayers = sortPlayers;
    window.renderPlayerAnalytics = renderPlayerAnalytics;
    window.renderPlayerLeaderboard = renderPlayerLeaderboard;
    window.aggregatePlayers = aggregatePlayers;
    window.goToLuckPage = goToLuckPage;
    window.setLuckPageSize = setLuckPageSize;
    window.changeLuckPage = changeLuckPage;
    window.sortLuckTable = sortLuckTable;
    window.renderLuckAnalytics = renderLuckAnalytics;
    window.renderLuckTable = renderLuckTable;
    window.fetchLeaderboard = fetchLeaderboard;
    window.refreshDashboard = refreshDashboard;
    window.clearAllData = clearAllData;
    window.getPlayerInfo = getPlayerInfo;
    window.loadCachedData = loadCachedData;
    window.initPlayersDb = initPlayersDb;
    window.shareUrl = shareUrl;
    window.downloadReport = downloadReport;
    window.shareReport = shareReport;
    window.copyChatRecap = copyChatRecap;
    window.exportCsv = exportCsv;
    window.openLuckModal = openLuckModal2;
    window.closeLuckModal = closeLuckModal2;
    window.openSettingsModal = openSettingsModal;
    window.closeSettingsModal = closeSettingsModal;
    window.buildShareableUrl = buildShareableUrl;
    window.getUrlParams = getUrlParams;
  }
  function setupEventListeners() {
    if (typeof document === "undefined") return;
    const tableSearch = document.getElementById("tableSearch");
    const scoreTierSelect = document.getElementById("scoreTierSelect");
    const playerSearchInput = document.getElementById("playerSearch");
    const playerStatusFilter = document.getElementById("playerStatusFilter");
    const luckSearchInput = document.getElementById("luckSearch");
    const luckCategorySelect = document.getElementById("luckCategoryFilter");
    const customLeaguesDropdownBtn = document.getElementById("customLeaguesDropdownBtn");
    const customLeaguesDropdownMenu = document.getElementById("customLeaguesDropdownMenu");
    const customLeaguesDropdownChevron = document.getElementById("customLeaguesDropdownChevron");
    const customLeaguesDropdownContainer = document.getElementById("customLeaguesDropdownContainer");
    const leagueDropdownBtn = document.getElementById("leagueDropdownBtn");
    const leagueDropdownMenu = document.getElementById("leagueDropdownMenu");
    const leagueDropdownChevron = document.getElementById("leagueDropdownChevron");
    const leagueDropdownContainer = document.getElementById("leagueDropdownContainer");
    const settingsModal = document.getElementById("settingsDropdownModal");
    const settingsDropdownContainer = document.getElementById("settingsDropdownContainer");
    const selectAllLeaguesBtn = document.getElementById("selectAllLeaguesBtn");
    const clearAllLeaguesBtn = document.getElementById("clearAllLeaguesBtn");
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    const shareUrlBtn = document.getElementById("shareUrlBtn");
    const downloadReportBtn = document.getElementById("downloadReportBtn");
    const shareReportBtn = document.getElementById("shareReportBtn");
    const copyRecapBtn = document.getElementById("copyRecapBtn");
    const clearDataBtn = document.getElementById("clearDataBtn");
    const btnOpenLuckModal = document.getElementById("btnOpenLuckModal");
    const btnCloseLuckModal = document.getElementById("btnCloseLuckModal");
    const luckModal = document.getElementById("luckMethodologyModal");
    const prevWeekBtn = document.getElementById("prevWeekBtn");
    const nextWeekBtn = document.getElementById("nextWeekBtn");
    if (tableSearch) {
      tableSearch.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        state.currentMainPage = 1;
        renderTable();
      });
    }
    if (scoreTierSelect) {
      scoreTierSelect.addEventListener("change", (e) => {
        state.currentTierFilter = e.target.value;
        state.currentMainPage = 1;
        renderTable();
      });
    }
    if (playerSearchInput) {
      playerSearchInput.addEventListener("input", (e) => {
        state.currentPlayerSearch = e.target.value;
        state.currentPlayerPage = 1;
        renderPlayerLeaderboard();
      });
    }
    if (playerStatusFilter) {
      playerStatusFilter.addEventListener("change", (e) => {
        state.currentPlayerStatusFilter = e.target.value;
        state.currentPlayerPage = 1;
        renderPlayerLeaderboard();
      });
    }
    if (luckSearchInput) {
      luckSearchInput.addEventListener("input", (e) => {
        state.currentLuckSearch = e.target.value;
        state.currentLuckPage = 1;
        renderLuckTable();
      });
    }
    if (luckCategorySelect) {
      luckCategorySelect.addEventListener("change", (e) => {
        state.currentLuckCategory = e.target.value;
        state.currentLuckPage = 1;
        renderLuckTable();
      });
    }
    if (customLeaguesDropdownBtn && customLeaguesDropdownMenu) {
      customLeaguesDropdownBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isHidden = customLeaguesDropdownMenu.classList.contains("hidden");
        if (isHidden) {
          customLeaguesDropdownMenu.classList.remove("hidden");
          if (customLeaguesDropdownChevron) customLeaguesDropdownChevron.classList.add("rotate-180");
          customLeaguesDropdownBtn.setAttribute("aria-expanded", "true");
        } else {
          customLeaguesDropdownMenu.classList.add("hidden");
          if (customLeaguesDropdownChevron)
            customLeaguesDropdownChevron.classList.remove("rotate-180");
          customLeaguesDropdownBtn.setAttribute("aria-expanded", "false");
        }
      });
    }
    if (leagueDropdownBtn && leagueDropdownMenu) {
      leagueDropdownBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isHidden = leagueDropdownMenu.classList.contains("hidden");
        if (isHidden) {
          leagueDropdownMenu.classList.remove("hidden");
          if (leagueDropdownChevron) leagueDropdownChevron.classList.add("rotate-180");
          leagueDropdownBtn.setAttribute("aria-expanded", "true");
        } else {
          leagueDropdownMenu.classList.add("hidden");
          if (leagueDropdownChevron) leagueDropdownChevron.classList.remove("rotate-180");
          leagueDropdownBtn.setAttribute("aria-expanded", "false");
        }
      });
    }
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest(".card-info-trigger");
      if (trigger) {
        const wrapper = trigger.closest(".card-info-wrapper");
        const popover = wrapper ? wrapper.querySelector(".card-info-popover") : null;
        const wasOpen = popover && popover.classList.contains("is-open");
        document.querySelectorAll(".card-info-popover.is-open").forEach((p) => {
          if (p !== popover) {
            p.classList.remove("is-open");
            const parentWrap = p.closest(".card-info-wrapper");
            const parentBtn = parentWrap ? parentWrap.querySelector(".card-info-trigger") : null;
            if (parentBtn) parentBtn.setAttribute("aria-expanded", "false");
          }
        });
        if (popover) {
          if (wasOpen) {
            popover.classList.remove("is-open");
            trigger.setAttribute("aria-expanded", "false");
          } else {
            popover.classList.add("is-open");
            trigger.setAttribute("aria-expanded", "true");
          }
        }
        return;
      }
      if (!e.target.closest(".card-info-wrapper")) {
        document.querySelectorAll(".card-info-popover.is-open").forEach((p) => {
          p.classList.remove("is-open");
          const parentWrap = p.closest(".card-info-wrapper");
          const parentBtn = parentWrap ? parentWrap.querySelector(".card-info-trigger") : null;
          if (parentBtn) parentBtn.setAttribute("aria-expanded", "false");
        });
      }
      if (customLeaguesDropdownMenu && !customLeaguesDropdownMenu.classList.contains("hidden")) {
        if (customLeaguesDropdownContainer && !customLeaguesDropdownContainer.contains(e.target)) {
          customLeaguesDropdownMenu.classList.add("hidden");
          if (customLeaguesDropdownChevron)
            customLeaguesDropdownChevron.classList.remove("rotate-180");
          if (customLeaguesDropdownBtn)
            customLeaguesDropdownBtn.setAttribute("aria-expanded", "false");
        }
      }
      if (leagueDropdownMenu && !leagueDropdownMenu.classList.contains("hidden")) {
        if (leagueDropdownContainer && !leagueDropdownContainer.contains(e.target)) {
          leagueDropdownMenu.classList.add("hidden");
          if (leagueDropdownChevron) leagueDropdownChevron.classList.remove("rotate-180");
          if (leagueDropdownBtn) leagueDropdownBtn.setAttribute("aria-expanded", "false");
        }
      }
      if (settingsModal && !settingsModal.classList.contains("hidden")) {
        if (settingsDropdownContainer && !settingsDropdownContainer.contains(e.target)) {
          closeSettingsModal();
        }
      }
    });
    if (luckModal) {
      luckModal.addEventListener("click", (e) => {
        if (e.target === luckModal) closeLuckModal2();
      });
    }
    if (btnOpenLuckModal) btnOpenLuckModal.addEventListener("click", openLuckModal2);
    if (btnCloseLuckModal) btnCloseLuckModal.addEventListener("click", closeLuckModal2);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".card-info-popover.is-open").forEach((p) => {
          p.classList.remove("is-open");
          const parentWrap = p.closest(".card-info-wrapper");
          const parentBtn = parentWrap ? parentWrap.querySelector(".card-info-trigger") : null;
          if (parentBtn) parentBtn.setAttribute("aria-expanded", "false");
        });
        const modal = document.getElementById("luckMethodologyModal");
        if (modal && !modal.classList.contains("hidden")) {
          closeLuckModal2();
        }
        if (customLeaguesDropdownMenu && !customLeaguesDropdownMenu.classList.contains("hidden")) {
          customLeaguesDropdownMenu.classList.add("hidden");
          if (customLeaguesDropdownChevron)
            customLeaguesDropdownChevron.classList.remove("rotate-180");
          if (customLeaguesDropdownBtn)
            customLeaguesDropdownBtn.setAttribute("aria-expanded", "false");
        }
        if (settingsModal && !settingsModal.classList.contains("hidden")) {
          closeSettingsModal();
        }
        if (leagueDropdownMenu && !leagueDropdownMenu.classList.contains("hidden")) {
          leagueDropdownMenu.classList.add("hidden");
          if (leagueDropdownChevron) leagueDropdownChevron.classList.remove("rotate-180");
          if (leagueDropdownBtn) leagueDropdownBtn.setAttribute("aria-expanded", "false");
        }
        return;
      }
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
        return;
      }
      if (settingsModal && !settingsModal.classList.contains("hidden")) {
        return;
      }
      if (luckModal && !luckModal.classList.contains("hidden")) {
        return;
      }
      if (e.key === "1") {
        e.preventDefault();
        switchTab("awards");
        return;
      } else if (e.key === "2") {
        e.preventDefault();
        switchTab("leaderboard");
        return;
      } else if (e.key === "3") {
        e.preventDefault();
        switchTab("visuals");
        return;
      } else if (e.key === "4") {
        e.preventDefault();
        switchTab("leagueGrid");
        return;
      } else if (e.key === "5") {
        e.preventDefault();
        switchTab("luck");
        return;
      } else if (e.key === "6") {
        e.preventDefault();
        switchTab("players");
        return;
      } else if (e.key === "[") {
        e.preventDefault();
        const currentTab = getCurrentlyActiveTab();
        const idx = TAB_ORDER.indexOf(currentTab);
        const prevIdx = (idx - 1 + TAB_ORDER.length) % TAB_ORDER.length;
        switchTab(TAB_ORDER[prevIdx]);
        return;
      } else if (e.key === "]") {
        e.preventDefault();
        const currentTab = getCurrentlyActiveTab();
        const idx = TAB_ORDER.indexOf(currentTab);
        const nextIdx = (idx + 1) % TAB_ORDER.length;
        switchTab(TAB_ORDER[nextIdx]);
        return;
      }
      if (e.key === "ArrowLeft") {
        if (prevWeekBtn && !prevWeekBtn.disabled) {
          prevWeekBtn.click();
        }
      } else if (e.key === "ArrowRight") {
        if (nextWeekBtn && !nextWeekBtn.disabled) {
          nextWeekBtn.click();
        }
      }
    });
    if (selectAllLeaguesBtn) {
      selectAllLeaguesBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        state.selectedLeagueIds = new Set(state.allLeaguesData.map((l) => l.league_id));
        renderLeagueDropdown();
        refreshDashboard();
      });
    }
    if (clearAllLeaguesBtn) {
      clearAllLeaguesBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        state.selectedLeagueIds.clear();
        renderLeagueDropdown();
        refreshDashboard();
      });
    }
    if (exportCsvBtn) exportCsvBtn.addEventListener("click", exportCsv);
    if (shareUrlBtn) shareUrlBtn.addEventListener("click", shareUrl);
    if (downloadReportBtn) downloadReportBtn.addEventListener("click", downloadReport);
    if (shareReportBtn && shareReportBtn !== downloadReportBtn) {
      shareReportBtn.addEventListener("click", downloadReport);
    }
    if (copyRecapBtn) copyRecapBtn.addEventListener("click", copyChatRecap);
    if (clearDataBtn) clearDataBtn.addEventListener("click", clearAllData);
  }
  async function startApp() {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    setupEventListeners();
    initPlayersDb();
    if (window.__EMBEDDED_REPORT__) {
      loadEmbeddedReport(window.__EMBEDDED_REPORT__, refreshDashboard);
      syncTabFromHash();
      return;
    }
    await initDefaults();
    updateModeUI();
    const urlParams = getUrlParams();
    const hasQueryParams = Boolean(
      urlParams.platform || urlParams.user || urlParams.season || urlParams.week || urlParams.mode || urlParams.leagues
    );
    if (hasQueryParams) {
      state.rawRecords = [];
      state.allLeaguesData = [];
      state.leaguesMap = {};
      state.selectedLeagueIds.clear();
    }
    const userIdInput = document.getElementById("userIdInput");
    const hasLoadedCache = tryLoadFromCache(refreshDashboard);
    if (!hasLoadedCache && (state.currentSyncType === "user" && userIdInput && userIdInput.value || state.currentSyncType === "leagues" && state.customLeagueIds.size > 0 || state.pendingLeagueIdsFilter && state.pendingLeagueIdsFilter.size > 0)) {
      fetchLeaderboard();
    }
    syncTabFromHash();
  }
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", startApp);
    } else {
      startApp();
    }
  }
  return __toCommonJS(index_exports);
})();
