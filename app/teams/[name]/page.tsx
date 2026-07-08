import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, apiGet, requireSession } from "@/lib/api";
import type { TeamDetail, TeamMatch, Wrapped } from "@/lib/types";
import { c, font } from "@/lib/theme";
import { teamCode } from "@/lib/format";
import Avatar from "@/components/Avatar";
import FlagDisc from "@/components/FlagDisc";
import BackButton from "@/components/BackButton";
import { EmptyState, Pill } from "@/components/ui";

type Outcome = "W" | "D" | "L" | null;

function outcomeFor(teamName: string, m: TeamMatch): Outcome {
  if (!m.is_finished || m.home_score == null || m.away_score == null) return null;
  const isHome = m.home.name === teamName;
  const us = isHome ? m.home_score : m.away_score;
  const them = isHome ? m.away_score : m.home_score;
  return us > them ? "W" : us < them ? "L" : "D";
}

const OUTCOME_COLOR: Record<"W" | "D" | "L", string> = { W: c.lime, D: c.muted2, L: c.red };

export default async function TeamPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  await requireSession();

  let team: TeamDetail;
  try {
    team = (await apiGet<Wrapped<TeamDetail>>(`/teams/${encodeURIComponent(name)}`)).data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const s = team.stats;
  const tiles = [
    { v: String(s.played), label: "played", color: c.text },
    { v: String(s.goals_for), label: "goals for", color: c.lime },
    { v: String(s.goals_against), label: "goals against", color: c.red },
  ];

  const record = [
    { key: "Wins", n: s.wins, color: c.lime },
    { key: "Draws", n: s.draws, color: c.muted2 },
    { key: "Losses", n: s.losses, color: c.red },
  ];
  const recordTotal = s.played || 1;

  return (
    <div className="screen">
      <div className="scroll" style={{ padding: "54px 16px 24px" }}>
        {/* top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <BackButton fallback="/teams" />
          <div style={{ color: c.muted, fontSize: 13, fontWeight: 600 }}>Team</div>
          <div style={{ width: 38 }} />
        </div>

        {/* identity */}
        <div
          style={{
            borderRadius: 20,
            padding: 18,
            background: c.heroGrad,
            border: `1px solid ${c.limeBorder}`,
            display: "flex",
            alignItems: "center",
            gap: 15,
          }}
        >
          <FlagDisc team={team} size={64} ring={1.5} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: font.display,
                fontSize: 21,
                fontWeight: 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {team.name}
            </div>
            <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
              <Pill bg={c.limeTint} color={c.lime} style={{ fontFamily: font.display, fontWeight: 700 }}>
                {s.wins}W · {s.draws}D · {s.losses}L
              </Pill>
              <Pill
                style={{
                  fontFamily: font.display,
                  fontWeight: 700,
                  color: s.goal_diff > 0 ? c.lime : s.goal_diff < 0 ? c.red : c.text2,
                }}
              >
                GD {s.goal_diff > 0 ? `+${s.goal_diff}` : s.goal_diff}
              </Pill>
            </div>
          </div>
        </div>

        {/* stat tiles */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {tiles.map((t) => (
            <div key={t.label} style={{ flex: 1, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, padding: 13, minWidth: 0 }}>
              <div className="tabnum" style={{ fontFamily: font.display, fontWeight: 700, fontSize: 19, color: t.color }}>
                {t.v}
              </div>
              <div style={{ color: c.muted, fontSize: 11, marginTop: 3 }}>{t.label}</div>
            </div>
          ))}
        </div>

        {/* record */}
        {s.played > 0 && (
          <>
            <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 600, margin: "22px 2px 10px" }}>Record</div>
            <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 16 }}>
              <div style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", gap: 2, marginBottom: 14 }}>
                {record.map((r) => (
                  <div key={r.key} style={{ width: `${(r.n / recordTotal) * 100}%`, background: r.color }} />
                ))}
              </div>
              {record.map((r) => (
                <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 12.5, color: c.text2 }}>{r.key}</div>
                  <div className="tabnum" style={{ fontFamily: font.display, fontSize: 12.5, fontWeight: 700, color: c.muted }}>
                    {r.n} · {Math.round((r.n / recordTotal) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* fixtures */}
        <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 600, margin: "22px 2px 10px" }}>
          Matches <span style={{ color: c.muted2, fontWeight: 500 }}>({team.matches.length})</span>
        </div>
        {team.matches.length === 0 ? (
          <EmptyState>No fixtures for this team.</EmptyState>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {team.matches.map((m) => {
              const isHome = m.home.name === team.name;
              const opp = isHome ? m.away : m.home;
              const out = outcomeFor(team.name, m);
              const us = isHome ? m.home_score : m.away_score;
              const them = isHome ? m.away_score : m.home_score;
              return (
                <Link
                  key={m.id}
                  href={m.is_finished ? `/match/${m.id}/results` : `/match/${m.id}`}
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
                  <FlagDisc team={opp} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {isHome ? "vs" : "at"} {opp.name}
                    </div>
                    <div style={{ color: c.muted2, fontSize: 11, marginTop: 2 }}>
                      {m.round_label} · {m.match_time_label}
                    </div>
                  </div>
                  {out ? (
                    <>
                      <div className="tabnum" style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15, color: c.text2 }}>
                        {us} – {them}
                      </div>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 7,
                          background: `color-mix(in srgb, ${OUTCOME_COLOR[out]} 18%, transparent)`,
                          color: OUTCOME_COLOR[out],
                          fontFamily: font.display,
                          fontWeight: 700,
                          fontSize: 11,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {out}
                      </div>
                    </>
                  ) : (
                    <div style={{ color: c.cyan, fontSize: 11, fontWeight: 700, fontFamily: font.display }}>UPCOMING</div>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* top predictors */}
        <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 600, margin: "22px 2px 4px" }}>Top predictors</div>
        <div style={{ color: c.muted2, fontSize: 11.5, margin: "0 2px 10px" }}>Players with the most points from {team.name} matches</div>
        {team.top_predictors.length === 0 ? (
          <EmptyState>Nobody has scored points on this team yet.</EmptyState>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {team.top_predictors.map((p, i) => (
              <Link
                key={p.id}
                href={`/users/${p.id}`}
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
                <div
                  className="tabnum"
                  style={{ width: 18, textAlign: "center", fontFamily: font.display, fontWeight: 700, fontSize: 13, color: c.muted2 }}
                >
                  {i + 1}
                </div>
                <Avatar name={p.name} src={p.avatar_url} size={34} fontSize={12} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}
                  </div>
                  <div style={{ color: c.muted2, fontSize: 11, marginTop: 1 }}>
                    {p.pred_count} predictions · {Number(p.exact_count)} exact
                  </div>
                </div>
                <div className="tabnum" style={{ fontFamily: font.display, fontWeight: 700, fontSize: 16, color: c.lime, flexShrink: 0 }}>
                  {Number(p.total_points)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
