"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { TeamListItem } from "@/lib/types";
import { c, font } from "@/lib/theme";
import { teamCode } from "@/lib/format";
import FlagDisc from "@/components/FlagDisc";
import BackButton from "@/components/BackButton";
import { EmptyState, SegTabs } from "@/components/ui";
import { ChevronRight } from "@/components/icons";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function TeamsClient({ teams }: { teams: TeamListItem[] }) {
  const { t } = useI18n();
  const [sort, setSort] = useState(0);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = needle ? teams.filter((t) => t.name.toLowerCase().includes(needle)) : teams;
    const sorted = [...filtered];
    if (sort === 0) sorted.sort((a, b) => a.name.localeCompare(b.name));
    else sorted.sort((a, b) => b.wins - a.wins || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name));
    return sorted;
  }, [teams, sort, q]);

  return (
    <div className="screen">
      <div style={{ padding: "54px 20px 14px", background: c.headerGrad, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10 }}>
          <BackButton fallback="/profile" />
          <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700 }}>{t.teams.title}</div>
          <span style={{ color: c.muted2, fontSize: 12, fontWeight: 600, minWidth: 38, textAlign: "end" }}>{teams.length}</span>
        </div>
        <input
          className="field"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.teams.searchPlaceholder}
          aria-label={t.a11y.searchTeams}
          style={{ marginBottom: 10, padding: "11px 13px", fontSize: 14 }}
        />
        <SegTabs tabs={[t.teams.sortAZ, t.teams.sortBest]} active={sort} onChange={setSort} fontSize={13} />
      </div>

      <div className="scroll" style={{ padding: "14px 16px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.length === 0 ? (
          <EmptyState>{t.teams.noTeamsMatch(q)}</EmptyState>
        ) : (
          rows.map((team) => (
            <Link
              key={team.name}
              href={`/teams/${encodeURIComponent(team.name)}`}
              className="pressable"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: c.surface,
                border: `1px solid ${c.border2}`,
                borderRadius: 14,
                padding: "10px 13px",
              }}
            >
              <FlagDisc team={team} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {team.name}
                </div>
                <div style={{ color: c.muted, fontSize: 11, marginTop: 2 }}>
                  {teamCode(team)} · {t.teams.playedShort(team.played)} · {team.wins}W
                </div>
              </div>
              <div style={{ textAlign: "end", flexShrink: 0 }}>
                <div
                  className="tabnum"
                  style={{
                    fontFamily: font.display,
                    fontWeight: 700,
                    fontSize: 14,
                    color: team.gd > 0 ? c.lime : team.gd < 0 ? c.red : c.muted2,
                  }}
                >
                  {team.gd > 0 ? `+${team.gd}` : team.gd}
                </div>
                <div style={{ color: c.muted2, fontSize: 10, marginTop: 1 }}>
                  {team.gf}:{team.ga}
                </div>
              </div>
              <span className="rtl-flip" style={{ color: c.muted2, flexShrink: 0, display: "flex" }}>
                <ChevronRight size={13} />
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
