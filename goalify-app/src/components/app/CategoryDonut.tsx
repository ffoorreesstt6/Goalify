"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { CategorySlice } from "@/lib/analytics";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";

export function CategoryDonut({ data }: { data: CategorySlice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <GlassCard>
      <h3 className="mb-4 font-semibold">Spending by category</h3>
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
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
                    background: "rgba(15,18,30,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => formatCurrency(v)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="font-display text-lg font-bold">{formatCurrency(total)}</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {data.slice(0, 6).map((d) => (
              <div key={d.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.label}</span>
                </div>
                <span className="font-medium">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
