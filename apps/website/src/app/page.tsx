import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { LogoCloud } from '@/components/LogoCloud'
import { IllustrationShowcase } from '@/components/IllustrationShowcase'
import { UseCases } from '@/components/UseCases'
import { Features } from '@/components/Features'
// import { Testimonials } from '@/components/Testimonials' // TODO: Habilitar cuando tengamos testimonios reales
// import { CTA } from '@/components/CTA' // TODO: Habilitar cuando tengamos más datos
import { Footer } from '@/components/Footer'
import { CookieBanner } from '@/components/CookieConsent'

// JSON-LD structured data — mejora la visibilidad en Google
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Empliq",
  url: "https://empliq.com",
  description:
    "Plataforma open-source donde profesionales peruanos comparten información real sobre salarios, puestos y organigramas de empresas.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "PEN",
  },
  creator: {
    "@type": "Organization",
    name: "Empliq",
    url: "https://empliq.com",
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD para rich snippets en Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <div className="lg:h-[calc(100vh-5rem)] lg:flex lg:flex-col">
          <Hero />
          <LogoCloud />
        </div>
        <IllustrationShowcase />
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
