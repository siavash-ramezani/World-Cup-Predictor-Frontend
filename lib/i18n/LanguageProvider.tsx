"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DICTIONARIES } from "./dictionaries";
import { LOCALE_COOKIE, dirOf, type Dictionary, type Locale } from "./types";

type Ctx = {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Dictionary;
  setLocale: (next: Locale) => void;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      setLocaleState(next);
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      document.documentElement.lang = next;
      document.documentElement.dir = dirOf(next);
      router.refresh();
    },
    [locale, router],
  );

  const value = useMemo<Ctx>(
    () => ({ locale, dir: dirOf(locale), t: DICTIONARIES[locale], setLocale }),
    [locale, setLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within a LanguageProvider");
  return ctx;
}
