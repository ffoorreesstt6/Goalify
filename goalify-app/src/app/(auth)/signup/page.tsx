"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { signupAction } from "../actions";
import { Field, SubmitButton, FormMessage, Honeypot } from "@/components/auth/Field";
import { GlassCard } from "@/components/ui/GlassCard";

export default function SignupPage() {
  const [state, action] = useFormState(signupAction, null);

  return (
    <GlassCard strong>
      <h1 className="font-display text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Start free. No credit card required.
      </p>

      <form action={action} className="relative mt-6 space-y-4">
        <Honeypot />
        <Field label="Full name" name="fullName" autoComplete="name" placeholder="Alex Doe" />
        <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
        <p className="text-xs text-muted-foreground">
          Use 8+ characters with uppercase, lowercase and a number.
        </p>
        <FormMessage state={state} />
        <SubmitButton>Create account</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent-purple hover:underline">
          Log in
        </Link>
      </p>
    </GlassCard>
  );
}
