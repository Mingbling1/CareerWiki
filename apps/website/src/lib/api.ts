const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

export interface Company {
  id: string
  ruc: string | null
  name: string
  slug: string
  description: string | null
  industry: string | null
  employeeCount: number | null
  location: string | null
  website: string | null
  logoUrl: string | null
  foundedYear: number | null
  isVerified: boolean
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  _count?: {
    positions: number
    reviews: number
    benefits: number
  }
  averageRating?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CompanySearchParams {
  page?: number
  limit?: number
  search?: string
  industry?: string
  location?: string
}

export interface Position {
  id: string
  companyId: string
  categoryId: string | null
  title: string
  slug: string
  description: string | null
  level: string | null
  createdAt: string
  company?: Company
  category?: JobCategory
  salaryStats?: {
    avg: number
    min: number
    max: number
    median: number
    count: number
  }
}

export interface Salary {
  id: string
  positionId: string
  amount: number
  currency: string
  period: string
  yearsExperience: number | null
  createdAt: string
}

export interface Review {
  id: string
  companyId: string
  positionId: string | null
  rating: number
  title: string | null
  pros: string | null
  cons: string | null
  isCurrentEmployee: boolean
  helpfulCount: number
  hasVoted?: boolean
  authorNickname: string | null
  authorAvatarUrl: string | null
  createdAt: string
}

export interface Benefit {
  id: string
  companyId: string
  name: string
  category: string | null
  description: string | null
}

export interface JobCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  _count?: {
    positions: number
  }
}

export interface Profile {
  id: string
  email: string | null
  name: string | null
  nickname: string | null
  avatarUrl: string | null
  role: string
  createdAt: string
  updatedAt: string
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function fetchAPIAuth<T>(endpoint: string, token: string, options?: RequestInit): Promise<T> {
  return fetchAPI<T>(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  })
}

export const api = {
  companies: {
    getAll: (params?: CompanySearchParams) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set("page", params.page.toString())
      if (params?.limit) searchParams.set("limit", params.limit.toString())
      if (params?.search) searchParams.set("search", params.search)
      if (params?.industry) searchParams.set("industry", params.industry)
      if (params?.location) searchParams.set("location", params.location)
      const qs = searchParams.toString()
      return fetchAPI<PaginatedResponse<Company>>(`/companies${qs ? `?${qs}` : ""}`)
    },
    getBySlug: (slug: string) => fetchAPI<Company>(`/companies/${slug}`),
  },
  positions: {
    getByCompany: (companyId: string) => fetchAPI<Position[]>(`/companies/${companyId}/positions`),
    create: (token: string, data: { companyId: string; title: string; categoryId?: string; level?: string }) =>
      fetchAPIAuth<Position>("/positions", token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  salaries: {
    getStats: (positionId: string) =>
      fetchAPI<{ avg: number; min: number; max: number; median: number; count: number }>(
        `/positions/${positionId}/salaries/stats`
      ),
    add: (token: string, positionId: string, data: { amount: number; currency: string; period: string; yearsExperience?: number }) =>
      fetchAPIAuth<Salary>(`/positions/${positionId}/salaries`, token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  reviews: {
    getByCompany: (companyId: string, token?: string) => {
      if (token) {
        return fetchAPIAuth<Review[]>(`/companies/${companyId}/reviews`, token)
      }
      return fetchAPI<Review[]>(`/companies/${companyId}/reviews`)
    },
    add: (token: string, data: { companyId: string; positionId?: string; rating: number; title?: string; pros?: string; cons?: string; isCurrentEmployee?: boolean }) =>
      fetchAPIAuth<Review>("/reviews", token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    toggleVote: (token: string, reviewId: string) =>
      fetchAPIAuth<{ voted: boolean; helpfulCount: number }>(`/reviews/${reviewId}/vote`, token, {
        method: "POST",
      }),
  },
  benefits: {
    getByCompany: (companyId: string) => fetchAPI<Benefit[]>(`/companies/${companyId}/benefits`),
    add: (token: string, data: { companyId: string; name: string; category: string; description?: string }) =>
      fetchAPIAuth<Benefit>("/benefits", token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  categories: {
    getAll: () => fetchAPI<JobCategory[]>("/categories"),
    getWithPositions: () =>
      fetchAPI<
        (JobCategory & {
          topPositions: {
            title: string
            slug: string
            medianSalary: number
            count: number
            companies: number
          }[]
        })[]
      >("/categories/with-positions"),
  },
  profiles: {
    getMe: (token: string) => fetchAPIAuth<Profile>("/profiles/me", token),
    updateAvatar: (token: string, avatarUrl: string) =>
      fetchAPIAuth<Profile>("/profiles/me/avatar", token, {
        method: "PATCH",
        body: JSON.stringify({ avatarUrl }),
      }),
    updateNickname: (token: string, nickname: string) =>
      fetchAPIAuth<Profile>("/profiles/me/nickname", token, {
        method: "PATCH",
        body: JSON.stringify({ nickname }),
      }),
  },
}
