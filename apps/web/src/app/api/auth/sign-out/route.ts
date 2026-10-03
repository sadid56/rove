import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("better-auth.session_token");
  cookieStore.delete("better-auth.session_data");
  cookieStore.delete("better-auth.dont_remember");

  try {
    const apiUrl = process.env.API_URL;
    await fetch(`${apiUrl}/api/v1/auth/sign-out`, {
      method: "POST",
      headers: { Origin: "http://localhost:3000" },
    });
  } catch {}

  const response = NextResponse.json({ success: true });
  response.cookies.delete("better-auth.session_token");
  response.cookies.delete("better-auth.session_data");
  response.cookies.delete("better-auth.dont_remember");

  return response;
}
