"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  required = true,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className="input-premium text-sm"
      />
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn("btn-primary w-full", pending && "opacity-70")}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function FormMessage({ state }: { state: { error?: string; success?: string } | null }) {
  if (!state) return null;
  if (state.error)
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
        {state.error}
      </p>
    );
  if (state.success)
    return (
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-600">
        {state.success}
      </p>
    );
  return null;
}

/** Honeypot field — hidden from humans, catches bots. */
export function Honeypot() {
  return (
    <div className="absolute left-[-9999px]" aria-hidden="true">
      <label>
        Company
        <input name="company" type="text" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
