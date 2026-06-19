import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "EUR", locale = "en-IE") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatDate(date: string | Date, locale = "en-IE") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

export function estimateCompletionDate(
  saved: number,
  target: number,
  monthlyContribution: number
): Date | null {
  if (monthlyContribution <= 0 || saved >= target) return null;
  const remaining = target - saved;
  const months = Math.ceil(remaining / monthlyContribution);
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d;
}

export function initials(name?: string | null, email?: string | null) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "GU";
}
