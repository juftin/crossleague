import React from "react";
import { useCrossLeagueStore } from "../../state/useCrossLeagueStore.js";
import { CheckCircle2, XCircle, AlertTriangle, Zap, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const toasts = useCrossLeagueStore((s) => s.toasts);
  const removeToast = useCrossLeagueStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div id="toastContainer" className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        let borderClass = "border-slate-700 bg-slate-900/95 text-slate-200";
        let IconComponent = Zap;
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
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform-gpu translate-y-0 opacity-100 ${borderClass}`}
          >
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <IconComponent className={`w-4 h-4 flex-shrink-0 ${iconClass}`} />
              <span>{toast.text}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
