"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PLANS, PLAN_ORDER } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest gradient-text">
            Pricing
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free. Upgrade when you&apos;re ready. Students get Pro free.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-4">
          {PLAN_ORDER.map((id, i) => {
            const plan = PLANS[id];
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={cn(
                  "relative flex flex-col rounded-2xl p-6",
                  plan.highlight
                    ? "gradient-border shadow-glow"
                    : "glass"
                )}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">€{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>

                <Link
                  href="/signup"
                  className={cn(
                    "mt-6 w-full rounded-xl py-2.5 text-center text-sm font-semibold transition-all",
                    plan.highlight
                      ? "btn-primary"
                      : "border border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                >
                  {plan.price === 0 ? "Get started" : "Choose " + plan.name}
                </Link>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-purple" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
