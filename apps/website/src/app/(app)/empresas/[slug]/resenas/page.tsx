import { CompanyResenas } from "./company-resenas"

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
    title: `Reseñas de ${name} | Empliq`,
    description: `Lee reseñas de empleados actuales y anteriores de ${name}. Opiniones reales sobre cultura, salarios y ambiente laboral.`,
  }
}

export default async function ResenasPage() {
  return <CompanyResenas />
}
