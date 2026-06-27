"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-12 text-center shadow-glow-lg sm:p-16"
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 20%, white 0%, transparent 40%), radial-gradient(circle at 70% 80%, white 0%, transparent 40%)",
            }}
          />
          <h2 className="relative font-display text-4xl font-bold tracking-tight text-white sm:text-5xl text-balance">
            Turn every euro into progress
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/80">
            Join Goalify today and start reaching your goals faster — with AI in your corner.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-brand-700 shadow-soft-md transition-all duration-200 hover:scale-[1.02] hover:shadow-soft-lg"
            >
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
