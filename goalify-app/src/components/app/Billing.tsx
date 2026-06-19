"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { Check, Loader2, Crown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PLANS, PLAN_ORDER, planToPriceIdClient, type PlanId } from "@/lib/plans-client";
import { cn } from "@/lib/utils";
import { cancelSubscriptionAction } from "@/app/(app)/billing/actions";

export function Billing({
  currentPlan,
  userId,
  email,
  hasSubscription,
}: {
  currentPlan: PlanId;
  userId: string;
  email: string | null;
  hasSubscription: boolean;
}) {
  const router = useRouter();
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [busyPlan, setBusyPlan] = useState<PlanId | null>(null);
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) return;
    initializePaddle({
      environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as "sandbox" | "production") || "sandbox",
      token,
      eventCallback: (e) => {
        if ((e.name as string) === "checkout.completed") {
          setNotice("Payment successful! Your plan will update shortly.");
          setTimeout(() => router.refresh(), 2500);
        }
      },
    }).then((p) => setPaddle(p ?? null));
  }, [router]);

  function checkout(plan: PlanId) {
    const priceId = planToPriceIdClient(plan);
    if (!priceId) {
      setNotice("This plan isn't configured for checkout yet (missing Paddle price ID).");
      return;
    }
    if (!paddle) {
      setNotice("Payment system is still loading or not configured. Add your Paddle client token.");
      return;
    }
    setBusyPlan(plan);
    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: email ? { email } : undefined,
      customData: { user_id: userId },
      settings: { displayMode: "overlay", theme: "dark", successUrl: `${window.location.origin}/billing` },
    });
    setBusyPlan(null);
  }

  function cancel() {
    startTransition(async () => {
      const res = await cancelSubscriptionAction();
      setNotice(res?.error ?? "Subscription will cancel at the end of the billing period.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <GlassCard strong className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Crown className="h-6 w-6 text-yellow-400" />
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="font-display text-xl font-bold">{PLANS[currentPlan].name}</p>
          </div>
        </div>
        {hasSubscription && currentPlan !== "free" && (
          <button onClick={cancel} disabled={pending} className="btn-ghost text-sm">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Cancel subscription
          </button>
        )}
      </GlassCard>

      {notice && (
        <div className="rounded-xl border border-accent-purple/30 bg-accent-purple/10 px-4 py-3 text-sm text-accent-violet">
          {notice}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-4">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isCurrent = id === currentPlan;
          return (
            <div
              key={id}
              className={cn(
                "relative flex flex-col rounded-2xl p-6",
                plan.highlight ? "gradient-border shadow-glow" : "glass"
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold">€{plan.price}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>

              <button
                onClick={() => (id === "free" ? null : checkout(id))}
                disabled={isCurrent || id === "free" || busyPlan === id}
                className={cn(
                  "mt-5 w-full rounded-xl py-2.5 text-sm font-semibold transition-all",
                  isCurrent
                    ? "cursor-default border border-white/10 bg-white/5 text-muted-foreground"
                    : plan.highlight
                      ? "btn-primary"
                      : "border border-white/10 bg-white/5 hover:bg-white/10"
                )}
              >
                {busyPlan === id ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : isCurrent ? (
                  "Current plan"
                ) : id === "free" ? (
                  "Free forever"
                ) : (
                  `Upgrade to ${plan.name}`
                )}
              </button>

              <ul className="mt-5 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-purple" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
