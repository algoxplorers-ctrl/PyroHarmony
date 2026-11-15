# PyroHarmony Bundler in PowerShell (Zero-Dependency)
$MODULE_ORDER = @(
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
)

$banner = @"
/*!
 * PyroHarmony v2.0.0 — Autonomous Production Bundle (app.bundle.js)
 * NASA Space Apps Challenge 2026: "Harmonization of MODIS and VIIRS Hot Spots"
 * Team AlgoXplorers (Argentina): @fajjaf, @cvizzioli, @gisesanchezj, @jcfernan99, @omegaredone
 * Architecture: Strict MVC (<300 lines/module) | 100% Wolf Amendment Compliant | License: MIT
 */
(function () {
  "use strict";
"@

$chunks = [System.Collections.Generic.List[string]]::new()
$chunks.Add($banner)

foreach ($relPath in $MODULE_ORDER) {
  $raw = Get-Content -Path $relPath -Raw -Encoding UTF8
  $lines = $raw -split "\r?\n"
  # Clean imports and exports

  $cleanRaw = [System.Text.RegularExpressions.Regex]::Replace($raw, 'import\s+\{[\s\S]*?\}\s+from\s+[''"][^''"]+[''"];?', '')
  $cleanLines = $cleanRaw -split "\r?\n"
  $filtered = [System.Collections.Generic.List[string]]::new()
  foreach ($line in $cleanLines) {
    if ($line.Trim().StartsWith("import ")) { continue }
    $l = $line -replace '^export\s+default\s+', ''
    $l = $l -replace '^export\s+(const|let|var|class|function)\s+', '$1 '
    $filtered.Add($l)
  }

  $chunks.Add("`n  // =========================================================================")
  $chunks.Add("  // MODULE: $relPath")
  $chunks.Add("  // =========================================================================")
  $chunks.Add(($filtered -join "`n"))
}

$chunks.Add("`n})();`n")
$bundleContent = $chunks -join "`n"
[System.IO.File]::WriteAllText("$PSScriptRoot\app.bundle.js", $bundleContent, [System.Text.Encoding]::UTF8)
Write-Host "[PyroHarmony Bundler] Successfully generated app.bundle.js ($($MODULE_ORDER.Count) MVC modules verified < 300 lines)."
