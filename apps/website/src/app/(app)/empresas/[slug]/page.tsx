import { Suspense } from "react"
import { CompanyProfile } from "./company-profile"

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

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <div className="h-32 rounded-xl bg-muted/30 animate-pulse mb-6" />
          <div className="h-64 rounded-xl bg-muted/30 animate-pulse" />
        </div>
      }
    >
      <CompanyProfile slug={slug} />
    </Suspense>
  )
}
