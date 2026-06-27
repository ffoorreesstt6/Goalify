"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Flame } from "lucide-react";

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
    <section id="ai-demo" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label">AI in action</p>
          <h2 className="section-title">Your money, explained by AI</h2>
          <p className="section-description">
            Ask anything. Get coaching, predictions, and the occasional reality check.
          </p>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="card-premium h-full">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-500" />
                <span className="font-semibold text-gray-900">AI Financial Coach</span>
              </div>
              <div className="space-y-4">
                {demoConversation.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white"
                          : "rounded-2xl border border-gray-100 bg-gray-50 text-gray-700"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
                <input
                  disabled
                  placeholder="Ask your AI coach anything…"
                  className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />
                <button className="rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 p-2">
                  <Send className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="card-premium flex h-full flex-col">
              <div className="mb-4 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-gray-900">AI Roast Mode</span>
              </div>
              <div className="flex flex-1 items-center">
                <p className="text-lg leading-relaxed text-gray-700">{roasts[roastIndex]}</p>
              </div>
              <button
                onClick={() => setRoastIndex((i) => (i + 1) % roasts.length)}
                className="btn-ghost mt-4 text-sm"
              >
                Roast me again
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
