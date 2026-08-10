import { apiGet, requireSession } from "@/lib/api";
import type { TeamListItem, Wrapped } from "@/lib/types";
import TeamsClient from "@/components/TeamsClient";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata() {
  const t = await getT();
  return { title: `${t.teams.title} · ${t.common.appName}` };
}

export default async function TeamsPage() {
  await requireSession();
  const { data: teams } = await apiGet<Wrapped<TeamListItem[]>>("/teams");
  return <TeamsClient teams={teams} />;
}
