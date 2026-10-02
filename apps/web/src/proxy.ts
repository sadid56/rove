import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/forgot-password");

  const isDashboardRoute = pathname.startsWith("/dashboard");

  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  if (isDashboardRoute && !sessionToken) {
    return NextResponse.next();
  }

  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const middleware = proxy;

export default proxy;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|rpc|api).*)"]
};
