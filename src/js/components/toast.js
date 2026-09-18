/**
 * CrossLeague • Toast Notification System
 */

import { escapeHtml } from "./dom.js";

/**
 * Displays a transient floating toast notification message.
 *
 * @param {string} message Text message to display
 * @param {string} [icon] Emoji icon
 */
export function showToast(message, icon = "✨") {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className =
    "toast-enter glass-card bg-slate-900/95 border border-emerald-500/40 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur pointer-events-auto";
  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("toast-visible");
    toast.classList.remove("toast-enter");
  });

  setTimeout(() => {
    toast.classList.add("toast-exit");
    toast.classList.remove("toast-visible");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
