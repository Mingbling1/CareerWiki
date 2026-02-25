"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { use } from "react"
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Star,
  Calendar,
  ExternalLink,
  Briefcase,
  ArrowLeft,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ScrollableTabs } from "@/components/ScrollableTabs"
import { CompanyProvider, useCompany } from "./company-context"

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-foreground text-foreground"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  )
}

function CompanyHeader({ slug }: { slug: string }) {
  const { company, positions, reviews, benefits, loading, error } = useCompany()
  const pathname = usePathname()

  if (loading) {
    return (
      <div>
        {/* Skeleton back nav */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Skeleton header */}
        <div className="bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
            <div className="flex items-start gap-5">
              <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-7 w-64" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2 items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-10" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton tabs */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 border-b border-border/40">
          <div className="flex gap-6 py-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-20" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !company) {
    const name = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")

    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">{name}</h2>
        <p className="text-muted-foreground mt-2">
          {error || "Aún no tenemos información de esta empresa."}
        </p>
      </div>
    )
  }

  const basePath = `/empresas/${slug}`
  const tabs = [
    { label: "Resumen", href: basePath },
    { label: `Salarios (${positions.length})`, href: `${basePath}/salarios` },
    { label: `Reseñas (${reviews.length})`, href: `${basePath}/resenas` },
    { label: `Beneficios (${benefits.length})`, href: `${basePath}/beneficios` },
  ]

  return (
    <div>
      {/* Back Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
        <Link
          href="/empresas"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Directorio de Empresas
        </Link>
      </div>

      {/* Company Header */}
      <div className="bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <div className="flex items-start gap-5">
            {/* Logo */}
            <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">
                  {company.name}
                </h1>
                {company.isVerified && (
                  <Badge variant="secondary" className="mt-1">
                    Verificada
                  </Badge>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                {company.industry && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {company.industry}
                  </span>
                )}
                {company.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {company.location}
                  </span>
                )}
                {company.employeeCount && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {company.employeeCount.toLocaleString("es-PE")} empleados
                  </span>
                )}
                {company.foundedYear && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Fundada en {company.foundedYear}
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Sitio web
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {/* Rating */}
              {company.averageRating && (
                <div className="flex items-center gap-2 mt-3">
                  {renderStars(Math.round(company.averageRating))}
                  <span className="text-sm font-medium">
                    {company.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({company._count?.reviews || 0} reseñas)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Scrollable with arrows on mobile */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 border-b border-border/40">
        <ScrollableTabs
          tabs={tabs.map((tab) => ({
            ...tab,
            isActive:
              tab.href === basePath
                ? pathname === basePath
                : pathname.startsWith(tab.href),
          }))}
        />
      </div>
    </div>
  )
}

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default function CompanyLayout({ children, params }: LayoutProps) {
  const { slug } = use(params)

  return (
    <CompanyProvider slug={slug}>
      <CompanyHeader slug={slug} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {children}
      </div>
    </CompanyProvider>
  )
}
