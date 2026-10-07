import type { ComponentProps, ReactNode } from "react";
import { cn } from "../utils";
import { Label } from "./label";

export { Label, type LabelProps } from "./label";

export interface InputProps extends ComponentProps<"input"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  required?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  id,
  required,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all outline-none",
            "focus:border-ring focus:ring-1 focus:ring-ring",
            error && "border-destructive focus:border-destructive focus:ring-destructive/30",
            Boolean(leftIcon) && "pl-10",
            Boolean(rightIcon) && "pr-10",
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 flex items-center text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-destructive font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}
