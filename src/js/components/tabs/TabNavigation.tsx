import React from "react";
import { Trophy, BarChart3, TrendingUp, Grid, Clover, Star } from "lucide-react";
import { useCrossLeagueStore } from "../../state/useCrossLeagueStore.js";
import type { TabId } from "../../types/index.js";

export const TabNavigation: React.FC = () => {
  const activeTab = useCrossLeagueStore(s => s.activeTab);
  const setActiveTab = useCrossLeagueStore(s => s.setActiveTab);

  const tabs: Array<{ id: TabId; elementId: string; label: string; icon: React.ReactNode }> = [
    {
      id: "awards",
      elementId: "tabAwards",
      label: "Awards & Superlatives",
      icon: <Trophy className="w-4 h-4 text-amber-400" />
    },
    {
      id: "leaderboard",
      elementId: "tabLeaderboard",
      label: "Cross-League Board",
      icon: <BarChart3 className="w-4 h-4 text-emerald-400" />
    },
    {
      id: "visuals",
      elementId: "tabVisuals",
      label: "Visual Analytics",
      icon: <TrendingUp className="w-4 h-4 text-cyan-400" />
    },
    {
      id: "leagueGrid",
      elementId: "tabLeagueGrid",
      label: "League Breakdown",
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
    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6 gap-2 overflow-x-auto custom-scrollbar">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              id={t.elementId}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition duration-150 cursor-pointer ${
                isActive
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
