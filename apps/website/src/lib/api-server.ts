/**
 * Server-side API helpers for SEO metadata and sitemap generation.
 * These functions are meant to be called from Server Components,
 * generateMetadata, and sitemap.ts — never from client components.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

interface CompanySEO {
  id: string
  name: string
  slug: string
  description: string | null
  industry: string | null
  employeeCount: number | null
  location: string | null
  website: string | null
  logoUrl: string | null
  foundedYear: number | null
  averageRating?: number
  _count?: {
    positions: number
    reviews: number
    benefits: number
  }
}

interface CompanySlug {
  slug: string
  updatedAt: string
  employeeCount: number | null
  hasLogo: boolean
}

async function fetchServer<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/**
 * Fetch a company by slug for SEO metadata.
 * Returns null if company not found — caller should use fallback.
 */
export async function getCompanyForSEO(slug: string): Promise<CompanySEO | null> {
  return fetchServer<CompanySEO>(`/companies/${slug}`)
}

/**
 * Fetch company slugs for sitemap generation.
 * Uses dedicated /companies/slugs endpoint.
 * Pass limit to only fetch the top N companies (ordered by employee count DESC).
 */
export async function getAllCompanySlugs(limit?: number): Promise<CompanySlug[]> {
  const params = limit ? `?limit=${limit}` : ""
  const result = await fetchServer<CompanySlug[]>(`/companies/slugs${params}`)
  return result || []
}
