/**
 * EMPLIQ - DuckDuckGo HTTP Scraper (sin navegador)
 * 
 * Usa la versión HTML de DuckDuckGo que NO requiere JavaScript.
 * Funciona con simples HTTP requests → perfecto para n8n.
 * 
 * Modos:
 *   1. CLI directo: node ddg-http-search.js "Empresa"
 *   2. Servidor HTTP: node ddg-http-search.js --server (para n8n)
 *   3. Batch CSV: node ddg-http-search.js --batch archivo.csv
 * 
 * Para n8n:
 *   Iniciar servidor → n8n HTTP Request node → GET http://localhost:3456/search?q=Empresa
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL, URLSearchParams } = require('url');

const CONFIG = {
  DDG_HTML_URL: 'https://html.duckduckgo.com/html/',
  SERVER_PORT: 3456,
  DELAY_BETWEEN: { min: 3000, max: 8000 },
  OUTPUT_DIR: path.join(__dirname, '../../data/scraper_results'),

  USER_AGENTS: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ],

  BLACKLIST: [
    'linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'youtube.com', 'wikipedia.org', 'glassdoor.com', 'indeed.com',
    'computrabajo.com', 'bumeran.com', 'google.com', 'duckduckgo.com',
    'bing.com', 'mercadolibre.com', 'amazon.com', 'rpp.pe',
    'elcomercio.pe', 'gestion.pe', 'larepublica.pe', 'tiktok.com',
    'datosperu.org', 'universidadperu.com', 'pinterest.com',
  ],

  PREFERRED_TLDS: ['.pe', '.com.pe', '.gob.pe', '.org.pe'],
};

// ============================================================
// UTILIDADES
// ============================================================
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getUA() {
  return CONFIG.USER_AGENTS[Math.floor(Math.random() * CONFIG.USER_AGENTS.length)];
}

function cleanCompanyName(name) {
  let clean = name.toUpperCase();
  const suffixes = [
    'S\\.?A\\.?C\\.?', 'S\\.?A\\.?A\\.?', 'S\\.?A\\.?', 'S\\.?R\\.?L\\.?',
    'E\\.?I\\.?R\\.?L\\.?', 'S\\.?C\\.?R\\.?L\\.?',
    'SOCIEDAD ANONIMA CERRADA', 'SOCIEDAD ANONIMA ABIERTA',
    'SOCIEDAD ANONIMA', 'EMPRESA INDIVIDUAL DE RESPONSABILIDAD LIMITADA',
  ];
  for (const s of suffixes) {
    clean = clean.replace(new RegExp('\\b' + s + '\\b', 'gi'), '');
  }
  clean = clean.replace(/[^\w\sáéíóúñÁÉÍÓÚÑ&-]/g, ' ');
  return clean.replace(/\s+/g, ' ').trim();
}

function isBlacklisted(url) {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    return CONFIG.BLACKLIST.some(bl => domain.includes(bl));
  } catch { return true; }
}

function scoreResult(url, title, companyName) {
  let score = 0;
  try {
    const domain = new URL(url).hostname.toLowerCase();
    const words = cleanCompanyName(companyName).toLowerCase().split(/\s+/).filter(w => w.length > 2);

    if (CONFIG.PREFERRED_TLDS.some(tld => domain.endsWith(tld))) score += 15;
    for (const w of words) {
      if (w.length > 3 && domain.includes(w)) score += 10;
    }
    if (title) {
      const t = title.toLowerCase();
      for (const w of words) {
        if (w.length > 3 && t.includes(w)) score += 5;
      }
      if (t.includes('oficial') || t.includes('official')) score += 3;
    }
    if (url.startsWith('https://')) score += 2;
  } catch (e) {}
  return score;
}

// ============================================================
// DDG HTML SEARCH (sin navegador)
// ============================================================

/**
 * Hace POST a html.duckduckgo.com/html/ y parsea los resultados del HTML.
 * No necesita JavaScript ni navegador.
 */
function fetchDDGHTML(query) {
  return new Promise((resolve, reject) => {
    const postData = `q=${encodeURIComponent(query)}`;

    const options = {
      hostname: 'html.duckduckgo.com',
      path: '/html/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': getUA(),
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-PE,es;q=0.9',
        'Referer': 'https://duckduckgo.com/',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Parsear HTML de DDG (sin cheerio, solo regex)
 */
function parseDDGResults(html) {
  const results = [];

  // Cada resultado está en un <div class="result">
  // con <a class="result__a" href="...">título</a>
  // y <a class="result__url" href="...">url visible</a>

  // Pattern para links de resultados
  const resultPattern = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = resultPattern.exec(html)) !== null) {
    let url = match[1];
    let title = match[2].replace(/<[^>]*>/g, '').trim(); // Quitar HTML tags

    // DDG a veces usa redirect URLs
    if (url.includes('uddg=')) {
      try {
        const parsed = new URL(url, 'https://duckduckgo.com');
        const uddg = parsed.searchParams.get('uddg');
        if (uddg) url = uddg;
      } catch {}
    }

    // Decodificar URL
    try {
      url = decodeURIComponent(url);
    } catch {}

    if (url.startsWith('http')) {
      results.push({ url, title });
    }
  }

  return results;
}

/**
 * Buscar empresa en DDG via HTTP
 */
async function searchCompanyHTTP(companyName) {
  const cleanName = cleanCompanyName(companyName);
  const query = `"${cleanName}" peru sitio web oficial`;

  console.log(`🔍 "${companyName}"`);
  console.log(`   Query: ${query}`);

  let html;
  try {
    html = await fetchDDGHTML(query);
  } catch (err) {
    console.log(`   ⚠️ Error HTTP: ${err.message}`);
    return null;
  }

  let results = parseDDGResults(html);
  console.log(`   📊 ${results.length} resultados`);

  // Si no hay resultados, intentar sin comillas
  if (results.length === 0) {
    const query2 = `${cleanName} peru web oficial empresa`;
    console.log(`   🔄 Retry: ${query2}`);
    await sleep(random(2000, 4000));

    try {
      html = await fetchDDGHTML(query2);
      results = parseDDGResults(html);
      console.log(`   📊 ${results.length} resultados (retry)`);
    } catch (err) {
      console.log(`   ⚠️ Error retry: ${err.message}`);
    }
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
    console.log('   ❌ Sin resultados');
    return null;
  }

  const best = valid[0];
  console.log(`   ✅ ${best.url} (score: ${best.score})`);

  return { ...best, allResults: valid.slice(0, 5) };
}

// ============================================================
// SERVIDOR HTTP (para n8n)
// ============================================================
function startServer(port = CONFIG.SERVER_PORT) {
  const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://localhost:${port}`);

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (parsedUrl.pathname === '/search') {
      const query = parsedUrl.searchParams.get('q') || parsedUrl.searchParams.get('company');

      if (!query) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Parámetro "q" requerido' }));
        return;
      }

      try {
        const result = await searchCompanyHTTP(query);
        res.writeHead(200);
        res.end(JSON.stringify({
          company: query,
          cleanName: cleanCompanyName(query),
          website: result ? result.url : null,
          score: result ? result.score : 0,
          title: result ? result.title : null,
          allResults: result ? result.allResults : [],
          timestamp: new Date().toISOString(),
        }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }

    } else if (parsedUrl.pathname === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));

    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found. Use GET /search?q=Empresa' }));
    }
  });

  server.listen(port, () => {
    console.log(`\n🌐 DDG HTTP Search Server corriendo en http://localhost:${port}`);
    console.log(`\n📡 Endpoints:`);
    console.log(`   GET /search?q=INTERBANK`);
    console.log(`   GET /health`);
    console.log(`\n🔗 Para n8n:`);
    console.log(`   HTTP Request → GET http://localhost:${port}/search?q={{$json.company_name}}`);
    console.log(`\nCtrl+C para detener\n`);
  });
}

// ============================================================
// BATCH CSV
// ============================================================
async function processBatch(csvPath, options = {}) {
  const { startFrom = 0, limit = null } = options;

  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  const header = lines[0].split(',');
  const data = lines.slice(1);

  const nameColIdx = header.findIndex(h =>
    h.toLowerCase().includes('razon') || h.toLowerCase().includes('nombre')
  );
  const nameCol = nameColIdx >= 0 ? nameColIdx : 1;

  console.log(`\n📁 ${path.basename(csvPath)}`);
  console.log(`📊 Total: ${data.length} | Desde: ${startFrom} | Límite: ${limit || 'todo'}`);

  const baseName = path.basename(csvPath, '.csv');
  const outputPath = path.join(CONFIG.OUTPUT_DIR, `${baseName}_websites_http.csv`);

  const processed = new Set();
  if (fs.existsSync(outputPath)) {
    const existing = fs.readFileSync(outputPath, 'utf-8').trim().split('\n').slice(1);
    for (const line of existing) {
      const ruc = line.split(',')[0];
      if (ruc) processed.add(ruc);
    }
    console.log(`📝 Ya procesados: ${processed.size}`);
  } else {
    fs.writeFileSync(outputPath, 'ruc,company_name,website_url,score,timestamp\n');
  }

  let count = 0;
  let found = 0;

  for (let i = startFrom; i < data.length; i++) {
    if (limit && count >= limit) break;

    const parts = data[i].split(',');
    const ruc = parts[0]?.trim();
    const name = parts[nameCol]?.trim();

    if (!ruc || !name || processed.has(ruc)) continue;

    const result = await searchCompanyHTTP(name);

    if (result) found++;

    const row = [
      ruc,
      `"${name.replace(/"/g, '""')}"`,
      result ? result.url : '',
      result ? result.score : 0,
      new Date().toISOString(),
    ].join(',');

    fs.appendFileSync(outputPath, row + '\n');
    processed.add(ruc);
    count++;

    // Delay
    if (count < (limit || data.length)) {
      const delay = random(CONFIG.DELAY_BETWEEN.min, CONFIG.DELAY_BETWEEN.max);
      console.log(`   ⏳ ${(delay / 1000).toFixed(0)}s...\n`);
      await sleep(delay);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Procesadas: ${count} | Encontradas: ${found} (${count > 0 ? ((found/count)*100).toFixed(1) : 0}%)`);
  console.log(`📄 ${outputPath}`);
}

// ============================================================
// CLI
// ============================================================
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--server') || args.includes('-s')) {
    const portIdx = args.indexOf('--port');
    const port = portIdx > -1 ? parseInt(args[portIdx + 1]) : CONFIG.SERVER_PORT;
    startServer(port);
    return;
  }

  const isBatch = args.includes('--batch');
  const startIdx = args.indexOf('--start');
  const limitIdx = args.indexOf('--limit');
  const startFrom = startIdx > -1 ? parseInt(args[startIdx + 1]) : 0;
  const limit = limitIdx > -1 ? parseInt(args[limitIdx + 1]) : null;

  const flagArgs = new Set(['--batch', '--start', '--limit', '--server', '--port', '-s']);
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (flagArgs.has(args[i])) {
      if (['--start', '--limit', '--port'].includes(args[i])) i++;
      continue;
    }
    positional.push(args[i]);
  }

  if (isBatch && positional.length > 0) {
    let csvPath = positional[0];
    if (!path.isAbsolute(csvPath)) {
      const dataPath = path.join(__dirname, '../../data', csvPath);
      csvPath = fs.existsSync(dataPath) ? dataPath : path.join(process.cwd(), csvPath);
    }
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ No encontrado: ${csvPath}`);
      process.exit(1);
    }
    await processBatch(csvPath, { startFrom, limit });

  } else if (positional.length > 0) {
    await searchCompanyHTTP(positional.join(' '));

  } else {
    console.log(`
🦆 DDG HTTP Search - Búsqueda sin navegador

Uso:
  node ddg-http-search.js "Nombre Empresa"
  node ddg-http-search.js --batch archivo.csv [--start N] [--limit N]
  node ddg-http-search.js --server [--port 3456]

Servidor para n8n:
  1. Ejecutar: node ddg-http-search.js --server
  2. En n8n: HTTP Request → GET http://localhost:${CONFIG.SERVER_PORT}/search?q={{$json.company_name}}

Ejemplos:
  node ddg-http-search.js "INTERBANK"
  node ddg-http-search.js --batch tier1_mega_enriched.csv --limit 10
  node ddg-http-search.js --server --port 4000
`);
  }
}

main().catch(console.error);
