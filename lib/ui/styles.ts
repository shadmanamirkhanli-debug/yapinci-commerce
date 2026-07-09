import { cn } from "@/lib/utils/cn";

export const transition = "transition-all duration-300 ease-out";

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const disabledStyles =
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

export const interactiveStates =
  "hover:enabled:opacity-90 active:enabled:scale-[0.98]";

export const fieldBase =
  "w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted/60";

export const fieldStates = cn(
  transition,
  focusRing,
  "hover:enabled:border-muted",
  "focus:border-accent",
  disabledStyles
);

export const labelStyles =
  "text-xs font-medium tracking-[0.15em] uppercase text-muted";

export const errorTextStyles = "text-xs text-error";

export const helperTextStyles = "text-xs text-muted";
