import { getProfile, getUserOrRedirect } from "@/lib/data";
import { ChallengesView } from "@/components/app/ChallengesView";
import { RoastCard } from "@/components/app/RoastCard";
import type { Challenge } from "@/lib/types";

export const metadata = { title: "Challenges — Goalify" };

export default async function ChallengesPage() {
  const profile = await getProfile();
  const { user, supabase } = await getUserOrRedirect();
  const { data } = await supabase
    .from("challenges")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Challenges</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build better money habits, earn XP, badges and achievements.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChallengesView active={(data as Challenge[]) ?? []} xp={profile.xp} />
        </div>
        <div>
          <RoastCard />
        </div>
      </div>
    </div>
  );
}
