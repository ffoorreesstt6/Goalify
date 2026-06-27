"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  CreditCard,
  TrendingUp,
  GraduationCap,
  Activity,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Logo } from "@/components/ui/Logo";
import { formatCurrency, formatDate, initials } from "@/lib/utils";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/plans";
import {
  adminLogoutAction,
  updateUserPlanAction,
  reviewStudentVerificationAction,
} from "@/app/admin/actions";

interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  plan: PlanId;
  created_at: string;
  student_verified: boolean;
}
interface Verification {
  id: string;
  user_id: string;
  institution: string;
  student_email: string;
  status: string;
}

export function AdminDashboard({
  adminEmail,
  users,
  verifications,
  stats,
}: {
  adminEmail: string;
  users: AdminUser[];
  verifications: Verification[];
  stats: {
    totalUsers: number;
    mrr: number;
    activeSubs: number;
    aiCalls: number;
    planCounts: Record<PlanId, number>;
  };
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "users" | "verifications">("overview");
  const [pending, start] = useTransition();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo href="/admin" />
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-600">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{adminEmail}</span>
          <form action={adminLogoutAction}>
            <button className="btn-ghost !py-2 text-sm">Sign out</button>
          </form>
        </div>
      </div>

      <div className="mb-6 flex gap-1 rounded-xl bg-gray-50 p-1">
        {(["overview", "users", "verifications"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-all ${
              tab === t ? "bg-gradient-to-r from-brand-500 to-brand-700 text-white" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={Users} label="Total users" value={String(stats.totalUsers)} />
            <Stat icon={TrendingUp} label="MRR" value={formatCurrency(stats.mrr)} />
            <Stat icon={CreditCard} label="Active subscriptions" value={String(stats.activeSubs)} />
            <Stat icon={Activity} label="AI calls" value={String(stats.aiCalls)} />
          </div>

          <GlassCard>
            <h3 className="mb-4 font-semibold">Plan distribution</h3>
            <div className="space-y-3">
              {PLAN_ORDER.map((id) => {
                const count = stats.planCounts[id] ?? 0;
                const pct = stats.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0;
                return (
                  <div key={id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{PLANS[id].name}</span>
                      <span className="text-muted-foreground">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}

      {tab === "users" && (
        <GlassCard>
          <h3 className="mb-4 font-semibold">All users ({users.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-muted-foreground">
                  <th className="pb-2">User</th>
                  <th className="pb-2">Joined</th>
                  <th className="pb-2">Plan</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-semibold text-white">
                          {initials(u.full_name, u.email)}
                        </span>
                        <div>
                          <p className="font-medium">{u.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                    <td className="py-3">
                      <select
                        defaultValue={u.plan}
                        disabled={pending}
                        onChange={(e) =>
                          start(async () => {
                            await updateUserPlanAction(u.id, e.target.value as PlanId);
                            router.refresh();
                          })
                        }
                        className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs outline-none"
                      >
                        {PLAN_ORDER.map((p) => (
                          <option key={p} value={p} className="bg-card">
                            {PLANS[p].name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {tab === "verifications" && (
        <GlassCard>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <GraduationCap className="h-5 w-5" /> Student verifications
          </h3>
          {verifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No pending verifications.</p>
          ) : (
            <div className="space-y-3">
              {verifications.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{v.institution}</p>
                    <p className="text-xs text-muted-foreground">{v.student_email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        start(async () => {
                          await reviewStudentVerificationAction(v.id, "approved", v.user_id);
                          router.refresh();
                        })
                      }
                      disabled={pending}
                      className="rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        start(async () => {
                          await reviewStudentVerificationAction(v.id, "rejected", v.user_id);
                          router.refresh();
                        })
                      }
                      disabled={pending}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {pending && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-xl card-premium px-4 py-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Updating…
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <GlassCard className="!p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-5 w-5 text-brand-500" />
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
    </GlassCard>
  );
}
