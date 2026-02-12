# Empliq - Web Scraper

Scripts para buscar sitios web oficiales de empresas peruanas.

## 📁 Estructura

```
apps/scraper/
├── package.json          # Dependencias Node.js (Puppeteer)
├── google-search.js      # Búsqueda individual con Puppeteer
├── batch-search.js       # Procesamiento por lotes
├── enrich_tiers.py       # Mapeo RUC -> Nombre (Python)
└── README.md
```

## 🚀 Instalación

```bash
cd apps/scraper

# Instalar dependencias (incluye Puppeteer y Chrome)
npm install

# Si hay problemas con Puppeteer, instalar Chrome manualmente:
npx puppeteer browsers install chrome
```

## 📖 Uso

### Búsqueda individual
```bash
# Buscar website de una empresa
node google-search.js "Banco de Crédito del Perú"

# Test con varias empresas
node google-search.js --test
```

### Procesamiento por lotes
```bash
# Procesar 10 empresas del Tier 1
node batch-search.js --tier 1 --limit 10

# Continuar desde donde se quedó
node batch-search.js --tier 1 --limit 50 --continue

# Procesar Tier 2
node batch-search.js --tier 2 --limit 20
```

### Enriquecer datos (mapear RUC -> Nombre)
```bash
# Requiere el archivo del padrón SUNAT
python enrich_tiers.py
```

## 📊 Datos Disponibles

Los archivos en `/data/` ya están enriquecidos con nombres de empresa:

| Tier | Criterio | Empresas | Archivo |
|------|----------|----------|---------|
| 1 | ≥1000 trabajadores | 915 | tier1_mega_enriched.csv |
| 2 | 500-999 trabajadores | 798 | tier2_grandes_enriched.csv |
| 3 | 100-499 trabajadores | 4,410 | tier3_medianas_enriched.csv |

## 🔧 Configuración Anti-Ban

El scraper implementa múltiples técnicas para evitar bloqueos:

- **Delays largos**: 10-20 segundos entre búsquedas
- **Pausas largas**: 1-2 minutos cada 10 búsquedas
- **User agents rotativos**: Simula diferentes navegadores
- **Escritura humana**: Delays aleatorios al escribir
- **Scroll humano**: Simula comportamiento de lectura

## 📂 Archivos de Salida

```
data/scraped/
├── tier1_progress.json   # Progreso guardado
├── tier1_results.csv     # Resultados con websites
├── tier2_progress.json
├── tier2_results.csv
└── ...
```

## ⚠️ Consideraciones

- Google puede banear temporalmente si se hacen muchas búsquedas
- Recomendado: máximo 50-100 búsquedas por sesión
- Si aparece CAPTCHA, esperar unas horas antes de continuar
- El progreso se guarda automáticamente, se puede retomar con `--continue`

## 🐛 Troubleshooting

### "Could not find Chrome"
```bash
npx puppeteer browsers install chrome
```

### El script se queda colgado
- Verificar conexión a internet
- Probar con `headless: false` para ver el navegador
- Aumentar timeouts en el código
