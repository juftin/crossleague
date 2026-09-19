/**
 * CrossLeague • Data Synchronization & Fetching Service
 */

import { useCrossLeagueStore } from "../state/useCrossLeagueStore.js";
import { apiFetch, resolveUser, processWeeklyMatchups } from "../api/sleeper.js";
import { fetchEspnLeague } from "../api/espn.js";
import { initPlayersDb } from "../api/players.js";
import { calculateStdDev } from "../analytics/statistics.js";
import { saveDataToCache, tryLoadFromCache } from "../state/cache.js";

export async function syncData(forceRefresh = false) {
  const store = useCrossLeagueStore.getState();
  const {
    platform,
    syncType,
    userName,
    userId,
    customLeagueIds,
    season,
    week,
    mode,
    pendingLeagueIdsFilter
  } = store;

  const isLeaguesSync = syncType === "leagues" || platform === "espn";
  const inputUser = userName || userId;

  let targetIds =
    pendingLeagueIdsFilter && pendingLeagueIdsFilter.length > 0
      ? pendingLeagueIdsFilter
      : customLeagueIds;

  if (isLeaguesSync || platform === "espn" || (!inputUser && targetIds.length > 0)) {
    if (targetIds.length === 0) {
      store.setError(
        platform === "espn"
          ? "Please enter at least one ESPN League ID."
          : "Please enter at least one League ID."
      );
      return;
    }
  } else if (!inputUser) {
    store.setError("Please enter a Sleeper username or numeric User ID.");
    return;
  }

  // Check cache first if not forced
  if (!forceRefresh) {
    const cached = tryLoadFromCache(inputUser, season, mode, week);
    if (cached) {
      store.setRawRecords(cached.records || []);
      store.setLeaguesMap(cached.leaguesMap || {});
      store.setAllLeaguesData(cached.allLeaguesData || []);
      store.setError(null);
      store.setLoading(false);
      return;
    }
  }

  store.setLoading(true, "Synchronizing league data...", 10);
  store.setError(null);

  try {
    const combinedLeaguesData = [];
    const combinedRecords = [];
    const leaguesMap = {};

    if (platform === "espn") {
      const espnTargetIds = targetIds.map(id =>
        String(id)
          .trim()
          .replace(/^espn:/, "")
      );
      store.setProgress(20);
      let completed = 0;

      await Promise.all(
        espnTargetIds.map(async espnId => {
          try {
            const res = await fetchEspnLeague(espnId, season, week, mode);
            if (res && res.leagueInfo) {
              combinedLeaguesData.push(res.leagueInfo);
              leaguesMap[res.leagueInfo.league_id] = {
                id: res.leagueInfo.league_id,
                name: res.leagueInfo.name,
                avatar: res.leagueInfo.avatar,
                platform: "espn",
                totalRosters: res.leagueInfo.total_rosters,
                scores: (res.records || []).map(r => r.points)
              };
              (res.records || []).forEach(r => combinedRecords.push(r));
            }
          } catch (err) {
            console.error(`Error loading ESPN league ${espnId}:`, err);
            store.setError(`Error loading ESPN League ${espnId}: ${err.message}`);
            throw err;
          } finally {
            completed++;
            store.setProgress(20 + Math.round((completed / espnTargetIds.length) * 75));
          }
        })
      );
    } else {
      // Sleeper platform
      const sleeperTargetIds = targetIds.map(id =>
        String(id)
          .trim()
          .replace(/^sleeper:/, "")
      );
      let sleeperLeaguesData = [];

      if (!isLeaguesSync && inputUser) {
        const [userObj] = await Promise.all([resolveUser(inputUser), initPlayersDb()]);
        store.setUserId(userObj.userId);
        store.setUserName(userObj.displayName);
        store.setUserAvatar(userObj.avatar);
        store.setProgress(15);
        sleeperLeaguesData = await apiFetch(`/user/${userObj.userId}/leagues/nfl/${season}`);
      } else if (sleeperTargetIds.length > 0) {
        await initPlayersDb();
        store.setProgress(15);
        const fetched = await Promise.all(
          sleeperTargetIds.map(lid => apiFetch(`/league/${lid}`).catch(() => null))
        );
        sleeperLeaguesData = fetched.filter(l => l && l.league_id);
      }

      if (sleeperLeaguesData && sleeperLeaguesData.length > 0) {
        sleeperLeaguesData.forEach(l => {
          l.platform = "sleeper";
          combinedLeaguesData.push(l);
        });

        if (mode === "SEASON_ROLLUP") {
          const total = sleeperLeaguesData.length;
          const teamRollups = {};
          let completed = 0;

          await Promise.all(
            sleeperLeaguesData.map(async league => {
              const lid = league.league_id;
              const lname = league.name || `League ${lid}`;
              const lavatar = league.avatar || null;

              leaguesMap[lid] = {
                id: lid,
                name: lname,
                avatar: lavatar,
                platform: "sleeper",
                totalRosters: league.total_rosters || 12,
                scores: []
              };

              try {
                const [usersRaw, rostersRaw] = await Promise.all([
                  apiFetch(`/league/${lid}/users`).catch(() => []),
                  apiFetch(`/league/${lid}/rosters`).catch(() => [])
                ]);

                const userMap = {};
                for (const u of usersRaw) {
                  const uid = u.user_id;
                  const meta = u.metadata || {};
                  userMap[uid] = {
                    displayName: u.display_name || u.username || "Unknown",
                    teamName: meta.team_name || null,
                    avatar: u.avatar || null
                  };
                }

                const weeksToFetch = [];
                for (let w = 1; w <= week; w++) weeksToFetch.push(w);

                const weeklyMatchupsList = await Promise.all(
                  weeksToFetch.map(w => apiFetch(`/league/${lid}/matchups/${w}`).catch(() => []))
                );

                weeksToFetch.forEach((w, idx) => {
                  const matchupsRaw = weeklyMatchupsList[idx];
                  const weekRecords = processWeeklyMatchups(
                    matchupsRaw,
                    rostersRaw,
                    userMap,
                    lid,
                    lname,
                    lavatar,
                    w
                  );

                  for (const r of weekRecords) {
                    const rosterId = r.id;
                    if (!teamRollups[rosterId]) {
                      teamRollups[rosterId] = {
                        id: rosterId,
                        leagueId: lid,
                        leagueName: lname,
                        leagueAvatar: lavatar,
                        manager: r.manager,
                        teamName: r.teamName,
                        avatar: r.avatar,
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
                        weeklyScores: [],
                        efficiencies: [],
                        weeklyPlayerRecords: []
                      };
                    }

                    teamRollups[rosterId].totalPoints += r.points;
                    teamRollups[rosterId].totalBenchPoints += r.benchPoints || 0;
                    teamRollups[rosterId].weeklyScores.push(r.points);
                    teamRollups[rosterId].efficiencies.push(r.efficiency || 100);
                    teamRollups[rosterId].weeklyPlayerRecords.push({
                      week: w,
                      startersList: r.startersList || [],
                      allPlayersList: r.allPlayersList || [],
                      playersPointsMap: r.playersPointsMap || {}
                    });

                    if (r.result === "WIN" || r.outcome === "win") teamRollups[rosterId].wins += 1;
                    else if (r.result === "LOSS" || r.outcome === "loss")
                      teamRollups[rosterId].losses += 1;
                    else if (r.result === "TIE" || r.outcome === "tie")
                      teamRollups[rosterId].ties += 1;

                    teamRollups[rosterId].allPlayWins += r.allPlayWins;
                    teamRollups[rosterId].allPlayLosses += r.allPlayLosses;
                    teamRollups[rosterId].allPlayTies += r.allPlayTies;
                    teamRollups[rosterId].expectedWins += r.expectedWins;
                    teamRollups[rosterId].opponentPointsTotal +=
                      r.pointsAgainst || r.opponentPoints || 0;

                    leaguesMap[lid].scores.push(r.points);
                  }
                });
              } catch (err) {
                console.error(`Error loading season data for league ${lid}:`, err);
              } finally {
                completed++;
                store.setProgress(25 + Math.round((completed / total) * 70));
              }
            })
          );

          const sleeperRollupRecords = Object.values(teamRollups).map(t => {
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
              leagueName: t.leagueName,
              leagueAvatar: t.leagueAvatar,
              manager: t.manager,
              teamName: t.teamName,
              avatar: t.avatar,
              platform: "sleeper",
              points: avgPts,
              totalPoints: roundedTotal,
              avgPoints: avgPts,
              weeksCount: weeksCount,
              stdDev: stdDev,
              highScore: highScore,
              lowScore: lowScore,
              rawWins: t.wins,
              rawLosses: t.losses,
              rawTies: t.ties,
              allPlayWins: t.allPlayWins,
              allPlayLosses: t.allPlayLosses,
              allPlayTies: t.allPlayTies,
              allPlayWinPct: apWinPct,
              expectedWins: expWins,
              actualWins: actWins,
              luck: seasonLuck,
              pointsAgainst: avgPa,
              benchPoints: Math.round((t.totalBenchPoints / weeksCount) * 100) / 100,
              efficiency: avgEff,
              weeklyScores: t.weeklyScores,
              weeklyPlayerRecords: t.weeklyPlayerRecords
            };
          });

          sleeperRollupRecords.forEach(r => combinedRecords.push(r));
        } else {
          // Single Week
          const total = sleeperLeaguesData.length;
          let completed = 0;

          await Promise.all(
            sleeperLeaguesData.map(async league => {
              const lid = league.league_id;
              const lname = league.name || `League ${lid}`;
              const lavatar = league.avatar || null;

              leaguesMap[lid] = {
                id: lid,
                name: lname,
                avatar: lavatar,
                platform: "sleeper",
                totalRosters: league.total_rosters || 12,
                scores: []
              };

              try {
                const [usersRaw, rostersRaw, matchupsRaw] = await Promise.all([
                  apiFetch(`/league/${lid}/users`).catch(() => []),
                  apiFetch(`/league/${lid}/rosters`).catch(() => []),
                  apiFetch(`/league/${lid}/matchups/${week}`).catch(() => [])
                ]);

                const userMap = {};
                for (const u of usersRaw) {
                  const uid = u.user_id;
                  const meta = u.metadata || {};
                  userMap[uid] = {
                    displayName: u.display_name || u.username || "Unknown",
                    teamName: meta.team_name || null,
                    avatar: u.avatar || null
                  };
                }

                const weekRecords = processWeeklyMatchups(
                  matchupsRaw,
                  rostersRaw,
                  userMap,
                  lid,
                  lname,
                  lavatar,
                  week
                );

                weekRecords.forEach(r => {
                  r.platform = "sleeper";
                  combinedRecords.push(r);
                  leaguesMap[lid].scores.push(r.points);
                });
              } catch (err) {
                console.error(`Error loading league ${lid}:`, err);
              } finally {
                completed++;
                store.setProgress(30 + Math.round((completed / total) * 65));
              }
            })
          );
        }
      }
    }

    if (combinedRecords.length === 0) {
      store.setError("No scores found for the requested season/week across selected platforms.");
      store.setLoading(false);
      return;
    }

    store.setRawRecords(combinedRecords);
    store.setLeaguesMap(leaguesMap);
    store.setAllLeaguesData(combinedLeaguesData);

    // Filter selected leagues if pending
    if (pendingLeagueIdsFilter && pendingLeagueIdsFilter.length > 0) {
      const activeIds = combinedLeaguesData
        .map(l => l.league_id)
        .filter(id => pendingLeagueIdsFilter.includes(id));
      store.setSelectedLeagueIds(activeIds.length > 0 ? activeIds : Object.keys(leaguesMap));
    } else {
      store.setSelectedLeagueIds(Object.keys(leaguesMap));
    }

    // Cache results
    saveDataToCache(inputUser, season, mode, week, {
      records: combinedRecords,
      leaguesMap,
      allLeaguesData: combinedLeaguesData
    });

    store.setError(null);
  } catch (err) {
    console.error("Error during sync:", err);
    store.setError(err.message || "Failed to sync leagues data");
  } finally {
    store.setLoading(false);
  }
}
