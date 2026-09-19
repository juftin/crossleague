/**
 * CrossLeague • Zustand Reactive State Store
 */

import { create } from "zustand";
import { useMemo } from "react";
import { TAB_HASH_MAP } from "./constants.js";

const currentYear = new Date().getFullYear();

export const useCrossLeagueStore = create((set, get) => ({
  platform: "sleeper",
  theme: "dark",
  mode: "WEEKLY",
  season: currentYear,
  week: 1,
  syncType: "user",
  userId: "",
  userName: "",
  userAvatar: "",
  customLeagueIds: [],
  selectedLeagueIds: [],
  pendingLeagueIdsFilter: null,

  rawRecords: [],
  leaguesMap: {},
  allLeaguesData: [],
  nflState: {
    season: currentYear,
    week: 1,
    display_week: 1,
    season_type: "regular"
  },
  espnPlayersDb: {},
  sleeperPlayersDb: null,
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
    set({ platform, syncType: platform === "espn" ? "leagues" : get().syncType });
    try {
      localStorage.setItem("crossleague_platform", platform);
    } catch {}
  },

  setTheme: theme => {
    const nextTheme = theme === "light" ? "light" : "dark";
    set({ theme: nextTheme });
    try {
      localStorage.setItem("crossleague_theme", nextTheme);
    } catch {}
    try {
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      document.documentElement.classList.toggle("light", nextTheme === "light");
    } catch {}
  },

  setMode: mode => {
    set({ mode });
    try {
      localStorage.setItem("sleeper_mode", mode);
    } catch {}
  },

  setSeason: season => {
    set({ season });
    try {
      localStorage.setItem("sleeper_season", String(season));
    } catch {}
  },

  setWeek: week => {
    set({ week });
    try {
      localStorage.setItem("sleeper_week", String(week));
    } catch {}
  },

  setSyncType: syncType => {
    set({ syncType });
    try {
      localStorage.setItem("sleeper_sync_type", syncType);
    } catch {}
  },

  setUserId: userId => set({ userId }),
  setUserName: userName => {
    set({ userName });
    try {
      localStorage.setItem("sleeper_username", userName);
      localStorage.setItem("sleeper_user_id", userName);
    } catch {}
  },
  setUserAvatar: userAvatar => set({ userAvatar }),

  setCustomLeagueIds: customLeagueIds => {
    set({ customLeagueIds });
    try {
      localStorage.setItem("sleeper_custom_league_ids", JSON.stringify(customLeagueIds));
    } catch {}
  },

  addCustomLeagueId: id => {
    const trimmed = (id || "").trim();
    if (!trimmed) return;
    const current = get().customLeagueIds;
    if (!current.includes(trimmed)) {
      const next = [...current, trimmed];
      set({ customLeagueIds: next });
      try {
        localStorage.setItem("sleeper_custom_league_ids", JSON.stringify(next));
      } catch {}
    }
  },

  removeCustomLeagueId: id => {
    const next = get().customLeagueIds.filter(x => x !== id);
    set({ customLeagueIds: next });
    try {
      localStorage.setItem("sleeper_custom_league_ids", JSON.stringify(next));
    } catch {}
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

  setActiveTab: (activeTab, updateUrlHash = true) => {
    set({ activeTab });
    if (updateUrlHash && typeof window !== "undefined") {
      const hash = TAB_HASH_MAP[activeTab] || activeTab;
      if (window.location.hash !== `#${hash}`) {
        window.history.replaceState(null, "", `#${hash}${window.location.search}`);
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
    try {
      localStorage.clear();
    } catch {}
    set({
      rawRecords: [],
      leaguesMap: {},
      allLeaguesData: [],
      selectedLeagueIds: [],
      customLeagueIds: [],
      theme: "dark",
      userId: "",
      userName: "",
      userAvatar: "",
      error: null
    });
    try {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } catch {}
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
      else if (prop === "currentSyncType") s.setSyncType(value);
      else if (prop === "nflState") s.setNflState(value);
      else if (prop === "searchQuery") s.setSearchQuery(value);
      else if (prop === "currentTierFilter") s.setTierFilter(value);
      else s[prop] = value;
      return true;
    }
  }
);

export function useActiveRecords() {
  const rawRecords = useCrossLeagueStore(s => s.rawRecords);
  const selectedLeagueIds = useCrossLeagueStore(s => s.selectedLeagueIds);
  return useMemo(() => {
    if (!rawRecords || rawRecords.length === 0) return [];
    if (!selectedLeagueIds || selectedLeagueIds.length === 0) return rawRecords;
    const setIds = new Set(selectedLeagueIds);
    return rawRecords.filter(r => setIds.has(r.leagueId));
  }, [rawRecords, selectedLeagueIds]);
}

export function useActiveLeaguesMap() {
  const leaguesMap = useCrossLeagueStore(s => s.leaguesMap);
  const selectedLeagueIds = useCrossLeagueStore(s => s.selectedLeagueIds);
  return useMemo(() => {
    if (!selectedLeagueIds || selectedLeagueIds.length === 0) return leaguesMap;
    const filtered = {};
    selectedLeagueIds.forEach(id => {
      if (leaguesMap[id]) filtered[id] = leaguesMap[id];
    });
    return filtered;
  }, [leaguesMap, selectedLeagueIds]);
}

export function getActiveRecords() {
  const s = useCrossLeagueStore.getState();
  if (!s.rawRecords || s.rawRecords.length === 0) return [];
  if (!s.selectedLeagueIds || s.selectedLeagueIds.length === 0) return s.rawRecords;
  const setIds = new Set(s.selectedLeagueIds);
  return s.rawRecords.filter(r => setIds.has(r.leagueId));
}

export function getActiveLeaguesMap() {
  const s = useCrossLeagueStore.getState();
  if (!s.selectedLeagueIds || s.selectedLeagueIds.length === 0) return s.leaguesMap;
  const filtered = {};
  s.selectedLeagueIds.forEach(id => {
    if (s.leaguesMap[id]) filtered[id] = s.leaguesMap[id];
  });
  return filtered;
}
