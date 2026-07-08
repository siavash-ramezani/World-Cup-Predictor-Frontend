"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { c, font, medal, rankColor, ringColor, youBg, youBorder } from "@/lib/theme";
import { formatBalance, stringHue } from "@/lib/format";
import type { DailyPoints, DollarRow, LeaderRow, RankSeries } from "@/lib/types";
import Avatar from "@/components/Avatar";
import { EmptyState, Notice } from "@/components/ui";

type Props = {
  leaders: LeaderRow[];
  totalPlayers: number;
  dollarRows: DollarRow[];
  dollarMe: DollarRow | null;
  yourBalance: number;
  trend: { dates: string[]; series: RankSeries[] };
  meName: string;
  daily: DailyPoints;
  meId: number | null;
};

export default function RanksClient(props: Props) {
  const [tab, setTab] = useState(0);
  const tabs = ["🏆 Points", "$1 Bets", "Rank", "Stats"];

  return (
    <div className="screen">
      <div style={{ padding: "56px 20px 14px", background: c.headerGrad, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontFamily: font.display, fontSize: 26, fontWeight: 700 }}>Leaderboard</div>
          <span style={{ color: c.muted2, fontSize: 12, fontWeight: 600 }}>{props.totalPlayers} players</span>
        </div>
        <div style={{ display: "flex", background: c.surface2, borderRadius: 12, padding: 4, gap: 3 }}>
          {tabs.map((t, i) => {
            const on = i === tab;
            return (
              <button
                key={t}
                onClick={() => setTab(i)}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "8px 4px",
                  borderRadius: 9,
                  fontSize: 12,
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
      </div>

      <div className="scroll" style={{ padding: "16px 16px 12px" }}>
        {tab === 0 && <PointsTab leaders={props.leaders} totalPlayers={props.totalPlayers} meId={props.meId} />}
        {tab === 1 && <DollarTab rows={props.dollarRows} me={props.dollarMe} balance={props.yourBalance} meId={props.meId} />}
        {tab === 2 && <RankTab trend={props.trend} meName={props.meName} totalPlayers={props.totalPlayers} />}
        {tab === 3 && <StatsTab daily={props.daily} />}
      </div>
    </div>
  );
}

/* ---------- Points ---------- */
function PointsTab({ leaders, totalPlayers, meId }: { leaders: LeaderRow[]; totalPlayers: number; meId: number | null }) {
  if (!leaders.length) return <EmptyState>No players ranked yet.</EmptyState>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "0 12px 2px",
          color: c.muted2,
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: 0.4,
        }}
      >
        <div style={{ width: 24, textAlign: "center" }}>#</div>
        <div style={{ flex: 1 }}>PLAYER</div>
        <div style={{ width: 42, textAlign: "center" }}>±</div>
        <div style={{ minWidth: 44, textAlign: "right" }}>PTS</div>
      </div>

      {leaders.map((l) => {
        const you = l.id === meId;
        const d = l.rank_delta;
        const deltaText = d == null ? "–" : d > 0 ? `▲ ${d}` : d < 0 ? `▼ ${Math.abs(d)}` : "–";
        const deltaColor = d == null || d === 0 ? c.muted2 : d > 0 ? c.lime : c.red;
        return (
          <Link
            key={l.id}
            href={`/users/${l.id}`}
            className="pressable"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              borderRadius: 14,
              padding: "10px 12px",
              background: youBg(you),
              border: youBorder(you),
            }}
          >
            <div
              className="tabnum"
              style={{ width: 24, textAlign: "center", fontFamily: font.display, fontWeight: 700, fontSize: 15, color: rankColor(l.rank) }}
            >
              {medal(l.rank)}
            </div>
            <Avatar name={l.name} src={l.avatar_url} size={38} ring={ringColor(l.rank)} fontSize={13} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {you ? "You" : l.name}
              </div>
              <div style={{ color: c.muted, fontSize: 11, marginTop: 1 }}>{l.count} predictions</div>
            </div>
            <div style={{ width: 42, textAlign: "center", fontFamily: font.display, fontWeight: 700, fontSize: 12, color: deltaColor }}>
              {deltaText}
            </div>
            <div className="tabnum" style={{ fontFamily: font.display, fontWeight: 700, fontSize: 17, minWidth: 44, textAlign: "right" }}>
              {l.points}
            </div>
          </Link>
        );
      })}
      <div style={{ textAlign: "center", color: c.muted2, fontSize: 12, padding: "8px 0 2px" }}>
        {leaders.length} of {totalPlayers} players
      </div>
    </div>
  );
}

/* ---------- $1 bets ---------- */
function DollarTab({
  rows,
  me,
  balance,
  meId,
}: {
  rows: DollarRow[];
  me: DollarRow | null;
  balance: number;
  meId: number | null;
}) {
  const wins = me?.wins ?? 0;
  const losses = me?.losses ?? 0;
  const settled = wins + losses;
  const winPct = settled ? Math.round((wins / settled) * 100) : 0;

  return (
    <>
      <div style={{ borderRadius: 18, padding: 16, background: c.heroGrad, border: `1px solid ${c.limeBorder}`, marginBottom: 14 }}>
        <div style={{ color: c.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>YOUR BALANCE</div>
        <div
          className="tabnum"
          style={{
            fontFamily: font.display,
            fontSize: 40,
            fontWeight: 700,
            color: balance >= 0 ? c.lime : c.red,
            lineHeight: 1,
            margin: "6px 0 12px",
          }}
        >
          {formatBalance(balance)}
        </div>
        {me ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(255,255,255,0.06)", color: c.text2, fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 999 }}>
              {wins}W · {losses}L
            </span>
            <span style={{ background: "rgba(255,255,255,0.06)", color: c.text2, fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 999 }}>
              {me.participated} bets
            </span>
            <span style={{ background: c.limeTint, color: c.lime, fontSize: 12, fontWeight: 700, padding: "5px 11px", borderRadius: 999 }}>
              {winPct}% win
            </span>
          </div>
        ) : (
          <div style={{ color: c.muted, fontSize: 12 }}>You haven&apos;t joined a $1 bet yet.</div>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState>No $1 bets settled yet.</EmptyState>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "0 12px 4px",
              color: c.muted2,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: 0.4,
            }}
          >
            <div style={{ width: 24, textAlign: "center" }}>#</div>
            <div style={{ flex: 1 }}>PLAYER</div>
            <div style={{ minWidth: 62, textAlign: "right" }}>BALANCE</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((d, i) => {
              const rank = i + 1;
              const you = d.id === meId;
              return (
                <Link
                  key={d.id}
                  href={`/users/${d.id}`}
                  className="pressable"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    borderRadius: 14,
                    padding: "10px 12px",
                    background: youBg(you),
                    border: youBorder(you),
                  }}
                >
                  <div style={{ width: 24, textAlign: "center", fontFamily: font.display, fontWeight: 700, fontSize: 15, color: rankColor(rank) }}>
                    {medal(rank)}
                  </div>
                  <Avatar name={d.name} src={d.avatar_url} size={38} ring={ringColor(rank)} fontSize={13} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {you ? "You" : d.name}
                    </div>
                    <div style={{ fontSize: 11, marginTop: 1 }}>
                      <span style={{ color: c.lime, fontWeight: 600 }}>{d.wins}W</span> <span style={{ color: c.muted2 }}>/</span>{" "}
                      <span style={{ color: c.red, fontWeight: 600 }}>{d.losses}L</span>{" "}
                      <span style={{ color: c.muted2 }}>· {d.participated} bets</span>
                    </div>
                  </div>
                  <div
                    className="tabnum"
                    style={{
                      fontFamily: font.display,
                      fontWeight: 700,
                      fontSize: 16,
                      minWidth: 62,
                      textAlign: "right",
                      color: d.balance >= 0 ? c.lime : c.red,
                    }}
                  >
                    {formatBalance(d.balance)}
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

/* ---------- Rank trend (multi-series, toggleable) ---------- */
const CX0 = 34;
const CW = 284;
const TOP = 16;
const H = 168;

type Pt = { x: number; y: number };

function RankTab({ trend, meName, totalPlayers }: { trend: { dates: string[]; series: RankSeries[] }; meName: string; totalPlayers: number }) {
  const n = trend.dates.length;

  // Stable axis: never rescales as series are toggled.
  const maxRank = useMemo(() => {
    const all = trend.series.flatMap((s) => s.ranks).filter((r): r is number => typeof r === "number");
    return Math.max(totalPlayers, ...(all.length ? all : [1]));
  }, [trend.series, totalPlayers]);

  const span = Math.max(maxRank - 1, 1);
  const step = n > 1 ? CW / (n - 1) : 0;
  const xOf = (i: number) => +(CX0 + i * step).toFixed(1);
  const yOf = (r: number) => +(TOP + ((r - 1) / span) * H).toFixed(1);

  const pointsOf = (s: RankSeries): Pt[] =>
    s.ranks
      .map((r, i) => ({ r, i }))
      .filter((p): p is { r: number; i: number } => typeof p.r === "number")
      .map((p) => ({ x: xOf(p.i), y: yOf(p.r) }));

  // "You" first, then by latest known rank.
  const ordered = useMemo(() => {
    const lastRank = (s: RankSeries) => {
      for (let i = s.ranks.length - 1; i >= 0; i--) if (typeof s.ranks[i] === "number") return s.ranks[i] as number;
      return Number.POSITIVE_INFINITY;
    };
    return [...trend.series].sort((a, b) => {
      if (a.name === meName) return -1;
      if (b.name === meName) return 1;
      return lastRank(a) - lastRank(b);
    });
  }, [trend.series, meName]);

  const [visible, setVisible] = useState<Set<string>>(() => new Set([meName]));
  const toggle = (name: string) =>
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const colorOf = (name: string) => (name === meName ? c.cyan : `hsl(${stringHue(name)} 72% 62%)`);

  const shown = ordered.filter((s) => visible.has(s.name));
  const showDots = shown.length <= 3;

  const mine = trend.series.find((s) => s.name === meName);
  const minePts = mine
    ? mine.ranks.map((r, i) => ({ r, i })).filter((p): p is { r: number; i: number } => typeof p.r === "number")
    : [];
  const best = minePts.length ? minePts.reduce((a, b) => (b.r < a.r ? b : a)) : null;
  const now = minePts.length ? minePts[minePts.length - 1] : null;

  const gridRanks = [0, 1, 2, 3, 4].map((k) => Math.round(1 + (k / 4) * span));
  const labelEvery = Math.max(1, Math.ceil(n / 7));

  return (
    <>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 600 }}>Rank over time</div>
        <div style={{ color: c.muted2, fontSize: 11.5 }}>last {n} days</div>
      </div>

      {best && now ? (
        <div style={{ color: c.muted, fontSize: 12, marginBottom: 14 }}>
          You peaked at <span style={{ color: c.cyan, fontWeight: 700, fontFamily: font.display }}>#{best.r}</span> on{" "}
          {trend.dates[best.i]} · now <span style={{ color: c.text, fontWeight: 700, fontFamily: font.display }}>#{now.r}</span>
        </div>
      ) : (
        <Notice style={{ marginBottom: 14 }}>No rank history for you yet — pick some matches.</Notice>
      )}

      <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: "14px 10px 8px" }}>
        <svg viewBox="0 0 330 210" width="100%" style={{ display: "block", fontFamily: "var(--font-grotesk)", overflow: "visible" }}>
          <g stroke="rgba(255,255,255,0.06)" strokeWidth={1}>
            {gridRanks.map((r, k) => (
              <line key={k} x1={CX0} y1={yOf(r)} x2={318} y2={yOf(r)} />
            ))}
          </g>
          <g fill={c.muted2} fontSize={9} textAnchor="end">
            {gridRanks.map((r, k) => (
              <text key={k} x={28} y={yOf(r) + 3}>
                #{r}
              </text>
            ))}
          </g>
          <g fill={c.muted2} fontSize={9} textAnchor="middle">
            {trend.dates.map((d, i) =>
              i % labelEvery === 0 ? (
                <text key={i} x={xOf(i)} y={203}>
                  {d.split(" ")[0]}
                </text>
              ) : null,
            )}
          </g>

          {shown.length === 0 && (
            <text x={176} y={104} fill={c.muted2} fontSize={11} textAnchor="middle">
              Pick a player below
            </text>
          )}

          {/* others first, "you" last so it draws on top */}
          {shown
            .filter((s) => s.name !== meName)
            .map((s) => {
              const pts = pointsOf(s);
              if (!pts.length) return null;
              return (
                <g key={s.name}>
                  <polyline
                    points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke={colorOf(s.name)}
                    strokeWidth={1.8}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    opacity={0.9}
                  />
                  {showDots && pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={c.bg} stroke={colorOf(s.name)} strokeWidth={1.6} />)}
                </g>
              );
            })}

          {shown.some((s) => s.name === meName) &&
            mine &&
            (() => {
              const pts = pointsOf(mine);
              if (!pts.length) return null;
              return (
                <g>
                  <polyline
                    points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke={c.cyan}
                    strokeWidth={2.6}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {showDots && pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill={c.bg} stroke={c.cyan} strokeWidth={2} />)}
                </g>
              );
            })()}
        </svg>
      </div>

      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "14px 2px 10px", gap: 8 }}>
        <div style={{ color: c.muted, fontSize: 12 }}>
          <span style={{ color: c.text, fontWeight: 700 }}>{shown.length}</span> of {ordered.length} shown
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setVisible(new Set(ordered.map((s) => s.name)))}
            style={{ background: c.surface, border: `1px solid ${c.border3}`, color: c.text2, borderRadius: 999, padding: "6px 12px", fontSize: 11.5, fontWeight: 600 }}
          >
            Show all
          </button>
          <button
            onClick={() => setVisible(new Set([meName]))}
            style={{ background: c.surface, border: `1px solid ${c.border3}`, color: c.text2, borderRadius: 999, padding: "6px 12px", fontSize: 11.5, fontWeight: 600 }}
          >
            Only me
          </button>
        </div>
      </div>

      {/* legend — every player, tap to toggle */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {ordered.map((s) => {
          const on = visible.has(s.name);
          const isMe = s.name === meName;
          const col = colorOf(s.name);
          return (
            <button
              key={s.name}
              onClick={() => toggle(s.name)}
              aria-pressed={on}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: on ? `color-mix(in srgb, ${col} 16%, transparent)` : c.surface,
                border: `1px solid ${on ? col : c.border}`,
                color: on ? col : c.muted,
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 999,
                transition: "background 0.12s ease, border-color 0.12s ease, color 0.12s ease",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: on ? col : c.muted2,
                  opacity: on ? 1 : 0.5,
                  flexShrink: 0,
                }}
              />
              {isMe ? "You" : s.name}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---------- Tournament stats ---------- */
function StatsTab({ daily }: { daily: DailyPoints }) {
  const vals = daily.points;
  if (!vals.length) return <EmptyState>No tournament stats yet.</EmptyState>;

  const total = vals.reduce((a, b) => a + b, 0);
  const best = Math.max(...vals);
  const avg = Math.round(total / vals.length);
  const barMax = Math.max(best, 1);
  const barH = 176;
  const labelEvery = Math.max(1, Math.ceil(vals.length / 14));

  const stats = [
    { v: total.toLocaleString("en-US"), label: "total points", color: c.text },
    { v: avg.toLocaleString("en-US"), label: "avg / day", color: c.cyan },
    { v: best.toLocaleString("en-US"), label: "best day", color: c.lime },
  ];

  return (
    <>
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ flex: 1, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, padding: 12 }}>
            <div className="tabnum" style={{ fontFamily: font.display, fontWeight: 700, fontSize: 19, color: s.color }}>
              {s.v}
            </div>
            <div style={{ color: c.muted, fontSize: 11, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Daily points distributed</div>
      <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: "16px 12px 10px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: barH }}>
          {vals.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
              <div
                title={`${daily.dates[i]}: ${v} pts`}
                style={{
                  width: "100%",
                  height: Math.max(2, Math.round((v / barMax) * barH)),
                  background: "linear-gradient(180deg,#B5FF3D,#5f8a1f)",
                  borderRadius: "3px 3px 0 0",
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
          {vals.map((_, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", color: c.muted2, fontSize: 8, fontFamily: font.display }}>
              {i % labelEvery === 0 ? daily.dates[i]?.split(" ")[0] : ""}
            </div>
          ))}
        </div>
      </div>
      <div style={{ textAlign: "center", color: c.muted2, fontSize: 11, marginTop: 10 }}>
        Total points shared across all players each day
      </div>
    </>
  );
}
