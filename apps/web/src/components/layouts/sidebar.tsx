"use client";

import React, { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "@/features/auth";
import { useGetMe } from "@/react-query/users/actions";
import {
  DEFAULT_OPEN,
  NAV_SECTIONS,
  NavItem,
  NavChildItem,
  isPathActive,
  SidebarHeader,
  SidebarNavItem,
  SidebarNavGroup,
  SidebarUserCard,
} from "./sidebar/index";

export * from "./sidebar/index";

export function DashboardSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname() ?? "";
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data: user, isLoading: isUserLoading } = useGetMe();
  const [openMenus, setOpenMenus] = useState(DEFAULT_OPEN);

  useEffect(() => {
    setOpenMenus((prev) => {
      let next = prev;
      for (const section of NAV_SECTIONS) {
        for (const item of section.items) {
          if (item.children && !prev[item.label] && item.children.some((c) => isPathActive(pathname, c.href))) {
            if (next === prev) next = { ...prev };
            next[item.label] = true;
          }
        }
      }
      return next;
    });
  }, [pathname]);

  const toggleMenu = useCallback((label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch {
    } finally {
      window.location.href = "/login";
    }
  }, [isLoggingOut]);

  return (
    <aside className="flex h-full w-64 select-none flex-col border-r border-border bg-card px-3 py-4 overflow-hidden">
      <SidebarHeader />

      <nav
        aria-label="Dashboard"
        className="flex-1 space-y-5 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0"
      >
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={section.title ?? `section-${sIdx}`} className="space-y-1">
            {section.title && (
              <h4 className="mb-1 px-3 text-xs font-semibold text-muted-foreground/80">
                {section.title}
              </h4>
            )}

            {section.items.map((item) =>
              item.children?.length ? (
                <SidebarNavGroup
                  key={item.label}
                  item={item as NavItem & { children: NavChildItem[] }}
                  pathname={pathname}
                  isOpen={!!openMenus[item.label]}
                  onToggle={toggleMenu}
                  onClose={onClose}
                />
              ) : (
                <SidebarNavItem
                  key={item.href ?? item.label}
                  href={item.href ?? "#"}
                  label={item.label}
                  icon={item.icon}
                  badge={item.badge}
                  badgeVariant={item.badgeVariant ?? "info"}
                  active={!!item.href && isPathActive(pathname, item.href)}
                  onClose={onClose}
                />
              )
            )}
          </div>
        ))}
      </nav>

      <div className="mt-3 pt-3">
        <SidebarUserCard
          user={user}
          isLoading={isUserLoading}
          isLoggingOut={isLoggingOut}
          onLogout={handleLogout}
        />
      </div>
    </aside>
  );
}