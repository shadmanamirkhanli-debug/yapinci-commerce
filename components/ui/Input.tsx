import { cn } from "@/lib/utils/cn";
import {
  errorTextStyles,
  fieldBase,
  fieldStates,
  helperTextStyles,
  labelStyles,
} from "@/lib/ui/styles";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export default function Input({
  label,
  error,
  helperText,
  className,
  id,
  disabled,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className={labelStyles}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [errorId, helperId].filter(Boolean).join(" ") || undefined
        }
        className={cn(
          fieldBase,
          fieldStates,
          error && "border-error focus:border-error focus:ring-error/20",
          className
        )}
        {...props}
      />
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
