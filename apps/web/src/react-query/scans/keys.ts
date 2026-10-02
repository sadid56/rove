export const scansKeys = {
  all: ["scans"] as const,
  lists: (projectId?: string) => [...scansKeys.all, "list", { projectId }] as const,
  detail: (id: string) => [...scansKeys.all, "detail", id] as const,
  page: (pageId: string) => [...scansKeys.all, "page", pageId] as const
};
