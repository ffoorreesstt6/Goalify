"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X, Trash2, Loader2, Check, Lock } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency, percent, estimateCompletionDate, formatDate } from "@/lib/utils";
import { createGoalAction, contributeAction, deleteGoalAction } from "@/app/(app)/goals/actions";
import type { Goal } from "@/lib/types";
import type { PlanId } from "@/lib/plans";
import { PLANS } from "@/lib/plans";

const EMOJIS = ["🎯", "📱", "💻", "🚗", "✈️", "🏠", "🛡️", "🎓", "💍", "🎮", "🏝️", "💰"];

export function GoalsManager({ goals, plan }: { goals: Goal[]; plan: PlanId }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const activeCount = goals.filter((g) => !g.completed).length;
  const limit = PLANS[plan].goalLimit;
  const atLimit = limit !== -1 && activeCount >= limit;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Goals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {limit === -1
              ? "Unlimited goals on your plan."
              : `${activeCount} / ${limit} goals used on the Free plan.`}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={atLimit}
          className="btn-primary !py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> New goal
        </button>
      </div>

      {atLimit && (
        <GlassCard className="flex items-center justify-between gap-4 border border-accent-purple/30">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-brand-500" />
            <p className="text-sm text-muted-foreground">
              You&apos;ve hit the Free plan limit of {limit} goals. Upgrade for unlimited goals.
            </p>
          </div>
          <Link href="/billing" className="btn-primary !py-2 text-sm shrink-0">
            Upgrade
          </Link>
        </GlassCard>
      )}

      {goals.length === 0 ? (
        <GlassCard className="py-16 text-center">
          <div className="mx-auto mb-4 text-5xl">🎯</div>
          <h3 className="text-lg font-semibold">No goals yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first goal — a new phone, a trip, an emergency fund.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mt-5 text-sm">
            <Plus className="h-4 w-4" /> Create a goal
          </button>
        </GlassCard>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onChange={() => router.refresh()} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateGoalModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function GoalCard({ goal, onChange }: { goal: Goal; onChange: () => void }) {
  const [amount, setAmount] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const p = percent(goal.saved_amount, goal.target_amount);
  const eta = estimateCompletionDate(goal.saved_amount, goal.target_amount, goal.monthly_contribution);

  function contribute(delta: number) {
    setError(null);
    startTransition(async () => {
      const res = await contributeAction(goal.id, delta);
      if (res?.error) setError(res.error);
      else {
        setAmount("");
        onChange();
      }
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteGoalAction(goal.id);
      onChange();
    });
  }

  return (
    <GlassCard hover className="relative">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{goal.emoji ?? "🎯"}</span>
          <div>
            <h3 className="font-semibold">{goal.name}</h3>
            {goal.completed ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                <Check className="h-3 w-3" /> Completed
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {eta ? `Est. ${formatDate(eta)}` : "Add a monthly contribution for an ETA"}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={remove}
          disabled={pending}
          className="text-muted-foreground transition-colors hover:text-red-500"
          aria-label="Delete goal"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium">{formatCurrency(goal.saved_amount)}</span>
          <span className="text-muted-foreground">of {formatCurrency(goal.target_amount)}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all"
            style={{ width: `${p}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs text-muted-foreground">{p}%</p>
      </div>

      {!goal.completed && (
        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-accent-purple/60"
          />
          <button
            onClick={() => contribute(Number(amount || 0))}
            disabled={pending || !amount}
            className="btn-primary shrink-0 !px-4 !py-2 text-sm disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </GlassCard>
  );
}

function CreateGoalModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [emoji, setEmoji] = useState("🎯");
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [monthly, setMonthly] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createGoalAction({
        name,
        emoji,
        target_amount: Number(target || 0),
        monthly_contribution: Number(monthly || 0),
        target_date: date || null,
      });
      if (res?.error) setError(res.error);
      else onCreated();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
        <GlassCard strong>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">New goal</h2>
            <button onClick={onClose} aria-label="Close">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <span className="mb-1.5 block text-sm font-medium">Icon</span>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all ${
                      emoji === e ? "bg-brand-500/20 ring-1 ring-accent-purple/60" : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Goal name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. New MacBook"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-accent-purple/60"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Target (€)</span>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="1200"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-accent-purple/60"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Monthly (€)</span>
                <input
                  type="number"
                  value={monthly}
                  onChange={(e) => setMonthly(e.target.value)}
                  placeholder="150"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-accent-purple/60"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Target date (optional)</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-accent-purple/60"
              />
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button onClick={submit} disabled={pending} className="btn-primary w-full">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create goal"}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
