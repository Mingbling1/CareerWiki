# App: Scraper API (`apps/empliq-scraper-api/`)

> NestJS microservicio de scraping y enriquecimiento. Puerto: 3457.

## Resumen

Microservicio standalone para buscar y enriquecer datos de empresas peruanas. Arquitectura hexagonal con múltiples adaptadores de búsqueda y un adaptador de enriquecimiento HTTP para datosperu.org.

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

| Método | Path | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/search?q=&ruc=` | Buscar web oficial | API Key |
| POST | `/search/batch` | Búsqueda por lote (hasta 50) | API Key |
| GET | `/search/status` | Estado de estrategias | API Key |
| POST | `/search/reset` | Resetear contadores | API Key |
| GET | `/search/health` | Healthcheck | Público |
| POST | `/scrape/url` | Scraping directo de URL | API Key |
| POST | `/scrape/company` | Búsqueda + scraping | API Key |
| **GET** | **`/enrich/datosperu?ruc=`** | **Enriquecimiento DatosPeru** | **API Key** |

## Estrategias de Búsqueda

| Estrategia | Adaptador | Velocidad | Capacidad |
|------------|-----------|-----------|-----------|
| `ddg_http` | DdgHttpAdapter | ~1-2s | 200/sesión |
| `bing_http` | BingHttpAdapter | ~1-2s | 150/sesión |
| `univ_peru_http` | UniversidadPeruHttpAdapter | ~1.5s | 100/sesión |

Fallback automático: Si una estrategia falla 3 veces seguidas → cooldown y switch.

## DatosPeru Enrichment

Endpoint principal en producción. Dado un RUC, extrae 15+ campos de datosperu.org:
- Razón social, estado, tipo, CIIU, sector, dirección, teléfonos, web
- Logo (Top300), descripción corporativa
- Ejecutivos con cargo y fecha
- Historial de trabajadores (20 períodos)
- Establecimientos anexos
- Proveedor del estado, comercio exterior

**Técnica:** HTTP puro (Cheerio) + Alpine Docker con curl 8.17/OpenSSL 3.5 para bypass Cloudflare JA3/JA4. SOCKS5 proxy rotation como fallback.

## Variables de Entorno

```env
PORT=3457
API_KEY=your-api-key
DATOSPERU_DIRECT=true  # Para IP residencial
DATABASE_URL=postgresql://user:password@localhost:5432/empliq_dev
```

## Swagger

Disponible en `http://localhost:3457/docs` cuando corre en dev.
