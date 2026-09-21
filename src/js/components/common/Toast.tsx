import React from "react";
import { useCrossLeagueStore } from "../../state/useCrossLeagueStore.js";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";
import { BrandBoltIcon } from "./BrandBoltIcon.tsx";

export const ToastContainer: React.FC = () => {
  const toasts = useCrossLeagueStore(s => s.toasts);
  const removeToast = useCrossLeagueStore(s => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      id="toastContainer"
      className="pointer-events-none fixed right-4 bottom-20 z-50 flex w-full max-w-sm flex-col gap-2 sm:right-6 sm:bottom-6"
    >
      {toasts.map(toast => {
        let borderClass = "border-slate-700 bg-slate-900/95 text-slate-200";
        let IconComponent: React.ElementType = BrandBoltIcon;
        let iconClass = "text-cyan-400";
        if (toast.type === "success") {
          borderClass = "border-emerald-500/40 bg-slate-900/95 text-emerald-300";
          IconComponent = CheckCircle2;
          iconClass = "text-emerald-400";
        } else if (toast.type === "error") {
          borderClass = "border-rose-500/40 bg-slate-900/95 text-rose-300";
          IconComponent = XCircle;
          iconClass = "text-rose-400";
        } else if (toast.type === "warning") {
          borderClass = "border-amber-500/40 bg-slate-900/95 text-amber-300";
          IconComponent = AlertTriangle;
          iconClass = "text-amber-400";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex translate-y-0 transform-gpu items-center justify-between gap-3 rounded-xl border px-4 py-3 opacity-100 shadow-2xl backdrop-blur-xl transition-all duration-300 ${borderClass}`}
          >
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <IconComponent className={`h-4 w-4 flex-shrink-0 ${iconClass}`} />
              <span>{toast.text}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="cursor-pointer rounded p-1 text-slate-400 transition hover:text-white"
              aria-label="Dismiss toast"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
