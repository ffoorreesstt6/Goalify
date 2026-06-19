import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  strong?: boolean;
  hover?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, strong, hover, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          strong ? "glass-strong" : "glass",
          "rounded-2xl p-6 shadow-glass",
          hover && "transition-all duration-300 hover:-translate-y-1 hover:shadow-glow",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";
