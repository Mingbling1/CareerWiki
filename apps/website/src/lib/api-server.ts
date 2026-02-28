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
 * Fetch all company slugs for sitemap generation.
 * Uses high limit to get all companies.
 */
export async function getAllCompanySlugs(): Promise<CompanySlug[]> {
  const result = await fetchServer<{ data: CompanySlug[] }>("/companies?limit=50000&fields=slug,updatedAt")
  if (!result?.data) {
    // Fallback: try without fields param
    const fallback = await fetchServer<{ data: CompanySlug[] }>("/companies?limit=50000")
    return fallback?.data || []
  }
  return result.data
}
