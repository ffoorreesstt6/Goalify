"use client";

import { useFormState } from "react-dom";
import { ShieldCheck } from "lucide-react";
import { adminLoginAction } from "../actions";
import { Field, SubmitButton, FormMessage } from "@/components/auth/Field";
import { GlassCard } from "@/components/ui/GlassCard";
import { FloatingOrbs } from "@/components/ui/FloatingOrbs";

export default function AdminLoginPage() {
  const [state, action] = useFormState(adminLoginAction, null);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <FloatingOrbs />
      <div className="w-full max-w-md">
        <GlassCard strong>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">Admin Access</h1>
              <p className="text-xs text-muted-foreground">Restricted area</p>
            </div>
          </div>
          <form action={action} className="space-y-4">
            <Field label="Admin email" name="email" type="email" autoComplete="username" />
            <Field label="Password" name="password" type="password" autoComplete="current-password" />
            <FormMessage state={state} />
            <SubmitButton>Sign in to admin</SubmitButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
