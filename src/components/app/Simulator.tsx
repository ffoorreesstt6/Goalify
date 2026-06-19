"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";

export function Simulator({ defaultIncome = 2000 }: { defaultIncome?: number }) {
  const [income, setIncome] = useState(defaultIncome);
  const [expenses, setExpenses] = useState(Math.round(defaultIncome * 0.7));
  const [goal, setGoal] = useState(10000);
  const [rate, setRate] = useState(2); // annual % growth on savings

  const monthlySaving = Math.max(0, income - expenses);

  const data = useMemo(() => {
    const points: { month: string; savings: number }[] = [];
    let balance = 0;
    const monthlyRate = rate / 100 / 12;
    for (let m = 0; m <= 60; m++) {
      points.push({ month: m === 0 ? "Now" : `M${m}`, savings: Math.round(balance) });
      balance = balance * (1 + monthlyRate) + monthlySaving;
    }
    return points;
  }, [income, expenses, rate, monthlySaving]);

  const monthsToGoal = useMemo(() => {
    if (monthlySaving <= 0) return null;
    let balance = 0;
    const monthlyRate = rate / 100 / 12;
    for (let m = 1; m <= 600; m++) {
      balance = balance * (1 + monthlyRate) + monthlySaving;
      if (balance >= goal) return m;
    }
    return null;
  }, [goal, monthlySaving, rate]);

  const fiveYearTotal = data[data.length - 1]?.savings ?? 0;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <GlassCard className="lg:col-span-1 h-fit space-y-5">
        <h3 className="font-semibold">Your inputs</h3>
        <SliderRow label="Monthly income" value={income} min={0} max={10000} step={50} onChange={setIncome} />
        <SliderRow label="Monthly expenses" value={expenses} min={0} max={10000} step={50} onChange={setExpenses} />
        <SliderRow label="Savings goal" value={goal} min={500} max={100000} step={500} onChange={setGoal} />
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Annual growth rate</span>
            <span className="font-medium">{rate}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>
      </GlassCard>

      <div className="lg:col-span-2 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <GlassCard className="!p-5">
            <p className="text-sm text-muted-foreground">Monthly savings</p>
            <p className="mt-2 font-display text-2xl font-bold text-emerald-400">
              {formatCurrency(monthlySaving)}
            </p>
          </GlassCard>
          <GlassCard className="!p-5">
            <p className="text-sm text-muted-foreground">Goal reached in</p>
            <p className="mt-2 font-display text-2xl font-bold">
              {monthsToGoal ? `${monthsToGoal} mo` : "—"}
            </p>
          </GlassCard>
          <GlassCard className="!p-5">
            <p className="text-sm text-muted-foreground">In 5 years</p>
            <p className="mt-2 font-display text-2xl font-bold gradient-text">
              {formatCurrency(fiveYearTotal)}
            </p>
          </GlassCard>
        </div>

        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent-purple" />
            <h3 className="font-semibold">5-year savings projection</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} interval={11} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={50} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,18,30,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [formatCurrency(v), "Savings"]}
                />
                <Line type="monotone" dataKey="savings" stroke="#a855f7" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{formatCurrency(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-purple-500"
      />
    </div>
  );
}
