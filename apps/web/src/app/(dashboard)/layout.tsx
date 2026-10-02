"use client";

import React, { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { Sheet } from "@repo/ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <div className="hidden md:flex shrink-0">
        <DashboardSidebar />
      </div>

      <Sheet
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        side="left"
        className="max-w-xs p-0 border-r border-border"
      >
        <DashboardSidebar onClose={() => setMobileMenuOpen(false)} />
      </Sheet>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
