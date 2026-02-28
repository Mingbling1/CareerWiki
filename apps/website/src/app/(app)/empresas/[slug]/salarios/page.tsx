import type { Metadata } from "next"
import { getCompanyForSEO } from "@/lib/api-server"
import { CompanySalarios } from "./company-salarios"

const SITE_URL = "https://empliq.io"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const company = await getCompanyForSEO(slug)
  const fallbackName = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  const name = company?.name || fallbackName
  const positionCount = company?._count?.positions || 0
  const url = `${SITE_URL}/empresas/${slug}/salarios`

  const description = positionCount > 0
    ? `Salarios en ${name}: ${positionCount} puestos con datos salariales reportados por empleados. Rangos, medianas y tendencias.`
    : `Consulta los salarios reportados en ${name}. Rangos salariales por puesto y nivel de experiencia.`

  return {
    title: `Salarios en ${name}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `Salarios en ${name} | Empliq`,
      description,
      url,
      type: "website",
      siteName: "Empliq",
      locale: "es_PE",
    },
  }
}

export default async function SalariosPage() {
  return <CompanySalarios />
}
