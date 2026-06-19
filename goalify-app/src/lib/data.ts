import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Goal, Expense, Subscription } from "./types";

export async function getUserOrRedirect() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { user, supabase };
}

export async function getProfile(): Promise<Profile> {
  const { user, supabase } = await getUserOrRedirect();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (!data) {
    // Fallback profile if the row hasn't been created yet.
    return {
      id: user.id,
      full_name: (user.user_metadata?.full_name as string) ?? null,
      email: user.email ?? null,
      avatar_url: null,
      plan: "free",
      personality: null,
      is_student: false,
      student_verified: false,
      onboarded: false,
      quiz_answers: null,
      monthly_income: 0,
      currency: "EUR",
      xp: 0,
      level: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  return data as Profile;
}

export async function getGoals(): Promise<Goal[]> {
  const { user, supabase } = await getUserOrRedirect();
  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data as Goal[]) ?? [];
}

export async function getExpenses(limit = 500): Promise<Expense[]> {
  const { user, supabase } = await getUserOrRedirect();
  const { data } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("spent_at", { ascending: false })
    .limit(limit);
  return (data as Expense[]) ?? [];
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const { user, supabase } = await getUserOrRedirect();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("amount", { ascending: false });
  return (data as Subscription[]) ?? [];
}
