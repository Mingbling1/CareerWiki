"use client"

import Link from "next/link"
import {
  Building2,
  MapPin,
  ChevronRight,
  Star,
  Phone,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCompany } from "./company-context"

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

export function CompanyOverview({ slug }: { slug: string }) {
  const { company, positions, reviews, benefits } = useCompany()

  if (!company) return null

  const metadata = (company.metadata || {}) as Record<string, any>
  const direccion = metadata.direccion as string | undefined
  const telefonos = metadata.telefonos as string[] | undefined
  const ejecutivos = metadata.ejecutivos as Array<{ cargo: string; desde: string; nombre: string }> | undefined
  const tipoEmpresa = metadata.tipo_empresa as string | undefined
  const condicion = metadata.condicion as string | undefined
  const estado = metadata.estado as string | undefined
  const razonSocial = metadata.razon_social as string | undefined

  const basePath = `/empresas/${slug}`

  return (
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
              Salarios mas reportados
            </h2>
            <Link
              href={`${basePath}/salarios`}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Ver todos
              <ChevronRight className="h-3 w-3" />
            </Link>
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
            <Link
              href={`${basePath}/resenas`}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Ver todas
              <ChevronRight className="h-3 w-3" />
            </Link>
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
                  +{ejecutivos.length - 6} mas representantes
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
                  <span className="text-muted-foreground shrink-0">Razon Social</span>
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
              <span className="text-muted-foreground">Fundacion</span>
              <span>{company.foundedYear || "—"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Ubicacion</span>
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
                  <span className="text-muted-foreground">Condicion</span>
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
              Direccion
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
              Telefonos
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
              <Link
                href={`${basePath}/beneficios`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Ver todos
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {benefits.slice(0, 6).map((benefit) => (
                <Badge key={benefit.id} variant="secondary" className="text-xs">
                  {benefit.name}
                </Badge>
              ))}
              {benefits.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{benefits.length - 6} mas
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
