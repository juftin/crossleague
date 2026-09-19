import React from "react";
import { Trophy, BarChart3, TrendingUp, Grid, Clover, Star } from "lucide-react";
import { useCrossLeagueStore } from "../../state/useCrossLeagueStore.js";
import type { TabId } from "../../types/index.js";

export const MobileBottomNav: React.FC = () => {
  const activeTab = useCrossLeagueStore(s => s.activeTab);
  const setActiveTab = useCrossLeagueStore(s => s.setActiveTab);

  const tabs: Array<{ id: TabId; elementId: string; label: string; icon: React.ReactNode }> = [
    {
      id: "awards",
      elementId: "mobileTabAwards",
      label: "Awards",
      icon: <Trophy className="w-5 h-5" />
    },
    {
      id: "leaderboard",
      elementId: "mobileTabLeaderboard",
      label: "Board",
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: "visuals",
      elementId: "mobileTabVisuals",
      label: "Visuals",
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      id: "leagueGrid",
      elementId: "mobileTabLeagueGrid",
      label: "Leagues",
      icon: <Grid className="w-5 h-5" />
    },
    {
      id: "luck",
      elementId: "mobileTabLuck",
      label: "Luck",
      icon: <Clover className="w-5 h-5" />
    },
    {
      id: "players",
      elementId: "mobileTabPlayers",
      label: "Players",
      icon: <Star className="w-5 h-5" />
    }
  ];

  return (
    <nav
      id="mobileBottomNav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-around select-none shadow-2xl safe-area-pb"
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={tab.elementId}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition duration-200 cursor-pointer min-w-[48px] ${
              isActive
                ? "text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="flex items-center justify-center mb-0.5">{tab.icon}</span>
            <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
