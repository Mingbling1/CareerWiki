import type { MetadataRoute } from "next";
import { getAllCompanySlugs } from "@/lib/api-server";

/**
 * Sitemap Index — generado dinámicamente por Next.js.
 *
 * Usa generateSitemaps() para crear un sitemap index con múltiples sitemaps:
 *
 *   /sitemap.xml          → Sitemap index (auto-generado por Next.js)
 *   /sitemap/0.xml        → Rutas estáticas (landing, listados, legal)
 *   /sitemap/1.xml        → Top 5K empresas + sub-páginas (prioridad alta)
 *   /sitemap/2.xml        → Empresas 5,001-15,000 (prioridad media)
 *   /sitemap/3.xml        → Empresas 15,001-25,000 (prioridad baja)
 *   /sitemap/4.xml        → Empresas 25,001+ (prioridad mínima)
 *
 * El endpoint /api/companies/slugs devuelve las empresas ordenadas por
 * employeeCount DESC, así que las primeras 5K son las más grandes.
 *
 * Las sub-páginas (/salarios, /resenas, /beneficios) solo se incluyen
 * para el top 5K, donde tienen más probabilidad de tener contenido.
 */

const BASE_URL = "https://empliq.io";

// Sitemap IDs: 0=static, 1=priority (top 5K + sub-pages), 2-4=rest in chunks of 10K
const PRIORITY_COUNT = 5_000;
const CHUNK_SIZE = 10_000;

// Sub-pages to include for priority companies
const SUB_PAGES = ["/salarios", "/resenas", "/beneficios"];

/**
 * Generates the sitemap index. Next.js calls this at build/revalidation time
 * and creates /sitemap.xml pointing to /sitemap/{id}.xml for each entry.
 */
export async function generateSitemaps() {
  let totalCompanies = 0;
  try {
    const companies = await getAllCompanySlugs();
    totalCompanies = companies.length;
  } catch {
    // Fallback: at least generate static sitemap
  }

  // Calculate how many chunk sitemaps we need for companies beyond the top 5K
  const remaining = Math.max(0, totalCompanies - PRIORITY_COUNT);
  const chunkCount = Math.ceil(remaining / CHUNK_SIZE);

  // IDs: 0=static, 1=priority, 2..N=chunks
  const ids = [{ id: 0 }, { id: 1 }];
  for (let i = 0; i < chunkCount; i++) {
    ids.push({ id: 2 + i });
  }

  return ids;
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Sitemap 0: Static routes ──
  if (id === 0) {
    return [
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
  }

  // ── Fetch all company slugs (ordered by employeeCount DESC from API) ──
  let companies: Awaited<ReturnType<typeof getAllCompanySlugs>> = [];
  try {
    companies = await getAllCompanySlugs();
  } catch {
    console.warn(`sitemap/${id}: Could not fetch company slugs from API`);
    return [];
  }

  // ── Sitemap 1: Priority companies (top 5K) + their sub-pages ──
  if (id === 1) {
    const priorityCompanies = companies.slice(0, PRIORITY_COUNT);
    const routes: MetadataRoute.Sitemap = [];

    for (const company of priorityCompanies) {
      const lastMod = company.updatedAt ? new Date(company.updatedAt) : now;

      // Main company page
      routes.push({
        url: `${BASE_URL}/empresas/${company.slug}`,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.9,
      });

      // Sub-pages (salarios, resenas, beneficios)
      for (const sub of SUB_PAGES) {
        routes.push({
          url: `${BASE_URL}/empresas/${company.slug}${sub}`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }

    return routes;
  }

  // ── Sitemaps 2+: Remaining companies in chunks of 10K ──
  const chunkIndex = id - 2;
  const start = PRIORITY_COUNT + chunkIndex * CHUNK_SIZE;
  const end = start + CHUNK_SIZE;
  const chunk = companies.slice(start, end);

  return chunk.map((company) => ({
    url: `${BASE_URL}/empresas/${company.slug}`,
    lastModified: company.updatedAt ? new Date(company.updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));
}
