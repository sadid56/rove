"use server";

import { cookies, headers } from "next/headers";
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

const API_URL = process.env.API_URL || "http://localhost:4000";

interface AuthActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

async function getClientOrigin(): Promise<string> {
  try {
    const headerStore = await headers();
    const origin = headerStore.get("origin");
    if (origin && origin !== "null") return origin;

    const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
    const proto = headerStore.get("x-forwarded-proto") || "http";
    if (host) return `${proto}://${host}`;

    const referer = headerStore.get("referer");
    if (referer) return new URL(referer).origin;
  } catch {}

  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

async function syncSessionCookies(res: Response): Promise<void> {
  const cookieStore = await cookies();
  const rawCookies: string[] =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : ([res.headers.get("set-cookie")].filter(Boolean) as string[]);

  for (const cookieHeader of rawCookies) {
    const parts = cookieHeader.split(";").map((p) => p.trim());
    const nameVal = parts[0];
    if (!nameVal) continue;
    const eqIdx = nameVal.indexOf("=");
    if (eqIdx === -1) continue;

    const name = nameVal.slice(0, eqIdx).trim();
    const value = nameVal.slice(eqIdx + 1).trim();
    if (!name) continue;

    const attrs = parts.slice(1);
    const options: {
      path?: string;
      expires?: Date;
      maxAge?: number;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: "lax" | "strict" | "none";
      domain?: string;
    } = {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    };

    for (const attr of attrs) {
      const eqPos = attr.indexOf("=");
      const key = (eqPos === -1 ? attr : attr.slice(0, eqPos)).trim().toLowerCase();
      const val = (eqPos === -1 ? "" : attr.slice(eqPos + 1)).trim();

      if (key === "path") {
        options.path = val;
      } else if (key === "expires") {
        const exp = new Date(val);
        if (!isNaN(exp.getTime())) options.expires = exp;
      } else if (key === "max-age") {
        const maxAge = parseInt(val, 10);
        if (!isNaN(maxAge)) options.maxAge = maxAge;
      } else if (key === "httponly") {
        options.httpOnly = true;
      } else if (key === "secure") {
        options.secure = true;
      } else if (key === "samesite") {
        const lower = val.toLowerCase();
        if (lower === "lax" || lower === "strict" || lower === "none") {
          options.sameSite = lower;
        }
      } else if (key === "domain" && !val.includes("localhost")) {
        options.domain = val;
      }
    }

    cookieStore.set(name, value, options);
  }
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
    const origin = await getClientOrigin();
    const res = await fetch(`${API_URL}/api/v1/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: data?.message || data?.error || "Invalid email or password",
      };
    }

    await syncSessionCookies(res);

    const cookieStore = await cookies();
    if (data?.token && !cookieStore.get("better-auth.session_token")?.value) {
      cookieStore.set("better-auth.session_token", data.token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to reach authentication server",
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
    const origin = await getClientOrigin();
    const res = await fetch(`${API_URL}/api/v1/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: data?.message || data?.error || "Failed to create account",
      };
    }

    await syncSessionCookies(res);

    const cookieStore = await cookies();
    if (data?.token && !cookieStore.get("better-auth.session_token")?.value) {
      cookieStore.set("better-auth.session_token", data.token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to reach authentication server",
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
    const origin = await getClientOrigin();
    const res = await fetch(`${API_URL}/rpc/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: data?.message || "Failed to process password reset request",
      };
    }

    return {
      success: true,
      message: "If an account exists with this email, a reset link will be sent.",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to reach authentication server",
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
    const origin = await getClientOrigin();
    const res = await fetch(`${API_URL}/rpc/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: data?.message || "Failed to reset password",
      };
    }

    return {
      success: true,
      message: "Password has been successfully updated",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to reach authentication server",
    };
  }
}

export async function signOut(): Promise<AuthActionResult> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;

  try {
    if (sessionToken) {
      const origin = await getClientOrigin();
      await fetch(`${API_URL}/api/v1/auth/sign-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: origin,
          Cookie: `better-auth.session_token=${sessionToken}`,
        },
        cache: "no-store",
      });
    }
  } catch {}

  cookieStore.delete("better-auth.session_token");
  cookieStore.delete("better-auth.session_data");
  cookieStore.delete("better-auth.dont_remember");

  return { success: true };
}
