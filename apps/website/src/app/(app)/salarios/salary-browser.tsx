"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
  Search,
  Monitor,
  Wrench,
  DollarSign,
  Megaphone,
  Users,
  Settings,
  Scale,
  HeartPulse,
  ClipboardList,
  ChevronRight,
  Building2,
  TrendingUp,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { api, type JobCategory } from "@/lib/api"

const categoryIcons: Record<string, LucideIcon> = {
  "Tecnología": Monitor,
  "Ingeniería": Wrench,
  "Finanzas": DollarSign,
  "Marketing y Ventas": Megaphone,
  "RRHH": Users,
  "Operaciones": Settings,
  "Legal": Scale,
  "Salud": HeartPulse,
  "Administración": ClipboardList,
}

type CategoryWithPositions = JobCategory & {
  topPositions: {
    title: string
    slug: string
    medianSalary: number
    count: number
    companies: number
  }[]
}

function formatSalary(amount: number): string {
  return `S/ ${amount.toLocaleString("es-PE")}`
}

export function SalaryBrowser() {
  const [search, setSearch] = useState("")
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryWithPositions[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.categories
      .getWithPositions()
      .then((data) => {
        setCategories(data)
        // Auto-expand first category that has positions
        const first = data.find((c) => c.topPositions.length > 0)
        if (first) setExpandedCategory(first.name)
      })
      .catch(() => setError("No se pudieron cargar los datos salariales"))
      .finally(() => setLoading(false))
  }, [])

  const filteredCategories = categories.filter((cat) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    if (cat.name.toLowerCase().includes(searchLower)) return true
    return cat.topPositions.some((p) =>
      p.title.toLowerCase().includes(searchLower)
    )
  })

  const totalPositions = categories.reduce((acc, c) => acc + (c._count?.positions || 0), 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <DollarSign className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="font-medium text-muted-foreground">{error}</h3>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Intenta recargar la página
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar puesto o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Summary Banner */}
      {totalPositions > 0 && (
        <div className="rounded-xl border border-border/40 bg-card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Datos salariales de {totalPositions} puesto{totalPositions !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Reportados por empleados en {categories.length} categoría{categories.length !== 1 ? "s" : ""} profesionales
            </p>
          </div>
        </div>
      )}

      {/* Empty state when no data at all */}
      {categories.length === 0 && (
        <div className="text-center py-16">
          <DollarSign className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="font-medium text-muted-foreground">
            Aún no hay datos salariales
          </h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Sé el primero en contribuir reportando tu salario
          </p>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-3">
        {filteredCategories.map((category) => {
          const Icon: LucideIcon = categoryIcons[category.name] || ClipboardList
          const isExpanded = expandedCategory === category.name

          // filter positions if searching
          const matchedPositions = search
            ? category.topPositions.filter((p) =>
                p.title.toLowerCase().includes(search.toLowerCase())
              )
            : category.topPositions

          return (
            <div
              key={category.id}
              className="rounded-xl border border-border/40 overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() =>
                  setExpandedCategory(isExpanded ? null : category.name)
                }
                className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{category.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {category.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {category._count?.positions || 0} puestos
                  </p>
                </div>
                <ChevronRight
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </button>

              {/* Expanded Position List */}
              {isExpanded && matchedPositions.length > 0 && (
                <div className="border-t border-border/40">
                  {/* Table Header */}
                  <div className="hidden sm:grid grid-cols-4 gap-4 px-4 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                    <span className="col-span-1">Puesto</span>
                    <span className="text-right">Mediana mensual</span>
                    <span className="text-right">Reportes</span>
                    <span className="text-right">Empresas</span>
                  </div>

                  {matchedPositions.map((position, idx) => (
                    <div
                      key={position.slug}
                      className={`grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 px-4 py-3 hover:bg-muted/30 transition-colors items-center ${
                        idx < matchedPositions.length - 1 ? "border-b border-border/40" : ""
                      }`}
                    >
                      <div className="col-span-1">
                        <span className="text-sm font-medium">
                          {position.title}
                        </span>
                      </div>
                      <p className="text-sm font-semibold sm:text-right">
                        {formatSalary(position.medianSalary)}
                      </p>
                      <p className="text-xs text-muted-foreground sm:text-right">
                        {position.count} reportes
                      </p>
                      <p className="text-xs text-muted-foreground sm:text-right flex items-center gap-1 sm:justify-end">
                        <Building2 className="h-3 w-3" />
                        {position.companies}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state for expanded category with no positions */}
              {isExpanded && matchedPositions.length === 0 && (
                <div className="border-t border-border/40 px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Aún no hay datos salariales en esta categoría
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredCategories.length === 0 && search && (
        <div className="text-center py-16">
          <DollarSign className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="font-medium text-muted-foreground">
            No se encontraron resultados
          </h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      )}
    </div>
  )
}
