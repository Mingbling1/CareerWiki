import { CompanySalarios } from "./company-salarios"

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
    title: `Salarios en ${name} | Empliq`,
    description: `Consulta los salarios reportados en ${name}. Rangos salariales por puesto y nivel de experiencia.`,
  }
}

export default async function SalariosPage() {
  return <CompanySalarios />
}
