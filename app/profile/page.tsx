import Link from "next/link";
import { apiGet, requireSession } from "@/lib/api";
import { logoutAction } from "@/lib/actions";
import type { ApiUser, LeaderboardRes, Wrapped } from "@/lib/types";
import { c, font } from "@/lib/theme";
import Avatar from "@/components/Avatar";
import { Notice, Pill } from "@/components/ui";
import { ChevronRight } from "@/components/icons";
import EditNameForm from "@/components/EditNameForm";
import { getT } from "@/lib/i18n/server";

export default async function ProfilePage() {
  await requireSession();
  const t = await getT();

  const [meRes, lb] = await Promise.all([
    apiGet<Wrapped<ApiUser>>("/me"),
    apiGet<LeaderboardRes>("/leaderboard"),
  ]);

  const me = meRes.data;
  const rank = lb.meta.me?.rank ?? null;
  const preds = lb.meta.me?.count ?? 0;

  const tiles = [
    { v: String(me.total_points ?? 0), label: t.profile.totalPointsLabel, color: c.lime },
    { v: String(preds), label: t.profile.predictionsLabel, color: c.text },
  ];

  const links = [
    ...(me.is_guest ? [] : [{ label: t.profile.linkPublicProfile, href: `/users/${me.id}`, sw: c.purple }]),
    { label: t.profile.linkPastMatches, href: "/matches", sw: c.red },
    { label: t.profile.linkTeams, href: "/teams", sw: c.gold },
    { label: t.profile.linkMakePicks, href: "/predict", sw: c.lime },
    { label: t.profile.linkLeaderboards, href: "/ranks", sw: c.cyan },
  ];

  return (
    <div className="screen">
      <div style={{ padding: "56px 20px 14px", background: c.headerGrad, flexShrink: 0 }}>
        <div style={{ fontFamily: font.display, fontSize: 26, fontWeight: 700 }}>{t.profile.title}</div>
      </div>

      <div className="scroll" style={{ padding: "16px 16px 20px" }}>
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
          <Avatar name={me.name} src={me.avatar_url} size={64} fontSize={22} />
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
              {me.name}
            </div>
            <div style={{ color: c.muted, fontSize: 13, marginTop: 2 }}>
              {me.is_guest ? t.profile.guestReadOnly : (me.mobile ?? t.profile.player)}
            </div>
            <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
              {rank && (
                <Pill bg={c.limeTint} color={c.lime} style={{ fontFamily: font.display, fontWeight: 700 }}>
                  {t.profile.rankHash(rank)}
                </Pill>
              )}
              <Pill>{t.profile.ofPlayers(lb.meta.total_players)}</Pill>
            </div>
            {!me.is_guest && <EditNameForm initialName={me.name} />}
          </div>
        </div>

        {me.is_guest && (
          <Notice tone="lime" style={{ marginTop: 14 }}>
            {t.profile.guestNotice}{" "}
            <Link href="/login" style={{ color: c.lime, fontWeight: 700, textDecoration: "underline" }}>
              {t.common.signIn}
            </Link>
          </Notice>
        )}

        {/* stat tiles */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {tiles.map((tile) => (
            <div key={tile.label} style={{ flex: 1, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, padding: 13, minWidth: 0 }}>
              <div className="tabnum" style={{ fontFamily: font.display, fontWeight: 700, fontSize: 19, color: tile.color }}>
                {tile.v}
              </div>
              <div style={{ color: c.muted, fontSize: 11, marginTop: 3 }}>{tile.label}</div>
            </div>
          ))}
        </div>

        {/* links */}
        <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 600, margin: "22px 2px 10px" }}>{t.profile.shortcuts}</div>
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 18, overflow: "hidden" }}>
          {links.map((r, i) => (
            <Link
              key={r.label}
              href={r.href}
              className="pressable"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "13px 14px",
                borderTop: i === 0 ? "none" : `1px solid ${c.border}`,
              }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, background: r.sw, flexShrink: 0, opacity: 0.9 }} />
              <div style={{ flex: 1, fontSize: 14.5, fontWeight: 500 }}>{r.label}</div>
              <span className="rtl-flip" style={{ color: c.muted2, display: "flex" }}>
                <ChevronRight size={13} />
              </span>
            </Link>
          ))}
        </div>

        {/* sign out */}
        <form action={logoutAction} style={{ marginTop: 14 }}>
          <button
            type="submit"
            className="pressable"
            style={{
              width: "100%",
              height: 50,
              borderRadius: 14,
              background: c.surface,
              border: `1px solid ${c.border3}`,
              color: c.red,
              fontFamily: font.display,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            {me.is_guest ? t.profile.exitGuest : t.profile.signOut}
          </button>
        </form>

        <div style={{ textAlign: "center", color: c.muted2, fontSize: 11, marginTop: 18 }}>{t.profile.footer}</div>
      </div>
    </div>
  );
}
