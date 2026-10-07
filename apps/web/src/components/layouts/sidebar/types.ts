import React from "react";

export type IconType = React.ComponentType<{ className?: string }>;
export type BadgeVariant = "healthy" | "warning" | "failed" | "info" | "neutral";

export interface NavChildItem {
  label: string;
  href: string;
  icon?: IconType;
  badge?: string;
  badgeVariant?: BadgeVariant;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: IconType;
  badge?: string;
  badgeVariant?: BadgeVariant;
  children?: NavChildItem[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}
