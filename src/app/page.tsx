import { Navbar } from '@/components/shared/navbar'
import {
  HeroSection,
  HighlightsSection,
  HowItWorksSection,
  WhyChooseUsSection,
  PricingSection,
  AboutSection,
  FAQSection,
  ContactSection,
  WaitlistSection,
  LandingFooter,
} from '@/components/landing'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="landing" />
      <main>
        <HeroSection />
        <HighlightsSection />
        <HowItWorksSection />
        <WhyChooseUsSection />
        <PricingSection />
        <WaitlistSection />
        <AboutSection />
        <FAQSection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  )
}
