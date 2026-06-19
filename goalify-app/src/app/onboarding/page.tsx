import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Quiz } from "@/components/onboarding/Quiz";

export const metadata = { title: "Onboarding — Goalify" };

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .single();

  if (profile?.onboarded) redirect("/dashboard");

  return <Quiz />;
}
