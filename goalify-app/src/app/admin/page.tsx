import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = createAdminClient();
  const [{ data: profiles }, { data: verifications }, { count: aiCalls }, { count: activeSubs }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, plan, created_at, student_verified")
        .order("created_at", { ascending: false }),
      supabase
        .from("student_verifications")
        .select("id, user_id, institution, student_email, status")
        .eq("status", "pending"),
      supabase.from("ai_usage").select("id", { count: "exact", head: true }),
      supabase
        .from("billing_subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
    ]);

  const users = (profiles ?? []) as any[];
  const planCounts = PLAN_ORDER.reduce(
    (acc, p) => ({ ...acc, [p]: 0 }),
    {} as Record<PlanId, number>
  );
  let mrr = 0;
  for (const u of users) {
    const plan = (u.plan ?? "free") as PlanId;
    planCounts[plan] = (planCounts[plan] ?? 0) + 1;
    mrr += PLANS[plan]?.price ?? 0;
  }

  return (
    <AdminDashboard
      adminEmail={admin.email}
      users={users}
      verifications={(verifications ?? []) as any[]}
      stats={{
        totalUsers: users.length,
        mrr,
        activeSubs: activeSubs ?? 0,
        aiCalls: aiCalls ?? 0,
        planCounts,
      }}
    />
  );
}
