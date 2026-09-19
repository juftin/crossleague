import React from "react";
import { Building2, Crown, Medal } from "lucide-react";
import { useActiveRecords, useActiveLeaguesMap } from "../../state/useCrossLeagueStore.js";

export const LeagueGridTab: React.FC = () => {
  const records = useActiveRecords();
  const activeLeagues = useActiveLeaguesMap();

  const leagueKeys = Object.keys(activeLeagues || {});

  return (
    <div id="viewLeagueGrid" className="w-full space-y-6">
      <div
        id="leagueCardsGrid"
        className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {leagueKeys.length === 0 ? (
          <div className="glass-card col-span-full space-y-3 rounded-2xl border border-slate-800 py-16 text-center text-slate-400">
            <Building2 className="mx-auto h-12 w-12 text-slate-500" />
            <div className="text-lg font-bold text-slate-200">No leagues selected.</div>
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
                className="glass-card space-y-4 rounded-2xl border border-slate-800 p-6"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
                  <div className="min-w-0 flex-1">
                    <h3
                      className="line-clamp-2 text-base leading-snug font-black break-words text-white sm:text-lg"
                      title={league?.name || lid}
                    >
                      {league?.name || `League ${lid}`}
                    </h3>
                    <div className="mt-1 text-xs font-medium text-slate-400">
                      {leagueTeams.length} squads active
                    </div>
                  </div>
                  <span className="flex-shrink-0 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 font-mono text-xs font-bold text-emerald-400 sm:text-sm">
                    Avg: {avg}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="text-xs font-black tracking-wider text-slate-400 uppercase">
                    Top 5 Performers
                  </div>
                  <div className="space-y-2">
                    {leagueTeams.slice(0, 5).map((t, idx) => {
                      const rank = idx + 1;
                      const rankBadge =
                        rank === 1 ? (
                          <span className="inline-flex items-center gap-1 font-black text-amber-300">
                            <Crown className="h-3.5 w-3.5 text-amber-300" /> #1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center gap-1 font-black text-slate-200">
                            <Medal className="h-3.5 w-3.5 text-slate-200" /> #2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center gap-1 font-black text-amber-500">
                            <Medal className="h-3.5 w-3.5 text-amber-500" /> #3
                          </span>
                        ) : (
                          <span className="font-black text-slate-400">#{rank}</span>
                        );

                      return (
                        <div
                          key={t.id || `${lid}-${t.rosterId}`}
                          className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-900/70 p-2 text-sm transition hover:bg-slate-800/60"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {rankBadge}
                            <span className="truncate font-semibold text-slate-200">
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
