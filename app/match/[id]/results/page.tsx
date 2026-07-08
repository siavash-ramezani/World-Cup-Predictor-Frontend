import Link from "next/link";
import { redirect } from "next/navigation";
import { apiGet, requireSession } from "@/lib/api";
import type { MatchDetail, Wrapped } from "@/lib/types";
import { c, font } from "@/lib/theme";
import { classifyPick, formatPoints } from "@/lib/format";
import Avatar from "@/components/Avatar";
import FlagDisc from "@/components/FlagDisc";
import BackButton from "@/components/BackButton";
import { Notice } from "@/components/ui";

type Row = { label: string; pct: number; count: number; color: string };

const teamColumn = { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 100 } as const;
const teamName = { fontFamily: font.display, fontWeight: 600, fontSize: 14, textAlign: "center", lineHeight: 1.2 } as const;

function BetList({ rows, dim }: { rows: Row[]; dim?: boolean }) {
  return (
    <>
      {rows.map((row) => (
        <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div
            style={{
              width: 104,
              fontSize: 12.5,
              color: c.text2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.label}
          </div>
          <div style={{ flex: 1, height: 8, background: c.bgInput, borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${row.pct}%`, background: row.color, borderRadius: 999 }} />
          </div>
          <div
            className="tabnum"
            style={{
              width: 58,
              textAlign: "right",
              fontFamily: font.display,
              fontSize: 11.5,
              fontWeight: 700,
              color: dim ? c.muted2 : c.text2,
            }}
          >
            {row.pct}% · {row.count}
          </div>
        </div>
      ))}
    </>
  );
}

export default async function MatchResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();

  const { data: match } = await apiGet<Wrapped<MatchDetail>>(`/matches/${id}/detail`);
  if (!match.is_finished) redirect(`/match/${id}`);

  const community = match.community;
  const wp = community?.win_probability;
  const dollar = community?.dollar;
  const dollarPct = (n: number) => (dollar && dollar.total ? Math.round((n / dollar.total) * 100) : 0);

  const pointsRows: Row[] = wp
    ? [
        { label: `${match.home.name} win`, pct: wp.home.percent, count: wp.home.count, color: c.lime },
        { label: "Draw", pct: wp.draw.percent, count: wp.draw.count, color: c.dim },
        { label: `${match.away.name} win`, pct: wp.away.percent, count: wp.away.count, color: c.cyan },
      ]
    : [];

  const dollarRows: Row[] = dollar
    ? [
        { label: `${match.home.name} win`, pct: dollarPct(dollar.home), count: dollar.home, color: c.lime },
        { label: "Draw", pct: dollarPct(dollar.draw), count: dollar.draw, color: c.dim },
        { label: `${match.away.name} win`, pct: dollarPct(dollar.away), count: dollar.away, color: c.cyan },
      ]
    : [];

  const meta = [match.venue, match.match_time_label, match.round_label].filter(Boolean).join(" · ");

  return (
    <div className="screen">
      <div className="scroll" style={{ padding: "54px 16px 20px" }}>
        {/* top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <BackButton />
          <div style={{ color: c.muted, fontSize: 13, fontWeight: 600 }}>Match result</div>
          <div style={{ width: 38 }} />
        </div>

        {/* scoreboard */}
        <div style={{ borderRadius: 20, padding: 16, background: c.surface, border: `1px solid ${c.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span
              style={{
                background: c.redTint,
                color: c.red,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: 0.6,
                padding: "4px 10px",
                borderRadius: 999,
              }}
            >
              ● FULL TIME
            </span>
            {match.my_prediction && (
              <span style={{ color: c.muted2, fontSize: 11 }}>
                You picked {match.my_prediction.label}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: 6 }}>
            <Link href={`/teams/${encodeURIComponent(match.home.name)}`} className="pressable" style={teamColumn}>
              <FlagDisc team={match.home} size={40} ring={1.5} />
              <div style={teamName}>{match.home.name}</div>
            </Link>
            <div style={{ textAlign: "center" }}>
              <div className="tabnum" style={{ fontFamily: font.display, fontSize: 42, fontWeight: 700, lineHeight: 1 }}>
                {match.home_score} <span style={{ color: c.dim }}>—</span> {match.away_score}
              </div>
              {community && (
                <div style={{ color: c.muted2, fontSize: 11, marginTop: 6 }}>{community.total_predictions} predictions</div>
              )}
            </div>
            <Link href={`/teams/${encodeURIComponent(match.away.name)}`} className="pressable" style={teamColumn}>
              <FlagDisc team={match.away} size={56} ring={1.5} />
              <div style={teamName}>{match.away.name}</div>
            </Link>
          </div>
          <div
            style={{
              textAlign: "center",
              color: c.muted2,
              fontSize: 11.5,
              marginTop: 14,
              paddingTop: 12,
              borderTop: `1px solid ${c.border}`,
            }}
          >
            {meta}
          </div>
        </div>

        {!community ? (
          <Notice style={{ marginTop: 14 }}>Community results aren&apos;t available for this match.</Notice>
        ) : (
          <>
            {/* points predictions */}
            <div style={{ marginTop: 14, borderRadius: 18, padding: 16, background: c.surface, border: `1px solid ${c.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 600 }}>📊 Points predictions</div>
                <span style={{ color: c.lime, fontFamily: font.display, fontWeight: 700, fontSize: 14 }}>
                  {community.total_predictions} in
                </span>
              </div>
              <BetList rows={pointsRows} />
            </div>

            {/* dollar bets */}
            <div style={{ marginTop: 12, borderRadius: 18, padding: 16, background: c.surface, border: `1px solid ${c.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 600 }}>💵 $1 bets</div>
                <span style={{ color: c.muted2, fontFamily: font.display, fontWeight: 700, fontSize: 14 }}>
                  {dollar?.total ?? 0} bets
                </span>
              </div>
              <BetList rows={dollarRows} dim />
            </div>

            {/* all predictions */}
            <div style={{ margin: "20px 2px 10px", fontFamily: font.display, fontSize: 14, fontWeight: 600 }}>
              All predictions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {community.picks.map((p) => {
                const v = classifyPick(p.prediction, match, p.points_earned);
                const you = p.user.id === session.user?.id;
                return (
                  <Link
                    key={p.user.id}
                    href={`/users/${p.user.id}`}
                    className="pressable"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      borderRadius: 13,
                      padding: "10px 13px",
                      background: you ? "rgba(181,255,61,0.08)" : c.surface,
                      border: you ? "1px solid rgba(181,255,61,0.3)" : `1px solid ${c.border2}`,
                    }}
                  >
                    <Avatar name={p.user.name} src={p.user.avatar_url} size={34} fontSize={11} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 13.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {you ? "You" : p.user.name}
                      </div>
                      <div style={{ color: c.muted2, fontSize: 11, marginTop: 1 }}>{v.tag}</div>
                    </div>
                    <div className="tabnum" style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15, color: c.text2 }}>
                      {p.prediction.label}
                    </div>
                    <div
                      style={{
                        width: 34,
                        textAlign: "right",
                        fontFamily: font.display,
                        fontWeight: 700,
                        fontSize: 14,
                        color: v.color,
                      }}
                    >
                      {formatPoints(p.points_earned)}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
