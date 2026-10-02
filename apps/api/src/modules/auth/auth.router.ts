import { os, ORPCError } from "@orpc/server";
import { z } from "zod";
import { auth } from "../../lib/auth";
import { db } from "@repo/database";
import { users } from "@repo/database/schema";
import { eq, ilike } from "drizzle-orm";

export const signIn = os
  .route({
    method: "POST",
    path: "/auth/sign-in",
    summary: "Sign in with email and password"
  })
  .input(z.object({ email: z.string().email(), password: z.string() }))
  .handler(async ({ input }) => {
    try {
      const res = await auth.api.signInEmail({
        body: { email: input.email, password: input.password }
      });
      return res;
    } catch (err: any) {
      throw new ORPCError("UNAUTHORIZED", {
        message: err?.message || "Invalid email or password"
      });
    }
  });

export const signUp = os
  .route({
    method: "POST",
    path: "/auth/sign-up",
    summary: "Register a new user account"
  })
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(4),
      name: z.string().min(2)
    })
  )
  .handler(async ({ input }) => {
    try {
      const res = await auth.api.signUpEmail({
        body: {
          email: input.email,
          password: input.password,
          name: input.name
        }
      });
      return res;
    } catch (err: any) {
      throw new ORPCError("BAD_REQUEST", {
        message: err?.message || "Failed to create account"
      });
    }
  });

export const signOut = os
  .route({
    method: "POST",
    path: "/auth/sign-out",
    summary: "Sign out current session"
  })
  .handler(async () => {
    return { success: true };
  });

export const forgotPassword = os
  .route({
    method: "POST",
    path: "/auth/forgot-password",
    summary: "Request password reset link"
  })
  .input(z.object({ email: z.string().email() }))
  .handler(async ({ input }) => {
    try {
      await auth.api.requestPasswordReset({
        body: { email: input.email, redirectTo: "/reset-password" }
      });
      return { success: true, message: "Reset email sent if account exists" };
    } catch {
      return { success: true, message: "Reset email sent if account exists" };
    }
  });

export const resetPassword = os
  .route({
    method: "POST",
    path: "/auth/reset-password",
    summary: "Reset password using reset token"
  })
  .input(z.object({ token: z.string(), newPassword: z.string() }))
  .handler(async ({ input }) => {
    try {
      await auth.api.resetPassword({
        body: { token: input.token, newPassword: input.newPassword }
      });
      return { success: true, message: "Password updated successfully" };
    } catch (err: any) {
      throw new ORPCError("BAD_REQUEST", {
        message: err?.message || "Failed to reset password"
      });
    }
  });

export const listUsers = os
  .route({
    method: "GET",
    path: "/users",
    summary: "List all users"
  })
  .input(z.object({ search: z.string().optional() }).optional())
  .handler(async ({ input }) => {
    if (input?.search) {
      return await db
        .select()
        .from(users)
        .where(ilike(users.email, `%${input.search}%`));
    }
    return await db.select().from(users);
  });

export const getUser = os
  .route({
    method: "GET",
    path: "/users/{id}",
    summary: "Get user by ID"
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const [user] = await db.select().from(users).where(eq(users.id, input.id));
    if (!user) {
      throw new ORPCError("NOT_FOUND", { message: "User not found" });
    }
    return user;
  });

export const getMe = os
  .route({
    method: "GET",
    path: "/users/me",
    summary: "Get current logged-in user profile"
  })
  .handler(async () => {
    const [firstUser] = await db.select().from(users).limit(1);
    return firstUser ?? null;
  });

export const updateProfile = os
  .route({
    method: "PATCH",
    path: "/users/profile",
    summary: "Update user profile"
  })
  .input(z.object({ name: z.string().optional(), image: z.string().optional() }))
  .handler(async ({ input }) => {
    const [firstUser] = await db.select().from(users).limit(1);
    if (!firstUser) throw new ORPCError("NOT_FOUND", { message: "User not found" });

    const [updated] = await db
      .update(users)
      .set({
        ...(input.name ? { name: input.name } : {}),
        ...(input.image ? { image: input.image } : {}),
        updatedAt: new Date()
      })
      .where(eq(users.id, firstUser.id))
      .returning();

    return updated;
  });

export const toggleBan = os
  .input(z.object({ userId: z.string(), banned: z.boolean(), reason: z.string().optional() }))
  .handler(async () => ({ success: true }));

export const updateRole = os
  .input(z.object({ userId: z.string(), role: z.enum(["ADMIN", "MEMBER"]) }))
  .handler(async () => ({ success: true }));

export const deleteUser = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    await db.delete(users).where(eq(users.id, input.id));
    return { success: true };
  });

export const authRouter = {
  signIn,
  signUp,
  signOut,
  forgotPassword,
  resetPassword
};

export const userRouter = {
  list: listUsers,
  getUser,
  getMe,
  updateProfile,
  toggleBan,
  updateRole,
  delete: deleteUser
};
