"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  adminLogin,
  adminLogout,
  getCurrentAdmin,
  changeAdminCredentials,
} from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";
import type { PlanId } from "@/lib/plans";

type AdminState = { error?: string } | null;

export async function adminLoginAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Email and password are required." };
  const res = await adminLogin(email, password);
  if (res.error) return { error: res.error };
  redirect("/admin");
}

export async function adminLogoutAction() {
  adminLogout();
  redirect("/admin/login");
}

export async function updateUserPlanAction(userId: string, plan: PlanId) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };
  const supabase = createAdminClient();
  const { error } = await supabase.from("profiles").update({ plan }).eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function reviewStudentVerificationAction(
  id: string,
  decision: "approved" | "rejected",
  userId: string
) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };
  const supabase = createAdminClient();
  await supabase.from("student_verifications").update({ status: decision }).eq("id", id);
  if (decision === "approved") {
    await supabase.from("profiles").update({ student_verified: true, plan: "pro" }).eq("id", userId);
  }
  revalidatePath("/admin");
  return { success: true };
}

export async function changeAdminCredentialsAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const res = await changeAdminCredentials(admin.id, email, password);
  if (res.error) return { error: res.error };
  return null;
}
