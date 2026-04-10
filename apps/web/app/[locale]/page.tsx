import HeroSection from '@/components/landing/HeroSection'
import HowItWorks from '@/components/landing/HowItWorks'
import StyleShowcase from '@/components/landing/StyleShowcase'
import PricingPreview from '@/components/landing/PricingPreview'
import CTASection from '@/components/landing/CTASection'

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <HowItWorks />
      <StyleShowcase />
      <PricingPreview />
      <CTASection />
    </main>
  )
}
