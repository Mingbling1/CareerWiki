/**
 * EMPLIQ - Web Search Scraper con Puppeteer
 * 
 * Busca la página web oficial de empresas peruanas.
 * Usa DuckDuckGo (más permisivo) con fallback a Bing.
 * 
 * Uso:
 *   node google-search.js "Banco de Crédito del Perú"
 *   node google-search.js --test
 *   node google-search.js --debug "Interbank"  # Modo visible (no headless)
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
  DELAY_BETWEEN_SEARCHES: { min: 5000, max: 10000 },
  DELAY_TYPING: { min: 30, max: 100 },
  DELAY_AFTER_LOAD: { min: 1500, max: 3000 },
  
  USER_AGENTS: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  ],
  
  BLACKLIST: [
    'linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'youtube.com', 'wikipedia.org', 'glassdoor.com', 'indeed.com',
    'computrabajo.com', 'bumeran.com', 'sunat.gob.pe', 'google.com',
    'duckduckgo.com', 'bing.com', 'mercadolibre.com', 'amazon.com',
  ],
  
  PREFERRED_TLDS: ['.pe', '.com.pe', '.gob.pe', '.org.pe'],
};

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
  const stopwords = ['SAC', 'SA', 'SRL', 'EIRL', 'SAA', 'SOCIEDAD', 'ANONIMA', 'CERRADA', 'LIMITADA'];
  for (const word of stopwords) {
    const regex = new RegExp('\\b' + word + '\\b', 'gi');
    clean = clean.replace(regex, '');
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
  try {
    const domain = new URL(url).hostname.toLowerCase();
    const companyWords = cleanCompanyName(companyName).toLowerCase().split(' ').filter(w => w.length > 2);
    
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
  } catch (e) {
    // ignore
  }
  
  return score;
}

async function searchDuckDuckGo(page, query) {
  console.log('   📡 Buscando en DuckDuckGo...');
  
  try {
    await page.goto('https://duckduckgo.com/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await sleep(randomDelay(CONFIG.DELAY_AFTER_LOAD));
    
    const searchInput = await page.$('input[name="q"]');
    if (!searchInput) {
      console.log('   ⚠️  No se encontró input de búsqueda en DDG');
      return [];
    }
    
    await page.click('input[name="q"]');
    await page.type('input[name="q"]', query, { delay: randomDelay(CONFIG.DELAY_TYPING) });
    await sleep(500);
    
    await page.keyboard.press('Enter');
    
    try {
      await page.waitForSelector('[data-testid="result"], .result, article', { timeout: 15000 });
    } catch (e) {
      await sleep(3000);
    }
    
    await sleep(randomDelay(CONFIG.DELAY_AFTER_LOAD));
    
    const results = await page.evaluate(() => {
      const items = [];
      const selectors = ['[data-testid="result"]', '.result', 'article'];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          try {
            const link = el.querySelector('a[href^="http"]');
            const titleEl = el.querySelector('h2, [data-testid="result-title-a"]');
            
            if (link && link.href && !link.href.includes('duckduckgo.com')) {
              items.push({
                url: link.href,
                title: titleEl ? titleEl.textContent.trim() : '',
              });
            }
          } catch (e) {
            // ignore
          }
        }
        if (items.length > 0) break;
      }
      
      return items;
    });
    
    console.log('   📊 DDG encontró ' + results.length + ' resultados');
    return results;
    
  } catch (error) {
    console.log('   ⚠️  Error en DuckDuckGo: ' + error.message);
    return [];
  }
}

async function searchBing(page, query) {
  console.log('   📡 Buscando en Bing...');
  
  try {
    await page.goto('https://www.bing.com/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await sleep(randomDelay(CONFIG.DELAY_AFTER_LOAD));
    
    const searchInput = await page.$('input[name="q"], textarea[name="q"]');
    if (!searchInput) {
      console.log('   ⚠️  No se encontró input en Bing');
      return [];
    }
    
    await page.click('input[name="q"], textarea[name="q"]');
    await page.type('input[name="q"], textarea[name="q"]', query, { delay: randomDelay(CONFIG.DELAY_TYPING) });
    await sleep(500);
    
    await page.keyboard.press('Enter');
    
    try {
      await page.waitForSelector('#b_results, .b_algo', { timeout: 15000 });
    } catch (e) {
      await sleep(3000);
    }
    
    await sleep(randomDelay(CONFIG.DELAY_AFTER_LOAD));
    
    const results = await page.evaluate(() => {
      const items = [];
      const elements = document.querySelectorAll('.b_algo, #b_results > li');
      
      for (const el of elements) {
        try {
          const link = el.querySelector('a[href^="http"]');
          const titleEl = el.querySelector('h2');
          
          if (link && link.href && !link.href.includes('bing.com')) {
            items.push({
              url: link.href,
              title: titleEl ? titleEl.textContent.trim() : '',
            });
          }
        } catch (e) {
          // ignore
        }
      }
      
      return items;
    });
    
    console.log('   📊 Bing encontró ' + results.length + ' resultados');
    return results;
    
  } catch (error) {
    console.log('   ⚠️  Error en Bing: ' + error.message);
    return [];
  }
}

async function searchCompanyWebsite(companyName, options = {}) {
  const { debug = false, browser: existingBrowser = null } = options;
  const shouldCloseBrowser = !existingBrowser;
  
  let browser = existingBrowser;
  
  if (!browser) {
    console.log('   🚀 Iniciando navegador...');
    browser = await puppeteer.launch({
      headless: debug ? false : 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
      ],
      defaultViewport: { width: 1366, height: 768 },
    });
  }
  
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent(getRandomUserAgent());
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    
    const cleanName = cleanCompanyName(companyName);
    // Query mejorada con etiquetas para filtrar resultados
    // - Comillas para búsqueda exacta del nombre
    // - Excluir redes sociales con -site:
    // - Agregar "peru" y términos que indican página oficial
    const query = `"${cleanName}" peru (sitio web oficial OR página oficial OR website) -site:linkedin.com -site:facebook.com -site:twitter.com`;
    
    console.log('\n🔍 Buscando: "' + companyName + '"');
    console.log('   Query: "' + query + '"');
    
    let allResults = [];
    
    const ddgResults = await searchDuckDuckGo(page, query);
    allResults = allResults.concat(ddgResults);
    
    if (allResults.length < 3) {
      await sleep(2000);
      const bingResults = await searchBing(page, query);
      allResults = allResults.concat(bingResults);
    }
    
    if (allResults.length === 0) {
      console.log('   ❌ No se encontraron resultados');
      
      if (debug) {
        const screenshotPath = path.join(__dirname, 'debug_screenshot.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log('   📸 Screenshot guardado: ' + screenshotPath);
      }
      
      return null;
    }
    
    const seen = new Set();
    const validResults = allResults
      .filter(r => {
        if (!r.url || isBlacklisted(r.url)) return false;
        try {
          const domain = new URL(r.url).hostname;
          if (seen.has(domain)) return false;
          seen.add(domain);
          return true;
        } catch (e) {
          return false;
        }
      })
      .map(r => ({ ...r, score: scoreResult(r.url, r.title, companyName) }))
      .sort((a, b) => b.score - a.score);
    
    if (validResults.length === 0) {
      console.log('   ❌ No se encontraron resultados válidos');
      return null;
    }
    
    console.log('\n   📋 Top resultados:');
    for (let i = 0; i < Math.min(3, validResults.length); i++) {
      const r = validResults[i];
      console.log('      ' + (i + 1) + '. ' + r.url + ' (score: ' + r.score + ')');
    }
    
    const best = validResults[0];
    console.log('\n   ✅ Mejor: ' + best.url);
    
    return best;
    
  } catch (error) {
    console.error('   ❌ Error: ' + error.message);
    return null;
  } finally {
    await page.close();
    if (shouldCloseBrowser) {
      await browser.close();
    }
  }
}

async function testSearch() {
  const testCompanies = [
    'BANCO DE CREDITO DEL PERU',
    'INTERBANK',
    'ALICORP S.A.A.',
    'BACKUS Y JOHNSTON',
    'GLORIA S.A.',
  ];
  
  console.log('🧪 TEST MODE - Probando búsqueda de empresas\n');
  console.log('='.repeat(60));
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  
  const results = [];
  
  for (const company of testCompanies) {
    const result = await searchCompanyWebsite(company, { browser });
    results.push({
      company,
      url: result ? result.url : 'NOT FOUND',
      score: result ? result.score : 0,
    });
    
    const delay = randomDelay(CONFIG.DELAY_BETWEEN_SEARCHES);
    console.log('\n   ⏳ Esperando ' + (delay / 1000).toFixed(1) + 's...\n');
    await sleep(delay);
  }
  
  await browser.close();
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 RESUMEN DE RESULTADOS');
  console.log('='.repeat(60));
  
  let found = 0;
  for (const r of results) {
    const status = r.url !== 'NOT FOUND' ? '✅' : '❌';
    if (r.url !== 'NOT FOUND') found++;
    console.log(status + ' ' + r.company);
    console.log('   → ' + r.url + ' (score: ' + r.score + ')');
  }
  
  console.log('\n📊 Encontradas: ' + found + '/' + results.length);
}

async function main() {
  const args = process.argv.slice(2);
  
  const debug = args.includes('--debug');
  const isTest = args.includes('--test');
  
  const companyName = args.filter(a => !a.startsWith('--')).join(' ');
  
  if (isTest) {
    await testSearch();
  } else if (companyName) {
    const result = await searchCompanyWebsite(companyName, { debug });
    
    if (result) {
      console.log('\n📌 Resultado final:');
      console.log('   URL: ' + result.url);
      console.log('   Título: ' + (result.title || 'N/A'));
      console.log('   Score: ' + result.score);
    }
  } else {
    console.log('Uso:');
    console.log('  node google-search.js "Nombre de Empresa"');
    console.log('  node google-search.js --debug "Nombre"  # Modo visible');
    console.log('  node google-search.js --test');
  }
}

main().catch(console.error);
