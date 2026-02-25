"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Star,
  Calendar,
  ExternalLink,
  Briefcase,
  DollarSign,
  Heart,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Phone,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { api, type Company, type Position, type Review, type Benefit } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

function formatSalary(amount: number): string {
  return `S/ ${amount.toLocaleString("es-PE")}`
}

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

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return "Hoy"
  if (diff === 1) return "Ayer"
  if (diff < 30) return `Hace ${diff} días`
  if (diff < 365) return `Hace ${Math.floor(diff / 30)} meses`
  return `Hace ${Math.floor(diff / 365)} años`
}

export function CompanyProfile({ slug }: { slug: string }) {
  const [company, setCompany] = useState<Company | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    api.companies
      .getBySlug(slug)
      .then(async (companyData) => {
        setCompany(companyData)

        // Fetch related data in parallel
        const [posData, revData, benData] = await Promise.all([
          api.positions.getByCompany(companyData.id).catch(() => []),
          api.reviews.getByCompany(companyData.id).catch(() => []),
          api.benefits.getByCompany(companyData.id).catch(() => []),
        ])
        setPositions(posData)
        setReviews(revData)
        setBenefits(benData)
      })
      .catch(() => {
        setError("No se pudo cargar la información de esta empresa")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-start gap-5">
          <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-64" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-md" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
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
          {error || "Aún no tenemos información de esta empresa. ¡Sé el primero en contribuir!"}
        </p>
      </div>
    )
  }

  // Extract rich metadata
  const metadata = (company.metadata || {}) as Record<string, any>
  const direccion = metadata.direccion as string | undefined
  const telefonos = metadata.telefonos as string[] | undefined
  const ejecutivos = metadata.ejecutivos as Array<{ cargo: string; desde: string; nombre: string }> | undefined
  const tipoEmpresa = metadata.tipo_empresa as string | undefined
  const condicion = metadata.condicion as string | undefined
  const estado = metadata.estado as string | undefined
  const actividadCiiu = metadata.actividad_ciiu as string | undefined
  const razonSocial = metadata.razon_social as string | undefined

  // Group benefits by category
  const benefitsByCategory = benefits.reduce(
    (acc, benefit) => {
      const cat = benefit.category || "Otros"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(benefit)
      return acc
    },
    {} as Record<string, typeof benefits>
  )

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

      {/* Tabs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="line" className="w-full justify-start">
            <TabsTrigger value="overview">
              Resumen
            </TabsTrigger>
            <TabsTrigger value="salarios">
              Salarios ({positions.length})
            </TabsTrigger>
            <TabsTrigger value="resenas">
              Reseñas ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="beneficios">
              Beneficios ({benefits.length})
            </TabsTrigger>
          </TabsList>

          {/* ===== OVERVIEW TAB ===== */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-8">
                {/* About */}
                {company.description && (
                  <section>
                    <h2 className="text-lg font-semibold mb-3">
                      Acerca de {company.name}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {company.description}
                    </p>
                  </section>
                )}

                {/* Top Salaries */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                      Salarios más reportados
                    </h2>
                    <button
                      onClick={() => setActiveTab("salarios")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      Ver todos
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {positions.slice(0, 3).map((pos) => (
                      <div
                        key={pos.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <h3 className="text-sm font-medium">{pos.title}</h3>
                          {pos.level && (
                            <span className="text-xs text-muted-foreground">
                              {pos.level}
                            </span>
                          )}
                        </div>
                        {pos.salaryStats && (
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              {formatSalary(pos.salaryStats.median)}
                              <span className="text-xs text-muted-foreground font-normal">
                                /mes
                              </span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatSalary(pos.salaryStats.min)} —{" "}
                              {formatSalary(pos.salaryStats.max)}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Recent Reviews */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Reseñas recientes</h2>
                    <button
                      onClick={() => setActiveTab("resenas")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      Ver todas
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.slice(0, 2).map((review) => (
                        <div key={review.id} className="p-4 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {renderStars(review.rating)}
                              {review.isCurrentEmployee && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  Empleado actual
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {timeAgo(review.createdAt)}
                            </span>
                          </div>
                          {review.title && (
                            <h4 className="text-sm font-medium mb-2">
                              {review.title}
                            </h4>
                          )}
                          {review.pros && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                Pros:{" "}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {review.pros}
                              </span>
                            </div>
                          )}
                          {review.cons && (
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">
                                Contras:{" "}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {review.cons}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!
                    </p>
                  )}
                </section>

                {/* Ejecutivos / Representantes */}
                {ejecutivos && ejecutivos.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold mb-4">
                      Representantes legales
                    </h2>
                    <div className="space-y-2">
                      {ejecutivos.slice(0, 6).map((ej, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                        >
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {ej.nombre.toLowerCase()}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {ej.cargo.toLowerCase()}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Desde {ej.desde}
                          </span>
                        </div>
                      ))}
                      {ejecutivos.length > 6 && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          +{ejecutivos.length - 6} más representantes
                        </p>
                      )}
                    </div>
                  </section>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="rounded-xl bg-muted/30 p-5 space-y-4">
                  <h3 className="font-semibold text-sm">Datos clave</h3>
                  <div className="space-y-3">
                    {razonSocial && (
                      <>
                        <div className="flex items-start justify-between text-sm gap-2">
                          <span className="text-muted-foreground shrink-0">Razón Social</span>
                          <span className="text-right text-xs">{razonSocial}</span>
                        </div>
                        <Separator />
                      </>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">RUC</span>
                      <span className="font-mono text-xs">
                        {company.ruc || "—"}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Industria</span>
                      <span className="text-right text-xs max-w-45">{company.industry || "—"}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Empleados</span>
                      <span>
                        {company.employeeCount
                          ? company.employeeCount.toLocaleString("es-PE")
                          : "—"}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Fundación</span>
                      <span>{company.foundedYear || "—"}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Ubicación</span>
                      <span className="text-right text-xs max-w-45">{company.location || "—"}</span>
                    </div>
                    {tipoEmpresa && (
                      <>
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Tipo</span>
                          <span className="text-right text-xs max-w-45">{tipoEmpresa}</span>
                        </div>
                      </>
                    )}
                    {condicion && (
                      <>
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Condición</span>
                          <Badge variant={condicion === "HABIDO" ? "secondary" : "outline"} className="text-[10px]">
                            {condicion}
                          </Badge>
                        </div>
                      </>
                    )}
                    {estado && (
                      <>
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Estado</span>
                          <Badge variant={estado === "ACTIVO" ? "secondary" : "outline"} className="text-[10px]">
                            {estado}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Address */}
                {direccion && (
                  <div className="rounded-xl bg-muted/30 p-5">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Dirección
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {direccion}
                    </p>
                  </div>
                )}

                {/* Phone numbers */}
                {telefonos && telefonos.length > 0 && (
                  <div className="rounded-xl bg-muted/30 p-5">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Teléfonos
                    </h3>
                    <div className="space-y-1">
                      {telefonos.map((tel, i) => (
                        <p key={i} className="text-xs text-muted-foreground font-mono">
                          {tel}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Benefits */}
                {benefits.length > 0 && (
                  <div className="rounded-xl bg-muted/30 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-sm">Beneficios</h3>
                      <button
                        onClick={() => setActiveTab("beneficios")}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Ver todos
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {benefits.slice(0, 6).map((benefit) => (
                        <Badge key={benefit.id} variant="secondary" className="text-xs">
                          {benefit.name}
                        </Badge>
                      ))}
                      {benefits.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{benefits.length - 6} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ===== SALARIOS TAB ===== */}
          <TabsContent value="salarios" className="mt-6">
            <div className="space-y-2">
              <div className="hidden sm:grid grid-cols-5 gap-4 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span className="col-span-2">Puesto</span>
                <span className="text-right">Mediana</span>
                <span className="text-right">Rango</span>
                <span className="text-right">Reportes</span>
              </div>
              {positions.map((pos) => (
                <div
                  key={pos.id}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors items-center"
                >
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium">{pos.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {pos.level && (
                        <Badge variant="outline" className="text-[10px]">
                          {pos.level}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {pos.salaryStats ? (
                    <>
                      <p className="text-sm font-semibold sm:text-right">
                        {formatSalary(pos.salaryStats.median)}
                      </p>
                      <p className="text-xs text-muted-foreground sm:text-right">
                        {formatSalary(pos.salaryStats.min)} —{" "}
                        {formatSalary(pos.salaryStats.max)}
                      </p>
                      <p className="text-xs text-muted-foreground sm:text-right">
                        {pos.salaryStats.count} reportes
                      </p>
                    </>
                  ) : (
                    <p className="col-span-3 text-xs text-muted-foreground sm:text-right">
                      Sin datos aún
                    </p>
                  )}
                </div>
              ))}
              {positions.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Aún no hay salarios reportados para esta empresa.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ===== RESEÑAS TAB ===== */}
          <TabsContent value="resenas" className="mt-6">
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-5 rounded-xl bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {renderStars(review.rating)}
                      <span className="text-sm font-semibold">
                        {review.rating}/5
                      </span>
                      {review.isCurrentEmployee && (
                        <Badge variant="outline" className="text-[10px]">
                          Empleado actual
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(review.createdAt)}
                    </span>
                  </div>

                  {review.title && (
                    <h4 className="font-medium mb-3">{review.title}</h4>
                  )}

                  {review.pros && (
                    <div className="mb-3">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Pros
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.pros}
                      </p>
                    </div>
                  )}

                  {review.cons && (
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Contras
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.cons}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="text-center py-12">
                  <Star className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Aún no hay reseñas para esta empresa.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ===== BENEFICIOS TAB ===== */}
          <TabsContent value="beneficios" className="mt-6">
            {Object.keys(benefitsByCategory).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(benefitsByCategory).map(([category, items]) => (
                  <section key={category}>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      {category}
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {items.map((benefit) => (
                        <div
                          key={benefit.id}
                          className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <h4 className="text-sm font-medium">
                            {benefit.name}
                          </h4>
                          {benefit.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {benefit.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Aún no hay beneficios registrados para esta empresa.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
