# Empliq - Data Pipeline & Automatización

> Documentación del pipeline de datos para poblar perfiles de empresas.

## 📊 Análisis del Padrón RUC (Perú)

### Resumen de Datos

| Métrica | Valor |
|---------|-------|
| Total registros originales | 13,025,497 |
| Personas jurídicas | 872,051 |
| Activas | 847,656 |
| Con trabajadores registrados | 315,852 |
| **Pareto 80%** (5.5% empresas) | 17,318 |

### Segmentación por Tamaño

| Tier | Criterio | Empresas | Prioridad |
|------|----------|----------|-----------|
| **Tier 1** | ≥1000 trabajadores | 915 | 🔴 Alta |
| **Tier 2** | 500-999 trabajadores | 798 | 🟠 Media-Alta |
| **Tier 3** | 100-499 trabajadores | 4,410 | 🟡 Media |
| **Total Prioridad** | ≥100 trabajadores | **6,123** | - |

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

## 🔄 Pipeline de Datos (n8n)

### Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         n8n WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐ │
│  │  Leer    │───►│ Buscar   │───►│ Extraer   │───►│ Guardar  │ │
│  │  CSV     │    │ Website  │    │ Info      │    │ en DB    │ │
│  └──────────┘    └──────────┘    └───────────┘    └──────────┘ │
│       │               │                │                │       │
│       ▼               ▼                ▼                ▼       │
│  tier1_mega.csv  Google Search   Scrape/AI       PostgreSQL    │
│                  (site: query)   Extraction       (Empliq)     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Paso 1: Búsqueda de Website

Para encontrar la página web oficial de cada empresa usamos:

1. **SerpAPI** (Recomendado - 100 búsquedas gratis/mes)
2. **Google Custom Search API** (100 gratis/día)
3. **DuckDuckGo** (Sin límite, menos preciso)

#### Query de búsqueda:
```
"[NOMBRE_EMPRESA]" site:pe OR site:com.pe -linkedin -facebook
```

### Paso 2: Extracción de Información

De la página web extraemos:

| Campo | Fuente | Método |
|-------|--------|--------|
| `name` | Website | Title / About |
| `description` | Website | Meta description / About |
| `industry` | RUC Data | CIIU |
| `size` | RUC Data | NroTrab |
| `location` | RUC Data | Departamento |
| `website` | Search | URL |
| `logo_url` | Website | Favicon / Logo |
| `founded_date` | Website | AI Extraction |
| `social_links` | Website | Scraping |

### Paso 3: Enriquecimiento con AI

Usamos Claude/GPT para:

1. Generar descripción si no existe
2. Extraer información de cultura
3. Identificar beneficios mencionados
4. Clasificar industria correctamente

---

## 🛠️ APIs Recomendadas (Tier Free)

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

## 📁 Archivos Generados

```
/home/jimmy/sueldos-organigrama/data/
├── padron_ruc_juridicas.parquet    # 872K empresas jurídicas
├── ruc_activas.parquet             # 847K activas
├── ruc_con_trabajadores.parquet    # 315K con empleados
├── ruc_pareto_80.parquet           # 17K (80% trabajadores)
├── ruc_prioridad_scraping.parquet  # 6K para scraping
├── ruc_prioridad_scraping.csv      
├── tier1_mega.parquet              # 915 mega empresas
├── tier1_mega.csv                  
├── tier2_grandes.parquet           # 798 grandes
├── tier2_grandes.csv               
├── tier3_medianas.parquet          # 4,410 medianas
├── tier3_medianas.csv              
└── resumen_analisis.json           # Métricas
```

---

## 🚀 Estrategia de Implementación

### Fase 1: Tier 1 (915 empresas)
- Scraping manual de las top 50
- Automatización para el resto
- Validación manual de datos

### Fase 2: Tier 2 (798 empresas)
- Flujo automatizado completo
- Revisión por muestreo

### Fase 3: Tier 3 (4,410 empresas)
- Pipeline completamente automatizado
- Validación por AI

### Timeline Estimado

| Fase | Empresas | Tiempo | Método |
|------|----------|--------|--------|
| Fase 1 | 915 | 1-2 semanas | Semi-manual |
| Fase 2 | 798 | 1 semana | Automatizado |
| Fase 3 | 4,410 | 2-3 semanas | Full auto |

---

## 📝 Campos del Perfil de Empresa

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
