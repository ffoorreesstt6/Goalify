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
    <section id="security" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-10 sm:p-14">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest gradient-text">
                Security
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">
                Built to protect your money data
              </h2>
              <p className="mt-4 text-muted-foreground">
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
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="glass rounded-2xl p-5"
                >
                  <it.icon className="h-6 w-6 text-accent-purple" />
                  <h3 className="mt-3 font-semibold">{it.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
