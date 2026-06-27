"use client";

import { motion } from "framer-motion";
import { Lock, KeyRound, EyeOff, ServerCog } from "lucide-react";

const items = [
  { icon: Lock, title: "Encryption", desc: "Data encrypted in transit (TLS) and at rest." },
  { icon: KeyRound, title: "Secure Auth", desc: "Email verification, strong passwords, session management." },
  { icon: EyeOff, title: "Privacy-first", desc: "We never sell your data. You can export or delete it anytime." },
  { icon: ServerCog, title: "Row-level security", desc: "Database policies ensure only you can read your data." },
];

export function Security() {
  return (
    <section id="security" className="relative py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-10 shadow-soft-md sm:p-14">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-100/40 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="section-label">Security</p>
              <h2 className="section-title">Built to protect your money data</h2>
              <p className="section-description">
                Security isn&apos;t an afterthought. From encrypted storage to row-level
                database policies, Goalify is engineered so your financial data stays
                private and protected.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((it, i) => (
                <motion.div
                  key={it.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 shadow-soft-xs"
                >
                  <it.icon className="h-6 w-6 text-brand-600" />
                  <h3 className="mt-3 font-semibold text-gray-900">{it.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{it.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
