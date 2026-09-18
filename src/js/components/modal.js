/**
 * CrossLeague • Modal Management (Settings Modal & Luck Methodology Modal)
 */

/**
 * Opens the Settings & League Filter modal.
 */
export function openSettingsModal() {
  const settingsModal = document.getElementById("settingsModal");
  const settingsBackdrop = document.getElementById("settingsBackdrop");
  const settingsDropdownChevron = document.getElementById("settingsDropdownChevron");
  const btnOpenSettingsModal = document.getElementById("btnOpenSettingsModal");
  const userIdInput = document.getElementById("userIdInput");

  if (settingsModal) {
    settingsModal.classList.remove("hidden");
    if (settingsBackdrop) settingsBackdrop.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    if (settingsDropdownChevron) settingsDropdownChevron.classList.add("rotate-180");
    if (btnOpenSettingsModal) btnOpenSettingsModal.setAttribute("aria-expanded", "true");
    if (userIdInput && window.innerWidth >= 640) {
      setTimeout(() => userIdInput.focus(), 50);
    }
  }
}

/**
 * Closes the Settings modal.
 */
export function closeSettingsModal() {
  const settingsModal = document.getElementById("settingsModal");
  const settingsBackdrop = document.getElementById("settingsBackdrop");
  const leagueDropdownMenu = document.getElementById("leagueDropdownMenu");
  const leagueDropdownChevron = document.getElementById("leagueDropdownChevron");
  const leagueDropdownBtn = document.getElementById("leagueDropdownBtn");
  const settingsDropdownChevron = document.getElementById("settingsDropdownChevron");
  const btnOpenSettingsModal = document.getElementById("btnOpenSettingsModal");

  if (settingsModal) {
    settingsModal.classList.add("hidden");
    if (settingsBackdrop) settingsBackdrop.classList.add("hidden");
    if (leagueDropdownMenu) leagueDropdownMenu.classList.add("hidden");
    if (leagueDropdownChevron) leagueDropdownChevron.classList.remove("rotate-180");
    if (leagueDropdownBtn) leagueDropdownBtn.setAttribute("aria-expanded", "false");
    const luckModal = document.getElementById("luckMethodologyModal");
    if (!luckModal || luckModal.classList.contains("hidden")) {
      document.body.classList.remove("overflow-hidden");
    }
    if (settingsDropdownChevron) settingsDropdownChevron.classList.remove("rotate-180");
    if (btnOpenSettingsModal) btnOpenSettingsModal.setAttribute("aria-expanded", "false");
  }
}

/**
 * Toggles opening and closing of Settings dropdown modal.
 *
 * @param {Event} [e] Optional click event
 */
export function toggleSettingsDropdown(e) {
  if (e) e.stopPropagation();
  const settingsModal = document.getElementById("settingsModal");
  const leagueDropdownMenu = document.getElementById("leagueDropdownMenu");
  const leagueDropdownChevron = document.getElementById("leagueDropdownChevron");
  const leagueDropdownBtn = document.getElementById("leagueDropdownBtn");

  if (settingsModal && !settingsModal.classList.contains("hidden")) {
    closeSettingsModal();
  } else {
    if (leagueDropdownMenu && !leagueDropdownMenu.classList.contains("hidden")) {
      leagueDropdownMenu.classList.add("hidden");
      if (leagueDropdownChevron) leagueDropdownChevron.classList.remove("rotate-180");
      if (leagueDropdownBtn) leagueDropdownBtn.setAttribute("aria-expanded", "false");
    }
    openSettingsModal();
  }
}

/**
 * Opens the Luck Index Methodology informative modal.
 */
export function openLuckModal() {
  const modal = document.getElementById("luckMethodologyModal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }
}

/**
 * Closes the Luck Index Methodology modal.
 */
export function closeLuckModal() {
  const modal = document.getElementById("luckMethodologyModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }
}
