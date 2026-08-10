import "server-only";

import { cookies } from "next/headers";
import { en } from "./en";
import { ar } from "./ar";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Dictionary, type Locale } from "./types";

const DICTIONARIES: Record<Locale, Dictionary> = { en, ar };

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const raw = jar.get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** Convenience for Server Components/Actions that just want `t`. */
export async function getT(): Promise<Dictionary> {
  return getDictionary(await getLocale());
}
