import { implement, ORPCError } from "@orpc/server";
import { authContract, userContract } from "@repo/contract";
import { auth } from "../../lib/auth";
import { db } from "@repo/database";
import { users } from "@repo/database/schema";
import { eq, ilike } from "drizzle-orm";

export const signIn = implement(authContract.signIn).handler(
  async ({ input }) => {
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
  }
);

export const signUp = implement(authContract.signUp).handler(
  async ({ input }) => {
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
  }
);

export const signOut = implement(authContract.signOut).handler(async () => {
  return { success: true };
});

export const forgotPassword = implement(authContract.forgotPassword).handler(
  async ({ input }) => {
    try {
      await auth.api.requestPasswordReset({
        body: { email: input.email, redirectTo: "/reset-password" }
      });
      return { success: true, message: "Reset email sent if account exists" };
    } catch {
      return { success: true, message: "Reset email sent if account exists" };
    }
  }
);

export const resetPassword = implement(authContract.resetPassword).handler(
  async ({ input }) => {
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
  }
);

export const listUsers = implement(userContract.list).handler(
  async ({ input }) => {
    if (input?.search) {
      return await db
        .select()
        .from(users)
        .where(ilike(users.email, `%${input.search}%`));
    }
    return await db.select().from(users);
  }
);

export const getUser = implement(userContract.getUser).handler(
  async ({ input }) => {
    const [user] = await db.select().from(users).where(eq(users.id, input.id));
    if (!user) {
      throw new ORPCError("NOT_FOUND", { message: "User not found" });
    }
    return user;
  }
);

export const getMe = implement(userContract.getMe).handler(async () => {
  const [firstUser] = await db.select().from(users).limit(1);
  return firstUser ?? null;
});

export const updateProfile = implement(userContract.updateProfile).handler(
  async ({ input }) => {
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
  }
);

export const toggleBan = implement(userContract.toggleBan).handler(
  async () => ({ success: true })
);

export const updateRole = implement(userContract.updateRole).handler(
  async () => ({ success: true })
);

export const deleteUser = implement(userContract.delete).handler(
  async ({ input }) => {
    await db.delete(users).where(eq(users.id, input.id));
    return { success: true };
  }
);

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
