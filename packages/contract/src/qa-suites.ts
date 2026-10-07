import { oc } from "@orpc/contract";
import { z } from "zod";

export const createJourneySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  prompt: z.string().optional(),
});

export const runJourneySchema = z.object({
  id: z.string().min(1, "Journey ID is required"),
});

export const createApiMonitorSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]).default("GET"),
  url: z.string().min(1, "URL is required"),
});

export const pingApiMonitorSchema = z.object({
  id: z.string().min(1, "Monitor ID is required"),
});

export const createIssueSchema = z.object({
  title: z.string().min(2, "Title is required"),
  route: z.string().min(1, "Route is required"),
  type: z.string().default("Console Error"),
  severity: z.enum(["critical", "high", "medium", "low"]).default("high"),
  assignee: z.string().optional(),
});

export const updateIssueStatusSchema = z.object({
  id: z.string().min(1, "Issue ID is required"),
  status: z.enum(["open", "in_progress", "resolved"]),
});

export const inviteTeamMemberSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Valid email required"),
  role: z.enum(["Owner", "Admin", "QA Lead", "Developer", "Viewer"]).default("Developer"),
});

export const updateBillingPlanSchema = z.object({
  planId: z.string(),
  billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
});

export const aiChatSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

export type CreateJourneyInput = z.infer<typeof createJourneySchema>;
export type CreateApiMonitorInput = z.infer<typeof createApiMonitorSchema>;
export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueStatusInput = z.infer<typeof updateIssueStatusSchema>;
export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>;
export type UpdateBillingPlanInput = z.infer<typeof updateBillingPlanSchema>;
export type AiChatInput = z.infer<typeof aiChatSchema>;

export const createCheckoutSessionSchema = z.object({
  planId: z.string(),
  billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
});

export const createPortalSessionSchema = z.object({
  returnUrl: z.string().optional(),
});

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
export type CreatePortalSessionInput = z.infer<typeof createPortalSessionSchema>;

export const runVisionAuditSchema = z.object({
  route: z.string().optional(),
});

export const createPrSchema = z.object({
  id: z.string().min(1, "Fix ID is required"),
});

export type RunVisionAuditInput = z.infer<typeof runVisionAuditSchema>;
export type CreatePrInput = z.infer<typeof createPrSchema>;

export const updateIntegrationSchema = z.object({
  serviceKey: z.string().min(1, "Service key is required"),
  enabled: z.boolean().optional(),
  config: z
    .object({
      webhookUrl: z.string().optional(),
      repoName: z.string().optional(),
      channel: z.string().optional(),
      healthThreshold: z.number().optional(),
      blockMergeOnFailure: z.boolean().optional(),
      autoScan: z.boolean().optional(),
      projectKey: z.string().optional(),
    })
    .optional(),
});

export const testIntegrationSchema = z.object({
  serviceKey: z.string().min(1, "Service key is required"),
});

export type UpdateIntegrationInput = z.infer<typeof updateIntegrationSchema>;
export type TestIntegrationInput = z.infer<typeof testIntegrationSchema>;

export const listPaginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().optional(),
  })
  .optional();

export const listIssuesQuerySchema = z
  .object({
    status: z.enum(["all", "open", "in_progress", "resolved"]).optional().default("all"),
    page: z.coerce.number().int().min(1).optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().optional(),
  })
  .optional();

export type ListPaginationQuery = z.infer<typeof listPaginationQuerySchema>;
export type ListIssuesQuery = z.infer<typeof listIssuesQuerySchema>;

export const qaContract = {
  journeys: {
    list: oc.route({ method: "GET", path: "/qa/journeys", summary: "List user journeys" }),
    create: oc.route({ method: "POST", path: "/qa/journeys", summary: "Create journey" }).input(createJourneySchema),
    run: oc.route({ method: "POST", path: "/qa/journeys/{id}/run", summary: "Run journey" }).input(runJourneySchema),
  },
  apiMonitors: {
    list: oc.route({ method: "GET", path: "/qa/api-monitors", summary: "List API monitors" }).input(listPaginationQuerySchema),
    create: oc.route({ method: "POST", path: "/qa/api-monitors", summary: "Create API monitor" }).input(createApiMonitorSchema),
    ping: oc.route({ method: "POST", path: "/qa/api-monitors/{id}/ping", summary: "Ping API monitor" }).input(pingApiMonitorSchema),
  },
  issues: {
    list: oc.route({ method: "GET", path: "/qa/issues", summary: "List QA issues" }).input(listIssuesQuerySchema),
    create: oc.route({ method: "POST", path: "/qa/issues", summary: "Create issue" }).input(createIssueSchema),
    updateStatus: oc.route({ method: "PATCH", path: "/qa/issues/{id}/status", summary: "Update issue status" }).input(updateIssueStatusSchema),
  },
  team: {
    list: oc.route({ method: "GET", path: "/qa/team", summary: "List team members" }).input(listPaginationQuerySchema),
    invite: oc.route({ method: "POST", path: "/qa/team/invite", summary: "Invite team member" }).input(inviteTeamMemberSchema),
  },
  security: {
    listFindings: oc.route({ method: "GET", path: "/qa/security/findings", summary: "List security findings" }).input(listPaginationQuerySchema),
    runScan: oc.route({ method: "POST", path: "/qa/security/scan", summary: "Run security sentinel scan" }),
  },
  aiStudio: {
    listVisionDefects: oc.route({ method: "GET", path: "/qa/ai/vision-defects", summary: "List visual defects" }),
    runVisionAudit: oc.route({ method: "POST", path: "/qa/ai/vision-audit", summary: "Run AI vision audit" }).input(runVisionAuditSchema),
    listFixes: oc.route({ method: "GET", path: "/qa/ai/fixes", summary: "List AI generated fixes" }),
    createPr: oc.route({ method: "POST", path: "/qa/ai/fixes/{id}/pr", summary: "Create PR for fix" }).input(createPrSchema),
  },
  billing: {
    get: oc.route({ method: "GET", path: "/qa/billing", summary: "Get subscription and billing info" }),
    updatePlan: oc.route({ method: "POST", path: "/qa/billing/plan", summary: "Update subscription plan" }).input(updateBillingPlanSchema),
    createCheckoutSession: oc
      .route({ method: "POST", path: "/qa/billing/checkout", summary: "Create Stripe Hosted Checkout Session" })
      .input(createCheckoutSessionSchema),
    createPortalSession: oc
      .route({ method: "POST", path: "/qa/billing/portal", summary: "Create Stripe Customer Portal Session" })
      .input(createPortalSessionSchema),
    listInvoices: oc.route({ method: "GET", path: "/qa/billing/invoices", summary: "List billing invoices" }).input(listPaginationQuerySchema),
  },
  aiAssistant: {
    chat: oc.route({ method: "POST", path: "/qa/ai/chat", summary: "Ask Rove QA Assistant" }).input(aiChatSchema),
  },
  integrations: {
    list: oc.route({ method: "GET", path: "/qa/integrations", summary: "List CI/CD and webhook integrations" }),
    update: oc
      .route({ method: "PATCH", path: "/qa/integrations/{serviceKey}", summary: "Update integration configuration or status" })
      .input(updateIntegrationSchema),
    test: oc
      .route({ method: "POST", path: "/qa/integrations/{serviceKey}/test", summary: "Trigger test webhook delivery" })
      .input(testIntegrationSchema),
  },
};
