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
import { getT } from "@/lib/i18n/server";

type Row = { label: string; pct: number; count: number; color: string };

const teamColumn = { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 100 } as const;
const teamName = { fontFamily: font.display, fontWeight: 600, fontSize: 14, textAlign: "center", lineHeight: 1.2 } as const;

function BetList({ rows }: { rows: Row[] }) {
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
              textAlign: "end",
              fontFamily: font.display,
              fontSize: 11.5,
              fontWeight: 700,
              color: c.text2,
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
  const t = await getT();

  const { data: match } = await apiGet<Wrapped<MatchDetail>>(`/matches/${id}/detail`);
  if (!match.is_finished) redirect(`/match/${id}`);

  const community = match.community;
  const wp = community?.win_probability;

  const pointsRows: Row[] = wp
    ? [
        { label: t.verdict.teamWin(match.home.name), pct: wp.home.percent, count: wp.home.count, color: c.lime },
        { label: t.verdict.draw, pct: wp.draw.percent, count: wp.draw.count, color: c.dim },
        { label: t.verdict.teamWin(match.away.name), pct: wp.away.percent, count: wp.away.count, color: c.cyan },
      ]
    : [];

  const meta = [match.venue, match.match_time_label, match.round_label].filter(Boolean).join(" · ");

  return (
    <div className="screen">
      <div className="scroll" style={{ padding: "54px 16px 20px" }}>
        {/* top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <BackButton />
          <div style={{ color: c.muted, fontSize: 13, fontWeight: 600 }}>{t.matchResults.title}</div>
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
              ● {t.matchResults.fullTime}
            </span>
            {match.my_prediction && (
              <span style={{ color: c.muted2, fontSize: 11 }}>{t.matchResults.youPicked(match.my_prediction.label)}</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: 6 }}>
            <Link href={`/teams/${encodeURIComponent(match.home.name)}`} className="pressable" style={teamColumn}>
              <FlagDisc team={match.home} size={46} ring={1.5} />
              <div style={teamName}>{match.home.name}</div>
            </Link>
            <div style={{ textAlign: "center" }}>
              <div className="tabnum" style={{ fontFamily: font.display, fontSize: 42, fontWeight: 700, lineHeight: 1 }}>
                {match.home_score} <span style={{ color: c.dim }}>—</span> {match.away_score}
              </div>
              {community && (
                <div style={{ color: c.muted2, fontSize: 11, marginTop: 6 }}>{t.matchResults.predictionsCount(community.total_predictions)}</div>
              )}
            </div>
            <Link href={`/teams/${encodeURIComponent(match.away.name)}`} className="pressable" style={teamColumn}>
              <FlagDisc team={match.away} size={46} ring={1.5} />
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
          <Notice style={{ marginTop: 14 }}>{t.matchResults.communityUnavailable}</Notice>
        ) : (
          <>
            {/* points predictions */}
            <div style={{ marginTop: 14, borderRadius: 18, padding: 16, background: c.surface, border: `1px solid ${c.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 600 }}>📊 {t.matchResults.pointsPredictions}</div>
                <span style={{ color: c.lime, fontFamily: font.display, fontWeight: 700, fontSize: 14 }}>
                  {t.matchResults.inCount(community.total_predictions)}
                </span>
              </div>
              <BetList rows={pointsRows} />
            </div>

            {/* all predictions */}
            <div style={{ margin: "20px 2px 10px", fontFamily: font.display, fontSize: 14, fontWeight: 600 }}>
              {t.matchResults.allPredictions}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {community.picks.map((p) => {
                const v = classifyPick(p.prediction, match, p.points_earned, t.verdict);
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
                        {you ? t.common.you : p.user.name}
                      </div>
                      <div style={{ color: c.muted2, fontSize: 11, marginTop: 1 }}>{v.tag}</div>
                    </div>
                    <div className="tabnum" style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15, color: c.text2 }}>
                      {p.prediction.label}
                    </div>
                    <div
                      style={{
                        width: 34,
                        textAlign: "end",
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
