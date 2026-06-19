"use client";

import { useState } from "react";
import { Flame, Loader2, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function RoastCard() {
  const [roast, setRoast] = useState("Tap the button and let the AI judge your spending 🔥");
  const [loading, setLoading] = useState(false);

  async function getRoast() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/roast", { method: "POST" });
      const data = await res.json();
      setRoast(data.roast || data.error || "Couldn't generate a roast.");
    } catch {
      setRoast("Network error — even your roast is on a budget today.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard strong className="flex flex-col">
      <div className="mb-3 flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange-400" />
        <h3 className="font-semibold">AI Roast Mode</h3>
      </div>
      <p className="flex-1 text-lg leading-relaxed">{roast}</p>
      <button onClick={getRoast} disabled={loading} className="btn-ghost mt-4 text-sm">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        Roast me
      </button>
    </GlassCard>
  );
}
