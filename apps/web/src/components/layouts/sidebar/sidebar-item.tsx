"use client";

import React, { memo } from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { BadgeVariant, IconType } from "./types";
import { SidebarBadge } from "./sidebar-badge";

export const ITEM_ROW_BASE =
  "group relative flex w-full items-center justify-between gap-2 rounded-xl px-3 text-[13px] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/50";

export const ITEM_ROW_IDLE = "text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent";

export const ITEM_ROW_ACTIVE = "bg-accent hover:bg-accent text-foreground font-semibold";

export const SidebarNavItem = memo(function SidebarNavItem({
  href,
  label,
  icon: Icon,
  badge,
  badgeVariant,
  active,
  onClose,
  compact = false,
}: {
  href: string;
  label: string;
  icon?: IconType;
  badge?: string;
  badgeVariant?: BadgeVariant;
  active: boolean;
  onClose?: () => void;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      aria-current={active ? "page" : undefined}
      className={cn(ITEM_ROW_BASE, compact ? "h-9" : "h-10", active ? ITEM_ROW_ACTIVE : ITEM_ROW_IDLE)}
    >
      <span className='flex min-w-0 items-center gap-3'>
        {Icon && (
          <Icon
            className={cn(
              "shrink-0 transition-colors",
              compact ? "h-4 w-4" : "h-[18px] w-[18px]",
              active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
            )}
          />
        )}
        <span className='truncate'>{label}</span>
      </span>
      {badge && <SidebarBadge variant={badgeVariant}>{badge}</SidebarBadge>}
    </Link>
  );
});
