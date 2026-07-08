import { notFound } from "next/navigation";
import Link from "next/link";
import { ApiError, apiGet, requireSession } from "@/lib/api";
import type { PublicProfile, Wrapped } from "@/lib/types";
import { c, font } from "@/lib/theme";
import { classifyPick, formatPoints, teamCode } from "@/lib/format";
import Avatar from "@/components/Avatar";
import BackButton from "@/components/BackButton";
import { EmptyState, Pill } from "@/components/ui";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();

  let profile: PublicProfile;
  try {
    profile = (await apiGet<Wrapped<PublicProfile>>(`/users/${id}`)).data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const { user, total_points, total_predictions, correct_count, exact_count, distribution, daily_points } = profile;
  const isMe = user.id === session.user?.id;

  const accuracy = total_predictions ? Math.round((correct_count / total_predictions) * 100) : 0;
  const exactRate = total_predictions ? Math.round((exact_count / total_predictions) * 100) : 0;

  const tiles = [
    { v: total_points.toLocaleString("en-US"), label: "total points", color: c.lime },
    { v: String(total_predictions), label: "predictions", color: c.text },
    { v: `${accuracy}%`, label: "accuracy", color: c.cyan },
  ];

  const breakdown = [
    { key: "Exact", n: distribution.exact, color: c.lime },
    { key: "Result", n: distribution.result, color: c.cyan },
    { key: "Diff", n: distribution.diff, color: c.gold },
    { key: "Missed", n: distribution.none, color: c.dim },
  ];
  const bdTotal = breakdown.reduce((a, b) => a + b.n, 0) || 1;

  // Most recent first; the API returns them oldest-first.
  const recent = [...profile.predictions].reverse().slice(0, 12);

  const pts = daily_points.points;
  const barMax = Math.max(...pts, 1);
  const barH = 90;
  const labelEvery = Math.max(1, Math.ceil(pts.length / 8));

  return (
    <div className="screen">
      <div className="scroll" style={{ padding: "54px 16px 24px" }}>
        {/* top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <BackButton fallback="/ranks" />
          <div style={{ color: c.muted, fontSize: 13, fontWeight: 600 }}>Player</div>
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
          <Avatar name={user.name} src={user.avatar_url} size={64} fontSize={22} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: font.display,
                fontSize: 20,
                fontWeight: 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name}
            </div>
            <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
              {isMe && (
                <Pill bg={c.limeTint} color={c.lime} style={{ fontFamily: font.display, fontWeight: 700 }}>
                  You
                </Pill>
              )}
              <Pill>{exact_count} exact scores</Pill>
              {exactRate > 0 && <Pill style={{ color: c.muted }}>{exactRate}% exact</Pill>}
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

        {/* breakdown */}
        <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 600, margin: "22px 2px 10px" }}>Prediction breakdown</div>
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 16 }}>
          <div style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", gap: 2, marginBottom: 14 }}>
            {breakdown.map((b) => (
              <div key={b.key} style={{ width: `${(b.n / bdTotal) * 100}%`, background: b.color }} />
            ))}
          </div>
          {breakdown.map((b) => (
            <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 12.5, color: c.text2 }}>{b.key}</div>
              <div className="tabnum" style={{ fontFamily: font.display, fontSize: 12.5, fontWeight: 700, color: c.muted }}>
                {b.n} · {Math.round((b.n / bdTotal) * 100)}%
              </div>
            </div>
          ))}
        </div>

        {/* daily points */}
        {pts.length > 0 && (
          <>
            <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 600, margin: "22px 2px 10px" }}>Points per day</div>
            <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: "16px 12px 10px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: barH }}>
                {pts.map((v, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                    <div
                      title={`${daily_points.dates[i]}: ${v} pts`}
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
                {pts.map((_, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center", color: c.muted2, fontSize: 8, fontFamily: font.display }}>
                    {i % labelEvery === 0 ? Number(daily_points.dates[i]?.slice(8, 10)) : ""}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* recent predictions */}
        <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 600, margin: "22px 2px 10px" }}>Recent predictions</div>
        {recent.length === 0 ? (
          <EmptyState>No predictions yet.</EmptyState>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recent.map((p, i) => {
              const v = classifyPick(p.prediction, p.match, p.points_earned);
              return (
                <Link
                  key={`${p.match.id}-${i}`}
                  href={p.match.is_finished ? `/match/${p.match.id}/results` : `/match/${p.match.id}`}
                  className="pressable"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    background: c.surface,
                    border: `1px solid ${c.border2}`,
                    borderRadius: 13,
                    padding: "10px 13px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: font.display, fontWeight: 600, fontSize: 13.5 }}>
                      {teamCode(p.match.home)} {p.match.result_label ?? "–"} {teamCode(p.match.away)}
                    </div>
                    <div style={{ color: c.muted, fontSize: 11.5, marginTop: 2 }}>
                      Picked {p.prediction.label} · {v.tag}
                    </div>
                  </div>
                  <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15, color: v.color, flexShrink: 0 }}>
                    {formatPoints(p.points_earned)}
                  </div>
                </Link>
              );
            })}
            {profile.predictions.length > recent.length && (
              <div style={{ textAlign: "center", color: c.muted2, fontSize: 12, padding: "6px 0" }}>
                +{profile.predictions.length - recent.length} earlier predictions
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
