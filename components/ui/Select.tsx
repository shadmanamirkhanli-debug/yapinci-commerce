import { cn } from "@/lib/utils/cn";
import {
  errorTextStyles,
  fieldBase,
  fieldStates,
  helperTextStyles,
  labelStyles,
} from "@/lib/ui/styles";

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> & {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
};

export default function Select({
  label,
  error,
  helperText,
  options,
  placeholder,
  className,
  id,
  disabled,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  const errorId = error ? `${selectId}-error` : undefined;
  const helperId = helperText ? `${selectId}-helper` : undefined;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={selectId} className={labelStyles}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={
          [errorId, helperId].filter(Boolean).join(" ") || undefined
        }
          className={cn(
            fieldBase,
            fieldStates,
            "appearance-none pr-10",
            error && "border-error focus:border-error focus:ring-error/20",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden="true"
        >
          ▾
        </span>
      </div>
      {error && (
        <p id={errorId} className={errorTextStyles} role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className={helperTextStyles}>
          {helperText}
        </p>
      )}
    </div>
  );
}

export type { SelectOption };
