import React, { useRef, useEffect, useState } from "react";
import {
  Zap,
  Sliders,
  Shield,
  User,
  Trophy,
  Building2,
  Trash2,
  Copy,
  Share2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  BarChart3,
  TrendingUp,
  Grid,
  Clover,
  Star
} from "lucide-react";
import { useCrossLeagueStore } from "../../state/useCrossLeagueStore.js";
import { copyChatRecap } from "../../export/recap.js";
import { shareUrl } from "../../export/share.js";
import { syncData } from "../../services/syncService.js";
import { getMaxPlayedWeek } from "../../state/preferences.js";
import { extractCustomLeagueIds } from "../../state/urlParams.js";
import type { TabId, SyncMode } from "../../types/index.js";

export const Header: React.FC = () => {
  const activeTab = useCrossLeagueStore(s => s.activeTab);
  const setActiveTab = useCrossLeagueStore(s => s.setActiveTab);
  const platform = useCrossLeagueStore(s => s.platform);
  const setPlatform = useCrossLeagueStore(s => s.setPlatform);
  const syncType = useCrossLeagueStore(s => s.syncType);
  const setSyncType = useCrossLeagueStore(s => s.setSyncType);
  const userName = useCrossLeagueStore(s => s.userName);
  const setUserName = useCrossLeagueStore(s => s.setUserName);
  const userId = useCrossLeagueStore(s => s.userId);
  const customLeagueIds = useCrossLeagueStore(s => s.customLeagueIds);
  const setCustomLeagueIds = useCrossLeagueStore(s => s.setCustomLeagueIds);
  const removeCustomLeagueId = useCrossLeagueStore(s => s.removeCustomLeagueId);
  const leaguesMap = useCrossLeagueStore(s => s.leaguesMap);
  const selectedLeagueIds = useCrossLeagueStore(s => s.selectedLeagueIds);
  const toggleSelectedLeagueId = useCrossLeagueStore(s => s.toggleSelectedLeagueId);
  const selectAllLeagues = useCrossLeagueStore(s => s.selectAllLeagues);
  const clearAllLeagues = useCrossLeagueStore(s => s.clearAllLeagues);
  const season = useCrossLeagueStore(s => s.season);
  const setSeason = useCrossLeagueStore(s => s.setSeason);
  const week = useCrossLeagueStore(s => s.week);
  const setWeek = useCrossLeagueStore(s => s.setWeek);
  const mode = useCrossLeagueStore(s => s.mode);
  const setMode = useCrossLeagueStore(s => s.setMode);
  const nflState = useCrossLeagueStore(s => s.nflState);
  const isSettingsOpen = useCrossLeagueStore(s => s.isSettingsOpen);
  const openSettingsModal = useCrossLeagueStore(s => s.openSettingsModal);
  const closeSettingsModal = useCrossLeagueStore(s => s.closeSettingsModal);
  const resetData = useCrossLeagueStore(s => s.resetData);
  const addToast = useCrossLeagueStore(s => s.addToast);

  const [inputUser, setInputUser] = useState(userName || userId);
  const [inputLeagueId, setInputLeagueId] = useState("");
  const [isLeagueFilterOpen, setIsLeagueFilterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputUser(userName || userId);
  }, [userName, userId, isSettingsOpen]);

  // Handle click outside settings dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isSettingsOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        closeSettingsModal();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") closeSettingsModal();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSettingsOpen, closeSettingsModal]);

  const maxPlayed = getMaxPlayedWeek();
  const canGoPrev = week > 1;
  const canGoNext = week < maxPlayed;

  const weekLabel =
    mode === "SEASON_ROLLUP" ? (week === 1 ? "Week 1 Rollup" : `Weeks 1–${week}`) : `Week ${week}`;

  let weekStatusText = "Played";
  let weekStatusClass =
    "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400";

  if (season < nflState.season) {
    weekStatusText = "Final";
    weekStatusClass =
      "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-700/60 text-slate-400";
  } else if (week === maxPlayed && nflState.season_type === "regular") {
    weekStatusText = "Current";
    weekStatusClass =
      "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 animate-pulse";
  }

  const leagueEntries = Object.entries(leaguesMap || {}) as Array<[string, any]>;
  const totalLeaguesCount = leagueEntries.length;
  const selectedCount =
    selectedLeagueIds.length === 0 ? totalLeaguesCount : selectedLeagueIds.length;

  const handleAddLeagueId = () => {
    if (!inputLeagueId.trim()) return;
    const parsed = extractCustomLeagueIds(inputLeagueId);
    if (parsed.length > 0) {
      const merged = Array.from(new Set([...customLeagueIds, ...parsed]));
      setCustomLeagueIds(merged);
    }
    setInputLeagueId("");
  };

  const handleApplySettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (syncType === "user" && platform !== "espn") {
      setUserName(inputUser.trim());
    }
    closeSettingsModal();
    syncData(true);
  };

  const handleCopyRecap = async () => {
    try {
      if (await copyChatRecap()) addToast("Chat recap copied to clipboard!", "success");
    } catch {
      addToast("Failed to copy recap", "error");
    }
  };

  const handleShare = async () => {
    try {
      if (await shareUrl()) addToast("Share link copied to clipboard!", "success");
    } catch {
      addToast("Failed to share link", "error");
    }
  };

  const handleClearData = () => {
    if (window.confirm("Clear all stored data, cached leagues, credentials, and settings?")) {
      resetData();
      addToast("Data cleared successfully", "info");
      closeSettingsModal();
    }
  };

  const tabs: Array<{ id: TabId; elementId: string; label: string; icon: React.ReactNode }> = [
    {
      id: "awards",
      elementId: "tabAwards",
      label: "Awards",
      icon: <Trophy className="w-4 h-4 text-amber-400" />
    },
    {
      id: "leaderboard",
      elementId: "tabLeaderboard",
      label: "Leaderboard",
      icon: <BarChart3 className="w-4 h-4 text-emerald-400" />
    },
    {
      id: "visuals",
      elementId: "tabVisuals",
      label: "Analytics",
      icon: <TrendingUp className="w-4 h-4 text-cyan-400" />
    },
    {
      id: "leagueGrid",
      elementId: "tabLeagueGrid",
      label: "Leagues",
      icon: <Grid className="w-4 h-4 text-indigo-400" />
    },
    {
      id: "luck",
      elementId: "tabLuck",
      label: "Luck Index",
      icon: <Clover className="w-4 h-4 text-emerald-400" />
    },
    {
      id: "players",
      elementId: "tabPlayers",
      label: "Player Analytics",
      icon: <Star className="w-4 h-4 text-amber-300" />
    }
  ];

  return (
    <header className="app-header fixed inset-x-0 top-0 border-b border-slate-800/80 bg-slate-950/90 z-40 backdrop-blur-xl w-full">
      <div className="w-full px-3 sm:px-8 lg:px-12 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
          <div className="relative group flex-shrink-0">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none transform-gpu" />
            <div className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-slate-900 flex items-center justify-center shadow-xl border border-white/10">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <h1 className="text-base sm:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-emerald-400 truncate">
                CrossLeague
              </h1>
            </div>
            <p className="text-[11px] sm:text-sm text-slate-400 font-semibold mt-0.5 truncate">
              Every league. Every squad. One board.
            </p>
            <p
              id="snapshotSubtitle"
              className="hidden text-[10px] sm:text-xs text-cyan-400 font-semibold mt-0.5 truncate"
            />
          </div>
        </div>

        {/* Right Side: Year/Week Badges, Snapshot Indicator & Hamburger Menu Button */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <div
            id="headerBottomRow"
            className="flex flex-col items-end justify-center gap-1 flex-shrink-0"
          >
            <div className="flex items-center gap-1">
              <span
                id="headerPlatformBadge"
                title="Active fantasy platform. Change it in Menu & Controls."
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] sm:text-xs font-semibold shadow-sm leading-tight ${
                  platform === "espn"
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    : "bg-cyan-500/10 border-cyan-400/30 text-cyan-300"
                }`}
              >
                {platform === "espn" ? <Shield className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                {platform === "espn" ? "ESPN" : "Sleeper"}
              </span>

              {/* Year / Season Bubble Badge */}
              <span
                id="headerSeasonBadge"
                title="Active Season"
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-[10px] sm:text-xs font-semibold text-cyan-300 shadow-sm font-mono leading-tight"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span id="headerSeasonValue">{season}</span>
              </span>
            </div>

            {/* Week Bubble Badge */}
            <span
              id="headerWeekBadge"
              title="Active Matchup Week"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-[10px] sm:text-xs font-semibold text-emerald-300 shadow-sm font-mono leading-tight"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span id="headerWeekValue">{weekLabel}</span>
            </span>
          </div>

          <span
            id="snapshotIndicator"
            className="hidden inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-[10px] sm:text-sm font-semibold text-cyan-300 flex-shrink-0"
          >
            <span className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            Snapshot
          </span>

          {/* MENU DROPDOWN CONTAINER */}
          <div
            className="relative inline-block text-left z-50"
            id="settingsDropdownContainer"
            ref={dropdownRef}
          >
            {/* Hamburger Trigger Button */}
            <button
              type="button"
              id="btnOpenSettingsModal"
              onClick={() => {
                if (isSettingsOpen) closeSettingsModal();
                else openSettingsModal();
              }}
              className="p-2 sm:p-2.5 rounded-xl glass-card border border-slate-700/80 hover:border-emerald-500/50 text-slate-300 hover:text-white transition flex items-center justify-center shadow-sm active:scale-95 cursor-pointer group"
              aria-expanded={isSettingsOpen}
              aria-haspopup="true"
              aria-label="Menu"
              title="Menu & Settings"
            >
              <svg
                id="settingsDropdownChevron"
                className={`w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors ${
                  isSettingsOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Mobile Backdrop Overlay */}
            {isSettingsOpen && (
              <div
                id="settingsBackdrop"
                onClick={closeSettingsModal}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 sm:hidden"
                aria-hidden="true"
              />
            )}

            {/* Dropdown Panel */}
            <div
              id="settingsModal"
              className={`${
                isSettingsOpen ? "" : "hidden"
              } fixed inset-x-3 top-16 max-h-[calc(100dvh-6.5rem-env(safe-area-inset-bottom,0px))] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[420px] sm:max-w-md sm:max-h-[85vh] overflow-y-auto overscroll-contain rounded-2xl glass-card border border-slate-700/80 shadow-2xl p-4 pb-16 sm:p-5 sm:pb-5 z-50 space-y-4 backdrop-blur-xl bg-slate-950/95 ring-1 ring-white/10 text-left touch-scroll`}
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                    Menu & Controls
                  </span>
                </div>
                <button
                  type="button"
                  id="btnCloseSettingsModal"
                  onClick={closeSettingsModal}
                  className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition cursor-pointer text-xs"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Matchup Week Stepper inside Menu */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                  Matchup Week
                </span>
                <div
                  id="weekSelectorComponent"
                  className="flex items-center justify-between p-1 bg-slate-900 rounded-xl border border-slate-800"
                >
                  <button
                    type="button"
                    id="prevWeekBtn"
                    disabled={!canGoPrev}
                    onClick={() => {
                      if (canGoPrev) setWeek(week - 1);
                    }}
                    title={canGoPrev ? "Previous Week (← Left Arrow)" : "At first week"}
                    className={`w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white transition active:scale-95 flex items-center justify-center font-bold text-xs shadow-sm ${
                      canGoPrev ? "cursor-pointer" : "opacity-40 cursor-not-allowed"
                    }`}
                    aria-label="Previous Week"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <div
                    id="weekDisplayContainer"
                    className="flex items-center gap-2 px-3 select-none justify-center"
                  >
                    <span
                      id="weekDisplayValue"
                      className="text-sm font-extrabold text-white whitespace-nowrap font-mono tracking-tight"
                    >
                      {weekLabel}
                    </span>
                    <span id="weekStatusBadge" className={weekStatusClass}>
                      {weekStatusText}
                    </span>
                  </div>

                  <button
                    type="button"
                    id="nextWeekBtn"
                    disabled={!canGoNext}
                    onClick={() => {
                      if (canGoNext) setWeek(week + 1);
                    }}
                    title={canGoNext ? "Next Week (→ Right Arrow)" : "At current week"}
                    className={`w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white transition active:scale-95 flex items-center justify-center font-bold text-xs shadow-sm ${
                      canGoNext ? "cursor-pointer" : "opacity-40 cursor-not-allowed"
                    }`}
                    aria-label="Next Week"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 2. Account & Scope Settings Form */}
              <form id="filterForm" onSubmit={handleApplySettings} className="space-y-3.5">
                {/* Platform Selector */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                    Fantasy Platform
                  </span>
                  <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold">
                    <button
                      type="button"
                      id="platformSleeperBtn"
                      onClick={() => setPlatform("sleeper")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
                        platform === "sleeper"
                          ? "text-slate-200 bg-slate-800 shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sleeper</span>
                    </button>
                    <button
                      type="button"
                      id="platformEspnBtn"
                      onClick={() => setPlatform("espn")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1.5 text-xs ${
                        platform === "espn"
                          ? "text-white bg-rose-900/80 border border-rose-500/40 shadow-sm font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 text-rose-400" />
                      <span>ESPN</span>
                    </button>
                  </div>
                </div>

                {/* Sync Source Selector & Inputs */}
                <div className="space-y-2">
                  <div
                    id="syncTypeButtonsContainer"
                    className={`flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold ${
                      platform === "espn" ? "hidden" : ""
                    }`}
                  >
                    <button
                      type="button"
                      id="syncTypeUserBtn"
                      onClick={() => setSyncType("user")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        syncType === "user"
                          ? "text-slate-200 bg-slate-800 shadow-sm font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Username</span>
                    </button>
                    <button
                      type="button"
                      id="syncTypeLeaguesBtn"
                      onClick={() => setSyncType("leagues")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        syncType === "leagues"
                          ? "text-slate-200 bg-slate-800 shadow-sm font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>League IDs</span>
                    </button>
                  </div>

                  {/* Username Panel */}
                  <div
                    id="userSyncPanel"
                    className={syncType === "user" && platform !== "espn" ? "" : "hidden"}
                  >
                    <label
                      htmlFor="userIdInput"
                      className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between"
                    >
                      <span id="userIdInputLabel">Sleeper Username or ID</span>
                      <span className="text-[10px] text-emerald-400 font-bold lowercase">
                        remembered
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="userIdInput"
                        value={inputUser}
                        onChange={e => setInputUser(e.target.value)}
                        placeholder="e.g. username or numeric ID"
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-slate-500 pl-9 font-medium"
                      />
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* League IDs Panel */}
                  <div
                    id="leaguesSyncPanel"
                    className={`space-y-2.5 ${syncType === "leagues" || platform === "espn" ? "" : "hidden"}`}
                  >
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span id="customLeaguesLabel">
                        {platform === "espn" ? "ESPN League IDs (Public)" : "League IDs"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">multi-league</span>
                    </label>

                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          id="customLeagueIdInput"
                          value={inputLeagueId}
                          onChange={e => setInputLeagueId(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddLeagueId();
                            }
                          }}
                          placeholder={platform === "espn" ? "e.g. espn:12345678" : "e.g. 12345678"}
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-slate-500 pl-8 font-mono"
                        />
                        <span className="absolute left-2.5 top-2 text-xs text-slate-500 font-mono">
                          #
                        </span>
                      </div>
                      <button
                        type="button"
                        id="btnAddCustomLeagueId"
                        onClick={handleAddLeagueId}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition border border-slate-700 cursor-pointer shadow-sm"
                      >
                        Add
                      </button>
                    </div>

                    {/* Chips */}
                    <div
                      id="customLeagueIdsChips"
                      className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto"
                    >
                      {customLeagueIds.map(id => (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200"
                        >
                          <span>{id}</span>
                          <button
                            type="button"
                            onClick={() => removeCustomLeagueId(id)}
                            className="text-slate-400 hover:text-rose-400 font-bold ml-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mode & Season Selection */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="modeSelect"
                      className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5"
                    >
                      Scope
                    </label>
                    <select
                      id="modeSelect"
                      value={mode}
                      onChange={e => setMode(e.target.value as SyncMode)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold cursor-pointer"
                    >
                      <option value="WEEKLY">Weekly Matchup</option>
                      <option value="SEASON_ROLLUP">Season-to-Date</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="seasonInput"
                      className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5"
                    >
                      Season
                    </label>
                    <select
                      id="seasonInput"
                      value={season}
                      onChange={e => setSeason(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold cursor-pointer"
                    >
                      {[2026, 2025, 2024, 2023, 2022, 2021].map(yr => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <input type="hidden" id="weekInput" name="week" value={week} />

                {/* Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    id="btnCancelSettingsModal"
                    onClick={closeSettingsModal}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition cursor-pointer border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btnSaveSettingsModal"
                    className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Apply & Sync</span>
                  </button>
                </div>
              </form>

              {/* 3. Active Leagues Multi-Select Dropdown */}
              <div
                id="leagueDropdownContainer"
                className="border-t border-slate-800/80 pt-3 space-y-1.5"
              >
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                  Active Leagues
                </span>
                <div className="relative">
                  <button
                    type="button"
                    id="leagueDropdownBtn"
                    onClick={() => setIsLeagueFilterOpen(!isLeagueFilterOpen)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 hover:text-white transition flex items-center justify-between text-xs font-semibold cursor-pointer shadow-sm active:scale-98 group"
                    aria-expanded={isLeagueFilterOpen}
                    aria-haspopup="true"
                    title="Filter Active Leagues"
                  >
                    <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span id="leagueDropdownLabel" className="truncate text-slate-200">
                        {totalLeaguesCount === 0
                          ? "No Leagues Loaded"
                          : selectedCount === totalLeaguesCount
                            ? "All Leagues Selected"
                            : `${selectedCount} of ${totalLeaguesCount} Selected`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        id="leagueDropdownBadge"
                        className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-500/30 font-mono"
                      >
                        {selectedCount} / {totalLeaguesCount}
                      </span>
                      <ChevronDown
                        id="leagueDropdownChevron"
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                          isLeagueFilterOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isLeagueFilterOpen && (
                    <div
                      id="leagueDropdownMenu"
                      className="mt-1.5 w-full rounded-xl bg-slate-900 border border-slate-700/80 shadow-xl p-2.5 space-y-2 z-10"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 px-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Select Leagues
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            id="selectAllLeaguesBtn"
                            onClick={selectAllLeagues}
                            className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 text-[10px] font-bold transition border border-slate-800 cursor-pointer"
                          >
                            All
                          </button>
                          <button
                            type="button"
                            id="clearAllLeaguesBtn"
                            onClick={clearAllLeagues}
                            className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-rose-300 text-[10px] font-bold transition border border-slate-800 cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div
                        id="leagueDropdownList"
                        className="max-h-48 overflow-y-auto overscroll-contain touch-scroll space-y-1 pr-1"
                      >
                        {leagueEntries.map(([id, info]) => {
                          const isChecked =
                            selectedLeagueIds.length === 0 || selectedLeagueIds.includes(id);
                          return (
                            <label
                              key={id}
                              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-800/80 cursor-pointer text-xs text-slate-200 transition select-none"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectedLeagueId(id)}
                                className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 cursor-pointer"
                              />
                              <span className="truncate flex-1 font-medium">{info.name || id}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {info.totalRosters}T
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Section */}
              <div className="border-t border-slate-800/80 pt-3 space-y-1.5">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500 px-1">
                  Quick Actions
                </span>
                <button
                  type="button"
                  id="copyRecapBtn"
                  onClick={handleCopyRecap}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white transition flex items-center gap-2.5 text-xs font-bold border border-slate-800 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span id="copyRecapBtnText">Copy Recap</span>
                </button>

                <button
                  type="button"
                  id="shareUrlBtn"
                  onClick={handleShare}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white transition flex items-center gap-2.5 text-xs font-bold border border-slate-800 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span id="shareUrlBtnText">Share</span>
                </button>

                <div className="pt-1 mt-1 border-t border-slate-800">
                  <button
                    type="button"
                    id="clearDataBtn"
                    onClick={handleClearData}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/40 hover:bg-rose-950/40 text-rose-400 transition flex items-center gap-2.5 text-xs font-bold border border-slate-800/80 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span id="clearDataBtnText">Clear Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar directly below the header */}
      <div className="hidden md:block border-t border-slate-800/80 bg-slate-950/60 px-3 sm:px-8 lg:px-12 py-2">
        <nav
          className="grid grid-cols-2 gap-1.5 md:grid-cols-3 lg:flex lg:items-center"
          aria-label="Dashboard views"
        >
          {tabs.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                id={t.elementId}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`w-full justify-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer active:scale-95 text-center text-xs sm:text-sm font-bold lg:flex-1 ${
                  isActive
                    ? "bg-slate-800 text-white shadow-sm border-slate-700 font-black"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60 border-transparent"
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <span id="playerSeasonBadge" className="hidden">
        {season}
      </span>
    </header>
  );
};
