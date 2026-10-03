export const scansKeys = {
  all: ["scans"] as const,
  lists: (params?: any) => [...scansKeys.all, "list", params] as const,
  detail: (id: string) => [...scansKeys.all, "detail", id] as const,
  routes: (id: string, params?: any) => [...scansKeys.all, "routes", id, params] as const,
  page: (pageId: string) => [...scansKeys.all, "page", pageId] as const
};
