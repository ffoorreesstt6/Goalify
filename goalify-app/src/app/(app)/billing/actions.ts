"use server";

import { revalidatePath } from "next/cache";
import { getUserOrRedirect } from "@/lib/data";
import { cancelPaddleSubscription } from "@/lib/paddle";

export async function cancelSubscriptionAction() {
  const { user, supabase } = await getUserOrRedirect();

  const { data: sub } = await supabase
    .from("billing_subscriptions")
    .select("paddle_subscription_id, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!sub?.paddle_subscription_id) {
    return { error: "No active subscription found." };
  }

  try {
    await cancelPaddleSubscription(sub.paddle_subscription_id);
  } catch (e: any) {
    return { error: e?.message ?? "Failed to cancel subscription with Paddle." };
  }

  await supabase
    .from("billing_subscriptions")
    .update({ status: "canceled" })
    .eq("paddle_subscription_id", sub.paddle_subscription_id);

  revalidatePath("/billing");
  return { success: true };
}
