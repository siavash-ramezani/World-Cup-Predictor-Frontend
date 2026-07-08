import { c } from "@/lib/theme";
import type { Match, Prediction } from "@/lib/types";

/** Regional-indicator flag emoji ("🇫🇷") → ISO-3166 alpha-2 ("FR"). */
export function flagToCode(flag?: string | null): string {
  if (!flag) return "";
  const letters = [...flag]
    .map((ch) => ch.codePointAt(0) ?? 0)
    .filter((cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff)
    .map((cp) => String.fromCharCode(65 + cp - 0x1f1e6));
  return letters.length >= 2 ? letters.join("") : "";
}

/** Short label for a team: real ISO code when the API gives us a flag, else a name stub. */
export function teamCode(team: { name: string; flag?: string | null }): string {
  return flagToCode(team.flag) || team.name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
}

/** Teams whose emoji carries no usable country information. */
const FLAG_CODE_OVERRIDES: Record<string, string> = {
  // The API sends a plain white flag (🏳️) for this one.
  "Cape Verde Islands": "cv",
};

/**
 * `flag-icons` code for a team: ISO 3166-1 alpha-2 ("fr") from a regional-indicator
 * pair, or an ISO 3166-2 subdivision ("gb-sct") from a waving-flag tag sequence
 * (🏴 + tag letters + cancel tag), as Scotland/England/Wales use. `null` → gradient.
 */
export function flagIconCode(team: { name: string; flag?: string | null }): string | null {
  const override = FLAG_CODE_OVERRIDES[team.name];
  if (override) return override;

  const cps = [...(team.flag ?? "")].map((ch) => ch.codePointAt(0) ?? 0);

  const regional = cps
    .filter((cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff)
    .map((cp) => String.fromCharCode(65 + cp - 0x1f1e6));
  if (regional.length >= 2) return regional.join("").toLowerCase();

  if (cps[0] === 0x1f3f4) {
    const tags = cps
      .filter((cp) => cp >= 0xe0020 && cp <= 0xe007e)
      .map((cp) => String.fromCodePoint(cp - 0xe0000))
      .join("");
    if (tags.length > 2) return `${tags.slice(0, 2)}-${tags.slice(2)}`;
  }

  return null;
}

function hash(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return h;
}

/** Stable hue (0–359) for a string — used to colour chart series per player. */
export function stringHue(s: string): number {
  return hash(s) % 360;
}

/** Vivid, deterministic gradient per team — stands in for a crest, as in the design. */
export function teamGradient(name: string): string {
  const h = hash(name) % 360;
  return `linear-gradient(135deg, hsl(${h} 76% 56%), hsl(${(h + 42) % 360} 70% 40%))`;
}

/** People avatars reuse the design's own gradient palette. */
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#FF7A59,#FF3D8B)",
  "linear-gradient(135deg,#46E5FF,#3D7BFF)",
  "linear-gradient(135deg,#B5FF3D,#3DBE6B)",
  "linear-gradient(135deg,#FFD23D,#FF7A3D)",
  "linear-gradient(135deg,#C46AFF,#6A4DFF)",
  "linear-gradient(135deg,#3DFFC2,#3D9BFF)",
  "linear-gradient(135deg,#46E5FF,#7A5CFF)",
];
export function avatarGradient(seed: string | number): string {
  return AVATAR_GRADIENTS[hash(String(seed)) % AVATAR_GRADIENTS.length];
}

/** "علی همتی" → "عه", "Sofia R." → "SR" */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "?";
  return parts.map((p) => [...p][0] ?? "").join("");
}

export type PickVerdict = { tag: string; color: string };

/** Classify a settled prediction against the final score. */
export function classifyPick(pred: Prediction, match: Pick<Match, "home_score" | "away_score">, pointsEarned: number): PickVerdict {
  if (match.home_score == null || match.away_score == null) return { tag: "Pending", color: c.muted2 };
  if (pred.home === match.home_score && pred.away === match.away_score) return { tag: "Exact", color: c.lime };
  if (pointsEarned > 0) return { tag: "Result", color: c.cyan };
  return { tag: "Missed", color: c.muted2 };
}

/** Longer copy used on the Home "recent results" rows. */
export function classifyPickLong(pred: Prediction, match: Pick<Match, "home_score" | "away_score">, pointsEarned: number): PickVerdict {
  const v = classifyPick(pred, match, pointsEarned);
  const long: Record<string, string> = { Exact: "Exact score", Result: "Right result", Missed: "Missed", Pending: "Pending" };
  return { tag: long[v.tag] ?? v.tag, color: v.color };
}

export function outcomeOf(home: number, away: number): "home" | "draw" | "away" {
  return home > away ? "home" : home < away ? "away" : "draw";
}

export function verdictLabel(homeName: string, awayName: string, home: number, away: number): string {
  const o = outcomeOf(home, away);
  return o === "home" ? `${homeName} win` : o === "away" ? `${awayName} win` : "Draw";
}

export function formatBalance(n: number): string {
  return (n >= 0 ? "+$" : "−$") + Math.abs(n).toFixed(2);
}

export function formatPoints(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** "2026-07-09 23:15:00" (server local time) → ms epoch, tolerant of the space separator. */
export function parseApiTime(s: string): number {
  const iso = s.includes("T") ? s : s.replace(" ", "T");
  return new Date(iso).getTime();
}

/** "2h 14m", "3d 4h", or null once elapsed. */
export function countdownLabel(target: number, now: number): string | null {
  let ms = target - now;
  if (ms <= 0) return null;
  const d = Math.floor(ms / 86400000);
  ms -= d * 86400000;
  const h = Math.floor(ms / 3600000);
  ms -= h * 3600000;
  const m = Math.floor(ms / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  const s = Math.floor((ms - m * 60000) / 1000);
  return `${m}m ${s}s`;
}

/** Same calendar day in the viewer's timezone. */
export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
