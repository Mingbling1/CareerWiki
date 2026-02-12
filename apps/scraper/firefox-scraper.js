/**
 * EMPLIQ - Firefox Multi-Engine Scraper (Playwright)
 * 
 * Scraper lento y humano con Firefox real.
 * Rota entre DuckDuckGo, Bing y Google para evitar bans.
 * Usa el nombre comercial limpio para mejores resultados.
 * 
 * Uso:
 *   node firefox-scraper.js "Nombre Empresa"
 *   node firefox-scraper.js --batch tier1_mega_enriched.csv
 *   node firefox-scraper.js --batch tier1_mega_enriched.csv --limit 10
 *   node firefox-scraper.js --headless "Empresa"
 */

const { firefox } = require('playwright');
const fs = require('fs');
const path = require('path');

// ============================================================
// CONFIGURACIÓN
// ============================================================
const CONFIG = {
  // Delays humanos
  TYPING_DELAY: { min: 80, max: 200 },
  PAUSE_BEFORE_TYPE: { min: 500, max: 1500 },
  PAUSE_AFTER_SEARCH: { min: 3000, max: 6000 },
  PAUSE_BETWEEN_SEARCHES: { min: 15000, max: 30000 },

  // Anti-ban
  BATCH_SIZE: 15,
  BATCH_PAUSE: { min: 120000, max: 180000 },
  ENGINE_ROTATE_EVERY: 5, // Cambiar buscador cada N búsquedas

  // Contadores de uso máximo por sesión antes de rotar
  ENGINE_MAX_PER_SESSION: {
    duckduckgo: 40,
    bing: 40,
    google: 15, // Google es el más estricto
  },

  OUTPUT_DIR: path.join(__dirname, '../../data/scraper_results'),

  BLACKLIST: [
    'linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'youtube.com', 'wikipedia.org', 'glassdoor.com', 'indeed.com',
    'computrabajo.com', 'bumeran.com', 'google.com', 'duckduckgo.com',
    'bing.com', 'mercadolibre.com', 'amazon.com', 'rpp.pe',
    'elcomercio.pe', 'gestion.pe', 'larepublica.pe', 'tiktok.com',
    'pinterest.com', 'yelp.com',
  ],

  PREFERRED_TLDS: ['.pe', '.com.pe', '.gob.pe', '.org.pe'],
};

// ============================================================
// UTILIDADES
// ============================================================
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDelay(range) {
  return random(range.min, range.max);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Limpia el nombre de la empresa para búsqueda.
 * Quita razón social jurídica y deja solo el nombre comercial.
 */
function cleanCompanyName(name) {
  let clean = name.toUpperCase();

  // Quitar sufijos legales comunes peruanos
  const legalSuffixes = [
    'S\\.?A\\.?C\\.?', 'S\\.?A\\.?A\\.?', 'S\\.?A\\.?', 'S\\.?R\\.?L\\.?',
    'E\\.?I\\.?R\\.?L\\.?', 'S\\.?C\\.?R\\.?L\\.?', 'S\\.?C\\.?',
    'SOCIEDAD ANONIMA CERRADA', 'SOCIEDAD ANONIMA ABIERTA',
    'SOCIEDAD ANONIMA', 'SOCIEDAD COMERCIAL DE RESPONSABILIDAD LIMITADA',
    'EMPRESA INDIVIDUAL DE RESPONSABILIDAD LIMITADA',
  ];

  for (const suffix of legalSuffixes) {
    clean = clean.replace(new RegExp('\\b' + suffix + '\\b', 'gi'), '');
  }

  // Quitar prefijos genéricos
  const prefixes = ['EMPRESA', 'COMPANIA', 'COMPAÑIA', 'CORPORACION', 'GRUPO'];
  for (const p of prefixes) {
    clean = clean.replace(new RegExp('^' + p + '\\b\\s*', 'gi'), '');
  }

  // Quitar caracteres especiales
  clean = clean.replace(/[^\w\sáéíóúñÁÉÍÓÚÑ&-]/g, ' ');

  return clean.replace(/\s+/g, ' ').trim();
}

function isBlacklisted(url) {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    return CONFIG.BLACKLIST.some(bl => domain.includes(bl));
  } catch {
    return true;
  }
}

function scoreResult(url, title, companyName) {
  let score = 0;
  try {
    const domain = new URL(url).hostname.toLowerCase();
    const words = cleanCompanyName(companyName).toLowerCase().split(/\s+/).filter(w => w.length > 2);

    // TLD peruano
    if (CONFIG.PREFERRED_TLDS.some(tld => domain.endsWith(tld))) score += 15;

    // Dominio contiene palabras de empresa
    for (const word of words) {
      if (word.length > 3 && domain.includes(word)) score += 10;
    }

    // Título contiene palabras de empresa
    if (title) {
      const t = title.toLowerCase();
      for (const word of words) {
        if (word.length > 3 && t.includes(word)) score += 5;
      }
      // Bonus si dice "oficial"
      if (t.includes('oficial') || t.includes('official')) score += 3;
    }

    // HTTPS
    if (url.startsWith('https://')) score += 2;
  } catch (e) {}

  return score;
}

// ============================================================
// COMPORTAMIENTO HUMANO
// ============================================================
async function humanType(page, selector, text) {
  await page.click(selector);
  await sleep(randomDelay(CONFIG.PAUSE_BEFORE_TYPE));

  for (const char of text) {
    await page.keyboard.type(char, { delay: randomDelay(CONFIG.TYPING_DELAY) });
    // Pausa ocasional "pensando"
    if (Math.random() < 0.08) {
      await sleep(random(300, 700));
    }
  }
}

async function randomMouseMove(page) {
  const x = random(100, 1200);
  const y = random(100, 600);
  await page.mouse.move(x, y, { steps: random(5, 15) });
  await sleep(random(100, 300));
}

async function humanScroll(page) {
  const scrollAmount = random(200, 500);
  await page.evaluate((amount) => {
    window.scrollBy({ top: amount, behavior: 'smooth' });
  }, scrollAmount);
  await sleep(random(500, 1000));
}

// ============================================================
// MOTORES DE BÚSQUEDA
// ============================================================

/**
 * Construye la query optimizada con etiquetas para cada buscador
 */
function buildQuery(companyName, engine) {
  const cleanName = cleanCompanyName(companyName);

  switch (engine) {
    case 'duckduckgo':
      // DDG soporta comillas y -site:
      return `"${cleanName}" peru sitio web oficial -site:linkedin.com -site:facebook.com`;

    case 'bing':
      // Bing soporta comillas y -site:
      return `"${cleanName}" peru sitio web oficial -site:linkedin.com -site:facebook.com -site:wikipedia.org`;

    case 'google':
      // Google: más etiquetas posibles
      return `"${cleanName}" peru sitio web oficial -linkedin -facebook -wikipedia`;

    default:
      return `${cleanName} peru web oficial`;
  }
}

async function searchDuckDuckGo(page, query) {
  console.log('   🦆 DuckDuckGo...');

  await page.goto('https://duckduckgo.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(randomDelay(CONFIG.PAUSE_AFTER_SEARCH));
  await randomMouseMove(page);

  const input = await page.$('input[name="q"]');
  if (!input) { console.log('   ⚠️ No input DDG'); return []; }

  await humanType(page, 'input[name="q"]', query);
  await sleep(random(500, 1000));
  await page.keyboard.press('Enter');

  try {
    await page.waitForSelector('[data-testid="result"], article, .result', { timeout: 20000 });
  } catch { await sleep(5000); }

  await sleep(randomDelay(CONFIG.PAUSE_AFTER_SEARCH));
  await humanScroll(page);

  return page.evaluate(() => {
    const items = [];
    const selectors = ['[data-testid="result"]', 'article', '.result'];
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach(el => {
        try {
          const link = el.querySelector('a[href^="http"]');
          const title = el.querySelector('h2, [data-testid="result-title-a"]');
          if (link && link.href && !link.href.includes('duckduckgo.com')) {
            items.push({ url: link.href, title: title ? title.textContent.trim() : '' });
          }
        } catch {}
      });
      if (items.length > 0) break;
    }
    return items;
  });
}

async function searchBing(page, query) {
  console.log('   🔷 Bing...');

  await page.goto('https://www.bing.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(randomDelay(CONFIG.PAUSE_AFTER_SEARCH));
  await randomMouseMove(page);

  const input = await page.$('input[name="q"], textarea[name="q"]');
  if (!input) { console.log('   ⚠️ No input Bing'); return []; }

  const selector = (await page.$('textarea[name="q"]')) ? 'textarea[name="q"]' : 'input[name="q"]';
  await humanType(page, selector, query);
  await sleep(random(500, 1000));
  await page.keyboard.press('Enter');

  try {
    await page.waitForSelector('#b_results, .b_algo', { timeout: 20000 });
  } catch { await sleep(5000); }

  await sleep(randomDelay(CONFIG.PAUSE_AFTER_SEARCH));
  await humanScroll(page);

  return page.evaluate(() => {
    const items = [];
    document.querySelectorAll('.b_algo').forEach(el => {
      try {
        const link = el.querySelector('a[href^="http"]');
        const title = el.querySelector('h2');
        if (link && link.href && !link.href.includes('bing.com')) {
          items.push({ url: link.href, title: title ? title.textContent.trim() : '' });
        }
      } catch {}
    });
    return items;
  });
}

async function searchGoogle(page, query) {
  console.log('   🔍 Google...');

  await page.goto('https://www.google.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(randomDelay(CONFIG.PAUSE_AFTER_SEARCH));

  // Manejar consent de cookies
  try {
    const consentBtn = await page.$('button[id="L2AGLb"], [aria-label="Aceptar todo"], [aria-label="Accept all"]');
    if (consentBtn) { await consentBtn.click(); await sleep(1000); }
  } catch {}

  await randomMouseMove(page);

  const input = await page.$('input[name="q"], textarea[name="q"]');
  if (!input) { console.log('   ⚠️ No input Google'); return []; }

  const selector = (await page.$('textarea[name="q"]')) ? 'textarea[name="q"]' : 'input[name="q"]';
  await humanType(page, selector, query);
  await sleep(random(800, 1500));
  await page.keyboard.press('Enter');

  try {
    await page.waitForSelector('#search, #rso', { timeout: 15000 });
  } catch {
    // Posible CAPTCHA - no insistir
    console.log('   ⚠️ Google posible CAPTCHA, saltando...');
    return [];
  }

  await sleep(randomDelay(CONFIG.PAUSE_AFTER_SEARCH));
  await humanScroll(page);

  return page.evaluate(() => {
    const items = [];
    document.querySelectorAll('#search .g, #rso .g').forEach(el => {
      try {
        const link = el.querySelector('a[href^="http"]');
        const title = el.querySelector('h3');
        if (link && link.href && !link.href.includes('google.com')) {
          items.push({ url: link.href, title: title ? title.textContent.trim() : '' });
        }
      } catch {}
    });
    return items;
  });
}

// ============================================================
// ENGINE MANAGER - Rotación inteligente
// ============================================================
class EngineManager {
  constructor() {
    this.engines = ['duckduckgo', 'bing', 'google'];
    this.usageCount = { duckduckgo: 0, bing: 0, google: 0 };
    this.currentIdx = 0;
    this.searchCount = 0;
  }

  getNextEngine() {
    this.searchCount++;

    // Rotar cada N búsquedas
    if (this.searchCount % CONFIG.ENGINE_ROTATE_EVERY === 0) {
      this.currentIdx = (this.currentIdx + 1) % this.engines.length;
    }

    // Si el engine actual está al máximo, buscar otro
    let attempts = 0;
    while (attempts < this.engines.length) {
      const engine = this.engines[this.currentIdx];
      if (this.usageCount[engine] < CONFIG.ENGINE_MAX_PER_SESSION[engine]) {
        return engine;
      }
      this.currentIdx = (this.currentIdx + 1) % this.engines.length;
      attempts++;
    }

    // Si todos están al máximo, resetear DDG (el más permisivo)
    this.usageCount.duckduckgo = 0;
    return 'duckduckgo';
  }

  recordUse(engine) {
    this.usageCount[engine]++;
  }

  getStats() {
    return { ...this.usageCount, total: this.searchCount };
  }
}

// ============================================================
// BÚSQUEDA PRINCIPAL
// ============================================================
async function searchCompany(browser, companyName, engineManager) {
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    locale: 'es-PE',
    timezoneId: 'America/Lima',
  });

  const page = await context.newPage();

  try {
    const engine = engineManager.getNextEngine();
    const query = buildQuery(companyName, engine);

    console.log(`\n🔍 Buscando: "${companyName}"`);
    console.log(`   Motor: ${engine} | Query: ${query}`);

    let results = [];

    // Buscar con el motor seleccionado
    try {
      switch (engine) {
        case 'duckduckgo': results = await searchDuckDuckGo(page, query); break;
        case 'bing': results = await searchBing(page, query); break;
        case 'google': results = await searchGoogle(page, query); break;
      }
      engineManager.recordUse(engine);
    } catch (err) {
      console.log(`   ⚠️ Error con ${engine}: ${err.message}`);
    }

    console.log(`   📊 ${results.length} resultados`);

    // Si no hay resultados, intentar con otro motor (nuevo context/page)
    if (results.length === 0) {
      const fallback = engine === 'duckduckgo' ? 'bing' : 'duckduckgo';
      const fallbackQuery = buildQuery(companyName, fallback);
      console.log(`   🔄 Fallback: ${fallback}`);
      await sleep(random(2000, 4000));

      // Cerrar context anterior y crear uno nuevo
      await context.close().catch(() => {});
      const fallbackContext = await browser.newContext({
        viewport: { width: 1366, height: 768 },
        locale: 'es-PE',
        timezoneId: 'America/Lima',
      });
      const fallbackPage = await fallbackContext.newPage();

      try {
        switch (fallback) {
          case 'duckduckgo': results = await searchDuckDuckGo(fallbackPage, fallbackQuery); break;
          case 'bing': results = await searchBing(fallbackPage, fallbackQuery); break;
          case 'google': results = await searchGoogle(fallbackPage, fallbackQuery); break;
        }
        engineManager.recordUse(fallback);
      } catch (err) {
        console.log(`   ⚠️ Error fallback: ${err.message}`);
      } finally {
        await fallbackContext.close().catch(() => {});
      }

      console.log(`   📊 ${results.length} resultados (fallback)`);
    }

    // Filtrar y puntuar
    const seen = new Set();
    const valid = results
      .filter(r => {
        if (!r.url || isBlacklisted(r.url)) return false;
        try {
          const domain = new URL(r.url).hostname;
          if (seen.has(domain)) return false;
          seen.add(domain);
          return true;
        } catch { return false; }
      })
      .map(r => ({ ...r, score: scoreResult(r.url, r.title, companyName) }))
      .sort((a, b) => b.score - a.score);

    if (valid.length === 0) {
      console.log('   ❌ Sin resultados válidos');
      return { engine, result: null };
    }

    console.log('   📋 Top:');
    for (let i = 0; i < Math.min(3, valid.length); i++) {
      console.log(`      ${i + 1}. ${valid[i].url} (score: ${valid[i].score})`);
    }

    const best = valid[0];
    console.log(`   ✅ ${best.url}`);

    return { engine, result: best };

  } finally {
    await context.close().catch(() => {});
  }
}

// ============================================================
// BATCH PROCESSING
// ============================================================
async function processBatch(csvPath, options = {}) {
  const { headless = false, startFrom = 0, limit = null } = options;

  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }

  // Leer CSV
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  const header = lines[0].split(',');
  const data = lines.slice(1);

  // Detectar columnas (RUC = col 0, RazonSocial = col 1)
  const rucIdx = 0;
  const nameIdx = header.findIndex(h => h.toLowerCase().includes('razon') || h.toLowerCase().includes('nombre'));
  const nameColIdx = nameIdx >= 0 ? nameIdx : 1;

  console.log(`\n📁 Archivo: ${path.basename(csvPath)}`);
  console.log(`📊 Total: ${data.length} empresas`);
  console.log(`🚀 Desde: ${startFrom} | Límite: ${limit || 'sin límite'}`);

  // Output
  const baseName = path.basename(csvPath, '.csv');
  const outputPath = path.join(CONFIG.OUTPUT_DIR, `${baseName}_websites.csv`);

  // Cargar progreso previo
  const processed = new Set();
  if (fs.existsSync(outputPath)) {
    const existing = fs.readFileSync(outputPath, 'utf-8').trim().split('\n').slice(1);
    for (const line of existing) {
      const ruc = line.split(',')[0];
      if (ruc) processed.add(ruc);
    }
    console.log(`📝 Ya procesados: ${processed.size}`);
  } else {
    fs.writeFileSync(outputPath, 'ruc,company_name,website_url,score,engine,timestamp\n');
  }

  // Iniciar Firefox
  console.log(`\n🦊 Iniciando Firefox (headless: ${headless})...`);
  const browser = await firefox.launch({ headless, slowMo: 50 });
  const engineManager = new EngineManager();

  let count = 0;
  let batchCount = 0;
  let found = 0;

  try {
    for (let i = startFrom; i < data.length; i++) {
      if (limit && count >= limit) break;

      const line = data[i];
      const parts = line.split(',');
      const ruc = parts[rucIdx]?.trim();
      const name = parts[nameColIdx]?.trim();

      if (!ruc || !name || processed.has(ruc)) continue;

      console.log(`\n━━━ [${count + 1}/${limit || data.length - startFrom}] ━━━`);

      const { engine, result } = await searchCompany(browser, name, engineManager);

      if (result) found++;

      // Guardar
      const row = [
        ruc,
        `"${name.replace(/"/g, '""')}"`,
        result ? result.url : '',
        result ? result.score : 0,
        engine,
        new Date().toISOString(),
      ].join(',');

      fs.appendFileSync(outputPath, row + '\n');
      processed.add(ruc);
      count++;
      batchCount++;

      // Pausa entre búsquedas
      const delay = randomDelay(CONFIG.PAUSE_BETWEEN_SEARCHES);
      console.log(`   ⏳ ${(delay / 1000).toFixed(0)}s...`);
      await sleep(delay);

      // Pausa larga por batch
      if (batchCount >= CONFIG.BATCH_SIZE) {
        const stats = engineManager.getStats();
        console.log(`\n☕ Pausa anti-ban... (DDG: ${stats.duckduckgo}, Bing: ${stats.bing}, Google: ${stats.google})`);
        const pause = randomDelay(CONFIG.BATCH_PAUSE);
        console.log(`   ${(pause / 60000).toFixed(1)} minutos...`);
        await sleep(pause);
        batchCount = 0;
      }
    }
  } finally {
    await browser.close();
  }

  const stats = engineManager.getStats();
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN');
  console.log('='.repeat(50));
  console.log(`   Procesadas: ${count}`);
  console.log(`   Encontradas: ${found} (${((found / count) * 100).toFixed(1)}%)`);
  console.log(`   Motores: DDG ${stats.duckduckgo} | Bing ${stats.bing} | Google ${stats.google}`);
  console.log(`   Archivo: ${outputPath}`);
}

// ============================================================
// CLI
// ============================================================
async function main() {
  const args = process.argv.slice(2);

  const headless = args.includes('--headless');
  const isBatch = args.includes('--batch');
  const startIdx = args.indexOf('--start');
  const limitIdx = args.indexOf('--limit');

  const startFrom = startIdx > -1 ? parseInt(args[startIdx + 1]) : 0;
  const limit = limitIdx > -1 ? parseInt(args[limitIdx + 1]) : null;

  // Argumentos posicionales (no flags)
  const flagArgs = new Set(['--headless', '--batch', '--start', '--limit']);
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (flagArgs.has(args[i])) {
      if (args[i] === '--start' || args[i] === '--limit') i++; // Skip next
      continue;
    }
    positional.push(args[i]);
  }

  if (isBatch && positional.length > 0) {
    let csvPath = positional[0];
    if (!path.isAbsolute(csvPath)) {
      // Buscar en data/ primero
      const dataPath = path.join(__dirname, '../../data', csvPath);
      if (fs.existsSync(dataPath)) {
        csvPath = dataPath;
      } else {
        csvPath = path.join(process.cwd(), csvPath);
      }
    }

    if (!fs.existsSync(csvPath)) {
      console.error(`❌ No encontrado: ${csvPath}`);
      process.exit(1);
    }

    await processBatch(csvPath, { headless, startFrom, limit });

  } else if (positional.length > 0) {
    const name = positional.join(' ');
    console.log(`\n🦊 Iniciando Firefox (headless: ${headless})...`);
    const browser = await firefox.launch({ headless, slowMo: 50 });
    const engineManager = new EngineManager();

    try {
      const { result } = await searchCompany(browser, name, engineManager);
      if (result) {
        console.log('\n📌 Resultado:');
        console.log(`   URL: ${result.url}`);
        console.log(`   Score: ${result.score}`);
      }
    } finally {
      await browser.close();
    }

  } else {
    console.log(`
🦊 Firefox Multi-Engine Scraper

Uso:
  node firefox-scraper.js "Nombre Empresa"
  node firefox-scraper.js --headless "Empresa"
  node firefox-scraper.js --batch archivo.csv [--start N] [--limit N] [--headless]

Ejemplos:
  node firefox-scraper.js "INTERBANK"
  node firefox-scraper.js --batch tier1_mega_enriched.csv --limit 10
  node firefox-scraper.js --batch tier2_grandes_enriched.csv --start 100 --limit 50 --headless

Motores: DuckDuckGo → Bing → Google (rotación automática)
Anti-ban: Delays humanos, pausas cada ${CONFIG.BATCH_SIZE} empresas
`);
  }
}

module.exports = { searchCompany, EngineManager, cleanCompanyName, buildQuery };

main().catch(console.error);
