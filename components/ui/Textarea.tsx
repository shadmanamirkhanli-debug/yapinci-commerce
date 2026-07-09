import { cn } from "@/lib/utils/cn";
import {
  errorTextStyles,
  fieldBase,
  fieldStates,
  helperTextStyles,
  labelStyles,
} from "@/lib/ui/styles";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export default function Textarea({
  label,
  error,
  helperText,
  className,
  id,
  disabled,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  const errorId = error ? `${textareaId}-error` : undefined;
  const helperId = helperText ? `${textareaId}-helper` : undefined;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={textareaId} className={labelStyles}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [errorId, helperId].filter(Boolean).join(" ") || undefined
        }
        className={cn(
          fieldBase,
          fieldStates,
          "resize-none",
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
