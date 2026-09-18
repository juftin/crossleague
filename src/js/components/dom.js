/**
 * CrossLeague • DOM Utilities & UI Helpers
 */

import { updateWeekNavigatorUI } from "../state/preferences.js";

/**
 * Escapes HTML special characters in strings to prevent XSS injection.
 *
 * @param {string} str Input string
 * @returns {string} Sanitized string
 */
export function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Creates accessible card header titles with hover/click information popovers.
 *
 * @param {string} title Main title text
 * @param {string} infoText Descriptive help tooltip text
 * @param {string} [badgeClasses] CSS class string for title badge
 * @param {boolean} [isRightAligned] Whether to anchor popover to right
 * @returns {string} HTML markup string
 */
export function createCardTitleWithInfo(
  title,
  infoText,
  badgeClasses = "text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700",
  isRightAligned = false
) {
  const popoverAlignClass = isRightAligned ? "popover-right" : "";
  return `
    <div class="card-info-wrapper group">
      <button type="button" class="card-info-trigger ${badgeClasses} flex items-center gap-1.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label="More info about ${escapeHtml(title)}" aria-expanded="false">
        <span>${escapeHtml(title)}</span>
        <svg class="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
          <line x1="12" y1="16" x2="12" y2="12" stroke-width="2" stroke-linecap="round"></line>
          <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2.5" stroke-linecap="round"></line>
        </svg>
      </button>
      <div class="card-info-popover ${popoverAlignClass}" role="tooltip">
        <div class="font-bold text-white text-xs mb-1">${escapeHtml(title)}</div>
        <div class="text-slate-300 text-[11px] leading-relaxed font-normal">${escapeHtml(infoText)}</div>
      </div>
    </div>
  `;
}

/**
 * Toggles global loading state, spinners, progress bar, and skeleton animations.
 *
 * @param {boolean} isLoading Whether fetching data
 * @param {string} [text] Loading message
 */
export function setLoading(isLoading, text = "Loading data from Sleeper API...") {
  const loadBtn = document.getElementById("loadBtn");
  const btnText = document.getElementById("btnText");
  const btnIcon = document.getElementById("btnIcon");
  const prevWeekBtn = document.getElementById("prevWeekBtn");
  const nextWeekBtn = document.getElementById("nextWeekBtn");
  const statusContainer = document.getElementById("statusContainer");
  const errorBanner = document.getElementById("errorBanner");
  const skeletonLoader = document.getElementById("skeletonLoader");
  const reportContent = document.getElementById("reportContent");
  const initialState = document.getElementById("initialState");
  const statusText = document.getElementById("statusText");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");

  if (isLoading) {
    if (loadBtn) {
      loadBtn.disabled = true;
      loadBtn.classList.add("opacity-75", "cursor-not-allowed");
    }
    if (btnText) btnText.textContent = "Loading...";
    if (btnIcon) btnIcon.classList.add("animate-spin");
    if (prevWeekBtn) prevWeekBtn.disabled = true;
    if (nextWeekBtn) nextWeekBtn.disabled = true;
    if (statusContainer) statusContainer.classList.remove("hidden");
    if (errorBanner) errorBanner.classList.add("hidden");
    if (skeletonLoader) skeletonLoader.classList.remove("hidden");
    if (reportContent) reportContent.classList.add("hidden");
    if (initialState) initialState.classList.add("hidden");
    if (statusText) {
      statusText.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> ${text}`;
    }
    if (progressBar) progressBar.style.width = "5%";
    if (progressText) progressText.textContent = "5%";
  } else {
    if (loadBtn) {
      loadBtn.disabled = false;
      loadBtn.classList.remove("opacity-75", "cursor-not-allowed");
    }
    if (btnText) btnText.textContent = "Load";
    if (btnIcon) btnIcon.classList.remove("animate-spin");
    updateWeekNavigatorUI();
    if (statusContainer) statusContainer.classList.add("hidden");
    if (skeletonLoader) skeletonLoader.classList.add("hidden");
  }
}

/**
 * Updates loading progress bar percentage and status message text.
 *
 * @param {number} percent Progress percentage (0 - 100)
 * @param {string} [msg] Status text
 */
export function updateProgress(percent, msg) {
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const statusText = document.getElementById("statusText");

  if (progressBar) progressBar.style.width = `${percent}%`;
  if (progressText) progressText.textContent = `${Math.round(percent)}%`;
  if (msg && statusText) {
    statusText.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> ${msg}`;
  }
}

/**
 * Displays error message banner and resets loading indicator.
 *
 * @param {string} msg Error message to show
 */
export function showError(msg) {
  const errorMessage = document.getElementById("errorMessage");
  const errorBanner = document.getElementById("errorBanner");
  const initialState = document.getElementById("initialState");

  if (errorMessage) errorMessage.textContent = msg;
  if (errorBanner) errorBanner.classList.remove("hidden");
  setLoading(false);
  if (initialState) initialState.classList.remove("hidden");
}

export { getAvatarUrl } from "../api/sleeper.js";
export { triggerConfetti } from "./tabs.js";
export { updateModeUI, setPlatform, setSyncType } from "../state/preferences.js";
