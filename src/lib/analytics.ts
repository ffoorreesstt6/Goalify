import type { Expense, ExpenseCategory } from "./types";
import { CATEGORY_META } from "./types";

export type Timeframe = "daily" | "weekly" | "monthly" | "yearly" | "fiveyear";

export interface SeriesPoint {
  label: string;
  spending: number;
}

function isSpend(e: Expense) {
  return e.category !== "income" && e.category !== "savings";
}

export function buildSeries(expenses: Expense[], timeframe: Timeframe): SeriesPoint[] {
  const spend = expenses.filter(isSpend);
  const now = new Date();

  if (timeframe === "daily") {
    // last 14 days
    const days: SeriesPoint[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const total = spend
        .filter((e) => e.spent_at.slice(0, 10) === key)
        .reduce((s, e) => s + e.amount, 0);
      days.push({ label: d.toLocaleDateString("en-IE", { day: "numeric", month: "short" }), spending: round(total) });
    }
    return days;
  }

  if (timeframe === "weekly") {
    const weeks: SeriesPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(now.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      const total = spend
        .filter((e) => {
          const t = new Date(e.spent_at);
          return t >= start && t <= end;
        })
        .reduce((s, e) => s + e.amount, 0);
      weeks.push({ label: `W${12 - i}`, spending: round(total) });
    }
    return weeks;
  }

  if (timeframe === "monthly") {
    const months: SeriesPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const total = spend
        .filter((e) => {
          const t = new Date(e.spent_at);
          return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth();
        })
        .reduce((s, e) => s + e.amount, 0);
      months.push({ label: d.toLocaleDateString("en-IE", { month: "short" }), spending: round(total) });
    }
    return months;
  }

  if (timeframe === "yearly") {
    const years: SeriesPoint[] = [];
    for (let i = 4; i >= 0; i--) {
      const year = now.getFullYear() - i;
      const total = spend
        .filter((e) => new Date(e.spent_at).getFullYear() === year)
        .reduce((s, e) => s + e.amount, 0);
      years.push({ label: String(year), spending: round(total) });
    }
    return years;
  }

  // fiveyear projection: average monthly spend projected forward
  const monthlyAvg = averageMonthlySpend(spend);
  const points: SeriesPoint[] = [];
  for (let i = 0; i <= 5; i++) {
    points.push({
      label: i === 0 ? "Now" : `Y+${i}`,
      spending: round(monthlyAvg * 12 * i),
    });
  }
  return points;
}

export function averageMonthlySpend(expenses: Expense[]): number {
  const spend = expenses.filter(isSpend);
  if (spend.length === 0) return 0;
  const months = new Set(spend.map((e) => e.spent_at.slice(0, 7)));
  const total = spend.reduce((s, e) => s + e.amount, 0);
  return total / Math.max(1, months.size);
}

export interface CategorySlice {
  category: ExpenseCategory;
  label: string;
  color: string;
  value: number;
}

export function categoryBreakdown(expenses: Expense[], monthOnly = true): CategorySlice[] {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const spend = expenses.filter(
    (e) => e.category !== "income" && e.category !== "savings" && (!monthOnly || new Date(e.spent_at) >= monthStart)
  );
  const totals = new Map<ExpenseCategory, number>();
  for (const e of spend) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  }
  return Array.from(totals.entries())
    .map(([category, value]) => ({
      category,
      label: CATEGORY_META[category].label,
      color: CATEGORY_META[category].color,
      value: round(value),
    }))
    .sort((a, b) => b.value - a.value);
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
