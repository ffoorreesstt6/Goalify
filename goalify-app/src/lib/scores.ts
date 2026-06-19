import type { Expense, Goal } from "./types";

export interface FinancialSnapshot {
  income: number;
  spending: number;
  leftover: number;
  savingsRate: number; // 0-100
  activeGoals: number;
  completedGoals: number;
  goalProgressAvg: number; // 0-100
}

export function buildSnapshot(
  monthlyIncome: number,
  expenses: Expense[],
  goals: Goal[]
): FinancialSnapshot {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthExpenses = expenses.filter(
    (e) => e.category !== "income" && e.category !== "savings" && new Date(e.spent_at) >= monthStart
  );
  const incomeFromExpenses = expenses
    .filter((e) => e.category === "income" && new Date(e.spent_at) >= monthStart)
    .reduce((s, e) => s + e.amount, 0);

  const income = monthlyIncome > 0 ? monthlyIncome : incomeFromExpenses;
  const spending = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const leftover = income - spending;
  const savingsRate = income > 0 ? Math.max(0, Math.round((leftover / income) * 100)) : 0;

  const activeGoals = goals.filter((g) => !g.completed).length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const goalProgressAvg =
    goals.length > 0
      ? Math.round(
          goals.reduce(
            (s, g) => s + Math.min(100, (g.saved_amount / Math.max(1, g.target_amount)) * 100),
            0
          ) / goals.length
        )
      : 0;

  return {
    income,
    spending,
    leftover,
    savingsRate,
    activeGoals,
    completedGoals,
    goalProgressAvg,
  };
}

/**
 * Goalify Score (0-100): savings habits, goal completion, spending habits, consistency.
 */
export function goalifyScore(snapshot: FinancialSnapshot, goals: Goal[], streakDays: number): number {
  const savings = Math.min(40, (snapshot.savingsRate / 100) * 40); // up to 40 pts
  const goalCompletion = Math.min(25, snapshot.goalProgressAvg * 0.25); // up to 25 pts
  const spendingHealth = snapshot.income > 0
    ? Math.min(20, Math.max(0, (1 - snapshot.spending / snapshot.income) * 20))
    : 10;
  const consistency = Math.min(15, (streakDays / 30) * 15); // up to 15 pts
  return Math.round(savings + goalCompletion + spendingHealth + consistency);
}

/**
 * Money Health Score (0-100): broad financial health rating.
 */
export function moneyHealthScore(snapshot: FinancialSnapshot): {
  score: number;
  rating: "Excellent" | "Good" | "Fair" | "Needs work";
} {
  let score = 50;
  score += Math.min(30, snapshot.savingsRate * 0.6);
  if (snapshot.leftover > 0) score += 10;
  else score -= 15;
  if (snapshot.activeGoals > 0) score += 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const rating =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs work";
  return { score, rating };
}

export function levelFromXp(xp: number): { level: number; xpInLevel: number; xpForNext: number } {
  // 100 XP per level, scaling slightly
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  return { level, xpInLevel, xpForNext: 100 };
}
