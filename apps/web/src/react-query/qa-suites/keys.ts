export const qaKeys = {
  journeys: {
    all: ["qa", "journeys"] as const,
    list: (params?: any) => [...qaKeys.journeys.all, "list", params] as const,
  },
  apiMonitors: {
    all: ["qa", "api-monitors"] as const,
    list: (params?: any) => [...qaKeys.apiMonitors.all, "list", params] as const,
  },
  issues: {
    all: ["qa", "issues"] as const,
    list: (params?: any) => [...qaKeys.issues.all, "list", params] as const,
  },
  team: {
    all: ["qa", "team"] as const,
    list: (params?: any) => [...qaKeys.team.all, "list", params] as const,
  },
  personas: {
    all: ["qa", "personas"] as const,
    list: () => [...qaKeys.personas.all, "list"] as const,
  },
  security: {
    all: ["qa", "security"] as const,
    findings: (params?: any) => [...qaKeys.security.all, "findings", params] as const,
  },
  aiStudio: {
    all: ["qa", "aiStudio"] as const,
    visionDefects: () => [...qaKeys.aiStudio.all, "vision-defects"] as const,
    fixes: () => [...qaKeys.aiStudio.all, "fixes"] as const,
  },
  billing: {
    all: ["qa", "billing"] as const,
    get: () => [...qaKeys.billing.all, "get"] as const,
    invoices: (params?: any) => [...qaKeys.billing.all, "invoices", params] as const,
  },
};
