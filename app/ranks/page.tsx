import { apiGet, requireSession } from "@/lib/api";
import type { DollarRes, LeaderboardRes, RankTrendRes, StatsRes } from "@/lib/types";
import RanksClient from "@/components/RanksClient";

export default async function RanksPage() {
  const session = await requireSession();

  const [leaderboard, dollar, trend, stats] = await Promise.all([
    apiGet<LeaderboardRes>("/leaderboard"),
    apiGet<DollarRes>("/leaderboard/dollar"),
    apiGet<RankTrendRes>("/leaderboard/rank-trend"),
    apiGet<StatsRes>("/leaderboard/stats"),
  ]);

  return (
    <RanksClient
      leaders={leaderboard.data}
      totalPlayers={leaderboard.meta.total_players}
      dollarRows={dollar.data}
      dollarMe={dollar.meta.me}
      yourBalance={dollar.meta.your_balance}
      trend={trend.data}
      meName={trend.meta.me_name}
      daily={stats.data.daily_points}
      meId={session.user?.id ?? null}
    />
  );
}
