"use client";

import { c, font } from "@/lib/theme";
import { useI18n } from "@/lib/i18n/LanguageProvider";

/** Target-language label: shows what tapping switches *to*, not the current one. */
const NEXT_LABEL: Record<"en" | "ar", string> = { en: "EN", ar: "العربية" };

export default function LanguageFab() {
  const { locale, setLocale, t } = useI18n();
  const next = locale === "en" ? "ar" : "en";

  return (
    <button
      onClick={() => setLocale(next)}
      aria-label={t.a11y.switchLanguage}
      className="pressable"
      style={{
        position: "absolute",
        insetInlineEnd: 14,
        top: "max(12px, env(safe-area-inset-top, 12px))",
        zIndex: 95,
        display: "flex",
        alignItems: "center",
        gap: 5,
        background: "rgba(20,25,35,0.82)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        border: `1px solid ${c.border3}`,
        borderRadius: 999,
        padding: "7px 12px",
        color: c.text2,
        fontFamily: font.display,
        fontWeight: 700,
        fontSize: 11.5,
        boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
      }}
    >
      <span style={{ fontSize: 12 }}>🌐</span>
      {NEXT_LABEL[next]}
    </button>
  );
}
