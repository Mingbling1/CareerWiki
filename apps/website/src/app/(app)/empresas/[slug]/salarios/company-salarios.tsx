"use client"

import { DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCompany } from "../company-context"
import { SalaryForm } from "@/components/SalaryForm"

function formatSalary(amount: number): string {
  return `S/ ${amount.toLocaleString("es-PE")}`
}

export function CompanySalarios() {
  const { company, positions, refetch } = useCompany()

  return (
    <div className="space-y-6">
      {/* Salary Form */}
      {company && (
        <SalaryForm
          companyId={company.id}
          companyName={company.name}
          positions={positions}
          onSuccess={refetch}
        />
      )}

      {/* Salary Table */}
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
    </div>
  )
}
