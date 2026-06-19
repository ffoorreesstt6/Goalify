import { getProfile } from "@/lib/data";
import { AICoach } from "@/components/app/AICoach";

export const metadata = { title: "AI Coach — Goalify" };

export default async function AIPage() {
  const profile = await getProfile();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">AI Coach</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalized financial coaching powered by AI.
        </p>
      </div>
      <AICoach plan={profile.plan} />
    </div>
  );
}
