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
import { Badge } from "@/components/ui/badge"
import { api, type JobCategory, type Position } from "@/lib/api"

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

// Mock categories with salary data
const mockCategories: (JobCategory & {
  topPositions: {
    title: string
    slug: string
    medianSalary: number
    count: number
    companies: number
  }[]
})[] = [
  {
    id: "c1",
    name: "Tecnología",
    slug: "tecnologia",
    description: "Desarrollo de software, infraestructura, datos y producto digital.",
    icon: "Monitor",
    _count: { positions: 156 },
    topPositions: [
      { title: "Desarrollador Full Stack", slug: "desarrollador-full-stack", medianSalary: 7500, count: 245, companies: 42 },
      { title: "Ingeniero DevOps", slug: "ingeniero-devops", medianSalary: 9200, count: 87, companies: 28 },
      { title: "Analista de Datos", slug: "analista-de-datos", medianSalary: 6800, count: 178, companies: 35 },
      { title: "Desarrollador Frontend", slug: "desarrollador-frontend", medianSalary: 6500, count: 198, companies: 40 },
      { title: "Desarrollador Backend", slug: "desarrollador-backend", medianSalary: 7800, count: 165, companies: 38 },
      { title: "Tech Lead", slug: "tech-lead", medianSalary: 12000, count: 45, companies: 20 },
    ],
  },
  {
    id: "c2",
    name: "Finanzas",
    slug: "finanzas",
    description: "Contabilidad, análisis financiero, auditoría y tesorería.",
    icon: "DollarSign",
    _count: { positions: 89 },
    topPositions: [
      { title: "Analista Financiero", slug: "analista-financiero", medianSalary: 5500, count: 312, companies: 55 },
      { title: "Controller Financiero", slug: "controller-financiero", medianSalary: 11000, count: 42, companies: 25 },
      { title: "Contador General", slug: "contador-general", medianSalary: 6200, count: 198, companies: 48 },
      { title: "Tesorero", slug: "tesorero", medianSalary: 7500, count: 56, companies: 22 },
      { title: "Auditor Interno", slug: "auditor-interno", medianSalary: 5800, count: 124, companies: 35 },
    ],
  },
  {
    id: "c3",
    name: "Marketing y Ventas",
    slug: "marketing-y-ventas",
    description: "Marketing digital, branding, ventas y desarrollo comercial.",
    icon: "Megaphone",
    _count: { positions: 72 },
    topPositions: [
      { title: "Gerente de Marketing", slug: "gerente-de-marketing", medianSalary: 9500, count: 67, companies: 30 },
      { title: "Ejecutivo de Ventas", slug: "ejecutivo-de-ventas", medianSalary: 4500, count: 420, companies: 65 },
      { title: "Community Manager", slug: "community-manager", medianSalary: 3200, count: 156, companies: 42 },
      { title: "Brand Manager", slug: "brand-manager", medianSalary: 8000, count: 45, companies: 18 },
    ],
  },
  {
    id: "c4",
    name: "Ingeniería",
    slug: "ingenieria",
    description: "Ingeniería civil, mecánica, eléctrica, industrial y minera.",
    icon: "Wrench",
    _count: { positions: 95 },
    topPositions: [
      { title: "Ingeniero de Minas", slug: "ingeniero-de-minas", medianSalary: 12000, count: 89, companies: 15 },
      { title: "Ingeniero Civil", slug: "ingeniero-civil", medianSalary: 7500, count: 134, companies: 28 },
      { title: "Ingeniero Industrial", slug: "ingeniero-industrial", medianSalary: 6800, count: 178, companies: 35 },
      { title: "Ingeniero Eléctrico", slug: "ingeniero-electrico", medianSalary: 8200, count: 67, companies: 20 },
    ],
  },
  {
    id: "c5",
    name: "RRHH",
    slug: "recursos-humanos",
    description: "Gestión del talento, compensaciones, cultura y desarrollo organizacional.",
    icon: "Users",
    _count: { positions: 48 },
    topPositions: [
      { title: "Gerente de RRHH", slug: "gerente-de-rrhh", medianSalary: 10000, count: 56, companies: 30 },
      { title: "Analista de Compensaciones", slug: "analista-de-compensaciones", medianSalary: 5800, count: 89, companies: 25 },
      { title: "Recruiter", slug: "recruiter", medianSalary: 4500, count: 145, companies: 40 },
      { title: "Business Partner RRHH", slug: "business-partner-rrhh", medianSalary: 8500, count: 42, companies: 22 },
    ],
  },
  {
    id: "c6",
    name: "Operaciones",
    slug: "operaciones",
    description: "Logística, cadena de suministro, producción y procesos.",
    icon: "Settings",
    _count: { positions: 63 },
    topPositions: [
      { title: "Gerente de Operaciones", slug: "gerente-de-operaciones", medianSalary: 11000, count: 45, companies: 22 },
      { title: "Jefe de Logística", slug: "jefe-de-logistica", medianSalary: 7200, count: 78, companies: 30 },
      { title: "Supervisor de Producción", slug: "supervisor-de-produccion", medianSalary: 5500, count: 112, companies: 25 },
    ],
  },
  {
    id: "c7",
    name: "Legal",
    slug: "legal",
    description: "Asesoría legal, compliance, propiedad intelectual y regulatorio.",
    icon: "Scale",
    _count: { positions: 35 },
    topPositions: [
      { title: "Abogado Senior", slug: "abogado-senior", medianSalary: 9000, count: 56, companies: 25 },
      { title: "Jefe Legal", slug: "jefe-legal", medianSalary: 12000, count: 34, companies: 20 },
      { title: "Analista de Compliance", slug: "analista-de-compliance", medianSalary: 6500, count: 67, companies: 22 },
    ],
  },
  {
    id: "c8",
    name: "Salud",
    slug: "salud",
    description: "Medicina, enfermería, farmacología y salud ocupacional.",
    icon: "HeartPulse",
    _count: { positions: 42 },
    topPositions: [
      { title: "Médico Ocupacional", slug: "medico-ocupacional", medianSalary: 8000, count: 78, companies: 18 },
      { title: "Enfermero/a", slug: "enfermero", medianSalary: 3500, count: 145, companies: 15 },
      { title: "Farmacéutico", slug: "farmaceutico", medianSalary: 5000, count: 89, companies: 12 },
    ],
  },
  {
    id: "c9",
    name: "Administración",
    slug: "administracion",
    description: "Asistentes administrativos, recepción y gestión de oficinas.",
    icon: "ClipboardList",
    _count: { positions: 38 },
    topPositions: [
      { title: "Asistente Ejecutivo", slug: "asistente-ejecutivo", medianSalary: 4000, count: 198, companies: 55 },
      { title: "Administrador de Oficina", slug: "administrador-de-oficina", medianSalary: 4500, count: 134, companies: 40 },
      { title: "Recepcionista", slug: "recepcionista", medianSalary: 2500, count: 210, companies: 50 },
    ],
  },
]

function formatSalary(amount: number): string {
  return `S/ ${amount.toLocaleString("es-PE")}`
}

export function SalaryBrowser() {
  const [search, setSearch] = useState("")
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    "Tecnología"
  )

  const filteredCategories = mockCategories.filter((cat) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    if (cat.name.toLowerCase().includes(searchLower)) return true
    return cat.topPositions.some((p) =>
      p.title.toLowerCase().includes(searchLower)
    )
  })

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
      <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">
            Datos salariales de {mockCategories.reduce((acc, c) => acc + (c._count?.positions || 0), 0)}+ puestos
          </p>
          <p className="text-xs text-muted-foreground">
            Reportados por empleados en {mockCategories.length} categorías profesionales
          </p>
        </div>
      </div>

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
              className="rounded-xl border overflow-hidden"
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
                <div className="border-t">
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
                        idx < matchedPositions.length - 1 ? "border-b" : ""
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
            </div>
          )
        })}
      </div>

      {filteredCategories.length === 0 && (
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
