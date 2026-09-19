import React, { useRef, useEffect } from "react";
import { useCrossLeagueStore } from "../../state/useCrossLeagueStore.js";
import { Shield, ChevronDown } from "lucide-react";

export const LeagueDropdown: React.FC = () => {
  const leaguesMap = useCrossLeagueStore(s => s.leaguesMap);
  const selectedLeagueIds = useCrossLeagueStore(s => s.selectedLeagueIds);
  const isLeagueDropdownOpen = useCrossLeagueStore(s => s.isLeagueDropdownOpen);
  const toggleLeagueDropdown = useCrossLeagueStore(s => s.toggleLeagueDropdown);
  const toggleSelectedLeagueId = useCrossLeagueStore(s => s.toggleSelectedLeagueId);
  const selectAllLeagues = useCrossLeagueStore(s => s.selectAllLeagues);
  const clearAllLeagues = useCrossLeagueStore(s => s.clearAllLeagues);

  const containerRef = useRef<HTMLDivElement>(null);
  const leagueEntries = Object.entries(leaguesMap || {}) as Array<[string, any]>;
  const totalLeaguesCount = leagueEntries.length;
  const selectedCount =
    selectedLeagueIds.length === 0 ? totalLeaguesCount : selectedLeagueIds.length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isLeagueDropdownOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        toggleLeagueDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLeagueDropdownOpen, toggleLeagueDropdown]);

  if (totalLeaguesCount <= 1) {
    return (
      <div id="leagueDropdownContainer" className="hidden">
        <button id="leagueDropdownBtn" />
        <span id="leagueDropdownLabel" />
        <span id="leagueDropdownBadge" />
        <div id="leagueDropdownMenu" className="hidden">
          <button id="selectAllLeaguesBtn" />
          <button id="clearAllLeaguesBtn" />
          <div id="leagueDropdownList" />
        </div>
      </div>
    );
  }

  return (
    <div
      id="leagueDropdownContainer"
      ref={containerRef}
      className="relative inline-block text-left"
    >
      <button
        id="leagueDropdownBtn"
        type="button"
        onClick={() => toggleLeagueDropdown()}
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-sm transition hover:border-slate-600"
      >
        <Shield className="h-3.5 w-3.5 text-slate-400" />
        <span id="leagueDropdownLabel">Leagues</span>
        <span
          id="leagueDropdownBadge"
          className="rounded-full border border-emerald-500/40 bg-emerald-950 px-1.5 py-0.5 text-[10px] font-black text-emerald-300"
        >
          {selectedCount}/{totalLeaguesCount}
        </span>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {isLeagueDropdownOpen && (
        <div
          id="leagueDropdownMenu"
          className="animate-in fade-in absolute left-0 z-50 mt-2 w-64 rounded-2xl border border-slate-700 bg-slate-900/98 p-2 shadow-2xl backdrop-blur-xl duration-150 sm:right-0 sm:left-auto"
        >
          <div className="mb-2 flex items-center justify-between border-b border-slate-800 px-1 pb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Filter Leagues
            </span>
            <div className="flex items-center gap-2">
              <button
                id="selectAllLeaguesBtn"
                type="button"
                onClick={selectAllLeagues}
                className="text-[11px] font-bold text-emerald-400 transition hover:text-emerald-300"
              >
                All
              </button>
              <span className="text-slate-600">•</span>
              <button
                id="clearAllLeaguesBtn"
                type="button"
                onClick={clearAllLeagues}
                className="text-[11px] font-bold text-slate-400 transition hover:text-slate-200"
              >
                Clear
              </button>
            </div>
          </div>

          <div
            id="leagueDropdownList"
            className="custom-scrollbar max-h-60 space-y-1 overflow-y-auto"
          >
            {leagueEntries.map(([id, info]) => {
              const isChecked = selectedLeagueIds.length === 0 || selectedLeagueIds.includes(id);
              return (
                <label
                  key={id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-200 transition select-none hover:bg-slate-800/80"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSelectedLeagueId(id)}
                    className="cursor-pointer rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="flex-1 truncate font-medium">{info.name || id}</span>
                  <span className="font-mono text-[10px] text-slate-400">{info.totalRosters}T</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
