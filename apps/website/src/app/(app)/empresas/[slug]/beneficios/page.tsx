import { CompanyBeneficios } from "./company-beneficios"

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
    title: `Beneficios en ${name} | Empliq`,
    description: `Descubre los beneficios laborales que ofrece ${name}. Información reportada por empleados reales.`,
  }
}

export default async function BeneficiosPage() {
  return <CompanyBeneficios />
}
