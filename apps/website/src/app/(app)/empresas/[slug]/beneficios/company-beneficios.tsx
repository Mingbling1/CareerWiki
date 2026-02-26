"use client"

import { Heart } from "lucide-react"
import { useCompany } from "../company-context"
import { BenefitForm } from "@/components/BenefitForm"

export function CompanyBeneficios() {
  const { company, benefits, refetch } = useCompany()

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
    <div className="space-y-6">
      {/* Benefit Form */}
      {company && (
        <BenefitForm
          companyId={company.id}
          companyName={company.name}
          onSuccess={refetch}
        />
      )}

      {/* Benefits List */}
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
    </div>
  )
}
