"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CATEGORY_META, type Expense, type ExpenseCategory } from "@/lib/types";
import { addExpenseAction, deleteExpenseAction } from "@/app/(app)/analytics/actions";

const CATEGORIES = Object.keys(CATEGORY_META) as ExpenseCategory[];

export function ExpenseManager({ expenses }: { expenses: Expense[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  function add() {
    setError(null);
    startTransition(async () => {
      const res = await addExpenseAction({
        amount: Number(amount || 0),
        category,
        merchant,
        spent_at: date,
      });
      if (res?.error) setError(res.error);
      else {
        setAmount("");
        setMerchant("");
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteExpenseAction(id);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <GlassCard className="lg:col-span-1 h-fit">
        <h3 className="font-semibold">Add expense</h3>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm text-muted-foreground">Amount (€)</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="12.50"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-accent-purple/60"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted-foreground">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-accent-purple/60"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-card">
                  {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted-foreground">Merchant (optional)</span>
            <input
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Tesco"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-accent-purple/60"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted-foreground">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-accent-purple/60"
            />
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={add} disabled={pending || !amount} className="btn-primary w-full disabled:opacity-50">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add expense
          </button>
        </div>
      </GlassCard>

      <GlassCard className="lg:col-span-2">
        <h3 className="font-semibold">Recent transactions</h3>
        {expenses.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No transactions yet. Add your first expense to start tracking.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-white/5">
            {expenses.slice(0, 30).map((e) => {
              const meta = CATEGORY_META[e.category];
              const isIncome = e.category === "income";
              return (
                <div key={e.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-lg">
                    {meta.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {e.merchant || meta.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {meta.label} · {formatDate(e.spent_at)}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${isIncome ? "text-emerald-500" : ""}`}>
                    {isIncome ? "+" : "-"}
                    {formatCurrency(e.amount)}
                  </span>
                  <button
                    onClick={() => remove(e.id)}
                    className="text-muted-foreground hover:text-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
