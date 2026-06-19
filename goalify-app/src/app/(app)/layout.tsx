import { redirect } from "next/navigation";
import { getProfile } from "@/lib/data";
import { Sidebar } from "@/components/app/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  // Force onboarding before using the app.
  if (!profile.onboarded) redirect("/onboarding");

  return (
    <div className="relative min-h-screen">
      <Sidebar name={profile.full_name} email={profile.email} plan={profile.plan} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
