import React from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import { useCrossLeagueStore, useActiveRecords } from "../../state/useCrossLeagueStore.js";
import { getAvatarUrl } from "../../api/sleeper.js";

export const Podium: React.FC = () => {
  const records = useActiveRecords();
  const mode = useCrossLeagueStore((s) => s.mode);

  const isSeason = mode === "SEASON_ROLLUP";
  const sorted = [...(records || [])].sort((a, b) => (b.points || 0) - (a.points || 0));
  const top3 = sorted.slice(0, 3);

  if (top3.length === 0) {
    return <div id="podiumCards" className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end" />;
  }

  const podiumSlots = [
    {
      rank: 1,
      title: "1ST PLACE",
      medal: <Crown className="w-6 h-6 text-amber-400" />,
      glow: "gold-glow",
      color: "text-amber-400",
      orderClass: "order-1 md:order-2",
      cardClass: "md:min-h-[260px] p-4 sm:p-6",
      scoreSize: "text-3xl sm:text-4xl"
    },
    {
      rank: 2,
      title: "2ND PLACE",
      medal: <Medal className="w-6 h-6 text-slate-300" />,
      glow: "silver-glow",
      color: "text-slate-300",
      orderClass: "order-2 md:order-1",
      cardClass: "md:min-h-[230px] p-4 sm:p-5",
      scoreSize: "text-2xl sm:text-3xl"
    },
    {
      rank: 3,
      title: "3RD PLACE",
      medal: <Medal className="w-6 h-6 text-amber-600" />,
      glow: "bronze-glow",
      color: "text-amber-600",
      orderClass: "order-3 md:order-3",
      cardClass: "md:min-h-[205px] p-4 sm:p-5",
      scoreSize: "text-2xl sm:text-3xl"
    }
  ];

  return (
    <div id="podiumCards" className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
      {podiumSlots.map((slot) => {
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
            className={`glass-card ${slot.glow} ${slot.orderClass} ${slot.cardClass} rounded-2xl flex flex-col justify-between relative hover:border-slate-600 transition group`}
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
                    className={`${avatarSize} rounded-full object-cover border border-slate-700 flex-shrink-0`}
                    alt=""
                    onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div
                    className="text-base sm:text-xl font-black text-white truncate"
                    title={t.manager}
                  >
                    {t.manager}
                  </div>
                  <div
                    className="text-xs sm:text-sm text-slate-400 font-medium truncate mt-0.5"
                    title={t.teamName}
                  >
                    {t.teamName}
                  </div>
                  <div
                    className="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1 mt-1"
                    title={`League: ${t.leagueName || (t as any).league || ""}`}
                  >
                    <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {t.leagueName || (t as any).league || "League"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 truncate">
                  {metricLabel}
                </div>
                <div
                  className={`${slot.scoreSize} font-black ${slot.color} font-mono leading-none mt-1`}
                >
                  {(t.points || 0).toFixed(2)}
                </div>
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-slate-400 text-right min-w-0">
                {subMetric}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
