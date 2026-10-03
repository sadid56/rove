import React, { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "healthy"
    | "warning"
    | "failed"
    | "info"
    | "neutral"
    | "indigo";
  dot?: boolean;
  children: ReactNode;
}

export function Badge({
  variant = "neutral",
  dot,
  children,
  className,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border select-none transition-colors";

  const variantStyles = {
    healthy:
      "bg-success/15 text-success border-success/30 shadow-xs",
    warning:
      "bg-warning/15 text-warning border-warning/30 shadow-xs",
    failed:
      "bg-destructive/15 text-destructive border-destructive/30 shadow-xs",
    info:
      "bg-primary/15 text-primary border-primary/30 shadow-xs",
    neutral:
      "bg-secondary text-secondary-foreground border-border",
    indigo:
      "bg-primary/15 text-primary border-primary/30",
  };

  return (
    <span
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
