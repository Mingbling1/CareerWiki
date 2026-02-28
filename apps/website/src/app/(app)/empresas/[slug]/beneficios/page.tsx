import type { Metadata } from "next"
import { getCompanyForSEO } from "@/lib/api-server"
import { CompanyBeneficios } from "./company-beneficios"

const SITE_URL = "https://empliq.io"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const company = await getCompanyForSEO(slug)
  const fallbackName = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  const name = company?.name || fallbackName
  const benefitCount = company?._count?.benefits || 0
  const url = `${SITE_URL}/empresas/${slug}/beneficios`

  const description = benefitCount > 0
    ? `${benefitCount} beneficios reportados en ${name}. Descubre lo que ofrecen a sus empleados.`
    : `Descubre los beneficios laborales que ofrece ${name}. Información reportada por empleados reales.`

  return {
    title: `Beneficios en ${name}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `Beneficios en ${name} | Empliq`,
      description,
      url,
      type: "website",
      siteName: "Empliq",
      locale: "es_PE",
    },
  }
}

export default async function BeneficiosPage() {
  return <CompanyBeneficios />
}
