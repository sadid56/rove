import {
  LayoutDashboard,
  Radar,
  Route,
  Eye,
  Activity,
  Users2,
  ShieldCheck,
  Sparkles,
  Bot,
  Wrench,
  FolderKanban,
  Bug,
  Users,
  GitBranch,
  CreditCard,
  Settings,
} from "lucide-react";
import { NavSection } from "./types";

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Testing & Quality",
    items: [
      {
        label: "QA Suites",
        icon: Radar,
        children: [
          { label: "Automated Scans", href: "/dashboard/scans", icon: Radar },
          {
            label: "User Journeys",
            href: "/dashboard/journeys",
            icon: Route,
            badge: "E2E",
            badgeVariant: "info",
          },
          {
            label: "Visual Regression",
            href: "/dashboard/visual-regression",
            icon: Eye,
          },
          {
            label: "API Health Monitor",
            href: "/dashboard/api-monitor",
            icon: Activity,
            badge: "Live",
            badgeVariant: "healthy",
          },
          {
            label: "Synthetic Personas",
            href: "/dashboard/personas",
            icon: Users2,
            badge: "Chaos",
            badgeVariant: "warning",
          },
          {
            label: "Security Sentinel",
            href: "/dashboard/security",
            icon: ShieldCheck,
          },
        ],
      },
    ],
  },
  {
    title: "AI Studio",
    items: [
      {
        label: "AI Intelligence",
        icon: Sparkles,
        badge: "AI",
        badgeVariant: "info",
        children: [
          { label: "AI Vision Audit", href: "/dashboard/ai-audit", icon: Eye },
          {
            label: "AI Fix Generator",
            href: "/dashboard/ai-fixes",
            icon: Wrench,
            badge: "Auto",
            badgeVariant: "warning",
          },
        ],
      },
    ],
  },
  {
    title: "Collaboration & Ops",
    items: [
      {
        label: "Management",
        icon: FolderKanban,
        children: [
          { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
          {
            label: "Issue Tracker",
            href: "/dashboard/issues",
            icon: Bug,
            badge: "3",
            badgeVariant: "warning",
          },
          { label: "Team & Roles", href: "/dashboard/team", icon: Users },
          {
            label: "CI/CD & Integrations",
            href: "/dashboard/integrations",
            icon: GitBranch,
          },
        ],
      },
    ],
  },
  {
    title: "Account & System",
    items: [
      {
        label: "Billing & Plans",
        href: "/dashboard/billing",
        icon: CreditCard,
        badge: "Pro",
        badgeVariant: "info",
      },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export const DEFAULT_OPEN: Record<string, boolean> = {
  "QA Suites": true,
  "AI Intelligence": true,
  Management: true,
};

export const isPathActive = (pathname: string, href: string) =>
  href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");
