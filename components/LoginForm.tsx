"use client";

import { useActionState } from "react";
import { guestAction, loginAction, type AuthState } from "@/lib/actions";
import { c, font } from "@/lib/theme";
import { Notice, PrimaryButton } from "@/components/ui";

export default function LoginForm() {
  const [state, submitLogin, pending] = useActionState<AuthState, FormData>(loginAction, undefined);
  const [guestState, submitGuest, guestPending] = useActionState<AuthState, FormData>(guestAction, undefined);

  const error = state?.error ?? guestState?.error;
  const busy = pending || guestPending;

  return (
    <div className="screen">
      <div className="scroll" style={{ padding: "72px 24px 28px", display: "flex", flexDirection: "column" }}>
        {/* brand */}
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 20,
            background: c.heroGrad,
            border: `1px solid ${c.limeBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            marginBottom: 22,
          }}
        >
          ⚽
        </div>
        <h1 style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>
          World Cup
          <br />
          Predictor
        </h1>
        <p style={{ color: c.muted, fontSize: 13.5, marginTop: 10, lineHeight: 1.5 }}>
          Predict scores, climb the leaderboard, and settle friendly $1 bets.
        </p>

        {error && (
          <Notice tone="error" style={{ marginTop: 20 }}>
            {error}
          </Notice>
        )}

        <form action={submitLogin} style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label
              htmlFor="mobile"
              style={{ display: "block", color: c.muted, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, marginBottom: 7 }}
            >
              MOBILE
            </label>
            <input
              id="mobile"
              name="mobile"
              className="field"
              type="tel"
              inputMode="numeric"
              autoComplete="username"
              placeholder="09120000000"
              required
              disabled={busy}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              style={{ display: "block", color: c.muted, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, marginBottom: 7 }}
            >
              PASSWORD
            </label>
            <input
              id="password"
              name="password"
              className="field"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              disabled={busy}
            />
          </div>
          <PrimaryButton type="submit" disabled={busy} style={{ marginTop: 6 }}>
            {pending ? "Signing in…" : "Sign in"}
          </PrimaryButton>
        </form>

        {/* divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
          <div style={{ flex: 1, height: 1, background: c.border }} />
          <span style={{ color: c.muted2, fontSize: 11, fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: c.border }} />
        </div>

        <form action={submitGuest}>
          <button
            type="submit"
            disabled={busy}
            className="pressable"
            style={{
              width: "100%",
              height: 50,
              borderRadius: 14,
              background: c.surface,
              border: `1px solid ${c.border3}`,
              color: c.text,
              fontFamily: font.display,
              fontWeight: 600,
              fontSize: 15,
              opacity: busy ? 0.5 : 1,
            }}
          >
            {guestPending ? "Continuing…" : "Continue as guest"}
          </button>
        </form>
        <p style={{ color: c.muted2, fontSize: 11.5, textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
          Guests can browse everything but can&apos;t submit predictions or bets.
        </p>
      </div>
    </div>
  );
}
