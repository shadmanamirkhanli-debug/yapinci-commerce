import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import {
  disabledStyles,
  focusRing,
  interactiveStates,
  transition,
} from "@/lib/ui/styles";

const variants = {
  primary:
    "bg-primary text-background hover:enabled:bg-primary/90 active:enabled:bg-primary/80",
  secondary:
    "border border-primary bg-transparent text-primary hover:enabled:bg-primary hover:enabled:text-background active:enabled:bg-primary/90",
  accent:
    "bg-accent text-background hover:enabled:bg-accent/90 active:enabled:bg-accent/80",
  ghost:
    "bg-transparent text-primary hover:enabled:bg-secondary active:enabled:bg-secondary/80",
  outline:
    "border border-border bg-background text-foreground hover:enabled:border-primary hover:enabled:bg-secondary active:enabled:bg-secondary/80",
  danger:
    "bg-error text-background hover:enabled:bg-error/90 active:enabled:bg-error/80",
} as const;

const sizes = {
  sm: "h-10 px-6 text-[10px]",
  md: "h-12 px-10 text-xs",
  lg: "h-14 px-12 text-xs",
} as const;

type ButtonBaseProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps & {
  href: string;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseStyles = cn(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[0.2em] uppercase shadow-sm",
  transition,
  focusRing,
  disabledStyles
);

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    interactiveStates,
    fullWidth && "w-full",
    loading && "pointer-events-none opacity-70",
    className
  );

  if ("href" in props && props.href) {
    const { href } = props;

    // API routes (e.g. file downloads) aren't part of next-intl's routing —
    // the locale-aware Link would incorrectly prefix them (/en/api/... 404s).
    if (href.startsWith("/api/")) {
      return (
        <a href={href} className={classes} aria-disabled={loading}>
          {loading && <ButtonSpinner />}
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} aria-disabled={loading}>
        {loading && <ButtonSpinner />}
        {children}
      </Link>
    );
  }

  const { type = "button", disabled, ...buttonProps } = props as ButtonAsButton;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      {...buttonProps}
    >
      {loading && <ButtonSpinner />}
      {children}
    </button>
  );
}

function ButtonSpinner() {
  return (
    <span
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
  );
}
