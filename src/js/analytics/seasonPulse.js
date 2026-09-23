/** Build a squad's completed weekly scores with their recorded week numbers. */
export function getWeeklyScores(record) {
  return (record.weeklyPlayerRecords || []).flatMap((entry, index) => {
    const week = Number(entry.week);
    const points = record.weeklyScores?.[index];
    return Number.isInteger(week) && week > 0 && Number.isFinite(points) ? [{ week, points }] : [];
  });
}

/** Compare one squad with completed scores from its own league. */
export function calculateSeasonPulse(record, records) {
  const squadScores = getWeeklyScores(record);
  const scoresByWeek = new Map(squadScores.map(score => [score.week, score.points]));
  const leagueScores = new Map();

  records
    .filter(team => team.leagueId === record.leagueId)
    .forEach(team => {
      getWeeklyScores(team).forEach(({ week, points }) => {
        const scores = leagueScores.get(week) || [];
        scores.push(points);
        leagueScores.set(week, scores);
      });
    });

  const weeks = [...leagueScores.keys()]
    .sort((a, b) => a - b)
    .map(week => {
      const scores = leagueScores.get(week);
      return {
        week,
        squadPoints: scoresByWeek.get(week) ?? null,
        leagueAverage: scores.reduce((sum, points) => sum + points, 0) / scores.length
      };
    });

  const completed = [...squadScores].sort((a, b) => a.week - b.week);
  const bestWeek = completed.reduce(
    (best, score) => (!best || score.points > best.points ? score : best),
    null
  );
  const worstWeek = completed.reduce(
    (worst, score) => (!worst || score.points < worst.points ? score : worst),
    null
  );
  const seasonAverage = completed.length
    ? completed.reduce((sum, score) => sum + score.points, 0) / completed.length
    : null;
  const recent = completed.slice(-3);
  const recentAverage =
    recent.length === 3 ? recent.reduce((sum, score) => sum + score.points, 0) / 3 : null;

  return {
    weeks,
    bestWeek,
    worstWeek,
    seasonAverage,
    recentAverage,
    recentDelta: recentAverage === null ? null : recentAverage - seasonAverage
  };
}
