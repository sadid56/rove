import type { ComponentProps, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../utils";
import { Label } from "./label";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends ComponentProps<"select"> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  leftIcon?: ReactNode;
  required?: boolean;
}

export function Select({
  label,
  error,
  helperText,
  options,
  leftIcon,
  className,
  id,
  children,
  required,
  ...props
}: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <Label htmlFor={selectId} required={required}>
          {label}
        </Label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <select
          id={selectId}
          required={required}
          className={cn(
            "w-full appearance-none rounded-lg border border-input bg-background px-4 py-2 pr-10 text-sm text-foreground transition-all outline-none cursor-pointer",
            "focus:border-ring focus:ring-1 focus:ring-ring",
            error && "border-destructive focus:border-destructive focus:ring-destructive/30",
            Boolean(leftIcon) && "pl-10",
            className,
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-popover text-popover-foreground">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute right-3.5 flex items-center pointer-events-none text-muted-foreground">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error ? (
        <p className="text-xs text-destructive font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}
