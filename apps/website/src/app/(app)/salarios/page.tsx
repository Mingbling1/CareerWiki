import { Suspense } from "react"
import { SalaryBrowser } from "./salary-browser"

export const metadata = {
  title: "Salarios en Perú | Empliq",
  description:
    "Explora salarios por categoría profesional en Perú. Datos de miles de empleados verificados.",
}

export default function SalariosPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
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
