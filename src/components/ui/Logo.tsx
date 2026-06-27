import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 group", className)}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-soft transition-transform group-hover:scale-105 sm:h-9 sm:w-9 sm:rounded-xl">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-white sm:h-5 sm:w-5" fill="none">
          <path
            d="M12 2L4 7v10l8 5 8-5V7l-8-5z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M12 7v5l3.5 2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="text-lg font-display font-bold tracking-tight text-gray-900 sm:text-xl">
        Goal<span className="gradient-text">ify</span>
      </span>
    </Link>
  );
}
