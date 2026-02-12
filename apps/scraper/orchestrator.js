/**
 * EMPLIQ - Scraping Orchestrator
 * 
 * Orquesta el scraping de los 3 tiers de empresas de forma programada.
 * Alternativa a n8n para procesos que necesitan navegador real.
 * 
 * Estrategia:
 *   - Procesa en orden: Tier 1 (más grandes) → Tier 2 → Tier 3
 *   - Rota motores de búsqueda automáticamente
 *   - Guarda progreso (puede resumir si se interrumpe)
 *   - Pausas largas entre sesiones para evitar bans
 *   - Genera resumen al finalizar cada tier
 * 
 * Uso:
 *   node orchestrator.js                    # Procesar todo
 *   node orchestrator.js --tier 1           # Solo tier 1
 *   node orchestrator.js --tier 1 --limit 5 # Tier 1, solo 5
 *   node orchestrator.js --status           # Ver progreso
 *   node orchestrator.js --headless         # Sin ventana
 * 
 * Con PM2 (recomendado para ejecución larga):
 *   pm2 start orchestrator.js -- --headless
 *   pm2 logs orchestrator
 *   pm2 stop orchestrator
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const RESULTS_DIR = path.join(DATA_DIR, 'scraper_results');
const STATUS_FILE = path.join(RESULTS_DIR, 'orchestrator_status.json');

const TIERS = [
  { name: 'tier1_mega_enriched.csv', label: 'Tier 1 (≥1000 trabajadores)' },
  { name: 'tier2_grandes_enriched.csv', label: 'Tier 2 (500-999 trabajadores)' },
  { name: 'tier3_medianas_enriched.csv', label: 'Tier 3 (100-499 trabajadores)' },
];

// Pausa entre tiers (10-15 minutos)
const TIER_PAUSE_MS = { min: 600000, max: 900000 };

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function log(msg) {
  const ts = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
  console.log(`[${ts}] ${msg}`);
}

/**
 * Cargar o crear status
 */
function loadStatus() {
  if (fs.existsSync(STATUS_FILE)) {
    return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
  }
  return {
    startedAt: new Date().toISOString(),
    tiers: {},
  };
}

function saveStatus(status) {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

/**
 * Cuenta empresas en CSV
 */
function countCSV(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  return content.trim().split('\n').length - 1; // Quitar header
}

/**
 * Cuenta procesadas en resultado
 */
function countProcessed(tierName) {
  const baseName = path.basename(tierName, '.csv');
  const resultPath = path.join(RESULTS_DIR, `${baseName}_websites.csv`);
  if (!fs.existsSync(resultPath)) return 0;
  const content = fs.readFileSync(resultPath, 'utf-8').trim();
  return content.split('\n').length - 1; // Quitar header
}

/**
 * Cuenta las que encontraron website
 */
function countFound(tierName) {
  const baseName = path.basename(tierName, '.csv');
  const resultPath = path.join(RESULTS_DIR, `${baseName}_websites.csv`);
  if (!fs.existsSync(resultPath)) return 0;
  const lines = fs.readFileSync(resultPath, 'utf-8').trim().split('\n').slice(1);
  return lines.filter(l => {
    const parts = l.split(',');
    return parts[2] && parts[2].trim() && parts[2].trim() !== '';
  }).length;
}

/**
 * Mostrar estado actual
 */
function showStatus() {
  const status = loadStatus();

  console.log('\n🔍 EMPLIQ - Estado del Scraping');
  console.log('='.repeat(60));

  for (const tier of TIERS) {
    const csvPath = path.join(DATA_DIR, tier.name);
    if (!fs.existsSync(csvPath)) {
      console.log(`\n❌ ${tier.label}: archivo no encontrado`);
      continue;
    }

    const total = countCSV(csvPath);
    const processed = countProcessed(tier.name);
    const found = countFound(tier.name);
    const pct = total > 0 ? ((processed / total) * 100).toFixed(1) : 0;
    const foundPct = processed > 0 ? ((found / processed) * 100).toFixed(1) : 0;

    const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));

    console.log(`\n📊 ${tier.label}`);
    console.log(`   [${bar}] ${pct}%`);
    console.log(`   Total: ${total} | Procesadas: ${processed} | Websites: ${found} (${foundPct}%)`);
  }

  if (status.startedAt) {
    console.log(`\n⏰ Iniciado: ${status.startedAt}`);
  }
  console.log('');
}

/**
 * Ejecutar firefox-scraper para un tier
 */
function runScraper(tierName, options = {}) {
  const { headless = false, limit = null } = options;

  return new Promise((resolve, reject) => {
    const csvPath = path.join(DATA_DIR, tierName);
    const processed = countProcessed(tierName);

    const args = [
      path.join(__dirname, 'firefox-scraper.js'),
      '--batch', csvPath,
      '--start', String(processed),
    ];

    if (headless) args.push('--headless');
    if (limit) args.push('--limit', String(limit));

    log(`🚀 Ejecutando: node ${args.map(a => a.includes(' ') ? `"${a}"` : a).join(' ')}`);

    const child = spawn('node', args, {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env },
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Scraper terminó con código ${code}`));
      }
    });

    child.on('error', reject);
  });
}

/**
 * Proceso principal
 */
async function orchestrate(options = {}) {
  const { tier = null, headless = false, limit = null } = options;

  const status = loadStatus();
  const tiersToProcess = tier
    ? TIERS.filter((_, i) => i + 1 === tier)
    : TIERS;

  log('🎯 EMPLIQ Scraping Orchestrator');
  log(`   Tiers: ${tiersToProcess.map(t => t.label).join(', ')}`);
  log(`   Headless: ${headless}`);
  if (limit) log(`   Límite por tier: ${limit}`);

  for (let i = 0; i < tiersToProcess.length; i++) {
    const t = tiersToProcess[i];
    const csvPath = path.join(DATA_DIR, t.name);

    if (!fs.existsSync(csvPath)) {
      log(`⚠️ Saltando ${t.label}: archivo no encontrado`);
      continue;
    }

    const total = countCSV(csvPath);
    const processed = countProcessed(t.name);

    if (processed >= total && !limit) {
      log(`✅ ${t.label}: ya completado (${processed}/${total})`);
      continue;
    }

    log(`\n${'━'.repeat(60)}`);
    log(`📋 Procesando: ${t.label}`);
    log(`   Progreso: ${processed}/${total}`);
    log(`━`.repeat(60));

    try {
      await runScraper(t.name, { headless, limit });

      const newProcessed = countProcessed(t.name);
      const found = countFound(t.name);

      status.tiers[t.name] = {
        total,
        processed: newProcessed,
        found,
        lastRunAt: new Date().toISOString(),
      };
      saveStatus(status);

      log(`✅ ${t.label}: ${newProcessed}/${total} procesadas, ${found} websites`);

    } catch (err) {
      log(`❌ Error en ${t.label}: ${err.message}`);
      status.tiers[t.name] = {
        ...status.tiers[t.name],
        lastError: err.message,
        lastErrorAt: new Date().toISOString(),
      };
      saveStatus(status);
    }

    // Pausa entre tiers
    if (i < tiersToProcess.length - 1) {
      const pause = random(TIER_PAUSE_MS.min, TIER_PAUSE_MS.max);
      log(`\n☕ Pausa entre tiers: ${(pause / 60000).toFixed(1)} minutos...`);
      await sleep(pause);
    }
  }

  log('\n🏁 Orchestrator finalizado');
  showStatus();
}

// CLI
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--status')) {
    showStatus();
    return;
  }

  const headless = args.includes('--headless');
  const tierIdx = args.indexOf('--tier');
  const limitIdx = args.indexOf('--limit');

  const tier = tierIdx > -1 ? parseInt(args[tierIdx + 1]) : null;
  const limit = limitIdx > -1 ? parseInt(args[limitIdx + 1]) : null;

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🎯 EMPLIQ Scraping Orchestrator

Uso:
  node orchestrator.js                       # Procesar todos los tiers
  node orchestrator.js --tier 1              # Solo Tier 1
  node orchestrator.js --tier 1 --limit 10   # Tier 1, máximo 10 empresas
  node orchestrator.js --headless            # Sin ventana del navegador
  node orchestrator.js --status              # Ver progreso actual

Con PM2 (ejecución larga):
  npx pm2 start orchestrator.js --name empliq-scraper -- --headless
  npx pm2 logs empliq-scraper
  npx pm2 stop empliq-scraper

Tiers:
  1 = Mega empresas (≥1000 trabajadores) - 915 empresas
  2 = Grandes (500-999 trabajadores) - 798 empresas  
  3 = Medianas (100-499 trabajadores) - 4,410 empresas
`);
    return;
  }

  await orchestrate({ tier, headless, limit });
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
