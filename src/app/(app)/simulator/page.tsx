import { getProfile } from "@/lib/data";
import { Simulator } from "@/components/app/Simulator";

export const metadata = { title: "Future Simulator — Goalify" };

export default async function SimulatorPage() {
  const profile = await getProfile();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Future Simulator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Model your savings, goal completion dates and financial growth.
        </p>
      </div>
      <Simulator defaultIncome={profile.monthly_income || 2000} />
    </div>
  );
}
