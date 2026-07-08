import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/cookie-names";

/**
 * Next 16 renamed Middleware → Proxy. This is only an *optimistic* check: it
 * bounces obviously-signed-out requests straight to /login so pages don't have
 * to stream a skeleton first. `requireSession()` in the data layer remains the
 * real guard (the docs are explicit that proxy is not an auth solution).
 */
const PUBLIC_PREFIXES = ["/login", "/session"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  if (!request.cookies.has(TOKEN_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
