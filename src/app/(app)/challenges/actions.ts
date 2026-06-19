"use server";

import { revalidatePath } from "next/cache";
import { getUserOrRedirect } from "@/lib/data";
import { CHALLENGE_TEMPLATES } from "@/lib/challenges";

export async function startChallengeAction(key: string) {
  const { user, supabase } = await getUserOrRedirect();
  const tpl = CHALLENGE_TEMPLATES.find((t) => t.key === key);
  if (!tpl) return { error: "Unknown challenge" };

  const ends = new Date();
  ends.setDate(ends.getDate() + tpl.durationDays);

  const { error } = await supabase.from("challenges").insert({
    user_id: user.id,
    title: tpl.title,
    description: tpl.description,
    target_xp: tpl.xp,
    status: "active",
    ends_at: ends.toISOString(),
  });
  if (error) return { error: error.message };
  revalidatePath("/challenges");
  return { success: true };
}

export async function completeChallengeAction(id: string, xp: number) {
  const { user, supabase } = await getUserOrRedirect();
  const { error } = await supabase
    .from("challenges")
    .update({ status: "completed" })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  await supabase.rpc("award_xp", { p_user: user.id, p_amount: xp }).then(() => {}, () => {});
  revalidatePath("/challenges");
  revalidatePath("/dashboard");
  return { success: true };
}
