"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Trophy } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CHALLENGE_TEMPLATES, BADGES } from "@/lib/challenges";
import { startChallengeAction, completeChallengeAction } from "@/app/(app)/challenges/actions";
import { levelFromXp } from "@/lib/scores";
import type { Challenge } from "@/lib/types";

export function ChallengesView({
  active,
  xp,
}: {
  active: Challenge[];
  xp: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { level, xpInLevel, xpForNext } = levelFromXp(xp);
  const activeKeys = new Set(active.map((a) => a.title));

  return (
    <div className="space-y-6">
      {/* XP / Level header */}
      <GlassCard strong>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 font-display text-xl font-bold text-white">
              {level}
            </div>
            <div>
              <p className="font-semibold">Level {level}</p>
              <p className="text-sm text-muted-foreground">{xp} XP total</p>
            </div>
          </div>
          <div className="w-full sm:w-64">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>{xpInLevel} XP</span>
              <span>{xpForNext} XP</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                style={{ width: `${(xpInLevel / xpForNext) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Active challenges */}
      {active.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-xl font-bold">Active challenges</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {active.map((c) => (
              <GlassCard key={c.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                  </div>
                  <span className="rounded-full bg-brand-500/20 px-2.5 py-1 text-xs font-medium text-brand-600">
                    +{c.target_xp} XP
                  </span>
                </div>
                <button
                  onClick={() =>
                    startTransition(async () => {
                      await completeChallengeAction(c.id, c.target_xp);
                      router.refresh();
                    })
                  }
                  disabled={pending}
                  className="btn-primary mt-4 w-full !py-2 text-sm"
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Mark complete
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Available challenges */}
      <div>
        <h2 className="mb-3 font-display text-xl font-bold">Take on a challenge</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHALLENGE_TEMPLATES.map((t) => {
            const joined = activeKeys.has(t.title);
            return (
              <GlassCard key={t.key} hover className="flex flex-col">
                <div className="text-3xl">{t.emoji}</div>
                <h3 className="mt-3 font-semibold">{t.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{t.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-brand-600">+{t.xp} XP</span>
                  <span className="text-xs text-muted-foreground">{t.durationDays} days</span>
                </div>
                <button
                  onClick={() =>
                    startTransition(async () => {
                      await startChallengeAction(t.key);
                      router.refresh();
                    })
                  }
                  disabled={pending || joined}
                  className="mt-3 w-full rounded-lg border border-gray-200 bg-gray-50 py-2 text-sm font-medium transition-colors hover:bg-gray-100 disabled:opacity-50"
                >
                  {joined ? "In progress" : "Start"}
                </button>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold">
          <Trophy className="h-5 w-5 text-amber-400" /> Badges
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {BADGES.map((b) => (
            <GlassCard key={b.key} className="text-center !p-4">
              <div className="text-3xl">{b.emoji}</div>
              <p className="mt-2 text-sm font-medium">{b.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{b.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
