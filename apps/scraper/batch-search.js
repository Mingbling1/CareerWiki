/**
 * EMPLIQ - Batch Search para empresas
 * 
 * Procesa archivos CSV de tiers y busca websites en Google.
 * Guarda progreso para poder continuar si se interrumpe.
 * 
 * Uso:
 *   node batch-search.js --tier 1 --limit 10
 *   node batch-search.js --tier 1 --continue
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// Configuración
const DATA_DIR = '/home/jimmy/sueldos-organigrama/data';
const OUTPUT_DIR = '/home/jimmy/sueldos-organigrama/data/scraped';

const TIER_FILES = {
  1: 'tier1_mega_enriched.csv',
  2: 'tier2_grandes_enriched.csv',
  3: 'tier3_medianas_enriched.csv',
};

const CONFIG = {
  DELAY_BETWEEN_SEARCHES: { min: 10000, max: 20000 }, // 10-20 segundos entre búsquedas
  DELAY_TYPING: { min: 50, max: 150 },
  DELAY_AFTER_LOAD: { min: 2000, max: 4000 },
  SEARCHES_BEFORE_PAUSE: 10, // Pausa larga cada N búsquedas
  PAUSE_DURATION: { min: 60000, max: 120000 }, // 1-2 minutos de pausa
  
  USER_AGENTS: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  ],
  
  BLACKLIST: [
    'linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'youtube.com', 'wikipedia.org', 'glassdoor.com', 'indeed.com',
    'computrabajo.com', 'sunat.gob.pe', 'google.com', 'bing.com',
  ],
  
  PREFERRED_TLDS: ['.pe', '.com.pe', '.gob.pe', '.org.pe'],
};

// Utilidades
function randomDelay(range) {
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomUserAgent() {
  return CONFIG.USER_AGENTS[Math.floor(Math.random() * CONFIG.USER_AGENTS.length)];
}

function cleanCompanyName(name) {
  let clean = name.replace(/[^\w\sáéíóúñÁÉÍÓÚÑ]/g, ' ');
  const stopwords = ['S.A.C.', 'SAC', 'S.A.', 'SA', 'S.R.L.', 'SRL', 'E.I.R.L.', 'EIRL', 
                     'SOCIEDAD', 'ANONIMA', 'CERRADA', 'LIMITADA', 'S.A.A.', 'SAA'];
  for (const word of stopwords) {
    clean = clean.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  }
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
  const domain = new URL(url).hostname.toLowerCase();
  const companyWords = cleanCompanyName(companyName).toLowerCase().split(' ');
  
  if (CONFIG.PREFERRED_TLDS.some(tld => domain.endsWith(tld))) score += 15;
  for (const word of companyWords) {
    if (word.length > 3 && domain.includes(word)) score += 8;
  }
  if (title) {
    const titleLower = title.toLowerCase();
    for (const word of companyWords) {
      if (word.length > 3 && titleLower.includes(word)) score += 4;
    }
  }
  if (url.startsWith('https://')) score += 2;
  
  return score;
}

/**
 * Carga el progreso guardado
 */
function loadProgress(tier) {
  const progressFile = path.join(OUTPUT_DIR, `tier${tier}_progress.json`);
  if (fs.existsSync(progressFile)) {
    return JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
  }
  return { processedRucs: [], lastIndex: 0 };
}

/**
 * Guarda el progreso
 */
function saveProgress(tier, progress) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  const progressFile = path.join(OUTPUT_DIR, `tier${tier}_progress.json`);
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
}

/**
 * Guarda resultado individual
 */
function appendResult(tier, result) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const outputFile = path.join(OUTPUT_DIR, `tier${tier}_results.csv`);
  const header = 'RUC,RazonSocial,Website,WebsiteTitle,Score,Status,ScrapedAt\n';
  
  if (!fs.existsSync(outputFile)) {
    fs.writeFileSync(outputFile, header);
  }
  
  const row = [
    result.ruc,
    `"${result.razonSocial.replace(/"/g, '""')}"`,
    result.website || '',
    `"${(result.websiteTitle || '').replace(/"/g, '""')}"`,
    result.score || 0,
    result.status,
    new Date().toISOString(),
  ].join(',');
  
  fs.appendFileSync(outputFile, row + '\n');
}

/**
 * Busca website de una empresa
 */
async function searchCompany(page, companyName) {
  try {
    const cleanName = cleanCompanyName(companyName);
    const query = `${cleanName} peru sitio web oficial`;
    
    // Ir a Google
    await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });
    await sleep(randomDelay(CONFIG.DELAY_AFTER_LOAD));
    
    // Aceptar cookies si aparece
    try {
      const acceptButton = await page.$('button[id="L2AGLb"]');
      if (acceptButton) await acceptButton.click();
    } catch {}
    
    // Buscar input
    const searchInput = await page.$('textarea[name="q"], input[name="q"]');
    if (!searchInput) throw new Error('No se encontró campo de búsqueda');
    
    // Escribir query
    await page.click('textarea[name="q"], input[name="q"]');
    for (const char of query) {
      await page.keyboard.type(char);
      await sleep(randomDelay(CONFIG.DELAY_TYPING));
    }
    await sleep(500);
    await page.keyboard.press('Enter');
    
    // Esperar resultados
    await page.waitForSelector('#search', { timeout: 15000 });
    await sleep(randomDelay(CONFIG.DELAY_AFTER_LOAD));
    
    // Extraer resultados
    const results = await page.evaluate(() => {
      const items = [];
      const searchResults = document.querySelectorAll('#search .g');
      
      for (const result of searchResults) {
        try {
          const linkEl = result.querySelector('a[href^="http"]');
          const titleEl = result.querySelector('h3');
          
          if (linkEl && linkEl.href) {
            items.push({
              url: linkEl.href,
              title: titleEl ? titleEl.textContent : '',
            });
          }
        } catch {}
      }
      return items;
    });
    
    // Filtrar y puntuar
    const validResults = results
      .filter(r => !isBlacklisted(r.url))
      .map(r => ({ ...r, score: scoreResult(r.url, r.title, companyName) }))
      .sort((a, b) => b.score - a.score);
    
    if (validResults.length === 0) {
      return { status: 'not_found' };
    }
    
    const best = validResults[0];
    return {
      status: 'found',
      website: best.url,
      websiteTitle: best.title,
      score: best.score,
    };
    
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

/**
 * Procesa un batch de empresas
 */
async function processBatch(tier, limit, continueFromLast) {
  // Cargar CSV del tier
  const tierFile = path.join(DATA_DIR, TIER_FILES[tier]);
  if (!fs.existsSync(tierFile)) {
    console.error(`❌ No existe el archivo: ${tierFile}`);
    return;
  }
  
  const csvContent = fs.readFileSync(tierFile, 'utf-8');
  const companies = parse(csvContent, { columns: true });
  
  console.log(`\n📊 Tier ${tier}: ${companies.length} empresas`);
  
  // Cargar progreso
  const progress = loadProgress(tier);
  const startIndex = continueFromLast ? progress.lastIndex : 0;
  const processedSet = new Set(progress.processedRucs);
  
  console.log(`📌 Comenzando desde índice: ${startIndex}`);
  console.log(`📌 Ya procesadas: ${processedSet.size} empresas`);
  
  // Filtrar empresas a procesar
  const toProcess = companies
    .slice(startIndex)
    .filter(c => !processedSet.has(c.RUC))
    .slice(0, limit);
  
  console.log(`📌 A procesar: ${toProcess.length} empresas\n`);
  
  if (toProcess.length === 0) {
    console.log('✅ No hay más empresas por procesar');
    return;
  }
  
  // Iniciar browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  });
  
  const page = await browser.newPage();
  await page.setUserAgent(getRandomUserAgent());
  await page.setViewport({ width: 1920, height: 1080 });
  
  let searchCount = 0;
  let foundCount = 0;
  
  try {
    for (let i = 0; i < toProcess.length; i++) {
      const company = toProcess[i];
      searchCount++;
      
      console.log(`\n[${i + 1}/${toProcess.length}] ${company.RazonSocial}`);
      console.log(`   RUC: ${company.RUC}`);
      
      const result = await searchCompany(page, company.RazonSocial);
      
      // Guardar resultado
      appendResult(tier, {
        ruc: company.RUC,
        razonSocial: company.RazonSocial,
        ...result,
      });
      
      // Actualizar progreso
      progress.processedRucs.push(company.RUC);
      progress.lastIndex = startIndex + i + 1;
      saveProgress(tier, progress);
      
      if (result.status === 'found') {
        foundCount++;
        console.log(`   ✅ ${result.website} (score: ${result.score})`);
      } else if (result.status === 'error') {
        console.log(`   ❌ Error: ${result.error}`);
      } else {
        console.log(`   ⚠️  No encontrado`);
      }
      
      // Delay entre búsquedas
      if (i < toProcess.length - 1) {
        // Pausa larga cada N búsquedas
        if (searchCount % CONFIG.SEARCHES_BEFORE_PAUSE === 0) {
          const pauseTime = randomDelay(CONFIG.PAUSE_DURATION);
          console.log(`\n   🛑 Pausa larga: ${(pauseTime / 1000 / 60).toFixed(1)} minutos...`);
          
          // Cambiar user agent durante la pausa
          await page.setUserAgent(getRandomUserAgent());
          await sleep(pauseTime);
        } else {
          const delay = randomDelay(CONFIG.DELAY_BETWEEN_SEARCHES);
          console.log(`   ⏳ Esperando ${(delay / 1000).toFixed(1)}s...`);
          await sleep(delay);
        }
      }
    }
    
  } finally {
    await browser.close();
  }
  
  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`   Procesadas: ${searchCount}`);
  console.log(`   Encontradas: ${foundCount}`);
  console.log(`   No encontradas: ${searchCount - foundCount}`);
  console.log(`   Tasa de éxito: ${((foundCount / searchCount) * 100).toFixed(1)}%`);
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  let tier = 1;
  let limit = 10;
  let continueFromLast = false;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tier' && args[i + 1]) {
      tier = parseInt(args[i + 1]);
    }
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1]);
    }
    if (args[i] === '--continue') {
      continueFromLast = true;
    }
  }
  
  if (![1, 2, 3].includes(tier)) {
    console.error('❌ Tier debe ser 1, 2 o 3');
    return;
  }
  
  console.log('='.repeat(60));
  console.log('🏢 EMPLIQ - Batch Website Search');
  console.log('='.repeat(60));
  console.log(`📌 Tier: ${tier}`);
  console.log(`📌 Límite: ${limit} empresas`);
  console.log(`📌 Continuar: ${continueFromLast ? 'Sí' : 'No'}`);
  
  await processBatch(tier, limit, continueFromLast);
  
  console.log('\n✅ Proceso completado!');
}

main().catch(console.error);
