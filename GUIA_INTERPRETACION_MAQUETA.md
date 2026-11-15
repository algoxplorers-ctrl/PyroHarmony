# PyroHarmony: Guía de Navegación e Interpretación del Sistema
> **Manual Técnico y Operativo — Las 4 Zonas de Comando de la Plataforma**  
> **NASA Space Apps Challenge 2026** | *Harmonization of MODIS and VIIRS Hot Spots*  
> **Equipo:** AlgoXplorers (Argentina)  
> **Autores:** José Alex Fernández Montellanos (`@fajjaf`), Carlos Vizzioli (`@cvizzioli`), Sánchez Obando Gisella Elizabeth (`@gisesanchezj`), Juan Carlos Fernandez (`@jcfernan99`), Maximiliano Guevara (`@omegaredone`)

---

## 1. Declaración de Alcance y Propósito del Sistema

### 🎯 Propósito de la Plataforma
**PyroHarmony** es una **plataforma de armonización de datos biofísicos, modelado termodinámico y visualización geoespacial tridimensional** diseñada para resolver la discontinuidad histórica de dos décadas entre los sensores satelitales MODIS (Terra/Aqua, píxel de $1.000\text{ m}$) y VIIRS (Suomi-NPP/NOAA-20, píxel de $375\text{ m}$).

Su objetivo central es demostrar la viabilidad de integrar telemetría heterogénea mediante la **Potencia Radiativa del Fuego (FRP en Megawatts)** y la detección rigurosa de anomalías con un **$Z$-Score climatológico estacional de 52 semanas**.

* **Alcance Operativo:** Una plataforma interactiva completa en tiempo real montada sobre WebGL a 60 FPS (Three.js), con arquitectura MVC desacoplada, sin números mágicos y simulación continua del periodo 2000–2026.
* **Escalabilidad en Producción:** Los parámetros cargados constituyen la **calibración inicial de referencia del prototipo**, diseñada de forma modular para permitir el reentrenamiento masivo automatizado sobre terabytes de datos satelitales brutos provenientes de NASA FIRMS.

---

## 2. Mapa Visual de la Pantalla: Las 4 Zonas de Comando

La consola de control de PyroHarmony se estructura en cuatro zonas operativas sincronizadas en tiempo real:

```
+---------------------------------------------------------------------------------------------------+
|  ZONA 1: HUD SUPERIOR DE TELEMETRÍA                                                               |
|  [Bioma Activo]  |  [FRP Armonizado Total (MW)]  |  [Satélites Activos en Órbita según Año]       |
+-----------------------------------------------------------------+---------------------------------+
|  ZONA 2: VISUALIZADOR 3D WEBGL (THREE.JS 60 FPS)                |  ZONA 3: PANEL DE CONTROL       |
|  - Globo terráqueo Blue Marble con atmósfera y nubes dinámicas  |  - Anomaly Gauge (Z-Score)      |
|  - Órbitas polares heliosincrónicas a escala                    |  - Sensor Discrepancy Card      |
|  - Haces ópticos Nadir (MODIS 2.330 km vs VIIRS 3.040 km)       |  - Selector de Biomas / Región  |
|  - Focos térmicos instanciados por GPU (InstancedMesh)          |  - Generador SitRep (Cuadrillas)|
+-----------------------------------------------------------------+---------------------------------+
|  ZONA 4: LÍNEA DE TIEMPO Y CALENDARIO FENOLÓGICO DE 26 AÑOS                                       |
|  - Scrubber Temporal Anual (2000 —————————●————————— 2026)                                        |
|  - Burning Activity Calendar (Matriz interactiva de 52 Semanas × 26 Años con mapa de calor Z)    |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Interpretación Componente por Componente

### 🛰️ Zona 1: HUD Superior de Telemetría
* **Bioma y Coordenadas:** Identifica el ecosistema activo (Amazonía, Pantanal, San Luis, Gran Chaco o Taiga Boreal).
* **FRP Armonizado Total:** Muestra la energía térmica radiada total consolidada en Megawatts ($\text{MW}$), calculada mediante la combinación convectiva y radiativa de Kaufman:
  $$\text{FRP} = C \cdot \sum_{i} \left( T_{4i}^4 - \bar{T}_{4b}^4 \right)$$
* **Constelación en Órbita:** Indica cuántos y cuáles satélites están activos según el año seleccionado.

### 🌐 Zona 2: El Globo 3D y la Constelación Satelital
* **Activación Temporal Histórica:**
  * **2000–2002:** Solo satélite **Terra** (MODIS AM, órbita descendente 10:30 LT).
  * **2002–2011:** Constelación MODIS dual (**Terra + Aqua** PM, 13:30 LT).
  * **2012–2017:** Incorporación de **Suomi-NPP** (VIIRS, píxel de $375\text{ m}$).
  * **2018–2026:** Constelación completa cuádruple (**Terra + Aqua + Suomi-NPP + NOAA-20**).
* **Haces Ópticos Nadir:** Visualización a escala real de la franja de barrido (*swath*): $2.330\text{ km}$ para MODIS y $3.040\text{ km}$ para VIIRS sin degradación de bordes (*bow-tie effect* corregido).
* **Renderizado Eficiente de Focos Térmicos:** Implementación con `THREE.InstancedMesh` para dibujar miles de focos térmicos a 60 FPS estables sin saturar el bus de memoria gráfica.

### ⚙️ Zona 3: Sensor Discrepancy Card & Anomaly Gauge
* **Resolución del Sesgo Instrumental:** Muestra cuantitativamente cómo el recuento de píxeles brutos se dispara artificialmente entre 3x y 5x al pasar a VIIRS, mientras que el **FRP Armonizado (MW)** se conserva bajo la ley:
  $$\alpha + \beta = 1{,}00$$
  garantizando la continuidad biofísica del registro sin distorsiones ópticas.
* **Velocímetro Anomaly Gauge:** Mide el desvío normalizado estacional:
  $$Z = \frac{\text{FRP}_{\text{harm}} - \mu_{w}}{\sigma_{w}}$$
  * $Z \le 0{,}0$: **Bajo / Normal** (Régimen habitual o húmedo).
  * $0{,}0 < Z < 1{,}0$: **Variabilidad Esperada** (Sin significancia de emergencia).
  * $1{,}0 \le Z < 2{,}0$: **Actividad Térmica Elevada** (Monitoreo preventivo).
  * $Z \ge 2{,}0$: **Anomalía Significativa** ($p < 0{,}05$, 95% de confianza).
  * $Z \ge 2{,}5$: **Anomalía Extrema** ($p < 0{,}01$, 99% de certeza estadística).

> ### 🏔️ Caso de Estudio Territorial: San Luis (Sierras y Monte)
> Al seleccionar el bioma de **San Luis (Sierras y Monte)**, la plataforma parametriza coeficientes específicos ($\alpha = 0{,}44$, $\beta = 0{,}56$, $R^2 = 0{,}92$) para corregir la subdetección topográfica por pendientes escarpadas y vientos locales Zonda.  
> Durante episodios críticos de sequía extrema, el panel emite la alerta validada:  
> **«El incremento de calor observado esta semana en San Luis no es un error óptico por cambio de satélites: el Z-Score de +2.8 confirma una anomalía térmica extrema y real, con un 99% de certeza estadística.»**

### 📅 Zona 4: Burning Activity Calendar (52 Semanas × 26 Años)
* **Matriz Fenológica de 1.352 Celdas:** Permite auditar visualmente los 26 años de historia satelital, distinguiendo con claridad meridiana los ciclos naturales de sequía respecto a incendios fuera de escala.
* **Comparabilidad Estacional Pura:** La semana $w$ del año $Y$ se compara **únicamente** con la distribución histórica de la semana $w$ a lo largo de los 26 años, evitando el falso positivo de contrastar meses secos contra meses lluviosos.

---

## 4. Metodología de Validación Operativa y Los 3 Proto-usuarios

La arquitectura de PyroHarmony fue diseñada para satisfacer las demandas concretas de tres niveles institucionales:

| Proto-usuario | Institución / Perfil | Uso Práctico en la Plataforma |
|---|---|---|
| **🔥 Nivel 1: Brigadista de Terreno** | San Luis Solidario / Bomberos Voluntarios | Consulta el **Anomaly Gauge** y el radar de latencia táctica LACES (ventana de $50\text{ min}$) para determinar si el frente de fuego es seguro o amerita repliegue inmediato por comportamiento extremo. |
| **🛰️ Nivel 2: Comandante Operativo** | Servicio Nacional de Manejo del Fuego (SNMF) | Emplea el **Visor 3D** y el **generador de reportes SitRep** para planificar logística, derivando aviones hidrantes y helibaldes a las celdas de $11\text{ km}$ con $Z \ge 2{,}0$. |
| **🌱 Nivel 3: Científico Ambiental** | NASA LCLUC / Ministerios de Ambiente | Audita la matriz del **Burning Activity Calendar** para analizar tendencias climáticas decenales y el adelantamiento estacional de la ventana de fuego entre 2000 y 2026. |

### Flujo de Demostración Operativa en 3 Etapas:

1. **Etapa 1 — Demostración de la Discrepancia Óptica (Era MODIS vs. Era VIIRS):**  
   Al seleccionar un bioma y navegar en el scrubber temporal desde 2010 (MODIS) hacia 2014 (VIIRS), se verifica que el conteo de focos térmicos brutos se triplica por la resolución de $375\text{ m}$. Simultáneamente, se constata que la curva de **FRP Armonizado en MW se mantiene continua**, neutralizando el salto instrumental.
2. **Etapa 2 — Detección de Anomalías con Z-Score Climatológico:**  
   Al interactuar con celdas de semanas lluviosas (ej. Semana 15), el velocímetro permanece en rangos normales ($Z \approx 0$). Al seleccionar semanas de sequía extrema histórica (ej. Semana 35 de 2020 en Pantanal o Semana 38 en San Luis), el sistema marca $Z \ge 2{,}0$ ($p < 0{,}05$), alertando una anomalía real.
3. **Etapa 3 — Generación de Telemetría Táctica (SitRep):**  
   Mediante el botón **Exportar SitRep**, se genera una ficha técnica normalizada con coordenadas, severidad termodinámica y recomendación operativa para las brigadas de combate.

---

## 5. Criterios Oficiales de Evaluación de la NASA y Solución Implementada

| Criterio Oficial NASA | Pregunta Guía de Evaluación | Implementación en la Plataforma PyroHarmony |
|---|---|---|
| **Impacto (Impact)** | ¿Resuelve una problemática ambiental y operativa real? | Resuelve la discontinuidad de 20 años de datos satelitales, permitiendo distinguir quemas agrícolas habituales de catástrofes ecológicas reales. |
| **Creatividad (Creativity)** | ¿Constituye una solución innovadora y bien estructurada? | Reemplaza el conteo engañoso de píxeles por la física del FRP en MW, integrando una matriz climatológica de 52 semanas y un entorno orbital 3D interactivo. |
| **Validez Técnica (Technical Validity)** | ¿Posee rigor científico y formulación matemática sólida? | Aplica la ecuación de Kaufman/Wooster en $4\ \mu\text{m}$, el principio de conservación de escala ($\alpha + \beta = 1{,}00$) y el cálculo riguroso del $Z$-Score estacional. |
| **Uso de Datos NASA (Use of Data)** | ¿Aprovecha eficazmente los productos oficiales de la agencia? | Procesa conjuntos de datos de NASA FIRMS (`MCD14DL`, `VNP14IMGTDL`, `VJ114IMGTDL`) y texturas de alta resolución Blue Marble provistas por NASA GIBS. |
| **Presentación (Presentation)** | ¿El sistema es reproducible, navegable y estructurado? | Despliegue interactivo en producción sobre Netlify, script de inicio local automatizado (`.bat`), teleprompter de exposición y documentación técnica integral bilingüe. |

---

## 6. Integrantes del Equipo — AlgoXplorers (Argentina)

| Integrante | Usuario NASA Space Apps | Rol Técnico en el Proyecto |
|---|---|---|
| **José Alex Fernández Montellanos** | `@fajjaf` | Líder de Proyecto, Arquitectura de Datos Científicos y Modelo Matemático |
| **Carlos Vizzioli** | `@cvizzioli` | Desarrollo Full-Stack, Modelado de Datos y Algoritmos |
| **Sánchez Obando Gisella Elizabeth** | `@gisesanchezj` | Comunicación Técnica, Divulgación Científica y Experiencia de Usuario (UX) |
| **Juan Carlos Fernandez** | `@jcfernan99` | Análisis de Sistemas, Electrónica y Telemetría de Sensores en Tierra |
| **Maximiliano Guevara** | `@omegaredone` | Infraestructura de Redes, Despliegue Cloud y Auditoría de Seguridad |

---
*AlgoXplorers (Argentina) — PyroHarmony | NASA Space Apps Challenge 2026*  
*Documento oficial de navegación y evaluación del prototipo.*
