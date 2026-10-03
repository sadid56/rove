import { oc } from "@orpc/contract";
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(4, "New password must be at least 4 characters"),
});

export const listUsersQuerySchema = z
  .object({
    search: z.string().optional(),
  })
  .optional();

export const userIdParamSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().optional(),
});

export const toggleBanSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  banned: z.boolean(),
  reason: z.string().optional(),
});

export const updateRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ToggleBanInput = z.infer<typeof toggleBanSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export const authContract = {
  signIn: oc
    .route({
      method: "POST",
      path: "/auth/sign-in",
      summary: "Sign in with email and password",
    })
    .input(signInSchema),
  signUp: oc
    .route({
      method: "POST",
      path: "/auth/sign-up",
      summary: "Register a new user account",
    })
    .input(signUpSchema),
  signOut: oc.route({
    method: "POST",
    path: "/auth/sign-out",
    summary: "Sign out current session",
  }),
  forgotPassword: oc
    .route({
      method: "POST",
      path: "/auth/forgot-password",
      summary: "Request password reset link",
    })
    .input(forgotPasswordSchema),
  resetPassword: oc
    .route({
      method: "POST",
      path: "/auth/reset-password",
      summary: "Reset password using reset token",
    })
    .input(resetPasswordSchema),
};

export const userContract = {
  list: oc
    .route({
      method: "GET",
      path: "/users",
      summary: "List all users",
    })
    .input(listUsersQuerySchema),
  getUser: oc
    .route({
      method: "GET",
      path: "/users/{id}",
      summary: "Get user by ID",
    })
    .input(userIdParamSchema),
  getMe: oc.route({
    method: "GET",
    path: "/users/me",
    summary: "Get current logged-in user profile",
  }),
  updateProfile: oc
    .route({
      method: "PATCH",
      path: "/users/profile",
      summary: "Update user profile",
    })
    .input(updateProfileSchema),
  toggleBan: oc.input(toggleBanSchema),
  updateRole: oc.input(updateRoleSchema),
  delete: oc.input(userIdParamSchema),
};
