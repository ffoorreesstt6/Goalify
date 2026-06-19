import { getProfile } from "@/lib/data";
import { SettingsView } from "@/components/app/SettingsView";

export const metadata = { title: "Settings — Goalify" };

export default async function SettingsPage() {
  const profile = await getProfile();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>
      <SettingsView profile={profile} />
    </div>
  );
}
