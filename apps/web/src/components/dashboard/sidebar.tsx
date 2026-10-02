"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Radar,
  Settings,
  ShieldCheck,
  LogOut,
  ExternalLink
} from "lucide-react";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Scans", href: "/dashboard/scans", icon: Radar },
  { label: "Settings", href: "/dashboard/settings", icon: Settings }
];

export function DashboardSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
    } catch {
      // ignore
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <aside className="flex flex-col h-full w-64 bg-card border-r border-border p-4 select-none">
      <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-foreground">ROVE</span>
            <span className="block text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              QA Intelligence
            </span>
          </div>
        </Link>
        <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-md bg-secondary text-secondary-foreground border border-border">
          v0.1
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-border space-y-3">
        <a
          href="http://localhost:4000/docs"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/40 transition-colors"
        >
          <span>API Swagger Docs</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/40 border border-border">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              U
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-foreground truncate">Engineer</p>
              <p className="text-[10px] text-muted-foreground truncate">qa@rove.dev</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-secondary cursor-pointer disabled:opacity-50"
            title="Sign out"
          >
            <LogOut className={cn("w-4 h-4", isLoggingOut && "animate-spin")} />
          </button>
        </div>
      </div>
    </aside>
  );
}
