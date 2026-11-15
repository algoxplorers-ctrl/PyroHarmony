# 🧭 4-ZONE COMMAND CENTER MANUAL & INTERPRETATION GUIDE

> **Language / Idioma:** **English (EN)** | [Versión en Español (GUIA_INTERPRETACION_MAQUETA.md)](./GUIA_INTERPRETACION_MAQUETA.md)  
> **Interactive HTML Versions:** [View in HTML (English)](./COMMAND_MANUAL_4_ZONES.html) | [Ver en HTML (Español)](./GUIA_INTERPRETACION_MAQUETA.html)

**System:** PyroHarmony v2.0.0 — MODIS & VIIRS Orbital Harmonization Command Center  
**Developer Team:** AlgoXplorers (Argentina) · NASA Space Apps Challenge 2026  
**Document Type:** Third-Person Operational Manual & 3-Stage Evaluation Protocol

---

## 1. Operational Architecture of the 4 Command Zones

The **PyroHarmony** interactive command center is structured into four synchronized functional zones engineered under a strict Model-View-Controller (MVC) pattern:

### ZONE 1 — Top Mission HUD & Global Telemetry Bar
Located in the fixed top viewport, Zone 1 displays mission-critical indicators in real time:
- **Active Biome AOI:** Displays the current regional biome targeted by the orbital camera and statistical engine.
- **Total Harmonized FRP (MW):** Real-time sum of biophysically harmonized Fire Radiative Power across the $0.1^\circ \times 0.1^\circ$ grid.
- **Active Satellites in Orbit:** Tracks which of the 4 US orbital assets (Terra, Aqua, Suomi-NPP, NOAA-20) were active in the selected year.
- **WebGL Telemetry (FPS):** Continuously monitors rendering performance at a rock-solid 60 FPS.
- **Bilingual Toggle (`#btn-toggle-lang`):** Starts in native English (`EN`) by default and switches instantly to Spanish (`ES`) with zero DOM reload.

### ZONE 2 — 3D Sun-Synchronous Interactive Globe (Three.js WebGL)
Occupies the left hemisphere and renders orbital mechanics at true physical scale:
- **Sun-Synchronous Polar Orbits ($98.2^\circ$ inclination):** Renders trajectories of **Terra** (10:30 AM equator pass), **Aqua** (1:30 PM), **Suomi-NPP** (1:30 PM), and **NOAA-20** (spaced 50 minutes apart from Suomi-NPP).
- **True Nadir Optical Swath Cones:** Visually contrasts MODIS's $2,330\text{ km}$ swath against VIIRS's wider $3,040\text{ km}$ coverage.
- **GPU InstancedMesh Thermal Cells:** Batches aggregated fire clusters into $0.1^\circ \times 0.1^\circ$ cells maintaining 60 FPS with automatic GPU memory disposal.

### ZONE 3 — Biophysical Diagnostics Panel & Tactical LACES Radar
Located in the right viewport column, integrating five analytical modules:
1. **Calibrated Biome Selector:** Switches between 6 global and regional biomes with calibrated $\alpha$, $\beta$, $k_{\text{biome}}$, and $R^2$ parameters.
2. **Anomaly Gauge (Semicircular SVG):** Gauges weekly climatological $Z$-Scores with tick markers at $-2\sigma$, $0\mu$, $+1\sigma$, $+2\sigma$, and $+3\sigma$.
3. **Sensor Discrepancy Card:** Proves how a $3\times$ to $5\times$ raw pixel count jump between VIIRS and MODIS converges into consistent energy in Megawatts ($\alpha + \beta = 1.00$).
4. **Firefighter Tactical Radar (LACES Protocol):** Evaluates the 50-minute orbital overlap between Suomi-NPP (1:30 PM) and NOAA-20 (2:20 PM) to detect rapid flame acceleration ($\Delta\text{FRP}$) under standard **LACES** guidelines (*Lookouts, Awareness, Communications, Escape Routes, Safety Zones*).
5. **SitRep Generator & FAIR Export:** One-click offline downloads of tactical SITREPs (`.txt`), harmonized spatial grids (`.geojson`), and multidecadal time series (`.csv`).

### ZONE 4 — Multidecadal Scrubber (2000–2026) & Phenological Heatmap
Spans the bottom full-width panel:
- **Temporal Scrubber (`Year:` & `Week:`):** Traverses 26 years from 2000 to 2026. Crossing 2012 automatically transitions between the *Retrospective MODIS Proxy (2000–2011)* and *Orthogonal Harmonization (2012–2026)*.
- **Burning Activity Calendar ($52\text{ weeks} \times 27\text{ years}$):** Interactive heatmap with 1,404 cells where each cell encodes weekly thermal $Z$-Scores against 26-year historical baselines.

---

## 2. 3-Stage Prototype Evaluation Protocol

1. **Stage 1 — Sensor Fracture & Fleet Evolution Audit (2000 ➔ 2020):**  
   Drag the `Year:` slider to **2001** (only **Terra** in orbit), then **2005** (**Terra + Aqua**), **2013** (**Suomi-NPP** brings VIIRS 375m), and **2020** (full constellation with **NOAA-20**).
2. **Stage 2 — Ground Truth Benchmark Audit (Pantanal Megafire, Week 35 of 2020):**  
   Click the **Pantanal 2020 Benchmark (W35)** HUD button to jump to *Amazon & Pantanal Wetlands*, Year `2020`, Week `35`. Verify the gauge hits exactly **$Z = +2.82$ ($p < 0.01$, Critical Anomaly)** and the discrepancy card confirms $\alpha + \beta = 1.00$.
3. **Stage 3 — FAIR Data & Bilingual Toggle Testing:**  
   Click `#btn-toggle-lang` to verify instant UI switching between English and Spanish, and download sample `.txt` (SitRep), `.geojson`, and `.csv` files to confirm compliance with NASA open data standards.

---
*AlgoXplorers (Argentina) · PyroHarmony v2.0.0 · NASA Space Apps Challenge 2026*