import { GlassCard } from "@/components/ui/GlassCard";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "text-accent-purple",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <GlassCard className="!p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={cn("h-5 w-5", accent)} />
      </div>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </GlassCard>
  );
}
