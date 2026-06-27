import { getProfile, getUserOrRedirect } from "@/lib/data";
import { Billing } from "@/components/app/Billing";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Billing — Goalify" };

export default async function BillingPage() {
  const profile = await getProfile();
  const { user, supabase } = await getUserOrRedirect();

  const { data: subs } = await supabase
    .from("billing_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const active = subs?.find((s) => s.status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Billing & Plans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription, upgrade, downgrade or cancel anytime.
        </p>
      </div>

      <Billing
        currentPlan={profile.plan}
        userId={user.id}
        email={profile.email}
        hasSubscription={!!active}
      />

      {subs && subs.length > 0 && (
        <GlassCard>
          <h3 className="font-semibold">Billing history</h3>
          <div className="mt-4 divide-y divide-white/5">
            {subs.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium capitalize">{s.plan} plan</p>
                  <p className="text-xs text-muted-foreground">
                    {s.current_period_end ? `Renews ${formatDate(s.current_period_end)}` : "—"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    s.status === "active"
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-gray-100 text-muted-foreground"
                  }`}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
