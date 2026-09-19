import React from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import { useCrossLeagueStore, useActiveRecords } from "../../state/useCrossLeagueStore.js";
import { getAvatarUrl } from "../../api/sleeper.js";

export const Podium: React.FC = () => {
  const records = useActiveRecords();
  const mode = useCrossLeagueStore(s => s.mode);

  const isSeason = mode === "SEASON_ROLLUP";
  const sorted = [...(records || [])].sort((a, b) => (b.points || 0) - (a.points || 0));
  const top3 = sorted.slice(0, 3);

  if (top3.length === 0) {
    return <div id="podiumCards" className="grid grid-cols-1 items-end gap-5 md:grid-cols-3" />;
  }

  const podiumSlots = [
    {
      rank: 1,
      title: "1ST PLACE",
      medal: <Crown className="h-6 w-6 text-amber-400" />,
      glow: "gold-glow",
      color: "text-amber-400",
      orderClass: "order-1 md:order-2",
      cardClass: "md:min-h-[260px] p-4 sm:p-6",
      scoreSize: "text-3xl sm:text-4xl"
    },
    {
      rank: 2,
      title: "2ND PLACE",
      medal: <Medal className="h-6 w-6 text-slate-300" />,
      glow: "silver-glow",
      color: "text-slate-300",
      orderClass: "order-2 md:order-1",
      cardClass: "md:min-h-[230px] p-4 sm:p-5",
      scoreSize: "text-2xl sm:text-3xl"
    },
    {
      rank: 3,
      title: "3RD PLACE",
      medal: <Medal className="h-6 w-6 text-amber-600" />,
      glow: "bronze-glow",
      color: "text-amber-600",
      orderClass: "order-3 md:order-3",
      cardClass: "md:min-h-[205px] p-4 sm:p-5",
      scoreSize: "text-2xl sm:text-3xl"
    }
  ];

  return (
    <div id="podiumCards" className="grid grid-cols-1 items-end gap-5 md:grid-cols-3">
      {podiumSlots.map(slot => {
        const t = top3[slot.rank - 1];
        if (!t) return null;

        const metricLabel = isSeason ? "Average PPG" : "Total Points";
        const effVal =
          typeof t.efficiency === "number" && !isNaN(t.efficiency) ? t.efficiency : 100;
        const subMetric = isSeason
          ? `${((t as any).totalPoints || t.points || 0).toFixed(1)} Total PF • ${t.rawWins || (t as any).wins || 0}W-${t.rawLosses || (t as any).losses || 0}L`
          : `Lineup Efficiency: ${effVal}%`;

        const avatarUrl = getAvatarUrl((t as any).avatar || t.managerAvatar);
        const avatarSize =
          slot.rank === 1 ? "w-10 sm:w-11 h-10 sm:h-11" : "w-9 sm:w-10 h-9 sm:h-10";

        return (
          <div
            key={slot.rank}
            className={`glass-card ${slot.glow} ${slot.orderClass} ${slot.cardClass} group relative flex flex-col justify-between rounded-2xl transition hover:border-slate-600`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-black tracking-wider uppercase ${slot.color} group-hover:underline`}
                >
                  {slot.title}
                </span>
                <span className="flex items-center">{slot.medal}</span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    className={`${avatarSize} flex-shrink-0 rounded-full border border-slate-700 object-cover`}
                    alt=""
                    onError={e => ((e.target as HTMLElement).style.display = "none")}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div
                    className="truncate text-base font-black text-white sm:text-xl"
                    title={t.manager}
                  >
                    {t.manager}
                  </div>
                  <div
                    className="mt-0.5 truncate text-xs font-medium text-slate-400 sm:text-sm"
                    title={t.teamName}
                  >
                    {t.teamName}
                  </div>
                  <div
                    className="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-emerald-400/90"
                    title={`League: ${t.leagueName || (t as any).league || ""}`}
                  >
                    <Trophy className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {t.leagueName || (t as any).league || "League"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-800/80 pt-3 sm:mt-5">
              <div className="min-w-0">
                <div className="truncate text-[10px] font-bold text-slate-400 uppercase sm:text-xs">
                  {metricLabel}
                </div>
                <div
                  className={`${slot.scoreSize} font-black ${slot.color} mt-1 font-mono leading-none`}
                >
                  {(t.points || 0).toFixed(2)}
                </div>
              </div>
              <div className="min-w-0 text-right text-[11px] font-semibold text-slate-400 sm:text-xs">
                {subMetric}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
