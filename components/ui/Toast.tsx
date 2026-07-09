"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils/cn";
import { focusRing, transition } from "@/lib/ui/styles";

export type ToastVariant = "default" | "success" | "warning" | "error";

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextValue = {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastMessage, "id">) => {
      const id = crypto.randomUUID();
      const nextToast: ToastMessage = { id, ...toast };

      setToasts((prev) => [...prev, nextToast]);

      window.setTimeout(() => {
        dismissToast(id);
      }, toast.duration ?? 4000);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}

const variants = {
  default: "border-border bg-background text-foreground",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/20 bg-warning/10 text-warning",
  error: "border-error/20 bg-error/10 text-error",
} as const;

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-3"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            "pointer-events-auto animate-fade-in-up rounded-2xl border px-4 py-3 shadow-lg",
            variants[toast.variant ?? "default"]
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{toast.title}</p>
              {toast.description && (
                <p className="mt-1 text-xs opacity-80">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              aria-label="Bağla"
              onClick={() => onDismiss(toast.id)}
              className={cn(
                "rounded-full px-2 py-1 text-xs opacity-70",
                transition,
                focusRing,
                "hover:opacity-100 active:scale-95"
              )}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Toast({
  title,
  description,
  variant = "default",
  onDismiss,
}: {
  title: string;
  description?: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
}) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-2xl border px-4 py-3 shadow-md",
        variants[variant]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{title}</p>
          {description && (
            <p className="mt-1 text-xs opacity-80">{description}</p>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            aria-label="Bağla"
            onClick={onDismiss}
            className={cn(
              "rounded-full px-2 py-1 text-xs opacity-70",
              transition,
              focusRing,
              "hover:opacity-100 active:scale-95"
            )}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
