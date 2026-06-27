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
    <section id="features" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label">Features</p>
          <h2 className="section-title">
            Everything you need to <span className="gradient-text">win with money</span>
          </h2>
          <p className="section-description">
            A complete financial toolkit powered by AI — designed to make smart money
            habits effortless.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
            >
              <div className="card-premium group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-brand-100 bg-brand-50">
                  <f.icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
