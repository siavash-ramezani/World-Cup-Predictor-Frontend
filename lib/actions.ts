"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiFetch, clearSession, getSession, setSession } from "@/lib/api";
import type { LoginRes, SessionUser } from "@/lib/types";
import { getT } from "@/lib/i18n/server";

const toSessionUser = (u: LoginRes["data"]["user"]): SessionUser => ({
  id: u.id,
  name: u.name,
  avatar_url: u.avatar_url,
  is_guest: u.is_guest,
  is_admin: u.is_admin,
});

export type AuthState = { error?: string } | undefined;

/** Sign in with country + mobile + password (the API does not use email). */
export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const country = String(formData.get("country") ?? "").trim();
  const mobile = String(formData.get("mobile") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!country || !mobile || !password) return { error: (await getT()).actions.enterMobilePassword };

  try {
    const res = await apiFetch<LoginRes>("/login", {
      method: "POST",
      anonymous: true,
      body: { country, mobile, password, device_name: "predict-front" },
    });
    await setSession(res.data.token, toSessionUser(res.data.user));
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: err.firstFieldError ?? err.message };
    }
    throw err;
  }
  redirect("/");
}

/** Anonymous read-only token. Signature matches `useActionState`. */
export async function guestAction(_prev?: AuthState, _formData?: FormData): Promise<AuthState> {
  try {
    const res = await apiFetch<LoginRes>("/guest", { method: "POST", anonymous: true });
    await setSession(res.data.token, toSessionUser(res.data.user));
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    throw err;
  }
  redirect("/");
}

export async function logoutAction() {
  try {
    await apiFetch("/logout", { method: "POST" });
  } catch {
    // token may already be invalid — clearing locally is what matters
  }
  await clearSession();
  redirect("/login");
}

export type MutationResult = { ok: true } | { ok: false; error: string };

async function requireRealUser(): Promise<MutationResult | null> {
  const session = await getSession();
  if (!session) return { ok: false, error: (await getT()).actions.sessionExpired };
  if (session.user?.is_guest) return { ok: false, error: (await getT()).actions.guestMustSignIn };
  return null;
}

/** POST /matches/{id}/predict */
export async function savePredictionAction(
  matchId: number,
  home: number,
  away: number,
): Promise<MutationResult> {
  const blocked = await requireRealUser();
  if (blocked) return blocked;

  try {
    await apiFetch(`/matches/${matchId}/predict`, {
      method: "POST",
      body: { predicted_home: home, predicted_away: away },
    });
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, error: err.firstFieldError ?? err.message };
    throw err;
  }

  revalidatePath("/");
  revalidatePath("/predict");
  revalidatePath(`/match/${matchId}`);
  return { ok: true };
}

/** Submit several picks at once (the "Submit N picks" button). */
export async function submitPicksAction(
  picks: { id: number; home: number; away: number }[],
): Promise<MutationResult> {
  const blocked = await requireRealUser();
  if (blocked) return blocked;

  for (const p of picks) {
    try {
      await apiFetch(`/matches/${p.id}/predict`, {
        method: "POST",
        body: { predicted_home: p.home, predicted_away: p.away },
      });
    } catch (err) {
      if (err instanceof ApiError) return { ok: false, error: err.firstFieldError ?? err.message };
      throw err;
    }
  }

  revalidatePath("/");
  revalidatePath("/predict");
  return { ok: true };
}

/** PUT /profile/name */
export async function updateNameAction(name: string): Promise<MutationResult> {
  const blocked = await requireRealUser();
  if (blocked) return blocked;

  try {
    await apiFetch("/profile/name", { method: "PUT", body: { name } });
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, error: err.firstFieldError ?? err.message };
    throw err;
  }

  revalidatePath("/profile");
  return { ok: true };
}
