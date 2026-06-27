import Link from "next/link";
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  Target as TargetIcon,
  Percent,
  Flame,
} from "lucide-react";
import { getProfile, getGoals, getExpenses } from "@/lib/data";
import { buildSnapshot, goalifyScore, moneyHealthScore } from "@/lib/scores";
import { categoryBreakdown } from "@/lib/analytics";
import { formatCurrency, percent } from "@/lib/utils";
import { PERSONALITIES } from "@/lib/quiz";
import { StatCard } from "@/components/app/StatCard";
import { ScoreRing } from "@/components/app/ScoreRing";
import { SpendingChart } from "@/components/app/SpendingChart";
import { CategoryDonut } from "@/components/app/CategoryDonut";
import { GlassCard } from "@/components/ui/GlassCard";
import { AIInsights } from "@/components/app/AIInsights";

export const metadata = { title: "Dashboard — Goalify" };

function computeStreak(dates: string[]): number {
  const days = new Set(dates.map((d) => d.slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      // allow today to be empty, check yesterday
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default async function DashboardPage() {
  const [profile, goals, expenses] = await Promise.all([
    getProfile(),
    getGoals(),
    getExpenses(),
  ]);
  const snapshot = buildSnapshot(profile.monthly_income, expenses, goals);
  const streak = computeStreak(expenses.map((e) => e.spent_at));
  const gScore = goalifyScore(snapshot, goals, streak);
  const mHealth = moneyHealthScore(snapshot);
  const categories = categoryBreakdown(expenses);
  const personality = profile.personality ? PERSONALITIES[profile.personality] : null;

  const activeGoals = goals.filter((g) => !g.completed).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Welcome back{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {personality
              ? `You're a ${personality.name} ${personality.emoji} — here's your money at a glance.`
              : "Here's your money at a glance."}
          </p>
        </div>
        <Link href="/goals" className="btn-primary !py-2.5 text-sm">
          + New goal
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Wallet}
          label="Monthly income"
          value={formatCurrency(snapshot.income)}
          accent="text-blue-500"
        />
        <StatCard
          icon={TrendingDown}
          label="Monthly spending"
          value={formatCurrency(snapshot.spending)}
          accent="text-orange-500"
        />
        <StatCard
          icon={PiggyBank}
          label="Leftover"
          value={formatCurrency(snapshot.leftover)}
          accent="text-emerald-500"
          hint={snapshot.leftover >= 0 ? "On track" : "Over budget"}
        />
        <StatCard
          icon={Percent}
          label="Savings rate"
          value={`${snapshot.savingsRate}%`}
          accent="text-brand-500"
        />
        <StatCard
          icon={TargetIcon}
          label="Active goals"
          value={String(snapshot.activeGoals)}
          accent="text-brand-600"
          hint={`${snapshot.goalProgressAvg}% avg progress`}
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value={`${streak} days`}
          accent="text-orange-500"
          hint="Keep logging to grow it"
        />
      </div>

      {/* Scores + AI */}
      <div className="grid gap-5 lg:grid-cols-3">
        <GlassCard className="flex flex-col items-center justify-center">
          <ScoreRing score={gScore} label="Goalify Score" sublabel="/ 100" />
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center">
          <ScoreRing score={mHealth.score} label="Money Health" sublabel={mHealth.rating} />
        </GlassCard>
        <AIInsights snapshot={snapshot} personality={profile.personality} plan={profile.plan} />
      </div>

      {/* Charts */}
      <SpendingChart expenses={expenses} />

      <div className="grid gap-5 lg:grid-cols-2">
        <CategoryDonut data={categories} />

        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Goal progress</h3>
            <Link href="/goals" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          {activeGoals.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No active goals yet.{" "}
              <Link href="/goals" className="font-medium text-brand-600 hover:underline">
                Create your first goal
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-5">
              {activeGoals.map((g) => {
                const p = percent(g.saved_amount, g.target_amount);
                return (
                  <div key={g.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">
                        {g.emoji ?? "🎯"} {g.name}
                      </span>
                      <span className="text-gray-500">
                        {formatCurrency(g.saved_amount)} / {formatCurrency(g.target_amount)}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                        style={{ width: `${p}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
