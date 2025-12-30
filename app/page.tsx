import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { WhatIsSection } from "@/components/what-is-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { TargetAudienceSection } from "@/components/target-audience-section"
import { BenefitsSection } from "@/components/benefits-section"
import { WhyAssetcareSection } from "@/components/why-assetcare-section"
import { ServicesSelectionSection } from "@/components/services-selection-section"
import { GettingStartedSection } from "@/components/getting-started-section"
import { StatsSection } from "@/components/stats-section"
import { SecuritySection } from "@/components/security-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <WhatIsSection />
      <HowItWorksSection />
      <TargetAudienceSection />
      <BenefitsSection />
      <WhyAssetcareSection />
      <ServicesSelectionSection />
      <GettingStartedSection />
      <StatsSection />
      <SecuritySection />
      <TestimonialsSection />
      <Footer />
    </main>
  )
}
