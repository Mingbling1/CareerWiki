// ============================================
// API Service - Frontend
// ============================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Types
export interface Company {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  website: string | null;
  logoUrl: string | null;
  coverImage: string | null;
  culture: string | null;
  benefits: string[];
  createdAt: string;
  updatedAt: string;
  // Computed/joined data
  _count?: {
    positions: number;
  };
}

export interface Position {
  id: string;
  companyId: string;
  departmentId: string | null;
  title: string;
  description: string | null;
  level: string | null;
  requirements: string[];
  createdAt: string;
  // Computed
  _count?: {
    salaries: number;
    comments: number;
  };
  salaryStats?: {
    avg: number;
    min: number;
    max: number;
    count: number;
  };
}

export interface Salary {
  id: string;
  positionId: string;
  amount: number;
  currency: string;
  period: string;
  yearsExperience: number | null;
  createdAt: string;
}

export interface Comment {
  id: string;
  positionId: string;
  content: string;
  rating: number | null;
  pros: string | null;
  cons: string | null;
  createdAt: string;
}

// API Functions
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Companies
export async function getCompanies(): Promise<Company[]> {
  return fetchAPI<Company[]>('/companies');
}

export async function getCompanyBySlug(slug: string): Promise<Company> {
  return fetchAPI<Company>(`/companies/${slug}`);
}

// Positions
export async function getPositionsByCompany(companyId: string): Promise<Position[]> {
  return fetchAPI<Position[]>(`/positions/company/${companyId}`);
}

export async function getPositionById(id: string): Promise<Position> {
  return fetchAPI<Position>(`/positions/${id}`);
}

// Salaries
export async function getSalaryStats(positionId: string): Promise<{
  avg: number;
  min: number;
  max: number;
  median: number;
  count: number;
}> {
  return fetchAPI(`/salaries/stats/${positionId}`);
}

export async function addSalary(data: {
  positionId: string;
  amount: number;
  currency: string;
  period: string;
  yearsExperience?: number;
}): Promise<Salary> {
  return fetchAPI<Salary>('/salaries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Comments
export async function getCommentsByPosition(positionId: string): Promise<Comment[]> {
  return fetchAPI<Comment[]>(`/comments/position/${positionId}`);
}

export async function addComment(data: {
  positionId: string;
  content: string;
  rating?: number;
  pros?: string;
  cons?: string;
}): Promise<Comment> {
  return fetchAPI<Comment>('/comments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Export default API object
export const api = {
  companies: {
    getAll: getCompanies,
    getBySlug: getCompanyBySlug,
  },
  positions: {
    getByCompany: getPositionsByCompany,
    getById: getPositionById,
  },
  salaries: {
    getStats: getSalaryStats,
    add: addSalary,
  },
  comments: {
    getByPosition: getCommentsByPosition,
    add: addComment,
  },
};
