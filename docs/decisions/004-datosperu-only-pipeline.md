# ADR-004: Pipeline Solo DatosPeru (Sin Búsqueda Web)

**Fecha:** Febrero 2026
**Estado:** Aceptado

## Contexto

El pipeline v5 usaba DDG/Bing para buscar websites oficiales, pero producía falsos positivos (ej: datosperu.org como "website oficial"). Además, la mayoría de empresas peruanas no tienen web propia.

## Opciones Evaluadas

1. **Búsqueda web + scraping** — DDG/Bing → URL → Cheerio → extraer datos
2. **Solo DatosPeru** — datosperu.org ya tiene 15+ campos estructurados por empresa
3. **API comercial** — SerpAPI/Google CSE — costo por request

## Decisión

Pipeline v6: Solo DatosPeru. El workflow n8n llama `GET /enrich/datosperu?ruc=XXX` que extrae datos de datosperu.org con HTTP puro (Cheerio). Los endpoints `/search` quedan disponibles pero no se usan.

**Datos extraídos por empresa:**
- Razón social, estado, tipo, CIIU, sector económico
- Dirección completa, teléfonos, web registrada en SUNAT
- Logo (Top300), descripción corporativa
- 20 ejecutivos con cargo y fecha
- 20 períodos de historial de trabajadores
- Establecimientos anexos
- Proveedor del estado (sí/no)

## Consecuencias

- **Positivo:** 15+ campos por empresa sin detección de bots
- **Positivo:** Pipeline más simple y confiable
- **Positivo:** ~12s por empresa, sin falsos positivos
- **Negativo:** Dependencia de datosperu.org (Cloudflare, cambios de layout)
- **Negativo:** La búsqueda web queda como feature secundario para post-MVP
