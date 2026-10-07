"use client";

import React, { memo } from "react";
import Link from "next/link";
import { RoveLogo } from "@repo/ui";

export const SidebarHeader = memo(function SidebarHeader() {
  return (
    <div className="mb-3 px-1 pb-4 border-b border-border/40">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <RoveLogo size="md" withContainer subtitle="QA Intelligence" />
      </Link>
    </div>
  );
});
