import React from "react";
import { Building2, Crown, Medal } from "lucide-react";
import { useActiveRecords, useActiveLeaguesMap } from "../../state/useCrossLeagueStore.js";

export const LeagueGridTab: React.FC = () => {
  const records = useActiveRecords();
  const activeLeagues = useActiveLeaguesMap();

  const leagueKeys = Object.keys(activeLeagues || {});

  return (
    <div id="viewLeagueGrid" className="space-y-6 w-full">
      <div
        id="leagueCardsGrid"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
      >
        {leagueKeys.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 glass-card rounded-2xl border border-slate-800 space-y-3">
            <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
            <div className="font-bold text-lg text-slate-200">No leagues selected.</div>
            <div className="text-sm text-slate-400">
              Pick one or more leagues from the filter bar above to compare them here.
            </div>
          </div>
        ) : (
          leagueKeys.map(lid => {
            const league = activeLeagues[lid];
            const leagueTeams = (records || [])
              .filter(r => r.leagueId === lid)
              .sort((a, b) => (b.points || 0) - (a.points || 0));

            if (leagueTeams.length === 0) return null;

            const sum = leagueTeams.reduce((acc, r) => acc + (r.points || 0), 0);
            const avg = (sum / leagueTeams.length).toFixed(2);

            return (
              <div
                key={lid}
                className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 gap-3">
                  <div className="min-w-0 flex-1">
                    <h3
                      className="font-black text-base sm:text-lg text-white break-words line-clamp-2 leading-snug"
                      title={league?.name || lid}
                    >
                      {league?.name || `League ${lid}`}
                    </h3>
                    <div className="text-xs text-slate-400 font-medium mt-1">
                      {leagueTeams.length} squads active
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs sm:text-sm font-mono font-bold text-emerald-400 flex-shrink-0">
                    Avg: {avg}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Top 5 Performers
                  </div>
                  <div className="space-y-2">
                    {leagueTeams.slice(0, 5).map((t, idx) => {
                      const rank = idx + 1;
                      const rankBadge =
                        rank === 1 ? (
                          <span className="inline-flex items-center gap-1 font-black text-amber-300">
                            <Crown className="w-3.5 h-3.5 text-amber-300" /> #1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center gap-1 font-black text-slate-200">
                            <Medal className="w-3.5 h-3.5 text-slate-200" /> #2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center gap-1 font-black text-amber-500">
                            <Medal className="w-3.5 h-3.5 text-amber-500" /> #3
                          </span>
                        ) : (
                          <span className="font-black text-slate-400">#{rank}</span>
                        );

                      return (
                        <div
                          key={t.id || `${lid}-${t.rosterId}`}
                          className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-900/70 border border-slate-800/60 hover:bg-slate-800/60 transition"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {rankBadge}
                            <span className="truncate text-slate-200 font-semibold">
                              {t.manager}
                            </span>
                          </div>
                          <span className="font-mono font-black text-slate-100">
                            {(t.points || 0).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
