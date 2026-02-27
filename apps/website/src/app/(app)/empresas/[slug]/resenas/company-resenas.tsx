"use client"

import { useCompany } from "../company-context"
import { ReviewForm } from "@/components/ReviewForm"
import { ReviewList } from "@/components/ReviewList"

export function CompanyResenas() {
  const { company, positions, reviews, loading, refetch } = useCompany()

  return (
    <div className="space-y-6">
      {/* Review Form */}
      {company && (
        <ReviewForm
          companyId={company.id}
          companyName={company.name}
          positions={positions}
          onSuccess={refetch}
        />
      )}

      {/* Reviews List */}
      <ReviewList reviews={reviews} loading={loading} />
    </div>
  )
}
