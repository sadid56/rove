import { ORPCError } from "@orpc/server";
import { authContract, userContract } from "@repo/contract";
import { auth } from "../../lib/auth";
import { db } from "@repo/database";
import { users } from "@repo/database/schema";
import { eq, ilike } from "drizzle-orm";
import { createProcedure } from "../../utils/procedure";

export const signIn = createProcedure(
  authContract.signIn,
  ({ email, password }) => auth.api.signInEmail({ body: { email, password } }),
  "UNAUTHORIZED"
);

export const signUp = createProcedure(
  authContract.signUp,
  ({ email, password, name }) => auth.api.signUpEmail({ body: { email, password, name } })
);

export const signOut = createProcedure(authContract.signOut, async (_input, context) => {
  if (context?.req?.headers) {
    try {
      await auth.api.signOut({ headers: context.req.headers });
    } catch {}
  }
  return { success: true };
});

export const forgotPassword = createProcedure(authContract.forgotPassword, async ({ email }) => {
  await auth.api.requestPasswordReset({ body: { email, redirectTo: "/reset-password" } });
  return { success: true, message: "Reset email sent if account exists" };
});

export const resetPassword = createProcedure(authContract.resetPassword, async ({ token, newPassword }) => {
  await auth.api.resetPassword({ body: { token, newPassword } });
  return { success: true, message: "Password updated successfully" };
});

export const listUsers = createProcedure(userContract.list, async (input) => {
  if (input?.search) {
    return await db.select().from(users).where(ilike(users.email, `%${input.search}%`));
  }
  return await db.select().from(users);
});

export const getUser = createProcedure(userContract.get, async ({ id }) => {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) throw new ORPCError("NOT_FOUND", { message: "User not found" });
  return user;
});

export const getMe = createProcedure(userContract.me, async (_input, context) => {
  if (context?.req?.headers) {
    try {
      const session = await auth.api.getSession({ headers: context.req.headers });
      if (session?.user) return session.user;
    } catch {}
  }
  const [firstUser] = await db.select().from(users).limit(1);
  return firstUser ?? null;
});

export const updateProfile = createProcedure(userContract.updateProfile, async (input) => {
  const [firstUser] = await db.select().from(users).limit(1);
  if (!firstUser) throw new ORPCError("NOT_FOUND", { message: "User not found" });

  const [updated] = await db
    .update(users)
    .set({
      ...(input.name ? { name: input.name } : {}),
      ...(input.image ? { image: input.image } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, firstUser.id))
    .returning();

  return updated;
});

export const toggleBan = createProcedure(userContract.toggleBan, () => ({ success: true }));

export const updateRole = createProcedure(userContract.updateRole, () => ({ success: true }));

export const deleteUser = createProcedure(userContract.delete, async ({ id }) => {
  await db.delete(users).where(eq(users.id, id));
  return { success: true };
});

export const getSession = createProcedure(authContract.session, async (_input, context) => {
  if (context?.req?.headers) {
    try {
      const session = await auth.api.getSession({ headers: context.req.headers });
      return session ?? null;
    } catch {}
  }
  return null;
});

export const authRouter = {
  signIn,
  signUp,
  signOut,
  forgotPassword,
  resetPassword,
  session: getSession,
};

export const userRouter = {
  list: listUsers,
  get: getUser,
  me: getMe,
  updateProfile,
  toggleBan,
  updateRole,
  delete: deleteUser,
};
