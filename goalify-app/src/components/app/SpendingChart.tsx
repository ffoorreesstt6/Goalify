"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { buildSeries, type Timeframe } from "@/lib/analytics";
import type { Expense } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";

const TABS: { id: Timeframe; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
  { id: "fiveyear", label: "5-Year" },
];

export function SpendingChart({ expenses }: { expenses: Expense[] }) {
  const [tf, setTf] = useState<Timeframe>("monthly");
  const data = buildSeries(expenses, tf);

  return (
    <GlassCard>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">Spending</h3>
        <div className="flex flex-wrap gap-1 rounded-xl bg-white/5 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTf(t.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                tf === t.id ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={48} />
            <Tooltip
              contentStyle={{
                background: "rgba(15,18,30,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: "#94a3b8" }}
              formatter={(v: number) => [formatCurrency(v), "Spending"]}
            />
            <Area
              type="monotone"
              dataKey="spending"
              stroke="#a855f7"
              strokeWidth={2.5}
              fill="url(#spendGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
