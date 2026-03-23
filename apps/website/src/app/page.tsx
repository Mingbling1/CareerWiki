import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { LogoCloud } from '@/components/LogoCloud'
import { PlatformStats } from '@/components/PlatformStats'
import { IllustrationShowcase } from '@/components/IllustrationShowcase'
import { UseCases } from '@/components/UseCases'
import { Features } from '@/components/Features'
// import { Testimonials } from '@/components/Testimonials' // TODO: Habilitar cuando tengamos testimonios reales
// import { CTA } from '@/components/CTA' // TODO: Habilitar cuando tengamos mas datos
import { Footer } from '@/components/Footer'
import { CookieBanner } from '@/components/CookieConsent'
import { getPlatformStats } from '@/lib/api-server'

// Fallback stats in case the API is down
const FALLBACK_STATS = {
  companies: 85000,
  reviews: 0,
  salaries: 0,
  benefits: 0,
  positions: 0,
  updatedAt: new Date().toISOString(),
}

export default async function Home() {
  const stats = (await getPlatformStats()) ?? FALLBACK_STATS

  // JSON-LD structured data — enriched with live stats
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Empliq",
    url: "https://empliq.io",
    description:
      "Plataforma open-source donde profesionales peruanos comparten informacion real sobre salarios, puestos y organigramas de empresas.",
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
      url: "https://empliq.io",
    },
    aggregateRating: stats.reviews > 0
      ? {
          "@type": "AggregateRating",
          ratingCount: stats.reviews,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    // Custom extension: platform statistics for search engines
    ...(stats.companies > 0 && {
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Total Companies",
          value: stats.companies,
        },
        {
          "@type": "PropertyValue",
          name: "Total Salary Reports",
          value: stats.salaries,
        },
        {
          "@type": "PropertyValue",
          name: "Total Reviews",
          value: stats.reviews,
        },
      ],
    }),
  }

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
        <PlatformStats
          companies={stats.companies}
          reviews={stats.reviews}
          salaries={stats.salaries}
          benefits={stats.benefits}
        />
        <IllustrationShowcase />
        <UseCases />
        <Features />
        {/* <Testimonials /> TODO: Habilitar cuando tengamos testimonios reales */}
        {/* <CTA /> TODO: Habilitar cuando tengamos mas datos */}
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}
