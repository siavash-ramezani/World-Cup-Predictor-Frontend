import Link from "next/link";
import { apiGet, requireSession } from "@/lib/api";
import type { Dashboard, Wrapped } from "@/lib/types";
import { c, font } from "@/lib/theme";
import { classifyPickLong, formatPoints, greeting, parseApiTime, teamCode } from "@/lib/format";
import Avatar from "@/components/Avatar";
import FlagDisc from "@/components/FlagDisc";
import Countdown from "@/components/Countdown";
import { EmptyState, Notice, Pill } from "@/components/ui";

export default async function HomePage() {
  await requireSession();
  const { data } = await apiGet<Wrapped<Dashboard>>("/dashboard");
  const { user, next_match: next, recent_results: recents } = data;

  return (
    <div className="screen">
      <div className="scroll" style={{ padding: "56px 16px 20px" }}>
        {/* greeting */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: c.muted, fontSize: 13, fontWeight: 500 }}>{greeting()}</div>
            <div
              style={{
                fontFamily: font.display,
                fontSize: 24,
                fontWeight: 700,
                marginTop: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.name}
            </div>
          </div>
          <Avatar name={user.name} src={user.avatar_url} size={46} fontSize={15} />
        </div>

        {/* hero stat */}
        <div
          style={{
            borderRadius: 22,
            padding: 20,
            background: c.heroGrad,
            border: `1px solid ${c.limeBorder}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -30,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "radial-gradient(circle,rgba(181,255,61,0.22),transparent 70%)",
            }}
          />
          <div style={{ color: c.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1.2 }}>TOTAL POINTS</div>
          <div
            className="tabnum"
            style={{ fontFamily: font.display, fontSize: 50, fontWeight: 700, lineHeight: 1, margin: "6px 0 14px" }}
          >
            {user.total_points}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Pill>{user.rank ? `Rank #${user.rank} of ${user.total_players}` : `${user.total_players} players`}</Pill>
            {user.points_this_week > 0 ? (
              <Pill bg={c.limeTint} color={c.lime} style={{ fontWeight: 700, fontFamily: font.display }}>
                ▲ +{user.points_this_week} this wk
              </Pill>
            ) : (
              <Pill style={{ color: c.muted }}>No points this week</Pill>
            )}
          </div>
        </div>

        {/* next to predict */}
        {next ? (
          <div
            style={{
              marginTop: 14,
              borderRadius: 18,
              padding: 16,
              background: c.surface,
              border: `1px solid ${c.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.red, boxShadow: `0 0 8px ${c.red}` }} />
              <span style={{ color: c.red, fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
                LOCKS IN <Countdown deadlineMs={parseApiTime(next.prediction_deadline)} lockedText="Locked" uppercase />
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FlagDisc team={next.home} size={34} />
                  <div style={{ marginLeft: -10 }}>
                    <FlagDisc team={next.away} size={34} />
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {next.home.name} v {next.away.name}
                  </div>
                  <div style={{ color: c.muted, fontSize: 12 }}>
                    {next.round_label} · {next.match_time_label}
                  </div>
                </div>
              </div>
              <Link
                href={`/match/${next.id}`}
                className="pressable"
                style={{
                  background: c.lime,
                  color: c.limeInk,
                  borderRadius: 11,
                  padding: "10px 14px",
                  fontFamily: font.display,
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {next.my_prediction ? "Edit" : "Predict"}
              </Link>
            </div>
          </div>
        ) : (
          <Notice style={{ marginTop: 14 }}>No upcoming fixtures right now — check back soon.</Notice>
        )}

        {/* recent results */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "22px 2px 10px" }}>
          <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 600 }}>Recent results</div>
          <Link href="/matches" style={{ color: c.lime, fontSize: 12, fontWeight: 700 }}>
            See all →
          </Link>
        </div>

        {recents.length === 0 ? (
          <EmptyState>
            No settled predictions yet.
            <br />
            Make a pick and your results will show up here.
          </EmptyState>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recents.map((r, i) => {
              const v = classifyPickLong(r.prediction, r.match, r.points_earned);
              return (
                <Link
                  key={`${r.match.id}-${i}`}
                  href={`/match/${r.match.id}/results`}
                  className="pressable"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: c.surface,
                    border: `1px solid ${c.border2}`,
                    borderRadius: 14,
                    padding: "12px 14px",
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: font.display, fontWeight: 600, fontSize: 14 }}>
                      {teamCode(r.match.home)} {r.match.result_label ?? "–"} {teamCode(r.match.away)}
                    </div>
                    <div style={{ color: c.muted, fontSize: 12, marginTop: 3 }}>
                      Picked {r.prediction.label} · {v.tag}
                    </div>
                  </div>
                  <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 16, color: v.color, flexShrink: 0 }}>
                    {formatPoints(r.points_earned)}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
