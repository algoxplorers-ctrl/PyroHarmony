# 🚀 Official NASA Space Apps Challenge 2026 — Project Submission Template

- **Project Title:** PyroHarmony — Biophysical Harmonization of MODIS and VIIRS Hot Spots
- **Team Name:** AlgoXplorers (Argentina)
- **Challenge:** Harmonization of MODIS and VIIRS Hot Spots
- **Repository URL:** https://github.com/algoxplorers-ctrl/PyroHarmony.git

---

## 1. High-Level Summary (Elevator Pitch)

For 26 years, NASA's MODIS (1000m) and VIIRS (375m) sensors have monitored global wildfires. Because a VIIRS pixel is 7 times smaller in area (`0.14 km²` vs `1.0 km²`), VIIRS detects **3 to 5 times more hotspot counts** over the same fire, creating a false statistical illusion that planetary fires quadrupled after 2012. **PyroHarmony** solves this instrumental bias by replacing raw pixel counts and misleading apparent brightness temperatures (`°C`) with **Fire Radiative Power (FRP in Megawatts)** via the Kaufman & Wooster 4 µm Mid-Infrared formulation. Using a $0.1^\circ \times 0.1^\circ$ spatial grid, scale-conserving orthogonal regression ($\alpha + \beta = 1.00$), a 52-week × 27-year climatological Z-Score calendar, and a 50-minute Suomi-NPP ➔ NOAA-20 tactical LACES radar, PyroHarmony transforms multi-sensor telemetry into actionable intelligence for wildland firefighters worldwide.

---

## 2. Detailed Project Description

### What Does PyroHarmony Do?
PyroHarmony is a bilingual (`EN`/`ES`, English by default), 60 FPS WebGL 3D command center and biophysical harmonization engine structured around four operational zones:
1. **Zone 1 (Top Command HUD):** Displays active Biome AOI, Total Harmonized FRP (MW), active sun-synchronous satellites, real-time WebGL FPS counter, Pantanal 2020 Benchmark trigger, and zero-reload language switcher (`#btn-toggle-lang`).
2. **Zone 2 (3D Sun-Synchronous Orbital Globe):** Renders NASA Blue Marble Earth, 98.2° polar orbits for Terra (10:30 AM), Aqua (13:30 PM), Suomi-NPP (13:30 PM), and NOAA-20 (+50 min), scaled Nadir swath cones (`2,330 km` MODIS vs `3,040 km` VIIRS), and GPU-instanced $0.1^\circ$ thermal bins.
3. **Zone 3 (Biophysical Diagnostic & Tactical Deck):** Features the semicircular SVG Climatological Z-Score Gauge, the Sensor Discrepancy Card (proving how 3x–5x count discrepancies converge in Megawatts), the 50-minute LACES Firefighter Radar, and one-click FAIR exports (`.geojson`, `.csv`, and `.txt` SitRep).
4. **Zone 4 (Multidecadal Scrubber & Phenological Calendar 2000–2026):** Dynamically activates satellites according to launch year (2000 Terra, 2002 Aqua, 2012 Suomi-NPP, 2017 NOAA-20) and renders a 1,404-cell ($52\text{ weeks} \times 27\text{ years}$) Z-Score heatmap validated on the 2020 Pantanal Megafire ($Z = +2.82, p < 0.005$).

### Real-World Field Benchmark: San Luis Complex Mountain Topography & Zonda Winds (Argentina)
In complex mountainous terrain such as the Sierras Centrales and Comechingones of San Luis (Lat -36.0° to -31.8° S / Lon -67.2° to -64.9° W), fire brigades face critical conditions between weeks 32 and 45 (August to November) with post-frost dry grasslands, humidity dropping below 10%, and severe foehn-like Zonda winds. In steep canyons, initial grassland fires often failed to fill a 1-km MODIS pixel, causing underdetection. When VIIRS (375m) launched, it detected 4.8 times more hotspots over the same canyons, creating false alarms that fires had quadrupled. PyroHarmony resolves this by converting energy to physical FRP (MW), proving to San Luis Solidario and local firefighters whether an event is a genuine extreme anomaly ( > +2.5$) or an optical footprint artifact.

### Engineering Rigor & Wolf Amendment Compliance
Built under NASA NPR 7150.2 guidelines using a strict Model-View-Controller (MVC) architecture where no file exceeds 300 lines of code, compiled into a zero-dependency `app.bundle.js`. Every satellite, dataset, texture, and library is 100% US/NASA or MIT Open Source (100% Wolf Amendment compliant).

---

## 3. Space Agency Data & Scientific References

- **NASA FIRMS Datasets:** MODIS Collection 6.1 (`MCD14DL`), VIIRS Suomi-NPP 375m (`VNP14IMGTDL`), and VIIRS NOAA-20 375m (`VJ114IMGTDL`) from NASA Goddard Space Flight Center.
- **NASA Earth Observatory / GIBS:** Blue Marble Next Generation surface reference.
- **Key Peer-Reviewed Literature:**
  - Dozier, J. (1981). *A method for satellite identification of surface temperature fields of subpixel resolution*. Remote Sensing of Environment.
  - Kaufman, Y. J., et al. (1998). *Potential global fire monitoring from EOS-MODIS*. Journal of Geophysical Research.
  - Wooster, M. J., et al. (2005). *Retrieval of biomass combustion rates and totals from fire radiative power observations*. JGR Atmospheres.
  - Schroeder, W., et al. (2014). *The New VIIRS 375 m active fire detection data product*. Remote Sensing of Environment.
  - Giglio, L., et al. (2016). *The Collection 6 MODIS active fire detection algorithm and fire products*. Remote Sensing of Environment.

---

## 4. Open Science (FAIR Principles), UN SDGs & Sendai Framework

- **FAIR & NASA TOPS:** Released under the MIT Open Source License with direct interoperability in standard GeoJSON (`RFC 7946`) and CSV formats.
- **UN Sustainable Development Goals:** Directly advances **SDG 13 (Climate Action)** and **SDG 15 (Life on Land)**.
- **UN Sendai Framework:** Supports Priority 4 (Enhancing disaster preparedness for effective response) for operational agencies including **SNMF (Argentina)**, **IBAMA (Brazil)**, **CONAF (Chile)**, and **USFS / CAL FIRE (USA)**.

---

## 5. Official Team Roster — AlgoXplorers (Argentina)

1. **José Alex Fernández Montellanos (`@fajjaf`)** — Project Lead, Scientific Data Architecture & Mathematical Model
2. **Carlos Vizzioli (`@cvizzioli`)** — Full-Stack Development, Data Modeling & Algorithms
3. **Sánchez Obando Gisella Elizabeth (`@gisesanchezj`)** — Technical Communication, Scientific Outreach & User Experience (UX)
4. **Juan Carlos Fernandez (`@jcfernan99`)** — Systems Analysis, Electronics & Ground Sensor Telemetry
5. **Maximiliano Guevara (`@omegaredone`)** — Network Infrastructure, Cloud Deployment & Security Audit
