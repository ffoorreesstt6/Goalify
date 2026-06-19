import { getProfile, getGoals } from "@/lib/data";
import { GoalsManager } from "@/components/app/GoalsManager";

export const metadata = { title: "Goals — Goalify" };

export default async function GoalsPage() {
  const [profile, goals] = await Promise.all([getProfile(), getGoals()]);
  return <GoalsManager goals={goals} plan={profile.plan} />;
}
