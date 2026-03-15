---
name: empliq-scraper
description: NestJS scraper microservice for DatosPeru enrichment, proxy rotation, search strategies, n8n workflows, and data pipeline
---

# Empliq Scraper API (`apps/empliq-scraper-api/`)

NestJS microservicio de scraping y enriquecimiento. Puerto 3457. Produccion: `scraper.empliq.io`.

## Estructura

```
src/
├── domain/
│   ├── entities/          # CompanyProfile, DatosPeruProfile, SearchResult, StrategyStatus
│   ├── enums/             # SearchStrategy (DDG, Bing, UnivPeru)
│   └── ports/             # SearchEnginePort, WebsiteScraperPort, DatosPeruEnrichmentPort
├── application/
│   └── services/          # SearchOrchestrator, Enrichment, CompanyProfile, ProxyTest
├── infrastructure/
│   ├── adapters/          # BingHttp, DdgHttp, DatosPeruHttp, UnivPeruHttp, CheerioScraper
│   ├── auth/              # ApiKeyGuard, @Public() decorator
│   └── http/
│       ├── controllers/   # Search, Scrape, Enrich, Proxy
│       └── dtos/          # 8 DTOs con class-validator
└── shared/
    ├── config/            # scraperConfig (timeouts, user-agents)
    └── utils/             # companyNameCleaner, urlScorer
```

## Endpoints

| Metodo | Path | Descripcion | Auth |
|--------|------|-------------|------|
| GET | `/search?q=&ruc=` | Buscar web oficial | API Key |
| POST | `/search/batch` | Busqueda por lote (hasta 50) | API Key |
| GET | `/search/status` | Estado de estrategias | API Key |
| POST | `/search/reset` | Resetear contadores | API Key |
| GET | `/search/health` | Healthcheck | Publico |
| POST | `/scrape/url` | Scraping directo de URL | API Key |
| POST | `/scrape/company` | Busqueda + scraping | API Key |
| **GET** | **`/enrich/datosperu?ruc=`** | **Enriquecimiento DatosPeru** | **API Key** |
| GET | `/logo/fetch?domain=&ruc=` | Descarga logo a Oracle bucket | API Key |

## DatosPeru Enrichment (endpoint principal)

Dado un RUC, extrae 15+ campos de datosperu.org:
- Razon social, estado, tipo, CIIU, sector, direccion, telefonos, web
- Logo (Top300), descripcion corporativa
- Ejecutivos con cargo y fecha (20+)
- Historial de trabajadores (20 periodos)
- Establecimientos anexos
- Proveedor del estado, comercio exterior

**Tecnica:** HTTP puro (Cheerio) + Alpine Docker con curl 8.17/OpenSSL 3.5 para bypass Cloudflare JA3/JA4. SOCKS5 proxy rotation como fallback.

## Estrategias de busqueda

| Estrategia | Adaptador | Velocidad | Capacidad |
|------------|-----------|-----------|-----------|
| `ddg_http` | DdgHttpAdapter | ~1-2s | 200/sesion |
| `bing_http` | BingHttpAdapter | ~1-2s | 150/sesion |
| `univ_peru_http` | UniversidadPeruHttpAdapter | ~1.5s | 100/sesion |

Fallback automatico: si una estrategia falla 3 veces seguidas -> cooldown y switch.

## Proxy rotation

- Pool interno de proxies cargados al iniciar + refresh cada 30min
- Blacklisting automatico tras 3 fallos consecutivos
- Si todos blacklisted -> reset + force refresh
- Workflows n8n (Proxy Discover/Validate) mantienen tabla `proxies` en BD

## Data Pipeline (n8n)

CSV completo: 872K empresas dividido en 10 batches (~87K c/u) para evitar crash de memoria en n8n.

Flujo: CSV -> n8n -> GET /enrich/datosperu?ruc= -> JSONB blob -> Upsert companies_raw (empliq_dev)

Retry automatico cada 2h para errores temporales. `not_found_datosperu` es permanente.

**Estado:** ~25,000+ empresas enriquecidas.

## Variables de entorno

```env
PORT=3457
API_KEY=your-api-key
DATOSPERU_DIRECT=true  # Para IP residencial
DATABASE_URL=postgresql://user:password@localhost:5432/empliq_dev
```

Swagger: `http://localhost:3457/docs`
