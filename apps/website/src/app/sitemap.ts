import type { MetadataRoute } from "next";

/**
 * sitemap.xml — generado dinámicamente por Next.js.
 *
 * CÓMO FUNCIONA:
 * - Next.js genera /sitemap.xml automáticamente en build time.
 * - Las rutas estáticas (landing, sobre nosotros, etc.) se definen aquí.
 * - Cuando tengas páginas dinámicas (ej: /empresas/[slug]), puedes
 *   hacer fetch a tu API para generar las URLs dinámicamente.
 *
 * ESTÁTICO vs DINÁMICO:
 * - Estático: Las URLs que ves abajo son fijas — solo cambian cuando haces deploy.
 * - Dinámico: Puedes hacer fetch desde la base de datos en esta función.
 *   Next.js la ejecuta en build time (SSG) o en cada request (si usas
 *   `export const dynamic = 'force-dynamic'`). Para tu caso, como las empresas
 *   no cambian cada minuto, lo ideal es regenerar con ISR o en cada deploy.
 *
 * EJEMPLO DINÁMICO (para cuando tengas páginas de empresa):
 * ```ts
 * const companies = await fetch('https://api.empliq.com/companies')
 *   .then(r => r.json());
 *
 * const companyUrls = companies.map((c) => ({
 *   url: `${baseUrl}/empresas/${c.slug}`,
 *   lastModified: new Date(c.updatedAt),
 *   changeFrequency: 'weekly' as const,
 *   priority: 0.7,
 * }));
 * ```
 *
 * Referencia: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://empliq.com";
  const now = new Date();

  return [
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
      url: `${baseUrl}/puestos`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/comunidad`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
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
}
