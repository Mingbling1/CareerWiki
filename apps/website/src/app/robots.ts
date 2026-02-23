import type { MetadataRoute } from "next";

/**
 * robots.txt — generado dinámicamente por Next.js.
 *
 * Next.js genera automáticamente /robots.txt en build time a partir
 * de este archivo. No necesitas mantener un archivo estático.
 *
 * Referencia: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://empliq.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
