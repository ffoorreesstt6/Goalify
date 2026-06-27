"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles, Loader2 } from "lucide-react";
import { QUIZ, PERSONALITIES, computePersonality, type PersonalityId } from "@/lib/quiz";
import { saveQuizAction } from "@/app/onboarding/actions";

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
      {/* Background image with CSS gradient fallback */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat quiz-nature-bg"
        style={{ backgroundImage: "url('/quiz-bg.jpg')" }}
      />
      {/* Light overlay for readability over image */}
      <div className="absolute inset-0 -z-10 bg-white/50" />
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm font-medium text-gray-600">
            <span>{result ? "Complete" : `Question ${step + 1} of ${total}`}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-200/60">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
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
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="quiz-glass-card p-8">
                <h2 className="font-display text-2xl font-bold text-gray-900">{q.question}</h2>
                {q.subtitle && (
                  <p className="mt-1 text-sm text-gray-500">{q.subtitle}</p>
                )}
                <div className="mt-6 space-y-3">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => select(opt.value)}
                        disabled={saving}
                        className={`flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left text-sm font-medium transition-all duration-200 ${
                          selected
                            ? "border-brand-300 bg-brand-50 text-brand-700 shadow-soft-xs"
                            : "border-gray-200 bg-white text-gray-700 hover:border-brand-200 hover:bg-brand-50/30 hover:shadow-soft-xs"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {selected && <Check className="h-4 w-4 text-brand-500" />}
                      </button>
                    );
                  })}
                </div>

                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0 || saving}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-30"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  {saving && (
                    <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
                    </span>
                  )}
                </div>
              </div>
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
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="quiz-glass-card p-8 text-center">
        <div className="mx-auto mb-4 text-6xl">{p.emoji}</div>
        <p className="section-label">Your money personality</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-gray-900">{p.name}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">{p.description}</p>

        <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-emerald-600">Strengths</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {p.strengths.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-amber-600">Watch-outs</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {p.watchouts.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-brand-200/60 bg-brand-50/30 p-4 text-left">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-700">
            <Sparkles className="h-4 w-4 text-brand-500" /> Personalized recommendations
          </h3>
          <ul className="space-y-1.5 text-sm text-gray-600">
            {p.recommendations.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {r}
              </li>
            ))}
          </ul>
        </div>

        <button onClick={onContinue} className="btn-primary mt-6 w-full">
          Go to dashboard <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
