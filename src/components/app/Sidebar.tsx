"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Target,
  BarChart3,
  Sparkles,
  Trophy,
  Repeat,
  Settings,
  CreditCard,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn, initials } from "@/lib/utils";
import { getPlan, type PlanId } from "@/lib/plans";
import { signOutAction } from "@/app/(auth)/actions";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/simulator", label: "Future Simulator", icon: TrendingUp },
  { href: "/ai", label: "AI Coach", icon: Sparkles },
  { href: "/challenges", label: "Challenges", icon: Trophy },
  { href: "/subscriptions", label: "Subscriptions", icon: Repeat },
];

const bottomNav = [
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  name,
  email,
  plan,
}: {
  name: string | null;
  email: string | null;
  plan: PlanId;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const planInfo = getPlan(plan);

  const NavLink = ({ href, label, icon: Icon }: (typeof nav)[number]) => {
    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
          active
            ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-foreground ring-1 ring-white/10"
            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
        {label}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 lg:hidden">
        <Logo />
        <button onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-card/60 backdrop-blur-xl transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-5 py-6">
          <Logo href="/dashboard" />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {nav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          <div className="my-3 border-t border-white/10" />
          {bottomNav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        {plan === "free" && (
          <div className="mx-3 mb-3 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-700/20 p-4 ring-1 ring-white/10">
            <p className="text-sm font-semibold">Upgrade to Pro</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Unlimited goals + AI assistant from €3/mo.
            </p>
            <Link href="/billing" className="btn-primary mt-3 w-full !py-2 text-xs">
              Upgrade
            </Link>
          </div>
        )}

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
              {initials(name, email)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{name || "Your account"}</p>
              <p className="truncate text-xs text-muted-foreground">{planInfo.name} plan</p>
            </div>
          </div>
          <form action={signOutAction}>
            <button className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
