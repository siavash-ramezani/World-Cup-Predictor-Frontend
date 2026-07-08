"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Match } from "@/lib/types";
import { submitPicksAction } from "@/lib/actions";
import { useScores, type Score } from "@/lib/useScores";
import { parseApiTime, teamCode, verdictLabel } from "@/lib/format";
import { c, font } from "@/lib/theme";
import FlagDisc from "@/components/FlagDisc";
import Countdown from "@/components/Countdown";
import { EmptyState, Notice, PrimaryButton, ScoreStepper, SegTabs } from "@/components/ui";

type Groups = { today: Match[]; upcoming: Match[]; locked: Match[] };
const ZERO: Score = { h: 0, a: 0 };

export default function PredictClient({
  groups,
  initialTab,
  totalPoints,
  isGuest,
}: {
  groups: Groups;
  initialTab: number;
  totalPoints: number;
  isGuest: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState(initialTab);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ tone: "error" | "lime"; text: string } | null>(null);

  const all = useMemo(() => [...groups.today, ...groups.upcoming, ...groups.locked], [groups]);
  const initial = useMemo(
    () =>
      Object.fromEntries(
        all.map((m) => [String(m.id), { h: m.my_prediction?.home ?? 0, a: m.my_prediction?.away ?? 0 }]),
      ) as Record<string, Score>,
    [all],
  );

  const { scores, bump } = useScores(initial);
  const [baseline, setBaseline] = useState<Record<string, Score>>(initial);

  const scoreOf = (m: Match) => scores[String(m.id)] ?? ZERO;
  const changed = (m: Match) => {
    const s = scoreOf(m);
    const b = baseline[String(m.id)] ?? ZERO;
    return s.h !== b.h || s.a !== b.a;
  };
  /** Unsaved (never predicted) or edited — these are what "Submit N picks" sends. */
  const needsSubmit = (m: Match) => m.is_prediction_open && (!m.my_prediction || changed(m));

  const openMatches = [...groups.today, ...groups.upcoming];
  const queued = openMatches.filter(needsSubmit);

  const soonest = openMatches.reduce(
    (min, m) => Math.min(min, parseApiTime(m.prediction_deadline)),
    Number.POSITIVE_INFINITY,
  );

  const submit = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await submitPicksAction(
        queued.map((m) => ({ id: m.id, home: scoreOf(m).h, away: scoreOf(m).a })),
      );
      if (res.ok) {
        setBaseline({ ...scores });
        setMsg({ tone: "lime", text: `Saved ${queued.length} pick${queued.length === 1 ? "" : "s"}.` });
        router.refresh();
      } else {
        setMsg({ tone: "error", text: res.error });
      }
    });
  };

  const lists: Match[][] = [groups.today, groups.upcoming, groups.locked];
  const visible = lists[tab] ?? [];

  const emptyCopy = [
    "No fixtures kick off today.",
    "Nothing else open for picks right now.",
    "No locked fixtures — everything upcoming is still open.",
  ][tab];

  return (
    <div className="screen">
      {/* header */}
      <div style={{ padding: "56px 20px 14px", background: c.headerGrad, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: font.display, fontSize: 26, fontWeight: 700, lineHeight: 1 }}>Predict</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.red, boxShadow: `0 0 8px ${c.red}` }} />
              <span style={{ color: c.muted, fontSize: 12.5, fontWeight: 500 }}>
                {Number.isFinite(soonest) ? (
                  <>
                    Picks lock in{" "}
                    <span style={{ color: c.text, fontWeight: 700 }}>
                      <Countdown deadlineMs={soonest} lockedText="now" />
                    </span>
                  </>
                ) : (
                  "No picks open"
                )}
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              background: c.surface,
              border: `1px solid ${c.border}`,
              borderRadius: 12,
              padding: "8px 12px",
            }}
          >
            <span className="tabnum" style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18, color: c.lime }}>
              {totalPoints}
            </span>
            <span style={{ color: c.muted, fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>PTS</span>
          </div>
        </div>
        <SegTabs tabs={["Today", "Upcoming", "Locked"]} active={tab} onChange={setTab} fontSize={13} />
      </div>

      {/* match list */}
      <div className="scroll" style={{ padding: "14px 16px 8px", display: "flex", flexDirection: "column", gap: 12 }}>
        {isGuest && (
          <Notice>
            You&apos;re browsing as a guest.{" "}
            <Link href="/login" style={{ color: c.lime, fontWeight: 700 }}>
              Sign in
            </Link>{" "}
            to submit predictions.
          </Notice>
        )}
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}

        {visible.length === 0 ? (
          <EmptyState>{emptyCopy}</EmptyState>
        ) : (
          visible.map((m) => {
            const s = scoreOf(m);
            const editable = m.is_prediction_open && !isGuest && !pending;
            const saved = !!m.my_prediction && !changed(m);
            return (
              <div
                key={m.id}
                style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 18, padding: "13px 14px" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
                  <span style={{ color: c.muted, fontSize: 11.5, fontWeight: 500, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.match_time_label} · {m.round_label}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {saved && (
                      <span style={{ color: c.lime, fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.lime }} />
                        SAVED
                      </span>
                    )}
                    <span
                      style={{
                        background: c.cyanTint,
                        color: c.cyan,
                        fontFamily: font.display,
                        fontWeight: 700,
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 999,
                      }}
                    >
                      Exact +{m.scoring.exact_points}
                    </span>
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, width: 66 }}>
                    <FlagDisc team={m.home} size={44} />
                    <div style={{ fontFamily: font.display, fontWeight: 600, fontSize: 13 }}>{teamCode(m.home)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ScoreStepper
                      value={s.h}
                      disabled={!editable}
                      onInc={() => bump(String(m.id), "h", 1)}
                      onDec={() => bump(String(m.id), "h", -1)}
                    />
                    <div style={{ fontFamily: font.display, fontSize: 24, color: c.dim, fontWeight: 600 }}>:</div>
                    <ScoreStepper
                      value={s.a}
                      disabled={!editable}
                      onInc={() => bump(String(m.id), "a", 1)}
                      onDec={() => bump(String(m.id), "a", -1)}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, width: 66 }}>
                    <FlagDisc team={m.away} size={44} />
                    <div style={{ fontFamily: font.display, fontWeight: 600, fontSize: 13 }}>{teamCode(m.away)}</div>
                  </div>
                </div>

                <div style={{ marginTop: 10, textAlign: "center", color: c.muted, fontSize: 12 }}>
                  {m.is_prediction_open ? (
                    <>
                      Your call: <span style={{ color: c.text, fontWeight: 600 }}>{verdictLabel(m.home.name, m.away.name, s.h, s.a)}</span>
                    </>
                  ) : m.my_prediction ? (
                    <>
                      Locked in: <span style={{ color: c.text, fontWeight: 600 }}>{m.my_prediction.label}</span>
                    </>
                  ) : (
                    <span style={{ color: c.muted2 }}>Locked — no pick submitted</span>
                  )}
                </div>

                <div style={{ marginTop: 10, textAlign: "center" }}>
                  <Link href={`/match/${m.id}`} style={{ color: c.muted2, fontSize: 11.5, fontWeight: 600 }}>
                    Match details →
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* submit */}
      <div style={{ padding: "8px 16px 10px", background: `linear-gradient(rgba(10,13,19,0),${c.bg} 40%)`, flexShrink: 0 }}>
        <PrimaryButton onClick={submit} disabled={isGuest || pending || queued.length === 0}>
          {pending
            ? "Submitting…"
            : queued.length === 0
              ? "All picks saved"
              : `Submit ${queued.length} pick${queued.length === 1 ? "" : "s"}`}
        </PrimaryButton>
      </div>
    </div>
  );
}
