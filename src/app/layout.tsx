import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Goalify — Turn Every Euro Into Progress",
  description:
    "AI-powered personal finance & goal-tracking. Track spending, reach goals faster, and get AI financial coaching.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Goalify — Turn Every Euro Into Progress",
    description:
      "AI-powered personal finance & goal-tracking. Track spending, reach goals faster, and get AI financial coaching.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="bg-white font-sans antialiased">{children}</body>
    </html>
  );
}
