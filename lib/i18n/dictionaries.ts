// Client-safe (no `server-only`) — used by the LanguageProvider.
import { en } from "./en";
import { ar } from "./ar";
import type { Dictionary, Locale } from "./types";

export const DICTIONARIES: Record<Locale, Dictionary> = { en, ar };
