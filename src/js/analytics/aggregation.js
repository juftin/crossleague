/**
 * CrossLeague • Player Aggregation & Positional MVP Analytics
 *
 * Consolidates weekly player scoring, start/bench ownership rates across leagues,
 * and identifies the top fantasy performer (MVP) for QB, RB, WR, TE, K, and DEF.
 */

/**
 * Aggregates player performances and ownership stats across all active rosters.
 *
 * @param {Array<object>} records Team records
 * @param {boolean} isSeason Whether in season rollup mode
 * @param {number} targetWeek Target matchup week
 * @param {Function} getPlayerInfoFn Function to resolve player metadata (name, pos, team, etc.)
 * @returns {Array<object>} Aggregated player objects
 */
export function aggregatePlayers(
  records = [],
  isSeason = false,
  targetWeek = 1,
  getPlayerInfoFn = id => ({ name: `Player #${id}`, pos: "FLEX", team: "FA" })
) {
  const playerMap = {};

  if (isSeason) {
    (records || []).forEach(r => {
      (r.weeklyPlayerRecords || []).forEach(wRec => {
        const week = wRec.week;
        const ptsMap = wRec.playersPointsMap || {};
        const starters = new Set(wRec.startersList || []);
        const all = new Set(wRec.allPlayersList || []);
        const allPids = new Set([...Object.keys(ptsMap), ...all, ...starters]);

        allPids.forEach(pid => {
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
          if (score > 0 || ptsMap[pid] !== undefined) {
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
    return Object.values(playerMap).map(p => {
      const info = getPlayerInfoFn(p.id);
      const activeWeeks = Object.keys(p.weeklyScores).length;
      const gamesCount = activeWeeks > 0 ? activeWeeks : Math.max(1, targetWeekNum);
      const avgPpg = Math.round((p.totalPoints / gamesCount) * 100) / 100;
      const roundedTotal = Math.round(p.totalPoints * 100) / 100;
      const totalRostered = p.startedCount + p.benchedCount;
      const startRate = totalRostered > 0 ? Math.round((p.startedCount / totalRostered) * 100) : 0;
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
        avgPpg: avgPpg,
        gamesCount: gamesCount,
        weeklyScores: p.weeklyScores,
        startedCount: p.startedCount,
        benchedCount: p.benchedCount,
        rosteredCount: owners.length,
        totalAppearances: totalRostered,
        startRate: startRate,
        owners: owners
      };
    });
  }

  // Single Week Mode
  (records || []).forEach(r => {
    const ptsMap = r.playersPointsMap || {};
    const starters = new Set(r.startersList || []);
    const all = new Set(r.allPlayersList || []);
    const allPids = new Set([...Object.keys(ptsMap), ...all, ...starters]);

    allPids.forEach(pid => {
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
        isStarter: isStarter,
        points: score
      });
    });
  });

  return Object.values(playerMap).map(p => {
    const info = getPlayerInfoFn(p.id);
    const totalRostered = p.startedCount + p.benchedCount;
    const startRate = totalRostered > 0 ? Math.round((p.startedCount / totalRostered) * 100) : 0;

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
      startRate: startRate,
      owners: p.owners
    };
  });
}

/**
 * Calculates top performer (Positional MVP) for each standard fantasy position.
 *
 * @param {Array<object>} allPlayers Aggregated players list
 * @returns {Record<string, object>} Positional MVPs by position key (QB, RB, WR, TE, K, DEF)
 */
export function calculatePositionalMvps(allPlayers = []) {
  const positions = ["QB", "RB", "WR", "TE", "K", "DEF"];
  const mvps = {};

  positions.forEach(pos => {
    const matching = (allPlayers || [])
      .filter(p => (p.pos || "").toUpperCase() === pos && (p.points || 0) > 0)
      .sort((a, b) => (b.points || 0) - (a.points || 0));
    mvps[pos] = matching[0] || null;
  });

  return mvps;
}
