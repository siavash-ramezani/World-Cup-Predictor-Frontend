"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Match } from "@/lib/types";
import { c, font } from "@/lib/theme";
import { classifyPick, formatPoints, parseApiTime, teamCode } from "@/lib/format";
import FlagDisc from "@/components/FlagDisc";
import BackButton from "@/components/BackButton";
import { EmptyState } from "@/components/ui";

const ALL = "all";

export default function MatchesClient({ matches }: { matches: Match[] }) {
  const [round, setRound] = useState<string>(ALL);
  const [q, setQ] = useState("");

  // The API returns oldest-first; an archive reads better newest-first.
  const newestFirst = useMemo(
    () => [...matches].sort((a, b) => parseApiTime(b.match_time) - parseApiTime(a.match_time)),
    [matches],
  );

  const rounds = useMemo(() => {
    const seen = new Map<string, string>();
    for (const m of newestFirst) if (!seen.has(m.round)) seen.set(m.round, m.round_label);
    return [...seen.entries()];
  }, [newestFirst]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return newestFirst.filter((m) => {
      if (round !== ALL && m.round !== round) return false;
      if (!needle) return true;
      return (
        m.home.name.toLowerCase().includes(needle) ||
        m.away.name.toLowerCase().includes(needle) ||
        teamCode(m.home).toLowerCase().includes(needle) ||
        teamCode(m.away).toLowerCase().includes(needle)
      );
    });
  }, [newestFirst, round, q]);

  // Summary reflects whatever is currently filtered in.
  const summary = useMemo(() => {
    const predicted = rows.filter((m) => m.my_prediction);
    const points = predicted.reduce((sum, m) => sum + (m.my_prediction?.points_earned ?? 0), 0);
    const exact = predicted.filter(
      (m) => classifyPick(m.my_prediction!, m, m.my_prediction!.points_earned ?? 0).tag === "Exact",
    ).length;
    return { total: rows.length, predicted: predicted.length, points, exact };
  }, [rows]);

  return (
    <div className="screen">
      <div style={{ padding: "54px 16px 12px", background: c.headerGrad, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 10 }}>
          <BackButton fallback="/" />
          <div style={{ fontFamily: font.display, fontSize: 21, fontWeight: 700 }}>Past matches</div>
          <span style={{ color: c.muted2, fontSize: 12, fontWeight: 600, minWidth: 38, textAlign: "right" }}>{matches.length}</span>
        </div>

        <input
          className="field"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a team…"
          aria-label="Search matches by team"
          style={{ marginBottom: 10, padding: "11px 13px", fontSize: 14 }}
        />

        {/* round filter */}
        <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2 }}>
          {[[ALL, "All"] as const, ...rounds].map(([value, label]) => {
            const on = round === value;
            return (
              <button
                key={value}
                onClick={() => setRound(value)}
                style={{
                  flexShrink: 0,
                  background: on ? c.limeTint : c.surface,
                  border: `1px solid ${on ? "rgba(181,255,61,0.38)" : c.border}`,
                  color: on ? c.lime : c.muted,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "7px 13px",
                  borderRadius: 999,
                  transition: "background 0.12s ease, color 0.12s ease, border-color 0.12s ease",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* summary */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          background: c.bgFrame,
          borderBottom: `1px solid ${c.border}`,
          color: c.muted,
          fontSize: 11.5,
          flexShrink: 0,
        }}
      >
        <span>
          <span style={{ color: c.text, fontWeight: 700 }}>{summary.total}</span> matches ·{" "}
          <span style={{ color: c.text, fontWeight: 700 }}>{summary.predicted}</span> predicted
        </span>
        <span>
          <span style={{ color: c.cyan, fontWeight: 700, fontFamily: font.display }}>{summary.exact}</span> exact ·{" "}
          <span style={{ color: c.lime, fontWeight: 700, fontFamily: font.display }}>{summary.points}</span> pts
        </span>
      </div>

      <div className="scroll" style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.length === 0 ? (
          <EmptyState>No matches match your filters.</EmptyState>
        ) : (
          rows.map((m) => {
            const pick = m.my_prediction;
            const earned = pick?.points_earned ?? 0;
            const v = pick ? classifyPick(pick, m, earned) : null;
            return (
              <Link
                key={m.id}
                href={`/match/${m.id}/results`}
                className="pressable"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  background: c.surface,
                  border: `1px solid ${c.border2}`,
                  borderRadius: 14,
                  padding: "10px 13px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <FlagDisc team={m.home} size={30} />
                  <div style={{ marginLeft: -9 }}>
                    <FlagDisc team={m.away} size={30} />
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="tabnum" style={{ fontFamily: font.display, fontWeight: 600, fontSize: 13.5 }}>
                    {teamCode(m.home)} <span style={{ color: c.text2 }}>{m.result_label ?? "–"}</span> {teamCode(m.away)}
                  </div>
                  <div style={{ color: c.muted2, fontSize: 11, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.round_label} · {m.match_time_label}
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {pick && v ? (
                    <>
                      <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15, color: v.color }}>
                        {formatPoints(earned)}
                      </div>
                      <div style={{ color: c.muted2, fontSize: 10, marginTop: 1 }}>
                        {pick.label} · {v.tag}
                      </div>
                    </>
                  ) : (
                    <div style={{ color: c.muted2, fontSize: 11, fontWeight: 600 }}>No pick</div>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
