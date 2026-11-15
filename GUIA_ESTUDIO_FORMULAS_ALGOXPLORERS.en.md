# Scientific Cheat Sheet & Master Formulary — AlgoXplorers
> **Master Formulary, Mathematics & Physics of PyroHarmony**  
> **NASA Space Apps Challenge 2026** | *Harmonization of MODIS and VIIRS Hot Spots*  
> **Team:** AlgoXplorers (Argentina)  
> **Authors:** José Alex Fernández Montellanos (`@fajjaf`), Carlos Vizzioli (`@cvizzioli`), Sánchez Obando Gisella Elizabeth (`@gisesanchezj`), Juan Carlos Fernandez (`@jcfernan99`), Maximiliano Guevara (`@omegaredone`)

---

## 📑 Study Modules in this Document

1. **Thermal Physics & Fire:** Why do we NOT use temperature in °C? (Stefan-Boltzmann, $T^4$ Power, and Sub-pixel Modeling)
2. **Fire Radiative Power (FRP in Megawatts):** Wooster and Kaufman Equations
3. **The Instrumental Discrepancy:** MODIS vs. VIIRS (Pixel Geometry, Bowtie Distortion, and Nadir Swath)
4. **The Harmonization Model:** Spatial Binning, Cross-Calibration, Scale Conservation $\alpha + \beta = 1.00$, and San Luis Case
5. **Phenological Climatological Z-Score:** 52 Weeks × 26 Years Matrix
6. **Polar Orbiting Satellite Constellation:** Terra, Aqua, Suomi-NPP, and NOAA-20
7. **"The Defender's Cheat Sheet":** 12 Core High-Yield Technical Q&As (Including San Luis and the 3 Proto-users)

---

## MODULE 1: Thermal Physics: Why Temperature in °C is Deceptive

> ⚠️ **The Classical Kitchen Thermometer Fallacy:**  
> Many mistakenly assume a space satellite measures fire temperature as if placing a contact thermometer inside the flames (*"the fire is at 800 °C"*). **That is physically impossible from 700 km orbital altitude.**

### 1.1 The Stefan-Boltzmann Law
Any blackbody emits total thermal radiative energy proportional to the **fourth power of its absolute temperature in Kelvin ($T^4$)**:

$$E = \epsilon \cdot \sigma \cdot T^4$$

* $\sigma = 5.67 \times 10^{-8}\text{ W}/(\text{m}^2\cdot\text{K}^4)$ (Stefan-Boltzmann Constant).
* $\epsilon \approx 1$ (Emissivity of flame and ground, near blackbody behavior).

### 1.2 What exactly does $T^4$ ("T to the fourth") mean and why is it so monumental?
**$T^4$** means multiplying absolute temperature in Kelvin four times by itself:

$$T^4 = T \times T \times T \times T$$

> 💥 **The Exponential Leap (Why isn't it linear?):**  
> If physics were linear, doubling the temperature would double emitted radiation. But with **$T^4$**, emitted energy surges exponentially:  
> * If you **double** temperature ($2 \times T$) $\rightarrow$ radiation increases **16 times** ($2^4 = 2 \times 2 \times 2 \times 2 = 16$).  
> * If you **triple** temperature ($3 \times T$) $\rightarrow$ radiation increases **81 times** ($3^4 = 3 \times 3 \times 3 \times 3 = 81$).

Real-world comparison between cool background soil and an active fire flame ($K = ^\circ\text{C} + 273.15$):

| Object | Temperature (°C) | Temperature in Kelvin ($T$) | Fourth Power Value ($T^4$) | Relative Radiance |
|---|---|---|---|---|
| **Cool background soil / grass** | $20^\circ\text{C}$ | $293.15\text{ K}$ | $293^4 \approx \mathbf{7.37\text{ billion}}$ | Baseline ($1\times$) |
| **Active fire flame** | $800^\circ\text{C}$ | $1,073.15\text{ K}$ | $1073^4 \approx \mathbf{1.326\text{ trillion}}$ | **180× more radiative energy per m²!** |

> 🛰️ **Why does $T^4$ save NASA and PyroHarmony?**  
> Because energy grows to the fourth power ($T^4$), a modest fire flame of just $10\text{ m} \times 10\text{ m}$ nestled inside a massive $1\text{ km} \times 1\text{ km}$ pixel **emits 180 times more radiation per square meter than the surrounding cool forest**. It shines like a blinding lighthouse in the satellite's infrared channels. If physics were linear, an orbital sensor at 700 km altitude could never detect small fires because cool ambient soil would completely swamp the thermal signal.

### 1.3 The Sub-Pixel Dilution Problem (Real Numerical Demonstration)
In MODIS, a single pixel covers **1,000 m × 1,000 m = 1,000,000 m²** (100 hectares). A typical active flaming front covers about **100 m²** (0.01% of the pixel). The remaining 99.99% is ambient soil and forest canopy.

> 📐 **Real numerical example: How an 800 °C flame yields an apparent 21.3 °C reading:**  
> * Cool background soil: $T_{\text{bg}} = 20^\circ\text{C} = 293.15\text{ K}$ (covers $99.99\%$ of the pixel, $1-p = 0.9999$).  
> * Active flaming front: $T_{\text{fire}} = 800^\circ\text{C} = 1073.15\text{ K}$ (covers only $p = 0.0001$, i.e., 100 m² of 1,000,000 m²).  
> 
> The satellite sensor averages total emitted radiance ($T_{\text{apparent}}^4$):  
> $$T_{\text{apparent}}^4 = (1 - p) \cdot T_{\text{bg}}^4 + p \cdot T_{\text{fire}}^4$$  
> $$T_{\text{apparent}}^4 = 0.9999 \cdot (293.15)^4 + 0.0001 \cdot (1073.15)^4$$  
> $$(293.15)^4 \approx 7.38 \times 10^9 \quad \longrightarrow \quad 0.9999 \times 7.38 \times 10^9 \approx 7.379 \times 10^9$$  
> $$(1073.15)^4 \approx 1.326 \times 10^{12} \quad \longrightarrow \quad 0.0001 \times 1.326 \times 10^{12} \approx 1.326 \times 10^8$$  
> $$T_{\text{apparent}}^4 \approx 7.379 \times 10^9 + 0.133 \times 10^9 = 7.512 \times 10^9$$  
> $$T_{\text{apparent}} = \sqrt[4]{7.512 \times 10^9} \approx 294.46\text{ K} \approx \mathbf{21.3^\circ\text{C}}$$  
> 
> 👉 **Crucial takeaway:** The flame burns at 800 °C, yet the orbital sensor records 21.3 °C (barely 1.3 °C warmer than adjacent soil!). This proves raw apparent temperature in °C is completely inadequate for wildfire assessment.

---

## MODULE 2: Fire Radiative Power (FRP): Measuring Energy in Megawatts (MW)

> 💡 **NASA's Breakthrough Formulation (Kaufman & Wooster, 1998–2005):**  
> Rather than hunting for apparent temperature, researchers discovered that in the **Middle Infrared (MIR band at 3.9–4.0 µm)**, radiance emitted by fire is **linearly proportional to total radiative energy** released by active combustion.

### 2.1 Wooster's Formulation (MIR Radiance Method)
For every pixel with detected fire activity, FRP in Megawatts is evaluated as:

$$FRP = \frac{A_{\text{pix}} \cdot \sigma}{a} \cdot \left( L_4 - \bar{L}_{4,\text{bg}} \right)$$

* $A_{\text{pix}}$: Ground surface area of the pixel ($10^6\text{ m}^2$ for MODIS at Nadir).
* $\sigma$: Stefan-Boltzmann constant ($5.67 \times 10^{-8}\text{ W}/(\text{m}^2\cdot\text{K}^4)$).
* $a$: Empirical sensor calibration constant for the MIR band ($\approx 3.0 \times 10^{-9}\text{ W}\cdot\text{m}^{-2}\cdot\text{sr}^{-1}\cdot\mu\text{m}^{-1}\cdot\text{K}^{-4}$).
* $L_4$: Spectral radiance measured in the 4 µm channel.
* $\bar{L}_{4,\text{bg}}$: Mean spectral radiance of surrounding unburned background pixels.

### 2.2 Why FRP is a True Biophysical Metric
A universal, direct relationship demonstrated in laboratory and field burns links total Fire Radiative Energy ($FRE$) with consumed biomass mass:

$$FRE = \int_{t_1}^{t_2} FRP(t) \, dt \quad [\text{MegaJoules or GigaJoules}]$$
$$M_{\text{biomass}} = C_e \times FRE$$

$$C_e \approx 0.368 \pm 0.015\text{ kg of dry biomass consumed per MegaJoule of energy} \quad (\text{Wooster et al., 2005})$$

---

## MODULE 3: The Sensor Discontinuity: MODIS (1,000m) vs. VIIRS (375m)

In 2012, NASA activated VIIRS aboard Suomi-NPP. Overnight, global fire records registered a **300% to 500% surge in hot spot detections**.

| Technical Feature | MODIS Sensor (Terra & Aqua) | VIIRS Sensor (Suomi-NPP & NOAA-20) | Impact on Records |
|---|---|---|---|
| **Nadir Resolution** | 1,000 m × 1,000 m ($1.0\text{ km}^2$) | 375 m × 375 m ($0.14\text{ km}^2$) | VIIRS pixel covers **7× less surface area**. |
| **FRP Detection Floor** | $\sim 10\text{ MW}$ to $15\text{ MW}$ minimum | $\sim 1.5\text{ MW}$ to $3\text{ MW}$ minimum | VIIRS detects small burns invisible to MODIS. |
| **Swath Width** | 2,330 km | 3,040 km | VIIRS leaves zero orbital gaps at the equator. |
| **Edge Distortion** | Bowtie Effect (pixel stretches up to 2 × 4.8 km) | Onboard Pixel Aggregation (swath stays under 750 m) | MODIS degrades severely toward swath edges. |

> 🔥 **Visualizing the 4x Hot Spot Discrepancy:**  
> Consider a fire covering an 800 m × 800 m area:  
> * **MODIS:** Fits entirely inside **1 single 1 km² pixel** $\rightarrow$ Reports: **1 hot spot**.  
> * **VIIRS:** With 375 m pixels, spans across at least **4 contiguous pixels** $\rightarrow$ Reports: **4 hot spots**.  
> *The physical flame is identical, yet raw detection count quadrupled artificially!*

---

## MODULE 4: The PyroHarmony Mathematical Harmonization Model

### Step 1: Homogeneous Spatial Binning
Individual point detections are projected onto a **regular equal-area spatial grid of $0.1^\circ \times 0.1^\circ$** ($\approx 11\text{ km} \times 11\text{ km}$ at the equator):

$$FRP_{\text{cell}}(t) = \sum_{i \in \text{cell}} FRP_i(t)$$

### Step 2: Cross-Calibration with Scale Conservation
During the multi-year satellite overlap era (2012–2024), we train orthogonal linear regressions per biome that reconcile both sensors under **energy conservation**:

$$FRP_{\text{harm}} = \alpha \cdot FRP_{\text{MODIS}} + \beta \cdot \left( k_{\text{biome}} \cdot FRP_{\text{VIIRS}} \right)$$

$$\text{Scale Conservation Principle: } \alpha + \beta = 1.00$$

* $k_{\text{biome}}$: Empirical scaling factor based on vegetative density (Amazon $\approx 0.88$, Chaco $\approx 0.94$, Taiga $\approx 0.82$).

> ### 🏔️ Territorial Calibration Case: San Luis (Sierras & Monte)
> Across steep mountainous terrain subject to dry foehn winds (Zonda), the model tunes regional coefficients:  
> $$\alpha = 0.44 \qquad \beta = 0.56 \qquad R^2 = 0.92$$  
> This compensates for slope-induced shadow and underdetection, ensuring alarms in San Luis reflect verified biophysical crises rather than sensor artifacts.

### Step 3: Quality Control & Statistical Bounds
* **Coefficient of Determination ($R^2 \ge 0.85$):** Confirms empirical biophysical variance is thoroughly explained.
* **Mean Bias Error ($|\text{MBE}| < 5\%$):** Guarantees neither systematic overestimation nor underestimation across multi-year integrations.

---

## MODULE 5: Phenological Climatological Z-Score: 52 Weeks × 26 Years Matrix

> 🌾 **What is Fire Phenology?**  
> * **April (Week 15):** Rainy monsoon season. Recording 300 MW represents a **severe, abnormal crisis**.  
> * **August (Week 34):** Peak dry season. Recording 300 MW is **statistically routine**.  
> *Averaging an entire year together triggers false alarms during wet seasons and conceals emergencies during dry seasons.*

### 5.1 Weekly Climatological Z-Score Formula
For each of the 52 weeks of the calendar year ($s \in [1, 52]$), baseline mean ($\mu_s$) and standard deviation ($\sigma_s$) are computed across the full 26-year satellite record (2000–2026):

$$\mu_s = \frac{1}{N} \sum_{y=2000}^{2026} FRP_{s,y} \qquad \sigma_s = \sqrt{\frac{1}{N-1} \sum_{y=2000}^{2026} (FRP_{s,y} - \mu_s)^2}$$

$$Z_{s,y} = \frac{FRP_{\text{harm}(s,y)} - \mu_s}{\sigma_s}$$

### 5.2 Severity Classification & Speedometer Ranges

| Z-Score Range | HUD Color | Biophysical Meaning | Statistical Significance |
|---|---|---|---|
| $Z \le 0.0$ | Green (Low) | Activity below historical weekly baseline. | Normal baseline or damp conditions. |
| $0.0 < Z < 1.0$ | Cyan (Normal) | Within expected seasonal standard deviation. | Natural background variability ($\sim 68\%$ cases). |
| $1.0 \le Z < 2.0$ | Amber (Alert) | Thermal activity notably higher than normal. | Precautionary surveillance required. |
| $Z \ge 2.0$ | Red (Critical Anomaly) | **Statistically significant anomaly.** | **$p < 0.05$ (chance occurrence probability &lt; 5%).** |
| $Z \ge 2.5$ | Purple (Extreme Emergency) | **Out-of-scale severe ecological crisis.** | **$p < 0.01$ (occurs less than once per 100 historical seasons).** |

---

## MODULE 6: The Satellite Constellation: Terra, Aqua, Suomi-NPP & NOAA-20

All four satellites fly in **Sun-Synchronous Low Earth Orbits (LEO)** at $\sim 705 - 824\text{ km}$ altitude with a $98^\circ$ polar inclination:

| Satellite | Launch | Sensor | Equatorial Crossing (Solar Time) | Strategic Purpose |
|---|---|---|---|---|
| **Terra** | Dec 1999 | MODIS | 10:30 AM (Descending) | Morning observation; establishes baseline of the 26-year record. |
| **Aqua** | May 2002 | MODIS | 13:30 PM (Ascending) | Afternoon observation (captures peak diurnal burning). |
| **Suomi-NPP** | Oct 2011 | VIIRS | 13:30 PM (Ascending) | Inaugurates high-resolution 375 m imaging era. |
| **NOAA-20 (JPSS-1)** | Nov 2017 | VIIRS | 13:30 PM (Ascending) | Orbits 50 minutes apart from Suomi-NPP, doubling revisits. |

### 6.2 What is NADIR?
**Nadir** is the direct vertical line pointing straight down toward the center of Earth ($90^\circ$ perpendicular to surface). It is the opposite of **Zenith** (pointing upward into deep space):
* **Point of Peak Optical Sharpness:** At Nadir, optical distortion is zero (MODIS 1 km², VIIRS 375 m).
* **Swath Width:** Sweeping across scan angles away from Nadir, instruments cover broad ground swaths: **2,330 km for MODIS** and **3,040 km for VIIRS**.

### 6.3 Orbital Velocity: Real Physics vs. 3D Visualization Speed
* **True physical speed:** Satellites travel at approximately **27,000 km/h** ($7.5\text{ km/s}$), about 25 times faster than commercial airliners.
* **Orbital Period:** Circling Earth requires **99 to 101 minutes** per orbit ($\approx 14$ revolutions daily).
* **Time-lapse in 3D viewer:** Runs in accelerated time-lapse (one orbit per 15 seconds) so reviewers can observe polar inclination, orbital progression, and Nadir coverage across continents.

---

## MODULE 7: "The Defender's Cheat Sheet": 12 High-Yield Q&As to Memorize

### ❓ 1. "Why not use temperature in °C instead of inventing FRP in Megawatts?"
**Answer:** "Because spaceborne satellites cannot measure true flame temperature. In a 1 km² pixel, an 800 °C flame occupies only 0.01% of the area surrounded by cool background soil, yielding an apparent satellite temperature of just 21.3 °C. **FRP in Megawatts** resolves this by measuring total radiative energy in the 4 µm MIR band, which is directly proportional to dry biomass combustion rate."

### ❓ 2. "Why does VIIRS count 4 times more hot spots than MODIS?"
**Answer:** "Purely due to geometric pixel resolution: the VIIRS pixel (375 m) covers 7 times less area than MODIS (1,000 m). A fire front that MODIS groups into a single 1 km² point is resolved by VIIRS into 4 or 5 separate pixels. Raw counts artificially quadruple, but total harmonized FRP in Megawatts remains consistent."

### ❓ 3. "What does Nadir mean?"
**Answer:** "It is the direct vertical line pointing straight down to Earth's center ($90^\circ$ perpendicular). It represents the point of maximum optical resolution before scan angles widen into the ground swath."

### ❓ 4. "Why do satellites move so fast in the 3D viewer?"
**Answer:** "In reality they travel at 27,000 km/h, taking 100 minutes per orbit. The 3D viewer runs an intentional time-lapse (one orbit per 15 seconds) so reviewers can observe polar inclination, orbital progression, and Nadir coverage across continents."

### ❓ 5. "Why is the Z-Score weekly rather than monthly or annual?"
**Answer:** "Because of **fire phenology**. 500 MW in April (Amazon wet season) is an ecological catastrophe, whereas 500 MW in August (dry season) is routine baseline burning. The Z-Score compares Week 34 strictly against 26 historical Week 34 baselines, respecting natural seasonal cycles."

### ❓ 6. "What does $\alpha + \beta = 1.00$ signify in harmonization?"
**Answer:** "It enforces the principle of **scale and energy conservation**, guaranteeing that weighted sensor blending neither inflates nor dissipates observed physical radiative power."

### ❓ 7. "What does a Z-Score of +2.0 indicate?"
**Answer:** "It signifies observed radiative energy is 2 standard deviations above that week's 26-year historical mean. Statistically ($p < 0.05$), the probability of random occurrence is under 5%, establishing a **statistically significant anomaly**."

### ❓ 8. "How did you generate data before 2012 when VIIRS did not exist?"
**Answer:** "We never synthesize fake VIIRS hot spots. We perform **Retrospective Harmonized FRP Estimation**: orthogonal regression coefficients established during the 2012–2024 overlap period are applied to actual MODIS observations from 2000–2011, preserving true physical energy scale."

### ❓ 9. "Which official NASA datasets are integrated?"
**Answer:** "Certified NASA FIRMS archives: `MCD14DL` (MODIS Collection 6.1) and `VNP14IMGTDL` / `VJ114IMGTDL` (VIIRS 375 m NRT/Standard), alongside NASA GIBS Blue Marble high-resolution imagery."

### ❓ 10. "Why does the 3D viewer run smoothly without lag with thousands of fires?"
**Answer:** "Through Three.js WebGL `InstancedMesh`. Instead of saturating CPU buses with 50,000 separate object allocations, a single geometry is uploaded to GPU memory and rendered via one instanced draw call at stable 60 FPS."

### ❓ 11. "How does the model apply to San Luis (Argentina)?"
**Answer:** "Regional coefficients are tuned ($\alpha = 0.44$, $\beta = 0.56$, $R^2 = 0.92$) to account for rugged mountain topography and dry Zonda winds. During critical drought weeks, the gauge emits the validated alert:  
*“The thermal increase observed this week in San Luis is not an optical error due to switching satellites: the +2.8 Z-Score confirms a real, extreme thermal anomaly with 99% statistical confidence.”*"

### ❓ 12. "Which institutional users benefit from each formulation?"
**Answer:** "Three practical tiers:  
1. **Ground Firefighter (Tier 1):** Uses the Anomaly Gauge and 50-minute satellite revisit window to evaluate crew safety and retreat decisions.  
2. **Operations Commander (Tier 2):** Uses 11 km cell FRP in MW to deploy air tankers to peak combustion fronts.  
3. **Climate Scientist (Tier 3):** Audits the 26-year phenological calendar to investigate climate-driven fire season shifts."

---
*AlgoXplorers Team (Argentina) — PyroHarmony | NASA Space Apps Challenge 2026*  
*Internal technical reference and evaluation guide.*
