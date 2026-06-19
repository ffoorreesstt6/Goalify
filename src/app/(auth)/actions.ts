"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().email("Enter a valid email address");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[0-9]/, "Include at least one number");

type AuthState = { error?: string; success?: string } | null;

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "");
  const honeypot = String(formData.get("company") || ""); // anti-spam honeypot

  if (honeypot) return { error: "Something went wrong. Please try again." };

  const e = emailSchema.safeParse(email);
  if (!e.success) return { error: e.error.issues[0].message };
  const p = passwordSchema.safeParse(password);
  if (!p.success) return { error: p.error.issues[0].message };

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl()}/auth/callback?next=/onboarding`,
    },
  });

  if (error) return { error: error.message };
  redirect(`/verify?email=${encodeURIComponent(email)}`);
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirect") || "/dashboard");

  const e = emailSchema.safeParse(email);
  if (!e.success) return { error: e.error.issues[0].message };
  if (!password) return { error: "Password is required" };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function forgotPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "");
  const e = emailSchema.safeParse(email);
  if (!e.success) return { error: e.error.issues[0].message };

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: error.message };
  return { success: "Check your email for a password reset link." };
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  const p = passwordSchema.safeParse(password);
  if (!p.success) return { error: p.error.issues[0].message };
  if (password !== confirm) return { error: "Passwords do not match" };

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function resendVerificationAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "");
  const e = emailSchema.safeParse(email);
  if (!e.success) return { error: e.error.issues[0].message };

  const supabase = createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback?next=/onboarding` },
  });
  if (error) return { error: error.message };
  return { success: "Verification email resent." };
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
