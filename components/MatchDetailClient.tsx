"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MatchDetail } from "@/lib/types";
import { savePredictionAction, toggleDollarBetAction } from "@/lib/actions";
import { useScores } from "@/lib/useScores";
import { classifyPick, parseApiTime, teamCode, verdictLabel } from "@/lib/format";
import { c, font } from "@/lib/theme";
import Avatar from "@/components/Avatar";
import FlagDisc from "@/components/FlagDisc";
import Countdown from "@/components/Countdown";
import BackButton from "@/components/BackButton";
import { Notice, PrimaryButton, ScoreStepper } from "@/components/ui";

const teamColumn = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 10,
  width: 100,
} as const;

const teamName = {
  fontFamily: font.display,
  fontWeight: 600,
  fontSize: 15,
  textAlign: "center",
  lineHeight: 1.2,
} as const;

export default function MatchDetailClient({ match, isGuest }: { match: MatchDetail; isGuest: boolean }) {
  const router = useRouter();
  const id = String(match.id);
  const { scores, bump } = useScores({
    [id]: { h: match.my_prediction?.home ?? 0, a: match.my_prediction?.away ?? 0 },
  });
  const s = scores[id];

  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ tone: "error" | "lime"; text: string } | null>(null);

  const editable = match.is_prediction_open && !isGuest && !pending;
  const community = match.community;

  const save = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await savePredictionAction(match.id, s.h, s.a);
      if (res.ok) {
        setMsg({ tone: "lime", text: "Prediction saved." });
        router.refresh();
      } else setMsg({ tone: "error", text: res.error });
    });
  };

  const toggleBet = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await toggleDollarBetAction(match.id);
      if (res.ok) router.refresh();
      else setMsg({ tone: "error", text: res.error });
    });
  };

  const wp = community?.win_probability;
  const segments = wp
    ? [
        { key: "home", label: `${teamCode(match.home)} ${wp.home.percent}%`, pct: wp.home.percent, color: c.lime, text: c.lime },
        { key: "draw", label: `Draw ${wp.draw.percent}%`, pct: wp.draw.percent, color: c.dim, text: c.muted },
        { key: "away", label: `${teamCode(match.away)} ${wp.away.percent}%`, pct: wp.away.percent, color: c.cyan, text: c.cyan },
      ]
    : [];

  const betActive = match.dollar_bet?.active ?? false;

  return (
    <div className="screen">
      <div className="scroll" style={{ padding: "54px 16px 16px" }}>
        {/* top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 8 }}>
          <BackButton />
          <div style={{ color: c.muted, fontSize: 13, fontWeight: 600 }}>{match.round_label}</div>
          <span
            style={{
              background: c.surface,
              border: `1px solid ${c.border3}`,
              borderRadius: 999,
              padding: "8px 11px",
              fontSize: 11.5,
              fontWeight: 700,
              color: c.text2,
              fontFamily: font.display,
              whiteSpace: "nowrap",
            }}
            title={`${match.dollar_bet_count} players staked $1 on this match`}
          >
            💵 {match.dollar_bet_count}
          </span>
        </div>

        {/* matchup — each crest links to that team's page */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", marginBottom: 6, gap: 6 }}>
          <Link href={`/teams/${encodeURIComponent(match.home.name)}`} className="pressable" style={teamColumn}>
            <FlagDisc team={match.home} size={64} ring={1.5} />
            <div style={teamName}>{match.home.name}</div>
          </Link>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: font.display, fontSize: 13, fontWeight: 600, color: c.muted2 }}>{match.match_time_label}</div>
            <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: c.dim, marginTop: 2 }}>VS</div>
          </div>
          <Link href={`/teams/${encodeURIComponent(match.away.name)}`} className="pressable" style={teamColumn}>
            <FlagDisc team={match.away} size={64} ring={1.5} />
            <div style={teamName}>{match.away.name}</div>
          </Link>
        </div>
        <div style={{ textAlign: "center", color: c.muted2, fontSize: 12, marginBottom: 16 }}>
          {match.venue ?? match.round_label}
          {match.is_prediction_open && (
            <>
              {" · locks in "}
              <Countdown deadlineMs={parseApiTime(match.prediction_deadline)} lockedText="now" />
            </>
          )}
        </div>

        {msg && <Notice tone={msg.tone} style={{ marginBottom: 12 }}>{msg.text}</Notice>}
        {isGuest && (
          <Notice style={{ marginBottom: 12 }}>
            Guests can&apos;t predict.{" "}
            <Link href="/login" style={{ color: c.lime, fontWeight: 700 }}>
              Sign in
            </Link>{" "}
            to play.
          </Notice>
        )}
        {!match.is_prediction_open && !isGuest && (
          <Notice style={{ marginBottom: 12 }}>Predictions for this match are locked.</Notice>
        )}

        {/* your prediction */}
        <div style={{ borderRadius: 20, padding: 18, background: c.heroGrad, border: `1px solid ${c.limeBorder}` }}>
          <div style={{ textAlign: "center", color: c.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, marginBottom: 14 }}>
            YOUR PREDICTION
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
            <ScoreStepper size="lg" value={s.h} disabled={!editable} onInc={() => bump(id, "h", 1)} onDec={() => bump(id, "h", -1)} />
            <div style={{ fontFamily: font.display, fontSize: 34, color: c.dim, fontWeight: 600 }}>:</div>
            <ScoreStepper size="lg" value={s.a} disabled={!editable} onInc={() => bump(id, "a", 1)} onDec={() => bump(id, "a", -1)} />
          </div>
          <div style={{ textAlign: "center", color: c.muted, fontSize: 12, marginTop: 12 }}>
            {verdictLabel(match.home.name, match.away.name, s.h, s.a)}
          </div>
        </div>

        {/* $1 bet */}
        {!isGuest && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: c.surface,
              border: `1px solid ${betActive ? "rgba(181,255,61,0.35)" : c.border}`,
              borderRadius: 14,
              padding: "12px 14px",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>💵 $1 bet</div>
              <div style={{ color: c.muted, fontSize: 11.5, marginTop: 2 }}>
                {betActive ? "You're in — losers pay the pot." : "Stake $1 on your predicted outcome."}
              </div>
            </div>
            <button
              onClick={toggleBet}
              disabled={pending || !match.is_prediction_open}
              className="pressable"
              style={{
                background: betActive ? c.lime : "rgba(255,255,255,0.06)",
                color: betActive ? c.limeInk : c.text2,
                borderRadius: 10,
                padding: "9px 14px",
                fontFamily: font.display,
                fontWeight: 700,
                fontSize: 12.5,
                opacity: pending || !match.is_prediction_open ? 0.45 : 1,
                flexShrink: 0,
              }}
            >
              {betActive ? "Joined" : "Join"}
            </button>
          </div>
        )}

        {/* win probability */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
            <span style={{ fontFamily: font.display, fontSize: 13, fontWeight: 600, color: c.text2 }}>Win probability</span>
            <span style={{ color: c.muted2, fontSize: 11 }}>community</span>
          </div>
          {community && wp ? (
            <>
              <div style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", gap: 2, background: c.bgInput }}>
                {segments.map((seg) => (
                  <div key={seg.key} style={{ width: `${seg.pct}%`, background: seg.color }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11.5, fontFamily: font.display, fontWeight: 600 }}>
                {segments.map((seg) => (
                  <span key={seg.key} style={{ color: seg.text }}>
                    {seg.label}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <Notice>🔒 Everyone&apos;s picks stay hidden until the deadline — no peeking.</Notice>
          )}
        </div>

        {/* points on offer */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {[
            { pts: `+${match.scoring.exact_points}`, label: "Exact score", color: c.lime },
            { pts: `+${match.scoring.result_points}`, label: "Right result", color: c.cyan },
          ].map((o) => (
            <div key={o.label} style={{ flex: 1, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, padding: 13 }}>
              <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 20, color: o.color }}>{o.pts}</div>
              <div style={{ color: c.muted, fontSize: 11.5, marginTop: 2 }}>{o.label}</div>
            </div>
          ))}
        </div>

        {/* community picks */}
        {community && community.picks.length > 0 && (
          <>
            <div style={{ margin: "20px 2px 10px", fontFamily: font.display, fontSize: 14, fontWeight: 600 }}>
              Everyone&apos;s picks
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {community.picks.slice(0, 12).map((p) => {
                const v = classifyPick(p.prediction, match, p.points_earned);
                return (
                  <Link
                    key={p.user.id}
                    href={`/users/${p.user.id}`}
                    className="pressable"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      background: c.surface,
                      border: `1px solid ${c.border2}`,
                      borderRadius: 13,
                      padding: "10px 13px",
                    }}
                  >
                    <Avatar name={p.user.name} src={p.user.avatar_url} size={34} fontSize={12} />
                    <div style={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.user.name}
                    </div>
                    <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15, color: v.color }}>
                      {p.prediction.label}
                    </div>
                  </Link>
                );
              })}
              {community.picks.length > 12 && (
                <div style={{ textAlign: "center", color: c.muted2, fontSize: 12, padding: "6px 0" }}>
                  +{community.picks.length - 12} more
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* save */}
      <div style={{ padding: "8px 16px 14px", background: c.bg, flexShrink: 0 }}>
        <PrimaryButton onClick={save} disabled={!editable}>
          {pending ? "Saving…" : match.my_prediction ? "Update prediction" : "Save prediction"}
        </PrimaryButton>
      </div>
    </div>
  );
}
