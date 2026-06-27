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
        <h3 className="font-semibold text-gray-900">Spending</h3>
        <div className="flex flex-wrap gap-1 rounded-xl border border-gray-100 bg-gray-50 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTf(t.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                tf === t.id
                  ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-soft-xs"
                  : "text-gray-500 hover:text-gray-700"
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
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} width={48} />
            <Tooltip
              contentStyle={{
                background: "rgba(255,255,255,0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                fontSize: 12,
                boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.08)",
              }}
              labelStyle={{ color: "#6b7280" }}
              formatter={(v: number) => [formatCurrency(v), "Spending"]}
            />
            <Area
              type="monotone"
              dataKey="spending"
              stroke="#7c3aed"
              strokeWidth={2.5}
              fill="url(#spendGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
