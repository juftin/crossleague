/**
 * CrossLeague • Main Application Entry Point
 *
 * Modular ES entry point orchestrating state, API clients, analytics calculators,
 * UI components, and export tools.
 */

// 1. Re-export subsystems for package consumers
export * from "./state/constants.js";
export * from "./state/store.js";
export * from "./state/cache.js";
export * from "./state/preferences.js";
export * from "./state/urlParams.js";

export * from "./analytics/index.js";
export * from "./api/index.js";
export * from "./components/dom.js";
export * from "./components/toast.js";
export * from "./components/modal.js";
export * from "./components/pagination.js";
export * from "./components/dropdowns.js";
export * from "./components/tabs.js";
export * from "./components/podium.js";
export * from "./components/superlatives.js";
export * from "./components/cards.js";
export * from "./components/table.js";
export * from "./components/charts.js";
export * from "./components/leagueGrid.js";
export * from "./components/playerAnalytics.js";
export * from "./components/luckAnalytics.js";

export * from "./export/index.js";

// 2. Import internal dependencies for DOM binding & runtime coordination
import { state, getActiveRecords, getActiveLeaguesMap } from "./state/store.js";
import { TAB_ORDER } from "./state/constants.js";
import { saveDataToCache, tryLoadFromCache, loadCachedData } from "./state/cache.js";
import { savePreferences, initDefaults } from "./state/preferences.js";
import { getUrlParams, syncTabFromHash } from "./state/urlParams.js";

import { calculateStdDev } from "./analytics/statistics.js";
import { apiFetch, resolveUser, processWeeklyMatchups } from "./api/sleeper.js";
import { fetchEspnLeague } from "./api/espn.js";
import { initPlayersDb, getPlayerInfo } from "./api/players.js";

import {
  setLoading,
  updateProgress,
  showError,
  triggerConfetti,
  updateModeUI,
  setPlatform,
  setSyncType
} from "./components/dom.js";
import { showToast } from "./components/toast.js";
import {
  openSettingsModal,
  closeSettingsModal,
  toggleSettingsDropdown
} from "./components/modal.js";
import { updateSettingsButtonBadge } from "./state/preferences.js";
import { renderCustomLeagueIdChips, renderLeagueDropdown } from "./components/dropdowns.js";

import { switchTab, getCurrentlyActiveTab } from "./components/tabs.js";
import { renderPodium } from "./components/podium.js";
import { renderSuperlatives } from "./components/superlatives.js";
import { renderSummaryCards } from "./components/cards.js";
import {
  renderTable,
  sortTable,
  toggleRowExpand,
  goToMainPage,
  setMainPageSize,
  changeMainPage
} from "./components/table.js";
import { renderCharts } from "./components/charts.js";
import { renderLeagueGrid } from "./components/leagueGrid.js";
import {
  renderPlayerAnalytics,
  renderPlayerLeaderboard,
  aggregatePlayers,
  goToPlayerPage,
  setPlayerPageSize,
  changePlayerPage,
  setPlayerPositionFilter,
  togglePlayerRowExpand,
  sortPlayers
} from "./components/playerAnalytics.js";
import {
  renderLuckAnalytics,
  renderLuckTable,
  setLuckPageSize,
  changeLuckPage,
  goToLuckPage,
  sortLuckTable
} from "./components/luckAnalytics.js";

import { copyChatRecap } from "./export/recap.js";
import { exportCsv } from "./export/csv.js";
import { shareUrl, buildShareableUrl } from "./export/share.js";
import { downloadReport, shareReport, loadEmbeddedReport } from "./export/report.js";

/**
 * Main Data Fetcher - Synchronizes Sleeper or ESPN leagues
 */
export async function fetchLeaderboard() {
  const userIdInput = document.getElementById("userIdInput");
  const seasonInput = document.getElementById("seasonInput");
  const weekInput = document.getElementById("weekInput");
  const modeSelect = document.getElementById("modeSelect");
  const initialState = document.getElementById("initialState");
  const reportContent = document.getElementById("reportContent");
  const copyRecapBtn = document.getElementById("copyRecapBtn");
  const shareUrlBtn = document.getElementById("shareUrlBtn");
  const downloadReportBtn = document.getElementById("downloadReportBtn");
  const exportCsvBtn = document.getElementById("exportCsvBtn");

  const isLeaguesSync = state.currentSyncType === "leagues" || state.currentPlatform === "espn";
  const inputVal = userIdInput ? userIdInput.value.trim() : "";
  const season = seasonInput ? seasonInput.value : "2024";
  const targetWeek = weekInput ? parseInt(weekInput.value, 10) : 1;
  const mode = modeSelect ? modeSelect.value : "WEEKLY";

  const hasPendingLeagues = Boolean(
    state.pendingLeagueIdsFilter && state.pendingLeagueIdsFilter.size > 0
  );
  const hasCustomLeagues = Boolean(state.customLeagueIds && state.customLeagueIds.size > 0);

  let targetIds = [];
  if (
    isLeaguesSync ||
    state.currentPlatform === "espn" ||
    (!inputVal && (hasPendingLeagues || hasCustomLeagues))
  ) {
    targetIds = hasPendingLeagues
      ? Array.from(state.pendingLeagueIdsFilter)
      : Array.from(state.customLeagueIds);

    if (targetIds.length === 0) {
      showError(
        state.currentPlatform === "espn"
          ? "Please enter at least one ESPN League ID."
          : "Please enter at least one League ID."
      );
      return;
    }

    savePreferences();
    setLoading(true, `Fetching data for ${targetIds.length} leagues...`);
  } else {
    if (!inputVal) {
      showError("Please enter a Sleeper username or numeric User ID.");
      return;
    }

    savePreferences();
    setLoading(true, "Looking up Sleeper profile...");
  }

  try {
    const combinedLeaguesData = [];
    const combinedRecords = [];
    state.leaguesMap = {};

    if (state.currentPlatform === "espn") {
      const espnTargetIds = targetIds.map(rawId =>
        String(rawId)
          .trim()
          .replace(/^espn:/, "")
      );
      updateProgress(20, `Fetching ${espnTargetIds.length} ESPN leagues...`);
      let completedEspn = 0;

      await Promise.all(
        espnTargetIds.map(async espnId => {
          try {
            const res = await fetchEspnLeague(espnId, season, targetWeek, mode);
            if (res && res.leagueInfo) {
              combinedLeaguesData.push(res.leagueInfo);
              state.leaguesMap[res.leagueInfo.league_id] = {
                name: res.leagueInfo.name,
                avatar: res.leagueInfo.avatar,
                platform: "espn",
                rosterCount: res.leagueInfo.total_rosters,
                scores: (res.records || []).map(r => r.points)
              };
              (res.records || []).forEach(r => combinedRecords.push(r));
            }
          } catch (err) {
            console.error(`Error loading ESPN league ${espnId}:`, err);
            showError(`Error loading ESPN League ${espnId}: ${err.message}`);
            throw err;
          } finally {
            completedEspn++;
            const percent = 20 + Math.round((completedEspn / espnTargetIds.length) * 75);
            updateProgress(
              percent,
              `Loaded ${completedEspn}/${espnTargetIds.length} ESPN leagues...`
            );
          }
        })
      );
    } else {
      // Sleeper platform ONLY
      const sleeperTargetIds = targetIds.map(rawId =>
        String(rawId)
          .trim()
          .replace(/^sleeper:/, "")
      );
      let sleeperLeaguesData = [];
      if (!isLeaguesSync && inputVal) {
        const [userObj] = await Promise.all([resolveUser(inputVal), initPlayersDb()]);
        state.currentUserId = userObj.userId;
        state.currentUserName = userObj.displayName;
        state.currentUserAvatar = userObj.avatar;
        updateProgress(15, "Fetching active Sleeper leagues...");
        sleeperLeaguesData = await apiFetch(`/user/${state.currentUserId}/leagues/nfl/${season}`);
      } else if (sleeperTargetIds.length > 0) {
        state.currentUserId = "";
        state.currentUserName = "";
        state.currentUserAvatar = "";
        updateSettingsButtonBadge();
        await initPlayersDb();
        updateProgress(15, "Fetching Sleeper league metadata...");
        const fetched = await Promise.all(
          sleeperTargetIds.map(lid => apiFetch(`/league/${lid}`).catch(() => null))
        );
        sleeperLeaguesData = fetched.filter(l => l && l.league_id);
      }

      // Process Sleeper leagues if any
      if (sleeperLeaguesData && sleeperLeaguesData.length > 0) {
        sleeperLeaguesData.forEach(l => {
          l.platform = "sleeper";
          combinedLeaguesData.push(l);
        });

        if (mode === "SEASON_ROLLUP") {
          const totalSleeper = sleeperLeaguesData.length;
          const teamRollups = {};
          let completedCalls = 0;

          await Promise.all(
            sleeperLeaguesData.map(async league => {
              const lid = league.league_id;
              const lname = league.name || `League ${lid}`;
              const lavatar = league.avatar || null;

              state.leaguesMap[lid] = {
                name: lname,
                avatar: lavatar,
                platform: "sleeper",
                rosterCount: league.total_rosters || 12,
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
                for (let w = 1; w <= targetWeek; w++) weeksToFetch.push(w);

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
                        league: lname,
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

                    state.leaguesMap[lid].scores.push(r.points);
                  }
                });
              } catch (err) {
                console.error(`Error loading season data for league ${lid}:`, err);
              } finally {
                completedCalls++;
                const percent = 25 + Math.round((completedCalls / totalSleeper) * 70);
                updateProgress(
                  percent,
                  `Processed ${completedCalls}/${totalSleeper} Sleeper leagues...`
                );
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
              league: t.league,
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

          sleeperRollupRecords.forEach(r => combinedRecords.push(r));
        } else {
          // Sleeper Single Week
          const totalSleeper = sleeperLeaguesData.length;
          let completedLeagues = 0;

          await Promise.all(
            sleeperLeaguesData.map(async league => {
              const lid = league.league_id;
              const lname = league.name || `League ${lid}`;
              const lavatar = league.avatar || null;

              state.leaguesMap[lid] = {
                name: lname,
                avatar: lavatar,
                platform: "sleeper",
                rosterCount: league.total_rosters || 12,
                scores: []
              };

              try {
                const [usersRaw, rostersRaw, matchupsRaw] = await Promise.all([
                  apiFetch(`/league/${lid}/users`).catch(() => []),
                  apiFetch(`/league/${lid}/rosters`).catch(() => []),
                  apiFetch(`/league/${lid}/matchups/${targetWeek}`).catch(() => [])
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
                  targetWeek
                );

                weekRecords.forEach(r => {
                  r.platform = "sleeper";
                  combinedRecords.push(r);
                  state.leaguesMap[lid].scores.push(r.points);
                });
              } catch (err) {
                console.error(`Error loading league ${lid}:`, err);
              } finally {
                completedLeagues++;
                const percent = 30 + Math.round((completedLeagues / totalSleeper) * 65);
                updateProgress(
                  percent,
                  `Loaded ${completedLeagues}/${totalSleeper} Sleeper leagues...`
                );
              }
            })
          );
        }
      }
    }

    if (combinedRecords.length === 0) {
      showError(`No scores found for the requested season/week across selected platforms.`);
      return;
    }

    state.rawRecords = combinedRecords;
    state.allLeaguesData = combinedLeaguesData;

    if (state.pendingLeagueIdsFilter && state.pendingLeagueIdsFilter.size > 0) {
      state.selectedLeagueIds = new Set(
        combinedLeaguesData
          .map(l => l.league_id)
          .filter(
            id =>
              state.pendingLeagueIdsFilter.has(id) ||
              state.pendingLeagueIdsFilter.has(String(id).replace(/^espn:/, "")) ||
              state.pendingLeagueIdsFilter.has(String(id).replace(/^sleeper:/, ""))
          )
      );
      if (state.selectedLeagueIds.size === 0) {
        state.selectedLeagueIds = new Set(combinedLeaguesData.map(l => l.league_id));
      }
      state.pendingLeagueIdsFilter = null;
    } else {
      state.selectedLeagueIds = new Set(combinedLeaguesData.map(l => l.league_id));
    }

    setLoading(false);
    if (initialState) initialState.classList.add("hidden");
    if (reportContent) reportContent.classList.remove("hidden");
    if (copyRecapBtn) copyRecapBtn.classList.remove("hidden");
    if (shareUrlBtn) shareUrlBtn.classList.remove("hidden");
    if (downloadReportBtn) downloadReportBtn.classList.remove("hidden");
    if (exportCsvBtn) exportCsvBtn.classList.remove("hidden");

    renderLeagueDropdown();
    refreshDashboard();
    saveDataToCache(
      state.currentUserId,
      state.currentUserName,
      state.currentUserAvatar,
      season,
      mode,
      targetWeek,
      state.rawRecords,
      state.leaguesMap,
      state.allLeaguesData
    );

    const sorted = [...state.rawRecords].sort((a, b) => b.points - a.points);
    if (sorted[0] && getCurrentlyActiveTab() === "awards") {
      triggerConfetti();
    }
  } catch (err) {
    console.error("fetchLeaderboard Error:", err);
    showError(err.message || "Failed to load league data.");
  }
}

/**
 * Refreshes all dashboard cards, tables, charts, and analytics tabs.
 */
export function refreshDashboard() {
  state.currentMainPage = 1;
  state.currentPlayerPage = 1;
  state.currentLuckPage = 1;

  const activeRecords = getActiveRecords();
  const activeLeagues = getActiveLeaguesMap();

  renderPodium(activeRecords);
  renderSuperlatives(activeRecords);
  renderSummaryCards(activeRecords, activeLeagues);
  renderTable(activeRecords);
  renderCharts(activeRecords, activeLeagues);
  renderLeagueGrid(activeRecords, activeLeagues);
  renderPlayerAnalytics(activeRecords, activeLeagues);
  renderLuckAnalytics(activeRecords, activeLeagues);
}

/**
 * Resets and clears all in-memory state and localStorage data.
 */
export function clearAllData() {
  const confirmed = window.confirm(
    "Are you sure you want to clear all stored data, cached leagues, credentials, and settings? This will reset CrossLeague to its default state."
  );
  if (!confirmed) return;

  try {
    localStorage.clear();
  } catch (e) {
    console.warn("Could not clear localStorage:", e);
  }

  // Reset in-memory state
  state.rawRecords = [];
  state.allLeaguesData = [];
  state.leaguesMap = {};
  state.selectedLeagueIds.clear();
  state.customLeagueIds.clear();
  state.currentUserId = "";
  state.currentUserName = "";
  state.currentUserAvatar = "";
  state.currentPlatform = "sleeper";
  state.currentSyncType = "user";

  const userIdInput = document.getElementById("userIdInput");
  const customLeagueIdInput = document.getElementById("customLeagueIdInput");
  const seasonInput = document.getElementById("seasonInput");
  const weekInput = document.getElementById("weekInput");
  const modeSelect = document.getElementById("modeSelect");
  const reportContent = document.getElementById("reportContent");
  const initialState = document.getElementById("initialState");
  const skeletonLoader = document.getElementById("skeletonLoader");
  const syncControlCenter = document.getElementById("syncControlCenter");
  const liveSyncIndicator = document.getElementById("liveSyncIndicator");
  const headerSeasonBadge = document.getElementById("headerSeasonBadge");
  const headerWeekBadge = document.getElementById("headerWeekBadge");
  const shareUrlBtn = document.getElementById("shareUrlBtn");
  const copyRecapBtn = document.getElementById("copyRecapBtn");
  const downloadReportBtn = document.getElementById("downloadReportBtn");

  // Reset input fields
  if (userIdInput) userIdInput.value = "";
  if (customLeagueIdInput) customLeagueIdInput.value = "";
  if (seasonInput) seasonInput.value = "2026";
  if (weekInput) weekInput.value = "1";
  if (modeSelect) modeSelect.value = "WEEKLY";

  // Reset UI selections
  setPlatform("sleeper");
  setSyncType("user");
  updateModeUI();

  // Reset Dropdowns & Badges
  renderCustomLeagueIdChips();
  renderLeagueDropdown();
  updateSettingsButtonBadge();

  // Reset View State
  if (reportContent) reportContent.classList.add("hidden");
  if (initialState) initialState.classList.remove("hidden");
  if (skeletonLoader) skeletonLoader.classList.add("hidden");
  if (syncControlCenter) syncControlCenter.classList.add("hidden");
  if (liveSyncIndicator) liveSyncIndicator.classList.add("hidden");
  if (headerSeasonBadge) headerSeasonBadge.classList.add("hidden");
  if (headerWeekBadge) headerWeekBadge.classList.add("hidden");
  if (shareUrlBtn) shareUrlBtn.classList.add("hidden");
  if (copyRecapBtn) copyRecapBtn.classList.add("hidden");
  if (downloadReportBtn) downloadReportBtn.classList.add("hidden");

  closeSettingsModal();

  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, "", window.location.pathname);
  }

  showToast("All data and cached settings cleared.", "🧹");
}

// Methodology Modal Handlers
export function openLuckModal() {
  const modal = document.getElementById("luckMethodologyModal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }
}

export function closeLuckModal() {
  const modal = document.getElementById("luckMethodologyModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }
}

// Bind Global Window Functions for Compatibility
if (typeof window !== "undefined") {
  window.switchTab = switchTab;
  window.getCurrentlyActiveTab = getCurrentlyActiveTab;
  window.toggleRowExpand = toggleRowExpand;
  window.sortTable = sortTable;
  window.goToMainPage = goToMainPage;
  window.setMainPageSize = setMainPageSize;
  window.changeMainPage = changeMainPage;

  window.goToPlayerPage = goToPlayerPage;
  window.setPlayerPageSize = setPlayerPageSize;
  window.changePlayerPage = changePlayerPage;
  window.setPlayerPositionFilter = setPlayerPositionFilter;
  window.togglePlayerRowExpand = togglePlayerRowExpand;
  window.sortPlayers = sortPlayers;
  window.renderPlayerAnalytics = renderPlayerAnalytics;
  window.renderPlayerLeaderboard = renderPlayerLeaderboard;
  window.aggregatePlayers = aggregatePlayers;

  window.goToLuckPage = goToLuckPage;
  window.setLuckPageSize = setLuckPageSize;
  window.changeLuckPage = changeLuckPage;
  window.sortLuckTable = sortLuckTable;
  window.renderLuckAnalytics = renderLuckAnalytics;
  window.renderLuckTable = renderLuckTable;

  window.fetchLeaderboard = fetchLeaderboard;
  window.refreshDashboard = refreshDashboard;
  window.clearAllData = clearAllData;
  window.getPlayerInfo = getPlayerInfo;
  window.loadCachedData = loadCachedData;
  window.initPlayersDb = initPlayersDb;

  window.shareUrl = shareUrl;
  window.downloadReport = downloadReport;
  window.shareReport = shareReport;
  window.copyChatRecap = copyChatRecap;
  window.exportCsv = exportCsv;
  window.openLuckModal = openLuckModal;
  window.closeLuckModal = closeLuckModal;
  window.openSettingsModal = openSettingsModal;
  window.closeSettingsModal = closeSettingsModal;
  window.toggleSettingsDropdown = toggleSettingsDropdown;
  window.buildShareableUrl = buildShareableUrl;
  window.getUrlParams = getUrlParams;
}

/**
 * Initializes DOM listeners and UI events.
 */
export function setupEventListeners() {
  if (typeof document === "undefined") return;

  const tableSearch = document.getElementById("tableSearch");
  const scoreTierSelect = document.getElementById("scoreTierSelect");
  const playerSearchInput = document.getElementById("playerSearch");
  const playerStatusFilter = document.getElementById("playerStatusFilter");
  const luckSearchInput = document.getElementById("luckSearch");
  const luckCategorySelect = document.getElementById("luckCategoryFilter");

  const customLeaguesDropdownBtn = document.getElementById("customLeaguesDropdownBtn");
  const customLeaguesDropdownMenu = document.getElementById("customLeaguesDropdownMenu");
  const customLeaguesDropdownChevron = document.getElementById("customLeaguesDropdownChevron");
  const customLeaguesDropdownContainer = document.getElementById("customLeaguesDropdownContainer");

  const leagueDropdownBtn = document.getElementById("leagueDropdownBtn");
  const leagueDropdownMenu = document.getElementById("leagueDropdownMenu");
  const leagueDropdownChevron = document.getElementById("leagueDropdownChevron");
  const leagueDropdownContainer = document.getElementById("leagueDropdownContainer");

  const settingsModal = document.getElementById("settingsModal");
  const settingsDropdownContainer = document.getElementById("settingsDropdownContainer");
  const btnOpenSettingsModal = document.getElementById("btnOpenSettingsModal");
  const btnCloseSettingsModal = document.getElementById("btnCloseSettingsModal");
  const settingsBackdrop = document.getElementById("settingsBackdrop");

  const selectAllLeaguesBtn = document.getElementById("selectAllLeaguesBtn");
  const clearAllLeaguesBtn = document.getElementById("clearAllLeaguesBtn");
  const exportCsvBtn = document.getElementById("exportCsvBtn");
  const shareUrlBtn = document.getElementById("shareUrlBtn");
  const downloadReportBtn = document.getElementById("downloadReportBtn");
  const shareReportBtn = document.getElementById("shareReportBtn");
  const copyRecapBtn = document.getElementById("copyRecapBtn");
  const clearDataBtn = document.getElementById("clearDataBtn");
  const btnOpenLuckModal = document.getElementById("btnOpenLuckModal");
  const btnCloseLuckModal = document.getElementById("btnCloseLuckModal");
  const luckModal = document.getElementById("luckMethodologyModal");
  const prevWeekBtn = document.getElementById("prevWeekBtn");
  const nextWeekBtn = document.getElementById("nextWeekBtn");

  if (tableSearch) {
    tableSearch.addEventListener("input", e => {
      state.searchQuery = e.target.value;
      state.currentMainPage = 1;
      renderTable();
    });
  }

  if (scoreTierSelect) {
    scoreTierSelect.addEventListener("change", e => {
      state.currentTierFilter = e.target.value;
      state.currentMainPage = 1;
      renderTable();
    });
  }

  if (playerSearchInput) {
    playerSearchInput.addEventListener("input", e => {
      state.currentPlayerSearch = e.target.value;
      state.currentPlayerPage = 1;
      renderPlayerLeaderboard();
    });
  }

  if (playerStatusFilter) {
    playerStatusFilter.addEventListener("change", e => {
      state.currentPlayerStatusFilter = e.target.value;
      state.currentPlayerPage = 1;
      renderPlayerLeaderboard();
    });
  }

  if (luckSearchInput) {
    luckSearchInput.addEventListener("input", e => {
      state.currentLuckSearch = e.target.value;
      state.currentLuckPage = 1;
      renderLuckTable();
    });
  }

  if (luckCategorySelect) {
    luckCategorySelect.addEventListener("change", e => {
      state.currentLuckCategory = e.target.value;
      state.currentLuckPage = 1;
      renderLuckTable();
    });
  }

  if (customLeaguesDropdownBtn && customLeaguesDropdownMenu) {
    customLeaguesDropdownBtn.addEventListener("click", e => {
      e.stopPropagation();
      const isHidden = customLeaguesDropdownMenu.classList.contains("hidden");
      if (isHidden) {
        customLeaguesDropdownMenu.classList.remove("hidden");
        if (customLeaguesDropdownChevron) customLeaguesDropdownChevron.classList.add("rotate-180");
        customLeaguesDropdownBtn.setAttribute("aria-expanded", "true");
      } else {
        customLeaguesDropdownMenu.classList.add("hidden");
        if (customLeaguesDropdownChevron)
          customLeaguesDropdownChevron.classList.remove("rotate-180");
        customLeaguesDropdownBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (leagueDropdownBtn && leagueDropdownMenu) {
    leagueDropdownBtn.addEventListener("click", e => {
      e.stopPropagation();
      const isHidden = leagueDropdownMenu.classList.contains("hidden");
      if (isHidden) {
        leagueDropdownMenu.classList.remove("hidden");
        if (leagueDropdownChevron) leagueDropdownChevron.classList.add("rotate-180");
        leagueDropdownBtn.setAttribute("aria-expanded", "true");
      } else {
        leagueDropdownMenu.classList.add("hidden");
        if (leagueDropdownChevron) leagueDropdownChevron.classList.remove("rotate-180");
        leagueDropdownBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.addEventListener("click", e => {
    const trigger = e.target.closest(".card-info-trigger");
    if (trigger) {
      const wrapper = trigger.closest(".card-info-wrapper");
      const popover = wrapper ? wrapper.querySelector(".card-info-popover") : null;
      const wasOpen = popover && popover.classList.contains("is-open");

      document.querySelectorAll(".card-info-popover.is-open").forEach(p => {
        if (p !== popover) {
          p.classList.remove("is-open");
          const parentWrap = p.closest(".card-info-wrapper");
          const parentBtn = parentWrap ? parentWrap.querySelector(".card-info-trigger") : null;
          if (parentBtn) parentBtn.setAttribute("aria-expanded", "false");
        }
      });

      if (popover) {
        if (wasOpen) {
          popover.classList.remove("is-open");
          trigger.setAttribute("aria-expanded", "false");
        } else {
          popover.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        }
      }
      return;
    }

    if (!e.target.closest(".card-info-wrapper")) {
      document.querySelectorAll(".card-info-popover.is-open").forEach(p => {
        p.classList.remove("is-open");
        const parentWrap = p.closest(".card-info-wrapper");
        const parentBtn = parentWrap ? parentWrap.querySelector(".card-info-trigger") : null;
        if (parentBtn) parentBtn.setAttribute("aria-expanded", "false");
      });
    }

    if (customLeaguesDropdownMenu && !customLeaguesDropdownMenu.classList.contains("hidden")) {
      if (customLeaguesDropdownContainer && !customLeaguesDropdownContainer.contains(e.target)) {
        customLeaguesDropdownMenu.classList.add("hidden");
        if (customLeaguesDropdownChevron)
          customLeaguesDropdownChevron.classList.remove("rotate-180");
        if (customLeaguesDropdownBtn)
          customLeaguesDropdownBtn.setAttribute("aria-expanded", "false");
      }
    }
    if (leagueDropdownMenu && !leagueDropdownMenu.classList.contains("hidden")) {
      if (leagueDropdownContainer && !leagueDropdownContainer.contains(e.target)) {
        leagueDropdownMenu.classList.add("hidden");
        if (leagueDropdownChevron) leagueDropdownChevron.classList.remove("rotate-180");
        if (leagueDropdownBtn) leagueDropdownBtn.setAttribute("aria-expanded", "false");
      }
    }
    if (settingsModal && !settingsModal.classList.contains("hidden")) {
      if (settingsDropdownContainer && !settingsDropdownContainer.contains(e.target)) {
        closeSettingsModal();
      }
    }
  });

  if (luckModal) {
    luckModal.addEventListener("click", e => {
      if (e.target === luckModal) closeLuckModal();
    });
  }

  if (btnOpenLuckModal) btnOpenLuckModal.addEventListener("click", openLuckModal);
  if (btnCloseLuckModal) btnCloseLuckModal.addEventListener("click", closeLuckModal);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      document.querySelectorAll(".card-info-popover.is-open").forEach(p => {
        p.classList.remove("is-open");
        const parentWrap = p.closest(".card-info-wrapper");
        const parentBtn = parentWrap ? parentWrap.querySelector(".card-info-trigger") : null;
        if (parentBtn) parentBtn.setAttribute("aria-expanded", "false");
      });
      const modal = document.getElementById("luckMethodologyModal");
      if (modal && !modal.classList.contains("hidden")) {
        closeLuckModal();
      }
      if (customLeaguesDropdownMenu && !customLeaguesDropdownMenu.classList.contains("hidden")) {
        customLeaguesDropdownMenu.classList.add("hidden");
        if (customLeaguesDropdownChevron)
          customLeaguesDropdownChevron.classList.remove("rotate-180");
        if (customLeaguesDropdownBtn)
          customLeaguesDropdownBtn.setAttribute("aria-expanded", "false");
      }
      if (settingsModal && !settingsModal.classList.contains("hidden")) {
        closeSettingsModal();
      }
      if (leagueDropdownMenu && !leagueDropdownMenu.classList.contains("hidden")) {
        leagueDropdownMenu.classList.add("hidden");
        if (leagueDropdownChevron) leagueDropdownChevron.classList.remove("rotate-180");
        if (leagueDropdownBtn) leagueDropdownBtn.setAttribute("aria-expanded", "false");
      }
      return;
    }

    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
    if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
      return;
    }
    if (settingsModal && !settingsModal.classList.contains("hidden")) {
      return;
    }
    if (luckModal && !luckModal.classList.contains("hidden")) {
      return;
    }

    // Tab Switching Keyboard Shortcuts (1-6, [, ])
    if (e.key === "1") {
      e.preventDefault();
      switchTab("awards");
      return;
    } else if (e.key === "2") {
      e.preventDefault();
      switchTab("leaderboard");
      return;
    } else if (e.key === "3") {
      e.preventDefault();
      switchTab("visuals");
      return;
    } else if (e.key === "4") {
      e.preventDefault();
      switchTab("leagueGrid");
      return;
    } else if (e.key === "5") {
      e.preventDefault();
      switchTab("luck");
      return;
    } else if (e.key === "6") {
      e.preventDefault();
      switchTab("players");
      return;
    } else if (e.key === "[") {
      e.preventDefault();
      const currentTab = getCurrentlyActiveTab();
      const idx = TAB_ORDER.indexOf(currentTab);
      const prevIdx = (idx - 1 + TAB_ORDER.length) % TAB_ORDER.length;
      switchTab(TAB_ORDER[prevIdx]);
      return;
    } else if (e.key === "]") {
      e.preventDefault();
      const currentTab = getCurrentlyActiveTab();
      const idx = TAB_ORDER.indexOf(currentTab);
      const nextIdx = (idx + 1) % TAB_ORDER.length;
      switchTab(TAB_ORDER[nextIdx]);
      return;
    }

    // Keyboard Arrow Navigation for Matchup Weeks
    if (e.key === "ArrowLeft") {
      if (prevWeekBtn && !prevWeekBtn.disabled) {
        prevWeekBtn.click();
      }
    } else if (e.key === "ArrowRight") {
      if (nextWeekBtn && !nextWeekBtn.disabled) {
        nextWeekBtn.click();
      }
    }
  });

  if (selectAllLeaguesBtn) {
    selectAllLeaguesBtn.addEventListener("click", e => {
      e.stopPropagation();
      state.selectedLeagueIds = new Set(state.allLeaguesData.map(l => l.league_id));
      renderLeagueDropdown();
      refreshDashboard();
    });
  }

  if (clearAllLeaguesBtn) {
    clearAllLeaguesBtn.addEventListener("click", e => {
      e.stopPropagation();
      state.selectedLeagueIds.clear();
      renderLeagueDropdown();
      refreshDashboard();
    });
  }

  if (exportCsvBtn) exportCsvBtn.addEventListener("click", exportCsv);
  if (shareUrlBtn) shareUrlBtn.addEventListener("click", shareUrl);
  if (downloadReportBtn) downloadReportBtn.addEventListener("click", downloadReport);
  if (shareReportBtn && shareReportBtn !== downloadReportBtn) {
    shareReportBtn.addEventListener("click", downloadReport);
  }
  if (copyRecapBtn) copyRecapBtn.addEventListener("click", copyChatRecap);
  if (clearDataBtn) clearDataBtn.addEventListener("click", clearAllData);
  if (btnOpenSettingsModal) {
    btnOpenSettingsModal.addEventListener("click", toggleSettingsDropdown);
  }
  if (btnCloseSettingsModal) {
    btnCloseSettingsModal.addEventListener("click", closeSettingsModal);
  }
  if (settingsBackdrop) {
    settingsBackdrop.addEventListener("click", closeSettingsModal);
  }
}

/**
 * Main Application Startup Lifecycle
 */
export async function startApp() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  setupEventListeners();
  initPlayersDb();

  if (window.__EMBEDDED_REPORT__) {
    loadEmbeddedReport(window.__EMBEDDED_REPORT__, refreshDashboard);
    syncTabFromHash();
    if (getCurrentlyActiveTab() === "awards") {
      triggerConfetti();
    }
    return;
  }

  await initDefaults();
  updateModeUI();
  syncTabFromHash();

  const urlParams = getUrlParams();
  const hasQueryParams = Boolean(
    urlParams.platform ||
    urlParams.user ||
    urlParams.season ||
    urlParams.week ||
    urlParams.mode ||
    urlParams.leagues
  );

  if (hasQueryParams) {
    state.rawRecords = [];
    state.allLeaguesData = [];
    state.leaguesMap = {};
    state.selectedLeagueIds.clear();
  }

  const userIdInput = document.getElementById("userIdInput");
  const hasLoadedCache = tryLoadFromCache(refreshDashboard);
  if (
    !hasLoadedCache &&
    ((state.currentSyncType === "user" && userIdInput && userIdInput.value) ||
      (state.currentSyncType === "leagues" && state.customLeagueIds.size > 0) ||
      (state.pendingLeagueIdsFilter && state.pendingLeagueIdsFilter.size > 0))
  ) {
    fetchLeaderboard();
  }
  syncTabFromHash();
  if (state.rawRecords.length > 0 && getCurrentlyActiveTab() === "awards") {
    triggerConfetti();
  }
}

// Automatically bootstrap app in browser environments
if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp);
  } else {
    startApp();
  }
}
