"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "../utils";

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

  const sizeStyles = {
    sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
    md: "h-9 px-4 text-sm rounded-lg gap-2",
    lg: "h-11 px-6 text-base rounded-lg gap-2.5",
    icon: "h-9 w-9 p-0 rounded-lg justify-center",
  };

  const variantStyles = {
    primary:
      "bg-primary text-primary-foreground hover:opacity-90 active:opacity-100 shadow-sm font-medium",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border shadow-xs",
    outline:
      "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground border border-border",
    ghost:
      "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent",
    destructive:
      "bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
