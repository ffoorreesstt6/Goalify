"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Target, Wallet } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-36 lg:pb-24">
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700"
          >
            <Sparkles className="h-4 w-4 text-brand-500" />
            AI-powered financial coaching
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-5xl font-extrabold leading-[1.08] tracking-tight text-gray-900 sm:text-6xl md:text-7xl text-balance"
          >
            Turn Every Euro <br />
            Into <span className="gradient-text">Progress.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-500 text-balance"
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
            <Link href="/signup" className="btn-primary group text-base">
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#ai-demo" className="btn-ghost text-base">
              See the AI in action
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-5 text-sm text-gray-400"
          >
            No credit card required · Free forever plan · Students get Pro free
          </motion.p>
        </div>

        {/* Dashboard preview mock */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="relative mx-auto mt-16 max-w-5xl lg:mt-20"
        >
          {/* Subtle glow behind the card */}
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-brand-400/10 to-brand-600/10 blur-2xl" />
          <div className="relative rounded-2xl border border-gray-200 bg-white p-2 shadow-soft-xl">
            <div className="rounded-xl bg-gray-50/80 p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Wallet, label: "Income", value: "€2,400", color: "text-blue-500" },
                  { icon: TrendingUp, label: "Saved", value: "€680", color: "text-emerald-500" },
                  { icon: Target, label: "Active goals", value: "4", color: "text-brand-500" },
                  { icon: Sparkles, label: "Goalify Score", value: "82", color: "text-brand-400" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-gray-100 bg-white p-4 text-left shadow-soft-xs">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-end gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-soft-xs h-40">
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
