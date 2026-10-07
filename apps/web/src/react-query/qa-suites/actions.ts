import { useQuery } from "@tanstack/react-query";
import { useAppMutation } from "@/hooks/useAppMutation";
import { client } from "@/lib/orpc";
import { qaKeys } from "./keys";
import type {
  CreateJourneyInput,
  CreateApiMonitorInput,
  CreateIssueInput,
  InviteTeamMemberInput,
  UpdateBillingPlanInput,
  CreateCheckoutSessionInput,
  CreatePortalSessionInput,
  AiChatInput,
} from "@repo/contract";

export interface JourneyItem {
  id: string;
  name: string;
  description: string | null;
  stepsCount: number;
  lastRun: string | null;
  status: "passed" | "failed" | "running";
  selfHealed: boolean | null;
  duration: string | null;
  steps: Array<{
    step: number;
    action: string;
    target: string;
    status: "passed" | "failed";
  }>;
  createdAt: string;
}

export interface ApiMonitorItem {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  status: number;
  latencyMs: number;
  uptimePercent: number;
  lastChecked: string | null;
  createdAt: string;
}

export interface QaIssueItem {
  id: string;
  issueKey: string;
  title: string;
  route: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  assignee: string | null;
  status: "open" | "in_progress" | "resolved";
  reportedAt: string | null;
  createdAt: string;
}

export interface TeamMemberItem {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "QA Lead" | "Developer" | "Viewer";
  lastActive: string | null;
  avatarInitials: string;
  createdAt: string;
}

export interface BillingSubscriptionItem {
  id: string;
  planId: string;
  billingCycle: "monthly" | "annual";
  scansUsed: number;
  scansLimit: number;
  concurrencyLimit: number;
  aiTokensUsed: number;
  aiTokensLimit: number;
  paymentMethod: string | null;
  renewsAt: string | null;
}

export function useJourneys() {
  return useQuery({
    queryKey: qaKeys.journeys.list(),
    queryFn: () => (client as any).qa.journeys.list() as Promise<JourneyItem[]>,
  });
}

export function useCreateJourney() {
  return useAppMutation<CreateJourneyInput>({
    mutationFn: (data) => (client as any).qa.journeys.create(data),
    invalidateKeys: [qaKeys.journeys.all as any],
    successMessage: "User journey created successfully",
    errorMessage: "Failed to create user journey",
  });
}

export function useRunJourney() {
  return useAppMutation<{ id: string }>({
    mutationFn: ({ id }) => (client as any).qa.journeys.run({ id }),
    invalidateKeys: [qaKeys.journeys.all as any],
    successMessage: "Journey executed successfully",
    errorMessage: "Failed to run journey",
  });
}

export interface ApiMonitorsResponse {
  items: ApiMonitorItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats?: {
    total: number;
    healthy: number;
    avgLatency: number;
  };
}

export function useApiMonitors(params?: { page?: number; pageSize?: number; search?: string }) {
  return useQuery({
    queryKey: qaKeys.apiMonitors.list(params),
    queryFn: () => (client as any).qa.apiMonitors.list(params) as Promise<ApiMonitorsResponse>,
  });
}

export function useCreateApiMonitor() {
  return useAppMutation<CreateApiMonitorInput>({
    mutationFn: (data) => (client as any).qa.apiMonitors.create(data),
    invalidateKeys: [qaKeys.apiMonitors.all as any],
    successMessage: "API monitor added",
    errorMessage: "Failed to add API monitor",
  });
}

export function usePingApiMonitor() {
  return useAppMutation<{ id: string }>({
    mutationFn: ({ id }) => (client as any).qa.apiMonitors.ping({ id }),
    invalidateKeys: [qaKeys.apiMonitors.all as any],
    successMessage: "Endpoint ping successful",
    errorMessage: "Ping failed",
  });
}

export interface QaIssuesResponse {
  items: QaIssueItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts?: {
    all: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
}

export function useIssues(params?: { status?: string; page?: number; pageSize?: number; search?: string }) {
  return useQuery({
    queryKey: qaKeys.issues.list(params),
    queryFn: () => (client as any).qa.issues.list(params) as Promise<QaIssuesResponse>,
  });
}

export function useCreateIssue() {
  return useAppMutation<CreateIssueInput>({
    mutationFn: (data) => (client as any).qa.issues.create(data),
    invalidateKeys: [qaKeys.issues.all as any],
    successMessage: "QA Issue filed successfully",
    errorMessage: "Failed to create issue",
  });
}

export function useUpdateIssueStatus() {
  return useAppMutation<{ id: string; status: "open" | "in_progress" | "resolved" }>({
    mutationFn: (data) => (client as any).qa.issues.updateStatus(data),
    invalidateKeys: [qaKeys.issues.all as any],
    successMessage: "Issue status updated",
    errorMessage: "Failed to update issue status",
  });
}

export interface TeamMembersResponse {
  items: TeamMemberItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useTeamMembers(params?: { page?: number; pageSize?: number; search?: string }) {
  return useQuery({
    queryKey: qaKeys.team.list(params),
    queryFn: () => (client as any).qa.team.list(params) as Promise<TeamMembersResponse>,
  });
}

export function useInviteTeamMember() {
  return useAppMutation<InviteTeamMemberInput>({
    mutationFn: (data) => (client as any).qa.team.invite(data),
    invalidateKeys: [qaKeys.team.all as any],
    successMessage: "Invitation sent successfully",
    errorMessage: "Failed to send invitation",
  });
}

export function useBilling() {
  return useQuery({
    queryKey: qaKeys.billing.get(),
    queryFn: () => (client as any).qa.billing.get() as Promise<BillingSubscriptionItem>,
  });
}

export function useUpdateBillingPlan() {
  return useAppMutation<UpdateBillingPlanInput>({
    mutationFn: (data) => (client as any).qa.billing.updatePlan(data),
    invalidateKeys: [qaKeys.billing.all as any],
    successMessage: "Subscription plan updated",
    errorMessage: "Failed to update subscription",
  });
}

export function useCreateCheckoutSession() {
  return useAppMutation<CreateCheckoutSessionInput>({
    mutationFn: (data) =>
      (client as any).qa.billing.createCheckoutSession(data) as Promise<{
        checkoutUrl: string;
        sessionId: string;
      }>,
    errorMessage: "Failed to initiate Stripe Checkout",
  });
}

export function useCreatePortalSession() {
  return useAppMutation<CreatePortalSessionInput>({
    mutationFn: (data) =>
      (client as any).qa.billing.createPortalSession(data) as Promise<{
        portalUrl: string;
      }>,
    errorMessage: "Failed to open Customer Portal",
  });
}

export function useAskRove() {
  return useAppMutation<AiChatInput>({
    mutationFn: (data) => (client as any).qa.aiAssistant.chat(data),
  });
}

export interface PersonaItem {
  id: string;
  name: string;
  role: string;
  description: string;
  behavior: string;
  healthScore: number;
  status: "passed" | "warning" | "failed";
  findings: string[];
}

export function usePersonas() {
  return useQuery({
    queryKey: qaKeys.personas.list(),
    queryFn: () => (client as any).qa.personas.list() as Promise<PersonaItem[]>,
  });
}

export function useRunPersona() {
  return useAppMutation<{ id: string }>({
    mutationFn: ({ id }) => (client as any).qa.personas.run({ id }),
    invalidateKeys: [qaKeys.personas.all as any],
    successMessage: "Persona stress execution complete",
    errorMessage: "Failed to run persona",
  });
}

export interface SecurityFindingItem {
  id: string;
  category: "Secret Leak" | "PII Exposure" | "Security Headers" | "CORS & Auth";
  title: string;
  location: string;
  severity: "critical" | "warning" | "info" | "passed";
  recommendation: string;
}

export interface SecurityFindingsResponse {
  items: SecurityFindingItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats?: {
    criticalCount: number;
    warningCount: number;
  };
}

export function useSecurityFindings(params?: { page?: number; pageSize?: number; search?: string }) {
  return useQuery({
    queryKey: qaKeys.security.findings(params),
    queryFn: () => (client as any).qa.security.listFindings(params) as Promise<SecurityFindingsResponse>,
  });
}

export function useRunSecurityScan() {
  return useAppMutation<Record<string, unknown>>({
    mutationFn: () => (client as any).qa.security.runScan(),
    invalidateKeys: [qaKeys.security.all as any],
    successMessage: "Security Sentinel audit completed",
    errorMessage: "Failed to run security scan",
  });
}

export interface VisionDefectItem {
  id: string;
  route: string;
  title: string;
  category: "Layout Break" | "Missing Asset" | "Color Contrast" | "Text Overlap";
  severity: "critical" | "warning" | "cosmetic";
  aiExplanation: string;
  confidence: number;
}

export function useVisionDefects() {
  return useQuery({
    queryKey: qaKeys.aiStudio.visionDefects(),
    queryFn: () => (client as any).qa.aiStudio.listVisionDefects() as Promise<VisionDefectItem[]>,
  });
}

export function useRunVisionAudit() {
  return useAppMutation<{ route?: string }>({
    mutationFn: (data) => (client as any).qa.aiStudio.runVisionAudit(data),
    invalidateKeys: [qaKeys.aiStudio.all as any],
    successMessage: "AI Vision audit complete",
    errorMessage: "Failed to run vision audit",
  });
}

export interface AiFixItem {
  id: string;
  title: string;
  errorType: "Hydration Mismatch" | "Uncaught TypeError" | "Unhandled Rejection";
  filePath: string;
  line: number;
  rootCause: string;
  diff: {
    before: string[];
    after: string[];
  };
  status: "ready" | "pr_created";
}

export function useAiFixes() {
  return useQuery({
    queryKey: qaKeys.aiStudio.fixes(),
    queryFn: () => (client as any).qa.aiStudio.listFixes() as Promise<AiFixItem[]>,
  });
}

export function useCreateFixPr() {
  return useAppMutation<{ id: string }>({
    mutationFn: ({ id }) => (client as any).qa.aiStudio.createPr({ id }),
    invalidateKeys: [qaKeys.aiStudio.all as any],
    successMessage: "Pull request created successfully on GitHub",
    errorMessage: "Failed to create PR",
  });
}

export interface InvoiceItem {
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: string;
}

export interface BillingInvoicesResponse {
  items: InvoiceItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useBillingInvoices(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: qaKeys.billing.invoices(params),
    queryFn: () => (client as any).qa.billing.listInvoices(params) as Promise<BillingInvoicesResponse>,
  });
}

