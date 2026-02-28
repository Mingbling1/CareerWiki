import type { MetadataRoute } from "next";
import { getAllCompanySlugs } from "@/lib/api-server";

/**
 * Sitemap Index — Next.js genera /sitemap/0.xml, /sitemap/1.xml, etc.
 *
 * Con ~25,000 empresas × 4 sub-páginas = ~100,000 URLs.
 * El límite por archivo sitemap es 50,000 URLs.
 * Usamos chunks de 10,000 empresas (= 40,004 URLs con estáticas).
 *
 * generateSitemaps() retorna los IDs de cada chunk.
 * sitemap({id}) genera el contenido de cada chunk.
 */

const COMPANIES_PER_SITEMAP = 10000;

// Cache the slugs across generateSitemaps() and sitemap() calls in the same build
let cachedSlugs: { slug: string; updatedAt: string }[] | null = null;

async function getSlugs() {
  if (!cachedSlugs) {
    cachedSlugs = await getAllCompanySlugs();
  }
  return cachedSlugs;
}

export async function generateSitemaps() {
  const slugs = await getSlugs();
  const totalChunks = Math.max(1, Math.ceil(slugs.length / COMPANIES_PER_SITEMAP));
  return Array.from({ length: totalChunks }, (_, i) => ({ id: i }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://empliq.io";
  const now = new Date();
  const slugs = await getSlugs();

  // Only the first sitemap includes static routes
  const staticRoutes: MetadataRoute.Sitemap =
    id === 0
      ? [
          {
            url: baseUrl,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1,
          },
          {
            url: `${baseUrl}/empresas`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
          },
          {
            url: `${baseUrl}/salarios`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
          },
          {
            url: `${baseUrl}/privacidad`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3,
          },
          {
            url: `${baseUrl}/terminos`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3,
          },
        ]
      : [];

  // Slice companies for this chunk
  const start = id * COMPANIES_PER_SITEMAP;
  const end = start + COMPANIES_PER_SITEMAP;
  const chunk = slugs.slice(start, end);

  const companyRoutes: MetadataRoute.Sitemap = chunk.flatMap((company) => {
    const lastMod = company.updatedAt ? new Date(company.updatedAt) : now;
    const companyBase = `${baseUrl}/empresas/${company.slug}`;
    return [
      {
        url: companyBase,
        lastModified: lastMod,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
      {
        url: `${companyBase}/salarios`,
        lastModified: lastMod,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      },
      {
        url: `${companyBase}/resenas`,
        lastModified: lastMod,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      },
      {
        url: `${companyBase}/beneficios`,
        lastModified: lastMod,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      },
    ];
  });

  return [...staticRoutes, ...companyRoutes];
}
