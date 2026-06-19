"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Sparkles, Loader2, Lock } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { PlanId } from "@/lib/plans";
import { hasFeature } from "@/lib/plans";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How can I save more this month?",
  "Can I afford a €1,200 laptop by December?",
  "Where am I overspending?",
  "Build me a savings plan.",
];

export function AICoach({ plan }: { plan: PlanId }) {
  const locked = !hasFeature(plan, "ai_lite");
  const isCoach = hasFeature(plan, "ai_coach");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: isCoach
        ? "Hi! I'm your AI Financial Coach. Ask me anything about your spending, goals, or saving strategy."
        : "Hi! I'm your AI Assistant. Ask me for quick budgeting tips and goal suggestions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m.role !== "assistant" || next.indexOf(m) !== 0) }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.content || data.error || "Something went wrong." },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  if (locked) {
    return (
      <GlassCard strong className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 ring-1 ring-white/10">
          <Lock className="h-7 w-7 text-accent-purple" />
        </div>
        <h2 className="font-display text-2xl font-bold">Unlock the AI Coach</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The AI Assistant is available on Pro (€3/mo) and the full AI Financial Coach on Premium
          (€5/mo). Students get Pro free.
        </p>
        <Link href="/billing" className="btn-primary mt-5">
          See plans
        </Link>
      </GlassCard>
    );
  }

  return (
    <GlassCard strong className="flex h-[70vh] flex-col">
      <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
        <Sparkles className="h-5 w-5 text-accent-purple" />
        <span className="font-semibold">{isCoach ? "AI Financial Coach" : "AI Assistant Lite"}</span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                  : "glass text-foreground"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-accent-purple" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex items-center gap-2 rounded-xl glass px-3 py-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI coach…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2 disabled:opacity-50"
        >
          <Send className="h-4 w-4 text-white" />
        </button>
      </form>
    </GlassCard>
  );
}
