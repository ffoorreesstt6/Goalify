"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles, Loader2 } from "lucide-react";
import { QUIZ, PERSONALITIES, computePersonality, type PersonalityId } from "@/lib/quiz";
import { saveQuizAction } from "@/app/onboarding/actions";
import { GlassCard } from "@/components/ui/GlassCard";
import { FloatingOrbs } from "@/components/ui/FloatingOrbs";

export function Quiz() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PersonalityId | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = QUIZ.length;
  const q = QUIZ[step];
  const progress = result ? 100 : Math.round((step / total) * 100);

  function select(value: string) {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (step < total - 1) {
      setTimeout(() => setStep(step + 1), 200);
    } else {
      finish(next);
    }
  }

  async function finish(finalAnswers: Record<string, string>) {
    setSaving(true);
    setError(null);
    const personality = computePersonality(finalAnswers);
    const res = await saveQuizAction(finalAnswers);
    setSaving(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setResult(personality);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <FloatingOrbs />
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>{result ? "Complete" : `Question ${step + 1} of ${total}`}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard strong>
                <h2 className="font-display text-2xl font-bold">{q.question}</h2>
                {q.subtitle && (
                  <p className="mt-1 text-sm text-muted-foreground">{q.subtitle}</p>
                )}
                <div className="mt-6 space-y-3">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => select(opt.value)}
                        disabled={saving}
                        className={`flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left text-sm transition-all ${
                          selected
                            ? "border-accent-purple/60 bg-accent-purple/10"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {selected && <Check className="h-4 w-4 text-accent-purple" />}
                      </button>
                    );
                  })}
                </div>

                {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0 || saving}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground disabled:opacity-30"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  {saving && (
                    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
                    </span>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <ResultCard personality={result} onContinue={() => router.push("/dashboard")} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ResultCard({
  personality,
  onContinue,
}: {
  personality: PersonalityId;
  onContinue: () => void;
}) {
  const p = PERSONALITIES[personality];
  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard strong className="text-center">
        <div className="mx-auto mb-4 text-6xl">{p.emoji}</div>
        <p className="text-sm font-semibold uppercase tracking-widest gradient-text">
          Your money personality
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold">{p.name}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{p.description}</p>

        <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
          <div className="glass rounded-xl p-4">
            <h3 className="mb-2 text-sm font-semibold text-emerald-300">Strengths</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {p.strengths.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-xl p-4">
            <h3 className="mb-2 text-sm font-semibold text-orange-300">Watch-outs</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {p.watchouts.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 glass rounded-xl p-4 text-left">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-accent-purple" /> Personalized recommendations
          </h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {p.recommendations.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-purple" /> {r}
              </li>
            ))}
          </ul>
        </div>

        <button onClick={onContinue} className="btn-primary mt-6 w-full">
          Go to dashboard <ArrowRight className="h-4 w-4" />
        </button>
      </GlassCard>
    </motion.div>
  );
}
