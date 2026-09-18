/**
 * CrossLeague • Application State Store
 *
 * Central reactive state store holding league records, active filters,
 * pagination parameters, and user preferences.
 */

export const state = {
  currentPlatform: "sleeper", // "sleeper" | "espn"
  currentMode: "WEEKLY", // "WEEKLY" | "SEASON_ROLLUP"
  currentUserId: "",
  currentUserName: "",
  currentUserAvatar: "",
  rawRecords: [], // Single-week records or Season aggregated records
  leaguesMap: {},
  allLeaguesData: [],
  selectedLeagueIds: new Set(),
  pendingLeagueIdsFilter: null,
  currentSyncType: "user", // "user" | "leagues"
  customLeagueIds: new Set(),
  currentSortColumn: "Points",
  currentSortAsc: false,
  currentTierFilter: "ALL",
  searchQuery: "",
  expandedRowIds: new Set(),

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
  expandedPlayerIds: new Set(),
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
    season: new Date().getFullYear(),
    week: 1,
    display_week: 1,
    season_type: "regular"
  }
};

/**
 * Returns array of records filtered by selected league IDs.
 *
 * @returns {Array<object>} Filtered league records
 */
export function getActiveRecords() {
  if (!state.rawRecords || state.rawRecords.length === 0) return [];
  if (!state.selectedLeagueIds || state.selectedLeagueIds.size === 0) return state.rawRecords;
  return state.rawRecords.filter(r => state.selectedLeagueIds.has(r.leagueId));
}

/**
 * Returns map of active leagues matching selected league IDs.
 *
 * @returns {Record<string, object>} Active leagues map
 */
export function getActiveLeaguesMap() {
  if (!state.selectedLeagueIds || state.selectedLeagueIds.size === 0) return state.leaguesMap;
  const filtered = {};
  state.selectedLeagueIds.forEach(id => {
    if (state.leaguesMap[id]) filtered[id] = state.leaguesMap[id];
  });
  return filtered;
}
