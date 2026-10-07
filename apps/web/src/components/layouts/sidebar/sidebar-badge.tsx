"use client";

import React, { memo } from "react";
import { cn } from "@/utils/cn";
import { BadgeVariant } from "./types";

const BADGE_STYLES: Record<BadgeVariant, string> = {
  healthy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  failed: "bg-red-500/15 text-red-600 dark:text-red-400",
  info: "bg-primary/15 text-primary",
  neutral: "bg-foreground/10 text-muted-foreground",
};

export const SidebarBadge = memo(function SidebarBadge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] shrink-0 items-center rounded-full px-2 text-[10px] font-semibold leading-none",
        BADGE_STYLES[variant]
      )}
    >
      {children}
    </span>
  );
});
