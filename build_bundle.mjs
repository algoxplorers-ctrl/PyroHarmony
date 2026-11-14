/**
 * @file build_bundle.mjs
 * @description Zero-Dependency ES Module Bundler for PyroHarmony v2.0.0.
 * Compiles the strictly modular MVC files (< 300 lines each) in topological order
 * into a single self-contained `app.bundle.js` executable offline or on Netlify.
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODULE_ORDER = [
  'src/config/constants.js',
  'src/config/i18n.js',
  'src/models/BiofireModel.js',
  'src/models/HarmonizationModel.js',
  'src/models/ClimatologyModel.js',
  'src/models/FirmsDataService.js',
  'src/views/GlobeView.js',
  'src/views/AnomalyGaugeView.js',
  'src/views/SensorDiscrepancyView.js',
  'src/views/CalendarView.js',
  'src/views/TimelineView.js',
  'src/controllers/AOIController.js',
  'src/controllers/TimelineController.js',
  'src/controllers/AppController.js',
  'src/main.js'
];

function stripImportsAndExports(sourceCode, relPath) {
  const lines = sourceCode.split(/\r?\n/);
  if (lines.length > 300) {
    throw new Error(
      `[MVC Policy Violation] ${relPath} has ${lines.length} lines (strict limit: < 300 lines).`
    );
  }

  return lines
    .filter((line) => !line.trim().startsWith('import '))
    .map((line) =>
      line
        .replace(/^export\s+default\s+/, '')
        .replace(/^export\s+(const|let|var|class|function)\s+/, '$1 ')
    )
    .join('\n');
}

function buildStandaloneBundle() {
  const banner = [
    '/*!',
    ' * PyroHarmony v2.0.0 — Autonomous Production Bundle (app.bundle.js)',
    ' * NASA Space Apps Challenge 2026: "Harmonization of MODIS and VIIRS Hot Spots"',
    ' * Team AlgoXplorers (Argentina): @fajjaf, @cvizzioli, @gisesanchezj, @jcfernan99, @omegaredone',
    ' * Architecture: Strict MVC (<300 lines/module) | 100% Wolf Amendment Compliant | License: MIT',
    ' */',
    '(function () {',
    '  "use strict";'
  ].join('\n');

  const chunks = [banner];

  for (const relPath of MODULE_ORDER) {
    const absPath = path.join(__dirname, relPath);
    const raw = fs.readFileSync(absPath, 'utf8');
    // Remove multi-line imports cleanly before line-by-line transform
    const withoutMultilineImports = raw.replace(
      /import\s+\{[\s\S]*?\}\s+from\s+['"][^'"]+['"];?/g,
      ''
    );
    const cleaned = stripImportsAndExports(withoutMultilineImports, relPath);
    chunks.push(`\n  // =========================================================================`);
    chunks.push(`  // MODULE: ${relPath}`);
    chunks.push(`  // =========================================================================`);
    chunks.push(cleaned);
  }

  chunks.push('\n})();\n');

  const outputPath = path.join(__dirname, 'app.bundle.js');
  fs.writeFileSync(outputPath, chunks.join('\n'), 'utf8');
  console.log(`[PyroHarmony Bundler] Successfully generated app.bundle.js (${MODULE_ORDER.length} MVC modules verified < 300 lines).`);
}

buildStandaloneBundle();
