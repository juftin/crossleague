import React, { useRef, useEffect } from "react";
import { useCrossLeagueStore } from "../../state/useCrossLeagueStore.js";
import { Shield, ChevronDown } from "lucide-react";

export const LeagueDropdown: React.FC = () => {
  const leaguesMap = useCrossLeagueStore((s) => s.leaguesMap);
  const selectedLeagueIds = useCrossLeagueStore((s) => s.selectedLeagueIds);
  const isLeagueDropdownOpen = useCrossLeagueStore((s) => s.isLeagueDropdownOpen);
  const toggleLeagueDropdown = useCrossLeagueStore((s) => s.toggleLeagueDropdown);
  const toggleSelectedLeagueId = useCrossLeagueStore((s) => s.toggleSelectedLeagueId);
  const selectAllLeagues = useCrossLeagueStore((s) => s.selectAllLeagues);
  const clearAllLeagues = useCrossLeagueStore((s) => s.clearAllLeagues);

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
    <div id="leagueDropdownContainer" ref={containerRef} className="relative inline-block text-left">
      <button
        id="leagueDropdownBtn"
        type="button"
        onClick={() => toggleLeagueDropdown()}
        className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 transition cursor-pointer shadow-sm"
      >
        <Shield className="w-3.5 h-3.5 text-slate-400" />
        <span id="leagueDropdownLabel">Leagues</span>
        <span
          id="leagueDropdownBadge"
          className="bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-black px-1.5 py-0.5 rounded-full"
        >
          {selectedCount}/{totalLeaguesCount}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isLeagueDropdownOpen && (
        <div
          id="leagueDropdownMenu"
          className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 rounded-2xl bg-slate-900/98 border border-slate-700 shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Filter Leagues
            </span>
            <div className="flex items-center gap-2">
              <button
                id="selectAllLeaguesBtn"
                type="button"
                onClick={selectAllLeagues}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition"
              >
                All
              </button>
              <span className="text-slate-600">•</span>
              <button
                id="clearAllLeaguesBtn"
                type="button"
                onClick={clearAllLeagues}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-200 transition"
              >
                Clear
              </button>
            </div>
          </div>

          <div id="leagueDropdownList" className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
            {leagueEntries.map(([id, info]) => {
              const isChecked =
                selectedLeagueIds.length === 0 || selectedLeagueIds.includes(id);
              return (
                <label
                  key={id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/80 cursor-pointer text-xs text-slate-200 transition select-none"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSelectedLeagueId(id)}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
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
  );
};
