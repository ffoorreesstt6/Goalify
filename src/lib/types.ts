import type { PlanId } from "./plans";
import type { PersonalityId } from "./quiz";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  plan: PlanId;
  personality: PersonalityId | null;
  is_student: boolean;
  student_verified: boolean;
  onboarded: boolean;
  quiz_answers: Record<string, string> | null;
  monthly_income: number;
  currency: string;
  xp: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export type ExpenseCategory =
  | "food"
  | "dining"
  | "groceries"
  | "transport"
  | "housing"
  | "utilities"
  | "shopping"
  | "entertainment"
  | "subscriptions"
  | "health"
  | "education"
  | "savings"
  | "income"
  | "other";

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  merchant: string | null;
  is_recurring: boolean;
  spent_at: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  emoji: string | null;
  target_amount: number;
  saved_amount: number;
  monthly_contribution: number;
  target_date: string | null;
  completed: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  cycle: "monthly" | "yearly";
  category: string;
  next_charge: string | null;
  active: boolean;
}

export interface Challenge {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_xp: number;
  status: "active" | "completed" | "failed";
  starts_at: string;
  ends_at: string | null;
}

export const CATEGORY_META: Record<ExpenseCategory, { label: string; color: string; emoji: string }> = {
  food: { label: "Food", color: "#f97316", emoji: "🍔" },
  dining: { label: "Dining out", color: "#fb923c", emoji: "🍽️" },
  groceries: { label: "Groceries", color: "#22c55e", emoji: "🛒" },
  transport: { label: "Transport", color: "#3b82f6", emoji: "🚗" },
  housing: { label: "Housing", color: "#8b5cf6", emoji: "🏠" },
  utilities: { label: "Utilities", color: "#06b6d4", emoji: "💡" },
  shopping: { label: "Shopping", color: "#ec4899", emoji: "🛍️" },
  entertainment: { label: "Entertainment", color: "#a855f7", emoji: "🎬" },
  subscriptions: { label: "Subscriptions", color: "#6366f1", emoji: "🔁" },
  health: { label: "Health", color: "#14b8a6", emoji: "💊" },
  education: { label: "Education", color: "#eab308", emoji: "📚" },
  savings: { label: "Savings", color: "#10b981", emoji: "💰" },
  income: { label: "Income", color: "#4ade80", emoji: "💵" },
  other: { label: "Other", color: "#94a3b8", emoji: "📦" },
};
