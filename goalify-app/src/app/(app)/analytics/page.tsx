import { getExpenses } from "@/lib/data";
import { categoryBreakdown } from "@/lib/analytics";
import { SpendingChart } from "@/components/app/SpendingChart";
import { CategoryDonut } from "@/components/app/CategoryDonut";
import { ExpenseManager } from "@/components/app/ExpenseManager";

export const metadata = { title: "Analytics — Goalify" };

export default async function AnalyticsPage() {
  const expenses = await getExpenses();
  const categories = categoryBreakdown(expenses);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track expenses and explore your spending across every timeframe.
        </p>
      </div>

      <SpendingChart expenses={expenses} />
      <CategoryDonut data={categories} />
      <ExpenseManager expenses={expenses} />
    </div>
  );
}
