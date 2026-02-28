import { Suspense } from "react"
import { SalaryBrowser } from "./salary-browser"

const SITE_URL = "https://empliq.io"

export const metadata = {
  title: "Salarios en Perú por Categoría Profesional",
  description:
    "Explora salarios por categoría profesional en Perú. Datos salariales reportados por empleados reales, organizados por puesto, industria y experiencia.",
  alternates: {
    canonical: `${SITE_URL}/salarios`,
  },
  openGraph: {
    title: "Salarios en Perú por Categoría Profesional | Empliq",
    description:
      "Datos salariales de miles de empleados en Perú organizados por categoría profesional.",
    url: `${SITE_URL}/salarios`,
    type: "website" as const,
    siteName: "Empliq",
    locale: "es_PE",
  },
}

export default function SalariosPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Salarios en Perú — Empliq",
    description: "Datos salariales organizados por categoría profesional en Perú.",
    url: `${SITE_URL}/salarios`,
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Salarios</h1>
        <p className="mt-2 text-muted-foreground">
          Explora rangos salariales por categoría profesional y puesto en Perú.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-muted/30 animate-pulse"
              />
            ))}
          </div>
        }
      >
        <SalaryBrowser />
      </Suspense>
    </div>
  )
}
