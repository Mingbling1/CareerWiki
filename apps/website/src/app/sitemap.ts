import type { MetadataRoute } from "next";
import { getAllCompanySlugs } from "@/lib/api-server";

/**
 * sitemap.xml — generado dinámicamente por Next.js en cada request.
 *
 * Estrategia de priorización por tiers:
 *
 *   1. Rutas estáticas (landing, listados, legal) — priority 1.0-0.3
 *   2. Top 5K empresas (por employee_count) + sub-páginas — priority 0.9/0.7
 *   3. Siguientes 20K empresas (página principal solamente) — priority 0.5
 *
 * Total: ~45K URLs (bajo el límite de 50K por sitemap).
 *
 * Las ~60K empresas restantes (pequeñas/sin datos) se descubren
 * via links internos en /empresas (paginación) y crawling orgánico.
 *
 * El endpoint /api/companies/slugs devuelve las empresas ordenadas por
 * employeeCount DESC, así que las primeras 5K son las más grandes.
 *
 * NOTA: No usamos generateSitemaps() porque OpenNext/Cloudflare Workers
 * no soporta correctamente el sitemap index que genera Next.js.
 */

// Forzar renderizado dinámico (no pre-render en build time)
export const dynamic = "force-dynamic";
// Revalidar cada 4 horas (coincidir con el sync de n8n)
export const revalidate = 14400;

const BASE_URL = "https://empliq.io";
const PRIORITY_COUNT = 5_000; // Top empresas con sub-páginas
const SECONDARY_COUNT = 20_000; // Siguientes empresas (solo página principal)
const SUB_PAGES = ["/salarios", "/resenas", "/beneficios"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Rutas estáticas ──
  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/empresas`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/salarios`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/privacidad`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terminos`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // ── Empresas dinámicas ──
  // Solo pedimos las top 25K (5K priority + 20K secondary)
  // Las restantes ~60K se descubren via crawling orgánico
  const TOTAL_LIMIT = PRIORITY_COUNT + SECONDARY_COUNT;
  let companies: Awaited<ReturnType<typeof getAllCompanySlugs>> = [];
  try {
    companies = await getAllCompanySlugs(TOTAL_LIMIT);
  } catch {
    console.warn("sitemap: Could not fetch company slugs from API");
    return routes;
  }

  // Tier 1: Top 5K empresas + sus sub-páginas (/salarios, /resenas, /beneficios)
  const priorityCompanies = companies.slice(0, PRIORITY_COUNT);
  for (const company of priorityCompanies) {
    const lastMod = company.updatedAt ? new Date(company.updatedAt) : now;

    routes.push({
      url: `${BASE_URL}/empresas/${company.slug}`,
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 0.9,
    });

    for (const sub of SUB_PAGES) {
      routes.push({
        url: `${BASE_URL}/empresas/${company.slug}${sub}`,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // Tier 2: Siguientes 20K empresas (solo página principal)
  const secondaryCompanies = companies.slice(
    PRIORITY_COUNT,
    PRIORITY_COUNT + SECONDARY_COUNT
  );
  for (const company of secondaryCompanies) {
    const lastMod = company.updatedAt ? new Date(company.updatedAt) : now;

    routes.push({
      url: `${BASE_URL}/empresas/${company.slug}`,
      lastModified: lastMod,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return routes;
}
