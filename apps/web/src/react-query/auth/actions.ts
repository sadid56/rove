import { useAppMutation } from "@/hooks/useAppMutation";
import { client } from "@/lib/orpc";

export function useSignIn() {
  return useAppMutation<{ email: string; password: string }>({
    mutationFn: (data) => client.auth.signIn(data),
    invalidateKeys: [["auth"]],
    successMessage: "Signed in successfully",
    errorMessage: "Invalid email or password"
  });
}

export function useSignUp() {
  return useAppMutation<{ email: string; password: string; name: string }>({
    mutationFn: (data) => client.auth.signUp(data),
    invalidateKeys: [["auth"]],
    successMessage: "Account created successfully",
    errorMessage: "Failed to create account",
  });
}

export function useSignOut() {
  return useAppMutation<void>({
    mutationFn: async () => {
      try {
        await client.auth.signOut();
      } catch {}
      await fetch("/api/auth/sign-out", {
        method: "POST",
      });
    },
    invalidateKeys: [["auth"]],
    successMessage: "Signed out successfully",
    errorMessage: "Failed to sign out"
  });
}

export function useForgotPassword() {
  return useAppMutation<{ email: string }>({
    mutationFn: (data) => client.auth.forgotPassword(data),
    successMessage: "Password reset instructions sent to your email",
    errorMessage: "Failed to send reset instructions",
  });
}

export function useResetPassword() {
  return useAppMutation<{ token: string; newPassword: string }>({
    mutationFn: (data) => client.auth.resetPassword(data),
    successMessage: "Password reset successfully",
    errorMessage: "Failed to reset password",
  });
}

