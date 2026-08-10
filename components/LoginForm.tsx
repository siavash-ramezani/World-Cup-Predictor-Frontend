"use client";

import { useActionState } from "react";
import { guestAction, loginAction, type AuthState } from "@/lib/actions";
import { c, font } from "@/lib/theme";
import { Notice, PrimaryButton } from "@/components/ui";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const COUNTRIES = [
  { code: "sa", dial: "966", flag: "🇸🇦" },
  { code: "ae", dial: "971", flag: "🇦🇪" },
  { code: "pl", dial: "48", flag: "🇵🇱" },
] as const;

export default function LoginForm() {
  const { t } = useI18n();
  const [state, submitLogin, pending] = useActionState<AuthState, FormData>(loginAction, undefined);
  const [guestState, submitGuest, guestPending] = useActionState<AuthState, FormData>(guestAction, undefined);

  const error = state?.error ?? guestState?.error;
  const busy = pending || guestPending;
  const countryName = { sa: t.login.countrySa, ae: t.login.countryAe, pl: t.login.countryPl };

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
          {t.login.brandLine1}
          <br />
          {t.login.brandLine2}
        </h1>
        <p style={{ color: c.muted, fontSize: 13.5, marginTop: 10, lineHeight: 1.5 }}>{t.login.tagline}</p>

        {error && (
          <Notice tone="error" style={{ marginTop: 20 }}>
            {error}
          </Notice>
        )}

        <form action={submitLogin} style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label
              htmlFor="country"
              style={{ display: "block", color: c.muted, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, marginBottom: 7 }}
            >
              {t.login.countryLabel}
            </label>
            <select id="country" name="country" className="field" required disabled={busy} defaultValue="sa">
              {COUNTRIES.map((cty) => (
                <option key={cty.code} value={cty.code}>
                  {cty.flag} {countryName[cty.code]} (+{cty.dial})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="mobile"
              style={{ display: "block", color: c.muted, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, marginBottom: 7 }}
            >
              {t.login.mobileLabel}
            </label>
            <input
              id="mobile"
              name="mobile"
              className="field"
              type="tel"
              inputMode="numeric"
              autoComplete="username"
              placeholder={t.login.mobilePlaceholder}
              required
              disabled={busy}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              style={{ display: "block", color: c.muted, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, marginBottom: 7 }}
            >
              {t.login.passwordLabel}
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
            {pending ? t.login.signingIn : t.login.signIn}
          </PrimaryButton>
        </form>

        {/* divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
          <div style={{ flex: 1, height: 1, background: c.border }} />
          <span style={{ color: c.muted2, fontSize: 11, fontWeight: 600 }}>{t.login.or}</span>
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
            {guestPending ? t.login.continuingGuest : t.login.continueGuest}
          </button>
        </form>
        <p style={{ color: c.muted2, fontSize: 11.5, textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
          {t.login.guestFootnote}
        </p>
      </div>
    </div>
  );
}
