import type { Metadata } from "next"
import { getCompanyForSEO } from "@/lib/api-server"
import { CompanyOverview } from "./company-overview"

const SITE_URL = "https://empliq.io"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const company = await getCompanyForSEO(slug)

  // Fallback name from slug
  const fallbackName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  const name = company?.name || fallbackName
  const reviewCount = company?._count?.reviews || 0
  const salaryCount = company?._count?.positions || 0
  const benefitCount = company?._count?.benefits || 0

  // Build rich description
  const parts: string[] = []
  if (salaryCount > 0) parts.push(`${salaryCount} salarios reportados`)
  if (reviewCount > 0) parts.push(`${reviewCount} reseñas de empleados`)
  if (benefitCount > 0) parts.push(`${benefitCount} beneficios`)
  if (company?.location) parts.push(company.location)

  const description = parts.length > 0
    ? `${name}: ${parts.join(", ")}. Información laboral verificada en Empliq.`
    : `Consulta salarios, reseñas y beneficios de ${name}. Información laboral verificada en Empliq.`

  const url = `${SITE_URL}/empresas/${slug}`

  return {
    title: `${name} — Salarios, Reseñas y Beneficios`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${name} — Salarios, Reseñas y Beneficios | Empliq`,
      description,
      url,
      type: "website",
      siteName: "Empliq",
      locale: "es_PE",
      ...(company?.logoUrl && {
        images: [{ url: company.logoUrl, width: 200, height: 200, alt: name }],
      }),
    },
    twitter: {
      card: "summary",
      title: `${name} — Salarios y Reseñas | Empliq`,
      description,
    },
  }
}

function CompanyJsonLd({ slug }: { slug: string }) {
  // JSON-LD is rendered server-side inline; the actual data comes from
  // the client context. We inject a script tag that the client hydrates.
  // For true SSR JSON-LD we'd need a server fetch here, but since the layout
  // is "use client", we use generateMetadata above for search engines.
  return null
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params
  const company = await getCompanyForSEO(slug)

  // JSON-LD structured data (server-rendered for SEO)
  const jsonLd = company
    ? {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: company.name,
        url: company.website || `${SITE_URL}/empresas/${slug}`,
        ...(company.logoUrl && { logo: company.logoUrl }),
        ...(company.location && {
          address: {
            "@type": "PostalAddress",
            addressLocality: company.location,
            addressCountry: "PE",
          },
        }),
        ...(company.description && { description: company.description }),
        ...(company.foundedYear && { foundingDate: String(company.foundedYear) }),
        ...(company.employeeCount && {
          numberOfEmployees: {
            "@type": "QuantitativeValue",
            value: company.employeeCount,
          },
        }),
        ...(company.averageRating &&
          company._count?.reviews && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: company.averageRating,
              bestRating: 5,
              worstRating: 1,
              reviewCount: company._count.reviews,
            },
          }),
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CompanyOverview slug={slug} />
    </>
  )
}
