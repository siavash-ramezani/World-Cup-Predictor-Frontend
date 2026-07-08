// Design tokens ported from the "World Cup Predictor" Claude Design source.
// Colors are the exact hex/gradients used across the 8 screens.

export const c = {
  // backgrounds
  bg: "#0A0D13",
  bgFrame: "#0C1018",
  bgInput: "#0B0E14",
  headerGrad: "linear-gradient(#0E1320,#0A0D13)",
  heroGrad: "linear-gradient(140deg,#18233a,#10151f)",

  // surfaces
  surface: "#141923",
  surface2: "#11161F",
  surface3: "#1F2838",

  // text
  text: "#F0F3F8",
  text2: "#C7CEDB",
  muted: "#8A93A6",
  muted2: "#5A6275",
  dim: "#3a4252",
  label: "#7b8496",

  // accents
  lime: "#B5FF3D",
  limeInk: "#08110A",
  cyan: "#46E5FF",
  purple: "#7A5CFF",
  pink: "#FF3D8B",
  red: "#FF5470",
  gold: "#FFD23D",

  // lines / tints
  border: "rgba(255,255,255,0.06)",
  border2: "rgba(255,255,255,0.05)",
  border3: "rgba(255,255,255,0.08)",
  limeTint: "rgba(181,255,61,0.12)",
  limeBorder: "rgba(181,255,61,0.18)",
  cyanTint: "rgba(70,229,255,0.12)",
  redTint: "rgba(255,84,112,0.14)",
} as const;

export const font = {
  body: "var(--font-manrope), system-ui, sans-serif",
  display: "var(--font-grotesk), var(--font-manrope), sans-serif",
} as const;

// "row is you" highlight helpers (from the design's youBg / youBorder)
export const youBg = (you?: boolean) => (you ? "rgba(181,255,61,0.10)" : c.surface);
export const youBorder = (you?: boolean) =>
  you ? "1px solid rgba(181,255,61,0.38)" : `1px solid ${c.border2}`;

export const rankColor = (r: number) =>
  r === 1 ? "#FFD23D" : r === 2 ? "#C9D2E0" : r === 3 ? "#FF9F5A" : c.muted2;
export const ringColor = (r: number) => (r <= 3 ? rankColor(r) : "transparent");
export const medal = (r: number): string => ({ 1: "🥇", 2: "🥈", 3: "🥉" }[r] ?? String(r));
