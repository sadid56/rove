"use client";

import React, { memo } from "react";
import { LogOut } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button, Skeleton } from "@repo/ui";

export const SidebarUserCard = memo(function SidebarUserCard({
  user,
  isLoading,
  isLoggingOut,
  onLogout,
}: {
  user?: { name?: string | null; email?: string | null } | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  onLogout: () => void;
}) {
  const initial = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();
  const displayName = user?.name || (user?.email ? user.email.split("@")[0] : "Engineer");

  return (
    <div className='flex items-center justify-between gap-2 rounded-2xl bg-secondary/50 p-2 border border-border/50'>
      <div className='flex min-w-0 flex-1 items-center gap-2.5'>
        {isLoading && !user ? (
          <>
            <Skeleton className='h-9 w-9 shrink-0 rounded-full' />
            <div className='min-w-0 flex-1 space-y-1.5'>
              <Skeleton className='h-3 w-16' />
              <Skeleton className='h-2.5 w-24' />
            </div>
          </>
        ) : (
          <>
            <div className='flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary'>
              {initial}
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-[13px] font-medium text-foreground'>{displayName}</p>
              <p className='truncate text-[11px] text-muted-foreground'>{user?.email || "qa@rove.dev"}</p>
            </div>
          </>
        )}
      </div>

      <Button
        type='button'
        variant='ghost'
        size='icon'
        onClick={onLogout}
        disabled={isLoggingOut}
        title='Sign out'
        aria-label='Sign out'
        className='h-9 w-9 shrink-0 cursor-pointer rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
      >
        <LogOut className={cn("h-4 w-4", isLoggingOut && "animate-pulse")} />
      </Button>
    </div>
  );
});
