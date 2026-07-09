import { cn } from "@/lib/utils/cn";
import { disabledStyles, focusRing, labelStyles, transition } from "@/lib/ui/styles";

type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  description?: string;
};

export default function Radio({
  label,
  description,
  className,
  id,
  disabled,
  ...props
}: RadioProps) {
  const radioId = id ?? label.toLowerCase().replace(/\s/g, "-");

  return (
    <label
      htmlFor={radioId}
      className={cn(
        "group flex cursor-pointer items-start gap-3",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          type="radio"
          id={radioId}
          disabled={disabled}
          className={cn(
            "peer h-5 w-5 shrink-0 appearance-none rounded-full border border-border bg-background",
            transition,
            focusRing,
            disabledStyles,
            "checked:border-primary",
            "hover:enabled:border-muted active:enabled:scale-95"
          )}
          {...props}
        />
        <span className="pointer-events-none absolute hidden h-2.5 w-2.5 rounded-full bg-primary peer-checked:block" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className={cn(labelStyles, "normal-case tracking-normal text-sm text-foreground")}>
          {label}
        </span>
        {description && (
          <span className="text-xs text-muted">{description}</span>
        )}
      </span>
    </label>
  );
}
