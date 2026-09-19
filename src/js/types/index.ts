/**
 * CrossLeague • TypeScript Type Definitions
 */

export type Platform = "sleeper" | "espn";
export type SyncMode = "WEEKLY" | "SEASON_ROLLUP";
export type SyncType = "user" | "leagues";
export type TabId = "awards" | "leaderboard" | "visuals" | "leagueGrid" | "luck" | "players";

export interface NFLState {
  season: number;
  week: number;
  display_week: number;
  season_type: string;
}

export interface PlayerStat {
  id: string;
  name: string;
  pos: string;
  team: string;
  points: number;
  starter?: boolean;
}

export interface TeamRecord {
  id: string;
  rosterId?: number | string;
  leagueId: string;
  leagueName: string;
  leagueAvatar?: string;
  manager: string;
  managerAvatar?: string;
  teamName: string;
  points: number;
  weeklyPoints?: number[];
  optimalPoints?: number;
  benchPoints?: number;
  efficiency?: number;
  rawWins?: number;
  rawLosses?: number;
  rawTies?: number;
  allPlayWins?: number;
  allPlayLosses?: number;
  allPlayTies?: number;
  allPlayWinPct?: number;
  expectedWins?: number;
  luck?: number;
  luckCategory?: "unlucky" | "balanced" | "lucky";
  stdDev?: number;
  consistencyRank?: number;
  starters?: PlayerStat[];
  bench?: PlayerStat[];
  matchupId?: number;
  opponent?: {
    manager: string;
    teamName: string;
    points: number;
  };
}

export interface LeagueInfo {
  id: string;
  name: string;
  avatar?: string;
  totalRosters: number;
  scoringType?: string;
  sport?: string;
  season?: string | number;
  status?: string;
  platform?: Platform;
}

export interface SuperlativeAward {
  id: string;
  title: string;
  emoji: string;
  subtitle: string;
  value: string | number;
  teamName: string;
  manager: string;
  leagueName: string;
  color: string;
  description: string;
}

export interface AggregatedPlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  points: number;
  avgPoints?: number;
  weeksPlayed?: number;
  rosteredCount: number;
  startedCount: number;
  benchedCount: number;
  owners: Array<{
    manager: string;
    teamName: string;
    leagueName: string;
    isStarter: boolean;
    points: number;
  }>;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

export interface CacheEnvelope<T> {
  version: string;
  cachedAt: string;
  ttlMs?: number;
  isFinished?: boolean;
  data: T;
}

export interface UserIdentity {
  id: string;
  name: string;
  avatar?: string;
}

export interface ReportCachePayload {
  version: string;
  cachedAt: string;
  isFinished: boolean;
  platform: Platform;
  mode: SyncMode;
  season: number;
  week: number;
  user: UserIdentity;
  records: TeamRecord[];
  leaguesMap: Record<string, LeagueInfo>;
  allLeaguesData: any[];
  selectedLeagueIds: string[];
}

export interface StoredPreferences {
  platform: Platform;
  syncType: SyncType;
  userName: string;
  userId: string;
  customLeagueIds: string[];
  season: number;
  week: number;
  mode: SyncMode;
}

export interface ApiCacheEntry<T = any> {
  timestamp: number;
  ttlMs: number;
  data: T;
}

export interface PlayerMetadata {
  name: string;
  pos: string;
  team: string;
}
