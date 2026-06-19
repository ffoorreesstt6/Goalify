"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUserOrRedirect } from "@/lib/data";
import { canCreateGoal, type PlanId } from "@/lib/plans";

const goalSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  emoji: z.string().max(8).optional(),
  target_amount: z.number().positive("Target must be greater than 0"),
  monthly_contribution: z.number().min(0).optional(),
  target_date: z.string().optional().nullable(),
});

export async function createGoalAction(input: {
  name: string;
  emoji?: string;
  target_amount: number;
  monthly_contribution?: number;
  target_date?: string | null;
}) {
  const { user, supabase } = await getUserOrRedirect();

  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Enforce plan goal limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  const plan = (profile?.plan ?? "free") as PlanId;

  const { count } = await supabase
    .from("goals")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("completed", false);

  if (!canCreateGoal(plan, count ?? 0)) {
    return {
      error: "You've reached the goal limit for the Free plan. Upgrade to Pro for unlimited goals.",
      limitReached: true,
    };
  }

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    name: parsed.data.name,
    emoji: parsed.data.emoji || "🎯",
    target_amount: parsed.data.target_amount,
    monthly_contribution: parsed.data.monthly_contribution ?? 0,
    target_date: parsed.data.target_date || null,
    saved_amount: 0,
  });

  if (error) return { error: error.message };
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function contributeAction(goalId: string, amount: number) {
  const { user, supabase } = await getUserOrRedirect();
  if (amount === 0) return { error: "Enter an amount" };

  const { data: goal } = await supabase
    .from("goals")
    .select("saved_amount, target_amount")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single();
  if (!goal) return { error: "Goal not found" };

  const newSaved = Math.max(0, goal.saved_amount + amount);
  const completed = newSaved >= goal.target_amount;

  const { error } = await supabase
    .from("goals")
    .update({ saved_amount: newSaved, completed })
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  if (completed) {
    // Award XP for completing a goal
    await supabase.rpc("award_xp", { p_user: user.id, p_amount: 100 }).then(() => {}, () => {});
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true, completed };
}

export async function deleteGoalAction(goalId: string) {
  const { user, supabase } = await getUserOrRedirect();
  const { error } = await supabase.from("goals").delete().eq("id", goalId).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true };
}
