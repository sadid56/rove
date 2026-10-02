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
  dot = false,
  children,
  className,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border select-none transition-colors";

  const variantStyles = {
    healthy:
      "bg-emerald-950/40 text-emerald-400 border-emerald-800/50 shadow-sm shadow-emerald-950/20",
    warning:
      "bg-amber-950/40 text-amber-400 border-amber-800/50 shadow-sm shadow-amber-950/20",
    failed:
      "bg-rose-950/40 text-rose-400 border-rose-800/50 shadow-sm shadow-rose-950/20",
    info:
      "bg-cyan-950/40 text-cyan-400 border-cyan-800/50 shadow-sm shadow-cyan-950/20",
    neutral:
      "bg-zinc-800/60 text-zinc-300 border-zinc-700/50",
    indigo:
      "bg-indigo-950/40 text-indigo-400 border-indigo-800/50",
  };

  const dotColors = {
    healthy: "bg-emerald-400 animate-pulse",
    warning: "bg-amber-400",
    failed: "bg-rose-400 animate-pulse",
    info: "bg-cyan-400",
    neutral: "bg-zinc-400",
    indigo: "bg-indigo-400",
  };

  return (
    <span
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
