"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, type, message, title };

    setToasts((prev) => [...prev.slice(-4), newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const toastHelpers = {
    success: (msg: string, title?: string) => addToast("success", msg, title),
    error: (msg: string, title?: string) => addToast("error", msg, title),
    warning: (msg: string, title?: string) => addToast("warning", msg, title),
    info: (msg: string, title?: string) => addToast("info", msg, title),
  };

  return (
    <ToastContext.Provider value={{ toast: toastHelpers }}>
      {children}

      {/* Floating Toast Portal */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-up ${
              t.type === "success"
                ? "border-emerald-200 bg-emerald-950/90 text-emerald-100 shadow-emerald-900/20"
                : t.type === "error"
                ? "border-rose-200 bg-rose-950/90 text-rose-100 shadow-rose-900/20"
                : t.type === "warning"
                ? "border-amber-200 bg-amber-950/90 text-amber-100 shadow-amber-900/20"
                : "border-purple-200 bg-purple-950/90 text-purple-100 shadow-purple-900/20"
            }`}
          >
            <span className="mt-0.5 shrink-0">
              {t.type === "success" && <CheckCircle2 size={18} className="text-emerald-400" />}
              {t.type === "error" && <AlertCircle size={18} className="text-rose-400" />}
              {t.type === "warning" && <AlertTriangle size={18} className="text-amber-400" />}
              {t.type === "info" && <Info size={18} className="text-purple-400" />}
            </span>

            <div className="flex-1 min-w-0">
              {t.title && <h4 className="text-xs font-bold uppercase tracking-wider">{t.title}</h4>}
              <p className="text-xs leading-5 font-medium">{t.message}</p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-white/60 hover:text-white transition"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      toast: {
        success: (msg: string) => console.log("[Success Toast]", msg),
        error: (msg: string) => console.error("[Error Toast]", msg),
        warning: (msg: string) => console.warn("[Warning Toast]", msg),
        info: (msg: string) => console.info("[Info Toast]", msg),
      },
    };
  }
  return context;
}
