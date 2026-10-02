"use client";

import React, { useState } from "react";
import { Menu, PlusCircle, Globe, Play } from "lucide-react";
import { Button, Modal, Input } from "@repo/ui";
import { useTriggerScan } from "@/react-query/scans/actions";
import { useRouter } from "next/navigation";

export function DashboardHeader({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const triggerScan = useTriggerScan();
  const router = useRouter();

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    try {
      const res = await triggerScan.mutateAsync({ targetUrl: targetUrl.trim() });
      setIsModalOpen(false);
      setTargetUrl("");
      if (res && res.id) {
        router.push(`/dashboard/scans/${res.id}`);
      }
    } catch {
      // handled by useAppMutation
    }
  };

  return (
    <>
      <header className="flex items-center justify-between h-16 px-6 bg-card border-b border-border sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg md:hidden hover:bg-secondary"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-foreground">Workspace</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground font-mono text-xs">Production QA</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            New Scan
          </Button>
        </div>
      </header>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Start Automated QA Scan"
        description="Enter a deployed website URL. Rove will crawl routes, inspect runtime errors, network traffic, and capture screenshots."
      >
        <form onSubmit={handleStartScan} className="space-y-4 pt-2">
          <Input
            label="Target URL"
            type="url"
            placeholder="https://example.com"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            leftIcon={<Globe className="w-4 h-4" />}
            required
            helperText="Supports modern SPAs, SSR, Next.js, and static websites."
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={triggerScan.isPending}
              leftIcon={<Play className="w-4 h-4" />}
            >
              Start Browser Scan
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
