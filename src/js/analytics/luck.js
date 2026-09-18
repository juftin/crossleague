/**
 * CrossLeague • Luck Index Analytics
 *
 * Quantifies schedule luck by subtracting expected wins (based on all-play scoring)
 * from actual head-to-head match wins: Luck = Actual Wins - Expected Wins.
 */

/**
 * Computes schedule luck index from actual head-to-head wins and expected wins.
 *
 * @param {number} actualWins Actual wins earned (e.g. 1.0 for win, 0.5 for tie, 0 for loss)
 * @param {number} expectedWins Expected wins derived from all-play performance
 * @returns {number} Luck index (positive = lucky, negative = unlucky)
 */
export function calculateLuckIndex(actualWins, expectedWins) {
  const luck = Number(actualWins || 0) - Number(expectedWins || 0);
  return Math.round(luck * 100) / 100;
}

/**
 * Returns the luck tier classification for a given luck value.
 *
 * @param {number} luckVal Computed luck index
 * @returns {"LUCKY" | "UNLUCKY" | "FAIR"} Luck tier name
 */
export function getLuckCategory(luckVal) {
  if (luckVal >= 0.5) return "LUCKY";
  if (luckVal <= -0.5) return "UNLUCKY";
  return "FAIR";
}

/**
 * Formats a HTML badge string representation of a luck index.
 *
 * @param {number} luckVal Luck index value
 * @param {boolean} isSeason Whether in season rollup mode
 * @param {number|string} actWinsStr Actual wins label
 * @param {number|string} expWinsStr Expected wins label
 * @returns {string} HTML markup string
 */
export function formatLuckBadge(luckVal, _isSeason = false, actWinsStr = "0", expWinsStr = "0.00") {
  const val = Number(luckVal || 0);
  const formatted = val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2);

  if (val >= 0.5) {
    return `
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm cursor-help" title="🍀 Lucky Schedule Draw: Gained +${val.toFixed(2)} bonus wins above expected (${actWinsStr} actual vs ${expWinsStr} expected based on scoring)">
        <span>🍀</span> ${formatted}
      </span>
    `;
  }
  if (val <= -0.5) {
    return `
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-mono font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm cursor-help" title="💔 Unlucky Schedule Draw: Lost ${Math.abs(val).toFixed(2)} wins below expected (${actWinsStr} actual vs ${expWinsStr} expected due to tough opponent scores)">
        <span>💔</span> ${formatted}
      </span>
    `;
  }
  return `
    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-mono font-black bg-slate-800 text-slate-300 border border-slate-700 cursor-help" title="⚖️ Fair Schedule: Actual outcome closely matches scoring performance (${val >= 0 ? "+" : ""}${val.toFixed(2)} vs ${expWinsStr} expected)">
      <span>⚖️</span> ${formatted}
    </span>
  `;
}
