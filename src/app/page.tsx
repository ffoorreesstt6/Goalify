import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { AIDemo } from "@/components/landing/AIDemo";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { Security } from "@/components/landing/Security";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      <Navbar />
      <Hero />
      <Features />
      <AIDemo />
      <Pricing />
      <Testimonials />
      <Security />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
