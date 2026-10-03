"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, PlusCircle, Globe, Play } from "lucide-react";
import {
  Button,
  Modal,
  Input,
  RoveLogo,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui";
import { useTriggerScan } from "@/react-query/scans/actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const triggerScanFormSchema = z.object({
  targetUrl: z.string().url("Must be a valid URL (e.g. https://example.com)"),
});

type TriggerScanFormValues = z.infer<typeof triggerScanFormSchema>;

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Overview",
  projects: "Projects",
  scans: "Scans",
  settings: "Settings",
};

export function DashboardHeader({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const triggerScan = useTriggerScan();
  const router = useRouter();
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    const segments = (pathname || "").split("/").filter(Boolean);
    const items: { label: string; href?: string }[] = [
      { label: "Workspace", href: "/dashboard" },
    ];

    if (segments.length <= 1) {
      items.push({ label: "Overview" });
      return items;
    }

    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      if (!seg) continue;

      const isLast = i === segments.length - 1;
      const href = `/${segments.slice(0, i + 1).join("/")}`;

      let label = ROUTE_LABELS[seg];
      if (!label) {
        const prevSeg = segments[i - 1];
        if (prevSeg === "scans") {
          label = "Scan Report";
        } else if (prevSeg === "projects") {
          label = "Project Details";
        } else {
          label = seg.charAt(0).toUpperCase() + seg.slice(1);
        }
      }

      items.push({
        label,
        href: isLast ? undefined : href,
      });
    }

    return items;
  }, [pathname]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TriggerScanFormValues>({
    resolver: zodResolver(triggerScanFormSchema),
    defaultValues: {
      targetUrl: "",
    },
  });

  const onSubmit = async (data: TriggerScanFormValues) => {
    try {
      const res = await triggerScan.mutateAsync({ targetUrl: data.targetUrl.trim() });
      setIsModalOpen(false);
      reset();
      if (res && res.id) {
        router.push(`/dashboard/scans/${res.id}`);
      }
    } catch {
    }
  };

  return (
    <>
      <header className="flex items-center justify-between h-16 px-6 bg-card border-b border-border sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onOpenMobileMenu}
            className="md:hidden -ml-2 text-muted-foreground hover:text-foreground"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="md:hidden">
            <RoveLogo size="sm" withContainer={true} showText={false} />
          </div>

          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.label + idx}>
                    {idx > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {crumb.href && !isLast ? (
                        <Link href={crumb.href} passHref legacyBehavior>
                          <BreadcrumbLink>{crumb.label}</BreadcrumbLink>
                        </Link>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <Input
            label="Target URL"
            type="url"
            placeholder="https://example.com"
            leftIcon={<Globe className="w-4 h-4" />}
            error={errors.targetUrl?.message}
            helperText="Supports modern SPAs, SSR, Next.js, and static websites."
            {...register("targetUrl")}
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
