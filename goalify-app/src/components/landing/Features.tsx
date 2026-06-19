"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Target,
  LineChart,
  ScanLine,
  Repeat,
  Trophy,
  Flame,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const features = [
  {
    icon: Brain,
    title: "AI Financial Coach",
    desc: "Personalized coaching that analyzes your spending and builds savings strategies tailored to you.",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    desc: "Set goals for a new phone, a trip, or an emergency fund — and watch progress in real time.",
  },
  {
    icon: LineChart,
    title: "Deep Analytics",
    desc: "Daily, weekly, monthly, yearly and even 5-year analytics with future projections.",
  },
  {
    icon: ScanLine,
    title: "Receipt Scanner",
    desc: "Snap a receipt and AI extracts store, amount, category and date — logged automatically.",
  },
  {
    icon: Repeat,
    title: "Subscription Detector",
    desc: "Automatically finds Netflix, Spotify, ChatGPT and more, showing monthly & yearly cost.",
  },
  {
    icon: Trophy,
    title: "Challenges & Rewards",
    desc: "Take savings challenges, earn XP, badges and achievements as you build better habits.",
  },
  {
    icon: Flame,
    title: "Streaks",
    desc: "Stay consistent with days-under-budget, savings and goal streaks.",
  },
  {
    icon: Sparkles,
    title: "Goalify Score",
    desc: "A 0–100 score reflecting your savings, spending habits, consistency and goal completion.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-grade Security",
    desc: "Encrypted data, secure auth, and privacy-first design. Your money data stays yours.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest gradient-text">
            Features
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Everything you need to <span className="gradient-text">win with money</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete financial toolkit powered by AI — designed to make smart money
            habits effortless.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.1 }}
            >
              <GlassCard hover className="h-full">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 ring-1 ring-white/10">
                  <f.icon className="h-6 w-6 text-accent-purple" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
