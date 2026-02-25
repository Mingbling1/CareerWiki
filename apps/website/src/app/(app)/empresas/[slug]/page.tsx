import { CompanyOverview } from "./company-overview"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  return {
    title: `${name} — Salarios, Reseñas y Beneficios | Empliq`,
    description: `Consulta salarios, reseñas y beneficios de ${name}. Información laboral verificada en Empliq.`,
  }
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params

  return <CompanyOverview slug={slug} />
}
