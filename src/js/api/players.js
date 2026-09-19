/**
 * CrossLeague • Player Database & Headshot Metadata
 *
 * Fetches and caches player information (name, position, team, headshots)
 * from both Sleeper and ESPN sources.
 */

import { state } from "../state/store.js";
import { STORAGE_KEYS } from "../state/constants.js";
import { getItem, setItem } from "../state/storage.js";

/**
 * Initializes and caches the Sleeper & ESPN NFL player databases in memory / localStorage.
 *
 * @param {Function} [onUpdateCallback] Optional callback invoked after player DB loads
 * @returns {Promise<Record<string, object>|null>} Sleeper player DB map
 */
export async function initPlayersDb(onUpdateCallback = null) {
  if (state.sleeperPlayersDb && Object.keys(state.sleeperPlayersDb).length > 0) {
    if (typeof onUpdateCallback === "function") onUpdateCallback();
    return state.sleeperPlayersDb;
  }

  const cachedSleeper =
    getItem(STORAGE_KEYS.PLAYERS_SLEEPER, null) || getItem("sleeper_players_v3", null);
  if (cachedSleeper && Object.keys(cachedSleeper).length > 0) {
    state.sleeperPlayersDb = cachedSleeper;
  }

  const cachedEspn =
    getItem(STORAGE_KEYS.PLAYERS_ESPN, null) || getItem("crossleague_espn_players_v1", null);
  if (cachedEspn && Object.keys(cachedEspn).length > 0) {
    state.espnPlayersDb = { ...state.espnPlayersDb, ...cachedEspn };
  }

  if (state.sleeperPlayersDb && Object.keys(state.sleeperPlayersDb).length > 0) {
    if (typeof onUpdateCallback === "function") onUpdateCallback();
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
      // Filter strictly to fantasy positions (QB, RB, WR, TE, K, DEF) to keep footprint minimal (<150KB)
      if (pos && ["QB", "RB", "WR", "TE", "K", "DEF"].includes(pos)) {
        stripped[pid] = {
          name:
            p.full_name ||
            `${p.first_name || ""} ${p.last_name || ""}`.trim() ||
            (pos === "DEF" ? `${pid} DEF` : `Player ${pid}`),
          pos: pos,
          team: p.team || (pos === "DEF" ? pid : "FA")
        };
      }
    }
    state.sleeperPlayersDb = stripped;
    setItem(STORAGE_KEYS.PLAYERS_SLEEPER, stripped);
    setItem("sleeper_players_v3", stripped);
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

/**
 * Resolves player information including name, position, team, and headshot URL.
 *
 * @param {string} pid Player identifier (Sleeper ID or espn_ID)
 * @returns {{ id: string, name: string, pos: string, team: string, isDef: boolean, headshotUrl: string|null }} Player info object
 */
export function getPlayerInfo(pid) {
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

  // Check ESPN Player Database
  if (state.espnPlayersDb && state.espnPlayersDb[pid]) {
    const p = state.espnPlayersDb[pid];
    const isDef = p.pos === "DEF";
    const cleanNumericId = String(pid).replace(/^espn_/, "");
    return {
      id: pid,
      name: p.name,
      pos: p.pos,
      team: p.team,
      isDef: isDef,
      headshotUrl:
        isDef && p.team
          ? `https://a.espncdn.com/i/teamlogos/nfl/500/${p.team.toLowerCase()}.png`
          : `https://a.espncdn.com/i/headshots/nfl/players/full/${cleanNumericId}.png`
    };
  }

  // Check Sleeper Player Database
  if (state.sleeperPlayersDb && state.sleeperPlayersDb[pid]) {
    const p = state.sleeperPlayersDb[pid];
    const isDef = p.pos === "DEF";
    return {
      id: pid,
      name: p.name,
      pos: p.pos,
      team: p.team,
      isDef: isDef,
      headshotUrl:
        isDef && p.team
          ? `https://sleepercdn.com/images/v2/icons/league/teams/nfl/${p.team.toLowerCase()}.png`
          : `https://sleepercdn.com/content/nfl/players/thumb/${pid}.jpg`
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
    headshotUrl: isEspn
      ? `https://a.espncdn.com/i/headshots/nfl/players/full/${cleanNumeric}.png`
      : `https://sleepercdn.com/content/nfl/players/thumb/${pid}.jpg`
  };
}

/**
 * Returns a styled HTML badge element for a given fantasy position.
 *
 * @param {string} pos Position string (e.g., "QB", "WR")
 * @returns {string} HTML string
 */
export function getPlayerPositionBadge(pos) {
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
