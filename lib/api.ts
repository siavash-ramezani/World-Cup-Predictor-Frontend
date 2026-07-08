import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SessionUser } from "@/lib/types";
import { TOKEN_COOKIE, USER_COOKIE } from "@/lib/cookie-names";

export { TOKEN_COOKIE, USER_COOKIE };

const API_BASE = process.env.API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
  secure: process.env.NODE_ENV === "production",
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
  /** First field-level validation message, if any. */
  get firstFieldError() {
    const list = this.errors && Object.values(this.errors)[0];
    return list?.[0];
  }
}

export type Session = { token: string; user: SessionUser | null };

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  let user: SessionUser | null = null;
  const raw = jar.get(USER_COOKIE)?.value;
  if (raw) {
    try {
      user = JSON.parse(raw) as SessionUser;
    } catch {
      user = null;
    }
  }
  return { token, user };
}

/** Use in pages: bounces to /login when there is no token. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Only callable from a Server Function / Route Handler. */
export async function setSession(token: string, user: SessionUser) {
  const jar = await cookies();
  jar.set(TOKEN_COOKIE, token, COOKIE_OPTS);
  jar.set(USER_COOKIE, JSON.stringify(user), COOKIE_OPTS);
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(TOKEN_COOKIE);
  jar.delete(USER_COOKIE);
}

type FetchInit = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Explicit token (e.g. right after login, before the cookie exists). */
  token?: string | null;
  /** Skip attaching the session token entirely (public endpoints). */
  anonymous?: boolean;
};

export async function apiFetch<T>(path: string, init: FetchInit = {}): Promise<T> {
  const token = init.anonymous ? null : (init.token ?? (await getSession())?.token ?? null);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: init.method ?? "GET",
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, `Cannot reach the prediction API at ${API_BASE}. Is the Laravel server running?`);
  }

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    const body = (json ?? {}) as { message?: string; errors?: Record<string, string[]> };
    throw new ApiError(res.status, body.message ?? `Request failed (${res.status})`, body.errors);
  }
  return json as T;
}

/**
 * Read helper for pages: an expired/revoked token bounces through /session/clear
 * (a Route Handler, since Server Components may not delete cookies).
 */
export async function apiGet<T>(path: string): Promise<T> {
  try {
    return await apiFetch<T>(path);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/session/clear");
    throw err;
  }
}
