"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is Goalify really free?",
    a: "Yes. The Free plan includes expense tracking, full analytics (daily to 5-year), spending categories, your money personality profile, and up to 3 goals — forever, no credit card required.",
  },
  {
    q: "How do students get Pro for free?",
    a: "Verify your student status in Settings → Student Verification. Once approved, your account is upgraded to Pro at no cost for the duration of your studies.",
  },
  {
    q: "How does the AI work?",
    a: "Our AI analyzes your spending patterns, goals and habits to give personalized coaching, spending predictions, savings strategies and budget recommendations. Pro includes AI Assistant Lite; Premium unlocks the full AI Financial Coach.",
  },
  {
    q: "Is my financial data secure?",
    a: "Absolutely. Data is encrypted in transit and at rest, protected by secure authentication and row-level security so only you can access your data. We never sell your data.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can upgrade, downgrade or cancel your subscription at any time from Settings → Billing. No lock-in, no hidden fees.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We process payments securely through Paddle, which supports all major credit and debit cards plus regional payment methods, with automatic EU VAT handling.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label">FAQ</p>
          <h2 className="section-title">Questions, answered</h2>
        </div>

        <div className="mt-14 space-y-3">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft-xs transition-shadow hover:shadow-soft"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-medium text-gray-900">{f.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="px-6 pb-5 text-sm leading-relaxed text-gray-500">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
