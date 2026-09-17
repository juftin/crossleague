/**
 * CrossLeague • Multi-League Sleeper Analytics & Power Rankings
 * Features:
 *  - Single-Week & Season-Long Rollup Aggregation (#5)
 *  - Head-to-Head Matchup Outcomes, Bad Beat & Lucky Escape (#1)
 *  - Bench Points & Manager Lineup Efficiency (#2)
 *  - One-Click Chat Recap Formatter for Discord/Slack/GroupMe (#3)
 *  - Multi-League Dropdown Filter with instant reactive sync
 *  - Standalone Offline HTML Report Exporter
 *  - LocalStorage Caching Layer
 */

(function () {
  "use strict";

  const BASE_URL = "https://api.sleeper.app/v1";

  // App State
  let currentMode = "WEEKLY"; // "WEEKLY" | "SEASON_ROLLUP"
  let currentUserId = "";
  let currentUserName = "";
  let currentUserAvatar = "";
  let rawRecords = []; // Single-week records or Season aggregated records
  let leaguesMap = {};
  let allLeaguesData = [];
  let selectedLeagueIds = new Set();
  let pendingLeagueIdsFilter = null;
  let currentSyncType = "user";
  let customLeagueIds = new Set();
  let currentSortColumn = "Points";
  let currentSortAsc = false;
  let currentTierFilter = "ALL";
  let searchQuery = "";
  let expandedRowIds = new Set();

  let currentMainPage = 1;
  let currentMainPageSize = 25;

  let scoreDistChartInstance = null;
  let leagueAvgChartInstance = null;

  // DOM Elements
  const filterForm = document.getElementById("filterForm");
  const modeSelect = document.getElementById("modeSelect");
  const weekLabelText = document.getElementById("weekLabelText");
  const syncTypeUserBtn = document.getElementById("syncTypeUserBtn");
  const syncTypeLeaguesBtn = document.getElementById("syncTypeLeaguesBtn");
  const userSyncPanel = document.getElementById("userSyncPanel");
  const leaguesSyncPanel = document.getElementById("leaguesSyncPanel");
  const customLeagueIdInput = document.getElementById("customLeagueIdInput");
  const btnAddCustomLeagueId = document.getElementById("btnAddCustomLeagueId");
  const customLeaguesDropdownContainer = document.getElementById("customLeaguesDropdownContainer");
  const customLeaguesDropdownBtn = document.getElementById("customLeaguesDropdownBtn");
  const customLeaguesDropdownLabel = document.getElementById("customLeaguesDropdownLabel");
  const customLeaguesDropdownChevron = document.getElementById("customLeaguesDropdownChevron");
  const customLeaguesDropdownMenu = document.getElementById("customLeaguesDropdownMenu");
  const customLeagueIdsChips = document.getElementById("customLeagueIdsChips");
  const btnClearCustomLeagueIds = document.getElementById("btnClearCustomLeagueIds");
  const leagueIdsCountBadge = document.getElementById("leagueIdsCountBadge");
  const userIdInput = document.getElementById("userIdInput");
  const seasonInput = document.getElementById("seasonInput");
  const weekInput = document.getElementById("weekInput");
  const prevWeekBtn = document.getElementById("prevWeekBtn");
  const nextWeekBtn = document.getElementById("nextWeekBtn");
  const loadBtn = document.getElementById("loadBtn");
  const btnText = document.getElementById("btnText");
  const btnIcon = document.getElementById("btnIcon");
  const statusContainer = document.getElementById("statusContainer");
  const statusText = document.getElementById("statusText");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const errorBanner = document.getElementById("errorBanner");
  const errorMessage = document.getElementById("errorMessage");
  const skeletonLoader = document.getElementById("skeletonLoader");
  const reportContent = document.getElementById("reportContent");
  const initialState = document.getElementById("initialState");
  const tableBody = document.getElementById("tableBody");
  const tableSearch = document.getElementById("tableSearch");
  const scoreTierSelect = document.getElementById("scoreTierSelect");
  const rowCount = document.getElementById("rowCount");
  const exportCsvBtn = document.getElementById("exportCsvBtn");
  const copyRecapBtn = document.getElementById("copyRecapBtn");
  const copyRecapBtnText = document.getElementById("copyRecapBtnText");
  const shareUrlBtn = document.getElementById("shareUrlBtn");
  const shareUrlBtnText = document.getElementById("shareUrlBtnText");
  const downloadReportBtn =
    document.getElementById("downloadReportBtn") || document.getElementById("shareReportBtn");
  const downloadReportBtnText =
    document.getElementById("downloadReportBtnText") ||
    document.getElementById("shareReportBtnText");
  const shareReportBtn = downloadReportBtn;
  const shareReportBtnText = downloadReportBtnText;
  const noResultsFound = document.getElementById("noResultsFound");
  const podiumCards = document.getElementById("podiumCards");
  const snapshotIndicator = document.getElementById("snapshotIndicator");
  const selectAllLeaguesBtn = document.getElementById("selectAllLeaguesBtn");
  const clearAllLeaguesBtn = document.getElementById("clearAllLeaguesBtn");
  const leagueDropdownContainer = document.getElementById("leagueDropdownContainer");
  const leagueDropdownBtn = document.getElementById("leagueDropdownBtn");
  const leagueDropdownLabel = document.getElementById("leagueDropdownLabel");
  const leagueDropdownBadge = document.getElementById("leagueDropdownBadge");
  const leagueDropdownChevron = document.getElementById("leagueDropdownChevron");
  const leagueDropdownMenu = document.getElementById("leagueDropdownMenu");
  const leagueDropdownList = document.getElementById("leagueDropdownList");
  const syncControlCenter = document.getElementById("syncControlCenter");
  const liveSyncIndicator = document.getElementById("liveSyncIndicator");
  const snapshotSubtitle = document.getElementById("snapshotSubtitle");
  const toastContainer = document.getElementById("toastContainer");

  // Header Status & Navigation Bubbles
  const headerBottomRow = document.getElementById("headerBottomRow");
  const playerSeasonBadge = document.getElementById("playerSeasonBadge");
  const headerSeasonBadge = document.getElementById("headerSeasonBadge");
  const headerSeasonValue = document.getElementById("headerSeasonValue");
  const headerWeekBadge = document.getElementById("headerWeekBadge");
  const headerWeekValue = document.getElementById("headerWeekValue");

  // Settings Dropdown & Modal Elements
  const btnOpenSettingsModal = document.getElementById("btnOpenSettingsModal");
  const settingsModal = document.getElementById("settingsModal");
  const settingsBackdrop = document.getElementById("settingsBackdrop");
  const btnCloseSettingsModal = document.getElementById("btnCloseSettingsModal");
  const btnCancelSettingsModal = document.getElementById("btnCancelSettingsModal");
  const settingsBtnUserBadge = document.getElementById("settingsBtnUserBadge");
  const settingsDropdownContainer = document.getElementById("settingsDropdownContainer");
  const settingsDropdownChevron = document.getElementById("settingsDropdownChevron");

  // Week Navigator Elements
  const weekDisplayValue = document.getElementById("weekDisplayValue");
  const weekStatusBadge = document.getElementById("weekStatusBadge");

  // Superlative DOM Cards
  const badBeatCard = document.getElementById("badBeatCard");
  const luckyEscapeCard = document.getElementById("luckyEscapeCard");
  const benchMvpCard = document.getElementById("benchMvpCard");

  // Player Analytics State & DOM
  let currentPlayerPositionFilter = "ALL";
  let currentPlayerSearch = "";
  let currentPlayerStatusFilter = "ALL";
  let currentPlayerSortColumn = "points";
  let currentPlayerSortAsc = false;
  let expandedPlayerIds = new Set();
  let lastAggregatedPlayers = [];
  let currentPlayerPage = 1;
  let currentPlayerPageSize = 25;
  let sleeperPlayersDb = null;
  let isFetchingPlayersDb = false;

  const positionalMvpDeck = document.getElementById("positionalMvpDeck");
  const playerWeekBadge = document.getElementById("playerWeekBadge");
  const playerTableBody = document.getElementById("playerTableBody");
  const playerRowCount = document.getElementById("playerRowCount");
  const noPlayersFound = document.getElementById("noPlayersFound");
  const playerSearchInput = document.getElementById("playerSearchInput");
  const playerStatusFilter = document.getElementById("playerStatusFilter");
  // NFL State & Played Weeks Tracking
  let nflState = {
    season: new Date().getFullYear(),
    week: 1,
    display_week: 1,
    season_type: "regular"
  };

  // Helper: Toast Notifications
  function showToast(message, icon = "✨") {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className =
      "toast-enter glass-card bg-slate-900/95 border border-emerald-500/40 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur pointer-events-auto";
    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("toast-visible");
      toast.classList.remove("toast-enter");
    });

    setTimeout(() => {
      toast.classList.add("toast-exit");
      toast.classList.remove("toast-visible");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Cache Utilities
  function getCacheKey(user, season, mode, week) {
    const u = (user || "").toLowerCase().trim();
    return `crossleague_cache_${u}_${season}_${mode}_${week}`;
  }

  function isWeekFinished(season, week, state = nflState) {
    const s = parseInt(season, 10);
    const w = parseInt(week, 10);
    if (!state || !state.season) return false;
    if (s < state.season) return true;
    if (s === state.season) {
      if (state.season_type === "post") return true;
      const currentNflWeek = state.week || 1;
      return w < currentNflWeek;
    }
    return false;
  }

  function saveDataToCache(
    userId,
    userName,
    userAvatar,
    season,
    mode,
    week,
    records,
    leagues,
    allLeagues
  ) {
    try {
      const payload = {
        version: "2.0",
        cachedAt: new Date().toISOString(),
        isFinished: isWeekFinished(season, week),
        mode: mode,
        user: {
          id: userId,
          name: userName,
          avatar: userAvatar
        },
        season: season,
        week: week,
        records: records,
        leaguesMap: leagues,
        allLeaguesData: allLeagues,
        selectedLeagueIds: Array.from(selectedLeagueIds)
      };
      const serialized = JSON.stringify(payload);
      const keys = new Set();
      const queryUser = userIdInput ? userIdInput.value.trim() : "";
      if (queryUser) keys.add(getCacheKey(queryUser, season, mode, week));
      if (userName) keys.add(getCacheKey(userName, season, mode, week));
      if (userId) keys.add(getCacheKey(userId, season, mode, week));
      keys.forEach(k => {
        localStorage.setItem(k, serialized);
      });
    } catch (e) {
      console.warn("Could not save to localStorage cache:", e);
    }
  }

  function loadCachedData(data) {
    if (!data || !data.records || data.records.length === 0) return false;

    currentMode = data.mode || "WEEKLY";
    if (modeSelect) modeSelect.value = currentMode;
    updateModeUI();

    currentUserId = data.user ? data.user.id : "";
    currentUserName = data.user ? data.user.name : "";
    currentUserAvatar = data.user ? data.user.avatar : "";

    if (userIdInput) {
      const saved = localStorage.getItem("sleeper_user_id");
      if (saved) {
        userIdInput.value = saved;
      } else if (currentUserName) {
        userIdInput.value = currentUserName || currentUserId;
      }
    }
    if (seasonInput && data.season) {
      seasonInput.value = String(data.season);
    }
    if (weekInput && data.week) {
      weekInput.value = String(data.week);
      updateWeekNavigatorUI();
    }
    updateSettingsButtonBadge();

    rawRecords = (data.records || []).map(r => ({
      ...r,
      efficiency: typeof r.efficiency === "number" && !isNaN(r.efficiency) ? r.efficiency : 100,
      benchPoints: typeof r.benchPoints === "number" && !isNaN(r.benchPoints) ? r.benchPoints : 0,
      outcome: r.outcome || "unpaired",
      winPct: typeof r.winPct === "number" && !isNaN(r.winPct) ? r.winPct : 0,
      startersList: Array.isArray(r.startersList) ? r.startersList : [],
      allPlayersList: Array.isArray(r.allPlayersList) ? r.allPlayersList : [],
      playersPointsMap: r.playersPointsMap || {},
      startersPoints: Array.isArray(r.startersPoints) ? r.startersPoints : [],
      weeklyPlayerRecords: Array.isArray(r.weeklyPlayerRecords) ? r.weeklyPlayerRecords : []
    }));

    leaguesMap = data.leaguesMap || {};
    allLeaguesData =
      data.allLeaguesData && data.allLeaguesData.length > 0
        ? data.allLeaguesData
        : Array.from(new Set(rawRecords.map(r => r.leagueId))).map(lid => {
            const sample = rawRecords.find(r => r.leagueId === lid);
            return {
              league_id: lid,
              name:
                (leaguesMap[lid] && leaguesMap[lid].name) ||
                (sample && sample.league) ||
                `League ${lid}`,
              avatar:
                (leaguesMap[lid] && leaguesMap[lid].avatar) ||
                (sample && sample.leagueAvatar) ||
                null
            };
          });

    if (pendingLeagueIdsFilter && pendingLeagueIdsFilter.size > 0) {
      selectedLeagueIds = new Set(
        allLeaguesData.map(l => l.league_id).filter(id => pendingLeagueIdsFilter.has(id))
      );
      if (selectedLeagueIds.size === 0) {
        selectedLeagueIds = new Set(allLeaguesData.map(l => l.league_id));
      }
      pendingLeagueIdsFilter = null;
    } else {
      selectedLeagueIds = new Set(
        data.selectedLeagueIds && data.selectedLeagueIds.length > 0
          ? data.selectedLeagueIds
          : allLeaguesData.map(l => l.league_id)
      );
    }

    setLoading(false);
    if (initialState) initialState.classList.add("hidden");
    if (skeletonLoader) skeletonLoader.classList.add("hidden");
    if (reportContent) reportContent.classList.remove("hidden");
    if (copyRecapBtn) copyRecapBtn.classList.remove("hidden");
    if (shareUrlBtn) shareUrlBtn.classList.remove("hidden");
    if (downloadReportBtn) downloadReportBtn.classList.remove("hidden");
    if (exportCsvBtn) exportCsvBtn.classList.remove("hidden");

    initPlayersDb();
    renderLeagueDropdown();
    refreshDashboard();

    return true;
  }

  function tryLoadFromCache(overrideWeek = null) {
    try {
      const user = userIdInput ? userIdInput.value.trim() : "";
      const season = seasonInput ? seasonInput.value : "";
      const mode = modeSelect ? modeSelect.value : "WEEKLY";
      const week =
        overrideWeek !== null
          ? parseInt(overrideWeek, 10)
          : weekInput
            ? parseInt(weekInput.value, 10)
            : 1;

      if (!user) return false;
      const key = getCacheKey(user, season, mode, week);
      const raw = localStorage.getItem(key);

      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.version === "2.0" && data.records && data.records.length > 0) {
          return loadCachedData(data);
        }
      }
    } catch (e) {
      console.warn("Could not load from localStorage cache:", e);
    }
    return false;
  }

  function populateSeasonOptions(defaultYear) {
    if (!seasonInput) return;
    const maxYear = Math.max(defaultYear + 1, 2026);
    const minYear = 2020;
    const currentVal = seasonInput.value;
    seasonInput.innerHTML = "";
    for (let y = maxYear; y >= minYear; y--) {
      const opt = document.createElement("option");
      opt.value = String(y);
      opt.textContent = String(y);
      seasonInput.appendChild(opt);
    }
    if (currentVal && Array.from(seasonInput.options).some(o => o.value === currentVal)) {
      seasonInput.value = currentVal;
    } else {
      seasonInput.value = String(defaultYear);
    }
  }

  function openSettingsModal() {
    if (settingsModal) {
      settingsModal.classList.remove("hidden");
      if (settingsBackdrop) settingsBackdrop.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");
      if (settingsDropdownChevron) settingsDropdownChevron.classList.add("rotate-180");
      if (btnOpenSettingsModal) btnOpenSettingsModal.setAttribute("aria-expanded", "true");
      if (userIdInput && window.innerWidth >= 640) {
        setTimeout(() => userIdInput.focus(), 50);
      }
    }
  }

  function closeSettingsModal() {
    if (settingsModal) {
      settingsModal.classList.add("hidden");
      if (settingsBackdrop) settingsBackdrop.classList.add("hidden");
      if (leagueDropdownMenu) leagueDropdownMenu.classList.add("hidden");
      if (leagueDropdownChevron) leagueDropdownChevron.classList.remove("rotate-180");
      if (leagueDropdownBtn) leagueDropdownBtn.setAttribute("aria-expanded", "false");
      const luckModal = document.getElementById("luckMethodologyModal");
      if (!luckModal || luckModal.classList.contains("hidden")) {
        document.body.classList.remove("overflow-hidden");
      }
      if (settingsDropdownChevron) settingsDropdownChevron.classList.remove("rotate-180");
      if (btnOpenSettingsModal) btnOpenSettingsModal.setAttribute("aria-expanded", "false");
    }
  }

  function toggleSettingsDropdown(e) {
    if (e) e.stopPropagation();
    if (settingsModal && !settingsModal.classList.contains("hidden")) {
      closeSettingsModal();
    } else {
      if (leagueDropdownMenu && !leagueDropdownMenu.classList.contains("hidden")) {
        leagueDropdownMenu.classList.add("hidden");
        if (leagueDropdownChevron) leagueDropdownChevron.classList.remove("rotate-180");
        if (leagueDropdownBtn) leagueDropdownBtn.setAttribute("aria-expanded", "false");
      }
      openSettingsModal();
    }
  }

  function updateSettingsButtonBadge() {
    let u = "";
    if (currentSyncType === "leagues") {
      const count = customLeagueIds.size || (allLeaguesData ? allLeaguesData.length : 0);
      if (count > 0) {
        u = `${count} ${count === 1 ? "League" : "Leagues"}`;
      }
    } else {
      u = (userIdInput ? userIdInput.value.trim() : "") || currentUserName;
    }

    if (settingsBtnUserBadge) {
      if (currentSyncType === "leagues" && u) {
        settingsBtnUserBadge.textContent = `🏆 ${u}`;
        settingsBtnUserBadge.classList.remove("text-slate-400", "border-slate-700/60");
        settingsBtnUserBadge.classList.add("text-emerald-400", "border-emerald-500/30");
      } else if (u) {
        settingsBtnUserBadge.textContent = `@${u}`;
        settingsBtnUserBadge.classList.remove("text-slate-400", "border-slate-700/60");
        settingsBtnUserBadge.classList.add("text-emerald-400", "border-emerald-500/30");
      } else {
        settingsBtnUserBadge.textContent = "No sync source";
        settingsBtnUserBadge.classList.remove("text-emerald-400", "border-emerald-500/30");
        settingsBtnUserBadge.classList.add("text-slate-400", "border-slate-700/60");
      }
    }
    if (btnOpenSettingsModal) {
      if (currentSyncType === "leagues" && u) {
        btnOpenSettingsModal.title = `Settings (${u})`;
      } else {
        btnOpenSettingsModal.title = u ? `Settings (@${u})` : "User & League Settings";
      }
    }
    if (headerSeasonValue && seasonInput) {
      headerSeasonValue.textContent = seasonInput.value;
    }
  }

  function getMaxPlayedWeek() {
    const selectedSeason =
      parseInt(seasonInput ? seasonInput.value : nflState.season, 10) || nflState.season;
    const currentNflSeason = nflState.season;

    if (selectedSeason < currentNflSeason) {
      // Past NFL seasons have all regular season weeks (1-18) played
      return 18;
    } else if (selectedSeason > currentNflSeason) {
      // Future season - no weeks played yet
      return 1;
    } else {
      // Current season
      if (nflState.season_type === "post") {
        return 18;
      } else if (nflState.season_type === "pre") {
        return 1;
      } else {
        // Regular season - played weeks up to current display_week / week
        const currentWeek = Math.max(1, Math.min(18, nflState.display_week || nflState.week || 1));
        return currentWeek;
      }
    }
  }

  function updateWeekNavigatorUI() {
    if (!weekInput) return;
    const maxPlayed = getMaxPlayedWeek();
    let currentWeek = parseInt(weekInput.value, 10) || 1;

    // Clamp current week to valid range [1, maxPlayed]
    if (currentWeek > maxPlayed) {
      currentWeek = maxPlayed;
      weekInput.value = String(currentWeek);
      savePreferences();
    } else if (currentWeek < 1) {
      currentWeek = 1;
      weekInput.value = String(currentWeek);
      savePreferences();
    }

    // Update display text
    const weekLabel =
      currentMode === "SEASON_ROLLUP"
        ? currentWeek === 1
          ? "Week 1 Rollup"
          : `Weeks 1–${currentWeek}`
        : `Week ${currentWeek}`;

    if (weekDisplayValue) {
      weekDisplayValue.textContent = weekLabel;
    }
    if (headerWeekValue) {
      headerWeekValue.textContent = weekLabel;
    }
    if (headerSeasonValue && seasonInput) {
      headerSeasonValue.textContent = seasonInput.value;
    }
    if (playerSeasonBadge && seasonInput) {
      playerSeasonBadge.textContent = seasonInput.value;
    }

    // Update status badge
    if (weekStatusBadge) {
      const selectedSeason =
        parseInt(seasonInput ? seasonInput.value : nflState.season, 10) || nflState.season;
      if (selectedSeason < nflState.season) {
        weekStatusBadge.textContent = "Final";
        weekStatusBadge.className =
          "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-400";
      } else if (currentWeek < maxPlayed) {
        weekStatusBadge.textContent = "Played";
        weekStatusBadge.className =
          "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-400";
      } else if (currentWeek === maxPlayed && nflState.season_type === "regular") {
        weekStatusBadge.textContent = "Current";
        weekStatusBadge.className =
          "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 animate-pulse";
      } else {
        weekStatusBadge.textContent = "Week 1";
        weekStatusBadge.className =
          "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-400";
      }
    }

    // Update prev/next button states
    if (prevWeekBtn) {
      const canGoPrev = currentWeek > 1;
      prevWeekBtn.disabled = !canGoPrev;
      if (canGoPrev) {
        prevWeekBtn.classList.remove("opacity-40", "cursor-not-allowed");
        prevWeekBtn.classList.add("hover:bg-slate-800", "cursor-pointer");
        prevWeekBtn.title = `Previous Week (Week ${currentWeek - 1}) • Press ←`;
      } else {
        prevWeekBtn.classList.add("opacity-40", "cursor-not-allowed");
        prevWeekBtn.classList.remove("hover:bg-slate-800", "cursor-pointer");
        prevWeekBtn.title = "At first week (Week 1)";
      }
    }

    if (nextWeekBtn) {
      const canGoNext = currentWeek < maxPlayed;
      nextWeekBtn.disabled = !canGoNext;
      if (canGoNext) {
        nextWeekBtn.classList.remove("opacity-40", "cursor-not-allowed");
        nextWeekBtn.classList.add("hover:bg-slate-800", "cursor-pointer");
        nextWeekBtn.title = `Next Week (Week ${currentWeek + 1}) • Press →`;
      } else {
        nextWeekBtn.classList.add("opacity-40", "cursor-not-allowed");
        nextWeekBtn.classList.remove("hover:bg-slate-800", "cursor-pointer");
        if (currentWeek >= 18) {
          nextWeekBtn.title = "At end of regular season (Week 18)";
        } else {
          nextWeekBtn.title = `Week ${currentWeek + 1} has not been played yet`;
        }
      }
    }
  }

  function addCustomLeagueIds(str) {
    if (!str) return;
    const parts = str
      .split(/[\s,;\n\t]+/)
      .map(s => s.trim().replace(/^#/, ""))
      .filter(s => s.length > 0 && /^\d+$/.test(s));

    if (parts.length === 0 && str.trim()) {
      showToast("League IDs should be numeric.", "⚠️");
      return;
    }

    parts.forEach(id => customLeagueIds.add(id));
    renderCustomLeagueIdChips();
    savePreferences();
    updateSettingsButtonBadge();

    // Auto-open dropdown on adding IDs so user sees the added items
    if (customLeaguesDropdownMenu && customLeaguesDropdownMenu.classList.contains("hidden")) {
      customLeaguesDropdownMenu.classList.remove("hidden");
      if (customLeaguesDropdownChevron) customLeaguesDropdownChevron.classList.add("rotate-180");
      if (customLeaguesDropdownBtn) customLeaguesDropdownBtn.setAttribute("aria-expanded", "true");
    }
  }

  function removeCustomLeagueId(id) {
    customLeagueIds.delete(id);
    renderCustomLeagueIdChips();
    savePreferences();
    updateSettingsButtonBadge();
  }

  function clearCustomLeagueIds() {
    customLeagueIds.clear();
    renderCustomLeagueIdChips();
    savePreferences();
    updateSettingsButtonBadge();
  }

  function renderCustomLeagueIdChips() {
    if (!customLeagueIdsChips) return;
    customLeagueIdsChips.innerHTML = "";

    if (customLeagueIds.size === 0) {
      const placeholder = document.createElement("div");
      placeholder.id = "noLeagueIdsPlaceholder";
      placeholder.className = "text-[11px] text-slate-500 italic p-1";
      placeholder.textContent = "No League IDs added yet. Paste or enter IDs above.";
      customLeagueIdsChips.appendChild(placeholder);
    } else {
      customLeagueIds.forEach(id => {
        const chip = document.createElement("div");
        chip.className =
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-mono group";
        chip.innerHTML = `
          <span class="text-[10px] text-emerald-400 font-bold">#</span>
          <span>${escapeHtml(id)}</span>
          <button
            type="button"
            class="text-slate-400 hover:text-rose-400 transition cursor-pointer ml-0.5 p-0.5"
            title="Remove League ID"
            aria-label="Remove League ${escapeHtml(id)}"
          >
            ✕
          </button>
        `;
        const rmBtn = chip.querySelector("button");
        rmBtn.addEventListener("click", e => {
          e.stopPropagation();
          removeCustomLeagueId(id);
        });
        customLeagueIdsChips.appendChild(chip);
      });
    }

    if (leagueIdsCountBadge) {
      leagueIdsCountBadge.textContent = `${customLeagueIds.size} ${customLeagueIds.size === 1 ? "ID" : "IDs"}`;
    }
    if (customLeaguesDropdownLabel) {
      if (customLeagueIds.size === 0) {
        customLeaguesDropdownLabel.textContent = "View Added IDs";
      } else if (customLeagueIds.size === 1) {
        customLeaguesDropdownLabel.textContent = "1 League ID Added";
      } else {
        customLeaguesDropdownLabel.textContent = `${customLeagueIds.size} League IDs Added`;
      }
    }
  }

  function setSyncType(type) {
    currentSyncType = type;
    if (type === "leagues") {
      if (syncTypeUserBtn) {
        syncTypeUserBtn.className =
          "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5";
      }
      if (syncTypeLeaguesBtn) {
        syncTypeLeaguesBtn.className =
          "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-200 bg-slate-800 shadow-sm flex items-center justify-center gap-1.5";
      }
      if (userSyncPanel) userSyncPanel.classList.add("hidden");
      if (leaguesSyncPanel) leaguesSyncPanel.classList.remove("hidden");
    } else {
      if (syncTypeUserBtn) {
        syncTypeUserBtn.className =
          "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-200 bg-slate-800 shadow-sm flex items-center justify-center gap-1.5";
      }
      if (syncTypeLeaguesBtn) {
        syncTypeLeaguesBtn.className =
          "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5";
      }
      if (userSyncPanel) userSyncPanel.classList.remove("hidden");
      if (leaguesSyncPanel) leaguesSyncPanel.classList.add("hidden");
    }
    updateSettingsButtonBadge();
    savePreferences();
  }

  function loadSavedPreferences() {
    const savedSyncType = localStorage.getItem("sleeper_sync_type");
    if (savedSyncType === "leagues" || savedSyncType === "user") {
      currentSyncType = savedSyncType;
    }
    const savedCustomLeagues = localStorage.getItem("sleeper_custom_league_ids");
    if (savedCustomLeagues) {
      try {
        const parsed = JSON.parse(savedCustomLeagues);
        if (Array.isArray(parsed)) {
          customLeagueIds = new Set(parsed.filter(Boolean));
        }
      } catch (e) {
        console.warn("Could not parse saved custom league IDs:", e);
      }
    }
    const savedUser =
      localStorage.getItem("sleeper_username") || localStorage.getItem("sleeper_user_id");
    if (savedUser && userIdInput) userIdInput.value = savedUser;
    const savedSeason = localStorage.getItem("sleeper_season");
    if (savedSeason && seasonInput) seasonInput.value = savedSeason;
    const savedWeek = localStorage.getItem("sleeper_week");
    if (savedWeek && weekInput) weekInput.value = savedWeek;
    const savedMode = localStorage.getItem("sleeper_mode");
    if (savedMode && modeSelect) {
      modeSelect.value = savedMode;
      currentMode = savedMode;
      updateModeUI();
    }
    setSyncType(currentSyncType);
    renderCustomLeagueIdChips();
    updateSettingsButtonBadge();
    updateWeekNavigatorUI();
  }

  function savePreferences() {
    localStorage.setItem("sleeper_sync_type", currentSyncType);
    if (userIdInput) {
      const username = userIdInput.value.trim();
      localStorage.setItem("sleeper_username", username);
      localStorage.setItem("sleeper_user_id", username);
    }
    if (seasonInput) localStorage.setItem("sleeper_season", seasonInput.value);
    if (weekInput) localStorage.setItem("sleeper_week", weekInput.value);
    if (modeSelect) localStorage.setItem("sleeper_mode", modeSelect.value);
    localStorage.setItem("sleeper_custom_league_ids", JSON.stringify(Array.from(customLeagueIds)));
    updateSettingsButtonBadge();
  }

  function updateModeUI() {
    if (!modeSelect) return;
    currentMode = modeSelect.value;
    if (currentMode === "SEASON_ROLLUP") {
      if (headerBottomRow) headerBottomRow.classList.add("hidden");
      if (weekLabelText) weekLabelText.textContent = "Through Week";
      if (scoreTierSelect) {
        scoreTierSelect.innerHTML = `
          <option value="ALL">All Averages</option>
          <option value="BOOM">🔥 Elite PPG (130+)</option>
          <option value="SOLID">⚡ Solid PPG (105 - 130)</option>
          <option value="COLD">🧊 Sub-105 PPG</option>
        `;
      }
    } else {
      if (headerBottomRow) headerBottomRow.classList.remove("hidden");
      if (weekLabelText) weekLabelText.textContent = "Matchup Week";
      if (scoreTierSelect) {
        scoreTierSelect.innerHTML = `
          <option value="ALL">All Scores</option>
          <option value="BOOM">🔥 Nuclear (140+ pts)</option>
          <option value="SOLID">⚡ Solid (100 - 140)</option>
          <option value="COLD">🧊 Ice Cold (&lt; 100)</option>
        `;
      }
    }
    updateSettingsButtonBadge();
    updateWeekNavigatorUI();
  }

  if (btnOpenSettingsModal) {
    btnOpenSettingsModal.addEventListener("click", toggleSettingsDropdown);
  }
  if (btnCloseSettingsModal) {
    btnCloseSettingsModal.addEventListener("click", e => {
      e.stopPropagation();
      closeSettingsModal();
    });
  }
  if (btnCancelSettingsModal) {
    btnCancelSettingsModal.addEventListener("click", e => {
      e.stopPropagation();
      closeSettingsModal();
    });
  }
  if (settingsBackdrop) {
    settingsBackdrop.addEventListener("click", e => {
      e.stopPropagation();
      closeSettingsModal();
    });
  }
  if (settingsModal) {
    settingsModal.addEventListener("click", e => {
      e.stopPropagation();
    });
  }

  if (userIdInput) {
    userIdInput.addEventListener("input", () => {
      savePreferences();
      updateSettingsButtonBadge();
    });
    userIdInput.addEventListener("change", () => {
      savePreferences();
      updateSettingsButtonBadge();
    });
  }

  // Some browsers restore or autofill fields without firing input/change events.
  // Capture the visible values immediately before a refresh or navigation.
  window.addEventListener("pagehide", savePreferences);

  if (modeSelect) {
    modeSelect.addEventListener("change", () => {
      updateModeUI();
      savePreferences();
      updateSettingsButtonBadge();
      updateWeekNavigatorUI();
      if (!tryLoadFromCache()) {
        fetchLeaderboard();
      }
    });
  }

  if (prevWeekBtn) {
    prevWeekBtn.addEventListener("click", () => {
      let current = parseInt(weekInput.value, 10) || 1;
      if (current > 1) {
        const targetWeek = current - 1;
        weekInput.value = String(targetWeek);
        savePreferences();
        updateWeekNavigatorUI();
        if (!tryLoadFromCache(targetWeek)) {
          fetchLeaderboard();
        }
      }
    });
  }

  if (nextWeekBtn) {
    nextWeekBtn.addEventListener("click", () => {
      let current = parseInt(weekInput.value, 10) || 1;
      const maxPlayed = getMaxPlayedWeek();
      if (current < maxPlayed) {
        const targetWeek = current + 1;
        weekInput.value = String(targetWeek);
        savePreferences();
        updateWeekNavigatorUI();
        if (!tryLoadFromCache(targetWeek)) {
          fetchLeaderboard();
        }
      }
    });
  }

  if (seasonInput) {
    seasonInput.addEventListener("change", () => {
      savePreferences();
      updateSettingsButtonBadge();
      updateWeekNavigatorUI();
      if (!tryLoadFromCache()) {
        fetchLeaderboard();
      }
    });
  }

  function getUrlParams() {
    if (typeof window === "undefined" || !window.location || !window.location.search) {
      return {};
    }
    const params = new URLSearchParams(window.location.search);
    const user =
      params.get("user") || params.get("u") || params.get("username") || params.get("userId");
    const season = params.get("season") || params.get("year");
    const week = params.get("week") || params.get("w");
    const mode = params.get("mode") || params.get("m");
    const leagues = params.get("leagues") || params.get("league_ids");
    return { user, season, week, mode, leagues };
  }

  async function initDefaults() {
    const currentYear = new Date().getFullYear();
    populateSeasonOptions(currentYear);
    loadSavedPreferences();

    const urlParams = getUrlParams();

    if (urlParams.season && seasonInput) {
      seasonInput.value = String(urlParams.season);
    } else if (!localStorage.getItem("sleeper_season") && seasonInput) {
      seasonInput.value = String(currentYear);
    }

    if (urlParams.week && weekInput) {
      weekInput.value = String(urlParams.week);
    }

    if (urlParams.mode && modeSelect) {
      const normalizedMode =
        urlParams.mode.toUpperCase() === "SEASON_ROLLUP" ? "SEASON_ROLLUP" : "WEEKLY";
      modeSelect.value = normalizedMode;
      currentMode = normalizedMode;
      updateModeUI();
    }

    if (urlParams.user && userIdInput) {
      userIdInput.value = urlParams.user.trim();
      currentUserName = urlParams.user.trim();
      currentSyncType = "user";
    }

    if (urlParams.leagues) {
      const ids = urlParams.leagues
        .split(",")
        .map(id => id.trim())
        .filter(Boolean);
      pendingLeagueIdsFilter = new Set(ids);
      ids.forEach(id => customLeagueIds.add(id));
      if (!urlParams.user) {
        currentSyncType = "leagues";
      }
    }

    setSyncType(currentSyncType);
    renderCustomLeagueIdChips();

    try {
      const resp = await fetch(`${BASE_URL}/state/nfl`);
      if (resp.ok) {
        const state = await resp.json();
        nflState = {
          season: parseInt(state.season, 10) || currentYear,
          week: parseInt(state.week, 10) || 1,
          display_week: parseInt(state.display_week, 10) || parseInt(state.week, 10) || 1,
          season_type: state.season_type || "regular"
        };
        if (
          !urlParams.season &&
          !localStorage.getItem("sleeper_season") &&
          state.season &&
          seasonInput
        ) {
          seasonInput.value = String(state.season);
        }
        if (!urlParams.week && !localStorage.getItem("sleeper_week") && weekInput) {
          const defaultWeek = nflState.display_week || nflState.week || 1;
          if (defaultWeek >= 1 && defaultWeek <= 18) {
            weekInput.value = String(defaultWeek);
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch NFL state for defaults:", err);
    }

    const hasSharedLeagues = Boolean(
      (pendingLeagueIdsFilter && pendingLeagueIdsFilter.size > 0) ||
      (currentSyncType === "leagues" && customLeagueIds.size > 0)
    );
    const hasSavedUser =
      Boolean(urlParams.user) ||
      Boolean(localStorage.getItem("sleeper_user_id")) ||
      Boolean(userIdInput && userIdInput.value.trim()) ||
      hasSharedLeagues;
    if (!hasSavedUser) {
      openSettingsModal();
    } else {
      closeSettingsModal();
    }
    updateSettingsButtonBadge();
    updateWeekNavigatorUI();
    renderLeagueDropdown();
  }

  async function apiFetch(endpoint) {
    const resp = await fetch(`${BASE_URL}${endpoint}`);
    if (!resp.ok) {
      throw new Error(`API error (${resp.status}): ${endpoint}`);
    }
    return await resp.json();
  }

  async function resolveUser(inputVal) {
    const cleaned = inputVal.trim();
    if (/^\d+$/.test(cleaned)) {
      try {
        const userData = await apiFetch(`/user/${cleaned}`);
        if (userData && userData.user_id) {
          currentUserName = userData.display_name || userData.username || cleaned;
          currentUserAvatar = userData.avatar || "";
          updateSettingsButtonBadge();
          return userData.user_id;
        }
      } catch {
        // Fallback to numeric user ID
      }
      currentUserName = cleaned;
      updateSettingsButtonBadge();
      return cleaned;
    }

    const userData = await apiFetch(`/user/${cleaned}`);
    if (userData && userData.user_id) {
      currentUserName = userData.display_name || userData.username || cleaned;
      currentUserAvatar = userData.avatar || "";
      updateSettingsButtonBadge();
      return userData.user_id;
    }
    throw new Error(`User "${cleaned}" not found on Sleeper.`);
  }

  function setLoading(isLoading, text = "Loading data from Sleeper API...") {
    if (isLoading) {
      if (loadBtn) {
        loadBtn.disabled = true;
        loadBtn.classList.add("opacity-75", "cursor-not-allowed");
      }
      if (btnText) btnText.textContent = "Loading...";
      if (btnIcon) btnIcon.classList.add("animate-spin");
      if (prevWeekBtn) prevWeekBtn.disabled = true;
      if (nextWeekBtn) nextWeekBtn.disabled = true;
      if (statusContainer) statusContainer.classList.remove("hidden");
      if (errorBanner) errorBanner.classList.add("hidden");
      if (skeletonLoader) skeletonLoader.classList.remove("hidden");
      if (reportContent) reportContent.classList.add("hidden");
      if (initialState) initialState.classList.add("hidden");
      if (statusText) {
        statusText.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> ${text}`;
      }
      if (progressBar) progressBar.style.width = "5%";
      if (progressText) progressText.textContent = "5%";
    } else {
      if (loadBtn) {
        loadBtn.disabled = false;
        loadBtn.classList.remove("opacity-75", "cursor-not-allowed");
      }
      if (btnText) btnText.textContent = "Load";
      if (btnIcon) btnIcon.classList.remove("animate-spin");
      updateWeekNavigatorUI();
      if (statusContainer) statusContainer.classList.add("hidden");
      if (skeletonLoader) skeletonLoader.classList.add("hidden");
    }
  }

  function updateProgress(percent, msg) {
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${Math.round(percent)}%`;
    if (msg)
      statusText.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> ${msg}`;
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.classList.remove("hidden");
    setLoading(false);
    initialState.classList.remove("hidden");
  }

  function getAvatarUrl(avatarId) {
    if (!avatarId) return null;
    return `https://sleepercdn.com/avatars/thumbs/${avatarId}`;
  }

  /**
   * Helper: Calculate Standard Deviation
   */
  function calculateStdDev(scores) {
    if (!scores || scores.length <= 1) return 0;
    const n = scores.length;
    const mean = scores.reduce((a, b) => a + b, 0) / n;
    const variance = scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    return Math.round(Math.sqrt(variance) * 100) / 100;
  }

  /**
   * Player Metadata Fetching & Caching Layer (Dynamic from Sleeper API)
   */
  async function initPlayersDb() {
    if (sleeperPlayersDb && Object.keys(sleeperPlayersDb).length > 0) return sleeperPlayersDb;

    try {
      const cached = localStorage.getItem("sleeper_players_v3");
      if (cached) {
        sleeperPlayersDb = JSON.parse(cached);
        return sleeperPlayersDb;
      }
    } catch (e) {
      console.warn("Could not read player cache:", e);
    }

    if (isFetchingPlayersDb) return;
    isFetchingPlayersDb = true;

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
      sleeperPlayersDb = stripped;
      try {
        localStorage.setItem("sleeper_players_v3", JSON.stringify(stripped));
      } catch {
        // storage quota safe
      }
      // Re-render views with updated names and positions if data is already loaded
      if (rawRecords && rawRecords.length > 0) {
        refreshDashboard();
      }
      return sleeperPlayersDb;
    } catch (err) {
      console.error("Could not load Sleeper player database:", err);
    } finally {
      isFetchingPlayersDb = false;
    }
  }

  function getPlayerInfo(pid) {
    if (!pid || pid === "0")
      return {
        id: "0",
        name: "Empty Slot",
        pos: "FLEX",
        team: "FA",
        headshotUrl: null,
        isDef: false
      };

    if (sleeperPlayersDb && sleeperPlayersDb[pid]) {
      const p = sleeperPlayersDb[pid];
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

    // Direct fallback for 2-3 letter team defenses if db is still loading
    if (typeof pid === "string" && /^[A-Z]{2,3}$/.test(pid)) {
      return {
        id: pid,
        name: `${pid} Defense`,
        pos: "DEF",
        team: pid,
        isDef: true,
        headshotUrl: `https://sleepercdn.com/images/v2/icons/league/teams/nfl/${pid.toLowerCase()}.png`
      };
    }

    return {
      id: pid,
      name: `Player #${pid}`,
      pos: "FLEX",
      team: "NFL",
      isDef: false,
      headshotUrl: `https://sleepercdn.com/content/nfl/players/thumb/${pid}.jpg`
    };
  }

  function getPlayerPositionBadge(pos) {
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

  /**
   * Helper: Process Weekly Matchups into Records with Head-to-Head Outcomes (#1) & Bench Analytics (#2)
   */
  function processWeeklyMatchups(
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

    for (const m of matchupsRaw) {
      const rid = m.roster_id;
      const ownerId = rosterToOwner[rid];
      const userInfo = userMap[ownerId] || {};

      const customPts = m.custom_points;
      const points = customPts !== null && customPts !== undefined ? customPts : m.points || 0.0;
      const roundedPoints = Math.round(parseFloat(points || 0) * 100) / 100;

      // Bench & Players Points (#2)
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
        // Matchup outcome placeholders (#1)
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

    // Step 2: Resolve head-to-head outcomes (#1)
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

  /**
   * Main Fetcher
   */
  async function fetchLeaderboard() {
    const isLeaguesSync = currentSyncType === "leagues";
    const inputVal = userIdInput ? userIdInput.value.trim() : "";
    const season = seasonInput ? seasonInput.value : "2024";
    const targetWeek = weekInput ? parseInt(weekInput.value, 10) : 1;
    const mode = modeSelect ? modeSelect.value : "WEEKLY";

    const hasPendingLeagues = Boolean(pendingLeagueIdsFilter && pendingLeagueIdsFilter.size > 0);
    const hasCustomLeagues = Boolean(customLeagueIds && customLeagueIds.size > 0);

    let targetIds = [];
    if (isLeaguesSync || (!inputVal && (hasPendingLeagues || hasCustomLeagues))) {
      targetIds = hasPendingLeagues
        ? Array.from(pendingLeagueIdsFilter)
        : Array.from(customLeagueIds);

      if (targetIds.length === 0) {
        showError("Please enter at least one Sleeper League ID.");
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
      let leaguesData = [];
      if (targetIds.length > 0) {
        currentUserId = "";
        currentUserName = "";
        currentUserAvatar = "";
        updateSettingsButtonBadge();
        await initPlayersDb();

        updateProgress(15, "Fetching league metadata...");
        const fetched = await Promise.all(
          targetIds.map(lid => apiFetch(`/league/${lid}`).catch(() => null))
        );
        leaguesData = fetched.filter(l => l && l.league_id);

        if (!leaguesData || leaguesData.length === 0) {
          showError(
            `No valid leagues found for the specified League IDs (${targetIds.join(", ")}).`
          );
          return;
        }
      } else {
        const [resolvedId] = await Promise.all([resolveUser(inputVal), initPlayersDb()]);
        currentUserId = resolvedId;

        updateProgress(15, "Fetching active leagues...");
        leaguesData = await apiFetch(`/user/${currentUserId}/leagues/nfl/${season}`);

        if (!leaguesData || leaguesData.length === 0) {
          showError(`No leagues found for "${inputVal}" in the ${season} season.`);
          return;
        }
      }

      const totalLeagues = leaguesData.length;
      leaguesMap = {};
      allLeaguesData = leaguesData;

      if (mode === "SEASON_ROLLUP") {
        // Season Rollup Aggregation (Weeks 1 to targetWeek) (#5)
        updateProgress(
          25,
          `Aggregating Weeks 1 through ${targetWeek} across ${totalLeagues} leagues...`
        );

        const teamRollups = {}; // `${lid}-${rid}` -> aggregate object
        let completedCalls = 0;
        const totalCalls = totalLeagues;

        await Promise.all(
          leaguesData.map(async league => {
            const lid = league.league_id;
            const lname = league.name || `League ${lid}`;
            const lavatar = league.avatar || null;

            leaguesMap[lid] = {
              name: lname,
              avatar: lavatar,
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

              // Fetch all weeks from 1 to targetWeek
              const weeksToFetch = [];
              for (let w = 1; w <= targetWeek; w++) weeksToFetch.push(w);

              const weeklyMatchupsList = await Promise.all(
                weeksToFetch.map(w => apiFetch(`/league/${lid}/matchups/${w}`).catch(() => []))
              );

              weeklyMatchupsList.forEach((matchupsRaw, wIdx) => {
                const wNum = wIdx + 1;
                if (!matchupsRaw || matchupsRaw.length === 0) return;

                const weekRecords = processWeeklyMatchups(
                  matchupsRaw,
                  rostersRaw,
                  userMap,
                  lid,
                  lname,
                  lavatar,
                  wNum
                );

                weekRecords.forEach(r => {
                  if (!teamRollups[r.id]) {
                    teamRollups[r.id] = {
                      id: r.id,
                      leagueId: r.leagueId,
                      league: r.league,
                      leagueAvatar: r.leagueAvatar,
                      manager: r.manager,
                      teamName: r.teamName,
                      avatar: r.avatar,
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
                  }
                  if (
                    r.points > 0 ||
                    r.startersTotal > 0 ||
                    (r.startersList && r.startersList.length > 0)
                  ) {
                    teamRollups[r.id].weeklyScores.push(r.points);
                    teamRollups[r.id].weeklyPlayerRecords.push({
                      week: wNum,
                      startersList: r.startersList || [],
                      allPlayersList: r.allPlayersList || [],
                      playersPointsMap: r.playersPointsMap || {}
                    });
                    teamRollups[r.id].totalPoints += r.points;
                    teamRollups[r.id].totalBenchPoints += r.benchPoints;
                    teamRollups[r.id].efficiencies.push(r.efficiency);

                    if (r.outcome === "win") teamRollups[r.id].wins++;
                    else if (r.outcome === "loss") teamRollups[r.id].losses++;
                    else if (r.outcome === "tie") teamRollups[r.id].ties++;

                    teamRollups[r.id].allPlayWins += r.allPlayWins || 0;
                    teamRollups[r.id].allPlayLosses += r.allPlayLosses || 0;
                    teamRollups[r.id].allPlayTies += r.allPlayTies || 0;
                    teamRollups[r.id].expectedWins += r.expectedWins || 0;
                    teamRollups[r.id].opponentPointsTotal += r.pointsAgainst || 0;

                    leaguesMap[lid].scores.push(r.points);
                  }
                });
              });
            } catch (err) {
              console.error(`Error loading season data for league ${lid}:`, err);
            } finally {
              completedCalls++;
              const percent = 25 + Math.round((completedCalls / totalCalls) * 70);
              updateProgress(percent, `Processed ${completedCalls}/${totalCalls} leagues...`);
            }
          })
        );

        // Convert teamRollups into finalized records
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
            points: avgPts, // Primary ranking metric is Avg PPG in season mode
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

        if (records.length === 0) {
          showError(`No season scores found through Week ${targetWeek}.`);
          return;
        }

        rawRecords = records;
        if (pendingLeagueIdsFilter && pendingLeagueIdsFilter.size > 0) {
          selectedLeagueIds = new Set(
            leaguesData.map(l => l.league_id).filter(id => pendingLeagueIdsFilter.has(id))
          );
          if (selectedLeagueIds.size === 0) {
            selectedLeagueIds = new Set(leaguesData.map(l => l.league_id));
          }
          pendingLeagueIdsFilter = null;
        } else {
          selectedLeagueIds = new Set(leaguesData.map(l => l.league_id));
        }
      } else {
        // Single Week Mode
        updateProgress(30, `Loading Week ${targetWeek} rosters across ${totalLeagues} leagues...`);

        let completedLeagues = 0;
        const records = [];

        await Promise.all(
          leaguesData.map(async league => {
            const lid = league.league_id;
            const lname = league.name || `League ${lid}`;
            const lavatar = league.avatar || null;

            leaguesMap[lid] = {
              name: lname,
              avatar: lavatar,
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
                records.push(r);
                leaguesMap[lid].scores.push(r.points);
              });
            } catch (err) {
              console.error(`Error loading league ${lid}:`, err);
            } finally {
              completedLeagues++;
              const percent = 30 + Math.round((completedLeagues / totalLeagues) * 65);
              updateProgress(percent, `Loaded ${completedLeagues}/${totalLeagues} leagues...`);
            }
          })
        );

        if (records.length === 0) {
          showError(`No scores found for Week ${targetWeek} in ${leaguesData.length} leagues.`);
          return;
        }

        rawRecords = records;
        if (pendingLeagueIdsFilter && pendingLeagueIdsFilter.size > 0) {
          selectedLeagueIds = new Set(
            leaguesData.map(l => l.league_id).filter(id => pendingLeagueIdsFilter.has(id))
          );
          if (selectedLeagueIds.size === 0) {
            selectedLeagueIds = new Set(leaguesData.map(l => l.league_id));
          }
          pendingLeagueIdsFilter = null;
        } else {
          selectedLeagueIds = new Set(leaguesData.map(l => l.league_id));
        }
      }

      setLoading(false);
      initialState.classList.add("hidden");
      reportContent.classList.remove("hidden");
      if (copyRecapBtn) copyRecapBtn.classList.remove("hidden");
      if (shareUrlBtn) shareUrlBtn.classList.remove("hidden");
      if (downloadReportBtn) downloadReportBtn.classList.remove("hidden");
      if (exportCsvBtn) exportCsvBtn.classList.remove("hidden");

      renderLeagueDropdown();
      refreshDashboard();
      saveDataToCache(
        currentUserId,
        currentUserName,
        currentUserAvatar,
        season,
        mode,
        targetWeek,
        rawRecords,
        leaguesMap,
        leaguesData
      );

      const sorted = [...rawRecords].sort((a, b) => b.points - a.points);
      if (sorted[0]) {
        triggerConfetti();
      }
    } catch (err) {
      console.error("Fetch error:", err);
      showError(err.message || "Failed to load cross-league data. Check console for details.");
    }
  }

  function getActiveRecords() {
    return rawRecords.filter(r => selectedLeagueIds.has(r.leagueId));
  }

  function getActiveLeaguesMap() {
    const activeMap = {};
    for (const lid of selectedLeagueIds) {
      if (leaguesMap[lid]) {
        activeMap[lid] = leaguesMap[lid];
      }
    }
    return activeMap;
  }

  function renderLeagueDropdown() {
    if (!leagueDropdownList) return;
    leagueDropdownList.innerHTML = "";

    if ((!allLeaguesData || allLeaguesData.length === 0) && rawRecords && rawRecords.length > 0) {
      allLeaguesData = Array.from(new Set(rawRecords.map(r => r.leagueId))).map(lid => {
        const sample = rawRecords.find(r => r.leagueId === lid);
        return {
          league_id: lid,
          name:
            (leaguesMap[lid] && leaguesMap[lid].name) ||
            (sample && sample.league) ||
            `League ${lid}`,
          avatar:
            (leaguesMap[lid] && leaguesMap[lid].avatar) || (sample && sample.leagueAvatar) || null
        };
      });
      if (selectedLeagueIds.size === 0) {
        selectedLeagueIds = new Set(allLeaguesData.map(l => l.league_id));
      }
    }

    const total = allLeaguesData.length;
    const active = selectedLeagueIds.size;

    if (leagueDropdownContainer) {
      leagueDropdownContainer.classList.remove("hidden");
    }

    if (leagueDropdownLabel) {
      if (active === total && total > 0) {
        leagueDropdownLabel.textContent = `All Leagues (${total})`;
      } else if (active === 0 && total > 0) {
        leagueDropdownLabel.textContent = "No Leagues Selected";
      } else if (active === 1 && total > 0) {
        const singleId = Array.from(selectedLeagueIds)[0];
        const l = leaguesMap[singleId] || allLeaguesData.find(x => x.league_id === singleId);
        leagueDropdownLabel.textContent = l ? l.name : "1 League Selected";
      } else if (total > 0) {
        leagueDropdownLabel.textContent = `${active} of ${total} Leagues Selected`;
      } else {
        leagueDropdownLabel.textContent = "No leagues synced yet";
      }
    }

    if (leagueDropdownBadge) {
      leagueDropdownBadge.textContent = total > 0 ? `${active} / ${total}` : "0";
      if (active === 0 && total > 0) {
        leagueDropdownBadge.className =
          "text-[10px] font-bold text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded-full border border-rose-500/30 font-mono";
      } else {
        leagueDropdownBadge.className =
          "text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-500/30 font-mono";
      }
    }

    if (selectAllLeaguesBtn) selectAllLeaguesBtn.disabled = total === 0;
    if (clearAllLeaguesBtn) clearAllLeaguesBtn.disabled = total === 0;

    if (total === 0) {
      leagueDropdownList.innerHTML = `
        <div class="text-[11px] text-slate-500 italic p-3 text-center">
          Sync your Sleeper account above to view and filter active leagues.
        </div>
      `;
      return;
    }

    allLeaguesData.forEach(league => {
      const lid = league.league_id;
      const lname = league.name || `League ${lid}`;
      const isChecked = selectedLeagueIds.has(lid);
      const squadCount = rawRecords.filter(r => r.leagueId === lid).length;

      const item = document.createElement("label");
      item.className =
        "flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-800/80 transition cursor-pointer select-none border border-transparent hover:border-slate-700/50";

      item.innerHTML = `
        <input
          type="checkbox"
          value="${lid}"
          ${isChecked ? "checked" : ""}
          class="mt-1 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0 transition cursor-pointer flex-shrink-0"
        />
        <div class="flex-1 min-w-0 pr-1">
          <div class="text-xs font-bold text-slate-200 leading-snug break-words">
            ${escapeHtml(lname)}
          </div>
          <div class="text-[10px] text-slate-500 font-medium mt-0.5">
            ${squadCount} squads
          </div>
        </div>
      `;

      const cb = item.querySelector('input[type="checkbox"]');
      cb.addEventListener("change", e => {
        if (e.target.checked) {
          selectedLeagueIds.add(lid);
        } else {
          selectedLeagueIds.delete(lid);
        }
        renderLeagueDropdown();
        refreshDashboard();
      });

      leagueDropdownList.appendChild(item);
    });
  }

  function refreshDashboard() {
    currentMainPage = 1;
    currentPlayerPage = 1;
    currentLuckPage = 1;

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
   * Helper: Generate interactive card title with clickable / hovering popover description
   */
  function createCardTitleWithInfo(
    titleHtml,
    infoDescription,
    triggerClasses = "",
    popoverClass = ""
  ) {
    return `
      <div class="relative inline-block card-info-wrapper">
        <button
          type="button"
          class="card-info-trigger ${triggerClasses} cursor-pointer select-none group inline-flex items-center gap-1.5 focus:outline-none transition"
          aria-expanded="false"
        >
          <span>${titleHtml}</span>
          <span class="text-[10px] opacity-70 group-hover:opacity-100 transition-opacity">ⓘ</span>
        </button>
        <div class="card-info-popover ${popoverClass}" role="tooltip">
          <div class="text-[11px] text-slate-200 leading-relaxed font-normal">
            ${infoDescription}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Superlatives Showcase Deck (6 Cards: Bad Beat, Lucky Escape, Bench Heavyweight, Luckiest Draw, Toughest Schedule, Cardiac Kid)
   */
  function renderSuperlatives(records = getActiveRecords()) {
    if (!badBeatCard || !luckyEscapeCard || !benchMvpCard) return;
    if (!records || records.length === 0) return;

    const isSeason = currentMode === "SEASON_ROLLUP";
    if (badBeatCard.parentElement) {
      badBeatCard.parentElement.classList.remove("hidden");
    }

    // 1. The Bad Beat 💔: Highest scoring loser
    if (badBeatCard) {
      badBeatCard.removeAttribute("title");
      if (!isSeason) {
        const losers = records
          .filter(r => r.outcome === "loss" && r.points > 0)
          .sort((a, b) => b.points - a.points);
        const badBeat = losers[0];
        if (badBeat) {
          const titleComponent = createCardTitleWithInfo(
            "The Bad Beat 💔",
            "Highest-scoring squad across all leagues that lost their matchup this week.",
            "text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-500/30 hover:border-rose-400/70"
          );
          badBeatCard.innerHTML = `
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                ${titleComponent}
                <div class="text-base sm:text-lg font-black text-white truncate mt-2">${escapeHtml(badBeat.manager)}</div>
                <div class="text-xs sm:text-sm text-slate-400 truncate mt-0.5">${escapeHtml(badBeat.teamName)}</div>
                <div class="text-xs sm:text-sm font-bold text-slate-300 mt-2 break-words leading-snug flex items-center gap-1.5" title="League: ${escapeHtml(badBeat.league)}">
                  <span class="text-sm flex-shrink-0">🏆</span>
                  <span class="truncate">${escapeHtml(badBeat.league)}</span>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xl sm:text-2xl font-mono font-black text-rose-400">${badBeat.points.toFixed(2)} <span class="text-xs font-semibold text-rose-300/80">pts</span></div>
                <div class="text-xs text-slate-400 font-semibold mt-1">Lost by ${Math.abs(badBeat.margin).toFixed(2)} to ${escapeHtml(badBeat.opponentName || "Rival")}</div>
              </div>
            </div>
          `;
        } else {
          const titleComponent = createCardTitleWithInfo(
            "The Bad Beat 💔",
            "Highest-scoring squad across all leagues that lost their matchup this week.",
            "text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700"
          );
          badBeatCard.innerHTML = `
            <div class="flex items-center justify-between">
              ${titleComponent}
            </div>
            <div class="text-xs sm:text-sm text-slate-500 italic mt-3">No completed matchup losses recorded.</div>
          `;
        }
      } else {
        const losingSquads = records
          .filter(r => (r.losses || 0) > (r.wins || 0))
          .sort((a, b) => (b.totalPoints || b.points || 0) - (a.totalPoints || a.points || 0));
        const badBeat =
          losingSquads[0] ||
          [...records].sort((a, b) => (b.pointsAgainst || 0) - (a.pointsAgainst || 0))[0];
        if (badBeat) {
          const titleComponent = createCardTitleWithInfo(
            "Season Heartbreak 💔",
            "Highest scoring team across all leagues with a losing head-to-head record.",
            "text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-500/30 hover:border-rose-400/70"
          );
          badBeatCard.innerHTML = `
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                ${titleComponent}
                <div class="text-base sm:text-lg font-black text-white truncate mt-2">${escapeHtml(badBeat.manager)}</div>
                <div class="text-xs sm:text-sm text-slate-400 truncate mt-0.5">${escapeHtml(badBeat.teamName)}</div>
                <div class="text-xs sm:text-sm font-bold text-slate-300 mt-2 break-words leading-snug flex items-center gap-1.5" title="League: ${escapeHtml(badBeat.league)}">
                  <span class="text-sm flex-shrink-0">🏆</span>
                  <span class="truncate">${escapeHtml(badBeat.league)}</span>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xl sm:text-2xl font-mono font-black text-rose-400">${(badBeat.points || 0).toFixed(1)} <span class="text-xs font-semibold text-rose-300/80">PPG</span></div>
                <div class="text-xs text-slate-400 font-semibold mt-1">${badBeat.wins || 0}W-${badBeat.losses || 0}L (${badBeat.winPct || 0}%)</div>
              </div>
            </div>
          `;
        }
      }
    }

    // 2. The Lucky Escape 🪄: Lowest scoring winner
    if (luckyEscapeCard) {
      luckyEscapeCard.removeAttribute("title");
      if (!isSeason) {
        const winners = records
          .filter(r => r.outcome === "win" && r.points > 0)
          .sort((a, b) => a.points - b.points);
        const luckyEscape = winners[0];
        if (luckyEscape) {
          const titleComponent = createCardTitleWithInfo(
            "The Lucky Escape 🪄",
            "Lowest-scoring squad across all leagues that managed to win their matchup this week.",
            "text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 hover:border-emerald-400/70"
          );
          luckyEscapeCard.innerHTML = `
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                ${titleComponent}
                <div class="text-base sm:text-lg font-black text-white truncate mt-2">${escapeHtml(luckyEscape.manager)}</div>
                <div class="text-xs sm:text-sm text-slate-400 truncate mt-0.5">${escapeHtml(luckyEscape.teamName)}</div>
                <div class="text-xs sm:text-sm font-bold text-slate-300 mt-2 break-words leading-snug flex items-center gap-1.5" title="League: ${escapeHtml(luckyEscape.league)}">
                  <span class="text-sm flex-shrink-0">🏆</span>
                  <span class="truncate">${escapeHtml(luckyEscape.league)}</span>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xl sm:text-2xl font-mono font-black text-emerald-400">${luckyEscape.points.toFixed(2)} <span class="text-xs font-semibold text-emerald-300/80">pts</span></div>
                <div class="text-xs text-slate-400 font-semibold mt-1">Won by ${Math.abs(luckyEscape.margin).toFixed(2)} vs ${escapeHtml(luckyEscape.opponentName || "Rival")}</div>
              </div>
            </div>
          `;
        } else {
          const titleComponent = createCardTitleWithInfo(
            "The Lucky Escape 🪄",
            "Lowest-scoring squad across all leagues that managed to win their matchup this week.",
            "text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700"
          );
          luckyEscapeCard.innerHTML = `
            <div class="flex items-center justify-between">
              ${titleComponent}
            </div>
            <div class="text-xs sm:text-sm text-slate-500 italic mt-3">No completed matchup wins recorded.</div>
          `;
        }
      } else {
        const winningSquads = records
          .filter(r => (r.wins || 0) > (r.losses || 0))
          .sort((a, b) => (a.totalPoints || a.points || 0) - (b.totalPoints || b.points || 0));
        const luckyEscape =
          winningSquads[0] ||
          [...records].sort((a, b) => (a.pointsAgainst || 0) - (b.pointsAgainst || 0))[0];
        if (luckyEscape) {
          const titleComponent = createCardTitleWithInfo(
            "Teflon Squad 🪄",
            "Lowest scoring squad across all leagues that maintained a winning record.",
            "text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 hover:border-emerald-400/70"
          );
          luckyEscapeCard.innerHTML = `
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                ${titleComponent}
                <div class="text-base sm:text-lg font-black text-white truncate mt-2">${escapeHtml(luckyEscape.manager)}</div>
                <div class="text-xs sm:text-sm text-slate-400 truncate mt-0.5">${escapeHtml(luckyEscape.teamName)}</div>
                <div class="text-xs sm:text-sm font-bold text-slate-300 mt-2 break-words leading-snug flex items-center gap-1.5" title="League: ${escapeHtml(luckyEscape.league)}">
                  <span class="text-sm flex-shrink-0">🏆</span>
                  <span class="truncate">${escapeHtml(luckyEscape.league)}</span>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xl sm:text-2xl font-mono font-black text-emerald-400">${(luckyEscape.points || 0).toFixed(1)} <span class="text-xs font-semibold text-emerald-300/80">PPG</span></div>
                <div class="text-xs text-slate-400 font-semibold mt-1">${luckyEscape.wins || 0}W-${luckyEscape.losses || 0}L (${luckyEscape.winPct || 0}%)</div>
              </div>
            </div>
          `;
        }
      }
    }

    // 3. Bench Heavyweight 🪑: Manager with most bench points
    if (benchMvpCard) {
      benchMvpCard.removeAttribute("title");
      const sortedBench = records
        .filter(r => (r.benchPoints || 0) > 0)
        .sort((a, b) => b.benchPoints - a.benchPoints);
      const benchKing = sortedBench[0];
      if (benchKing && benchKing.benchPoints > 0) {
        const titleComponent = createCardTitleWithInfo(
          "Bench Heavyweight 🪑",
          "Squad with the most bench points left unstarted on their roster.",
          "text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/30 hover:border-amber-400/70"
        );
        benchMvpCard.innerHTML = `
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              ${titleComponent}
              <div class="text-base sm:text-lg font-black text-white truncate mt-2">${escapeHtml(benchKing.manager)}</div>
              <div class="text-xs sm:text-sm text-slate-400 truncate mt-0.5">${escapeHtml(benchKing.teamName)}</div>
              <div class="text-xs sm:text-sm font-bold text-slate-300 mt-2 break-words leading-snug flex items-center gap-1.5" title="League: ${escapeHtml(benchKing.league)}">
                <span class="text-sm flex-shrink-0">🏆</span>
                <span class="truncate">${escapeHtml(benchKing.league)}</span>
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <div class="text-xl sm:text-2xl font-mono font-black text-amber-300">${benchKing.benchPoints.toFixed(2)} <span class="text-xs font-semibold text-amber-300/80">pts</span></div>
              <div class="text-xs text-slate-400 font-semibold mt-1">${benchKing.efficiency ?? 100}% Lineup Efficiency</div>
            </div>
          </div>
        `;
      } else {
        const titleComponent = createCardTitleWithInfo(
          "Bench Heavyweight 🪑",
          "Squad with the most bench points left unstarted on their roster.",
          "text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700"
        );
        benchMvpCard.innerHTML = `
          <div class="flex items-center justify-between">
            ${titleComponent}
          </div>
          <div class="text-xs sm:text-sm text-slate-500 italic mt-3">No bench scoring recorded yet.</div>
        `;
      }
    }
  }

  function renderPodium(records = getActiveRecords()) {
    if (!podiumCards) return;
    podiumCards.innerHTML = "";

    const isSeason = currentMode === "SEASON_ROLLUP";
    const sorted = [...records].sort((a, b) => b.points - a.points);
    const top3 = sorted.slice(0, 3);

    const podiumSlots = [
      {
        rank: 1,
        title: "1ST PLACE",
        medal: "🥇",
        glow: "gold-glow",
        color: "text-amber-400",
        orderClass: "order-1 md:order-2",
        cardClass: "md:min-h-[260px] p-6",
        scoreSize: "text-3xl sm:text-4xl"
      },
      {
        rank: 2,
        title: "2ND PLACE",
        medal: "🥈",
        glow: "silver-glow",
        color: "text-slate-300",
        orderClass: "order-2 md:order-1",
        cardClass: "md:min-h-[230px] p-5",
        scoreSize: "text-2xl sm:text-3xl"
      },
      {
        rank: 3,
        title: "3RD PLACE",
        medal: "🥉",
        glow: "bronze-glow",
        color: "text-amber-600",
        orderClass: "order-3 md:order-3",
        cardClass: "md:min-h-[205px] p-5",
        scoreSize: "text-2xl sm:text-3xl"
      }
    ];

    podiumSlots.forEach(slot => {
      const t = top3[slot.rank - 1];
      if (!t) return;

      const card = document.createElement("div");
      card.className = `glass-card ${slot.glow} ${slot.orderClass} ${slot.cardClass} rounded-2xl flex flex-col justify-between relative`;

      const metricLabel = isSeason ? "Average PPG" : "Total Points";
      const effVal = typeof t.efficiency === "number" && !isNaN(t.efficiency) ? t.efficiency : 100;
      const subMetric = isSeason
        ? `${(t.totalPoints || 0).toFixed(1)} Total PF • ${t.wins || 0}W-${t.losses || 0}L`
        : `Lineup Efficiency: ${effVal}%`;

      const avatarUrl = getAvatarUrl(t.avatar);
      const avatarSize = slot.rank === 1 ? "w-11 h-11" : "w-10 h-10";
      const avatarHtml = avatarUrl
        ? `<img src="${avatarUrl}" class="${avatarSize} rounded-full object-cover border border-slate-700 flex-shrink-0" alt="" onerror="this.remove()">`
        : "";

      const titleComponent = createCardTitleWithInfo(
        slot.title,
        slot.rank === 1
          ? isSeason
            ? "1st Place Champion with highest average points per game across all leagues."
            : "Weekly Cross-League Champion with highest score."
          : slot.rank === 2
            ? "2nd Place Runner-Up across all participating leagues."
            : "3rd Place Podium Finisher across all participating leagues.",
        `text-xs font-black tracking-wider uppercase ${slot.color} hover:underline`
      );

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between">
            ${titleComponent}
            <span class="text-2xl">${slot.medal}</span>
          </div>
          <div class="mt-3 flex items-center gap-3">
            ${avatarHtml}
            <div class="min-w-0 flex-1">
              <div class="text-lg sm:text-xl font-black text-white truncate" title="${escapeHtml(t.manager)}">
                ${escapeHtml(t.manager)}
              </div>
              <div class="text-xs sm:text-sm text-slate-400 font-medium truncate mt-0.5" title="${escapeHtml(t.teamName)}">
                ${escapeHtml(t.teamName)}
              </div>
              <div class="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1 mt-1" title="League: ${escapeHtml(t.league)}">
                <span>🏆</span> <span class="truncate">${escapeHtml(t.league)}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-5 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
          <div>
            <div class="text-xs uppercase font-bold text-slate-400">${metricLabel}</div>
            <div class="${slot.scoreSize} font-black ${slot.color} font-mono leading-none mt-1.5">
              ${t.points.toFixed(2)}
            </div>
          </div>
          <div class="text-xs font-semibold text-slate-400 text-right">
            ${subMetric}
          </div>
        </div>
      `;

      podiumCards.appendChild(card);
    });
  }

  function renderSummaryCards(records = getActiveRecords(), activeLeagues = getActiveLeaguesMap()) {
    const totalSquads = records.length;
    const totalActiveLeagues = Object.keys(activeLeagues || {}).length;

    const elLeagues = document.getElementById("statTotalLeagues");
    if (elLeagues) elLeagues.textContent = totalActiveLeagues;

    const elTeams = document.getElementById("statTotalTeams");
    if (elTeams) elTeams.textContent = totalSquads;

    if (totalSquads === 0) {
      if (document.getElementById("statHighScore"))
        document.getElementById("statHighScore").textContent = "0.00";
      if (document.getElementById("statHighTeam"))
        document.getElementById("statHighTeam").textContent = "-";
      if (document.getElementById("statLowScore"))
        document.getElementById("statLowScore").textContent = "0.00";
      if (document.getElementById("statLowTeam"))
        document.getElementById("statLowTeam").textContent = "-";
      if (document.getElementById("statAvgScore"))
        document.getElementById("statAvgScore").textContent = "0.00";
      if (document.getElementById("statMedianScore"))
        document.getElementById("statMedianScore").textContent = "Median: 0.00";
      if (document.getElementById("statTopLeagueAvg"))
        document.getElementById("statTopLeagueAvg").textContent = "0.00";
      if (document.getElementById("statTopLeagueName"))
        document.getElementById("statTopLeagueName").textContent = "-";
      return;
    }

    const sortedByPts = [...records].sort((a, b) => b.points - a.points);
    const topOverall = sortedByPts[0];
    const lowestOverall = sortedByPts[sortedByPts.length - 1];

    if (document.getElementById("statHighScore")) {
      document.getElementById("statHighScore").textContent = topOverall
        ? topOverall.points.toFixed(2)
        : "0.00";
    }
    if (document.getElementById("statHighTeam")) {
      document.getElementById("statHighTeam").textContent = topOverall
        ? `${topOverall.manager} - ${topOverall.teamName}`
        : "-";
      document.getElementById("statHighTeam").title = topOverall
        ? `${topOverall.manager} (${topOverall.teamName})`
        : "";
    }
    if (document.getElementById("statHighLeague")) {
      document.getElementById("statHighLeague").innerHTML = topOverall
        ? `<span>🏆</span> <span class="truncate">${escapeHtml(topOverall.league)}</span>`
        : "-";
      document.getElementById("statHighLeague").title = topOverall
        ? `League: ${topOverall.league}`
        : "";
    }

    if (document.getElementById("statLowScore")) {
      document.getElementById("statLowScore").textContent = lowestOverall
        ? lowestOverall.points.toFixed(2)
        : "0.00";
    }
    if (document.getElementById("statLowTeam")) {
      document.getElementById("statLowTeam").textContent = lowestOverall
        ? `${lowestOverall.manager} - ${lowestOverall.teamName}`
        : "-";
      document.getElementById("statLowTeam").title = lowestOverall
        ? `${lowestOverall.manager} (${lowestOverall.teamName})`
        : "";
    }
    if (document.getElementById("statLowLeague")) {
      document.getElementById("statLowLeague").innerHTML = lowestOverall
        ? `<span>🏆</span> <span class="truncate">${escapeHtml(lowestOverall.league)}</span>`
        : "-";
      document.getElementById("statLowLeague").title = lowestOverall
        ? `League: ${lowestOverall.league}`
        : "";
    }

    const sumPts = records.reduce((acc, r) => acc + r.points, 0);
    const avgPts = sumPts / totalSquads;
    if (document.getElementById("statAvgScore")) {
      document.getElementById("statAvgScore").textContent = avgPts.toFixed(2);
    }

    const mid = Math.floor(sortedByPts.length / 2);
    const medianPts =
      sortedByPts.length % 2 !== 0
        ? sortedByPts[mid].points
        : (sortedByPts[mid - 1].points + sortedByPts[mid].points) / 2;
    if (document.getElementById("statMedianScore")) {
      document.getElementById("statMedianScore").textContent =
        `Median: ${medianPts.toFixed(2)} pts`;
    }

    // Power League Benchmark
    let topLeagueAvg = 0;
    let topLeagueName = "-";
    const leagues = activeLeagues || getActiveLeaguesMap();
    Object.keys(leagues).forEach(lid => {
      const leagueTeams = records.filter(r => r.leagueId === lid);
      if (leagueTeams.length > 0) {
        const lSum = leagueTeams.reduce((a, b) => a + b.points, 0);
        const lAvg = lSum / leagueTeams.length;
        if (lAvg > topLeagueAvg) {
          topLeagueAvg = lAvg;
          topLeagueName = leagues[lid].name || `League ${lid}`;
        }
      }
    });
    if (document.getElementById("statTopLeagueAvg")) {
      document.getElementById("statTopLeagueAvg").textContent =
        topLeagueAvg > 0 ? topLeagueAvg.toFixed(2) : "0.00";
    }
    if (document.getElementById("statTopLeagueName")) {
      document.getElementById("statTopLeagueName").innerHTML =
        topLeagueAvg > 0
          ? `<span>🏆</span> <span class="truncate">${escapeHtml(topLeagueName)}</span>`
          : "-";
      document.getElementById("statTopLeagueName").title = topLeagueAvg > 0 ? topLeagueName : "";
    }
  }

  function renderPaginationButtons(containerId, totalPages, curPage, onPageClickFnName) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    if (totalPages <= 1) return;

    const createBtn = pageNum => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = String(pageNum);
      btn.onclick = () => {
        if (typeof window[onPageClickFnName] === "function") {
          window[onPageClickFnName](pageNum);
        }
      };
      if (pageNum === curPage) {
        btn.className =
          "w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-xs cursor-pointer shadow-sm transition flex items-center justify-center";
        btn.setAttribute("aria-current", "page");
      } else {
        btn.className =
          "w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 font-bold text-xs cursor-pointer transition flex items-center justify-center";
      }
      return btn;
    };

    const createEllipsis = () => {
      const span = document.createElement("span");
      span.className = "px-1 text-slate-500 font-bold text-xs select-none";
      span.textContent = "…";
      return span;
    };

    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (curPage <= 4) {
        pages = [1, 2, 3, 4, 5, "...", totalPages];
      } else if (curPage >= totalPages - 3) {
        pages = [
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        ];
      } else {
        pages = [1, "...", curPage - 1, curPage, curPage + 1, "...", totalPages];
      }
    }

    pages.forEach(p => {
      if (p === "...") {
        container.appendChild(createEllipsis());
      } else {
        container.appendChild(createBtn(p));
      }
    });
  }

  window.setMainPageSize = function (size) {
    currentMainPageSize = size === "all" ? Infinity : parseInt(size, 10);
    currentMainPage = 1;
    renderTable();
  };

  window.changeMainPage = function (delta) {
    currentMainPage += delta;
    renderTable();
  };

  window.goToMainPage = function (page) {
    currentMainPage = page;
    renderTable();
  };

  window.sortTable = function (column) {
    const colMap = {
      rank: "Rank",
      points: "Points",
      manager: "Manager",
      team: "Team",
      teamname: "Team",
      league: "League",
      matchup: "Record",
      record: "Record",
      efficiency: "Efficiency"
    };
    const targetCol = colMap[String(column).toLowerCase()] || column;

    if (currentSortColumn === targetCol) {
      currentSortAsc = !currentSortAsc;
    } else {
      currentSortColumn = targetCol;
      // Default Ascending for Rank, Manager, Team, League; Descending for Points, Record, Efficiency
      currentSortAsc =
        targetCol === "Rank" ||
        targetCol === "Manager" ||
        targetCol === "Team" ||
        targetCol === "League";
    }
    currentMainPage = 1;
    renderTable();
  };

  window.toggleRowExpand = function (rowId) {
    if (expandedRowIds.has(rowId)) {
      expandedRowIds.delete(rowId);
    } else {
      expandedRowIds.add(rowId);
    }
    renderTable();
  };

  function renderTable(activeRecords = getActiveRecords()) {
    const isSeason = currentMode === "SEASON_ROLLUP";

    if (!activeRecords || activeRecords.length === 0) {
      rowCount.textContent = "Showing 0 squads";
      tableBody.innerHTML = "";
      noResultsFound.classList.remove("hidden");
      const msgTitle = noResultsFound.querySelector(".font-bold");
      const msgSub = noResultsFound.querySelector(".text-xs");
      if (selectedLeagueIds.size === 0) {
        if (msgTitle) msgTitle.textContent = "No leagues selected.";
        if (msgSub)
          msgSub.textContent =
            "Select one or more leagues in the filter bar above to display rankings.";
      } else {
        if (msgTitle) msgTitle.textContent = "Nothing on the board matching that search.";
        if (msgSub) msgSub.textContent = "Try clearing the keyword search or resetting filters.";
      }
      const pageInfo = document.getElementById("mainPageInfoText");
      if (pageInfo) pageInfo.textContent = "Showing 0 of 0";
      const btnPrev = document.getElementById("btnPrevMainPage");
      const btnNext = document.getElementById("btnNextMainPage");
      if (btnPrev) btnPrev.disabled = true;
      if (btnNext) btnNext.disabled = true;
      const pageBtnContainer = document.getElementById("mainPageNumberButtons");
      if (pageBtnContainer) pageBtnContainer.innerHTML = "";
      return;
    }

    const sortedMaster = [...activeRecords].sort((a, b) => b.points - a.points);
    const maxScore = sortedMaster[0] ? sortedMaster[0].points : 100;

    const masterWithRank = sortedMaster.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      percentOfMax: maxScore > 0 ? Math.round((item.points / maxScore) * 100) : 0
    }));

    let filtered = masterWithRank.filter(item => {
      if (isSeason) {
        if (currentTierFilter === "BOOM" && item.points < 130) return false;
        if (currentTierFilter === "SOLID" && (item.points < 105 || item.points >= 130))
          return false;
        if (currentTierFilter === "COLD" && item.points >= 105) return false;
      } else {
        if (currentTierFilter === "BOOM" && item.points < 140) return false;
        if (currentTierFilter === "SOLID" && (item.points < 100 || item.points >= 140))
          return false;
        if (currentTierFilter === "COLD" && item.points >= 100) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.manager.toLowerCase().includes(q) ||
          item.teamName.toLowerCase().includes(q) ||
          item.league.toLowerCase().includes(q)
        );
      }
      return true;
    });

    filtered.sort((a, b) => {
      let valA, valB;
      if (currentSortColumn === "Rank") {
        valA = a.rank;
        valB = b.rank;
      } else if (currentSortColumn === "Points") {
        valA = a.points;
        valB = b.points;
      } else if (currentSortColumn === "Manager") {
        valA = (a.manager || "").toLowerCase();
        valB = (b.manager || "").toLowerCase();
      } else if (currentSortColumn === "Team") {
        valA = (a.teamName || "").toLowerCase();
        valB = (b.teamName || "").toLowerCase();
      } else if (currentSortColumn === "League") {
        valA = (a.league || "").toLowerCase();
        valB = (b.league || "").toLowerCase();
      } else if (currentSortColumn === "Record") {
        if (isSeason) {
          valA = typeof a.winPct === "number" ? a.winPct : 0;
          valB = typeof b.winPct === "number" ? b.winPct : 0;
        } else {
          valA =
            a.outcome === "win"
              ? 1000 + (a.margin || 0)
              : a.outcome === "tie"
                ? 500
                : a.margin || -1000;
          valB =
            b.outcome === "win"
              ? 1000 + (b.margin || 0)
              : b.outcome === "tie"
                ? 500
                : b.margin || -1000;
        }
      } else if (currentSortColumn === "Efficiency") {
        valA = typeof a.efficiency === "number" ? a.efficiency : 0;
        valB = typeof b.efficiency === "number" ? b.efficiency : 0;
      } else {
        valA = a.points;
        valB = b.points;
      }

      if (valA < valB) return currentSortAsc ? -1 : 1;
      if (valA > valB) return currentSortAsc ? 1 : -1;
      return 0;
    });

    // Update Header Sort Icons
    ["Rank", "Points", "Manager", "Team", "League", "Record", "Efficiency"].forEach(col => {
      const icon =
        document.getElementById(`sortIcon${col}`) || document.getElementById(`sortIcon-${col}`);
      if (icon) {
        if (currentSortColumn === col) {
          icon.textContent = currentSortAsc ? "▲" : "▼";
          icon.className = "text-xs text-emerald-400";
        } else {
          icon.textContent = "";
          icon.className = "text-xs text-slate-500";
        }
      }
    });

    rowCount.textContent = `Showing ${filtered.length} of ${activeRecords.length} squads across ${selectedLeagueIds.size} leagues`;
    tableBody.innerHTML = "";

    if (filtered.length === 0) {
      noResultsFound.classList.remove("hidden");
      const pageInfo = document.getElementById("mainPageInfoText");
      if (pageInfo) pageInfo.textContent = "Showing 0 of 0";
      const btnPrev = document.getElementById("btnPrevMainPage");
      const btnNext = document.getElementById("btnNextMainPage");
      if (btnPrev) btnPrev.disabled = true;
      if (btnNext) btnNext.disabled = true;
      const pageBtnContainer = document.getElementById("mainPageNumberButtons");
      if (pageBtnContainer) pageBtnContainer.innerHTML = "";
      return;
    }
    noResultsFound.classList.add("hidden");

    const totalCount = filtered.length;
    const pageSize = currentMainPageSize === Infinity ? totalCount : currentMainPageSize;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    if (currentMainPage > totalPages) currentMainPage = totalPages;
    if (currentMainPage < 1) currentMainPage = 1;
    const startIdx = (currentMainPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalCount);
    const pageSlice = filtered.slice(startIdx, endIdx);

    const pageInfo = document.getElementById("mainPageInfoText");
    if (pageInfo)
      pageInfo.textContent =
        totalCount === 0 ? "Showing 0 of 0" : `Showing ${startIdx + 1}–${endIdx} of ${totalCount}`;
    const btnPrev = document.getElementById("btnPrevMainPage");
    const btnNext = document.getElementById("btnNextMainPage");
    if (btnPrev) btnPrev.disabled = currentMainPage <= 1 || totalCount === 0;
    if (btnNext) btnNext.disabled = currentMainPage >= totalPages || totalCount === 0;
    renderPaginationButtons("mainPageNumberButtons", totalPages, currentMainPage, "goToMainPage");

    pageSlice.forEach(r => {
      const tr = document.createElement("tr");
      const isExpanded = expandedRowIds.has(r.id);
      const avatarUrl = getAvatarUrl(r.avatar);

      tr.className = "transition-colors hover:bg-slate-800/60";

      let rankBadge = `<span class="font-black text-slate-400 font-mono text-xs sm:text-base">#${r.rank}</span>`;
      if (r.rank === 1)
        rankBadge = `<span class="inline-flex items-center gap-1 font-black text-amber-300 text-xs sm:text-base">🥇 #1</span>`;
      else if (r.rank === 2)
        rankBadge = `<span class="inline-flex items-center gap-1 font-black text-slate-200 text-xs sm:text-base">🥈 #2</span>`;
      else if (r.rank === 3)
        rankBadge = `<span class="inline-flex items-center gap-1 font-black text-amber-500 text-xs sm:text-base">🥉 #3</span>`;

      // Matchup Result Pill (#1) or Season Record Pill (#5)
      let matchupPill = "";
      if (isSeason) {
        matchupPill = `
          <div class="text-center">
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-black ${r.winPct >= 60 ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : r.winPct >= 40 ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-rose-500/15 text-rose-300 border border-rose-500/30"}">
              ${r.wins}W - ${r.losses}L${r.ties > 0 ? ` - ${r.ties}T` : ""}
            </span>
            <div class="text-[10px] sm:text-xs text-slate-400 font-mono mt-0.5">${r.winPct}% Win</div>
          </div>
        `;
      } else {
        if (r.outcome === "win") {
          matchupPill = `
            <div class="text-center">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                🟢 W (+${Math.abs(r.margin).toFixed(1)})
              </span>
              <div class="text-[10px] sm:text-xs text-slate-400 truncate max-w-[110px] sm:max-w-[130px] mt-0.5 font-medium" title="vs ${escapeHtml(r.opponentName || "Opponent")}">
                vs ${escapeHtml(r.opponentName || "Opp")}
              </div>
            </div>
          `;
        } else if (r.outcome === "loss") {
          matchupPill = `
            <div class="text-center">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                🔴 L (-${Math.abs(r.margin).toFixed(1)})
              </span>
              <div class="text-[10px] sm:text-xs text-slate-400 truncate max-w-[110px] sm:max-w-[130px] mt-0.5 font-medium" title="vs ${escapeHtml(r.opponentName || "Opponent")}">
                vs ${escapeHtml(r.opponentName || "Opp")}
              </div>
            </div>
          `;
        } else if (r.outcome === "tie") {
          matchupPill = `
            <div class="text-center">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-slate-800 text-slate-300 border border-slate-700">
                ⚪ TIE
              </span>
            </div>
          `;
        } else if (r.outcome === "unplayed") {
          matchupPill = `
            <div class="text-center">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60 truncate max-w-[110px] sm:max-w-[130px]" title="vs ${escapeHtml(r.opponentName || "Opponent")}">
                vs ${escapeHtml(r.opponentName || "Opp")}
              </span>
              <div class="text-[10px] sm:text-xs text-slate-500 font-mono mt-0.5">Upcoming</div>
            </div>
          `;
        } else {
          matchupPill = `<span class="text-slate-600 text-[10px] sm:text-xs">-</span>`;
        }
      }

      // Efficiency Pill (#2)
      const effVal = typeof r.efficiency === "number" && !isNaN(r.efficiency) ? r.efficiency : 100;
      const benchPtsVal =
        typeof r.benchPoints === "number" && !isNaN(r.benchPoints) ? r.benchPoints : 0;
      let efficiencyBadge = `
        <div class="text-center">
          <span class="text-xs sm:text-sm font-mono font-black ${effVal >= 90 ? "text-emerald-400" : effVal >= 75 ? "text-slate-300" : "text-amber-400"}">
            ${effVal}%
          </span>
          <div class="text-[10px] sm:text-xs text-slate-400 font-medium">${benchPtsVal.toFixed(1)} benched</div>
        </div>
      `;

      const avatarHtml = avatarUrl
        ? `<img src="${avatarUrl}" class="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-700 flex-shrink-0" alt="" onerror="this.remove()">`
        : "";

      tr.innerHTML = `
        <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">${rankBadge}</td>

        <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
          <div class="space-y-0.5 sm:space-y-1">
            <div class="font-mono text-sm sm:text-lg font-black ${r.rank <= 3 ? "text-emerald-400" : "text-white"}">
              ${r.points.toFixed(2)} <span class="text-[10px] sm:text-xs font-semibold text-slate-400">${isSeason ? "ppg" : "pts"}</span>
            </div>
            <div class="w-24 sm:w-36 bg-slate-800/90 rounded-full h-1 sm:h-1.5 overflow-hidden">
              <div class="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full" style="width: ${r.percentOfMax}%"></div>
            </div>
          </div>
        </td>

        <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
          <div class="flex items-center gap-2 sm:gap-3">
            ${avatarHtml}
            <div class="min-w-0">
              <span class="font-black text-xs sm:text-base text-slate-100 truncate block">
                ${escapeHtml(r.manager)}
              </span>
            </div>
          </div>
        </td>

        <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-[11px] sm:text-sm text-slate-300 font-medium truncate max-w-[140px] sm:max-w-[180px]">
          ${escapeHtml(r.teamName)}
        </td>

        <td class="py-2.5 sm:py-4 px-2 sm:px-4 text-slate-300 font-medium">
          <div class="text-[11px] sm:text-sm font-bold text-slate-200 break-words leading-snug max-w-[200px] sm:max-w-[260px]">
            ${escapeHtml(r.league)}
          </div>
        </td>

        <td class="py-2.5 sm:py-4 px-2 sm:px-4 text-center whitespace-nowrap">
          ${matchupPill}
        </td>

        <td class="py-2.5 sm:py-4 px-2 sm:px-4 text-center whitespace-nowrap">
          ${efficiencyBadge}
        </td>

        <td class="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center whitespace-nowrap">
          <button
            onclick="toggleRowExpand('${r.id}')"
            class="p-1.5 sm:p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition text-[10px] sm:text-xs font-mono font-bold border border-slate-800 cursor-pointer"
            title="Toggle Details"
          >
            ${isExpanded ? "▲" : "▼"}
          </button>
        </td>
      `;
      tableBody.appendChild(tr);

      if (isExpanded) {
        const detailTr = document.createElement("tr");
        detailTr.className = "bg-slate-950/90 border-b border-slate-800";

        if (isSeason) {
          detailTr.innerHTML = `
            <td colspan="8" class="p-5">
              <div class="glass-card rounded-xl p-5 border border-slate-800/80 space-y-3.5">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 flex-wrap gap-2">
                  <div class="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <span>📈 Season Consistency & Breakdown</span>
                  </div>
                  <div class="text-xs sm:text-sm text-slate-400 font-semibold">
                    Season High: <span class="font-black text-emerald-400 font-mono">${r.highScore.toFixed(2)} pts</span> • 
                    Season Low: <span class="font-black text-rose-400 font-mono">${r.lowScore.toFixed(2)} pts</span> • 
                    Consistency (Std Dev): <span class="font-black text-cyan-300 font-mono">±${r.stdDev}</span>
                  </div>
                </div>

                <div class="text-xs sm:text-sm text-slate-300">
                  <span class="font-bold text-slate-200">Weekly Score Progression:</span>
                  <div class="flex flex-wrap gap-2 mt-2">
                    ${(r.weeklyScores || [])
                      .map(
                        (pt, idx) => `
                      <span class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-slate-200">
                        W${idx + 1}: <span class="text-emerald-400 font-black">${parseFloat(pt || 0).toFixed(1)}</span>
                      </span>
                    `
                      )
                      .join("")}
                  </div>
                </div>
              </div>
            </td>
          `;
        } else {
          detailTr.innerHTML = `
            <td colspan="8" class="p-5">
              <div class="glass-card rounded-xl p-5 border border-slate-800/80 space-y-3.5">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 flex-wrap gap-2">
                  <div class="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <span>⚡ Starting Lineup vs Bench</span>
                    <span class="text-slate-400 font-normal">| Matchup #${r.matchupId || "N/A"}</span>
                  </div>
                  <div class="text-xs sm:text-sm text-slate-400 font-semibold">
                    Starters: <span class="font-black text-emerald-400 font-mono">${r.startersTotal.toFixed(2)} pts</span> • 
                    Bench: <span class="font-black text-slate-300 font-mono">${r.benchPoints.toFixed(2)} pts</span> • 
                    Optimal Potential: <span class="font-black text-amber-300 font-mono">${r.optimalPoints.toFixed(2)} pts</span> (${r.efficiency}% efficiency)
                  </div>
                </div>

                <div class="text-xs sm:text-sm text-slate-300">
                  <span class="font-bold text-slate-200">Starter Point Breakdown:</span>
                  <div class="flex flex-wrap gap-2 mt-2">
                    ${
                      r.startersPoints && r.startersPoints.length > 0
                        ? r.startersPoints
                            .map(
                              (pt, idx) => `
                        <span class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-slate-200">
                          S${idx + 1}: <span class="text-emerald-400 font-black">${parseFloat(pt || 0).toFixed(1)}</span>
                        </span>
                      `
                            )
                            .join("")
                        : '<span class="text-slate-500 italic">No individual starter data available.</span>'
                    }
                  </div>
                </div>
              </div>
            </td>
          `;
        }

        tableBody.appendChild(detailTr);
      }
    });
  }

  function renderCharts(records = getActiveRecords(), leagues = getActiveLeaguesMap()) {
    const textColor = "#cbd5e1";
    const gridColor = "rgba(255, 255, 255, 0.08)";

    const buckets = {
      "< 80": 0,
      "80 - 100": 0,
      "100 - 120": 0,
      "120 - 140": 0,
      "140 - 160": 0,
      "160+": 0
    };

    (records || []).forEach(r => {
      if (r.points < 80) buckets["< 80"]++;
      else if (r.points < 100) buckets["80 - 100"]++;
      else if (r.points < 120) buckets["100 - 120"]++;
      else if (r.points < 140) buckets["120 - 140"]++;
      else if (r.points < 160) buckets["140 - 160"]++;
      else buckets["160+"]++;
    });

    const distCtx = document.getElementById("scoreDistChart").getContext("2d");
    if (scoreDistChartInstance) scoreDistChartInstance.destroy();

    scoreDistChartInstance = new Chart(distCtx, {
      type: "bar",
      data: {
        labels: Object.keys(buckets),
        datasets: [
          {
            label: "Squads",
            data: Object.values(buckets),
            backgroundColor: [
              "rgba(6, 182, 212, 0.55)",
              "rgba(16, 185, 129, 0.55)",
              "rgba(52, 211, 153, 0.65)",
              "rgba(245, 158, 11, 0.65)",
              "rgba(249, 115, 22, 0.75)",
              "rgba(239, 68, 68, 0.85)"
            ],
            borderColor: ["#06b6d4", "#10b981", "#34d399", "#f59e0b", "#f97316", "#ef4444"],
            borderWidth: 1.5,
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0f172a",
            titleColor: "#f8fafc",
            bodyFont: { size: 13 },
            titleFont: { size: 13, weight: "bold" },
            borderColor: "rgba(255, 255, 255, 0.15)",
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: "Plus Jakarta Sans", size: 12, weight: "bold" }
            }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              precision: 0,
              font: { family: "Plus Jakarta Sans", size: 12 }
            },
            beginAtZero: true
          }
        }
      }
    });

    function wrapLabel(str, maxLen = 16, maxLines = 3) {
      if (!str) return "";
      const words = str.split(" ");
      const lines = [];
      let currentLine = "";
      for (const word of words) {
        if ((currentLine + (currentLine ? " " : "") + word).length <= maxLen) {
          currentLine += (currentLine ? " " : "") + word;
        } else {
          if (currentLine) lines.push(currentLine);
          if (word.length > maxLen) {
            let remaining = word;
            while (remaining.length > maxLen && lines.length < maxLines - 1) {
              lines.push(remaining.slice(0, maxLen));
              remaining = remaining.slice(maxLen);
            }
            currentLine = remaining;
          } else {
            currentLine = word;
          }
        }
        if (lines.length >= maxLines) break;
      }
      if (currentLine && lines.length < maxLines) {
        lines.push(currentLine);
      }
      return lines.length > 1 ? lines : lines[0] || str;
    }

    const rawLeagueNames = [];
    const leagueLabels = [];
    const leagueAverages = [];
    const leagueHighs = [];

    Object.keys(leagues || {}).forEach(lid => {
      const l = leagues[lid];
      const squadScores = (records || []).filter(r => r.leagueId === lid).map(r => r.points);
      const scores = l && l.scores && l.scores.length > 0 ? l.scores : squadScores;
      if (scores && scores.length > 0) {
        const name = (l && l.name) || `League ${lid}`;
        rawLeagueNames.push(name);
        leagueLabels.push(wrapLabel(name, 16, 3));
        const sum = scores.reduce((a, b) => a + b, 0);
        leagueAverages.push(Math.round((sum / scores.length) * 100) / 100);
        leagueHighs.push(Math.max(...scores));
      }
    });

    const avgCtx = document.getElementById("leagueAvgChart").getContext("2d");
    if (leagueAvgChartInstance) leagueAvgChartInstance.destroy();

    leagueAvgChartInstance = new Chart(avgCtx, {
      type: "bar",
      data: {
        labels: leagueLabels,
        datasets: [
          {
            label: currentMode === "SEASON_ROLLUP" ? "League Avg PPG" : "League Avg",
            data: leagueAverages,
            backgroundColor: "rgba(99, 102, 241, 0.65)",
            borderColor: "#6366f1",
            borderWidth: 1.5,
            borderRadius: 6
          },
          {
            label: "High Score",
            data: leagueHighs,
            backgroundColor: "rgba(16, 185, 129, 0.65)",
            borderColor: "#10b981",
            borderWidth: 1.5,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: textColor,
              font: { family: "Plus Jakarta Sans", size: 12, weight: "bold" }
            }
          },
          tooltip: {
            backgroundColor: "#0f172a",
            titleColor: "#f8fafc",
            bodyFont: { size: 13 },
            titleFont: { size: 13, weight: "bold" },
            borderColor: "rgba(255, 255, 255, 0.15)",
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              title: function (tooltipItems) {
                const idx = tooltipItems[0].dataIndex;
                return rawLeagueNames[idx] || "";
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: "Plus Jakarta Sans", size: 11, weight: "bold" },
              autoSkip: false,
              maxRotation: 0
            }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: "Plus Jakarta Sans", size: 12 } },
            beginAtZero: true
          }
        }
      }
    });
  }

  function renderLeagueGrid(records = getActiveRecords(), leagues = getActiveLeaguesMap()) {
    const grid = document.getElementById("leagueCardsGrid");
    grid.innerHTML = "";

    const leagueKeys = Object.keys(leagues || {});
    if (leagueKeys.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-400 glass-card rounded-2xl border border-slate-800 space-y-3">
          <div class="text-4xl">🏟️</div>
          <div class="font-bold text-lg text-slate-200">No leagues selected.</div>
          <div class="text-sm text-slate-400">Pick one or more leagues from the filter bar above to compare them here.</div>
        </div>
      `;
      return;
    }

    leagueKeys.forEach(lid => {
      const league = leagues[lid];
      const leagueTeams = (records || [])
        .filter(r => r.leagueId === lid)
        .sort((a, b) => b.points - a.points);
      if (leagueTeams.length === 0) return;

      const sum = leagueTeams.reduce((acc, r) => acc + r.points, 0);
      const avg = (sum / leagueTeams.length).toFixed(2);

      const card = document.createElement("div");
      card.className = "glass-card rounded-2xl p-6 border border-slate-800 space-y-4";
      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-800 pb-3.5 gap-3">
          <div class="min-w-0 flex-1">
            <h3 class="font-black text-base sm:text-lg text-white break-words line-clamp-2 leading-snug" title="${escapeHtml(league.name)}">${escapeHtml(league.name)}</h3>
            <div class="text-xs text-slate-400 font-medium mt-1">${leagueTeams.length} squads active</div>
          </div>
          <span class="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs sm:text-sm font-mono font-bold text-emerald-400 flex-shrink-0">
            Avg: ${avg}
          </span>
        </div>

        <div class="space-y-2.5">
          <div class="text-xs font-black uppercase tracking-wider text-slate-400">Top 5 Performers</div>
          <div class="space-y-2">
            ${leagueTeams
              .slice(0, 5)
              .map(
                (t, idx) => `
              <div class="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-900/70 border border-slate-800/60">
                <div class="flex items-center gap-2.5 truncate">
                  <span class="font-black ${idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-600" : "text-slate-400"}">#${idx + 1}</span>
                  <span class="truncate text-slate-200 font-semibold">${escapeHtml(t.manager)}</span>
                </div>
                <span class="font-mono font-black text-slate-100">${t.points.toFixed(2)}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  /**
   * Aggregate Players across all active leagues and teams
   */
  function aggregatePlayers(records = getActiveRecords()) {
    const isSeason = currentMode === "SEASON_ROLLUP";
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

      const targetWeekNum = parseInt(weekInput.value, 10) || 1;
      const aggregated = Object.values(playerMap).map(p => {
        const info = getPlayerInfo(p.id);
        const activeWeeks = Object.keys(p.weeklyScores).length;
        const gamesCount = activeWeeks > 0 ? activeWeeks : Math.max(1, targetWeekNum);
        const avgPpg = Math.round((p.totalPoints / gamesCount) * 100) / 100;
        const roundedTotal = Math.round(p.totalPoints * 100) / 100;
        const totalRostered = p.startedCount + p.benchedCount;
        const startRate =
          totalRostered > 0 ? Math.round((p.startedCount / totalRostered) * 100) : 0;
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

      lastAggregatedPlayers = aggregated;
      return aggregated;
    } else {
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

      const aggregated = Object.values(playerMap).map(p => {
        const info = getPlayerInfo(p.id);
        const totalRostered = p.startedCount + p.benchedCount;
        const startRate =
          totalRostered > 0 ? Math.round((p.startedCount / totalRostered) * 100) : 0;

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

      lastAggregatedPlayers = aggregated;
      return aggregated;
    }
  }

  function renderPlayerAnalytics(records = getActiveRecords(), _leagues = getActiveLeaguesMap()) {
    if (!positionalMvpDeck || !playerTableBody) return;

    const isSeason = currentMode === "SEASON_ROLLUP";
    if (playerSeasonBadge && seasonInput) {
      playerSeasonBadge.textContent = seasonInput.value;
    }
    if (playerWeekBadge) {
      playerWeekBadge.textContent = isSeason
        ? `Weeks 1 - ${weekInput.value} Rollup`
        : `Week ${weekInput.value}`;
    }

    const labelPoints = document.getElementById("labelPlayerPoints");
    if (labelPoints) {
      labelPoints.textContent = isSeason ? "Avg PPG" : "Points";
    }

    const allAggregated = aggregatePlayers(records);
    renderPositionalMvpDeck(allAggregated);
    renderPlayerLeaderboard(allAggregated);
  }

  function renderPositionalMvpDeck(allPlayers) {
    if (!positionalMvpDeck) return;
    positionalMvpDeck.innerHTML = "";

    const isSeason = currentMode === "SEASON_ROLLUP";
    const mvpSlots = [
      {
        pos: "QB",
        label: "Top QB",
        icon: "🎯",
        color: "text-rose-400",
        bg: "from-rose-500/20 via-slate-900/90 to-transparent",
        border: "border-rose-500/30"
      },
      {
        pos: "RB",
        label: "Top RB",
        icon: "⚡",
        color: "text-cyan-400",
        bg: "from-cyan-500/20 via-slate-900/90 to-transparent",
        border: "border-cyan-500/30"
      },
      {
        pos: "WR",
        label: "Top WR",
        icon: "🔥",
        color: "text-emerald-400",
        bg: "from-emerald-500/20 via-slate-900/90 to-transparent",
        border: "border-emerald-500/30"
      },
      {
        pos: "TE",
        label: "Top TE",
        icon: "🛡️",
        color: "text-amber-400",
        bg: "from-amber-500/20 via-slate-900/90 to-transparent",
        border: "border-amber-500/30"
      },
      {
        pos: "K",
        label: "Top K",
        icon: "👟",
        color: "text-purple-400",
        bg: "from-purple-500/20 via-slate-900/90 to-transparent",
        border: "border-purple-500/30"
      },
      {
        pos: "DEF",
        label: "Top DEF",
        icon: "🏰",
        color: "text-slate-300",
        bg: "from-slate-700/30 via-slate-900/90 to-transparent",
        border: "border-slate-600/40"
      }
    ];

    mvpSlots.forEach(slot => {
      const candidates = (allPlayers || [])
        .filter(p => p.pos === slot.pos)
        .sort((a, b) => (b.points || 0) - (a.points || 0));
      const topPlayer = candidates[0];

      const card = document.createElement("div");
      card.className = `glass-card rounded-2xl p-4 flex flex-col justify-between border ${slot.border} bg-gradient-to-b ${slot.bg} transition hover:scale-[1.02] duration-200`;

      if (topPlayer && topPlayer.points > 0) {
        const bestOwner = topPlayer.owners && topPlayer.owners[0];
        const avatarImg = topPlayer.headshotUrl
          ? `<img src="${topPlayer.headshotUrl}" class="w-10 h-10 rounded-full object-cover border border-slate-700 bg-slate-800 flex-shrink-0" alt="" onerror="this.remove()">`
          : "";

        const titleComponent = createCardTitleWithInfo(
          `${slot.icon} ${slot.label}`,
          `Highest scoring ${slot.pos} across all participating leagues for this matchup period.`,
          `text-xs font-black uppercase tracking-wider ${slot.color} hover:underline`
        );

        card.innerHTML = `
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            ${titleComponent}
            <span class="text-xs font-mono font-bold text-slate-400">${escapeHtml(topPlayer.team || "FA")}</span>
          </div>

          <div class="my-2.5 flex items-center gap-2.5">
            ${avatarImg}
            <div class="min-w-0 flex-1">
              <div class="font-black text-sm text-white truncate" title="${escapeHtml(topPlayer.name)}">${escapeHtml(topPlayer.name)}</div>
              <div class="text-[11px] text-slate-400 font-semibold truncate">${escapeHtml(topPlayer.pos)} • ${topPlayer.startRate}% Started</div>
            </div>
          </div>

          <div class="pt-2 border-t border-white/10 flex items-end justify-between">
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-400">${isSeason ? "Avg PPG" : "Points"}</div>
              <div class="text-xl font-mono font-black ${slot.color}">${topPlayer.points.toFixed(2)}</div>
            </div>
            ${
              bestOwner
                ? `
              <div class="text-[10px] text-slate-400 text-right truncate max-w-[120px]" title="Rostered by ${escapeHtml(bestOwner.manager)} in ${escapeHtml(bestOwner.league)}">
                <span class="text-slate-500 block">Top Owner</span>
                <span class="font-bold text-slate-300 truncate block">${escapeHtml(bestOwner.manager)}</span>
                <span class="text-slate-400 truncate block text-[10px]">🏆 ${escapeHtml(bestOwner.league)}</span>
              </div>
            `
                : ""
            }
          </div>
        `;
      } else {
        const titleComponent = createCardTitleWithInfo(
          `${slot.icon} ${slot.label}`,
          `Highest scoring ${slot.pos} across all participating leagues for this matchup period.`,
          `text-xs font-black uppercase tracking-wider ${slot.color} hover:underline`
        );

        card.innerHTML = `
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            ${titleComponent}
          </div>
          <div class="py-6 text-center text-xs text-slate-500 italic">No ${slot.pos} data recorded yet.</div>
        `;
      }

      positionalMvpDeck.appendChild(card);
    });
  }

  window.setPlayerPageSize = function (size) {
    currentPlayerPageSize = size === "all" ? Infinity : parseInt(size, 10);
    currentPlayerPage = 1;
    renderPlayerLeaderboard();
  };

  window.changePlayerPage = function (delta) {
    currentPlayerPage += delta;
    renderPlayerLeaderboard();
  };

  window.goToPlayerPage = function (page) {
    currentPlayerPage = page;
    renderPlayerLeaderboard();
  };

  function renderPlayerLeaderboard(allPlayers) {
    if (!playerTableBody) return;
    playerTableBody.innerHTML = "";

    const playerList =
      allPlayers ||
      (lastAggregatedPlayers.length > 0
        ? lastAggregatedPlayers
        : aggregatePlayers(getActiveRecords()));
    const isSeason = currentMode === "SEASON_ROLLUP";
    const q = currentPlayerSearch.toLowerCase().trim();

    let filtered = (playerList || []).filter(p => {
      // 1. Position Filter
      if (currentPlayerPositionFilter === "FLEX") {
        if (!["RB", "WR", "TE"].includes(p.pos)) return false;
      } else if (currentPlayerPositionFilter !== "ALL") {
        if (p.pos !== currentPlayerPositionFilter) return false;
      }

      // 2. Status Filter
      if (currentPlayerStatusFilter === "STARTERS" && p.startedCount === 0) return false;
      if (currentPlayerStatusFilter === "BENCH" && p.benchedCount === 0) return false;

      // 3. Search Query
      if (q) {
        const matchName = p.name.toLowerCase().includes(q);
        const matchTeam = (p.team || "").toLowerCase().includes(q);
        const matchOwner = (p.owners || []).some(
          o =>
            (o.manager || "").toLowerCase().includes(q) ||
            (o.league || "").toLowerCase().includes(q)
        );
        if (!matchName && !matchTeam && !matchOwner) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let vA = a[currentPlayerSortColumn];
      let vB = b[currentPlayerSortColumn];

      if (typeof vA === "number" || typeof vB === "number") {
        vA = typeof vA === "number" ? vA : 0;
        vB = typeof vB === "number" ? vB : 0;
      } else if (typeof vA === "string" || typeof vB === "string") {
        vA = (vA || "").toLowerCase();
        vB = (vB || "").toLowerCase();
      }

      if (vA < vB) return currentPlayerSortAsc ? -1 : 1;
      if (vA > vB) return currentPlayerSortAsc ? 1 : -1;
      return 0;
    });

    if (playerRowCount) {
      playerRowCount.textContent = `Showing ${filtered.length} of ${playerList.length} players across selected leagues`;
    }

    if (filtered.length === 0) {
      if (noPlayersFound) {
        noPlayersFound.classList.remove("hidden");
        if (playerList.length === 0) {
          noPlayersFound.innerHTML = `
            <div class="text-3xl">🏈</div>
            <div class="font-bold text-slate-200">No player data available.</div>
            <div class="text-xs text-slate-400">Click "Fetch Cross-League Stats" above to load roster and player scores.</div>
          `;
        } else {
          noPlayersFound.innerHTML = `
            <div class="text-3xl">🏈</div>
            <div class="font-bold text-slate-200">No players match the current filters.</div>
            <div class="text-xs text-slate-500">Try changing the position filter or search terms.</div>
          `;
        }
      }
      const pageInfo = document.getElementById("playerPageInfoText");
      if (pageInfo) pageInfo.textContent = "Showing 0 of 0";
      const btnPrev = document.getElementById("btnPrevPlayerPage");
      const btnNext = document.getElementById("btnNextPlayerPage");
      if (btnPrev) btnPrev.disabled = true;
      if (btnNext) btnNext.disabled = true;
      const pageBtnContainer = document.getElementById("playerPageNumberButtons");
      if (pageBtnContainer) pageBtnContainer.innerHTML = "";
      return;
    }
    if (noPlayersFound) noPlayersFound.classList.add("hidden");

    const totalCount = filtered.length;
    const pageSize = currentPlayerPageSize === Infinity ? totalCount : currentPlayerPageSize;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    if (currentPlayerPage > totalPages) currentPlayerPage = totalPages;
    if (currentPlayerPage < 1) currentPlayerPage = 1;
    const startIdx = (currentPlayerPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalCount);
    const pageSlice = filtered.slice(startIdx, endIdx);

    const pageInfo = document.getElementById("playerPageInfoText");
    if (pageInfo)
      pageInfo.textContent =
        totalCount === 0 ? "Showing 0 of 0" : `Showing ${startIdx + 1}–${endIdx} of ${totalCount}`;
    const btnPrev = document.getElementById("btnPrevPlayerPage");
    const btnNext = document.getElementById("btnNextPlayerPage");
    if (btnPrev) btnPrev.disabled = currentPlayerPage <= 1 || totalCount === 0;
    if (btnNext) btnNext.disabled = currentPlayerPage >= totalPages || totalCount === 0;
    renderPaginationButtons(
      "playerPageNumberButtons",
      totalPages,
      currentPlayerPage,
      "goToPlayerPage"
    );

    pageSlice.forEach((p, idx) => {
      const rank = startIdx + idx + 1;
      const tr = document.createElement("tr");
      tr.className = "transition-colors hover:bg-slate-800/60";
      const isExpanded = expandedPlayerIds.has(p.id);

      const avatarHtml = p.headshotUrl
        ? `<img src="${p.headshotUrl}" class="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-800 flex-shrink-0" alt="" onerror="this.remove()">`
        : "";

      // Managers Badge List (first 3 + overflow)
      const visibleOwners = (p.owners || []).slice(0, 3);
      const remainingCount = (p.owners || []).length - visibleOwners.length;

      const ownersHtml =
        p.owners && p.owners.length > 0
          ? `
          <div class="flex flex-wrap items-center gap-1.5 max-w-md">
            ${visibleOwners
              .map(
                o => `
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${o.isStarter || o.starts > 0 ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30" : "bg-slate-900 text-slate-300 border border-slate-800"}">
                <span>${o.isStarter || o.starts > 0 ? "🟢" : "🪑"}</span>
                <span class="truncate max-w-[110px]" title="${escapeHtml(o.manager)} • ${escapeHtml(o.league)}">${escapeHtml(o.manager)}</span>
              </span>
            `
              )
              .join("")}
            ${
              remainingCount > 0
                ? `
              <span class="text-xs font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">+${remainingCount} more</span>
            `
                : ""
            }
          </div>
        `
          : `<span class="text-xs text-slate-500 italic">Free Agent / Unrostered</span>`;

      tr.innerHTML = `
        <td class="py-2.5 sm:py-4 px-2 sm:px-4 text-center whitespace-nowrap font-mono font-black text-xs sm:text-sm ${rank <= 3 ? "text-amber-400" : "text-slate-400"}">
          #${rank}
        </td>

        <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
          <div class="flex items-center gap-2 sm:gap-3">
            ${avatarHtml}
            <div class="min-w-0">
              <span class="font-black text-xs sm:text-base text-slate-100 truncate block">
                ${escapeHtml(p.name)}
              </span>
              <span class="text-[10px] sm:text-xs text-slate-400 font-semibold block">
                ${escapeHtml(p.team || "FA")} • ${escapeHtml(p.pos)}
              </span>
            </div>
          </div>
        </td>

        <td class="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center whitespace-nowrap">
          ${getPlayerPositionBadge(p.pos)}
        </td>

        <td class="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center whitespace-nowrap text-[11px] sm:text-xs font-bold text-slate-300 font-mono">
          ${escapeHtml(p.team || "FA")}
        </td>

        <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
          <div class="font-mono text-sm sm:text-lg font-black text-emerald-400">
            ${p.points.toFixed(2)} <span class="text-[10px] sm:text-xs font-semibold text-slate-400">${isSeason ? "ppg" : "pts"}</span>
          </div>
          ${
            isSeason && p.totalPoints !== undefined
              ? `
            <div class="text-[10px] sm:text-xs text-slate-400 font-mono">${p.totalPoints.toFixed(1)} total • ${p.gamesCount} wks</div>
          `
              : ""
          }
        </td>

        <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-center">
          <div class="space-y-0.5 sm:space-y-1 inline-block text-left">
            <div class="text-[10px] sm:text-xs font-mono font-bold text-slate-200">
              ${p.startRate}% <span class="text-slate-500 font-normal">(${p.startedCount}/${p.startedCount + p.benchedCount})</span>
            </div>
            <div class="w-16 sm:w-20 bg-slate-800 rounded-full h-1 sm:h-1.5 overflow-hidden">
              <div class="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full" style="width: ${p.startRate}%"></div>
            </div>
          </div>
        </td>

        <td class="py-2.5 sm:py-4 px-2 sm:px-4">
          ${ownersHtml}
        </td>

        <td class="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center whitespace-nowrap">
          <button
            onclick="togglePlayerRowExpand('${p.id}')"
            class="p-1.5 sm:p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition text-[10px] sm:text-xs font-mono font-bold border border-slate-800 cursor-pointer"
            title="Toggle Roster Exposure Breakdown"
          >
            ${isExpanded ? "▲" : "▼"}
          </button>
        </td>
      `;

      playerTableBody.appendChild(tr);

      if (isExpanded) {
        const detailTr = document.createElement("tr");
        detailTr.className = "bg-slate-950/90 border-b border-slate-800";
        detailTr.innerHTML = `
          <td colspan="8" class="p-5">
            <div class="glass-card rounded-xl p-5 border border-slate-800/80 space-y-4">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 flex-wrap gap-2">
                <div class="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <span>🏈 ${escapeHtml(p.name)} (${escapeHtml(p.pos)} - ${escapeHtml(p.team || "FA")})</span>
                  <span class="text-slate-400 font-normal">| Cross-League Roster Exposure</span>
                </div>
                <div class="text-xs sm:text-sm text-slate-400 font-semibold font-mono">
                  Started: <span class="text-emerald-400 font-black">${p.startedCount}</span> • 
                  Benched: <span class="text-amber-400 font-black">${p.benchedCount}</span> • 
                  Start Rate: <span class="text-cyan-300 font-black">${p.startRate}%</span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                ${(p.owners || [])
                  .map(
                    o => `
                  <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                    <div class="min-w-0 flex-1">
                      <div class="font-black text-sm text-white truncate">${escapeHtml(o.manager)}</div>
                      <div class="text-xs text-slate-400 truncate">${escapeHtml(o.teamName)}</div>
                      <div class="text-[11px] text-slate-400 font-bold mt-1 flex items-center gap-1 truncate">
                        <span>🏆</span>
                        <span class="truncate">${escapeHtml(o.league)}</span>
                      </div>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <span class="px-2 py-0.5 rounded-full text-xs font-black ${o.isStarter || o.starts > 0 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}">
                        ${o.isStarter || o.starts > 0 ? "🟢 Starter" : "🪑 Bench"}
                      </span>
                      ${
                        o.starts !== undefined && o.benches !== undefined
                          ? `
                        <div class="text-[10px] text-slate-500 font-mono mt-1">${o.starts} starts / ${o.benches} bench</div>
                      `
                          : ""
                      }
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          </td>
        `;
        playerTableBody.appendChild(detailTr);
      }
    });
  }

  window.setPlayerPositionFilter = function (pos) {
    currentPlayerPositionFilter = pos;
    const posKeys = ["ALL", "QB", "RB", "WR", "TE", "FLEX", "K", "DEF"];
    posKeys.forEach(k => {
      const btn = document.getElementById(`posFilter${k}`);
      if (btn) {
        if (k === pos) {
          btn.className =
            "px-3 py-1.5 rounded-lg text-xs font-black transition bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-pointer";
        } else {
          btn.className =
            "px-3 py-1.5 rounded-lg text-xs font-black text-slate-400 hover:text-white transition cursor-pointer";
        }
      }
    });
    currentPlayerPage = 1;
    renderPlayerLeaderboard();
  };

  window.togglePlayerRowExpand = function (pid) {
    if (expandedPlayerIds.has(pid)) {
      expandedPlayerIds.delete(pid);
    } else {
      expandedPlayerIds.add(pid);
    }
    renderPlayerLeaderboard();
  };

  window.sortPlayers = function (col) {
    if (currentPlayerSortColumn === col) {
      currentPlayerSortAsc = !currentPlayerSortAsc;
    } else {
      currentPlayerSortColumn = col;
      currentPlayerSortAsc = false;
    }

    const iconPts = document.getElementById("sortIconPlayerPoints");
    const iconRate = document.getElementById("sortIconPlayerStartRate");
    if (iconPts) {
      iconPts.textContent =
        currentPlayerSortColumn === "points" ? (currentPlayerSortAsc ? "▲" : "▼") : "";
      iconPts.className =
        currentPlayerSortColumn === "points"
          ? "text-xs text-emerald-400"
          : "text-xs text-slate-500";
    }
    if (iconRate) {
      iconRate.textContent =
        currentPlayerSortColumn === "startRate" ? (currentPlayerSortAsc ? "▲" : "▼") : "";
      iconRate.className =
        currentPlayerSortColumn === "startRate"
          ? "text-xs text-emerald-400"
          : "text-xs text-slate-500";
    }

    currentPlayerPage = 1;
    renderPlayerLeaderboard();
  };

  let currentLuckSortColumn = "Luck";
  let currentLuckSortAsc = false;
  let currentLuckCategory = "ALL";
  let currentLuckSearch = "";
  let currentLuckPage = 1;
  let currentLuckPageSize = 25;

  function renderLuckAnalytics(records = getActiveRecords(), _leagues = getActiveLeaguesMap()) {
    if (!records || records.length === 0) return;

    // 1. Superlatives Cards
    const sortedByLuckDesc = [...records].sort((a, b) => (b.luckIndex || 0) - (a.luckIndex || 0));
    const sortedByLuckAsc = [...records].sort((a, b) => (a.luckIndex || 0) - (b.luckIndex || 0));
    const sortedByAllPlay = [...records].sort((a, b) => {
      const pctDiff = (b.allPlayWinPct || 0) - (a.allPlayWinPct || 0);
      if (pctDiff !== 0) return pctDiff;
      const ptsA = typeof a.totalPoints === "number" ? a.totalPoints : a.points || 0;
      const ptsB = typeof b.totalPoints === "number" ? b.totalPoints : b.points || 0;
      return ptsB - ptsA;
    });
    const sortedByPA = [...records].sort((a, b) => (b.pointsAgainst || 0) - (a.pointsAgainst || 0));

    const luckiest = sortedByLuckDesc[0];
    const unluckiest = sortedByLuckAsc[0];
    const allPlayLeader = sortedByAllPlay[0];
    const toughest = sortedByPA[0];

    const isSeason = currentMode === "SEASON_ROLLUP";

    const cardLuckiest = document.getElementById("luckLuckiestCard");
    const cardUnluckiest = document.getElementById("luckUnluckiestCard");
    const cardAllPlay = document.getElementById("luckAllPlayLeaderCard");
    const cardToughest = document.getElementById("luckToughestCard");

    if (luckiest) {
      const valEl = document.getElementById("statLuckiestVal");
      const teamEl = document.getElementById("statLuckiestTeam");
      const leagueEl = document.getElementById("statLuckiestLeague");
      const subEl = document.getElementById("statLuckiestSub");
      const luckVal = luckiest.luckIndex || 0;
      const luckStr = `${luckVal >= 0 ? "+" : ""}${luckVal.toFixed(2)}`;
      const expStr = (luckiest.expectedWins || 0).toFixed(2);
      const actStr = isSeason
        ? `${luckiest.wins} wins`
        : luckiest.outcome === "win"
          ? "1.0 win"
          : luckiest.outcome === "tie"
            ? "0.5 win"
            : "0.0 wins";

      if (valEl) {
        valEl.textContent = luckStr;
        valEl.title = `Luck Index: ${luckStr} (${actStr} actual vs ${expStr} expected wins)`;
      }
      if (teamEl) {
        teamEl.textContent = `${luckiest.manager} - ${luckiest.teamName}`;
        teamEl.title = `${luckiest.manager} (${luckiest.teamName})`;
      }
      if (leagueEl) {
        leagueEl.innerHTML = `<span>🏆</span> <span class="truncate">${escapeHtml(luckiest.league)}</span>`;
        leagueEl.title = `League: ${luckiest.league}`;
      }
      if (subEl) {
        subEl.textContent = isSeason
          ? `${luckiest.wins}W-${luckiest.losses}L (${luckiest.winPct}%) • ${luckiest.allPlayWins}W-${luckiest.allPlayLosses}L All-Play`
          : `${luckiest.outcome === "win" ? "Won Matchup" : "Lost Matchup"} • Exp: ${expStr} Wins`;
        subEl.title = isSeason
          ? `Season Record: ${luckiest.wins}W-${luckiest.losses}L vs All-Play: ${luckiest.allPlayWins}W-${luckiest.allPlayLosses}L (${luckiest.allPlayWinPct}% win rate)`
          : `Matchup: ${luckiest.outcome === "win" ? "Won" : "Lost"} vs Exp Wins: ${expStr}`;
      }
      if (cardLuckiest) {
        cardLuckiest.setAttribute(
          "title",
          `Luckiest Squad 🍀: Awarded to ${luckiest.manager} in ${luckiest.league}. Gained ${luckStr} bonus wins above All-Play expectation (${actStr} vs ${expStr} expected).`
        );
      }
    }

    if (unluckiest) {
      const valEl = document.getElementById("statUnluckiestVal");
      const teamEl = document.getElementById("statUnluckiestTeam");
      const leagueEl = document.getElementById("statUnluckiestLeague");
      const subEl = document.getElementById("statUnluckiestSub");
      const luckVal = unluckiest.luckIndex || 0;
      const luckStr = `${luckVal >= 0 ? "+" : ""}${luckVal.toFixed(2)}`;
      const expStr = (unluckiest.expectedWins || 0).toFixed(2);
      const actStr = isSeason
        ? `${unluckiest.wins} wins`
        : unluckiest.outcome === "win"
          ? "1.0 win"
          : unluckiest.outcome === "tie"
            ? "0.5 win"
            : "0.0 wins";

      if (valEl) {
        valEl.textContent = luckStr;
        valEl.title = `Luck Index: ${luckStr} (${actStr} actual vs ${expStr} expected wins)`;
      }
      if (teamEl) {
        teamEl.textContent = `${unluckiest.manager} - ${unluckiest.teamName}`;
        teamEl.title = `${unluckiest.manager} (${unluckiest.teamName})`;
      }
      if (leagueEl) {
        leagueEl.innerHTML = `<span>🏆</span> <span class="truncate">${escapeHtml(unluckiest.league)}</span>`;
        leagueEl.title = `League: ${unluckiest.league}`;
      }
      if (subEl) {
        subEl.textContent = isSeason
          ? `${unluckiest.wins}W-${unluckiest.losses}L (${unluckiest.winPct}%) • ${unluckiest.allPlayWins}W-${unluckiest.allPlayLosses}L All-Play`
          : `${unluckiest.outcome === "win" ? "Won Matchup" : "Lost Matchup"} • Exp: ${expStr} Wins`;
        subEl.title = isSeason
          ? `Season Record: ${unluckiest.wins}W-${unluckiest.losses}L vs All-Play: ${unluckiest.allPlayWins}W-${unluckiest.allPlayLosses}L (${unluckiest.allPlayWinPct}% win rate)`
          : `Matchup: ${unluckiest.outcome === "win" ? "Won" : "Lost"} vs Exp Wins: ${expStr}`;
      }
      if (cardUnluckiest) {
        cardUnluckiest.setAttribute(
          "title",
          `Unluckiest Squad 💔 (Tough Schedule): Awarded to ${unluckiest.manager} in ${unluckiest.league}. Underperformed All-Play expectation by ${Math.abs(luckVal).toFixed(2)} wins due to brutal opponent scores (${actStr} vs ${expStr} expected).`
        );
      }
    }

    if (allPlayLeader) {
      const valEl = document.getElementById("statAllPlayLeaderVal");
      const teamEl = document.getElementById("statAllPlayLeaderTeam");
      const leagueEl = document.getElementById("statAllPlayLeaderLeague");
      const subEl = document.getElementById("statAllPlayLeaderSub");

      if (valEl) {
        valEl.textContent = `${allPlayLeader.allPlayWinPct || 0}%`;
        valEl.title = `All-Play Win Rate: ${allPlayLeader.allPlayWinPct || 0}% (${allPlayLeader.allPlayWins}W - ${allPlayLeader.allPlayLosses}L${allPlayLeader.allPlayTies > 0 ? ` - ${allPlayLeader.allPlayTies}T` : ""})`;
      }
      if (teamEl) {
        teamEl.textContent = `${allPlayLeader.manager} - ${allPlayLeader.teamName}`;
        teamEl.title = `${allPlayLeader.manager} (${allPlayLeader.teamName})`;
      }
      if (leagueEl) {
        leagueEl.innerHTML = `<span>🏆</span> <span class="truncate">${escapeHtml(allPlayLeader.league)}</span>`;
        leagueEl.title = `League: ${allPlayLeader.league}`;
      }
      if (subEl) {
        subEl.textContent = isSeason
          ? `${allPlayLeader.allPlayWins}W-${allPlayLeader.allPlayLosses}L All-Play • ${(allPlayLeader.totalPoints || 0).toFixed(1)} PF`
          : `${allPlayLeader.allPlayWins}W-${allPlayLeader.allPlayLosses}L All-Play • ${(allPlayLeader.points || 0).toFixed(1)} pts`;
        subEl.title = `Simulated across all league rivals: ${allPlayLeader.allPlayWins} wins, ${allPlayLeader.allPlayLosses} losses`;
      }
      if (cardAllPlay) {
        cardAllPlay.setAttribute(
          "title",
          `All-Play Powerhouse 👑 (True Dominance): Awarded to ${allPlayLeader.manager} in ${allPlayLeader.league} for achieving the highest All-Play win rate (${allPlayLeader.allPlayWinPct}%).`
        );
      }
    }

    if (toughest) {
      const valEl = document.getElementById("statToughestVal");
      const teamEl = document.getElementById("statToughestTeam");
      const leagueEl = document.getElementById("statToughestLeague");
      const subEl = document.getElementById("statToughestSub");
      const paStr = `${(toughest.pointsAgainst || 0).toFixed(1)} pts`;

      if (valEl) {
        valEl.textContent = paStr;
        valEl.title = `Points Against: ${(toughest.pointsAgainst || 0).toFixed(2)} pts ${isSeason ? "per game avg" : "allowed in matchup"}`;
      }
      if (teamEl) {
        teamEl.textContent = `${toughest.manager} - ${toughest.teamName}`;
        teamEl.title = `${toughest.manager} (${toughest.teamName})`;
      }
      if (leagueEl) {
        leagueEl.innerHTML = `<span>🏆</span> <span class="truncate">${escapeHtml(toughest.league)}</span>`;
        leagueEl.title = `League: ${toughest.league}`;
      }
      if (subEl) {
        subEl.textContent = isSeason
          ? `Avg Opponent Score (PA)`
          : `Opponent: ${toughest.opponentName || "Opp"}`;
        subEl.title = isSeason
          ? `Highest average opponent score across all weeks: ${(toughest.pointsAgainst || 0).toFixed(2)} PPG`
          : `Opponent score: ${(toughest.pointsAgainst || 0).toFixed(2)} pts`;
      }
      if (cardToughest) {
        cardToughest.setAttribute(
          "title",
          `Toughest Opponents 🛡️ (Highest PA): Awarded to ${toughest.manager} in ${toughest.league} for enduring the most difficult opponent scoring schedule (${(toughest.pointsAgainst || 0).toFixed(2)} pts avg).`
        );
      }
    }

    // 2. Filter & Render Luck Table
    renderLuckTable(records);
  }

  window.setLuckPageSize = function (size) {
    currentLuckPageSize = size === "all" ? Infinity : parseInt(size, 10);
    currentLuckPage = 1;
    renderLuckTable();
  };

  window.changeLuckPage = function (delta) {
    currentLuckPage += delta;
    renderLuckTable();
  };

  window.goToLuckPage = function (page) {
    currentLuckPage = page;
    renderLuckTable();
  };

  window.sortLuckTable = function (col) {
    if (currentLuckSortColumn === col) {
      currentLuckSortAsc = !currentLuckSortAsc;
    } else {
      currentLuckSortColumn = col;
      currentLuckSortAsc = col === "Rank" || col === "Manager" || col === "League";
    }
    currentLuckPage = 1;
    renderLuckTable();
  };

  function renderLuckTable(records = getActiveRecords()) {
    const tableBody = document.getElementById("luckTableBody");
    const rowCount = document.getElementById("luckRowCount");
    const noLuckFound = document.getElementById("noLuckFound");
    if (!tableBody) return;

    const isSeason = currentMode === "SEASON_ROLLUP";

    let filtered = (records || []).filter(r => {
      const luckVal = r.luckIndex || 0;
      if (currentLuckCategory === "LUCKY" && luckVal <= 0.5) return false;
      if (currentLuckCategory === "FAIR" && (luckVal < -0.5 || luckVal > 0.5)) return false;
      if (currentLuckCategory === "UNLUCKY" && luckVal >= -0.5) return false;

      if (currentLuckSearch) {
        const q = currentLuckSearch.toLowerCase();
        return (
          (r.manager || "").toLowerCase().includes(q) ||
          (r.teamName || "").toLowerCase().includes(q) ||
          (r.league || "").toLowerCase().includes(q)
        );
      }
      return true;
    });

    // Update Header Sort Icons
    ["Rank", "Manager", "League", "Actual", "AllPlay", "Expected", "Luck", "PF", "PA"].forEach(
      col => {
        const icon = document.getElementById(`sortIconLuck${col}`);
        if (icon) {
          if (currentLuckSortColumn === col) {
            icon.textContent = currentLuckSortAsc ? "▲" : "▼";
            icon.className = "text-xs text-emerald-400";
          } else {
            icon.textContent = "";
            icon.className = "text-xs text-slate-500";
          }
        }
      }
    );

    filtered.sort((a, b) => {
      let valA, valB;
      if (currentLuckSortColumn === "Rank") {
        valA = a.rank || 0;
        valB = b.rank || 0;
      } else if (currentLuckSortColumn === "Manager") {
        valA = (a.manager || "").toLowerCase();
        valB = (b.manager || "").toLowerCase();
      } else if (currentLuckSortColumn === "League") {
        valA = (a.league || "").toLowerCase();
        valB = (b.league || "").toLowerCase();
      } else if (currentLuckSortColumn === "Actual") {
        valA = typeof a.winPct === "number" ? a.winPct : a.actualWins || 0;
        valB = typeof b.winPct === "number" ? b.winPct : b.actualWins || 0;
      } else if (currentLuckSortColumn === "AllPlay") {
        valA = a.allPlayWinPct || 0;
        valB = b.allPlayWinPct || 0;
      } else if (currentLuckSortColumn === "Expected") {
        valA = a.expectedWins || 0;
        valB = b.expectedWins || 0;
      } else if (currentLuckSortColumn === "Luck") {
        valA = a.luckIndex || 0;
        valB = b.luckIndex || 0;
      } else if (currentLuckSortColumn === "PF") {
        valA = a.points || 0;
        valB = b.points || 0;
      } else if (currentLuckSortColumn === "PA") {
        valA = a.pointsAgainst || 0;
        valB = b.pointsAgainst || 0;
      } else {
        valA = a.luckIndex || 0;
        valB = b.luckIndex || 0;
      }

      if (valA < valB) return currentLuckSortAsc ? -1 : 1;
      if (valA > valB) return currentLuckSortAsc ? 1 : -1;

      // Tie-breaker: rank highest scoring squad first (or lowest if ascending)
      const ptsA = typeof a.totalPoints === "number" ? a.totalPoints : a.points || 0;
      const ptsB = typeof b.totalPoints === "number" ? b.totalPoints : b.points || 0;
      return currentLuckSortAsc ? ptsA - ptsB : ptsB - ptsA;
    });

    if (rowCount) {
      rowCount.textContent = `Showing ${filtered.length} of ${(records || []).length} squads across ${selectedLeagueIds.size} leagues`;
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = "";
      if (noLuckFound) noLuckFound.classList.remove("hidden");
      const pageInfo = document.getElementById("luckPageInfoText");
      if (pageInfo) pageInfo.textContent = "Showing 0 of 0";
      const btnPrev = document.getElementById("btnPrevLuckPage");
      const btnNext = document.getElementById("btnNextLuckPage");
      if (btnPrev) btnPrev.disabled = true;
      if (btnNext) btnNext.disabled = true;
      const pageBtnContainer = document.getElementById("luckPageNumberButtons");
      if (pageBtnContainer) pageBtnContainer.innerHTML = "";
      return;
    }
    if (noLuckFound) noLuckFound.classList.add("hidden");

    tableBody.innerHTML = "";

    const totalCount = filtered.length;
    const pageSize = currentLuckPageSize === Infinity ? totalCount : currentLuckPageSize;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    if (currentLuckPage > totalPages) currentLuckPage = totalPages;
    if (currentLuckPage < 1) currentLuckPage = 1;
    const startIdx = (currentLuckPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalCount);
    const pageSlice = filtered.slice(startIdx, endIdx);

    const pageInfo = document.getElementById("luckPageInfoText");
    if (pageInfo)
      pageInfo.textContent =
        totalCount === 0 ? "Showing 0 of 0" : `Showing ${startIdx + 1}–${endIdx} of ${totalCount}`;
    const btnPrev = document.getElementById("btnPrevLuckPage");
    const btnNext = document.getElementById("btnNextLuckPage");
    if (btnPrev) btnPrev.disabled = currentLuckPage <= 1 || totalCount === 0;
    if (btnNext) btnNext.disabled = currentLuckPage >= totalPages || totalCount === 0;
    renderPaginationButtons("luckPageNumberButtons", totalPages, currentLuckPage, "goToLuckPage");

    pageSlice.forEach((r, idx) => {
      const rankNum = startIdx + idx + 1;
      const tr = document.createElement("tr");
      tr.className = "transition-colors hover:bg-slate-800/60";

      const avatarUrl = getAvatarUrl(r.avatar);
      const avatarHtml = avatarUrl
        ? `<img src="${avatarUrl}" class="w-8 h-8 rounded-full object-cover border border-slate-700 flex-shrink-0" alt="" onerror="this.remove()">`
        : "";

      // Actual Record Pill with detailed tooltip
      let actualRecordHtml = "";
      if (isSeason) {
        const actWins = r.wins || 0;
        const actLosses = r.losses || 0;
        const actTies = r.ties || 0;
        actualRecordHtml = `
          <div class="text-center" title="Actual Head-to-Head Record: ${actWins}W - ${actLosses}L${actTies > 0 ? ` - ${actTies}T` : ""} (${r.winPct}% win rate)">
            <span class="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-black ${r.winPct >= 60 ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : r.winPct >= 40 ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-rose-500/15 text-rose-300 border border-rose-500/30"}">
              ${actWins}W - ${actLosses}L${actTies > 0 ? ` - ${actTies}T` : ""}
            </span>
            <div class="text-[10px] sm:text-xs text-slate-400 font-mono mt-0.5 font-medium">${r.winPct}%</div>
          </div>
        `;
      } else {
        const outcomeDesc =
          r.outcome === "win"
            ? `Won Matchup (+${Math.abs(r.margin || 0).toFixed(1)} pts vs ${r.opponentName || "Opponent"})`
            : r.outcome === "loss"
              ? `Lost Matchup (-${Math.abs(r.margin || 0).toFixed(1)} pts vs ${r.opponentName || "Opponent"})`
              : r.outcome === "tie"
                ? `Tied Matchup vs ${r.opponentName || "Opponent"}`
                : `Upcoming Matchup vs ${r.opponentName || "Opponent"}`;
        actualRecordHtml = `
          <div class="text-center" title="${escapeHtml(outcomeDesc)}">
            <span class="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-black ${r.outcome === "win" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : r.outcome === "loss" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}">
              ${r.outcome === "win" ? "🟢 1-0" : r.outcome === "loss" ? "🔴 0-1" : r.outcome === "tie" ? "⚪ 0-0-1" : "Upcoming"}
            </span>
            <div class="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-medium truncate max-w-[100px] sm:max-w-[120px]" title="vs ${escapeHtml(r.opponentName || "Opp")}">vs ${escapeHtml(r.opponentName || "Opp")}</div>
          </div>
        `;
      }

      // All-Play Pill with detailed tooltip
      const allPlayHtml = `
        <div class="text-center" title="All-Play Record: ${r.allPlayWins || 0}W - ${r.allPlayLosses || 0}L${(r.allPlayTies || 0) > 0 ? ` - ${r.allPlayTies}T` : ""} (${r.allPlayWinPct || 0}% win rate against all league rivals)">
          <span class="font-mono text-[10px] sm:text-sm font-bold text-slate-200">
            ${r.allPlayWins || 0}W - ${r.allPlayLosses || 0}L${(r.allPlayTies || 0) > 0 ? ` - ${r.allPlayTies}T` : ""}
          </span>
          <div class="text-[10px] sm:text-xs font-mono text-cyan-400 font-semibold">${r.allPlayWinPct || 0}% Win</div>
        </div>
      `;

      // Luck Badge with detailed informative tooltip
      const luckVal = r.luckIndex || 0;
      let luckBadge = "";
      const expWinsStr = (r.expectedWins || 0).toFixed(2);
      const actWinsStr = isSeason
        ? `${r.wins}W`
        : r.outcome === "win"
          ? "1.0"
          : r.outcome === "tie"
            ? "0.5"
            : "0.0";
      if (luckVal >= 0.5) {
        luckBadge = `
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm cursor-help" title="🍀 Lucky Schedule Draw: Gained +${luckVal.toFixed(2)} bonus wins above expected (${actWinsStr} actual vs ${expWinsStr} expected based on scoring)">
            <span>🍀</span> +${luckVal.toFixed(2)}
          </span>
        `;
      } else if (luckVal <= -0.5) {
        luckBadge = `
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-mono font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm cursor-help" title="💔 Unlucky Schedule Draw: Lost ${Math.abs(luckVal).toFixed(2)} wins below expected (${actWinsStr} actual vs ${expWinsStr} expected due to tough opponent scores)">
            <span>💔</span> ${luckVal.toFixed(2)}
          </span>
        `;
      } else {
        luckBadge = `
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-mono font-black bg-slate-800 text-slate-300 border border-slate-700 cursor-help" title="⚖️ Fair Schedule: Actual outcome closely matches scoring performance (${luckVal >= 0 ? "+" : ""}${luckVal.toFixed(2)} vs ${expWinsStr} expected)">
            <span>⚖️</span> ${luckVal >= 0 ? "+" : ""}${luckVal.toFixed(2)}
          </span>
        `;
      }

      tr.innerHTML = `
        <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap font-mono font-black text-xs sm:text-sm text-slate-400">#${rankNum}</td>
        <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
          <div class="flex items-center gap-2 sm:gap-3">
            ${avatarHtml}
            <div class="min-w-0">
              <span class="font-bold text-xs sm:text-sm text-white truncate block" title="${escapeHtml(r.manager)}">${escapeHtml(r.manager)}</span>
              <span class="text-[10px] sm:text-xs text-slate-400 truncate block" title="${escapeHtml(r.teamName)}">${escapeHtml(r.teamName)}</span>
            </div>
          </div>
        </td>
        <td class="py-2.5 sm:py-4 px-2 sm:px-4 text-[11px] sm:text-sm text-slate-300 font-medium max-w-[150px] sm:max-w-[200px] truncate" title="League: ${escapeHtml(r.league)}">
          <div class="flex items-center gap-1.5 truncate">
            <span class="text-slate-500">🏆</span>
            <span class="truncate">${escapeHtml(r.league)}</span>
          </div>
        </td>
        <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-center">${actualRecordHtml}</td>
        <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-center">${allPlayHtml}</td>
        <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-center font-mono font-black text-xs sm:text-sm text-slate-200" title="Expected Wins: ${(r.expectedWins || 0).toFixed(2)} based on ${r.allPlayWinPct || 0}% All-Play win rate">
          ${(r.expectedWins || 0).toFixed(2)}
        </td>
        <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-center">${luckBadge}</td>
        <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-right font-mono font-bold text-xs sm:text-sm text-emerald-400" title="${isSeason ? `Total PF: ${(r.totalPoints || 0).toFixed(1)} pts across ${r.weeksCount || 1} weeks (${r.points.toFixed(2)} PPG)` : `Points Scored: ${r.points.toFixed(2)} pts`}">
          ${r.points.toFixed(2)} <span class="text-[10px] sm:text-xs font-normal text-slate-400">${isSeason ? "ppg" : "pts"}</span>
        </td>
        <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-right font-mono font-bold text-xs sm:text-sm text-slate-300" title="${isSeason ? `Total Opponent PA: ${(r.totalPointsAgainst || 0).toFixed(1)} pts allowed (${(r.pointsAgainst || 0).toFixed(2)} PPG)` : `Opponent Score Allowed: ${(r.pointsAgainst || 0).toFixed(2)} pts`}">
          ${(r.pointsAgainst || 0).toFixed(2)} <span class="text-[10px] sm:text-xs font-normal text-slate-400">${isSeason ? "ppg" : "pts"}</span>
        </td>
      `;

      tableBody.appendChild(tr);
    });
  }

  window.renderLuckAnalytics = renderLuckAnalytics;
  window.renderLuckTable = renderLuckTable;
  window.aggregatePlayers = aggregatePlayers;
  window.getPlayerInfo = getPlayerInfo;
  window.loadCachedData = loadCachedData;
  window.initPlayersDb = initPlayersDb;

  const TAB_ORDER = ["awards", "leaderboard", "visuals", "leagueGrid", "luck", "players"];
  const TAB_HASH_MAP = {
    awards: "awards",
    leaderboard: "board",
    visuals: "analytics",
    leagueGrid: "leagues",
    luck: "luck",
    players: "players"
  };
  const HASH_TAB_MAP = {
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

  function getCurrentlyActiveTab() {
    const viewAwards = document.getElementById("viewAwards");
    const viewLeaderboard = document.getElementById("viewLeaderboard");
    const viewVisuals = document.getElementById("viewVisuals");
    const viewLeagueGrid = document.getElementById("viewLeagueGrid");
    const viewLuck = document.getElementById("viewLuck");
    const viewPlayers = document.getElementById("viewPlayers");

    if (viewAwards && !viewAwards.classList.contains("hidden")) return "awards";
    if (viewLeaderboard && !viewLeaderboard.classList.contains("hidden")) return "leaderboard";
    if (viewVisuals && !viewVisuals.classList.contains("hidden")) return "visuals";
    if (viewLeagueGrid && !viewLeagueGrid.classList.contains("hidden")) return "leagueGrid";
    if (viewLuck && !viewLuck.classList.contains("hidden")) return "luck";
    if (viewPlayers && !viewPlayers.classList.contains("hidden")) return "players";
    return "awards";
  }

  function syncTabFromHash() {
    if (typeof window === "undefined" || !window.location) return;
    const rawHash = (window.location.hash || "").replace(/^#/, "").toLowerCase();
    const targetTab = HASH_TAB_MAP[rawHash];
    if (targetTab) {
      window.switchTab(targetTab, false);
    }
  }

  window.switchTab = function (tabName, updateHash = true) {
    if (!TAB_ORDER.includes(tabName)) {
      tabName = "awards";
    }

    const viewLeaderboard = document.getElementById("viewLeaderboard");
    const viewAwards = document.getElementById("viewAwards");
    const viewVisuals = document.getElementById("viewVisuals");
    const viewLeagueGrid = document.getElementById("viewLeagueGrid");
    const viewPlayers = document.getElementById("viewPlayers");
    const viewLuck = document.getElementById("viewLuck");

    const desktopInactive =
      "px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 cursor-pointer active:scale-95";
    const desktopActive =
      "px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 font-bold cursor-pointer active:scale-95 shadow-sm";

    const mobileInactive =
      "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all text-[10px] font-bold gap-1 min-w-[50px] text-slate-400 hover:text-slate-200 border border-transparent active:scale-95 touch-manipulation cursor-pointer";
    const mobileActive =
      "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all text-[10px] font-extrabold gap-1 min-w-[50px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 shadow-sm active:scale-95 touch-manipulation cursor-pointer";

    // Toggle Desktop Tabs
    const tabMap = {
      awards: { desktop: "tabAwards", mobile: "mobileTabAwards" },
      leaderboard: { desktop: "tabLeaderboard", mobile: "mobileTabLeaderboard" },
      visuals: { desktop: "tabVisuals", mobile: "mobileTabVisuals" },
      leagueGrid: { desktop: "tabLeagueGrid", mobile: "mobileTabLeagueGrid" },
      luck: { desktop: "tabLuck", mobile: "mobileTabLuck" },
      players: { desktop: "tabPlayers", mobile: "mobileTabPlayers" }
    };

    TAB_ORDER.forEach(t => {
      const dEl = document.getElementById(tabMap[t].desktop);
      const mEl = document.getElementById(tabMap[t].mobile);
      if (dEl) dEl.className = t === tabName ? desktopActive : desktopInactive;
      if (mEl) mEl.className = t === tabName ? mobileActive : mobileInactive;
    });

    if (viewLeaderboard) viewLeaderboard.classList.add("hidden");
    if (viewAwards) viewAwards.classList.add("hidden");
    if (viewVisuals) viewVisuals.classList.add("hidden");
    if (viewLeagueGrid) viewLeagueGrid.classList.add("hidden");
    if (viewPlayers) viewPlayers.classList.add("hidden");
    if (viewLuck) viewLuck.classList.add("hidden");

    if (tabName === "leaderboard") {
      if (viewLeaderboard) viewLeaderboard.classList.remove("hidden");
    } else if (tabName === "awards") {
      if (viewAwards) viewAwards.classList.remove("hidden");
      triggerConfetti();
    } else if (tabName === "visuals") {
      if (viewVisuals) viewVisuals.classList.remove("hidden");
      renderCharts(getActiveRecords(), getActiveLeaguesMap());
    } else if (tabName === "leagueGrid") {
      if (viewLeagueGrid) viewLeagueGrid.classList.remove("hidden");
      renderLeagueGrid(getActiveRecords(), getActiveLeaguesMap());
    } else if (tabName === "players") {
      if (viewPlayers) viewPlayers.classList.remove("hidden");
      renderPlayerAnalytics(getActiveRecords(), getActiveLeaguesMap());
    } else if (tabName === "luck") {
      if (viewLuck) viewLuck.classList.remove("hidden");
      renderLuckAnalytics(getActiveRecords(), getActiveLeaguesMap());
    }

    if (updateHash && typeof window !== "undefined" && window.location) {
      const hash = TAB_HASH_MAP[tabName] || tabName;
      if (window.location.hash !== `#${hash}`) {
        history.replaceState(null, "", `#${hash}`);
      }
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", syncTabFromHash);
  }

  function triggerConfetti() {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  /**
   * One-Click Copy Chat Recap formatted for Slack mrkdwn
   */
  function copyChatRecap() {
    const activeRecords = getActiveRecords();
    if (!activeRecords || activeRecords.length === 0) {
      showError("No data available to generate chat recap.");
      return;
    }

    const isSeason = currentMode === "SEASON_ROLLUP";
    const week = parseInt(weekInput.value, 10);
    const season = seasonInput.value;
    const sorted = [...activeRecords].sort((a, b) => b.points - a.points);
    const first = sorted[0];
    const second = sorted[1];
    const third = sorted[2];
    const lowest = sorted[sorted.length - 1];

    const activeLeagues = getActiveLeaguesMap();
    const totalLeagues = Object.keys(activeLeagues).length;
    const totalSquads = activeRecords.length;

    let topLeagueAvg = 0;
    let topLeagueName = "N/A";
    Object.keys(activeLeagues).forEach(lid => {
      const lTeams = activeRecords.filter(r => r.leagueId === lid);
      if (lTeams.length > 0) {
        const avg = lTeams.reduce((a, b) => a + b.points, 0) / lTeams.length;
        if (avg > topLeagueAvg) {
          topLeagueAvg = avg;
          topLeagueName = activeLeagues[lid].name || `League ${lid}`;
        }
      }
    });

    // Cross-league Benchmark Stats
    const totalPointsSum = activeRecords.reduce((acc, r) => acc + (r.points || 0), 0);
    const avgScore = totalSquads > 0 ? totalPointsSum / totalSquads : 0;
    const sortedScores = [...activeRecords].map(r => r.points || 0).sort((a, b) => a - b);
    const midIdx = Math.floor(sortedScores.length / 2);
    const medianScore =
      sortedScores.length % 2 !== 0
        ? sortedScores[midIdx]
        : (sortedScores[midIdx - 1] + sortedScores[midIdx]) / 2;

    // Superlatives
    let badBeat = null;
    let luckyEscape = null;
    if (!isSeason) {
      const losers = activeRecords
        .filter(r => r.outcome === "loss" && r.points > 0)
        .sort((a, b) => b.points - a.points);
      badBeat = losers[0];
      const winners = activeRecords
        .filter(r => r.outcome === "win" && r.points > 0)
        .sort((a, b) => a.points - b.points);
      luckyEscape = winners[0];
    } else {
      const losingSquads = activeRecords
        .filter(r => (r.losses || 0) > (r.wins || 0))
        .sort((a, b) => (b.totalPoints || b.points || 0) - (a.totalPoints || a.points || 0));
      badBeat =
        losingSquads[0] ||
        [...activeRecords].sort((a, b) => (b.pointsAgainst || 0) - (a.pointsAgainst || 0))[0];
      const winningSquads = activeRecords
        .filter(r => (r.wins || 0) > (r.losses || 0))
        .sort((a, b) => (a.totalPoints || a.points || 0) - (b.totalPoints || b.points || 0));
      luckyEscape =
        winningSquads[0] ||
        [...activeRecords].sort((a, b) => (a.pointsAgainst || 0) - (b.pointsAgainst || 0))[0];
    }

    const sortedBench = activeRecords
      .filter(r => (r.benchPoints || 0) > 0)
      .sort((a, b) => b.benchPoints - a.benchPoints);
    const benchKing = sortedBench[0];

    // Schedule Luck & All-Play Leaders
    const sortedByLuckDesc = [...activeRecords].sort(
      (a, b) => (b.luckIndex || 0) - (a.luckIndex || 0)
    );
    const luckiest = sortedByLuckDesc[0];
    const sortedByLuckAsc = [...activeRecords].sort(
      (a, b) => (a.luckIndex || 0) - (b.luckIndex || 0)
    );
    const unluckiest = sortedByLuckAsc[0];
    const sortedByAllPlay = [...activeRecords].sort((a, b) => {
      const pctDiff = (b.allPlayWinPct || 0) - (a.allPlayWinPct || 0);
      if (pctDiff !== 0) return pctDiff;
      const ptsA = typeof a.totalPoints === "number" ? a.totalPoints : a.points || 0;
      const ptsB = typeof b.totalPoints === "number" ? b.totalPoints : b.points || 0;
      return ptsB - ptsA;
    });
    const allPlayLeader = sortedByAllPlay[0];
    const shareUrl = buildShareableUrl();

    let text = "";
    if (isSeason) {
      text = `*<${shareUrl}|Season-to-Date Fantasy Recap (Weeks 1-${week}, ${season})>*\n\n`;

      text += `*The Podium (Avg PPG)*\n`;
      if (first)
        text += `• 🥇 *#1* ${first.manager} (${first.teamName}) — *${first.points.toFixed(2)} PPG* (${(first.totalPoints || 0).toFixed(1)} PF, ${first.wins || 0}W-${first.losses || 0}L) • _${first.league}_\n`;
      if (second)
        text += `• 🥈 *#2* ${second.manager} (${second.teamName}) — *${second.points.toFixed(2)} PPG* (${(second.totalPoints || 0).toFixed(1)} PF, ${second.wins || 0}W-${second.losses || 0}L) • _${second.league}_\n`;
      if (third)
        text += `• 🥉 *#3* ${third.manager} (${third.teamName}) — *${third.points.toFixed(2)} PPG* (${(third.totalPoints || 0).toFixed(1)} PF, ${third.wins || 0}W-${third.losses || 0}L) • _${third.league}_\n\n`;

      text += `*Superlatives Showcase*\n`;
      if (badBeat)
        text += `• 💔 *Season Heartbreak:* ${badBeat.manager} (${badBeat.teamName}) — *${(badBeat.points || 0).toFixed(1)} PPG* with a ${badBeat.wins || 0}W-${badBeat.losses || 0}L record • _${badBeat.league}_\n`;
      if (luckyEscape)
        text += `• 🪄 *Teflon Squad:* ${luckyEscape.manager} (${luckyEscape.teamName}) — *${(luckyEscape.points || 0).toFixed(1)} PPG* with a ${luckyEscape.wins || 0}W-${luckyEscape.losses || 0}L winning record • _${luckyEscape.league}_\n`;
      if (benchKing && benchKing.benchPoints > 0)
        text += `• 🪑 *Bench Heavyweight:* ${benchKing.manager} (${benchKing.teamName}) — *${benchKing.benchPoints.toFixed(1)} pts* left on bench (${benchKing.efficiency ?? 100}% Lineup Efficiency) • _${benchKing.league}_\n\n`;

      text += `*Schedule Luck & All-Play*\n`;
      if (luckiest) {
        const luckStr = `${(luckiest.luckIndex || 0) >= 0 ? "+" : ""}${(luckiest.luckIndex || 0).toFixed(2)}`;
        text += `• 🍀 *Luckiest Squad:* ${luckiest.manager} — *${luckStr} Luck Index* (${luckiest.wins || 0}W actual vs ${(luckiest.expectedWins || 0).toFixed(2)} xW) • _${luckiest.league}_\n`;
      }
      if (unluckiest) {
        const unluckStr = `${(unluckiest.luckIndex || 0) >= 0 ? "+" : ""}${(unluckiest.luckIndex || 0).toFixed(2)}`;
        text += `• 💔 *Toughest Schedule:* ${unluckiest.manager} — *${unluckStr} Luck Index* (${unluckiest.wins || 0}W actual vs ${(unluckiest.expectedWins || 0).toFixed(2)} xW) • _${unluckiest.league}_\n`;
      }
      if (allPlayLeader) {
        text += `• ⚡ *All-Play Dominance:* ${allPlayLeader.manager} — *${allPlayLeader.allPlayWinPct || 0}% All-Play Win Rate* (${allPlayLeader.allPlayWins || 0}W-${allPlayLeader.allPlayLosses || 0}L) • _${allPlayLeader.league}_\n\n`;
      }

      text += `*Overview*\n`;
      text += `• 👑 *Power League:* ${topLeagueName} (Avg: *${topLeagueAvg.toFixed(2)} PPG*)\n`;
      if (first && lowest)
        text += `• 🔥 *Peak PPG:* ${first.points.toFixed(2)} (${first.manager}) | ❄️ *Lowest PPG:* ${lowest.points.toFixed(2)} (${lowest.manager})\n`;
      text += `• 📈 *Benchmark:* Avg: *${avgScore.toFixed(2)} PPG* | Median: *${medianScore.toFixed(2)} PPG*\n`;
      text += `• 🏟️ *Scope:* ${totalLeagues} Leagues | ${totalSquads} Squads`;
    } else {
      text = `*<${shareUrl}|Week ${week} Fantasy Recap (${season})>*\n\n`;

      text += `*The Podium (Top Scores)*\n`;
      if (first)
        text += `• 🥇 *#1* ${first.manager} (${first.teamName}) — *${first.points.toFixed(2)} pts* • _${first.league}_\n`;
      if (second)
        text += `• 🥈 *#2* ${second.manager} (${second.teamName}) — *${second.points.toFixed(2)} pts* • _${second.league}_\n`;
      if (third)
        text += `• 🥉 *#3* ${third.manager} (${third.teamName}) — *${third.points.toFixed(2)} pts* • _${third.league}_\n\n`;

      text += `*Superlatives Showcase*\n`;
      if (badBeat)
        text += `• 💔 *The Bad Beat:* ${badBeat.manager} (${badBeat.teamName}) scored *${badBeat.points.toFixed(2)} pts* and lost by ${Math.abs(badBeat.margin || 0).toFixed(2)} to ${badBeat.opponentName || "rival"} • _${badBeat.league}_\n`;
      if (luckyEscape)
        text += `• 🪄 *The Lucky Escape:* ${luckyEscape.manager} (${luckyEscape.teamName}) won with *${luckyEscape.points.toFixed(2)} pts* vs ${luckyEscape.opponentName || "rival"} • _${luckyEscape.league}_\n`;
      if (benchKing && benchKing.benchPoints > 0)
        text += `• 🪑 *Bench Heavyweight:* ${benchKing.manager} (${benchKing.teamName}) left *${benchKing.benchPoints.toFixed(2)} pts* on bench (${benchKing.efficiency ?? 100}% Lineup Efficiency) • _${benchKing.league}_\n\n`;

      text += `*Schedule Luck & All-Play*\n`;
      if (luckiest) {
        const luckStr = `${(luckiest.luckIndex || 0) >= 0 ? "+" : ""}${(luckiest.luckIndex || 0).toFixed(2)}`;
        text += `• 🍀 *Luckiest Draw:* ${luckiest.manager} — *${luckStr} Luck Index* (${(luckiest.expectedWins || 0).toFixed(2)} xW) • _${luckiest.league}_\n`;
      }
      if (unluckiest) {
        const unluckStr = `${(unluckiest.luckIndex || 0) >= 0 ? "+" : ""}${(unluckiest.luckIndex || 0).toFixed(2)}`;
        text += `• 💔 *Toughest Draw:* ${unluckiest.manager} — *${unluckStr} Luck Index* (${(unluckiest.expectedWins || 0).toFixed(2)} xW) • _${unluckiest.league}_\n`;
      }
      if (allPlayLeader) {
        text += `• ⚡ *All-Play Leader:* ${allPlayLeader.manager} — *${allPlayLeader.allPlayWinPct || 0}% Win Rate* (${allPlayLeader.allPlayWins || 0}W-${allPlayLeader.allPlayLosses || 0}L) • _${allPlayLeader.league}_\n\n`;
      }

      text += `*Overview*\n`;
      text += `• 👑 *Power League:* ${topLeagueName} (Avg: *${topLeagueAvg.toFixed(2)} pts*)\n`;
      if (first && lowest)
        text += `• 🔥 *Peak Score:* ${first.points.toFixed(2)} pts (${first.manager}) | ❄️ *Lowest Score:* ${lowest.points.toFixed(2)} pts (${lowest.manager})\n`;
      text += `• 📈 *Benchmark:* Avg: *${avgScore.toFixed(2)} pts* | Median: *${medianScore.toFixed(2)} pts* | Spread: *${(first.points - lowest.points).toFixed(2)} pts*\n`;
      text += `• 🏟️ *Scope:* ${totalLeagues} Leagues | ${totalSquads} Squads`;
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showToast("Recap copied to clipboard!", "📋");
          if (copyRecapBtnText) {
            const orig = copyRecapBtnText.textContent;
            copyRecapBtnText.textContent = "Recap Copied! 📋";
            setTimeout(() => {
              copyRecapBtnText.textContent = orig;
            }, 2500);
          }
        })
        .catch(err => {
          console.warn("Clipboard API failed, fallback to textarea:", err);
          fallbackCopyText(text);
        });
    } else {
      fallbackCopyText(text);
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      showToast("Recap copied to clipboard!", "📋");
      if (copyRecapBtnText) {
        const orig = copyRecapBtnText.textContent;
        copyRecapBtnText.textContent = "Recap Copied! 📋";
        setTimeout(() => {
          copyRecapBtnText.textContent = orig;
        }, 2500);
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      showError("Could not copy to clipboard. Please copy manually from the table.");
    }
    document.body.removeChild(textArea);
  }

  /**
   * Builds a shareable CrossLeague URL containing season, week, mode, league IDs, and active tab
   * (Omits user identification so reports can be shared cleanly & anonymously).
   */
  function buildShareableUrl() {
    const season = seasonInput ? seasonInput.value : "2024";
    const week = weekInput ? weekInput.value : "1";
    const mode = currentMode || (modeSelect ? modeSelect.value : "WEEKLY");
    const currentTab = getCurrentlyActiveTab();

    const url = new URL(window.location.href);
    url.search = "";
    if (season) url.searchParams.set("season", season);
    if (week) url.searchParams.set("week", week);
    if (mode) url.searchParams.set("mode", mode);

    let leagueIds = [];
    if (selectedLeagueIds && selectedLeagueIds.size > 0) {
      leagueIds = Array.from(selectedLeagueIds);
    } else if (allLeaguesData && allLeaguesData.length > 0) {
      leagueIds = allLeaguesData.map(l => l.league_id);
    } else if (customLeagueIds && customLeagueIds.size > 0) {
      leagueIds = Array.from(customLeagueIds);
    }
    if (leagueIds.length > 0) {
      url.searchParams.set("leagues", leagueIds.join(","));
    }

    url.hash = `#${currentTab}`;
    return url.toString();
  }

  /**
   * Share Action: Copies current state URL with week/mode/leagues to clipboard
   */
  async function shareUrl() {
    const shareableUrl = buildShareableUrl();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareableUrl);
      } else {
        const ta = document.createElement("textarea");
        ta.value = shareableUrl;
        ta.style.position = "fixed";
        ta.style.left = "-999999px";
        ta.style.top = "-999999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      showToast("Shareable link copied to clipboard!", "🔗");
      if (shareUrlBtnText) {
        const orig = shareUrlBtnText.textContent;
        shareUrlBtnText.textContent = "Link Copied! 🔗";
        setTimeout(() => {
          shareUrlBtnText.textContent = orig;
        }, 2500);
      }
    } catch (err) {
      console.error("Failed to copy URL:", err);
      showError("Could not copy link to clipboard.");
    }
  }

  /**
   * Standalone Offline Report Exporter with Full Inlining
   */
  async function downloadReport() {
    return shareReport();
  }

  async function shareReport() {
    if (!rawRecords || rawRecords.length === 0) {
      showError("No data available to generate report. Please sync a Sleeper account first.");
      return;
    }

    // Ensure player DB is initialized
    try {
      await initPlayersDb();
    } catch (e) {
      console.warn("Could not prefetch player DB for export:", e);
    }

    const week = parseInt(weekInput.value, 10);
    const season = seasonInput.value;
    // Only export data for currently selected/filtered leagues
    const exportedLeagueIds = Array.from(selectedLeagueIds);
    const exportedRecords = rawRecords.filter(r => selectedLeagueIds.has(r.leagueId));
    const exportedLeaguesMap = {};
    const exportedAllLeaguesData = [];
    for (const lid of exportedLeagueIds) {
      if (leaguesMap[lid]) exportedLeaguesMap[lid] = leaguesMap[lid];
      const leagueEntry = allLeaguesData.find(l => l.league_id === lid);
      if (leagueEntry) exportedAllLeaguesData.push(leagueEntry);
    }

    const payload = {
      version: "2.0",
      generatedAt: new Date().toISOString(),
      mode: currentMode,
      user: {
        id: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar
      },
      season: season,
      week: week,
      records: exportedRecords,
      leaguesMap: exportedLeaguesMap,
      allLeaguesData: exportedAllLeaguesData,
      selectedLeagueIds: exportedLeagueIds,
      playersDb: sleeperPlayersDb || {}
    };

    // Grab stylesheet content if external
    let cssContent = "";
    try {
      const cssResp = await fetch("styles.css");
      if (cssResp.ok) cssContent = await cssResp.text();
    } catch (e) {
      console.warn("Could not fetch styles.css inline:", e);
    }

    // Grab app.js content if external
    let jsContent = "";
    try {
      const jsResp = await fetch("app.js");
      if (jsResp.ok) jsContent = await jsResp.text();
    } catch (e) {
      console.warn("Could not fetch app.js inline:", e);
    }

    let html = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;

    // Clean out previous embedded scripts
    const existingScriptPattern = new RegExp(
      "<" + 'script id="embedded-report-data">[\\s\\S]*?<' + "\\/script>\\n?",
      "gi"
    );
    html = html.replace(existingScriptPattern, "");

    // If external link styles.css is present, inline it safely using function replacer
    if (cssContent) {
      html = html.replace(
        /<link[^>]*href=["']styles\.css["'][^>]*>/gi,
        () => `<style>\n${cssContent}\n</style>`
      );
    }

    // If external script app.js is present, inline it safely using function replacer (prevents $ pattern collisions)
    if (jsContent) {
      const sOpen = "<" + "script>";
      const sClose = "<" + "/script>";
      const scriptPattern = new RegExp(
        "<" + "script[^>]*src=[\"']app\\.js[\"'][^>]*><" + "\\/script>",
        "gi"
      );
      html = html.replace(scriptPattern, () => `${sOpen}\n${jsContent}\n${sClose}`);
    }

    // Create serialized script tag safely escaped
    const jsonStr = JSON.stringify(payload).replace(
      new RegExp("<" + "/script", "gi"),
      "<\\/script"
    );
    const openTag = "<" + 'script id="embedded-report-data">';
    const closeTag = "<" + "/script>";
    const embeddedScript = `${openTag}\n  window.__EMBEDDED_REPORT__ = ${jsonStr};\n${closeTag}\n`;

    if (html.includes("</head>")) {
      html = html.replace("</head>", () => `${embeddedScript}</head>`);
    } else {
      html = embeddedScript + html;
    }

    const filename = "crossleague.html";

    // Trigger local file download via Blob
    try {
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      showToast("Report downloaded successfully!", "📁");
    } catch (err) {
      console.error("Blob download error:", err);
      showError("Failed to generate download file. Please try again.");
    }

    if (downloadReportBtnText) {
      const originalText = downloadReportBtnText.textContent;
      downloadReportBtnText.textContent = "Report Downloaded! 📁";
      setTimeout(() => {
        downloadReportBtnText.textContent = originalText;
      }, 2500);
    }
    if (shareReportBtnText && shareReportBtnText !== downloadReportBtnText) {
      const originalText = shareReportBtnText.textContent;
      shareReportBtnText.textContent = "Report Downloaded! 📁";
      setTimeout(() => {
        shareReportBtnText.textContent = originalText;
      }, 2500);
    }
  }

  function loadEmbeddedReport(data) {
    if (!data) return false;

    currentMode = data.mode || "WEEKLY";
    if (modeSelect) modeSelect.value = currentMode;
    updateModeUI();

    currentUserId = data.user ? data.user.id : "";
    currentUserName = data.user ? data.user.name : "";
    currentUserAvatar = data.user ? data.user.avatar : "";

    if (userIdInput && currentUserName) {
      userIdInput.value = currentUserName || currentUserId;
    }
    if (seasonInput && data.season) {
      seasonInput.value = String(data.season);
    }
    if (weekInput && data.week) {
      weekInput.value = String(data.week);
    }

    if (data.playersDb && Object.keys(data.playersDb).length > 0) {
      sleeperPlayersDb = data.playersDb;
    }

    rawRecords = (data.records || []).map(r => ({
      ...r,
      efficiency: typeof r.efficiency === "number" && !isNaN(r.efficiency) ? r.efficiency : 100,
      benchPoints: typeof r.benchPoints === "number" && !isNaN(r.benchPoints) ? r.benchPoints : 0,
      outcome: r.outcome || "unpaired",
      winPct: typeof r.winPct === "number" && !isNaN(r.winPct) ? r.winPct : 0,
      startersList: Array.isArray(r.startersList) ? r.startersList : [],
      allPlayersList: Array.isArray(r.allPlayersList) ? r.allPlayersList : [],
      playersPointsMap: r.playersPointsMap || {},
      startersPoints: Array.isArray(r.startersPoints) ? r.startersPoints : [],
      weeklyPlayerRecords: Array.isArray(r.weeklyPlayerRecords) ? r.weeklyPlayerRecords : []
    }));

    leaguesMap = data.leaguesMap || {};
    allLeaguesData = data.allLeaguesData || [];
    selectedLeagueIds = new Set(data.selectedLeagueIds || allLeaguesData.map(l => l.league_id));

    setLoading(false);
    initialState.classList.add("hidden");
    skeletonLoader.classList.add("hidden");

    if (syncControlCenter) syncControlCenter.classList.add("hidden");
    if (liveSyncIndicator) liveSyncIndicator.classList.add("hidden");
    if (headerSeasonBadge) headerSeasonBadge.classList.add("hidden");
    if (headerWeekBadge) headerWeekBadge.classList.add("hidden");
    if (btnOpenSettingsModal) btnOpenSettingsModal.classList.add("hidden");

    // Embed snapshot info into the header subtitle
    const dateFormatted = data.generatedAt
      ? new Date(data.generatedAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric"
        })
      : "";
    if (snapshotSubtitle) {
      const modeTitle =
        currentMode === "SEASON_ROLLUP"
          ? `Season Rollup (Weeks 1–${data.week || 1})`
          : `Week ${data.week || 1}`;
      snapshotSubtitle.textContent = `📁 ${modeTitle} • ${data.season || 2024} NFL Season${dateFormatted ? " • Generated " + dateFormatted : ""}`;
      snapshotSubtitle.classList.remove("hidden");
    }

    if (snapshotIndicator) {
      snapshotIndicator.classList.remove("hidden");
      snapshotIndicator.title = `Embedded Snapshot${dateFormatted ? " created on " + dateFormatted : ""}`;
    }

    reportContent.classList.remove("hidden");
    // Hide action buttons that don't work in offline exported reports
    if (shareUrlBtn) shareUrlBtn.classList.add("hidden");
    if (downloadReportBtn) downloadReportBtn.classList.add("hidden");
    if (shareReportBtn) shareReportBtn.classList.add("hidden");
    if (copyRecapBtn) copyRecapBtn.classList.add("hidden");
    if (exportCsvBtn) exportCsvBtn.classList.add("hidden");

    initPlayersDb();
    renderLeagueDropdown();
    refreshDashboard();

    return true;
  }

  function exportCsv() {
    const activeRecords = getActiveRecords();
    if (!activeRecords.length) return;
    const sorted = [...activeRecords].sort((a, b) => b.points - a.points);
    const isSeason = currentMode === "SEASON_ROLLUP";

    let headers, rows;
    if (isSeason) {
      headers = [
        "Rank",
        "Avg PPG",
        "Total PF",
        "Points Against",
        "Manager",
        "Team Name",
        "League",
        "League ID",
        "Wins",
        "Losses",
        "Ties",
        "Win %",
        "All-Play Record",
        "All-Play Win %",
        "Expected Wins",
        "Luck Index",
        "Std Dev",
        "Lineup Efficiency %"
      ];
      rows = sorted.map((r, i) => [
        i + 1,
        r.points,
        r.totalPoints || 0,
        r.pointsAgainst || 0,
        `"${(r.manager || "").replace(/"/g, '""')}"`,
        `"${(r.teamName || "").replace(/"/g, '""')}"`,
        `"${(r.league || "").replace(/"/g, '""')}"`,
        r.leagueId,
        r.wins || 0,
        r.losses || 0,
        r.ties || 0,
        `${r.winPct || 0}%`,
        `"${r.allPlayWins || 0}-${r.allPlayLosses || 0}${r.allPlayTies > 0 ? `-${r.allPlayTies}` : ""}"`,
        `${r.allPlayWinPct || 0}%`,
        (r.expectedWins || 0).toFixed(2),
        (r.luckIndex || 0).toFixed(2),
        r.stdDev || 0,
        `${r.efficiency ?? 100}%`
      ]);
    } else {
      headers = [
        "Rank",
        "Points",
        "Points Against",
        "Manager",
        "Team Name",
        "League",
        "League ID",
        "Week",
        "Matchup Result",
        "Opponent",
        "Margin",
        "All-Play Record",
        "Expected Wins",
        "Luck Index",
        "Starters Total",
        "Bench Points",
        "Lineup Efficiency %"
      ];
      rows = sorted.map((r, i) => [
        i + 1,
        r.points,
        r.pointsAgainst || 0,
        `"${(r.manager || "").replace(/"/g, '""')}"`,
        `"${(r.teamName || "").replace(/"/g, '""')}"`,
        `"${(r.league || "").replace(/"/g, '""')}"`,
        r.leagueId,
        r.week,
        r.outcome || "N/A",
        `"${(r.opponentName || "").replace(/"/g, '""')}"`,
        r.margin || 0,
        `"${r.allPlayWins || 0}-${r.allPlayLosses || 0}${r.allPlayTies > 0 ? `-${r.allPlayTies}` : ""}"`,
        (r.expectedWins || 0).toFixed(2),
        (r.luckIndex || 0).toFixed(2),
        r.startersTotal || 0,
        r.benchPoints || 0,
        `${r.efficiency ?? 100}%`
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `crossleague_${currentMode.toLowerCase()}_week_${weekInput.value}_${seasonInput.value}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Event Listeners
  if (syncTypeUserBtn) {
    syncTypeUserBtn.addEventListener("click", () => setSyncType("user"));
  }
  if (syncTypeLeaguesBtn) {
    syncTypeLeaguesBtn.addEventListener("click", () => setSyncType("leagues"));
  }
  if (btnAddCustomLeagueId && customLeagueIdInput) {
    btnAddCustomLeagueId.addEventListener("click", () => {
      addCustomLeagueIds(customLeagueIdInput.value);
      customLeagueIdInput.value = "";
    });
    customLeagueIdInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        addCustomLeagueIds(customLeagueIdInput.value);
        customLeagueIdInput.value = "";
      }
    });
    customLeagueIdInput.addEventListener("paste", () => {
      setTimeout(() => {
        addCustomLeagueIds(customLeagueIdInput.value);
        customLeagueIdInput.value = "";
      }, 50);
    });
  }
  if (btnClearCustomLeagueIds) {
    btnClearCustomLeagueIds.addEventListener("click", clearCustomLeagueIds);
  }

  if (filterForm) {
    filterForm.addEventListener("submit", e => {
      e.preventDefault();
      if (
        currentSyncType === "leagues" &&
        customLeagueIdInput &&
        customLeagueIdInput.value.trim()
      ) {
        addCustomLeagueIds(customLeagueIdInput.value);
        customLeagueIdInput.value = "";
      }
      closeSettingsModal();
      savePreferences();
      updateSettingsButtonBadge();
      updateWeekNavigatorUI();
      if (!tryLoadFromCache()) {
        fetchLeaderboard();
      }
    });
  }

  tableSearch.addEventListener("input", e => {
    searchQuery = e.target.value;
    currentMainPage = 1;
    renderTable();
  });

  scoreTierSelect.addEventListener("change", e => {
    currentTierFilter = e.target.value;
    currentMainPage = 1;
    renderTable();
  });

  if (playerSearchInput) {
    playerSearchInput.addEventListener("input", e => {
      currentPlayerSearch = e.target.value;
      currentPlayerPage = 1;
      renderPlayerLeaderboard();
    });
  }

  if (playerStatusFilter) {
    playerStatusFilter.addEventListener("change", e => {
      currentPlayerStatusFilter = e.target.value;
      currentPlayerPage = 1;
      renderPlayerLeaderboard();
    });
  }

  const luckSearchInput = document.getElementById("luckSearch");
  if (luckSearchInput) {
    luckSearchInput.addEventListener("input", e => {
      currentLuckSearch = e.target.value;
      currentLuckPage = 1;
      renderLuckTable();
    });
  }

  const luckCategorySelect = document.getElementById("luckCategoryFilter");
  if (luckCategorySelect) {
    luckCategorySelect.addEventListener("change", e => {
      currentLuckCategory = e.target.value;
      currentLuckPage = 1;
      renderLuckTable();
    });
  }

  if (customLeaguesDropdownBtn) {
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

  if (leagueDropdownBtn) {
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

      // Close any other open popovers
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

    // If clicking outside any card-info-wrapper, close all open popovers
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

  // Luck Index Methodology Modal Controllers
  function openLuckModal() {
    const modal = document.getElementById("luckMethodologyModal");
    if (modal) {
      modal.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");
    }
  }

  function closeLuckModal() {
    const modal = document.getElementById("luckMethodologyModal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    }
  }

  const luckModal = document.getElementById("luckMethodologyModal");
  if (luckModal) {
    luckModal.addEventListener("click", e => {
      if (e.target === luckModal) {
        closeLuckModal();
      }
    });
  }

  const btnOpenLuckModal = document.getElementById("btnOpenLuckModal");
  if (btnOpenLuckModal) {
    btnOpenLuckModal.addEventListener("click", openLuckModal);
  }

  const btnCloseLuckModal = document.getElementById("btnCloseLuckModal");
  if (btnCloseLuckModal) {
    btnCloseLuckModal.addEventListener("click", closeLuckModal);
  }

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

    // Guard: ignore shortcuts if typing in input/textarea/select or if a modal is open
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
    if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
      return;
    }
    if (settingsModal && !settingsModal.classList.contains("hidden")) {
      return;
    }
    const luckModal = document.getElementById("luckMethodologyModal");
    if (luckModal && !luckModal.classList.contains("hidden")) {
      return;
    }

    // Tab Switching Keyboard Shortcuts (1-6, [, ])
    if (e.key === "1") {
      e.preventDefault();
      window.switchTab("awards");
      return;
    } else if (e.key === "2") {
      e.preventDefault();
      window.switchTab("leaderboard");
      return;
    } else if (e.key === "3") {
      e.preventDefault();
      window.switchTab("visuals");
      return;
    } else if (e.key === "4") {
      e.preventDefault();
      window.switchTab("leagueGrid");
      return;
    } else if (e.key === "5") {
      e.preventDefault();
      window.switchTab("luck");
      return;
    } else if (e.key === "6") {
      e.preventDefault();
      window.switchTab("players");
      return;
    } else if (e.key === "[") {
      e.preventDefault();
      const currentTab = getCurrentlyActiveTab();
      const idx = TAB_ORDER.indexOf(currentTab);
      const prevIdx = (idx - 1 + TAB_ORDER.length) % TAB_ORDER.length;
      window.switchTab(TAB_ORDER[prevIdx]);
      return;
    } else if (e.key === "]") {
      e.preventDefault();
      const currentTab = getCurrentlyActiveTab();
      const idx = TAB_ORDER.indexOf(currentTab);
      const nextIdx = (idx + 1) % TAB_ORDER.length;
      window.switchTab(TAB_ORDER[nextIdx]);
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

  selectAllLeaguesBtn.addEventListener("click", e => {
    e.stopPropagation();
    selectedLeagueIds = new Set(allLeaguesData.map(l => l.league_id));
    renderLeagueDropdown();
    refreshDashboard();
  });

  clearAllLeaguesBtn.addEventListener("click", e => {
    e.stopPropagation();
    selectedLeagueIds.clear();
    renderLeagueDropdown();
    refreshDashboard();
  });

  if (exportCsvBtn) exportCsvBtn.addEventListener("click", exportCsv);
  if (shareUrlBtn) shareUrlBtn.addEventListener("click", shareUrl);
  if (downloadReportBtn) downloadReportBtn.addEventListener("click", downloadReport);
  if (shareReportBtn && shareReportBtn !== downloadReportBtn)
    shareReportBtn.addEventListener("click", downloadReport);
  if (copyRecapBtn) copyRecapBtn.addEventListener("click", copyChatRecap);

  window.shareUrl = shareUrl;
  window.downloadReport = downloadReport;
  window.shareReport = downloadReport;
  window.copyChatRecap = copyChatRecap;
  window.exportCsv = exportCsv;
  window.openLuckModal = openLuckModal;
  window.closeLuckModal = closeLuckModal;
  window.openSettingsModal = openSettingsModal;
  window.closeSettingsModal = closeSettingsModal;
  window.buildShareableUrl = buildShareableUrl;
  window.getUrlParams = getUrlParams;

  // App Initialization
  async function startApp() {
    initPlayersDb();
    if (window.__EMBEDDED_REPORT__) {
      loadEmbeddedReport(window.__EMBEDDED_REPORT__);
      syncTabFromHash();
      return;
    }
    await initDefaults();
    updateModeUI();
    const hasLoadedCache = tryLoadFromCache();
    if (
      !hasLoadedCache &&
      ((currentSyncType === "user" && userIdInput && userIdInput.value) ||
        (currentSyncType === "leagues" && customLeagueIds.size > 0) ||
        (pendingLeagueIdsFilter && pendingLeagueIdsFilter.size > 0))
    ) {
      fetchLeaderboard();
    }
    syncTabFromHash();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp);
  } else {
    startApp();
  }
})();
