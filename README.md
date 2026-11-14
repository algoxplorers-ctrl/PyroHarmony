# 🛰️ PyroHarmony v2.0.0 — Biophysical Harmonization of MODIS & VIIRS Hot Spots

<p align="center">
  <img src="assets/icons/logo-official.png" alt="PyroHarmony Official Logo — NASA Space Apps 2026" width="260" style="border-radius: 18px;" />
</p>

[![NASA Space Apps 2026](https://img.shields.io/badge/NASA_Space_Apps-2026_Official_Challenge-0B3D91?style=for-the-badge&logo=nasa)](https://www.spaceappschallenge.org/)
[![Version](https://img.shields.io/badge/SemVer-v2.0.0_Production-00E676?style=for-the-badge)](./CHANGELOG.md)
[![Architecture](https://img.shields.io/badge/Architecture-Strict_MVC_(%3C300_LOC)-00E5FF?style=for-the-badge)](./REPLICATION_PLAYBOOK.md)
[![Wolf Amendment](https://img.shields.io/badge/Wolf_Amendment-100%25_Compliant_USA%2FNASA-2E7D32?style=for-the-badge)](#4-nasa-legal-compliance--wolf-amendment-audit)
[![Open Science](https://img.shields.io/badge/FAIR_%26_TOPS-MIT_License-FF6D00?style=for-the-badge)](./LICENSE)

> **Developed by Team AlgoXplorers (Argentina) 🇦🇷**  
> **Official Challenge:** *"Harmonization of MODIS and VIIRS Hot Spots"* — NASA Space Apps Challenge 2026  
> **Interface Language:** Native English (`EN`) by default with zero-reload dynamic Spanish (`ES`) toggle (`#btn-toggle-lang`).

---

## 1. Executive Summary & Scientific Foundation

Over two decades of global satellite wildfire records are fractured across two generations of NASA orbital sensors:
- **MODIS (Terra since 2000, Aqua since 2002):** `1000 m × 1000 m` nadir spatial resolution (`1.00 km²` footprint).
- **VIIRS (Suomi-NPP since 2012, NOAA-20 since 2017):** `375 m × 375 m` I-band spatial resolution (`0.14 km²` footprint — **7.11× smaller area**).

Because VIIRS pixels are 7 times smaller in area, it detects **3× to 5× more individual hotspot counts** over the exact same fire perimeter. Naive pixel counting creates an artificial structural break after 2012, making it appear as if planetary wildfire frequency quadrupled overnight when only optical resolution changed.

### The PyroHarmony 6-Stage Biophysical Solution

1. **Unified Biophysical Metric (Abandoning Pixel Counts & Apparent °C):**  
   Apparent pixel brightness temperature in `°C` is physically misleading due to the sub-pixel dilution effect (Dozier, 1981): by the Stefan-Boltzmann law $E = \varepsilon \cdot \sigma \cdot T^4$, an $800\text{ }^\circ\text{C}$ ($1073.15\text{ K}$) flame occupying $0.01\%$ of a $1\text{ km}^2$ pixel against a $21\text{ }^\circ\text{C}$ background yields an apparent temperature of just **$21.3\text{ }^\circ\text{C}$**. PyroHarmony replaces raw pixel counts with **Fire Radiative Power (FRP in Megawatts)** derived via the Kaufman et al. (1998) & Wooster et al. (2005) $4\text{ }\mu\text{m}$ Mid-Infrared (MIR) formulation:
   $$\text{FRP} = \frac{A_{\text{pix}} \cdot \sigma}{a} \cdot \left(L_4 - L_{4,\text{bg}}\right)$$
   which is directly proportional to dry biomass combustion rate ($C_e \approx 0.368\text{ kg/MJ}$).

2. **Homogeneous Spatial Binning ($0.1^\circ \times 0.1^\circ$):**  
   All raw MODIS (`MCD14DL`) and VIIRS (`VNP14IMGTDL`, `VJ114IMGTDL`) detections are aggregated into a regular $0.1^\circ \times 0.1^\circ$ ($\approx 11.1\text{ km}$) grid to equalize viewing geometry and sub-pixel fragmentation.

3. **Scale-Conserving Orthogonal Cross-Calibration (2012–2024 Overlap):**  
   Biome-specific orthogonal regression blends both sensors under an unbreakable energy conservation constraint:
   $$\text{FRP}_{\text{harmonized}} = \alpha \cdot \text{FRP}_{\text{MODIS}} + \beta \cdot \left(k_{\text{biome}} \cdot \text{FRP}_{\text{VIIRS}}\right) \quad \text{subject to} \quad \alpha + \beta = 1.00$$
   Quality control gates enforce $R^2 \ge 0.85$ and $|\text{MBE}| < 5\%$ across all biomes.

4. **Retrospective Pre-2012 Proxy (2000–2011):**  
   Reconstructs harmonized radiative power for the pre-VIIRS era using the multi-annual calibration transfer function without fabricating synthetic sensors.

5. **Phenological Burning Activity Calendar & Weekly Climatological Z-Score (2000–2026):**  
   Evaluates a $52\text{ weeks} \times 27\text{ years}$ matrix using the weekly climatological thermal anomaly:
   $$Z_{y,w} = \frac{\text{FRP}_{\text{harm}}(y,w) - \mu_w}{\sigma_w}$$
   respecting seasonal phenology ($500\text{ MW}$ in wet season is a catastrophe; $500\text{ MW}$ in peak dry season is nominal).

6. **Ground Truth Benchmark Validation (Pantanal Megafire, Week 35 of 2020):**  
   Validated against NASA FIRMS emergency alerts during the August–September 2020 Pantanal wetland catastrophe, triggering **$Z = +2.82$ ($p < 0.005$)** in exact synchronicity with ground truth.

---

## 2. Biome Orthogonal Calibration Table

| Biome AOI | Coords (Lat, Lon) | $\alpha$ (MODIS) | $\beta$ (VIIRS) | $\alpha+\beta$ | $k_{\text{biome}}$ | $R^2$ | MBE (%) | Count Bias (VIIRS/MODIS) | Dispatch Target |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Amazon & Pantanal Wetlands** | `-17.8°, -57.4°` | `0.42` | `0.58` | **1.00** | `0.64` | `0.93` | `-1.8%` | `4.3x` | IBAMA (Brazil) / SNMF (Argentina) |
| **Paraná Delta & Gran Chaco** | `-32.4°, -60.5°` | `0.45` | `0.55` | **1.00** | `0.68` | `0.91` | `+1.4%` | `3.9x` | SNMF / CONAE (Argentina) |
| **California Chaparral & Sierra** | `+38.6°, -120.8°` | `0.39` | `0.61` | **1.00** | `0.71` | `0.94` | `-1.1%` | `4.6x` | USFS / CAL FIRE (USA) |
| **North American Boreal Taiga** | `+61.5°, -114.3°` | `0.48` | `0.52` | **1.00** | `0.62` | `0.89` | `+2.3%` | `3.5x` | USFS / CWFIS (North America) |
| **Australian Tropical Savanna** | `-15.4°, +133.8°` | `0.44` | `0.56` | **1.00** | `0.69` | `0.92` | `-2.1%` | `4.1x` | AFAC / CSIRO (Australia) |

---

## 3. Strict MVC Software Architecture (`< 300` Lines Per File)

```mermaid
flowchart LR
  subgraph Models ["1. Pure Models (src/models/ · Zero DOM/WebGL)"]
    BM["BiofireModel.js<br/>Stefan-Boltzmann & MIR FRP"]
    HM["HarmonizationModel.js<br/>0.1° Binning & α+β=1.00"]
    CM["ClimatologyModel.js<br/>52×27 Matrix & Z-Score"]
    FD["FirmsDataService.js<br/>FIRMS Ingestion & FAIR Exports"]
  end

  subgraph Controllers ["2. Controllers (src/controllers/)"]
    AC["AppController.js<br/>Root MVC Mediator"]
    AOI["AOIController.js<br/>Biome & Benchmark Selector"]
    TC["TimelineController.js<br/>2000–2026 Scrubber & Play"]
  end

  subgraph Views ["3. Pure Declarative Views (src/views/)"]
    GV["GlobeView.js<br/>Three.js 3D Orbits & Swaths"]
    AG["AnomalyGaugeView.js<br/>SVG Semicircular Z-Gauge"]
    SD["SensorDiscrepancyView.js<br/>Count vs FRP & LACES Radar"]
    CV["CalendarView.js<br/>52×27 Heatmap & Tooltips"]
    TV["TimelineView.js<br/>HUD & Constellation Chips"]
  end

  Models <--> AC
  AOI --> AC
  TC --> AC
  AC --> Views
```

### Software Engineering Lifecycle (NASA NPR 7150.2 & SemVer 2.0.0)
1. **Phase 1 — Requirements Analysis:** Functional radiative harmonization requirements and Non-Functional constraints (60 FPS WebGL, `< 300` LOC modularity, 100% Wolf Amendment compliance).
2. **Phase 2 — Decoupled MVC Design:** Strict separation of mathematical Models, declarative Views, and event Controllers.
3. **Phase 3 — Mathematical & Biophysical Modeling:** Implementation of Kaufman/Wooster 4 µm equations, $\alpha + \beta = 1.00$ scale conservation, and weekly climatological Z-Score.
4. **Phase 4 — Modular Implementation & Zero-Dependency Bundling:** `build_bundle.mjs` compiles all 15 ES modules into a standalone `app.bundle.js` requiring zero Node runtime on client machines.
5. **Phase 5 — Verification & Validation (V&V):** Automated verification of $R^2 \ge 0.85$, $|\text{MBE}| < 5\%$, Pantanal 2020 Week 35 benchmark ($Z = +2.82$), and GPU memory hygiene via `.dispose()`.
6. **Phase 6 — Continuous Deployment & Local Execution:** Netlify CI/CD ready + one-click local execution via `INICIAR_PYROHARMONY.bat`.

---

## 4. NASA Legal Compliance & Wolf Amendment Audit

PyroHarmony strictly complies with U.S. Federal Law (**Wolf Amendment**, Public Law 112-55, Section 539), prohibiting bilateral use of Chinese aerospace, satellite, cloud, or mapping dependencies:

| Component | What We Use in PyroHarmony | Origin & Ownership | Compliance Status |
| :--- | :--- | :--- | :--- |
| ** Satellites in Orbit** | Terra, Aqua, Suomi-NPP, NOAA-20 | NASA / NOAA (United States) | 🟢 100% Official USA / NASA |
| **Fire Datasets** | `MCD14DL`, `VNP14IMGTDL`, `VJ114IMGTDL` | NASA FIRMS (Goddard Space Flight Center, MD, USA) | 🟢 100% Official NASA |
| **Planet Textures** | Blue Marble / GIBS | NASA Earth Observatory (USA) | 🟢 100% Official NASA |
| **3D Graphics Engine** | Three.js + OrbitControls | Open Source MIT License (Western / USA) | 🟢 100% Approved Open Source |
| **Hosting & Deployment** | Netlify | Netlify Inc. (San Francisco, CA, USA) | 🟢 100% USA Corporation |
| **Database / Backend** | Supabase | Supabase Inc. (San Francisco, CA, USA) | 🟢 100% USA Corporation |
| **Math Rendering** | KaTeX | Khan Academy (Mountain View, CA, USA) | 🟢 100% Approved Open Source |

---

## 5. Official Team Roster — AlgoXplorers (Argentina) 🇦🇷

All five members of **AlgoXplorers** contribute as equal co-authors and co-architects:

| Member | Handle | Official Role & Domain Responsibility |
| :--- | :---: | :--- |
| **José Alex Fernández Montellanos** | `@fajjaf` | Project Lead, Scientific Data Architecture & Mathematical Model |
| **Carlos Vizzioli** | `@cvizzioli` | Full-Stack Development, Data Modeling & Algorithms |
| **Sánchez Obando Gisella Elizabeth** | `@gisesanchezj` | Technical Communication, Scientific Outreach & User Experience (UX) |
| **Juan Carlos Fernandez** | `@jcfernan99` | Systems Analysis, Electronics & Ground Sensor Telemetry |
| **Maximiliano Guevara** | `@omegaredone` | Network Infrastructure, Cloud Deployment & Security Audit |

---

## 6. Quick Start & Deliverables Index

- **One-Click Windows Launch:** Double-click [`INICIAR_PYROHARMONY.bat`](./INICIAR_PYROHARMONY.bat) or open [`index.html`](./index.html) directly in any modern browser.
- **Executive Team Dossier:** [`DOSSIER_ENTREGA_EQUIPO.html`](./DOSSIER_ENTREGA_EQUIPO.html)
- **Scientific White Paper:** [`GUIA_CIENTIFICA_PYROHARMONY.html`](./GUIA_CIENTIFICA_PYROHARMONY.html) / [`GUIA_CIENTIFICA_PYROHARMONY.md`](./GUIA_CIENTIFICA_PYROHARMONY.md)
- **4-Zone Command Center Manual:** [`GUIA_INTERPRETACION_MAQUETA.html`](./GUIA_INTERPRETACION_MAQUETA.html) / [`GUIA_INTERPRETACION_MAQUETA.md`](./GUIA_INTERPRETACION_MAQUETA.md)
- **240-Second Video Pitch Teleprompter:** [`VIDEO_PITCH_PROMPTER.html`](./VIDEO_PITCH_PROMPTER.html)
- **Engineering Replication Playbook:** [`REPLICATION_PLAYBOOK.md`](./REPLICATION_PLAYBOOK.md)
- **Official NASA Submission Form:** [`NASA_SUBMISSION_TEMPLATE.md`](./NASA_SUBMISSION_TEMPLATE.md)
