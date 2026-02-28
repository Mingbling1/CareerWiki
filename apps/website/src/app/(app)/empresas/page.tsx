import { Suspense } from "react"
import { CompanyList } from "./company-list"

const SITE_URL = "https://empliq.io"

export const metadata = {
  title: "Empresas en Perú — Salarios, Reseñas y Beneficios",
  description:
    "Directorio de empresas peruanas con salarios, reseñas y beneficios reportados por empleados reales. Busca por nombre, industria o RUC.",
  alternates: {
    canonical: `${SITE_URL}/empresas`,
  },
  openGraph: {
    title: "Empresas en Perú — Salarios, Reseñas y Beneficios | Empliq",
    description:
      "Directorio de empresas peruanas con salarios, reseñas y beneficios reportados por empleados reales.",
    url: `${SITE_URL}/empresas`,
    type: "website" as const,
    siteName: "Empliq",
    locale: "es_PE",
  },
}

export default function EmpresasPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Directorio de Empresas — Empliq",
    description: "Directorio de empresas peruanas con información salarial y reseñas de empleados.",
    url: `${SITE_URL}/empresas`,
    isPartOf: {
      "@type": "WebSite",
      name: "Empliq",
      url: SITE_URL,
    },
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
        <p className="mt-2 text-muted-foreground">
          Encuentra información de salarios, beneficios y reseñas de empresas en
          Perú.
        </p>
      </div>

      {/* Company Grid */}
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl border bg-muted/30 animate-pulse"
              />
            ))}
          </div>
        }
      >
        <CompanyList />
      </Suspense>
    </div>
  )
}
