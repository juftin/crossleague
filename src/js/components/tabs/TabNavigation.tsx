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
      icon: <Trophy className="h-4 w-4 text-amber-400" />
    },
    {
      id: "leaderboard",
      elementId: "tabLeaderboard",
      label: "Cross-League Board",
      icon: <BarChart3 className="h-4 w-4 text-emerald-400" />
    },
    {
      id: "visuals",
      elementId: "tabVisuals",
      label: "Visual Analytics",
      icon: <TrendingUp className="h-4 w-4 text-cyan-400" />
    },
    {
      id: "leagueGrid",
      elementId: "tabLeagueGrid",
      label: "League Breakdown",
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
    <div className="custom-scrollbar mb-6 flex items-center justify-between gap-2 overflow-x-auto border-b border-slate-800 pb-3">
      <div className="flex min-w-max items-center gap-1.5 sm:gap-2">
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              id={t.elementId}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition duration-150 sm:text-sm ${
                isActive
                  ? "border border-emerald-500/40 bg-emerald-950/80 text-emerald-300 shadow-sm"
                  : "border border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200"
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
