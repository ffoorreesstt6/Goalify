import { Repeat, AlertCircle } from "lucide-react";
import { getExpenses, getSubscriptions } from "@/lib/data";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/app/StatCard";
import { formatCurrency } from "@/lib/utils";
import type { Expense } from "@/lib/types";

export const metadata = { title: "Subscriptions — Goalify" };

const KNOWN = [
  "netflix", "spotify", "chatgpt", "openai", "apple music", "apple", "disney", "amazon prime",
  "youtube", "hbo", "icloud", "google", "dropbox", "notion", "adobe", "canva", "gym",
];

interface Detected {
  name: string;
  amount: number;
  source: "logged" | "detected";
}

function detectFromExpenses(expenses: Expense[]): Detected[] {
  const recurring = expenses.filter(
    (e) => e.category === "subscriptions" || e.is_recurring
  );
  const map = new Map<string, number>();
  for (const e of recurring) {
    const name = (e.merchant || e.description || "Subscription").trim();
    const known = KNOWN.find((k) => name.toLowerCase().includes(k));
    const key = known ? known.charAt(0).toUpperCase() + known.slice(1) : name;
    // keep most recent amount per merchant
    if (!map.has(key)) map.set(key, e.amount);
  }
  return Array.from(map.entries()).map(([name, amount]) => ({ name, amount, source: "detected" as const }));
}

export default async function SubscriptionsPage() {
  const [subs, expenses] = await Promise.all([getSubscriptions(), getExpenses()]);

  const fromTable: Detected[] = subs.map((s) => ({
    name: s.name,
    amount: s.cycle === "yearly" ? s.amount / 12 : s.amount,
    source: "logged",
  }));
  const detected = detectFromExpenses(expenses);

  // Merge, preferring logged
  const byName = new Map<string, Detected>();
  for (const d of [...fromTable, ...detected]) {
    if (!byName.has(d.name.toLowerCase())) byName.set(d.name.toLowerCase(), d);
  }
  const all = Array.from(byName.values()).sort((a, b) => b.amount - a.amount);

  const monthlyTotal = all.reduce((s, d) => s + d.amount, 0);
  const yearlyTotal = monthlyTotal * 12;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Subscriptions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We automatically detect recurring subscriptions from your spending.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Repeat} label="Active subscriptions" value={String(all.length)} accent="text-accent-blue" />
        <StatCard icon={Repeat} label="Monthly cost" value={formatCurrency(monthlyTotal)} accent="text-orange-400" />
        <StatCard icon={Repeat} label="Yearly cost" value={formatCurrency(yearlyTotal)} accent="text-accent-purple" />
      </div>

      <GlassCard>
        <h3 className="font-semibold">Detected subscriptions</h3>
        {all.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
            <AlertCircle className="h-6 w-6" />
            <p>
              No subscriptions detected yet. Mark expenses as recurring or use the
              &ldquo;Subscriptions&rdquo; category when adding expenses.
            </p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-white/5">
            {all.map((d) => (
              <div key={d.name} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-lg">
                    🔁
                  </span>
                  <div>
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.source === "detected" ? "Auto-detected" : "Tracked"} · {formatCurrency(d.amount * 12)}/yr
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(d.amount)}/mo</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
