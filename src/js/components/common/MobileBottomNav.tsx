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
      icon: <Trophy className="h-5 w-5" />
    },
    {
      id: "leaderboard",
      elementId: "mobileTabLeaderboard",
      label: "Board",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      id: "visuals",
      elementId: "mobileTabVisuals",
      label: "Visuals",
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: "leagueGrid",
      elementId: "mobileTabLeagueGrid",
      label: "Leagues",
      icon: <Grid className="h-5 w-5" />
    },
    {
      id: "luck",
      elementId: "mobileTabLuck",
      label: "Luck",
      icon: <Clover className="h-5 w-5" />
    },
    {
      id: "players",
      elementId: "mobileTabPlayers",
      label: "Players",
      icon: <Star className="h-5 w-5" />
    }
  ];

  return (
    <nav
      id="mobileBottomNav"
      className="safe-area-pb fixed right-0 bottom-0 left-0 z-40 flex items-center justify-around border-t border-slate-800/90 bg-slate-950/95 px-2 py-1.5 shadow-2xl backdrop-blur-xl select-none md:hidden"
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={tab.elementId}
            onClick={() => setActiveTab(tab.id)}
            className={`flex min-w-[48px] cursor-pointer flex-col items-center justify-center rounded-xl px-2 py-1 transition duration-200 ${
              isActive
                ? "border border-emerald-500/30 bg-emerald-950/50 text-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="mb-0.5 flex items-center justify-center">{tab.icon}</span>
            <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
