"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Target, Wallet } from "lucide-react";
import { FloatingOrbs } from "@/components/ui/FloatingOrbs";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-24">
      <FloatingOrbs />
      <div
        className="absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-muted-foreground"
          >
            <Sparkles className="h-4 w-4 text-accent-purple" />
            AI-powered financial coaching
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl text-balance"
          >
            Turn Every Euro <br />
            Into <span className="gradient-text">Progress.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance"
          >
            Track spending, reach goals faster, and receive AI-powered financial
            coaching — all in one beautifully simple platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/signup" className="btn-primary group">
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#ai-demo" className="btn-ghost">
              See the AI in action
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            No credit card required · Free forever plan · Students get Pro free
          </motion.p>
        </div>

        {/* Dashboard preview mock */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/30 to-purple-600/30 blur-2xl" />
          <div className="glass-strong relative rounded-3xl p-2 shadow-glow-lg">
            <div className="rounded-2xl bg-background/80 p-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { icon: Wallet, label: "Income", value: "€2,400", color: "text-accent-blue" },
                  { icon: TrendingUp, label: "Saved", value: "€680", color: "text-emerald-400" },
                  { icon: Target, label: "Active goals", value: "4", color: "text-accent-purple" },
                  { icon: Sparkles, label: "Goalify Score", value: "82", color: "text-accent-violet" },
                ].map((stat) => (
                  <div key={stat.label} className="glass rounded-xl p-4 text-left">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <p className="mt-3 text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-end gap-2 rounded-xl glass p-4 h-40">
                {[40, 65, 45, 80, 55, 90, 70, 100, 60, 85, 75, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-blue-500 to-purple-500"
                    style={{ height: `${h}%`, opacity: 0.5 + (h / 200) }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
