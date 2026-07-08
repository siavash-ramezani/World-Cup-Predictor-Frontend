import { NextResponse } from "next/server";
import { TOKEN_COOKIE, USER_COOKIE } from "@/lib/api";

/**
 * Server Components may not delete cookies, so an expired/revoked token
 * bounces here (see `apiGet`) to be cleared before landing on /login.
 */
export async function GET(request: Request) {
  const res = NextResponse.redirect(new URL("/login", request.url));
  res.cookies.delete(TOKEN_COOKIE);
  res.cookies.delete(USER_COOKIE);
  return res;
}
