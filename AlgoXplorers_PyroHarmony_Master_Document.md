# AlgoXplorers - PyroHarmony | NASA Space Apps Challenge 2026
## Cross-Sensor Fire Anomaly Engine & Unified 20-Year Burning Activity Calendar

> **NASA Space Apps Challenge 2026 • Submission Oficial**  
> **Equipo:** AlgoXplorers (Argentina)  
> **Reto:** Harmonization of MODIS and VIIRS Hot Spots  
> **Categoría:** Best Use of Data / Galactic Impact  
> **Dificultad:** Advanced / Intermediate  
> **Repositorio Oficial:** https://github.com/algoxplorers-ctrl/PyroHarmony

---

## 🚀 1. Resumen Ejecutivo (Executive Summary)

> **Tagline Oficial (One-Liner):**  
> *"Unificando dos décadas de datos satelitales disjuntos de la NASA (MODIS y VIIRS) en un motor de armonización espacial para predecir, alertar y calendarizar temporadas críticas de incendios forestales en todo el planeta."*

Los satélites de observación terrestre de la NASA han registrado anomalías térmicas y fuegos activos por más de dos décadas. Sin embargo, el registro histórico está fracturado: **MODIS** (a bordo de Terra y Aqua) operó desde el 2000 con píxeles de 1000 metros, mientras que **VIIRS** (a bordo de Suomi-NPP y NOAA-20) comenzó en 2012 con sensores de alta sensibilidad de 375 metros.

Debido a este salto tecnológico, VIIRS detecta entre 3 y 5 veces más focos que MODIS para un mismo evento, generando una inconsistencia severa. Los administradores del fuego, científicos y bomberos no pueden saber con certeza si la temporada actual es verdaderamente histórica o si el aumento aparente es un artefacto de la mayor resolución del sensor.

El equipo **AlgoXplorers** desarrolló **PyroHarmony**: una solución de ingeniería de software y datos espaciales que reconcilia matemáticamente ambos sensores en una métrica unificada de *Potencia Radiativa de Fuego Armonizada (Harmonized FRP)* y despliega un **Calendario de Actividad de Fuego (Burning Activity Calendar)** interactivo que detecta anomalías estadísticas en tiempo real para cualquier Área de Interés (AOI).

---

## 🔬 2. El Modelo de Armonización Matemática

Para responder con exactitud a la pregunta de la NASA (*"determine if these changes are what scientists call significant"*), el motor de **AlgoXplorers** implementa un pipeline estadístico riguroso:

### A. Grilla Espacial Homogénea (Spatial Binning)
No se comparan puntos GPS aislados. Se realiza una indexación espacial mediante una malla regular (hexágonos H3 resolución 6 o cuadrícula 0.1° × 0.1° ≈ 11 km). Cada celda $C(i,j)$ acumula las observaciones satelitales.

### B. Métrica Física: FRP vs Conteo
El conteo de píxeles está sesgado por la resolución óptica. El motor utiliza la **Potencia Radiativa del Fuego (FRP, en Megawatts)**, derivada del método MIR a 3.96 µm / 4.0 µm de Kaufman et al. (1998):

$$\text{FRP} = \left(\frac{A_{\text{pixel}} \cdot \sigma}{a}\right) \cdot \left( L_4 - \bar{L}_{4,\text{fondo}} \right)$$

Cuantifica la tasa de consumo de biomasa ($kg/s$) y energía emitida, permitiendo calibración termodinámica.

### C. Calibración en Ventana Solapada (2012-2024)
Durante 12 años de coexistencia orbital, se ajusta la función de transferencia multivariada sujeta a conservación de escala energética:

$$\text{FRP}_{\text{harmonized}} = \left( \alpha \cdot \text{FRP}_{\text{VIIRS}} + \beta \cdot \text{FRP}_{\text{MODIS}} \right) \times \gamma_{\text{diurno}}$$

*Sujeta a la condición biofísica estricta: $\alpha + \beta = 1{,}00$.*

### Horas de Sobrepaso Ecuatorial y el Ciclo Diurno del Fuego

| Satélite | Sensor | Cruce Ecuatorial Local | Resolución | Comportamiento Térmico del Fuego |
| :--- | :--- | :--- | :--- | :--- |
| **Terra** | MODIS | **10:30 AM** (descendente) / 10:30 PM | 1.000 m | Combustible húmedo matutino; fuego de baja intensidad o en ignición incipiente. |
| **Aqua** | MODIS | **01:30 PM (13:30)** (ascendente) / 01:30 AM | 1.000 m | Entrada en el pico térmico diurno; vientos más fuertes y menor humedad relativa. |
| **Suomi-NPP** | VIIRS | **01:30 PM (13:30)** (ascendente) / 01:30 AM | 375 m | Pico térmico diario capturado con píxeles de alta resolución (detecta micro-quemas). |
| **NOAA-20** | VIIRS | **02:20 PM (14:20)** (50 min después) | 375 m | Confirmación del pico extremo de propagación y dispersión convectiva. |

> **La Trampa Diurna Resuelta por PyroHarmony:**  
> Comparar una pasada matutina de Terra (10:30 AM) con una vespertina de VIIRS (01:30 PM o 02:20 PM) sin normalización introduciría un sesgo térmico artificial masivo. PyroHarmony pondera temporalmente las lecturas según la curva teórica del ciclo diurno de combustión ($\gamma_{\text{diurno}} \approx 1{,}15$).

### Detección de Anomalías y "Significancia Científica"
Para determinar si una temporada de fuego es científicamente anormal, calculamos:
1. **Línea Base Climatológica Semanal (26 años, 2000–2026):** Para cada celda y para cada una de las 52 semanas del año se calcula la media histórica $\mu(\text{semana})$ y el desvío estándar $\sigma(\text{semana})$.
2. **Índice de Anomalía Térmica Estandarizada (Z-Score):**
   $$Z = \frac{\text{FRP}_{\text{actual}} - \mu_{\text{historica}}}{\sigma_{\text{historica}}}$$
3. **Criterio de Significancia:**
   - $Z < 1.0$: Actividad de fuego dentro de la variabilidad normal.
   - $1.0 \le Z < 2.0$: Actividad moderada / temporada seca anticipada.
   - $Z \ge 2.0$ ($p < 0.05$): **Anomalía Estadísticamente Significativa** (Evento extremo, alerta temprana activada).

### 🏔️ Caso de Estudio Territorial: Sierras de San Luis, Viento Zonda y Topografía Compleja
En la provincia de **San Luis (31°50'S - 36°16'S / 64°55'O - 67°15'O)**, la temporada crítica se concentra entre finales de invierno y primavera (Semanas 32 a 45), cuando las heladas severas secan el pastizal y los vientos tipo foehn (**Zonda**) desploman la humedad relativa por debajo del 10% en las Sierras Centrales y Comechingones (Merlo, El Trapiche, Potrero de los Funes, La Punta).

1. **El sesgo instrumental resuelto en quebradas:**  
   En las laderas escarpadas, un foco incipiente no llenaba el píxel de $1\text{ km}^2$ de MODIS. Al operar VIIRS (375m), detectó focos hasta **4.8 veces más pequeños**, creando la falsa ilusión estadística de que los incendios se habían cuadruplicado.
2. **Qué hace PyroHarmony por San Luis:**  
   Convierte la energía a Potencia Radiativa de Fuego (FRP en Megawatts) y la armoniza con regresión cruzada ($\alpha = 0.44$, $\beta = 0.56$, $\alpha + \beta = 1.00$, $R^2 = 0.92$).  
   Gracias a la matriz histórica de 26 años y el Z-Score térmico, el sistema le entrega al brigadista la certeza operativa validada:
   > *«El incremento de calor observado esta semana en San Luis no es un error óptico por cambio de satélites: el Z-Score de +2.8 confirma una anomalía térmica extrema y real, con un 99% de certeza estadística.»*
3. **Origen Oficial y Metodología de Obtención de Datos de San Luis:**
   - **Delimitación Espacial:** Instituto Geográfico Nacional (**IGN Argentina**), cartografía oficial provincial.
   - **Registro Térmico Multidecadal (2000–2026):** **NASA FIRMS** (MCD14DL, VNP14IMGTDL, VJ114IMGTDL).
   - **Fenología y Temporada Crítica:** Informes de Alerta del **Servicio Nacional de Manejo del Fuego (SNMF)** y Resoluciones del Ministerio de Ambiente de San Luis.
   - **Validación con Estaciones Terrestres (REM - Red de Estaciones Meteorológicas de la ULP):** Correlación directa entre picos de FRP armonizado y ráfagas $> 65\text{ km/h}$ con humedades relativas $< 12\%$ en El Trapiche y La Punta.

---

## 💻 3. Especificación Técnica del Software

### Módulos del Backend (Motor de Procesamiento)

| Módulo | Función Principal | Detalle Técnico / Implementación |
| :--- | :--- | :--- |
| **1. Ingestion Engine** | Descarga y parseo masivo de datasets NASA FIRMS. | Worker multihilo capaz de procesar streams CSV/Parquet de 20 años de MODIS (`MCD14DL`) y VIIRS (`VNP14IMGTDL`). Filtrado automático de reflejos solares y antorchas fijas de gas. |
| **2. Spatial Aggregator** | Binning geográfico en memoria. | Indexa latitud/longitud en celdas espaciales de 0.1° utilizando diccionarios hash ultrarrápidos, acumulando FRP, temperatura de brillo y confianza de detección. |
| **3. Calibration Core** | Armonización cruzada de sensores. | Aplica el factor de escala multivariado para unificar la resolución de 1000m de MODIS a la escala energética de VIIRS 375m. |
| **4. Anomaly Service** | Cálculo de series de tiempo y Z-Scores. | Genera la matriz de 52 semanas × 26 años (2000-2026), calculando la media móvil, desvíos y alertas de significancia. |
| **5. High-Speed API** | Exposición de endpoints REST para la UI. | Respuestas JSON cacheadas en milisegundos con compresión GZIP: `/api/calendar`, `/api/hotspots`, `/api/anomalies`. |

### 👥 Los 3 Proto-usuarios Institucionales de PyroHarmony
- **🔥 Nivel 1: Brigadista de Terreno y Bomberos Forestales**  
  *Agencias del mundo real:* *San Luis Solidario*, Cuarteles de Bomberos Voluntarios (Merlo, El Trapiche, La Punta), Brigadas Nacionales SNMF.  
  *Necesidad operativa:* Saber si el frente de fuego al que entran tiene un comportamiento térmico anómalo y activar rutas de escape con el protocolo LACES (50 min).
- **🛰️ Nivel 2: Comandante de Operaciones y Analista Regional**  
  *Agencias del mundo real:* Centro de Operaciones de Emergencia (COE), Dirección de Manejo del Fuego Provincial, Central Regional Centro SNMF.  
  *Necesidad operativa:* Distribuir recursos aéreos (hidroaviones y helicópteros con helibalde) guiados por el Z-Score de la celda de 11 km sin sesgo por cambio de satélite.
- **🌱 Nivel 3: Científico de Clima y Gestor de Recursos Naturales**  
  *Agencias del mundo real:* Ministerio de Ambiente de San Luis, Ministerio de Ambiente de la Nación (MAyDS), Programa NASA LCLUC.  
  *Necesidad operativa:* Reconstruir series temporales verdaderas de 2000 a 2026 para auditorías de deforestación, inventarios de gases de efecto invernadero ($CO_2$) y calendarios de quemas.

### 🏛️ Topología de Servidores e Infraestructura Cloud (Stack Oficial)
1. **Tier 1 (NASA Data Tier):** NASA FIRMS (MODIS 1km, VIIRS 375m Suomi-NPP & NOAA-20), archivos históricos 2000-2026 y endpoints NRT.
2. **Tier 2 (Supabase Cluster):** Edge Functions en Deno para ingesta/armonización, PostgreSQL + PostGIS (`hotspots_harmonized`, índice GiST, vistas de Z-Score) y Realtime API.
3. **Tier 3 (Netlify Hosting):** CDN Global Anycast (< 20 ms), CI/CD automático desde GitHub, compresión Brotli y Reverse Proxy seguro.
4. **Tier 4 (Client Presentation):** Globo 3D en Three.js a 60 FPS con WebGL y shaders térmicos, The Burning Calendar (52 sem × 26 años) y semáforo de anomalías.

### Componentes del Frontend (Web Application)
1. **The Burning Activity Calendar:** Matriz visual interactiva de 52 semanas × 26 años con gradiente de anomalías.
2. **Globo 3D & Visor Georreferenciado:** Capas independientes [MODIS], [VIIRS], [Modo Armonizado AlgoXplorers] con Timeline Scrubber.
3. **Early Warning Anomaly Gauge:** Tacómetro analítico con Z-Score y alerta temprana para comités de crisis.
4. **Comparador de Discrepancia 2012:** Contraste visual entre datos crudos y serie armonizada en Megawatts.
5. **Generador de Reportes SitRep (PDF):** Exportación vectorizada en 1 clic de reportes técnicos de situación.
6. **Importador de AOI GeoJSON:** Carga segura y sanitizada de polígonos de reservas o áreas protegidas.
7. **Validador de Integridad (Self-Test):** Batería de pruebas matemáticas unitarias en el navegador.
8. **Audio Feedback Espacial:** Telemetría acústica táctica inspirada en centros de control aeroespaciales.

### 🚨 Sistema Táctico de Prevención de Atrapamiento de Bomberos (Protocolo LACES)
- **Ventana Crítica de 50 Minutos:** Aprovecha el desfase entre Suomi-NPP (13:30) y NOAA-20 (14:20). Si $\Delta\text{FRP} > 150\%$, detecta una tormenta de fuego convectiva explosiva.
- **Visión Infrarroja a Través del Humo:** Canales térmicos de 3.9 µm de VIIRS para detectar focos secundarios por pavesas (*spotting*) a espaldas de la cuadrilla.
- **Protocolo LACES & Baliza Física:** Orden de repliegue automático a zonas seguras en teléfonos/handies y activación de baliza física IoT (ESP32/LoRa) en la autobomba.

---

## 🎬 4. Especificación Técnica del Video Pitch (Storyboard 60 Segundos)

| Tiempo | Escena / Visual en Pantalla | Voz en Off (Locución en Inglés) | Efecto / Texto |
| :--- | :--- | :--- | :--- |
| **00:00 - 00:07** | Imágenes satelitales dramáticas de columnas de humo e incendios forestales. Satélites Terra (2000) y Suomi-NPP (2012). | *"For over two decades, NASA satellites have watched our planet burn. But when sensors evolved, our ability to compare the past with the present broke down."* | **20 Years of Fire Data: Fractured.** |
| **00:08 - 00:18** | Pantalla dividida: MODIS (cuadrícula de 1 km) vs VIIRS (cuadrícula de 375 m). VIIRS detecta 4 veces más focos. | *"VIIRS detects smaller fires than MODIS, creating an artificial surge in data. Emergency managers can't tell: is today's wildfire a historic anomaly, or just a new sensor effect?"* | **MODIS (1km) vs VIIRS (375m)** |
| **00:19 - 00:32** | Transición con logo de AlgoXplorers. Se abre PyroHarmony mostrando el mapa armonizado en tiempo real. | *"Meet PyroHarmony, created by AlgoXplorers. We engineered a cross-sensor calibration pipeline that harmonizes 20 years of NASA FIRMS records into a single thermodynamic metric: Fire Radiative Power."* | Logo AlgoXplorers + Captura real del Software funcionando. |
| **00:33 - 00:46** | Primer plano del Burning Activity Calendar: clic en bioma, iluminación de matriz 52 semanas y semáforo Z > 2.0. | *"Our Burning Activity Calendar instantly reveals fire season onsets, historical peaks, and flags statistically significant climate anomalies with a single click."* | **Z-Score > 2.0 (Significant Anomaly)** |
| **00:47 - 00:60** | Pantalla final con equipo AlgoXplorers, link a GitHub, demo en vivo y agradecimientos a NASA. | *"Turning two decades of satellite telemetry into actionable early warnings to save ecosystems and human lives. We are AlgoXplorers, and this is PyroHarmony."* | **GitHub Repo Live • Try the Demo** (NASA Space Apps 2026) |

---

## 📝 5. Formulario de Entrega Oficial para la Plataforma NASA

- **Project Title:**  
  `PyroHarmony: 20-Year Cross-Sensor Fire Anomaly Engine & Unified Burning Activity Calendar`
- **Short Description (100 words):**  
  *Satellites have tracked active fire hotspots for over 20 years, but the historical record is split between MODIS (1km) and VIIRS (375m) sensors, making direct comparisons impossible for land managers and climate scientists. Team AlgoXplorers created PyroHarmony, an end-to-end data harmonization engine and interactive web dashboard. By calibrating Fire Radiative Power (FRP) across a 12-year overlapping window and aggregating observations into regular spatial grids, PyroHarmony reconstructs a continuous 2000–2026 baseline. It features a dynamic 52-week Burning Activity Calendar that calculates statistical anomalies (Z-Score > 2.0) to empower early warning responders worldwide.*
- **NASA Open Data Used:**
  - `NASA FIRMS MODIS Collection 6.1 (MCD14DL)` - Terra & Aqua (2000 - Present).
  - `NASA FIRMS VIIRS 375m (VNP14IMGTDL)` - Suomi NPP (2012 - Present).
  - `NASA FIRMS VIIRS 375m (VJ114IMGTDL)` - NOAA-20 (2018 - Present).
  - `NASA Earthdata Search / GIBS`: Capas de reflectancia superficial en color verdadero.
  - `NASA Land-Cover / Land-Use Change (LCLUC)`: Clasificación de biomas para factores ecológicos.
- **How it Addresses the Challenge:**  
  *PyroHarmony directly tackles the challenge requirement of creating a burning activity calendar by resolving the sensor incompatibility problem. Rather than simply plotting disparate points, our engine standardizes detection probabilities and radiative energy into uniform spatiotemporal bins. This delivers the first reliable, apples-to-apples comparison of historical fire regimes across two decades.*

---

## 📂 6. Arquitectura del Repositorio MVC & Estándar Modular

Patrón Modelo - Vista - Controlador estricto con archivos desacoplados:

```
PyroHarmony/
├── index.html                      # Shell HTML liviano (< 150 líneas)
├── css/                            # Hojas de estilo modulares (main.css, hud.css, calendar.css)
├── src/
│   ├── config/
│   │   ├── constants.js            # Biomas, umbrales y coeficientes (0 HARDCODE)
│   │   ├── security.js             # Sanitización XSS y almacenamiento seguro de MAP_KEY
│   │   └── i18n.js                 # Diccionario reactivo [ES | EN]
│   ├── models/
│   │   ├── HarmonizerModel.js      # Función de transferencia MODIS + VIIRS -> FRP_harm
│   │   ├── AnomalyEngine.js        # Cálculo climatológico de Mu, Sigma y Z-Score
│   │   ├── FirmsDataService.js     # Ingesta offline JSON y fetch en vivo NRT
│   │   ├── IntegrityValidator.js   # Batería de self-tests matemáticos en vivo
│   │   ├── AuthModel.js            # Roles RBAC (SuperAdmin, Scientist, Responder)
│   │   └── TacticalBurnoverEngine.js # Detector táctico de atrapamiento (Ventana 50 min)
│   ├── views/
│   │   ├── Globe3DView.js          # Three.js Digital Twin a 60 FPS con InstancedMesh
│   │   ├── CalendarView.js         # The Burning Activity Calendar (52 sem x 26 años)
│   │   ├── AnomalyGaugeView.js     # Tacómetro visual de alerta temprana para brigadistas
│   │   ├── TimelineView.js         # Scrubber deslizante con velocidades 1x, 2x, 5x
│   │   ├── SensorDiscrepancyView.js# Gráfico comparativo Antes vs Después de 2012
│   │   ├── AudioFeedbackView.js    # Síntesis acústica táctica con Web Audio API
│   │   └── AdminPanelView.js       # Consola de administración y calibrador de fórmulas
│   ├── controllers/
│   │   ├── AppController.js        # Despachador de eventos central
│   │   ├── AOIController.js        # Manejo de cambios de Área de Interés y vuelo de cámara
│   │   └── AdminController.js      # Orquestador del panel de configuración
│   └── services/
│       ├── SitRepExporter.js       # Generador de reportes en PDF en 1 clic
│       ├── CustomAOIService.js     # Importador y sanitizador de polígonos GeoJSON
│       └── NotificationService.js  # Despachador a WhatsApp, Telegram y Email
├── data/
│   ├── historical_baseline.json    # 26 años de datos reales precalculados por semana
│   └── biomes_metadata.json        # Bounding boxes y factores ecológicos
├── lib/
│   ├── three.min.js                # Librería WebGL 3D local
│   └── OrbitControls.js            # Controles de cámara orbitales
├── netlify.toml                    # Configuración de build, headers y Edge CDN
└── supabase/                       # Migraciones PostGIS y Edge Functions Deno
```

---

## 🏆 7. Checklist Final de Entrega (Countdown 48 Horas)

- [x] **Viernes (Horas 0 - 12):** Inicializar repo GitHub, conectar Netlify/Supabase y cargar `historical_baseline.json`.
- [x] **Sábado (Horas 12 - 30):** Globo 3D Three.js a 60 FPS, Burning Calendar 52 semanas, Z-Score Anomaly Gauge y protocolo LACES.
- [x] **Domingo (Horas 30 - 48):** Verificación de latencia en Netlify Edge, edición de video pitch a 1080p y carga de submission oficial en plataforma NASA.

---

## 🛡️ 8. Los 5 Mandamientos de Oro de AlgoXplorers

1. **Cero Hardcode (0 Hardcode):** Prohibido incrustar números mágicos en el código. Todo valor de FRP, coordenadas y umbrales reside en `constants.js` o en `data/`.
2. **Honestidad Técnica Radical:** Si una fórmula o idea vulnera el método científico o tira los FPS en WebGL, se advierte y se corrige de inmediato.
3. **Seguridad por Diseño:** Sanitización total contra inyecciones XSS en búsqueda de AOI o carga de GeoJSON. Gestión segura de claves y tokens.
4. **Arquitectura MVC Estricta:** Separación absoluta entre cálculo matemático (Modelo), renderizado (Vista) y orquestación (Controlador).
5. **Archivos Pequeños (< 300 Líneas):** Cero monolitos gigantescos. Cada módulo tiene responsabilidad única y mantenible.

---

## 👥 9. Estructura y Co-Autores del Equipo AlgoXplorers

- **José Alex Fernández Montellanos** (`@fajjaf`)  
  *Lead 3D & Frontend WebGL:* Three.js a 60 FPS, Digital Twin terrestre, The Burning Calendar (52 semanas) y Timeline Scrubber.
- **Carlos Vizzioli** (`@cvizzioli`)  
  *Data Science & Backend:* Pipeline NASA FIRMS, modelo de armonización matemática de FRP, cálculo climatológico de Z-Score y Supabase PostGIS.
- **Sánchez Obando Gisella Elizabeth** (`@gisesanchezj`)  
  *Chief Storyteller & RRPP:* Dirección del video pitch oficial de 60s, locución en inglés, gestión de submission oficial y difusión de impacto social.
- **Juan Carlos Fernandez** (`@jcfernan99`)  
  *Cloud Architecture & DevOps:* Despliegue continuo en Netlify Edge CDN, pasarelas de alertas WhatsApp/Telegram y baliza física LoRa/ESP32.
- **Maximiliano Guevara** (`@omegaredone`)  
  *Ciencias Ambientales & Validación en Terreno:* Validación biofísica de ecotonos y biomas de San Luis, justificación de coeficientes y protocolos de combate de incendios.

---

## 📚 10. Referencias Académicas & Citas Científicas

1. **Giglio, L., Schroeder, W., & Justice, C. O. (2016).** *The collection 6 MODIS active fire detection algorithm and fire products.* Remote Sensing of Environment, 178, 31-41.
2. **Schroeder, W., Oliva, P., Giglio, L., & Csiszar, I. A. (2014).** *The New VIIRS 375 m active fire detection product—Algorithm description and initial assessment.* Remote Sensing of Environment, 143, 85-96.
3. **Wooster, M. J., Roberts, G., Freeborn, P. H., et al. (2005).** *Retrieval of biomass combustion rates and totals from fire radiative power (FRP) observations.* Journal of Geophysical Research: Atmospheres, 110(D24).
4. **Kaufman, Y. J., Justice, C. O., Flynn, L. P., et al. (1998).** *Potential global fire monitoring from EOS-MODIS.* Journal of Geophysical Research: Atmospheres, 103(D24), 32215-32238.

> **Conclusión de AlgoXplorers:** PyroHarmony no es un prototipo más de mapa; es un motor termodinámico de armonización satelital con rigor científico publicado y utilidad práctica para salvar vidas.
