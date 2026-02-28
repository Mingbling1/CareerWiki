import type { Metadata } from "next"
import { getCompanyForSEO } from "@/lib/api-server"
import { CompanyResenas } from "./company-resenas"

const SITE_URL = "https://empliq.io"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const company = await getCompanyForSEO(slug)
  const fallbackName = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  const name = company?.name || fallbackName
  const reviewCount = company?._count?.reviews || 0
  const url = `${SITE_URL}/empresas/${slug}/resenas`

  const ratingText = company?.averageRating ? ` Calificación: ${company.averageRating.toFixed(1)}/5.` : ""
  const description = reviewCount > 0
    ? `${reviewCount} reseñas de empleados en ${name}.${ratingText} Opiniones reales sobre cultura, salarios y ambiente laboral.`
    : `Lee reseñas de empleados actuales y anteriores de ${name}. Opiniones reales sobre cultura, salarios y ambiente laboral.`

  return {
    title: `Reseñas de ${name}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `Reseñas de ${name} | Empliq`,
      description,
      url,
      type: "website",
      siteName: "Empliq",
      locale: "es_PE",
    },
  }
}

export default async function ResenasPage() {
  return <CompanyResenas />
}
