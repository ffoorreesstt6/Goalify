"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

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
    <section className="relative py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label">Loved by savers</p>
          <h2 className="section-title">People are reaching their goals</h2>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
            >
              <div className="card-premium group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
