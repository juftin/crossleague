/**
 * CrossLeague • League Filter & Custom League IDs Dropdowns
 */

import { state } from "../state/store.js";
import { escapeHtml } from "./dom.js";
import { removeCustomLeagueId } from "../state/urlParams.js";

/**
 * Renders chips for all user-added custom league IDs inside settings modal.
 */
export function renderCustomLeagueIdChips() {
  const customLeagueIdsChips = document.getElementById("customLeagueIdsChips");
  const leagueIdsCountBadge = document.getElementById("leagueIdsCountBadge");
  const customLeaguesDropdownLabel = document.getElementById("customLeaguesDropdownLabel");

  if (!customLeagueIdsChips) return;
  customLeagueIdsChips.innerHTML = "";

  if (state.customLeagueIds.size === 0) {
    const placeholder = document.createElement("div");
    placeholder.id = "noLeagueIdsPlaceholder";
    placeholder.className = "text-[11px] text-slate-500 italic p-1";
    placeholder.textContent = "No League IDs added yet. Paste or enter IDs above.";
    customLeagueIdsChips.appendChild(placeholder);
  } else {
    state.customLeagueIds.forEach(id => {
      const chip = document.createElement("div");
      chip.className =
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-mono group";
      chip.innerHTML = `
        <span class="text-[10px] text-emerald-400 font-bold">#</span>
        <span>${escapeHtml(id)}</span>
        <button
          type="button"
          class="text-slate-400 hover:text-rose-400 transition cursor-pointer ml-0.5 p-0.5"
          title="Remove League ID"
          aria-label="Remove League ${escapeHtml(id)}"
        >
          ✕
        </button>
      `;
      const rmBtn = chip.querySelector("button");
      rmBtn.addEventListener("click", e => {
        e.stopPropagation();
        removeCustomLeagueId(id, renderCustomLeagueIdChips);
      });
      customLeagueIdsChips.appendChild(chip);
    });
  }

  if (leagueIdsCountBadge) {
    leagueIdsCountBadge.textContent = `${state.customLeagueIds.size} ${state.customLeagueIds.size === 1 ? "ID" : "IDs"}`;
  }
  if (customLeaguesDropdownLabel) {
    if (state.customLeagueIds.size === 0) {
      customLeaguesDropdownLabel.textContent = "View Added IDs";
    } else if (state.customLeagueIds.size === 1) {
      customLeaguesDropdownLabel.textContent = "1 League ID Added";
    } else {
      customLeaguesDropdownLabel.textContent = `${state.customLeagueIds.size} League IDs Added`;
    }
  }
}

/**
 * Renders the top header League filter dropdown with checkboxes for active leagues.
 *
 * @param {Function} [onFilterChangeCallback] Optional callback invoked on checkbox toggles
 */
export function renderLeagueDropdown(onFilterChangeCallback = null) {
  const leagueDropdownList = document.getElementById("leagueDropdownList");
  const leagueDropdownContainer = document.getElementById("leagueDropdownContainer");
  const leagueDropdownLabel = document.getElementById("leagueDropdownLabel");
  const leagueDropdownBadge = document.getElementById("leagueDropdownBadge");
  const selectAllLeaguesBtn = document.getElementById("selectAllLeaguesBtn");
  const clearAllLeaguesBtn = document.getElementById("clearAllLeaguesBtn");

  if (!leagueDropdownList) return;
  leagueDropdownList.innerHTML = "";

  if (
    (!state.allLeaguesData || state.allLeaguesData.length === 0) &&
    state.rawRecords &&
    state.rawRecords.length > 0
  ) {
    state.allLeaguesData = Array.from(new Set(state.rawRecords.map(r => r.leagueId))).map(lid => {
      const sample = state.rawRecords.find(r => r.leagueId === lid);
      return {
        league_id: lid,
        name:
          (state.leaguesMap[lid] && state.leaguesMap[lid].name) ||
          (sample && sample.league) ||
          `League ${lid}`,
        avatar:
          (state.leaguesMap[lid] && state.leaguesMap[lid].avatar) ||
          (sample && sample.leagueAvatar) ||
          null,
        platform:
          (sample && sample.platform) || (String(lid).startsWith("espn:") ? "espn" : "sleeper")
      };
    });
    if (state.selectedLeagueIds.size === 0) {
      state.selectedLeagueIds = new Set(state.allLeaguesData.map(l => l.league_id));
    }
  }

  const total = state.allLeaguesData.length;
  const active = state.selectedLeagueIds.size;

  if (leagueDropdownContainer) {
    leagueDropdownContainer.classList.remove("hidden");
  }

  if (leagueDropdownLabel) {
    if (active === total && total > 0) {
      leagueDropdownLabel.textContent = `All Leagues (${total})`;
    } else if (active === 0 && total > 0) {
      leagueDropdownLabel.textContent = "No Leagues Selected";
    } else if (active === 1 && total > 0) {
      const singleId = Array.from(state.selectedLeagueIds)[0];
      const l =
        state.leaguesMap[singleId] || state.allLeaguesData.find(x => x.league_id === singleId);
      leagueDropdownLabel.textContent = l ? l.name : "1 League Selected";
    } else if (total > 0) {
      leagueDropdownLabel.textContent = `${active} of ${total} Leagues Selected`;
    } else {
      leagueDropdownLabel.textContent = "No leagues synced yet";
    }
  }

  if (leagueDropdownBadge) {
    leagueDropdownBadge.textContent = total > 0 ? `${active} / ${total}` : "0";
    if (active === 0 && total > 0) {
      leagueDropdownBadge.className =
        "text-[10px] font-bold text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded-full border border-rose-500/30 font-mono";
    } else {
      leagueDropdownBadge.className =
        "text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-500/30 font-mono";
    }
  }

  if (selectAllLeaguesBtn) selectAllLeaguesBtn.disabled = total === 0;
  if (clearAllLeaguesBtn) clearAllLeaguesBtn.disabled = total === 0;

  if (total === 0) {
    leagueDropdownList.innerHTML = `
      <div class="text-[11px] text-slate-500 italic p-3 text-center">
        Sync your account or League IDs in Settings to view and filter active leagues.
      </div>
    `;
    return;
  }

  state.allLeaguesData.forEach(league => {
    const lid = league.league_id;
    const lname = league.name || `League ${lid}`;
    const isChecked = state.selectedLeagueIds.has(lid);
    const squadCount = state.rawRecords.filter(r => r.leagueId === lid).length;
    const isEspn = String(lid).startsWith("espn:") || league.platform === "espn";
    const platformBadge = isEspn
      ? `<span class="badge-espn text-[9px] font-bold px-1.5 py-0.5 rounded ml-1.5 align-middle">ESPN</span>`
      : `<span class="badge-sleeper text-[9px] font-bold px-1.5 py-0.5 rounded ml-1.5 align-middle">Sleeper</span>`;

    const item = document.createElement("label");
    item.className =
      "flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-800/80 transition cursor-pointer select-none border border-transparent hover:border-slate-700/50";

    item.innerHTML = `
      <input
        type="checkbox"
        value="${lid}"
        ${isChecked ? "checked" : ""}
        class="mt-1 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0 transition cursor-pointer flex-shrink-0"
      />
      <div class="flex-1 min-w-0 pr-1">
        <div class="text-xs font-bold text-slate-200 leading-snug break-words flex items-center flex-wrap gap-1">
          <span>${escapeHtml(lname)}</span>
          ${platformBadge}
        </div>
        <div class="text-[10px] text-slate-500 font-medium mt-0.5">
          ${squadCount} squads
        </div>
      </div>
    `;

    const cb = item.querySelector('input[type="checkbox"]');
    cb.addEventListener("change", e => {
      if (e.target.checked) {
        state.selectedLeagueIds.add(lid);
      } else {
        state.selectedLeagueIds.delete(lid);
      }
      renderLeagueDropdown(onFilterChangeCallback);
      if (typeof onFilterChangeCallback === "function") {
        onFilterChangeCallback();
      }
    });

    leagueDropdownList.appendChild(item);
  });
}
