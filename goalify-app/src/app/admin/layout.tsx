export const metadata = { title: "Admin — Goalify" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
