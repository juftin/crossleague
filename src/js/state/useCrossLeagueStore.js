/**
 * CrossLeague • Zustand Reactive State Store
 */

import { create } from "zustand";
import { useMemo } from "react";
import { TAB_HASH_MAP, STORAGE_KEYS } from "./constants.js";
import {
  getItem,
  getPreference,
  setPreference,
  getAllPreferences,
  clearAllStorage
} from "./storage.js";
import { clearUrlParams } from "./urlParams.js";

const initialPreferences = getAllPreferences();
const initialSleeperPlayers =
  getItem(STORAGE_KEYS.PLAYERS_SLEEPER, null) || getItem("sleeper_players_v3", null);
const initialEspnPlayers =
  getItem(STORAGE_KEYS.PLAYERS_ESPN, {}) || getItem("crossleague_espn_players_v1", {});

export const useCrossLeagueStore = create((set, get) => ({
  platform: initialPreferences.platform,
  mode: initialPreferences.mode,
  season: initialPreferences.season,
  week: initialPreferences.week,
  syncType: initialPreferences.syncType,
  userId: initialPreferences.userId,
  userName: initialPreferences.userName,
  userAvatar: "",
  customLeagueIds: initialPreferences.customLeagueIds,
  sleeperUserName: initialPreferences.sleeperUserName || "",
  sleeperUserId: initialPreferences.sleeperUserId || "",
  sleeperSyncType: initialPreferences.sleeperSyncType || "user",
  sleeperCustomLeagueIds: initialPreferences.sleeperCustomLeagueIds || [],
  espnCustomLeagueIds: initialPreferences.espnCustomLeagueIds || [],
  selectedLeagueIds: [],
  pendingLeagueIdsFilter: null,

  rawRecords: [],
  leaguesMap: {},
  allLeaguesData: [],
  nflState: {
    season: initialPreferences.season,
    week: initialPreferences.week,
    display_week: initialPreferences.week,
    season_type: "regular"
  },
  espnPlayersDb: initialEspnPlayers || {},
  sleeperPlayersDb: initialSleeperPlayers,
  lastAggregatedPlayers: [],

  activeTab: "awards",
  loading: false,
  loadingText: "Loading League Data...",
  progress: 0,
  error: null,

  isSettingsOpen: false,
  isLeagueDropdownOpen: false,
  isLuckModalOpen: false,
  toasts: [],

  searchQuery: "",
  sortColumn: "Points",
  sortAsc: false,
  tierFilter: "ALL",
  mainPage: 1,
  mainPageSize: 25,
  expandedRowIds: [],

  gridPage: 1,
  gridPageSize: 9,

  luckPage: 1,
  luckPageSize: 25,
  luckSearch: "",
  luckCategory: "ALL",
  luckSortColumn: "Luck",
  luckSortAsc: false,

  playerPositionFilter: "ALL",
  playerSearch: "",
  playerStatusFilter: "ALL",
  playerSortColumn: "points",
  playerSortAsc: false,
  playerPage: 1,
  playerPageSize: 25,
  expandedPlayerIds: [],

  setPlatform: platform => {
    const currentPlatform = get().platform;
    if (currentPlatform !== platform) {
      const isEspn = platform === "espn";
      const currentState = get();

      // Persist current platform state before switching
      let espnCustomLeagueIds = currentState.espnCustomLeagueIds || [];
      let sleeperCustomLeagueIds = currentState.sleeperCustomLeagueIds || [];
      let sleeperUserName = currentState.sleeperUserName || "";
      let sleeperUserId = currentState.sleeperUserId || "";
      let sleeperSyncType = currentState.sleeperSyncType || "user";

      if (currentPlatform === "espn") {
        espnCustomLeagueIds = currentState.customLeagueIds || [];
        setPreference(STORAGE_KEYS.PREF_ESPN_CUSTOM_LEAGUES, espnCustomLeagueIds);
      } else {
        sleeperUserName = currentState.userName || "";
        sleeperUserId = currentState.userId || "";
        sleeperSyncType = currentState.syncType || "user";
        sleeperCustomLeagueIds = currentState.customLeagueIds || [];
        setPreference(STORAGE_KEYS.PREF_SLEEPER_USER_NAME, sleeperUserName);
        setPreference(STORAGE_KEYS.PREF_SLEEPER_USER_ID, sleeperUserId);
        setPreference(STORAGE_KEYS.PREF_SLEEPER_SYNC_TYPE, sleeperSyncType);
        setPreference(STORAGE_KEYS.PREF_SLEEPER_CUSTOM_LEAGUES, sleeperCustomLeagueIds);
      }

      // Check stored preference fallback if in-memory list was empty
      if (espnCustomLeagueIds.length === 0) {
        const storedEspn = getPreference(STORAGE_KEYS.PREF_ESPN_CUSTOM_LEAGUES, []);
        if (Array.isArray(storedEspn) && storedEspn.length > 0) {
          espnCustomLeagueIds = storedEspn;
        }
      }
      if (sleeperCustomLeagueIds.length === 0) {
        const storedSleeper = getPreference(STORAGE_KEYS.PREF_SLEEPER_CUSTOM_LEAGUES, []);
        if (Array.isArray(storedSleeper) && storedSleeper.length > 0) {
          sleeperCustomLeagueIds = storedSleeper;
        }
      }
      if (!sleeperUserName) {
        sleeperUserName = getPreference(STORAGE_KEYS.PREF_SLEEPER_USER_NAME, "");
      }

      // Restore target platform state
      const nextCustomLeagueIds = isEspn ? espnCustomLeagueIds : sleeperCustomLeagueIds;
      const nextUserName = isEspn ? "" : sleeperUserName;
      const nextUserId = isEspn ? "" : sleeperUserId;
      const nextSyncType = isEspn ? "leagues" : sleeperSyncType;

      set({
        platform,
        syncType: nextSyncType,
        customLeagueIds: nextCustomLeagueIds,
        espnCustomLeagueIds,
        sleeperCustomLeagueIds,
        sleeperUserName,
        sleeperUserId,
        sleeperSyncType,
        userName: nextUserName,
        userId: nextUserId,
        userAvatar: ""
      });

      setPreference(STORAGE_KEYS.PREF_PLATFORM, platform);
      setPreference(STORAGE_KEYS.PREF_CUSTOM_LEAGUES, nextCustomLeagueIds);
      setPreference(STORAGE_KEYS.PREF_SYNC_TYPE, nextSyncType);
      setPreference(STORAGE_KEYS.PREF_USER_NAME, nextUserName);
      setPreference(STORAGE_KEYS.PREF_USER_ID, nextUserId);
    }
  },

  setMode: mode => {
    set({ mode });
    setPreference(STORAGE_KEYS.PREF_MODE, mode);
  },

  setSeason: season => {
    set({ season });
    setPreference(STORAGE_KEYS.PREF_SEASON, season);
  },

  setWeek: week => {
    set({ week });
    setPreference(STORAGE_KEYS.PREF_WEEK, week);
  },

  setSyncType: syncType => {
    const isSleeper = get().platform !== "espn";
    set({
      syncType,
      ...(isSleeper ? { sleeperSyncType: syncType } : {})
    });
    setPreference(STORAGE_KEYS.PREF_SYNC_TYPE, syncType);
    if (isSleeper) {
      setPreference(STORAGE_KEYS.PREF_SLEEPER_SYNC_TYPE, syncType);
    }
  },

  setUserId: userId => {
    const isSleeper = get().platform !== "espn";
    set({
      userId,
      ...(isSleeper ? { sleeperUserId: userId } : {})
    });
    setPreference(STORAGE_KEYS.PREF_USER_ID, userId);
    if (isSleeper) {
      setPreference(STORAGE_KEYS.PREF_SLEEPER_USER_ID, userId);
    }
  },

  setUserName: userName => {
    const isSleeper = get().platform !== "espn";
    set({
      userName,
      ...(isSleeper ? { sleeperUserName: userName } : {})
    });
    setPreference(STORAGE_KEYS.PREF_USER_NAME, userName);
    if (isSleeper) {
      setPreference(STORAGE_KEYS.PREF_SLEEPER_USER_NAME, userName);
    }
  },

  setUserAvatar: userAvatar => set({ userAvatar }),

  setCustomLeagueIds: customLeagueIds => {
    const platform = get().platform;
    if (platform === "espn") {
      set({ customLeagueIds, espnCustomLeagueIds: customLeagueIds });
      setPreference(STORAGE_KEYS.PREF_ESPN_CUSTOM_LEAGUES, customLeagueIds);
    } else {
      set({ customLeagueIds, sleeperCustomLeagueIds: customLeagueIds });
      setPreference(STORAGE_KEYS.PREF_SLEEPER_CUSTOM_LEAGUES, customLeagueIds);
    }
    setPreference(STORAGE_KEYS.PREF_CUSTOM_LEAGUES, customLeagueIds);
  },

  addCustomLeagueId: id => {
    const trimmed = (id || "").trim();
    if (!trimmed) return;
    const current = get().customLeagueIds;
    if (!current.includes(trimmed)) {
      const next = [...current, trimmed];
      get().setCustomLeagueIds(next);
    }
  },

  removeCustomLeagueId: id => {
    const next = get().customLeagueIds.filter(x => x !== id);
    get().setCustomLeagueIds(next);
  },

  hydratePreferences: () => {
    const prefs = getAllPreferences();
    set({
      platform: prefs.platform,
      syncType: prefs.syncType,
      userName: prefs.userName,
      userId: prefs.userId,
      customLeagueIds: prefs.customLeagueIds,
      sleeperUserName: prefs.sleeperUserName,
      sleeperUserId: prefs.sleeperUserId,
      sleeperSyncType: prefs.sleeperSyncType,
      sleeperCustomLeagueIds: prefs.sleeperCustomLeagueIds,
      espnCustomLeagueIds: prefs.espnCustomLeagueIds,
      season: prefs.season,
      week: prefs.week,
      mode: prefs.mode
    });
  },

  setSelectedLeagueIds: selectedLeagueIds => set({ selectedLeagueIds }),

  toggleSelectedLeagueId: id => {
    const current = get().selectedLeagueIds;
    const exists = current.includes(id);
    const next = exists ? current.filter(x => x !== id) : [...current, id];
    set({ selectedLeagueIds: next });
  },

  selectAllLeagues: () => {
    const allIds = Object.keys(get().leaguesMap);
    set({ selectedLeagueIds: allIds });
  },

  clearAllLeagues: () => {
    set({ selectedLeagueIds: [] });
  },

  setRawRecords: rawRecords => set({ rawRecords }),
  setLeaguesMap: leaguesMap => set({ leaguesMap }),
  setAllLeaguesData: allLeaguesData => set({ allLeaguesData }),
  setNflState: nfl => set(s => ({ nflState: { ...s.nflState, ...nfl } })),
  setSleeperPlayersDb: sleeperPlayersDb => set({ sleeperPlayersDb }),
  setEspnPlayersDb: espnPlayersDb =>
    set(s => ({ espnPlayersDb: { ...s.espnPlayersDb, ...espnPlayersDb } })),

  setActiveTab: (activeTab, updateUrlHash = true) => {
    set({ activeTab });
    if (updateUrlHash && typeof window !== "undefined" && window.location) {
      const hash = TAB_HASH_MAP[activeTab] || activeTab;
      if (window.location.hash !== `#${hash}`) {
        const search = window.location.search || "";
        window.history.replaceState(null, "", `${window.location.pathname}${search}#${hash}`);
      }
    }
  },

  setLoading: (loading, text = "Loading League Data...", progress = 0) =>
    set({ loading, loadingText: text, progress }),

  setProgress: progress => set({ progress }),
  setError: error => set({ error, loading: false }),

  openSettingsModal: () => set({ isSettingsOpen: true }),
  closeSettingsModal: () => set({ isSettingsOpen: false }),
  toggleSettingsDropdown: open =>
    set(s => ({ isSettingsOpen: open !== undefined ? open : !s.isSettingsOpen })),
  toggleLeagueDropdown: open =>
    set(s => ({ isLeagueDropdownOpen: open !== undefined ? open : !s.isLeagueDropdownOpen })),

  openLuckModal: () => set({ isLuckModalOpen: true }),
  closeLuckModal: () => set({ isLuckModalOpen: false }),

  addToast: (text, type = "info", duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast = { id, text, type, duration };
    set(s => ({ toasts: [...s.toasts, newToast] }));
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: id => {
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
  },

  setSearchQuery: searchQuery => set({ searchQuery, mainPage: 1 }),
  setSortColumn: col => {
    const { sortColumn, sortAsc } = get();
    if (sortColumn === col) {
      set({ sortAsc: !sortAsc });
    } else {
      set({ sortColumn: col, sortAsc: false });
    }
  },
  setTierFilter: tierFilter => set({ tierFilter, mainPage: 1 }),
  setMainPage: mainPage => set({ mainPage }),
  setMainPageSize: mainPageSize => set({ mainPageSize, mainPage: 1 }),
  toggleRowExpand: id => {
    const current = get().expandedRowIds;
    const exists = current.includes(id);
    set({ expandedRowIds: exists ? current.filter(x => x !== id) : [...current, id] });
  },

  setGridPage: gridPage => set({ gridPage }),
  setGridPageSize: gridPageSize => set({ gridPageSize, gridPage: 1 }),

  setLuckSearch: luckSearch => set({ luckSearch, luckPage: 1 }),
  setLuckCategory: luckCategory => set({ luckCategory, luckPage: 1 }),
  setLuckSortColumn: col => {
    const { luckSortColumn, luckSortAsc } = get();
    if (luckSortColumn === col) {
      set({ luckSortAsc: !luckSortAsc });
    } else {
      set({ luckSortColumn: col, luckSortAsc: false });
    }
  },
  setLuckPage: luckPage => set({ luckPage }),
  setLuckPageSize: luckPageSize => set({ luckPageSize, luckPage: 1 }),

  setPlayerPositionFilter: playerPositionFilter => set({ playerPositionFilter, playerPage: 1 }),
  setPlayerSearch: playerSearch => set({ playerSearch, playerPage: 1 }),
  setPlayerStatusFilter: playerStatusFilter => set({ playerStatusFilter, playerPage: 1 }),
  setPlayerSortColumn: col => {
    const { playerSortColumn, playerSortAsc } = get();
    if (playerSortColumn === col) {
      set({ playerSortAsc: !playerSortAsc });
    } else {
      set({ playerSortColumn: col, playerSortAsc: false });
    }
  },
  setPlayerPage: playerPage => set({ playerPage }),
  setPlayerPageSize: playerPageSize => set({ playerPageSize, playerPage: 1 }),
  togglePlayerRowExpand: id => {
    const current = get().expandedPlayerIds;
    const exists = current.includes(id);
    set({ expandedPlayerIds: exists ? current.filter(x => x !== id) : [...current, id] });
  },

  resetData: () => {
    clearAllStorage();
    clearUrlParams();
    const currentYear = new Date().getFullYear();
    set({
      platform: "sleeper",
      mode: "WEEKLY",
      season: currentYear,
      week: 1,
      syncType: "user",
      userId: "",
      userName: "",
      userAvatar: "",
      customLeagueIds: [],
      sleeperUserName: "",
      sleeperUserId: "",
      sleeperSyncType: "user",
      sleeperCustomLeagueIds: [],
      espnCustomLeagueIds: [],
      selectedLeagueIds: [],
      rawRecords: [],
      leaguesMap: {},
      allLeaguesData: [],
      error: null
    });
  }
}));

// Compatibility proxy bridge for existing tests/modules expecting `state`, `getActiveRecords`, and `getActiveLeaguesMap`
export const state = new Proxy(
  {},
  {
    get: (_target, prop) => {
      const s = useCrossLeagueStore.getState();
      if (prop === "currentPlatform") return s.platform;
      if (prop === "currentMode") return s.mode;
      if (prop === "currentUserId") return s.userId;
      if (prop === "currentUserName") return s.userName;
      if (prop === "currentUserAvatar") return s.userAvatar;
      if (prop === "rawRecords") return s.rawRecords;
      if (prop === "leaguesMap") return s.leaguesMap;
      if (prop === "allLeaguesData") return s.allLeaguesData;
      if (prop === "selectedLeagueIds") return new Set(s.selectedLeagueIds);
      if (prop === "customLeagueIds") return new Set(s.customLeagueIds);
      if (prop === "pendingLeagueIdsFilter")
        return s.pendingLeagueIdsFilter ? new Set(s.pendingLeagueIdsFilter) : null;
      if (prop === "currentSyncType") return s.syncType;
      if (prop === "nflState") return s.nflState;
      if (prop === "currentSortColumn") return s.sortColumn;
      if (prop === "currentSortAsc") return s.sortAsc;
      if (prop === "currentTierFilter") return s.tierFilter;
      if (prop === "searchQuery") return s.searchQuery;
      if (prop === "currentMainPage") return s.mainPage;
      if (prop === "currentMainPageSize") return s.mainPageSize;
      if (prop === "expandedRowIds") return new Set(s.expandedRowIds);
      return s[prop];
    },
    set: (_target, prop, value) => {
      const s = useCrossLeagueStore.getState();
      if (prop === "currentPlatform") s.setPlatform(value);
      else if (prop === "currentMode") s.setMode(value);
      else if (prop === "currentUserId") s.setUserId(value);
      else if (prop === "currentUserName") s.setUserName(value);
      else if (prop === "currentUserAvatar") s.setUserAvatar(value);
      else if (prop === "rawRecords") s.setRawRecords(value);
      else if (prop === "leaguesMap") s.setLeaguesMap(value);
      else if (prop === "allLeaguesData") s.setAllLeaguesData(value);
      else if (prop === "selectedLeagueIds") s.setSelectedLeagueIds(Array.from(value || []));
      else if (prop === "customLeagueIds") s.setCustomLeagueIds(Array.from(value || []));
      else if (prop === "sleeperPlayersDb") s.setSleeperPlayersDb(value);
      else if (prop === "espnPlayersDb") s.setEspnPlayersDb(value);
      else {
        useCrossLeagueStore.setState({ [prop]: value });
      }
      return true;
    }
  }
);

function buildLeagueIdSet(selectedLeagueIds) {
  if (!selectedLeagueIds || selectedLeagueIds.length === 0) return null;
  const set = new Set();
  selectedLeagueIds.forEach(id => {
    const raw = String(id)
      .replace(/^(espn|sleeper):/i, "")
      .trim();
    if (raw) {
      set.add(raw);
      set.add(`espn:${raw}`);
      set.add(`sleeper:${raw}`);
    }
  });
  return set;
}

export function useActiveRecords() {
  const rawRecords = useCrossLeagueStore(s => s.rawRecords);
  const selectedLeagueIds = useCrossLeagueStore(s => s.selectedLeagueIds);
  return useMemo(() => {
    if (!rawRecords || rawRecords.length === 0) return [];
    const setIds = buildLeagueIdSet(selectedLeagueIds);
    if (!setIds) return rawRecords;
    return rawRecords.filter(r => setIds.has(String(r.leagueId)));
  }, [rawRecords, selectedLeagueIds]);
}

export function useActiveLeaguesMap() {
  const leaguesMap = useCrossLeagueStore(s => s.leaguesMap);
  const selectedLeagueIds = useCrossLeagueStore(s => s.selectedLeagueIds);
  return useMemo(() => {
    if (!leaguesMap) return {};
    const setIds = buildLeagueIdSet(selectedLeagueIds);
    if (!setIds) return leaguesMap;
    const filtered = {};
    Object.entries(leaguesMap).forEach(([k, v]) => {
      if (setIds.has(String(k)) || (v && setIds.has(String(v.id)))) {
        filtered[k] = v;
      }
    });
    return filtered;
  }, [leaguesMap, selectedLeagueIds]);
}

export function getActiveRecords() {
  const s = useCrossLeagueStore.getState();
  if (!s.rawRecords || s.rawRecords.length === 0) return [];
  const setIds = buildLeagueIdSet(s.selectedLeagueIds);
  if (!setIds) return s.rawRecords;
  return s.rawRecords.filter(r => setIds.has(String(r.leagueId)));
}

export function getActiveLeaguesMap() {
  const s = useCrossLeagueStore.getState();
  if (!s.leaguesMap) return {};
  const setIds = buildLeagueIdSet(s.selectedLeagueIds);
  if (!setIds) return s.leaguesMap;
  const filtered = {};
  Object.entries(s.leaguesMap).forEach(([k, v]) => {
    if (setIds.has(String(k)) || (v && setIds.has(String(v.id)))) {
      filtered[k] = v;
    }
  });
  return filtered;
}
