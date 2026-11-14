# 🛠️ Engineering Replication Playbook — PyroHarmony v2.0.0

**Team AlgoXplorers (Argentina)** · NASA Space Apps Challenge 2026  
**Standard:** NASA NPR 7150.2 Software Engineering Lifecycle & FAIR Open Science Principles

---

## 1. System Requirements & Zero-Dependency Philosophy

PyroHarmony v2.0.0 is engineered with a **dual-execution architecture**:
1. **Zero-Dependency Autonomous Mode (No Node.js or Server Required):**  
   Because `app.bundle.js` is pre-compiled and committed to the root directory, any evaluator or firefighter dispatch center can clone or unzip the project and double-click `INICIAR_PYROHARMONY.bat` (or open `index.html` directly in Chrome, Edge, Firefox, or Safari).
2. **Developer Build Mode (Optional Node.js 18+):**  
   Developers modifying individual MVC modules in `src/` can run `node build_bundle.mjs` to validate the `< 300` lines-per-file policy and regenerate `app.bundle.js`.

---

## 2. Step-by-Step Replication from Scratch

### Step 1: Clone the Official Repository
```bash
git clone https://github.com/algoxplorers-ctrl/PyroHarmony.git
cd PyroHarmony
```

### Step 2: Verify Directory Structure & Strict MVC Boundaries
Ensure all source modules reside in their designated MVC layers and strictly obey the `< 300` lines limit:
```text
PyroHarmony/
├── index.html                        # Zone 1–4 Command Center Shell (EN default)
├── app.bundle.js                     # Compiled Zero-Dependency Production Bundle
├── build_bundle.mjs                  # Topological ES Module Bundler & Line Auditor
├── INICIAR_PYROHARMONY.bat           # One-Click Windows Local Launcher
├── src/
│   ├── config/
│   │   ├── constants.js              # Stefan-Boltzmann, Wooster MIR, Orbits, Biomes
│   │   └── i18n.js                   # I18nService (EN/ES Dynamic Dictionary)
│   ├── models/                       # Pure Math & Data Layer (Zero DOM/WebGL)
│   │   ├── BiofireModel.js           # Sub-pixel °C fallacy, MIR FRP, LACES 50-min
│   │   ├── HarmonizationModel.js     # 0.1° Spatial Binning & alpha + beta = 1.00
│   │   ├── ClimatologyModel.js       # 52w x 27y Matrix & Weekly Z-Score
│   │   └── FirmsDataService.js       # Spatiotemporal Synthesis & FAIR GeoJSON/CSV
│   ├── views/                        # Pure Declarative UI Layer (Zero Math/HTTP)
│   │   ├── GlobeView.js              # Three.js 3D Orbits, Swath Cones & .dispose()
│   │   ├── AnomalyGaugeView.js       # SVG Semicircular Z-Score Speedometer
│   │   ├── SensorDiscrepancyView.js  # Optical Bias Card & LACES Radar UI
│   │   ├── CalendarView.js           # Interactive 52x27 Heatmap & Tooltips
│   │   └── TimelineView.js           # 2000-2026 Scrubber & Constellation Chips
│   ├── controllers/                  # Event Mediation Layer
│   │   ├── AOIController.js          # Biome & Benchmark Selection
│   │   ├── TimelineController.js     # Scrubber & Playback Loop
│   │   └── AppController.js          # Root MVC Coordinator
│   ├── styles/
│   │   └── main.css                  # Aerospace Dark HUD Stylesheet
│   └── main.js                       # Application Bootstrapper
```

### Step 3: Re-compile the Production Bundle (If Editing `src/`)
```bash
node build_bundle.mjs
```
The bundler automatically verifies that every module in `src/` has fewer than 300 lines and outputs `app.bundle.js`.

### Step 4: Execute Ground Truth Verification (V&V Checklist)
1. Open `index.html` (or run `INICIAR_PYROHARMONY.bat`).
2. Confirm the interface loads in **English (`EN`)** by default at **Year `2020`, Week `35`** on the **Amazon & Pantanal Wetlands** biome.
3. Verify the **Anomaly Gauge** reads **`Z = +2.82`** (`EXTREME CRITICAL ANOMALY, p < 0.01`) and **Scale Conservation** displays `α + β = 1.00`, `R² = 0.93`, `MBE = -1.8%`.
4. Drag the **Year Scrubber** to `2001`: verify active satellites drop to `1 / 4 (Terra)` and regime switches to `2000–2011: Retrospective Calibrated MODIS Proxy`.
5. Click the **`EN` button** (`#btn-toggle-lang`) in the top-right HUD: verify the entire interface, tooltips, and biome selector switch instantaneously to **Spanish (`ES`)** without reloading the page.
