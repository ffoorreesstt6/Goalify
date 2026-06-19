"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getUserOrRedirect } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/server";

export async function updateProfileAction(input: {
  full_name: string;
  monthly_income: number;
  currency: string;
}) {
  const { user, supabase } = await getUserOrRedirect();
  const schema = z.object({
    full_name: z.string().max(80),
    monthly_income: z.number().min(0),
    currency: z.string().min(3).max(3),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("profiles")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function changePasswordAction(input: { password: string; confirm: string }) {
  const { supabase } = await getUserOrRedirect();
  const schema = z
    .object({
      password: z
        .string()
        .min(8, "At least 8 characters")
        .regex(/[A-Z]/, "Add an uppercase letter")
        .regex(/[0-9]/, "Add a number"),
      confirm: z.string(),
    })
    .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateNotificationsAction(prefs: Record<string, boolean>) {
  const { user, supabase } = await getUserOrRedirect();
  const { error } = await supabase
    .from("profiles")
    .update({ notification_prefs: prefs, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { success: true };
}

export async function requestStudentVerificationAction(input: {
  institution: string;
  student_email: string;
}) {
  const { user, supabase } = await getUserOrRedirect();
  const { error } = await supabase.from("student_verifications").insert({
    user_id: user.id,
    institution: input.institution,
    student_email: input.student_email,
    status: "pending",
  });
  if (error) return { error: error.message };
  await supabase.from("profiles").update({ is_student: true }).eq("id", user.id);
  revalidatePath("/settings");
  return { success: true };
}

export async function exportDataAction() {
  const { user, supabase } = await getUserOrRedirect();
  const [profile, goals, expenses, subs, challenges] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("goals").select("*").eq("user_id", user.id),
    supabase.from("expenses").select("*").eq("user_id", user.id),
    supabase.from("subscriptions").select("*").eq("user_id", user.id),
    supabase.from("challenges").select("*").eq("user_id", user.id),
  ]);
  return {
    success: true,
    data: {
      exported_at: new Date().toISOString(),
      profile: profile.data,
      goals: goals.data,
      expenses: expenses.data,
      subscriptions: subs.data,
      challenges: challenges.data,
    },
  };
}

export async function deleteAccountAction() {
  const { user, supabase } = await getUserOrRedirect();
  // Best-effort: delete user data, then the auth user via admin client.
  await supabase.from("goals").delete().eq("user_id", user.id);
  await supabase.from("expenses").delete().eq("user_id", user.id);
  await supabase.from("subscriptions").delete().eq("user_id", user.id);
  await supabase.from("challenges").delete().eq("user_id", user.id);
  await supabase.from("profiles").delete().eq("id", user.id);

  try {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(user.id);
  } catch {
    // If service role isn't configured, sign out anyway.
  }
  await supabase.auth.signOut();
  redirect("/");
}
