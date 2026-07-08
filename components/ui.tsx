import type { CSSProperties, ReactNode } from "react";
import { c, font } from "@/lib/theme";

/* Rounded pill chip. */
export function Pill({
  children,
  bg = "rgba(255,255,255,0.06)",
  color = c.text2,
  style,
}: {
  children: ReactNode;
  bg?: string;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 600,
        padding: "5px 11px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* Standard surface card. */
export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: 18,
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* Row heading: "Recent results ............ This week" */
export function SectionHeader({
  title,
  right,
  style,
}: {
  title: ReactNode;
  right?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        margin: "22px 2px 10px",
        ...style,
      }}
    >
      <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 600 }}>{title}</div>
      {right}
    </div>
  );
}

/* Inline notice — guest restrictions, API errors, locked community stats. */
export function Notice({
  children,
  tone = "muted",
  style,
}: {
  children: ReactNode;
  tone?: "muted" | "error" | "lime";
  style?: CSSProperties;
}) {
  const tones = {
    muted: { bg: c.surface, border: c.border, color: c.muted },
    error: { bg: "rgba(255,84,112,0.10)", border: "rgba(255,84,112,0.35)", color: c.red },
    lime: { bg: "rgba(181,255,61,0.08)", border: "rgba(181,255,61,0.30)", color: c.lime },
  }[tone];
  return (
    <div
      style={{
        background: tones.bg,
        border: `1px solid ${tones.border}`,
        color: tones.color,
        borderRadius: 12,
        padding: "10px 13px",
        fontSize: 12.5,
        lineHeight: 1.45,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* Centred empty state for lists with no data. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div style={{ textAlign: "center", color: c.muted2, fontSize: 13, padding: "48px 16px", lineHeight: 1.6 }}>
      {children}
    </div>
  );
}

/* Segmented control (Today/Tomorrow/Locked, and the ranks sub-tabs). */
export function SegTabs({
  tabs,
  active,
  onChange,
  fontSize = 12,
  gap = 4,
}: {
  tabs: ReactNode[];
  active: number;
  onChange: (i: number) => void;
  fontSize?: number;
  gap?: number;
}) {
  return (
    <div style={{ display: "flex", background: c.surface2, borderRadius: 12, padding: 4, gap }}>
      {tabs.map((t, i) => {
        const on = i === active;
        return (
          <button
            key={i}
            onClick={() => onChange(i)}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "8px 4px",
              borderRadius: 9,
              fontSize,
              fontWeight: 600,
              background: on ? c.surface3 : "transparent",
              color: on ? c.text : c.muted,
              transition: "background 0.15s ease, color 0.15s ease",
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

/* +/- score stepper. `sm` on the picks list, `lg` on match detail. */
const STEP = {
  sm: { bw: 46, bh: 26, br: 8, num: 34, numW: 46, incFs: 18, decFs: 20, bg: "rgba(255,255,255,0.05)", gap: 5 },
  lg: { bw: 54, bh: 28, br: 9, num: 56, numW: 60, incFs: 20, decFs: 22, bg: "rgba(255,255,255,0.06)", gap: 6 },
} as const;

export function ScoreStepper({
  value,
  onInc,
  onDec,
  size = "sm",
  disabled = false,
}: {
  value: number;
  onInc: () => void;
  onDec: () => void;
  size?: "sm" | "lg";
  disabled?: boolean;
}) {
  const s = STEP[size];
  const btn = (label: string, onClick: () => void, fs: number, color: string, aria: string) => (
    <button
      className="pressable"
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      style={{
        width: s.bw,
        height: s.bh,
        background: s.bg,
        borderRadius: s.br,
        color,
        fontSize: fs,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: s.gap }}>
      {btn("+", onInc, s.incFs, c.lime, "Increase")}
      <div
        className="tabnum"
        style={{
          fontFamily: font.display,
          fontSize: s.num,
          fontWeight: 600,
          lineHeight: 1,
          width: s.numW,
          textAlign: "center",
        }}
      >
        {value}
      </div>
      {btn("−", onDec, s.decFs, c.muted, "Decrease")}
    </div>
  );
}

/* Primary lime CTA. */
export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  style?: CSSProperties;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="pressable"
      style={{
        width: "100%",
        height: 52,
        borderRadius: 14,
        background: c.lime,
        color: c.limeInk,
        fontFamily: font.display,
        fontWeight: 700,
        fontSize: 16,
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
