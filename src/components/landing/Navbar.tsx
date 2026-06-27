"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#ai-demo", label: "AI Demo" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-16 transition-all duration-300",
        scrolled ? "navbar-scrolled" : "navbar-transparent"
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-5 lg:px-8">
        {/* Logo — slightly smaller on mobile */}
        <Logo className="shrink-0 [&_svg]:h-4.5 [&_svg]:w-4.5 sm:[&_svg]:h-5 sm:[&_svg]:w-5" />

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900"
          >
            Log in
          </Link>
          <Link href="/signup" className="btn-navbar-cta">
            Get started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile: small CTA + hamburger */}
        <div className="flex items-center gap-2.5 md:hidden">
          <Link href="/signup" className="btn-navbar-cta">
            Get started
          </Link>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 z-40 bg-black/10 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-3 right-3 top-[calc(100%+6px)] z-50 rounded-2xl border border-gray-100 bg-white/95 p-2 shadow-soft-lg backdrop-blur-xl md:hidden">
            <nav className="flex flex-col">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  {l.label}
                </a>
              ))}
              <div className="my-1.5 border-t border-gray-100" />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Log in
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
