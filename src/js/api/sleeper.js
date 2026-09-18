/**
 * CrossLeague • Sleeper Fantasy API Client
 *
 * Handles Sleeper REST API requests, username/user_id resolutions,
 * avatar image URL generation, league metadata fetches, and matchup processing.
 */

import { BASE_URL } from "../state/constants.js";
import { cachedApiFetch } from "../state/cache.js";

/**
 * Performs a GET request to the Sleeper API endpoint with storage-backed TTL caching.
 *
 * @param {string} endpoint Path suffix (e.g. "/user/123")
 * @param {object} [options] Fetch and cache options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  let ttlMs = 15 * 60 * 1000; // 15 mins default
  if (endpoint.includes("/state/nfl")) {
    ttlMs = 2 * 60 * 60 * 1000; // 2 hours for NFL state
  } else if (endpoint.includes("/matchups/") || endpoint.includes("/rosters")) {
    ttlMs = 60 * 60 * 1000; // 1 hour for matchups/rosters
  }
  return await cachedApiFetch(url, { ...options, ttlMs });
}

/**
 * Resolves a username or numeric user ID to a verified Sleeper user object.
 *
 * @param {string} inputVal Raw user input string
 * @returns {Promise<{ userId: string, displayName: string, avatar: string }>} User object
 */
export async function resolveUser(inputVal) {
  const cleaned = (inputVal || "").trim();
  if (!cleaned) throw new Error("Please enter a Sleeper username or User ID.");

  if (/^\d+$/.test(cleaned)) {
    try {
      const userData = await apiFetch(`/user/${cleaned}`);
      if (userData && userData.user_id) {
        return {
          userId: userData.user_id,
          displayName: userData.display_name || userData.username || cleaned,
          avatar: userData.avatar || ""
        };
      }
    } catch {
      // Fallback to numeric user ID
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

/**
 * Generates the thumbnail avatar URL for a Sleeper avatar hash.
 *
 * @param {string|null} avatarId Avatar hash ID
 * @returns {string|null} Avatar image URL
 */
export function getAvatarUrl(avatarId) {
  if (!avatarId) return null;
  return `https://sleepercdn.com/avatars/thumbs/${avatarId}`;
}

/**
 * Process Weekly Matchups into Records with Head-to-Head Outcomes & Bench Analytics
 *
 * @param {Array<object>} matchupsRaw Raw matchups array
 * @param {Array<object>} rostersRaw Raw rosters array
 * @param {Record<string, object>} userMap Map of user_id to user details
 * @param {string} lid League ID
 * @param {string} lname League name
 * @param {string|null} lavatar League avatar hash
 * @param {number} targetWeek Week number
 * @returns {Array<object>} Processed weekly records
 */
export function processWeeklyMatchups(
  matchupsRaw,
  rostersRaw,
  userMap,
  lid,
  lname,
  lavatar,
  targetWeek
) {
  const rosterToOwner = {};
  for (const r of rostersRaw) {
    rosterToOwner[r.roster_id] = r.owner_id;
  }

  // Step 1: Build basic records
  const weekRecords = [];
  const matchupGroups = {}; // matchup_id -> [record, record]

  for (const m of matchupsRaw || []) {
    const rid = m.roster_id;
    const ownerId = rosterToOwner[rid];
    const userInfo = userMap[ownerId] || {};

    const customPts = m.custom_points;
    const points = customPts !== null && customPts !== undefined ? customPts : m.points || 0.0;
    const roundedPoints = Math.round(parseFloat(points || 0) * 100) / 100;

    // Bench & Players Points
    const startersList = (m.starters || []).filter(pid => pid && pid !== "0");
    const allPlayersList = (m.players || []).filter(pid => pid && pid !== "0");
    const playersPointsMap = { ...(m.players_points || {}) };
    const startersPoints = (m.starters_points || []).map(p => parseFloat(p || 0));

    // Ensure starters have their points mapped even if players_points object is partial or omitted
    startersList.forEach((pid, idx) => {
      if (
        pid &&
        (playersPointsMap[pid] === undefined || playersPointsMap[pid] === null) &&
        startersPoints[idx] !== undefined
      ) {
        playersPointsMap[pid] = startersPoints[idx];
      }
    });

    let benchPoints = 0;
    let highestBenchPlayer = { name: "Bench Player", points: 0 };

    // Calculate bench from rostered players not in starting slots
    const benchedIds = allPlayersList.filter(pid => !startersList.includes(pid));
    if (benchedIds.length > 0 && Object.keys(playersPointsMap).length > 0) {
      benchedIds.forEach(pid => {
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

    // Optimal Lineup Potential: starters points plus any positive gains from bench players
    let optimalPoints = roundedPoints;
    if (allPlayersList.length > 0 && Object.keys(playersPointsMap).length > 0) {
      const sortedPlayerScores = Object.values(playersPointsMap)
        .map(v => parseFloat(v) || 0)
        .sort((a, b) => b - a);
      const starterSlotCount = Math.max(1, startersList.length);
      const topPossibleSum = sortedPlayerScores
        .slice(0, starterSlotCount)
        .reduce((a, b) => a + b, 0);
      optimalPoints = Math.max(roundedPoints, Math.round(topPossibleSum * 100) / 100);
    }
    const efficiency =
      roundedPoints > 0 && optimalPoints > 0
        ? Math.min(100, Math.round((roundedPoints / optimalPoints) * 100))
        : 100;

    const record = {
      id: `${lid}-${rid}`,
      week: targetWeek,
      points: roundedPoints,
      manager: userInfo.displayName || "Unclaimed Roster",
      teamName: userInfo.teamName || `Team ${rid}`,
      league: lname,
      leagueId: lid,
      leagueAvatar: lavatar,
      ownerId: ownerId,
      avatar: userInfo.avatar,
      matchupId: m.matchup_id,
      startersCount: startersList.length,
      startersList: startersList,
      allPlayersList: allPlayersList,
      playersPointsMap: playersPointsMap,
      startersPoints: startersPoints,
      benchPoints: Math.round(benchPoints * 100) / 100,
      startersTotal: Math.round(startersTotal * 100) / 100,
      optimalPoints: Math.round(optimalPoints * 100) / 100,
      efficiency: efficiency,
      highestBenchScore: Math.round(highestBenchPlayer.points * 100) / 100,
      // Matchup outcome placeholders
      outcome: "unpaired", // "win" | "loss" | "tie" | "unplayed" | "unpaired"
      opponentName: null,
      opponentTeam: null,
      opponentPoints: null,
      margin: 0
    };

    weekRecords.push(record);

    if (m.matchup_id !== undefined && m.matchup_id !== null) {
      if (!matchupGroups[m.matchup_id]) matchupGroups[m.matchup_id] = [];
      matchupGroups[m.matchup_id].push(record);
    }
  }

  // Step 2: Resolve head-to-head outcomes
  Object.values(matchupGroups).forEach(pair => {
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

  // Step 3: Handle unpaired teams or non-H2H / Guillotine / Total Points leagues
  const unpairedTeams = weekRecords.filter(r => r.outcome === "unpaired");
  if (unpairedTeams.length > 0 && weekRecords.length > 1) {
    const activeScores = weekRecords.map(r => r.points).filter(p => p > 0);
    if (activeScores.length > 0) {
      activeScores.sort((a, b) => a - b);
      const median = activeScores[Math.floor(activeScores.length / 2)] || 0;
      unpairedTeams.forEach(t => {
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

  // Step 4: Calculate League All-Play Record & Luck Index for this week
  const activeWeekSquads = weekRecords.filter(
    r => (r.points > 0 || r.startersTotal > 0) && r.outcome !== "unplayed"
  );
  const totalInLeague = activeWeekSquads.length;
  weekRecords.forEach(t => {
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
    activeWeekSquads.forEach(other => {
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
