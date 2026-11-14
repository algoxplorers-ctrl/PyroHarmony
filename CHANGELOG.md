# Changelog — PyroHarmony (Team AlgoXplorers, Argentina)

All notable changes to **PyroHarmony** follow formal **Semantic Versioning (SemVer 2.0.0)** and NASA Software Engineering Procedural Requirements (**NASA NPR 7150.2**).

---

## [v2.0.0] — 2026-11-14 (Production Ready / Official NASA Space Apps Submission)

### Added
- **Full Bilingual Internationalization (`src/config/i18n.js`):** Native English (`EN`) default interface (`<html lang="en">`) for international NASA judges with instant zero-reload switching to Spanish (`ES`) via `#btn-toggle-lang` and `localStorage` persistence.
- **Tactical Wildland Firefighter Radar (LACES Protocol):** Exploits the 50-minute orbital separation between Suomi-NPP (13:30 PM) and NOAA-20 (14:20 PM) to compute intra-hour rate of spread ($\Delta\text{FRP}$) and trigger LACES safety alerts (Lookouts, Awareness, Communications, Escape Routes, Safety Zones).
- **Wolf Amendment Security & Legal Compliance Audit:** Verified 100% US/NASA and MIT Open Source stack (`0%` restricted foreign dependencies).
- **Autonomous Zero-Dependency Bundler (`build_bundle.mjs` -> `app.bundle.js`):** Unifies all 15 strict MVC modules (`< 300` lines per file) into a self-contained bundle runnable offline via `INICIAR_PYROHARMONY.bat` or deployed to Netlify.
- **Complete Scientific & Operational Documentation Suite:** Added `DOSSIER_ENTREGA_EQUIPO.html`, `GUIA_CIENTIFICA_PYROHARMONY.html/.md`, `GUIA_INTERPRETACION_MAQUETA.html/.md`, `VIDEO_PITCH_PROMPTER.html`, `REPLICATION_PLAYBOOK.md`, and `NASA_SUBMISSION_TEMPLATE.md`.

### Validated
- **Ground Truth Benchmark:** Confirmed Pantanal Megafire (Year 2020, ISO Week 35) triggers $Z = +2.82$ ($p < 0.005$), matching historical NASA FIRMS emergency alerts.
- **GPU Memory & Context Resilience:** Added `webglcontextlost` and `webglcontextrestored` listeners, adaptive `Math.min(window.devicePixelRatio, 2)`, and explicit `.dispose()` calls on Three.js geometries, materials, and textures.

---

## [v1.5.0] — 2026-10-28 (Release Candidate)

### Added
- **Phenological Burning Activity Calendar (2000–2026):** Interactive 52 weeks × 27 years matrix with weekly climatological Z-Score ($Z = (\text{FRP}_{\text{harm}} - \mu_w)/\sigma_w$) and statistical alert thresholds ($Z \ge 2.0$ for $p < 0.05$; $Z \ge 2.5$ for $p < 0.01$).
- **Semicircular SVG Anomaly Speedometer (`AnomalyGaugeView.js`):** Real-time visual gauge with $-2\sigma$, $0\mu$, $+1\sigma$, $+2\sigma$, and $+3\sigma$ calibration ticks.
- **FAIR Open Science Exports (`FirmsDataService.js`):** Direct client-side export of harmonized `.geojson` grids, `.csv` time series, and `.txt` tactical SitReps.

---

## [v1.0.0] — 2026-10-12 (Initial Beta)

### Added
- **Interactive 3D Sun-Synchronous Globe (`GlobeView.js`):** 98.2° polar orbits for Terra (2000), Aqua (2002), Suomi-NPP (2012), and NOAA-20 (2017) with scaled Nadir swath cones ($2,330\text{ km}$ MODIS vs $3,040\text{ km}$ VIIRS).
- **Biome Orthogonal Regression Engine (`HarmonizationModel.js`):** Implemented $0.1^\circ \times 0.1^\circ$ spatial binning and scale-conserving calibration ($\alpha + \beta = 1.00$, $R^2 \ge 0.85$, $|\text{MBE}| < 5\%$).

---

## [v0.1.0] — 2026-09-25 (Alpha Proof of Concept)

### Added
- Preliminary ingestion parser for NASA FIRMS archival products (`MCD14DL`, `VNP14IMGTDL`, `VJ114IMGTDL`).
- Initial mathematical verification of Dozier (1981) sub-pixel Stefan-Boltzmann dilution and Kaufman/Wooster $4\text{ }\mu\text{m}$ MIR Fire Radiative Power formulation.
