"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Flame } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const demoConversation = [
  { role: "user", text: "Can I afford a €1,200 MacBook by December?" },
  {
    role: "ai",
    text: "Based on your €680/mo average savings, you'd reach €1,200 in about 7 weeks if you set it as a priority goal. Cutting your €80/week food delivery in half gets you there 2 weeks sooner. Want me to create the goal?",
  },
];

const roasts = [
  "You spent €80 on fast food this week. That's enough for many homemade meals 🍳",
  "5 coffee runs this week. Your barista knows you better than your savings account ☕",
  "3 impulse buys after 11pm. Midnight you is expensive 🌙",
];

export function AIDemo() {
  const [roastIndex, setRoastIndex] = useState(0);

  return (
    <section id="ai-demo" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest gradient-text">
            AI in action
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Your money, explained by AI
          </h2>
          <p className="mt-4 text-muted-foreground">
            Ask anything. Get coaching, predictions, and the occasional reality check.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <GlassCard strong className="h-full">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent-purple" />
                <span className="font-semibold">AI Financial Coach</span>
              </div>
              <div className="space-y-4">
                {demoConversation.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        m.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                          : "glass text-foreground"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 rounded-xl glass px-4 py-3">
                <input
                  disabled
                  placeholder="Ask your AI coach anything…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <button className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2">
                  <Send className="h-4 w-4 text-white" />
                </button>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GlassCard className="flex h-full flex-col">
              <div className="mb-4 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="font-semibold">AI Roast Mode</span>
              </div>
              <div className="flex flex-1 items-center">
                <p className="text-lg leading-relaxed">{roasts[roastIndex]}</p>
              </div>
              <button
                onClick={() => setRoastIndex((i) => (i + 1) % roasts.length)}
                className="btn-ghost mt-4 text-sm"
              >
                Roast me again
              </button>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
