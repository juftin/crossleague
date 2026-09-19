/**
 * CrossLeague • Application Constants & Configuration
 *
 * Defines API base endpoints, ESPN mappings, and tab identifiers.
 */

export const BASE_URL = "https://api.sleeper.app/v1";
export const ESPN_BASE_URL = "https://lm-api-reads.fantasy.espn.com";

export const ESPN_POS_MAP = {
  1: "QB",
  2: "RB",
  3: "WR",
  4: "TE",
  5: "K",
  16: "DEF"
};

export const ESPN_PRO_TEAMS = {
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

export const TAB_ORDER = ["awards", "leaderboard", "visuals", "leagueGrid", "luck", "players"];

export const TAB_HASH_MAP = {
  awards: "awards",
  leaderboard: "board",
  visuals: "analytics",
  leagueGrid: "leagues",
  luck: "luck",
  players: "players"
};

export const HASH_TAB_MAP = {
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

/**
 * Standardized Namespaced Storage & Cache Keys
 */
export const STORAGE_KEYS = {
  // User Preferences
  PREF_PLATFORM: "crossleague:pref:platform",
  PREF_SYNC_TYPE: "crossleague:pref:sync_type",
  PREF_USER_NAME: "crossleague:pref:username",
  PREF_USER_ID: "crossleague:pref:user_id",
  PREF_CUSTOM_LEAGUES: "crossleague:pref:custom_leagues",
  PREF_SEASON: "crossleague:pref:season",
  PREF_WEEK: "crossleague:pref:week",
  PREF_MODE: "crossleague:pref:mode",

  // Static Metadata / Player Databases
  PLAYERS_SLEEPER: "crossleague:cache:players:sleeper",
  PLAYERS_ESPN: "crossleague:cache:players:espn"
};

/**
 * Cache Key Prefixes
 */
export const CACHE_PREFIXES = {
  REPORT: "crossleague:cache:report:",
  API: "crossleague:cache:api:",
  LEGACY_REPORT: "crossleague_cache_",
  LEGACY_API: "crossleague_api_"
};

/**
 * Legacy storage keys mapped for seamless backward-compatibility migration
 */
export const LEGACY_STORAGE_MAP = {
  [STORAGE_KEYS.PREF_PLATFORM]: ["crossleague_platform"],
  [STORAGE_KEYS.PREF_SYNC_TYPE]: ["sleeper_sync_type"],
  [STORAGE_KEYS.PREF_USER_NAME]: ["sleeper_username"],
  [STORAGE_KEYS.PREF_USER_ID]: ["sleeper_user_id"],
  [STORAGE_KEYS.PREF_CUSTOM_LEAGUES]: ["sleeper_custom_league_ids"],
  [STORAGE_KEYS.PREF_SEASON]: ["sleeper_season"],
  [STORAGE_KEYS.PREF_WEEK]: ["sleeper_week"],
  [STORAGE_KEYS.PREF_MODE]: ["sleeper_mode"],
  [STORAGE_KEYS.PLAYERS_SLEEPER]: ["sleeper_players_v3"],
  [STORAGE_KEYS.PLAYERS_ESPN]: ["crossleague_espn_players_v1"]
};

/**
 * Cache Expiration / TTL Defaults (milliseconds)
 */
export const TTL = {
  API_DEFAULT: 15 * 60 * 1000, // 15 minutes
  NFL_STATE: 2 * 60 * 60 * 1000, // 2 hours
  PLAYERS_DB: 24 * 60 * 60 * 1000, // 24 hours
  REPORT_ACTIVE: 10 * 60 * 1000, // 10 minutes for in-progress weeks
  REPORT_FINISHED: 7 * 24 * 60 * 60 * 1000 // 7 days for immutable historical weeks
};
