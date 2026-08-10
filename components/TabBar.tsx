"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { c, font } from "@/lib/theme";
import { HomeIcon, PredictIcon, RanksIcon, ProfileIcon } from "@/components/icons";
import { useI18n } from "@/lib/i18n/LanguageProvider";

/** Full-screen routes: pushed detail views and the auth screens. */
const HIDE_ON = ["/match", "/users", "/teams", "/login", "/session"];

export default function TabBar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const TABS = [
    { href: "/", label: t.tabbar.home, Icon: HomeIcon },
    { href: "/predict", label: t.tabbar.predict, Icon: PredictIcon },
    { href: "/ranks", label: t.tabbar.ranks, Icon: RanksIcon },
    { href: "/profile", label: t.tabbar.profile, Icon: ProfileIcon },
  ] as const;

  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "flex-start",
        paddingTop: 11,
        paddingLeft: 8,
        paddingRight: 8,
        // clear the iOS home indicator without eating space elsewhere
        paddingBottom: "calc(18px + env(safe-area-inset-bottom, 8px))",
        borderTop: `1px solid ${c.border}`,
        background: c.bgFrame,
        flexShrink: 0,
      }}
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              color: active ? c.lime : c.muted2,
              minWidth: 56,
            }}
          >
            <Icon />
            <span style={{ fontSize: 10, fontWeight: 600, fontFamily: font.body }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
