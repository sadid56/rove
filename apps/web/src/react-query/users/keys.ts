export const usersKeys = {
  all: ["users"] as const,
  lists: (search: string) => [...usersKeys.all, "list", { search }] as const,
  detail: (id: string) => [...usersKeys.all, "detail", id] as const,
};
