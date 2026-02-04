import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { LogoCloud } from '@/components/LogoCloud'
import { UseCases } from '@/components/UseCases'
import { Features } from '@/components/Features'
// import { Testimonials } from '@/components/Testimonials' // TODO: Habilitar cuando tengamos testimonios reales
// import { CTA } from '@/components/CTA' // TODO: Habilitar cuando tengamos más datos
import { Footer } from '@/components/Footer'
import { CookieBanner } from '@/components/CookieConsent'

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main>
        <Hero />
        <LogoCloud />
        <UseCases />
        <Features />
        {/* <Testimonials /> TODO: Habilitar cuando tengamos testimonios reales */}
        {/* <CTA /> TODO: Habilitar cuando tengamos más datos */}
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}
