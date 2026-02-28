import type { MetadataRoute } from "next";
import { getAllCompanySlugs } from "@/lib/api-server";

/**
 * sitemap.xml — generado dinámicamente por Next.js.
 *
 * Incluye rutas estáticas + una URL por cada empresa (~25,000).
 * Solo incluye la página principal de cada empresa (no sub-páginas)
 * para mantenernos bajo el límite de 50,000 URLs por sitemap.
 *
 * Google descubre las sub-páginas (/salarios, /resenas, /beneficios)
 * automáticamente a través del crawling y los links internos.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://empliq.io";
  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
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
  ];

  // Dynamic company routes — one URL per company (main page only)
  let companyRoutes: MetadataRoute.Sitemap = [];
  try {
    const companies = await getAllCompanySlugs();
    companyRoutes = companies.map((company) => ({
      url: `${baseUrl}/empresas/${company.slug}`,
      lastModified: company.updatedAt ? new Date(company.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    console.warn("sitemap: Could not fetch company slugs from API");
  }

  return [...staticRoutes, ...companyRoutes];
}
