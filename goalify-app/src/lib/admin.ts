import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

const COOKIE = "goalify_admin";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

function signingSecret(): string {
  // Server-only secret. Falls back to service role key.
  return process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "dev-insecure-secret";
}

export function hashPassword(password: string, salt?: string): string {
  const s = salt ?? crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, s, 64).toString("hex");
  return `${s}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const computed = crypto.scryptSync(password, salt, 64).toString("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", signingSecret()).update(payload).digest("hex");
}

export function createAdminToken(adminId: string): string {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `${adminId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string): { adminId: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [adminId, exp, sig] = parts;
  if (sign(`${adminId}.${exp}`) !== sig) return null;
  if (Number(exp) < Date.now()) return null;
  return { adminId };
}

/** Ensure a bootstrap admin exists (from env) if the table is empty. */
export async function ensureBootstrapAdmin() {
  const supabase = createAdminClient();
  const { count } = await supabase.from("admin_users").select("id", { count: "exact", head: true });
  if ((count ?? 0) > 0) return;

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password) return;

  await supabase.from("admin_users").insert({
    email: email.toLowerCase(),
    password_hash: hashPassword(password),
  });
}

export async function adminLogin(email: string, password: string): Promise<{ error?: string }> {
  await ensureBootstrapAdmin();
  const supabase = createAdminClient();
  const { data: admin } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!admin || !verifyPassword(password, admin.password_hash)) {
    return { error: "Invalid admin credentials." };
  }

  const token = createAdminToken(admin.id);
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_TTL_MS / 1000,
    path: "/",
  });

  await supabase.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", admin.id);
  return {};
}

export function adminLogout() {
  cookies().delete(COOKIE);
}

export async function getCurrentAdmin(): Promise<{ id: string; email: string } | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const verified = verifyAdminToken(token);
  if (!verified) return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("admin_users")
    .select("id, email")
    .eq("id", verified.adminId)
    .maybeSingle();
  return data ?? null;
}

export async function changeAdminCredentials(
  adminId: string,
  newEmail: string,
  newPassword: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const update: Record<string, string> = {};
  if (newEmail) update.email = newEmail.toLowerCase();
  if (newPassword) update.password_hash = hashPassword(newPassword);
  if (Object.keys(update).length === 0) return { error: "Nothing to update." };
  const { error } = await supabase.from("admin_users").update(update).eq("id", adminId);
  if (error) return { error: error.message };
  return {};
}
