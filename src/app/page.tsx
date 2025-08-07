// src/app/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BrandedHeroSection from '@/components/landing/BrandedHeroSection'
import KeyFeaturesShowcase from '@/components/landing/KeyFeaturesShowcase' 
import VisualWorkflow from '@/components/landing/VisualWorkflow'
import ResponsiveShowcase from '@/components/landing/ResponsiveShowcase'
import FinalCTA from '@/components/landing/FinalCTA'
import Footer from '@/components/landing/Footer'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <>
      <BrandedHeroSection />
      <KeyFeaturesShowcase /> 
      <VisualWorkflow />
      <ResponsiveShowcase />  
      <FinalCTA />
      <Footer />
    </>
  )
}