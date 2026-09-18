/**
 * CrossLeague • ESPN Fantasy Adapter & Normalizer
 *
 * Connects to public ESPN Fantasy Football leagues, parses boxscores,
 * maps position IDs and lineups, and normalizes matchup structures to standard CrossLeague schema.
 */

import { ESPN_BASE_URL, ESPN_POS_MAP, ESPN_PRO_TEAMS } from "../state/constants.js";
import { state } from "../state/store.js";
import { calculateStdDev } from "../analytics/statistics.js";
import { cachedApiFetch } from "../state/cache.js";

/**
 * Determines if an ESPN lineup slot ID corresponds to an active starting position.
 * Bench (slot 20) and IR (slot 21) return false.
 *
 * @param {number} slotId ESPN Lineup Slot ID
 * @returns {boolean} True if starter slot
 */
export function isEspnStarter(slotId) {
  return slotId !== 20 && slotId !== 21;
}

/**
 * Dispatches an HTTP GET request to the ESPN Fantasy API (with CORS proxy fallback if needed)
 * and storage-backed TTL caching to prevent upstream spamming.
 *
 * @param {string} path API path
 * @param {object} [options] Fetch and cache options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function fetchEspnApi(path, options = {}) {
  const urlsToTry = [
    `${ESPN_BASE_URL}${path}`,
    `https://corsproxy.io/?${encodeURIComponent(`${ESPN_BASE_URL}${path}`)}`
  ];

  let lastError = null;
  for (const targetUrl of urlsToTry) {
    try {
      const data = await cachedApiFetch(targetUrl, {
        headers: { Accept: "application/json" },
        ttlMs: 15 * 60 * 1000,
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

/**
 * Parses raw ESPN roster entries to calculate starters list, bench points, and optimal score.
 *
 * @param {object} roster ESPN team roster object
 * @param {number} targetWeekNum Matchup week number
 * @returns {object} Parsed roster analytics
 */
export function parseRosterEntries(roster, targetWeekNum = 1) {
  const entries = (roster && roster.entries) || [];
  const startersList = [];
  const allPlayersList = [];
  const playersPointsMap = {};
  const startersPoints = [];
  let startersTotal = 0;
  let benchPoints = 0;
  let highestBenchScore = 0;

  entries.forEach(e => {
    const p = e.playerPoolEntry && e.playerPoolEntry.player;
    if (!p) return;
    const pid = `espn_${p.id}`;
    let pts = 0;
    if (p.stats && Array.isArray(p.stats) && p.stats.length > 0) {
      const weekStat = p.stats.find(
        s => s.statSourceId === 0 && s.statSplitTypeId === 1 && s.scoringPeriodId === targetWeekNum
      );
      if (weekStat && typeof weekStat.appliedTotal === "number") {
        pts = weekStat.appliedTotal;
      } else {
        const scoringStat =
          p.stats.find(s => s.statSourceId === 0 && s.statSplitTypeId === 1) ||
          p.stats.find(s => s.statSourceId === 0) ||
          p.stats[0];
        if (scoringStat && typeof scoringStat.appliedTotal === "number") {
          pts = scoringStat.appliedTotal;
        }
      }
    } else if (typeof e.appliedStatTotal === "number") {
      pts = e.appliedStatTotal;
    } else if (
      e.playerPoolEntry &&
      typeof e.playerPoolEntry.appliedStatTotal === "number" &&
      targetWeekNum === 1
    ) {
      pts = e.playerPoolEntry.appliedStatTotal;
    } else if (e.playerPoolEntry && e.playerPoolEntry.ratings && e.playerPoolEntry.ratings[0]) {
      pts = e.playerPoolEntry.ratings[0].totalPoints || 0;
    }
    pts = Math.round(parseFloat(pts || 0) * 100) / 100;

    const pos = ESPN_POS_MAP[p.defaultPositionId] || "FLEX";
    const teamAbbrev = ESPN_PRO_TEAMS[p.proTeamId] || "FA";

    state.espnPlayersDb[pid] = {
      name: p.fullName || `${p.firstName || ""} ${p.lastName || ""}`.trim() || `Player ${p.id}`,
      pos: pos,
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
    // quota safe
  }

  // Optimal Lineup Potential
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

/**
 * Fetches and processes an entire ESPN fantasy league for weekly or season-long modes.
 *
 * @param {string} rawId ESPN league ID
 * @param {number|string} season NFL season year
 * @param {number} targetWeek Target matchup week
 * @param {"WEEKLY"|"SEASON_ROLLUP"} mode Aggregation mode
 * @returns {Promise<{ leagueInfo: object, records: Array<object> }>} Normalized league & records
 */
export async function fetchEspnLeague(rawId, season, targetWeek, mode) {
  const cleanId = String(rawId)
    .replace(/^espn:/i, "")
    .trim();
  const sNum = parseInt(season, 10) || 2024;
  const viewParams =
    "view=mTeam&view=mRoster&view=mMatchup&view=mMatchupScore&view=mSettings&view=mBoxscore&view=mMembers";

  const path =
    mode === "SEASON_ROLLUP"
      ? `/apis/v3/games/ffl/seasons/${sNum}/segments/0/leagues/${cleanId}?${viewParams}`
      : `/apis/v3/games/ffl/seasons/${sNum}/segments/0/leagues/${cleanId}?scoringPeriodId=${targetWeek}&${viewParams}`;

  let rawData;
  try {
    rawData = await fetchEspnApi(path);
  } catch (primaryErr) {
    // Historical fallback if seasons endpoint gives 404 on an older season
    if (primaryErr.message.includes("not found")) {
      try {
        const histPath =
          mode === "SEASON_ROLLUP"
            ? `/apis/v3/games/ffl/leagueHistory/${cleanId}?seasonId=${sNum}&${viewParams}`
            : `/apis/v3/games/ffl/leagueHistory/${cleanId}?seasonId=${sNum}&scoringPeriodId=${targetWeek}&${viewParams}`;
        rawData = await fetchEspnApi(histPath);
      } catch {
        throw primaryErr;
      }
    } else {
      throw primaryErr;
    }
  }

  const leagueObj = Array.isArray(rawData) ? rawData[0] : rawData;
  if (!leagueObj || (!leagueObj.teams && !leagueObj.settings)) {
    throw new Error(`Invalid ESPN League data returned for ID ${cleanId}`);
  }

  const lid = `espn:${cleanId}`;
  const lname = (leagueObj.settings && leagueObj.settings.name) || `ESPN League ${cleanId}`;
  const lavatar = null;
  const rosterCount =
    (leagueObj.settings && leagueObj.settings.size) ||
    (leagueObj.teams && leagueObj.teams.length) ||
    10;

  // Member Map
  const memberMap = {};
  (leagueObj.members || []).forEach(m => {
    memberMap[m.id] = m.displayName || m.firstName || "Manager";
  });

  // Team Map
  const teamMap = {};
  const teamRosters = {};
  (leagueObj.teams || []).forEach(t => {
    const ownerId = (t.owners && t.owners[0]) || "";
    const mgr = memberMap[ownerId] || `Manager ${t.id}`;
    const tName =
      t.name || (t.location ? `${t.location} ${t.nickname || ""}`.trim() : `Team ${t.id}`);
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
    (leagueObj.teams || []).forEach(t => {
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
      weeksToFetch.map(w =>
        fetchEspnApi(
          `/apis/v3/games/ffl/seasons/${sNum}/segments/0/leagues/${cleanId}?scoringPeriodId=${w}&view=mMatchup&view=mMatchupScore&view=mBoxscore&view=mRoster&view=mTeam`
        ).catch(() => null)
      )
    );

    // Process all weeks up to targetWeek
    for (let w = 1; w <= targetWeek; w++) {
      const wLeagueObj = Array.isArray(weeklyBoxscoreList[w - 1])
        ? weeklyBoxscoreList[w - 1][0]
        : weeklyBoxscoreList[w - 1];
      const wTeamRosters = {};
      ((wLeagueObj && wLeagueObj.teams) || []).forEach(t => {
        if (t.roster) wTeamRosters[t.id] = t.roster;
      });
      const wSchedule = (wLeagueObj && wLeagueObj.schedule) || schedule;
      const weekGames = wSchedule.filter(s => s.matchupPeriodId === w);
      if (weekGames.length === 0) continue;

      const weekRecords = [];
      weekGames.forEach(m => {
        if (!m.home || !teamRollups[m.home.teamId]) return;
        const homeId = m.home.teamId;
        const awayId = m.away ? m.away.teamId : null;

        const homeRoster =
          wTeamRosters[homeId] ||
          teamRosters[homeId] ||
          (m.home &&
            (m.home.rosterForMatchupPeriod ||
              m.home.rosterForCurrentScoringPeriod ||
              m.home.rosterForMatchupPeriodDelayed ||
              m.home.roster)) ||
          null;
        const homeParsed = parseRosterEntries(homeRoster, w);
        const homePts =
          Math.round(
            parseFloat(
              m.home.totalPoints !== undefined && m.home.totalPoints !== null
                ? m.home.totalPoints
                : homeParsed.startersTotal || 0
            ) * 100
          ) / 100;

        const awayRoster =
          (m.away &&
            (wTeamRosters[awayId] ||
              teamRosters[awayId] ||
              m.away.rosterForMatchupPeriod ||
              m.away.rosterForCurrentScoringPeriod ||
              m.away.rosterForMatchupPeriodDelayed ||
              m.away.roster)) ||
          null;
        const awayParsed = parseRosterEntries(awayRoster, w);
        const awayPts =
          awayId && m.away
            ? Math.round(
                parseFloat(
                  m.away.totalPoints !== undefined && m.away.totalPoints !== null
                    ? m.away.totalPoints
                    : awayParsed.startersTotal || 0
                ) * 100
              ) / 100
            : 0;

        const homeRec = {
          teamId: homeId,
          points: homePts,
          parsed: homeParsed,
          opponentPoints: awayPts,
          outcome: "unpaired"
        };
        weekRecords.push(homeRec);

        if (awayId && teamRollups[awayId] && m.away) {
          const awayRec = {
            teamId: awayId,
            points: awayPts,
            parsed: awayParsed,
            opponentPoints: homePts,
            outcome: "unpaired"
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

      // Compute All-Play for week w
      const activeSquads = weekRecords.filter(r => r.points > 0 && r.outcome !== "unplayed");
      weekRecords.forEach(r => {
        let apW = 0,
          apL = 0,
          apT = 0;
        activeSquads.forEach(other => {
          if (other.teamId === r.teamId) return;
          if (r.points > other.points) apW++;
          else if (r.points < other.points) apL++;
          else apT++;
        });
        const otherCount = activeSquads.length - 1;
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
          const eff =
            r.points > 0 && r.parsed.optimalPoints > 0
              ? Math.min(100, Math.round((r.points / r.parsed.optimalPoints) * 100))
              : 100;
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

    const records = Object.values(teamRollups).map(t => {
      const weeksCount = t.weeklyScores.length || 1;
      const avgPts = Math.round((t.totalPoints / weeksCount) * 100) / 100;
      const roundedTotal = Math.round(t.totalPoints * 100) / 100;
      const stdDev = calculateStdDev(t.weeklyScores);
      const highScore = t.weeklyScores.length > 0 ? Math.max(...t.weeklyScores) : 0;
      const lowScore = t.weeklyScores.length > 0 ? Math.min(...t.weeklyScores) : 0;
      const avgEff =
        t.efficiencies.length > 0
          ? Math.round(t.efficiencies.reduce((a, b) => a + b, 0) / t.efficiencies.length)
          : 100;
      const totalAp = t.allPlayWins + t.allPlayLosses + t.allPlayTies;
      const apWinPct =
        totalAp > 0 ? Math.round(((t.allPlayWins + 0.5 * t.allPlayTies) / totalAp) * 100) : 0;
      const actWins = t.wins + 0.5 * t.ties;
      const expWins = Math.round(t.expectedWins * 100) / 100;
      const seasonLuck = Math.round((actWins - expWins) * 100) / 100;
      const avgPa =
        weeksCount > 0 ? Math.round((t.opponentPointsTotal / weeksCount) * 100) / 100 : 0;

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
        weeksCount: weeksCount,
        stdDev: stdDev,
        highScore: highScore,
        lowScore: lowScore,
        wins: t.wins,
        losses: t.losses,
        ties: t.ties,
        winPct:
          t.wins + t.losses + t.ties > 0
            ? Math.round((t.wins / (t.wins + t.losses + t.ties)) * 100)
            : 0,
        allPlayWins: t.allPlayWins,
        allPlayLosses: t.allPlayLosses,
        allPlayTies: t.allPlayTies,
        allPlayWinPct: apWinPct,
        expectedWins: expWins,
        actualWins: actWins,
        luckIndex: seasonLuck,
        pointsAgainst: avgPa,
        totalPointsAgainst: Math.round(t.opponentPointsTotal * 100) / 100,
        benchPoints: Math.round((t.totalBenchPoints / weeksCount) * 100) / 100,
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

  // Single Week Mode
  const weekGames = schedule.filter(s => s.matchupPeriodId === targetWeek);
  const weekRecords = [];

  weekGames.forEach(m => {
    if (!m.home) return;
    const homeT = teamMap[m.home.teamId] || {
      teamName: `Team ${m.home.teamId}`,
      manager: "Manager",
      logo: null
    };
    const awayT = m.away
      ? teamMap[m.away.teamId] || {
          teamName: `Team ${m.away.teamId}`,
          manager: "Manager",
          logo: null
        }
      : null;

    const homeRoster =
      teamRosters[m.home.teamId] ||
      (m.home &&
        (m.home.rosterForMatchupPeriod ||
          m.home.rosterForCurrentScoringPeriod ||
          m.home.rosterForMatchupPeriodDelayed ||
          m.home.roster)) ||
      null;
    const homeParsed = parseRosterEntries(homeRoster, targetWeek);
    const homePts =
      Math.round(
        parseFloat(
          m.home.totalPoints !== undefined && m.home.totalPoints !== null
            ? m.home.totalPoints
            : homeParsed.startersTotal || 0
        ) * 100
      ) / 100;

    const awayRoster =
      (m.away &&
        (teamRosters[m.away.teamId] ||
          m.away.rosterForMatchupPeriod ||
          m.away.rosterForCurrentScoringPeriod ||
          m.away.rosterForMatchupPeriodDelayed ||
          m.away.roster)) ||
      null;
    const awayParsed = parseRosterEntries(awayRoster, targetWeek);
    const awayPts =
      awayT && m.away
        ? Math.round(
            parseFloat(
              m.away.totalPoints !== undefined && m.away.totalPoints !== null
                ? m.away.totalPoints
                : awayParsed.startersTotal || 0
            ) * 100
          ) / 100
        : 0;

    const eff =
      homePts > 0 && homeParsed.optimalPoints > 0
        ? Math.min(100, Math.round((homePts / homeParsed.optimalPoints) * 100))
        : 100;

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
      const awayEff =
        awayPts > 0 && awayParsed.optimalPoints > 0
          ? Math.min(100, Math.round((awayPts / awayParsed.optimalPoints) * 100))
          : 100;

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

  // Calculate All-Play & Luck Index
  const activeSquads = weekRecords.filter(
    r => (r.points > 0 || r.startersTotal > 0) && r.outcome !== "unplayed"
  );
  const totalInLeague = activeSquads.length;

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

    let apWins = 0,
      apLosses = 0,
      apTies = 0;
    activeSquads.forEach(other => {
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
