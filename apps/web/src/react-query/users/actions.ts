import { useQuery } from "@tanstack/react-query";
import { useAppMutation } from "@/hooks/useAppMutation";
import { client } from "@/lib/orpc";
import { usersKeys } from "./keys";

export function useUsers({ search = "" }) {
  return useQuery({
    queryKey: usersKeys.lists(search),
    queryFn: () => client.user.list({ search })
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => client.user.getUser({ id })
  });
}

export function useGetMe(initialData?: any) {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: () => client.user.getMe(),
    initialData
  });
}

export function useToggleBanUser() {
  return useAppMutation<{ userId: string; banned: boolean; reason?: string }>({
    mutationFn: (data) => client.user.toggleBan(data),
    invalidateKeys: [["users"]],
    successMessage: "User ban status updated successfully",
    errorMessage: "Failed to update ban status"
  });
}

export function useUpdateGlobalRole() {
  return useAppMutation<{ userId: string; role: "ADMIN" | "MEMBER" }>({
    mutationFn: (data) => client.user.updateRole(data),
    invalidateKeys: [["users"]],
    successMessage: "Global role updated successfully",
    errorMessage: "Failed to update global role"
  });
}

export function useDeleteUser() {
  return useAppMutation<string>({
    mutationFn: (id) => client.user.delete({ id }),
    invalidateKeys: [["users"]],
    successMessage: "User deleted successfully",
    errorMessage: "Failed to delete user"
  });
}

export function useUpdateProfile() {
  return useAppMutation<{ name?: string; image?: string }>({
    mutationFn: (data) => client.user.updateProfile(data),
    invalidateKeys: [["users", "me"]],
    successMessage: "Profile updated successfully",
    errorMessage: "Failed to update profile"
  });
}
