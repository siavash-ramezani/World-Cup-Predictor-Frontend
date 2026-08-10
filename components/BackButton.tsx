"use client";

import { useRouter } from "next/navigation";
import { c } from "@/lib/theme";
import { ChevronLeft } from "@/components/icons";
import { startNavigationProgress } from "@/components/NavigationProgress";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <button
      aria-label={t.a11y.back}
      className="pressable"
      onClick={() => {
        // `router.back()` fires popstate, which the progress bar already listens for.
        if (window.history.length > 1) router.back();
        else {
          startNavigationProgress();
          router.push(fallback);
        }
      }}
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: c.surface,
        border: `1px solid ${c.border3}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: c.text2,
      }}
    >
      <span className="rtl-flip" style={{ display: "flex" }}>
        <ChevronLeft size={16} />
      </span>
    </button>
  );
}
