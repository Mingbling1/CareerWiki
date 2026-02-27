# Empliq - Data Pipeline & Automatización

> Documentación del pipeline de datos para poblar perfiles de empresas.

##  Análisis del Padrón RUC (Perú)

### Resumen de Datos

| Métrica | Valor |
|---------|-------|
| Total registros originales | 13,025,497 |
| Personas jurídicas (RUC 20xxx) | 872,051 |
| Activas | 847,656 |
| Con trabajadores registrados | 315,852 |
| **Pareto 80%** (5.5% empresas) | 17,318 |

### Segmentación por Tamaño

| Tier | Criterio | Empresas | Prioridad |
|------|----------|----------|-----------|
| **Tier 1** | ≥1000 trabajadores | 915 |  Alta |
| **Tier 2** | 500-999 trabajadores | 798 |  Media-Alta |
| **Tier 3** | 100-499 trabajadores | 4,410 |  Media |
| **Tier 4** | 50-99 trabajadores | ~4,700 |  Baja |
| **Tier 5** | 0-49 trabajadores | ~861,228 |  Mínima |
| **Total** | Todas las empresas | **872,051** | - |

### Alcance de Scraping

Se scrapean las **872,051 empresas completas** del Padrón RUC, ordenadas por número de trabajadores descendente (las más grandes primero). El CSV consolidado es `data/all_padron_companies.csv` (116MB).

> **Nota:** Los archivos CSV por tier separado (`tier1_mega.csv`, `tier4_5_companies.csv`, etc.) ya no se usan para el pipeline. Se mantiene un único CSV consolidado.

### Top 10 Sectores (Empresas Prioridad)

1. Administración Pública (792)
2. Construcción (321)
3. Transporte de Carga (264)
4. Arquitectura e Ingeniería (200)
5. Cultivo de Frutas (191)
6. Hospitales (183)
7. Seguridad (173)
8. Restaurantes (156)
9. Actividades Empresariales (152)
10. Educación Superior (136)

### Distribución Geográfica (Top 5)

1. Lima (3,911 - 63.8%)
2. Arequipa (264)
3. La Libertad (256)
4. Callao (206)
5. Cusco (174)

---

##  Pipeline de Datos (n8n)

### Arquitectura v6 — DatosPeru Only (872K empresas)

```
┌───────────────────────────────────────────────────────────────┐
│               n8n WORKFLOW v6 (DatosPeru Only)                │
│             CSV: all_padron_companies.csv (872K)              │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌───────────┐  ┌────────────┐  ┌──────────┐  │
│  │  Leer    │─►│ Prepare   │─►│ Enrich     │─►│ Build    │  │
│  │  CSV     │  │ Data      │  │ DatosPeru  │  │ Record   │  │
│  └──────────┘  └───────────┘  └────────────┘  └──────────┘  │
│       │              │              │              │          │
│       ▼              ▼              ▼              ▼          │
│  all_padron_     Extraer RUC   GET /enrich/    JSONB blob    │
│  companies.csv   + tier 1-5    datosperu?ruc=   → Upsert     │
│  (ordenado por                                companies_raw │
│   NroTrab DESC)                               (empliq_dev)   │
│                                                               │
│                        Wait 15s entre items                   │
└───────────────────────────────────────────────────────────────┘
```

### Workflows n8n

| Workflow | Estado | Descripción |
|----------|--------|-------------|
| **DatosPeru Enrichment (v6)** | ACTIVO | Workflow principal. Lee `all_padron_companies.csv`, clasifica tier1-5, enriquece y guarda. |
| **DatosPeru Enrichment Tier4+5** | DESACTIVADO | Redundante — v6 ya procesa todas las empresas. Mantener desactivado. |
| **Retry Failed Companies** | ACTIVO | Reintenta cada 2h los `failed`/`failed_retry`. Excluye `not_found_datosperu`. |
| **Retry Failed Tier4+5** | DESACTIVADO | Redundante — Retry Failed Companies cubre todo `source = 'n8n_datosperu_v6'`. |
| **Logo Pipeline** | ACTIVO | Descarga logos de DatosPeru y los sube a S3. |
| **Pipeline Monitor v2** | ACTIVO | Monitoreo de estadísticas del pipeline. |
| **Pipeline Monitor** | DESACTIVADO | Versión anterior del monitor. |
| **Proxy Discover** | ACTIVO | Descubre proxies SOCKS5 de fuentes públicas y los guarda en tabla `proxies`. |
| **Proxy Validate** | ACTIVO | Valida proxies de la tabla `proxies` cada 30min vía `POST /proxies/test`. |

> **Nota sobre proxies:** El scraper tiene su **propio pool interno** de proxies (cargados al iniciar + refresh cada 30min) con blacklisting automático. Los workflows Proxy Discover/Validate mantienen la tabla `proxies` en la BD de forma independiente — son útiles para monitoreo y como fuente alternativa.

### Manejo de Errores (errorType)

El scraper ahora retorna `errorType` en cada respuesta:

| errorType | Significado | scrape_status | ¿Se reintenta? |
|-----------|-------------|---------------|----------------|
| `null` | Éxito | `enriched` | No (ya terminó) |
| `not_found` | Empresa no existe en DatosPeru | `not_found_datosperu` | **No** (permanente) |
| `proxy_error` | Proxy falló / todos blacklisted | `failed` | Sí |
| `parse_error` | Página cambió / HTML inesperado | `failed` | Sí |
| `invalid_ruc` | RUC mal formado | — | No |

### Blacklisting de Proxies (interno del scraper)

- Cada proxy acumula fallos (`proxyFailCounts`)
- Tras **3 fallos** consecutivos → proxy blacklisted
- Si **todos** los proxies están blacklisted → se resetea y fuerza refresh
- Refresh automático del pool cada **30 minutos**

**¿Por qué solo DatosPeru?**
- DatosPeru extrae 15+ campos estructurados por empresa (nombre, estado, dirección, ejecutivos, trabajadores, etc.)
- La búsqueda web (DDG/Bing) devolvía falsos positivos (ej: datosperu.org mismo como "website")
- El scrape de websites es lento, frágil y la mayoría de empresas peruanas no tiene web propia
- Para el MVP, los datos de DatosPeru son suficientes. La búsqueda web queda como feature secundario.

### Paso 1: Enriquecimiento con DatosPeru  PRODUCCIÓN

Para cada empresa, el scraper API consulta datosperu.org y extrae:

| Campo | Ejemplo |
|-------|---------|
| `nombre` | BANCO DE CREDITO DEL PERU |
| `estado` | ACTIVO |
| `tipo` | SOCIEDAD ANONIMA |
| `ciiu` | 6419 |
| `sectorEconomico` | OTROS TIPOS DE INTERMEDIACIÓN MONETARIA |
| `direccion` | JR. CENTENARIO NRO. 156 URB. LADERAS DE MELGAREJO |
| `telefonos` | ["+51 1 311 9898", "+51 1 313 2000"] |
| `web` | https://www.viabcp.com/ |
| `logoUrl` | https://www.datosperu.org/top300/banco-de-credito-del-peru.jpg |
| `descripcion` | Con más de veintiseis mil empleados... |
| `ejecutivos` | 20 (cargo, nombre, desde) |
| `historialTrabajadores` | 20 períodos (nroTrab, pensionistas, prestadores) |
| `establecimientosAnexos` | 16 (dirección, ubicación) |
| `historialCondiciones` | 25 registros |
| `proveedorEstado` | true/false |
| `marcaComercioExterior` | SIN ACTIVIDAD |

**Técnica:** HTTP puro (sin browser) + curl 8.17/OpenSSL 3.5 en Alpine Docker para bypass de Cloudflare JA3/JA4 fingerprinting. SOCKS5 proxy rotation como fallback.

**Endpoint:** `GET /enrich/datosperu?ruc=XXXXXXXXXXX` (~12s por empresa)

### Paso 2: Upsert a companies_raw (JSONB)

Todo el output de DatosPeru se empaqueta en un blob JSONB y se guarda:

```sql
-- Tabla en empliq_dev (Oracle Cloud PostgreSQL)
INSERT INTO companies_raw (ruc, razon_social, data, source, updated_at)
VALUES ($1, $2, $3::jsonb, 'n8n_datosperu_v6', NOW())
ON CONFLICT (ruc) DO UPDATE SET
  razon_social = EXCLUDED.razon_social,
  data = EXCLUDED.data,
  source = EXCLUDED.source,
  updated_at = NOW();
```

### Paso 3 (Secundario / Post-MVP): Búsqueda de Website

>  **DESACTIVADO en v6** — La búsqueda web (DDG/Bing) producía falsos positivos
> (ej: datosperu.org como "website oficial"). Queda como feature secundario.

El scraper API aún tiene los endpoints `/search` y `/scrape/url` disponibles,
pero el workflow v6 no los usa. Si se reactivan, la blacklist ya incluye
`datosperu.org`, `indexbox.io` y otros agregadores.

### Paso 4 (Secundario / Post-MVP): Extracción de Información Web

>  **DESACTIVADO en v6** — Cuando se reactive la búsqueda web, se extraerá:

| Campo | Fuente | Método |
|-------|--------|--------|
| `name` | DatosPeru > Website | Razón social oficial |
| `description` | DatosPeru > Website | Top300 / Meta description |
| `industry` | RUC / DatosPeru | CIIU + Sector Económico |
| `size` | RUC Data | NroTrab |
| `location` | DatosPeru > RUC | Dirección fiscal completa |
| `website` | Search > DatosPeru | URL oficial |
| `logo_url` | DatosPeru > Website | `top300/` image o Scraper |
| `founded_date` | DatosPeru > Website | Fecha de inicio SUNAT |
| `social_links` | Website | Scraping |
| `phones` | DatosPeru | Teléfonos registrados |
| `ejecutivos` | DatosPeru | Apoderados, gerentes |
| `historial_trab` | DatosPeru | Trabajadores por período |
| `anexos` | DatosPeru | Establecimientos anexos |

### Paso 4: Enriquecimiento con AI

Usamos Claude/GPT para:

1. Generar descripción si no existe
2. Extraer información de cultura
3. Identificar beneficios mencionados
4. Clasificar industria correctamente

---

##  APIs Recomendadas (Tier Free)

### Para Búsqueda Web

| API | Free Tier | Límite | Recomendación |
|-----|-----------|--------|---------------|
| **SerpAPI** | 100/mes | Suficiente para Tier 1 | ⭐⭐⭐ |
| **Google CSE** | 100/día | Ideal para volumen | ⭐⭐⭐ |
| **Bing Search** | 1000/mes | Buena alternativa | ⭐⭐ |
| **DuckDuckGo** | Ilimitado | Menos preciso | ⭐ |

### Para Scraping

| Herramienta | Free Tier | Uso |
|-------------|-----------|-----|
| **Firecrawl** | 500/mes | Scraping con AI |
| **Jina Reader** | 1M tokens | Conversión web→markdown |
| **Browserless** | 6hrs/mes | Headless browser |

### Para AI/Extracción

| API | Free Tier | Uso |
|-----|-----------|-----|
| **Claude (Anthropic)** | $5 crédito | Extracción inteligente |
| **Groq** | Gratis | Rápido, bueno para parsing |
| **OpenRouter** | Pay-per-use | Multi-modelo |

---

##  Archivos Generados

```
/home/jimmy/sueldos-organigrama/data/
├── all_padron_companies.csv        # 872K empresas, CSV principal del pipeline
├── padron_ruc_juridicas.parquet    # 872K empresas jurídicas (análisis)
├── ruc_activas.parquet             # 847K activas
├── ruc_con_trabajadores.parquet    # 315K con empleados
├── ruc_pareto_80.parquet           # 17K (80% trabajadores)
├── ruc_prioridad_scraping.parquet  # 6K tier1-3 (legacy)
├── ruc_prioridad_scraping.csv      
├── tier1_mega.parquet              # 915 mega empresas (legacy)
├── tier1_mega.csv                  
├── tier2_grandes.parquet           # 798 grandes (legacy)
├── tier2_grandes.csv               
├── tier3_medianas.parquet          # 4,410 medianas (legacy)
├── tier3_medianas.csv              
└── resumen_analisis.json           # Métricas
```

> Los archivos legacy (tier1/2/3 CSVs individuales) se mantienen para referencia pero el pipeline usa solo `all_padron_companies.csv`.

---

##  Estrategia de Implementación

### Pipeline Actual (Febrero 2026)

El pipeline procesa las **872,051 empresas** del Padrón RUC en un solo flujo:

1. **CSV único** (`all_padron_companies.csv`) ordenado por NroTrab DESC
2. **Workflow v6** procesa secuencialmente, las empresas más grandes primero
3. **Retry automático** cada 2h para errores temporales (proxy/parse)
4. **Not-found permanente** — empresas que no existen en DatosPeru no se reintentan

### Timeline Estimado

| Fase | Empresas | Tiempo | Estado |
|------|----------|--------|--------|
| Tier 1 (≥1000) | 915 | ~4h | En progreso |
| Tier 2 (500-999) | 798 | ~3h | En progreso |
| Tier 3 (100-499) | 4,410 | ~18h | Pendiente |
| Tier 4 (50-99) | ~4,700 | ~20h | Pendiente |
| Tier 5 (0-49) | ~861K | ~meses | Pendiente |

> A 15s por empresa, ~240 empresas/hora. El pipeline corre 24/7.

---

##  Campos del Perfil de Empresa

### Desde RUC (Disponible)

```typescript
interface DatosRUC {
  ruc: string;              // Identificador único
  tipo: string;             // S.A., S.A.C., etc.
  estado: string;           // ACTIVO
  nroTrabajadores: number;  // Cantidad de empleados
  actividadCIIU: string;    // Sector económico
  departamento: string;     // Ubicación
  provincia: string;
  distrito: string;
}
```

### Para Scraping (A obtener)

```typescript
interface DatosWebsite {
  website: string;          // URL oficial
  logoUrl: string;          // Logo de la empresa
  description: string;      // Descripción/About
  foundedYear?: number;     // Año de fundación
  socialLinks?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
  };
  culture?: string;         // Cultura organizacional
  benefits?: string[];      // Beneficios laborales
}
```

### Desde DatosPeru (Producción )

```typescript
interface DatosPeruEnrichment {
  nombre: string;             // Razón social
  estado: string;             // ACTIVO
  tipo: string;               // SOCIEDAD ANONIMA
  ciiu: string;               // 6419
  sectorEconomico: string;    // Descripción del CIIU
  direccion: string;          // Dirección fiscal
  departamento: string;
  provincia: string;
  distrito: string;
  telefonos: string[];        // Múltiples teléfonos
  web: string;                // Sitio web registrado en SUNAT
  logoUrl: string;            // Logo desde DatosPeru Top300
  descripcion: string;        // Descripción corporativa
  ejecutivos: Array<{
    cargo: string;            // APODERADO, GERENTE, etc.
    nombre: string;
    desde: string;            // Fecha de nombramiento
  }>;
  historialTrabajadores: Array<{
    periodo: string;          // "2025-09"
    nroTrabajadores: number;
    nroPensionistas: number;
    nroPrestadores: number;
  }>;
  establecimientosAnexos: Array<{
    direccion: string;
    ubicacion: string;        // "LIMA - LIMA - MIRAFLORES"
  }>;
  proveedorEstado: boolean;
  marcaComercioExterior: string;
  fechaInicio: string;        // Fecha fundación
  fechaInscripcion: string;   // Inscripción SUNAT
}
```

### Combinado Final

```typescript
interface CompanyProfile {
  id: string;
  ruc: string;
  name: string;
  slug: string;
  description: string;
  industry: string;         // Mapeado de CIIU
  size: string;             // Calculado de NroTrab
  location: string;         // Departamento
  website: string;
  logoUrl: string;
  culture?: string;
  benefits: string[];
  isVerified: boolean;
  metadata: {
    source: 'ruc_sunat';
    scrapeDate: Date;
    dataQuality: 'high' | 'medium' | 'low';
  };
  createdAt: Date;
  updatedAt: Date;
}
```
