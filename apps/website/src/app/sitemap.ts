import type { MetadataRoute } from "next";
import { getAllCompanySlugs } from "@/lib/api-server";

/**
 * sitemap.xml — generado dinámicamente por Next.js.
 *
 * Incluye rutas estáticas + todas las páginas dinámicas de empresas
 * con sus sub-páginas (salarios, reseñas, beneficios).
 *
 * Next.js ejecuta esta función en build time (SSG) o por request (ISR).
 * Usamos revalidate para regenerar cada hora en el server helper.
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

  // Dynamic company routes
  let companyRoutes: MetadataRoute.Sitemap = [];
  try {
    const companies = await getAllCompanySlugs();
    companyRoutes = companies.flatMap((company) => {
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
  } catch {
    // If API is unavailable, return only static routes
    console.warn("sitemap: Could not fetch company slugs from API");
  }

  return [...staticRoutes, ...companyRoutes];
}
