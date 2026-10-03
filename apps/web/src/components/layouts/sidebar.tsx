"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Radar, Settings, LogOut } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button, RoveLogo, Skeleton } from "@repo/ui";
import { signOut } from "@/features/auth";
import { useGetMe } from "@/react-query/users/actions";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Scans", href: "/dashboard/scans", icon: Radar },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data: user, isLoading: isUserLoading } = useGetMe();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch {
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <aside className='flex flex-col h-full w-64 bg-card border-r border-border p-4 select-none'>
      <div className='flex items-center pb-6 border-b border-border mb-6'>
        <Link href='/dashboard'>
          <RoveLogo size='md' withContainer={true} subtitle='QA Intelligence' />
        </Link>
      </div>

      <nav className='flex-1 space-y-1'>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
              )}
            >
              <Icon className='w-4 h-4 shrink-0' />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className='pt-4 border-t border-border space-y-3'>
        <div className='flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/40 border border-border gap-2'>
          <div className='flex items-center gap-2 overflow-hidden min-w-0 flex-1'>
            {isUserLoading && !user ? (
              <div className='flex items-center gap-2 w-full'>
                <Skeleton className='w-7 h-7 rounded-full shrink-0' />
                <div className='space-y-1.5 flex-1 min-w-0'>
                  <Skeleton className='h-3 w-16' />
                  <Skeleton className='h-2.5 w-24' />
                </div>
              </div>
            ) : (
              <>
                <div className='w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 select-none'>
                  {(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
                </div>
                <div className='truncate min-w-0 flex-1'>
                  <p className='text-xs font-medium text-foreground truncate'>
                    {user?.name || (user?.email ? user.email.split("@")[0] : "Engineer")}
                  </p>
                  <p className='text-[10px] text-muted-foreground truncate'>
                    {user?.email || "qa@rove.dev"}
                  </p>
                </div>
              </>
            )}
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={handleLogout}
            disabled={isLoggingOut}
            className='h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-secondary cursor-pointer shrink-0'
            title='Sign out'
          >
            <LogOut className={cn("w-4 h-4", isLoggingOut && "animate-spin")} />
          </Button>
        </div>
      </div>
    </aside>
  );
}
