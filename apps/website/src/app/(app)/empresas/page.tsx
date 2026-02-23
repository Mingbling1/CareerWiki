import { Suspense } from "react"
import { CompanyList } from "./company-list"

export const metadata = {
  title: "Empresas | Empliq",
  description:
    "Explora miles de empresas peruanas. Consulta salarios, beneficios y reseñas de empleados reales.",
}

export default function EmpresasPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
        <p className="mt-2 text-muted-foreground">
          Encuentra información de salarios, beneficios y reseñas de empresas en
          Perú.
        </p>
      </div>

      {/* Company Grid */}
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl border bg-muted/30 animate-pulse"
              />
            ))}
          </div>
        }
      >
        <CompanyList />
      </Suspense>
    </div>
  )
}
