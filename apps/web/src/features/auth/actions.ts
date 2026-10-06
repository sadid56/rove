"use server";

import { cookies } from "next/headers";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type SignInInput,
  type SignUpInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@repo/contract";
import { api } from "@/lib/orpc.server";

interface AuthActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

export async function signIn(input: SignInInput): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid input",
    };
  }

  try {
    const data = (await api.auth.signIn(parsed.data)) as any;
    const token = data?.token || data?.session?.token;

    if (token) {
      const cookieStore = await cookies();
      cookieStore.set("better-auth.session_token", token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Invalid email or password",
    };
  }
}

export async function signUp(input: SignUpInput): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid input",
    };
  }

  try {
    const data = (await api.auth.signUp(parsed.data)) as any;
    const token = data?.token || data?.session?.token;

    if (token) {
      const cookieStore = await cookies();
      cookieStore.set("better-auth.session_token", token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to create account",
    };
  }
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid email",
    };
  }

  try {
    await api.auth.forgotPassword(parsed.data);

    return {
      success: true,
      message: "If an account exists with this email, a reset link will be sent.",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to process password reset request",
    };
  }
}

export async function resetPassword(input: ResetPasswordInput): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid input",
    };
  }

  try {
    await api.auth.resetPassword(parsed.data);

    return {
      success: true,
      message: "Password has been successfully updated",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to reset password",
    };
  }
}

export async function signOut(): Promise<AuthActionResult> {
  const cookieStore = await cookies();

  try {
    await api.auth.signOut();
  } catch {}

  cookieStore.delete("better-auth.session_token");
  cookieStore.delete("better-auth.session_data");
  cookieStore.delete("better-auth.dont_remember");

  return { success: true };
}
