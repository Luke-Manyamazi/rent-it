import { Hero } from '@/features/landing/components/Hero'
import { TrustFeatures } from '@/features/landing/components/TrustFeatures'
import { HowItWorks } from '@/features/landing/components/HowItWorks'
import { VerifiedBeforeYouTravel } from '@/features/landing/components/VerifiedBeforeYouTravel'
import { AudienceSplit } from '@/features/landing/components/AudienceSplit'
import { FinalCta } from '@/features/landing/components/FinalCta'

export function LandingPage() {
  return (
    <>
      <Hero />
      <TrustFeatures />
      <HowItWorks />
      <VerifiedBeforeYouTravel />
      <AudienceSplit />
      <FinalCta />
    </>
  )
}
