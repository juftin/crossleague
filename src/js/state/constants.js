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
