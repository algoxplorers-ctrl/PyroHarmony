# PyroHarmony: System Navigation & Interpretation Guide
> **Technical & Operational Manual — The 4 Platform Command Zones**  
> **NASA Space Apps Challenge 2026** | *Harmonization of MODIS and VIIRS Hot Spots*  
> **Team:** AlgoXplorers (Argentina)  
> **Authors:** José Alex Fernández Montellanos (`@fajjaf`), Carlos Vizzioli (`@cvizzioli`), Sánchez Obando Gisella Elizabeth (`@gisesanchezj`), Juan Carlos Fernandez (`@jcfernan99`), Maximiliano Guevara (`@omegaredone`)

---

## 1. System Scope & Purpose Statement

### 🎯 Platform Purpose
**PyroHarmony** is a **biophysical data harmonization, thermodynamic modeling, and 3D geospatial visualization platform** engineered to resolve the two-decade historical discontinuity between MODIS (Terra/Aqua, $1,000\text{ m}$ pixel) and VIIRS (Suomi-NPP/NOAA-20, $375\text{ m}$ pixel) satellite sensors.

Its core mission is to demonstrate the feasibility of integrating heterogeneous telemetry via **Fire Radiative Power (FRP in Megawatts)** and detecting anomalies with a **52-week seasonal climatological $Z$-Score**.

* **Operational Scope:** A fully interactive real-time platform running on WebGL at 60 FPS (Three.js), with decoupled MVC architecture, zero magic numbers, and continuous historical simulation across 2000–2026.
* **Production Scalability:** The loaded parameters constitute the **initial prototype benchmark calibration**, designed modularly to allow automated batch retraining across terabytes of raw satellite data from NASA FIRMS.

---

## 2. Visual Screen Layout: The 4 Command Zones

The PyroHarmony control console is structured into four real-time synchronous operational zones:

```
+---------------------------------------------------------------------------------------------------+
|  ZONE 1: UPPER TELEMETRY HUD                                                                      |
|  [Active Biome]  |  [Total Harmonized FRP (MW)]  |  [Active Satellites in Orbit by Year]          |
+-----------------------------------------------------------------+---------------------------------+
|  ZONE 2: 3D WEBGL VIEWER (THREE.JS 60 FPS)                      |  ZONE 3: CONTROL PANEL          |
|  - Blue Marble globe with dynamic atmosphere and clouds         |  - Anomaly Gauge (Z-Score)      |
|  - Sun-synchronous polar orbits at true physical scale          |  - Sensor Discrepancy Card      |
|  - Nadir swath cones (MODIS 2,330 km vs VIIRS 3,040 km)         |  - Biome / Region Selector      |
|  - GPU-instanced thermal fire spots (THREE.InstancedMesh)       |  - SitRep Generator (Crews)     |
+-----------------------------------------------------------------+---------------------------------+
|  ZONE 4: TIMELINE & 26-YEAR PHENOLOGICAL FIRE CALENDAR                                            |
|  - Annual Time Scrubber (2000 —————————●————————— 2026)                                           |
|  - Burning Activity Calendar (Interactive 52 Weeks × 26 Years Matrix with Z-Score Heatmap)        |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Component-by-Component Interpretation

### 🛰️ Zone 1: Upper Telemetry HUD
* **Biome and Coordinates:** Identifies the active ecosystem (Amazon, Pantanal, San Luis, Gran Chaco, or Boreal Taiga).
* **Total Harmonized FRP:** Displays the consolidated total radiated thermal energy in Megawatts ($\text{MW}$), computed via Kaufman's radiative formulation:
  $$\text{FRP} = C \cdot \sum_{i} \left( T_{4i}^4 - \bar{T}_{4b}^4 \right)$$
* **Constellation in Orbit:** Reports satellite count and status according to the active year.

### 🌐 Zone 2: 3D Globe & Satellite Constellation
* **Historical Constellation Activation:**
  * **2000–2002:** **Terra** only (MODIS AM, descending orbit 10:30 LT).
  * **2002–2011:** Dual MODIS constellation (**Terra + Aqua** PM, 13:30 LT).
  * **2012–2017:** Ingestion of **Suomi-NPP** (VIIRS, $375\text{ m}$ pixel).
  * **2018–2026:** Quadruple constellation (**Terra + Aqua + Suomi-NPP + NOAA-20**).
* **Nadir Optical Beams:** True-scale visualization of swath width: $2,330\text{ km}$ for MODIS and $3,040\text{ km}$ for VIIRS with edge-compression correction.
* **Efficient Fire Hot Spot Rendering:** Implemented via `THREE.InstancedMesh` to render thousands of hot spots at steady 60 FPS without GPU memory bus strain.

### ⚙️ Zone 3: Sensor Discrepancy Card & Anomaly Gauge
* **Instrumental Bias Resolution:** Quantitatively illustrates how raw pixel counts artificially jump 3x to 5x with VIIRS, while **Harmonized FRP (MW)** remains consistent under the conservation law:
  $$\alpha + \beta = 1.00$$
  preserving biophysical continuity across instrument generations.
* **Anomaly Gauge Speedometer:** Measures seasonal normalized deviation:
  $$Z = \frac{\text{FRP}_{\text{harm}} - \mu_{w}}{\sigma_{w}}$$
  * $Z \le 0.0$: **Low / Normal** (Baseline or wet regime).
  * $0.0 < Z < 1.0$: **Expected Baseline** (No emergency significance).
  * $1.0 \le Z < 2.0$: **Elevated Thermal Activity** (Precautionary monitoring).
  * $Z \ge 2.0$: **Significant Anomaly** ($p < 0.05$, 95% confidence).
  * $Z \ge 2.5$: **Extreme Anomaly** ($p < 0.01$, 99% statistical confidence).

> ### 🏔️ Territorial Case Study: San Luis (Sierras & Monte)
> When selecting the **San Luis (Sierras & Monte)** biome, the platform applies local coefficients ($\alpha = 0.44$, $\beta = 0.56$, $R^2 = 0.92$) to compensate for topographic underdetection on steep slopes under Zonda winds.  
> During critical drought episodes, the panel outputs the validated alert:  
> **“The thermal increase observed this week in San Luis is not an optical error due to switching satellites: the +2.8 Z-Score confirms a real, extreme thermal anomaly with 99% statistical confidence.”**

### 📅 Zone 4: Burning Activity Calendar (52 Weeks × 26 Years)
* **1,352-Cell Phenological Matrix:** Visualizes 26 years of satellite history, clearly separating seasonal baseline burning from out-of-scale wildfire crises.
* **Strict Seasonal Comparability:** Week $w$ of Year $Y$ is compared **solely** against the 26-year historical distribution of Week $w$, preventing false positives caused by comparing dry months with wet months.

---

## 4. Operational Validation Methodology & The 3 Proto-users

The architecture of PyroHarmony is engineered to serve three operational user tiers:

| Proto-user | Institution / Profile | Practical Platform Use |
|---|---|---|
| **🔥 Tier 1: Ground Wildland Firefighter** | San Luis Solidario / Volunteer Fire Brigades | Consults the **Anomaly Gauge** and LACES tactical latency radar ($50\text{ min}$ window) to decide whether a fire front is manageable or mandates immediate tactical retreat. |
| **🛰️ Tier 2: Incident Operations Commander** | National Fire Management Service (SNMF) | Uses the **3D Viewer** and **SitRep Generator** to dispatch air tankers and water drops to $11\text{ km}$ cells with $Z \ge 2.0$. |
| **🌱 Tier 3: Climate & Environmental Scientist** | NASA LCLUC / Environmental Ministries | Audits the **Burning Activity Calendar** to evaluate decadal climate shifts and the advancement of fire seasons between 2000 and 2026. |

### 3-Stage Operational Demonstration Walkthrough:

1. **Stage 1 — Demonstrating Optical Discrepancy (MODIS vs. VIIRS Era):**  
   Selecting a biome and scrubbing the timeline from 2010 (MODIS) to 2014 (VIIRS) shows raw fire counts jumping 3x to 5x due to $375\text{ m}$ pixel resolution. Simultaneously, the **Harmonized FRP in MW remains smooth and continuous**, eliminating sensor distortion.
2. **Stage 2 — Detecting Climatological Anomalies via Z-Score:**  
   Clicking rainy season weeks (e.g., Week 15) keeps the gauge in normal baseline territory ($Z \approx 0$). Selecting severe drought weeks (e.g., Week 35 of 2020 in Pantanal or Week 38 in San Luis) yields $Z \ge 2.0$ ($p < 0.05$), pinpointing a true anomaly.
3. **Stage 3 — Generating Tactical Telemetry (SitRep):**  
   Clicking **Export SitRep** produces a standardized tactical summary with coordinates, thermodynamic severity, and actionable directives for field brigades.

---

## 5. Official NASA Evaluation Criteria & Implemented Solution

| NASA Official Criterion | Guiding Evaluation Question | PyroHarmony Platform Implementation |
|---|---|---|
| **Impact** | Does it solve a genuine environmental and operational challenge? | Resolves a 20-year satellite data discontinuity, enabling agencies to distinguish routine agricultural burning from catastrophic crises. |
| **Creativity** | Is it an innovative, well-structured solution? | Replaces misleading raw pixel counts with the biophysics of FRP in MW, combining a 52-week climatological matrix with interactive 3D orbital telemetry. |
| **Technical Validity** | Does it demonstrate scientific rigor and sound mathematics? | Applies Kaufman/Wooster $4\ \mu\text{m}$ formulation, scale conservation law ($\alpha + \beta = 1.00$), diurnal cycle adjustments, and rigorous weekly $Z$-Score calculations. |
| **Use of Data** | Does it effectively leverage official NASA data products? | Processes certified NASA FIRMS datasets (`MCD14DL`, `VNP14IMGTDL`, `VJ114IMGTDL`) and high-resolution Blue Marble imagery from NASA GIBS. |
| **Presentation** | Is the system reproducible, intuitive, and clearly documented? | Live production deployment on Netlify, automated one-click local script (`.bat`), bilingual presentation teleprompter, and comprehensive technical documentation. |

---

## 6. Team Members — AlgoXplorers (Argentina)

| Team Member | NASA Space Apps Profile | Technical Role in Project |
|---|---|---|
| **José Alex Fernández Montellanos** | `@fajjaf` | Project Lead, Scientific Data Architecture & Mathematical Modeling |
| **Carlos Vizzioli** | `@cvizzioli` | Full-Stack Engineering, Data Modeling & Algorithms |
| **Sánchez Obando Gisella Elizabeth** | `@gisesanchezj` | Technical Communication, Scientific Outreach & User Experience (UX) |
| **Juan Carlos Fernandez** | `@jcfernan99` | Systems Analysis, Electronics & Ground Sensor Telemetry |
| **Maximiliano Guevara** | `@omegaredone` | Network Infrastructure, Cloud Deployment & Security Auditing |

---
*AlgoXplorers (Argentina) — PyroHarmony | NASA Space Apps Challenge 2026*  
*Official prototype navigation and evaluation manual.*
