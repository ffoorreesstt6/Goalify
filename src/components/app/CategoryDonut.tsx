"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { CategorySlice } from "@/lib/analytics";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";

export function CategoryDonut({ data }: { data: CategorySlice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <GlassCard>
      <h3 className="mb-4 font-semibold text-gray-900">Spending by category</h3>
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">
          No spending this month yet. Add an expense to see your breakdown.
        </p>
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((d) => (
                    <Cell key={d.category} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(255,255,255,0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.08)",
                  }}
                  formatter={(v: number) => formatCurrency(v)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-gray-500">Total</span>
              <span className="font-display text-lg font-bold text-gray-900">{formatCurrency(total)}</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {data.slice(0, 6).map((d) => (
              <div key={d.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-gray-500">{d.label}</span>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
