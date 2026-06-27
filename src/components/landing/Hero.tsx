"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Target, Wallet } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-12 pt-10 sm:pb-16 lg:pt-14 lg:pb-20">
      {/* Subtle animated background shapes */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="hero-shape animate-float"
          style={{
            top: "10%",
            right: "15%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)",
          }}
        />
        <div
          className="hero-shape animate-pulse-glow"
          style={{
            bottom: "5%",
            left: "10%",
            width: "350px",
            height: "350px",
            background: "radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)",
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 sm:text-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-500 sm:h-4 sm:w-4" />
            AI-powered financial coaching
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl text-balance"
          >
            Turn Every Euro <br />
            Into <span className="gradient-text">Progress.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg text-balance"
          >
            Track spending, reach goals faster, and receive AI-powered financial
            coaching — all in one beautifully simple platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <Link href="/signup" className="btn-primary group w-full sm:w-auto">
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#ai-demo" className="btn-ghost w-full sm:w-auto">
              See the AI in action
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.32 }}
            className="mt-4 text-xs text-gray-400 sm:text-sm"
          >
            No credit card required · Free forever plan · Students get Pro free
          </motion.p>
        </div>

        {/* Dashboard preview mock */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.36 }}
          className="relative mx-auto mt-12 max-w-5xl sm:mt-16 lg:mt-20"
        >
          {/* Subtle glow behind the card */}
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-brand-400/10 to-brand-600/10 blur-2xl" />
          <div className="relative rounded-2xl border border-gray-200 bg-white p-1.5 shadow-soft-xl sm:p-2">
            <div className="rounded-xl bg-gray-50/80 p-3 sm:p-6">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                {[
                  { icon: Wallet, label: "Income", value: "€2,400", color: "text-blue-500" },
                  { icon: TrendingUp, label: "Saved", value: "€680", color: "text-emerald-500" },
                  { icon: Target, label: "Active goals", value: "4", color: "text-brand-500" },
                  { icon: Sparkles, label: "Goalify Score", value: "82", color: "text-brand-400" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-gray-100 bg-white p-3 text-left shadow-soft-xs sm:p-4">
                    <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                    <p className="mt-2 text-lg font-bold text-gray-900 sm:mt-3 sm:text-2xl">{stat.value}</p>
                    <p className="text-[11px] text-gray-500 sm:text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-end gap-1.5 rounded-xl border border-gray-100 bg-white p-3 shadow-soft-xs h-28 sm:h-40 sm:mt-3 sm:gap-2 sm:p-4">
                {[40, 65, 45, 80, 55, 90, 70, 100, 60, 85, 75, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-brand-500 to-brand-300"
                    style={{ height: `${h}%`, opacity: 0.4 + (h / 250) }}
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
