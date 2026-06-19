"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const testimonials = [
  {
    name: "Lena M.",
    role: "Student, Berlin",
    text: "Goalify got me Pro for free as a student. I saved €600 for my trip in 3 months — the goal tracker actually kept me honest.",
  },
  {
    name: "Diego R.",
    role: "Freelancer, Madrid",
    text: "The AI coach caught three subscriptions I forgot about. That alone pays for Premium ten times over.",
  },
  {
    name: "Aoife K.",
    role: "Designer, Dublin",
    text: "Roast Mode is brutal and I love it. 'Midnight you is expensive' lives rent-free in my head now.",
  },
  {
    name: "Tomas V.",
    role: "Small business owner",
    text: "The Business plan replaced my messy spreadsheets. Profit, tax reports, and revenue tracking in one place.",
  },
  {
    name: "Priya S.",
    role: "Marketing lead",
    text: "Beautiful app, genuinely useful AI. The Goalify Score gamifies saving in a way that just works.",
  },
  {
    name: "Marco B.",
    role: "Engineer, Milan",
    text: "Future Simulator showed me I could retire 4 years earlier by saving €150 more a month. Eye-opening.",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest gradient-text">
            Loved by savers
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            People are reaching their goals
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.1 }}
            >
              <GlassCard hover className="h-full">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
