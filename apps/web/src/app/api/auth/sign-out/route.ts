import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api } from "@/lib/orpc.server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("better-auth.session_token");
  cookieStore.delete("better-auth.session_data");
  cookieStore.delete("better-auth.dont_remember");

  try {
    await api.auth.signOut();
  } catch {}

  const response = NextResponse.json({ success: true });
  response.cookies.delete("better-auth.session_token");
  response.cookies.delete("better-auth.session_data");
  response.cookies.delete("better-auth.dont_remember");

  return response;
}
