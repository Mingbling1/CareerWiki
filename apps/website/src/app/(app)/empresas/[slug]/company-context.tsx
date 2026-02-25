"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api, type Company, type Position, type Review, type Benefit } from "@/lib/api"

interface CompanyContextType {
  company: Company | null
  positions: Position[]
  reviews: Review[]
  benefits: Benefit[]
  loading: boolean
  error: string | null
}

const CompanyContext = createContext<CompanyContextType>({
  company: null,
  positions: [],
  reviews: [],
  benefits: [],
  loading: true,
  error: null,
})

export function useCompany() {
  return useContext(CompanyContext)
}

export function CompanyProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    api.companies
      .getBySlug(slug)
      .then(async (companyData) => {
        setCompany(companyData)

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

  return (
    <CompanyContext.Provider value={{ company, positions, reviews, benefits, loading, error }}>
      {children}
    </CompanyContext.Provider>
  )
}
