import { cn } from "@/lib/utils/cn";
import { disabledStyles, focusRing, labelStyles, transition } from "@/lib/ui/styles";

type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
  description?: string;
};

export default function Checkbox({
  label,
  description,
  className,
  id,
  disabled,
  ...props
}: CheckboxProps) {
  const checkboxId = id ?? label.toLowerCase().replace(/\s/g, "-");

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "group flex cursor-pointer items-start gap-3",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          id={checkboxId}
          disabled={disabled}
          className={cn(
            "peer h-5 w-5 shrink-0 appearance-none rounded-md border border-border bg-background",
            transition,
            focusRing,
            disabledStyles,
            "checked:border-primary checked:bg-primary",
            "hover:enabled:border-muted active:enabled:scale-95"
          )}
          {...props}
        />
        <svg
          className="pointer-events-none absolute hidden h-3 w-3 text-background peer-checked:block"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 6L5 9L10 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
