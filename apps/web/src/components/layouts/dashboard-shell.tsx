"use client";

import React, { useState } from "react";
import { DashboardSidebar } from "@/components/layouts/sidebar";
import { DashboardHeader } from "@/components/layouts/header";
import { Sheet, Container } from "@repo/ui";
import { AiAssistantWidget } from "@/features/ai-studio/components/ai-assistant-widget";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className='flex h-screen w-full bg-background text-foreground overflow-hidden'>
      <div className='hidden md:flex shrink-0'>
        <DashboardSidebar />
      </div>

      <Sheet isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} side='left' className='max-w-xs p-0 border-r border-border'>
        <DashboardSidebar onClose={() => setMobileMenuOpen(false)} />
      </Sheet>

      <div className='flex flex-col flex-1 min-w-0 overflow-hidden relative'>
        <DashboardHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className='flex-1 overflow-y-auto py-6 md:py-8'>
          <Container>{children}</Container>
        </main>
        <AiAssistantWidget />
      </div>
    </div>
  );
}
