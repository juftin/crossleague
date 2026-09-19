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
  const setUserId = useCrossLeagueStore(s => s.setUserId);
  const setUserAvatar = useCrossLeagueStore(s => s.setUserAvatar);
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
  const rawRecords = useCrossLeagueStore(s => s.rawRecords);
  const hasData = rawRecords && rawRecords.length > 0;

  const [inputUser, setInputUser] = useState(userName || userId);
  const [inputLeagueId, setInputLeagueId] = useState("");
  const [draftEspnLeagueInput, setDraftEspnLeagueInput] = useState("");
  const [draftSleeperLeagueInput, setDraftSleeperLeagueInput] = useState("");
  const [draftSleeperUserInput, setDraftSleeperUserInput] = useState("");
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
    if (inputLeagueId.trim()) {
      const parsed = extractCustomLeagueIds(inputLeagueId);
      if (parsed.length > 0) {
        const merged = Array.from(new Set([...customLeagueIds, ...parsed]));
        setCustomLeagueIds(merged);
      }
      setInputLeagueId("");
    }
    if (syncType === "user" && platform !== "espn") {
      setUserName(inputUser.trim());
      setCustomLeagueIds([]);
    } else {
      setUserName("");
      setUserId("");
      setUserAvatar("");
      setInputUser("");
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
    resetData();
    addToast("Data cleared successfully", "info");
    closeSettingsModal();
  };

  const tabs: Array<{ id: TabId; elementId: string; label: string; icon: React.ReactNode }> = [
    {
      id: "awards",
      elementId: "tabAwards",
      label: "Awards",
      icon: <Trophy className="h-4 w-4 text-amber-400" />
    },
    {
      id: "leaderboard",
      elementId: "tabLeaderboard",
      label: "Leaderboard",
      icon: <BarChart3 className="h-4 w-4 text-emerald-400" />
    },
    {
      id: "visuals",
      elementId: "tabVisuals",
      label: "Analytics",
      icon: <TrendingUp className="h-4 w-4 text-cyan-400" />
    },
    {
      id: "leagueGrid",
      elementId: "tabLeagueGrid",
      label: "Leagues",
      icon: <Grid className="h-4 w-4 text-indigo-400" />
    },
    {
      id: "luck",
      elementId: "tabLuck",
      label: "Luck Index",
      icon: <Clover className="h-4 w-4 text-emerald-400" />
    },
    {
      id: "players",
      elementId: "tabPlayers",
      label: "Player Analytics",
      icon: <Star className="h-4 w-4 text-amber-300" />
    }
  ];

  return (
    <header className="app-header fixed inset-x-0 top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-8 sm:py-4 lg:px-12">
        {/* Brand & Title */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-4">
          <div className="group relative flex-shrink-0">
            <div className="pointer-events-none absolute -inset-0.5 transform-gpu rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-60 blur transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900 shadow-xl sm:h-12 sm:w-12">
              <Zap className="h-5 w-5 text-emerald-400 sm:h-6 sm:w-6" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <h1 className="truncate bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-base font-black tracking-tight text-transparent sm:text-2xl">
                CrossLeague
              </h1>
            </div>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-400 sm:text-sm">
              Every league. Every squad. One board.
            </p>
            <p
              id="snapshotSubtitle"
              className="mt-0.5 hidden truncate text-[10px] font-semibold text-cyan-400 sm:text-xs"
            />
          </div>
        </div>

        {/* Right Side: Year/Week Badges, Snapshot Indicator & Hamburger Menu Button */}
        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-3">
          {hasData && (
            <div
              id="headerBottomRow"
              className="flex flex-shrink-0 flex-col items-end justify-center gap-1"
            >
              <div className="flex items-center gap-1">
                <span
                  id="headerPlatformBadge"
                  title="Active fantasy platform. Change it in Menu & Controls."
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] leading-tight font-semibold shadow-sm sm:text-xs ${
                    platform === "espn"
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                      : "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
                  }`}
                >
                  {platform === "espn" ? (
                    <Shield className="h-3 w-3" />
                  ) : (
                    <Zap className="h-3 w-3" />
                  )}
                  {platform === "espn" ? "ESPN" : "Sleeper"}
                </span>

                {/* Year / Season Bubble Badge */}
                <span
                  id="headerSeasonBadge"
                  title="Active Season"
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/90 px-2 py-0.5 font-mono text-[10px] leading-tight font-semibold text-cyan-300 shadow-sm sm:text-xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <span id="headerSeasonValue">{season}</span>
                </span>
              </div>

              {/* Week Bubble Badge */}
              <span
                id="headerWeekBadge"
                title="Active Matchup Week"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/90 px-2 py-0.5 font-mono text-[10px] leading-tight font-semibold text-emerald-300 shadow-sm sm:text-xs"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span id="headerWeekValue">{weekLabel}</span>
              </span>
            </div>
          )}

          <span
            id="snapshotIndicator"
            className="hidden inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/80 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] sm:h-2.5 sm:w-2.5" />
            Snapshot
          </span>

          {/* MENU DROPDOWN CONTAINER */}
          <div
            className="relative z-50 inline-block text-left"
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
              className="glass-card group flex cursor-pointer items-center justify-center rounded-xl border border-slate-700/80 p-2 text-slate-300 shadow-sm transition hover:border-emerald-500/50 hover:text-white active:scale-95 sm:p-2.5"
              aria-expanded={isSettingsOpen}
              aria-haspopup="true"
              aria-label="Menu"
              title="Menu & Settings"
            >
              <svg
                id="settingsDropdownChevron"
                className={`h-5 w-5 text-emerald-400 transition-colors group-hover:text-emerald-300 ${
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
                className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm sm:hidden"
                aria-hidden="true"
              />
            )}

            {/* Dropdown Panel */}
            <div
              id="settingsModal"
              className={`${
                isSettingsOpen ? "" : "hidden"
              } glass-card touch-scroll fixed inset-x-3 top-16 z-50 max-h-[calc(100dvh-6.5rem-env(safe-area-inset-bottom,0px))] space-y-4 overflow-y-auto overscroll-contain rounded-2xl border border-slate-700/80 bg-slate-950/95 p-4 pb-16 text-left shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:max-h-[85vh] sm:w-[420px] sm:max-w-md sm:p-5 sm:pb-5`}
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-black tracking-wider text-slate-200 uppercase">
                    Menu & Controls
                  </span>
                </div>
                <button
                  type="button"
                  id="btnCloseSettingsModal"
                  onClick={closeSettingsModal}
                  className="cursor-pointer rounded-lg bg-slate-800/60 p-1 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 1. Matchup Week Stepper inside Menu */}
              <div className="space-y-1.5">
                <span className="block px-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                  Matchup Week
                </span>
                <div
                  id="weekSelectorComponent"
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-1"
                >
                  <button
                    type="button"
                    id="prevWeekBtn"
                    disabled={!canGoPrev}
                    onClick={() => {
                      if (canGoPrev) setWeek(week - 1);
                    }}
                    title={canGoPrev ? "Previous Week (← Left Arrow)" : "At first week"}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-950 text-xs font-bold text-slate-300 shadow-sm transition hover:border-slate-600 hover:bg-slate-800 hover:text-white active:scale-95 ${
                      canGoPrev ? "cursor-pointer" : "cursor-not-allowed opacity-40"
                    }`}
                    aria-label="Previous Week"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>

                  <div
                    id="weekDisplayContainer"
                    className="flex items-center justify-center gap-2 px-3 select-none"
                  >
                    <span
                      id="weekDisplayValue"
                      className="font-mono text-sm font-extrabold tracking-tight whitespace-nowrap text-white"
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
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-950 text-xs font-bold text-slate-300 shadow-sm transition hover:border-slate-600 hover:bg-slate-800 hover:text-white active:scale-95 ${
                      canGoNext ? "cursor-pointer" : "cursor-not-allowed opacity-40"
                    }`}
                    aria-label="Next Week"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* 2. Account & Scope Settings Form */}
              <form id="filterForm" onSubmit={handleApplySettings} className="space-y-3.5">
                {/* Platform Selector */}
                <div className="space-y-1.5">
                  <span className="block px-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                    Fantasy Platform
                  </span>
                  <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs font-bold">
                    <button
                      type="button"
                      id="platformSleeperBtn"
                      onClick={() => {
                        if (platform === "espn") {
                          setDraftEspnLeagueInput(inputLeagueId);
                          setInputLeagueId(draftSleeperLeagueInput);
                          setInputUser(draftSleeperUserInput || userName || userId);
                        }
                        setPlatform("sleeper");
                      }}
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-center text-xs font-bold transition ${
                        platform === "sleeper"
                          ? "bg-slate-800 text-slate-200 shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Zap className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Sleeper</span>
                    </button>
                    <button
                      type="button"
                      id="platformEspnBtn"
                      onClick={() => {
                        if (platform !== "espn") {
                          setDraftSleeperLeagueInput(inputLeagueId);
                          setDraftSleeperUserInput(inputUser);
                          setInputLeagueId(draftEspnLeagueInput);
                        }
                        setPlatform("espn");
                      }}
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-center text-xs transition ${
                        platform === "espn"
                          ? "border border-rose-500/40 bg-rose-900/80 font-bold text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Shield className="h-3.5 w-3.5 text-rose-400" />
                      <span>ESPN</span>
                    </button>
                  </div>
                </div>

                {/* Sync Source Selector & Inputs */}
                <div className="space-y-2">
                  <div
                    id="syncTypeButtonsContainer"
                    className={`flex items-center rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs font-bold ${
                      platform === "espn" ? "hidden" : ""
                    }`}
                  >
                    <button
                      type="button"
                      id="syncTypeUserBtn"
                      onClick={() => {
                        setSyncType("user");
                        setCustomLeagueIds([]);
                        setInputLeagueId("");
                      }}
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-center transition ${
                        syncType === "user"
                          ? "bg-slate-800 font-bold text-slate-200 shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <User className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Username</span>
                    </button>
                    <button
                      type="button"
                      id="syncTypeLeaguesBtn"
                      onClick={() => {
                        setSyncType("leagues");
                        setUserName("");
                        setUserId("");
                        setUserAvatar("");
                        setInputUser("");
                      }}
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-center transition ${
                        syncType === "leagues"
                          ? "bg-slate-800 font-bold text-slate-200 shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Trophy className="h-3.5 w-3.5 text-amber-400" />
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
                      className="mb-1.5 block flex items-center justify-between text-xs font-black tracking-wider text-slate-400 uppercase"
                    >
                      <span id="userIdInputLabel">Sleeper Username or ID</span>
                      <span className="text-[10px] font-bold text-emerald-400 lowercase">
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
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3.5 py-2 pl-9 text-sm font-medium text-white placeholder-slate-500 transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <User className="absolute top-2.5 left-3 h-4 w-4 text-slate-500" />
                    </div>
                  </div>

                  {/* League IDs Panel */}
                  <div
                    id="leaguesSyncPanel"
                    className={`space-y-2.5 ${syncType === "leagues" || platform === "espn" ? "" : "hidden"}`}
                  >
                    <label className="block flex items-center justify-between text-xs font-black tracking-wider text-slate-400 uppercase">
                      <span id="customLeaguesLabel">
                        {platform === "espn" ? "ESPN League IDs (Public)" : "League IDs"}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">multi-league</span>
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
                          className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-2 pl-8 font-mono text-xs text-white placeholder-slate-500 transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        <span className="absolute top-2 left-2.5 font-mono text-xs text-slate-500">
                          #
                        </span>
                      </div>
                      <button
                        type="button"
                        id="btnAddCustomLeagueId"
                        onClick={handleAddLeagueId}
                        className="cursor-pointer rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 shadow-sm transition hover:bg-slate-700 hover:text-white"
                      >
                        Add
                      </button>
                    </div>

                    {/* Chips */}
                    <div
                      id="customLeagueIdsChips"
                      className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto"
                    >
                      {customLeagueIds.map(id => (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono text-xs text-slate-200"
                        >
                          <span>{id}</span>
                          <button
                            type="button"
                            onClick={() => removeCustomLeagueId(id)}
                            className="ml-1 cursor-pointer font-bold text-slate-400 hover:text-rose-400"
                          >
                            <X className="h-3.5 w-3.5" />
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
                      className="mb-1.5 block text-xs font-black tracking-wider text-slate-400 uppercase"
                    >
                      Scope
                    </label>
                    <select
                      id="modeSelect"
                      value={mode}
                      onChange={e => setMode(e.target.value as SyncMode)}
                      className="w-full cursor-pointer rounded-xl border border-slate-700/80 bg-slate-900 px-2.5 py-2 text-xs font-semibold text-white transition-all focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:text-sm"
                    >
                      <option value="WEEKLY">Weekly Matchup</option>
                      <option value="SEASON_ROLLUP">Season-to-Date</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="seasonInput"
                      className="mb-1.5 block text-xs font-black tracking-wider text-slate-400 uppercase"
                    >
                      Season
                    </label>
                    <select
                      id="seasonInput"
                      value={season}
                      onChange={e => setSeason(Number(e.target.value))}
                      className="w-full cursor-pointer rounded-xl border border-slate-700/80 bg-slate-900 px-2.5 py-2 text-xs font-semibold text-white transition-all focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:text-sm"
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
                    className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btnSaveSettingsModal"
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-black tracking-wider text-slate-950 uppercase shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 active:scale-98"
                  >
                    <span>Apply & Sync</span>
                  </button>
                </div>
              </form>

              {/* 3. Active Leagues Multi-Select Dropdown */}
              <div
                id="leagueDropdownContainer"
                className="space-y-1.5 border-t border-slate-800/80 pt-3"
              >
                <span className="block px-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                  Active Leagues
                </span>
                <div className="relative">
                  <button
                    type="button"
                    id="leagueDropdownBtn"
                    onClick={() => setIsLeagueFilterOpen(!isLeagueFilterOpen)}
                    className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 shadow-sm transition hover:border-emerald-500/50 hover:text-white active:scale-98"
                    aria-expanded={isLeagueFilterOpen}
                    aria-haspopup="true"
                    title="Filter Active Leagues"
                  >
                    <div className="flex min-w-0 items-center gap-2 truncate pr-2">
                      <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                      <span id="leagueDropdownLabel" className="truncate text-slate-200">
                        {totalLeaguesCount === 0
                          ? "No Leagues Loaded"
                          : selectedCount === totalLeaguesCount
                            ? "All Leagues Selected"
                            : `${selectedCount} of ${totalLeaguesCount} Selected`}
                      </span>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1.5">
                      <span
                        id="leagueDropdownBadge"
                        className="rounded-full border border-emerald-500/30 bg-emerald-950/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400"
                      >
                        {selectedCount} / {totalLeaguesCount}
                      </span>
                      <ChevronDown
                        id="leagueDropdownChevron"
                        className={`h-3.5 w-3.5 flex-shrink-0 text-slate-400 transition-transform duration-200 ${
                          isLeagueFilterOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isLeagueFilterOpen && (
                    <div
                      id="leagueDropdownMenu"
                      className="z-10 mt-1.5 w-full space-y-2 rounded-xl border border-slate-700/80 bg-slate-900 p-2.5 shadow-xl"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 px-1 pb-1.5">
                        <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                          Select Leagues
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            id="selectAllLeaguesBtn"
                            onClick={selectAllLeagues}
                            className="cursor-pointer rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 text-[10px] font-bold text-slate-300 transition hover:bg-slate-800 hover:text-emerald-300"
                          >
                            All
                          </button>
                          <button
                            type="button"
                            id="clearAllLeaguesBtn"
                            onClick={clearAllLeagues}
                            className="cursor-pointer rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 text-[10px] font-bold text-slate-400 transition hover:bg-slate-800 hover:text-rose-300"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div
                        id="leagueDropdownList"
                        className="touch-scroll max-h-48 space-y-1 overflow-y-auto overscroll-contain pr-1"
                      >
                        {leagueEntries.map(([id, info]) => {
                          const isChecked =
                            selectedLeagueIds.length === 0 || selectedLeagueIds.includes(id);
                          return (
                            <label
                              key={id}
                              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs text-slate-200 transition select-none hover:bg-slate-800/80"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectedLeagueId(id)}
                                className="cursor-pointer rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                              />
                              <span className="flex-1 truncate font-medium">{info.name || id}</span>
                              <span className="font-mono text-[10px] text-slate-400">
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
              <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                <span className="block px-1 text-[10px] font-black tracking-wider text-slate-500 uppercase">
                  Quick Actions
                </span>
                <button
                  type="button"
                  id="copyRecapBtn"
                  onClick={handleCopyRecap}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-800 hover:text-white"
                >
                  <Copy className="h-3.5 w-3.5 flex-shrink-0 text-cyan-400" />
                  <span id="copyRecapBtnText">Copy Recap</span>
                </button>

                <button
                  type="button"
                  id="shareUrlBtn"
                  onClick={handleShare}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-800 hover:text-white"
                >
                  <Share2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  <span id="shareUrlBtnText">Share</span>
                </button>

                <div className="mt-1 border-t border-slate-800 pt-1">
                  <button
                    type="button"
                    id="clearDataBtn"
                    onClick={handleClearData}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 px-3 py-2 text-xs font-bold text-rose-400 transition hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-3.5 w-3.5 flex-shrink-0 text-rose-400" />
                    <span id="clearDataBtnText">Clear Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar directly below the header */}
      <div className="hidden border-t border-slate-800/80 bg-slate-950/60 px-3 py-2 sm:px-8 md:block lg:px-12">
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
                className={`flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2 py-1.5 text-center text-xs font-bold whitespace-nowrap transition-all active:scale-95 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm lg:flex-1 ${
                  isActive
                    ? "border-slate-700 bg-slate-800 font-black text-white shadow-sm"
                    : "border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-white"
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
