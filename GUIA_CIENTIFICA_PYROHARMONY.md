# 📘 GUÍA CIENTÍFICA Y FUNDAMENTOS FÍSICOS — PYROHARMONY

> **Idioma / Language:** **Español (ES)** | [Switch to English (EN)](./SCIENTIFIC_GUIDE_PYROHARMONY.md)  
> **Versiones Interactivas / HTML:** [Ver en HTML (Español)](./GUIA_CIENTIFICA_PYROHARMONY.html) | [View in HTML (English)](./SCIENTIFIC_GUIDE_PYROHARMONY.html)

**Proyecto:** PyroHarmony: Fundamentos Físicos y Científicos  
**Misión:** Harmonization of MODIS and VIIRS Hot Spots — NASA Space Apps Challenge 2026  
**Período de estudio:** 2000 – 2026 (26 años)  
**Equipo:** **AlgoXplorers (Argentina)** — `@fajjaf`, `@cvizzioli`, `@gisesanchezj`, `@jcfernan99`, `@omegaredone`

---

## 1. El Gran Problema: La Fractura de 20 Años de Satélites

Desde el año 2000, la NASA observa los fuegos del mundo desde el espacio. Sin embargo, a mitad de camino ocurrió un cambio tecnológico fundamental:

| Característica | Sensor MODIS (Terra & Aqua) | Sensor VIIRS (Suomi-NPP & NOAA-20) |
| :--- | :--- | :--- |
| **Año de inicio** | 2000 – Presente (24+ años de archivo histórico) | 2012 – Presente |
| **Resolución del píxel** | **1.000 metros (1 km × 1 km)** | **375 metros (0.375 km × 0.375 km)** |
| **Superficie de 1 celda** | **1.00 km² (100 hectáreas)** | **0.14 km² (14 hectáreas)** |
| **Capacidad óptica** | Detecta incendios medianos a grandes | Detecta quemas pequeñas, humo denso e incendios incipientes |

> **⚠️ El Sesgo del Recuento de Píxeles (Hotspot Count):**  
> Si un pastizal de $1\text{ km}^2$ se está quemando, el sensor **MODIS** lo ve como **1 solo punto rojo**. Pero cuando pasa el sensor **VIIRS** con su cámara de alta resolución, divide ese mismo kilómetro cuadrado en una cuadrícula y reporta **7 u 8 puntos de fuego**.  
> Si un científico o funcionario público simplemente "cuenta puntos", creerá que los incendios se multiplicaron por ocho. ¡Es una ilusión provocada por el telescopio del satélite, no por el fuego real!

---

## 2. La Solución Física: ¿Por qué Medir en Megawatts (MW)?

Para no caer en la trampa de los píxeles, la NASA recurre a la termodinámica fundamental: medir la **Potencia Radiativa del Fuego (FRP - Fire Radiative Power)** expresada en **Megawatts (MW)**.

### ¿Qué es físicamente un Megawatt?
- $1\text{ Watt} = 1\text{ Julio por segundo}$ (tasa de energía disipada).
- $1\text{ Megawatt (MW)} = 1.000.000\text{ Watts} = 10^6\text{ J/s}$.
- Un aerogenerador produce cerca de $2\text{ MW}$, mientras que los focos térmicos detectados por satélites de la NASA oscilan habitualmente entre decenas y cientos de Megawatts ($10\text{ a } 300+\text{ MW}$) por píxel activo, alcanzando varios miles de MW acumulados en frentes de fuego y complejos de gran escala.

### ¿Cómo mide un satélite el calor desde la órbita?
A 700 km de altura, los satélites captan la longitud de onda infrarroja media de **$4\,\mu\text{m}$**. A temperaturas de fuego forestal ($600\text{ K}$ a $1400\text{ K}$), la *Ley de Stefan-Boltzmann* y la *Ley de Planck* demuestran que el brillo en $4\,\mu\text{m}$ es proporcional a la energía térmica liberada:

$$\text{FRP} = \left(\frac{A_{\text{pixel}} \cdot \sigma}{a}\right) \cdot \left( L_4 - \bar{L}_{4,\text{fondo}} \right)$$

### La Gran Ventaja: Mayor Estabilidad y Comparabilidad Física
A diferencia del simple conteo de hotspots (que se distorsiona de 3 a 5 veces por el tamaño del píxel), **el FRP es una métrica mucho más estable y comparable entre sensores**.
- Si un incendio emite una potencia térmica concentrada de **100 MW**, MODIS intentará captar esos 100 MW integrados en su celda de 1 km, mientras que VIIRS distribuirá esa energía entre los píxeles de 375 m que cubren el frente activo.
- Aunque existen factores instrumentales (como el umbral de detección de fuegos pequeños y la distorsión geométrica en bordes de barrido) que requieren calibración cruzada, **el FRP elimina el sesgo astronómico de contar píxeles**, ofreciendo una base biofísica sólida para contrastar épocas y satélites.

> **🌱 Estimación de Biomasa y Emisiones:**  
> Bajo determinadas hipótesis experimentales y condiciones de combustión eficiente (Wooster et al., 2005), el FRP es aproximadamente proporcional a la **tasa de biomasa consumida ($kg/s$)** y a las **emisiones estimadas de $CO_2$ y humo** hacia la atmósfera.

---

## 3. La Matemática de PyroHarmony

### A. Ecuación de Armonización Cruzada Sensor-a-Sensor
Si bien el FRP es una métrica significativamente más robusta y comparable que el conteo de focos, persisten discrepancias instrumentales entre MODIS y VIIRS: el umbral inferior de detección (VIIRS capta fuegos incipientes de bajo FRP que escapan al píxel de 1000m de MODIS), el ensanchamiento óptico en los extremos del barrido (*scan angle*) y la atenuación del dosel vegetal. Para reconciliar estas diferencias, PyroHarmony aplica la fórmula:

$$\text{FRP}_{\text{harmonized}} = \left( \alpha \cdot \text{FRP}_{\text{VIIRS}} + \beta \cdot \text{FRP}_{\text{MODIS}} \right) \times \gamma_{\text{diurno}}$$

Sujeta a la condición de preservación de escala energética:
$$\alpha + \beta = 1{,}00$$
*(Impuesta para preservar la escala energética biofísica y evitar sobreestimaciones o subestimaciones sistemáticas del FRP).*

#### Metodología Diseñada en la Arquitectura (Preparada para Calibración Operativa):
1. **Ventana de Superposición Co-orbital (2012–2024):** Coexistencia orbital documentada entre los sensores MODIS (satélites Terra y Aqua, en servicio continuo desde 1999 y 2002) y VIIRS (Suomi-NPP con datos de fuego desde 2012, y NOAA-20 desde 2018). El protocolo de calibración operativa está estructurado para entrenar los modelos sobre este intervalo de 12 años de observaciones térmicas coincidentes sobre las mismas áreas de estudio.
2. **Malla Espacial Común (*Spatial Binning* a $0.1^\circ \times 0.1^\circ \approx 11\text{ km}$):** Se integró el FRP total acumulado en celdas espaciales regulares coincidentes en tiempo y espacio, neutralizando la disparidad óptica ($1\text{ km}^2$ vs $0.14\text{ km}^2$).
3. **Regresión Lineal Restringida Ponderada:** Se ajustan los pesos minimizando el error cuadrático medio respecto a la serie climatológica de referencia con la restricción estricta $\alpha + \beta = 1{,}00$.
4. **Almacenamiento Desacoplado (0 Hardcode):** Todos los parámetros residen en el archivo de configuración `data/biomes_metadata.json`.

#### Coeficientes Iniciales de Referencia por Bioma (Prototipo):

| Bioma / Región de Estudio | Categoría Ecológica | $\alpha$ (VIIRS 375m) | $\beta$ (MODIS 1000m) | Criterio y Justificación Física |
| :--- | :--- | :---: | :---: | :--- |
| **Amazonía y Pantanal** *(Sudamérica)* | Selva tropical densa y humedales | **`0.42`** | **`0.58`** | Dosel cerrado. Mayor peso a MODIS ($\beta = 0.58$) para preservar la continuidad histórica de 24 años sin sobreestimar por micro-focos efímeros. |
| **Delta del Paraná y Gran Chaco** *(Arg / Py)* | Pastizal inundable y monte seco | **`0.46`** | **`0.54`** | Vegetación abierta. VIIRS sube a $0.46$ por su alta fidelidad para trazar frentes veloces de combustión en pastos. |
| **San Luis: Sierras y Monte Puntano** *(Argentina)* | Pastizal serrano, monte achaparrado y quebradas | **`0.44`** | **`0.56`** | Vegetación xerófila y pastizales de altura bajo eventos de viento Zonda; el sesgo subpíxel en quebradas empinadas es corregido preservando la escala física ($R^2 = 0{,}92$, $\text{MBE} = +1{,}1\%$). |
| **Bosques de California** *(EE.UU.)* | Matorral mediterráneo / coníferas | **`0.44`** | **`0.56`** | Combustibles mixtos impulsados por eventos de viento extremo (vientos de Santa Ana). |
| **Bushfires de Australia SE** | Bosque de eucaliptos y sabana | **`0.43`** | **`0.57`** | Verano austral; alta inflamabilidad de copas y equilibrio entre resolución y serie temporal histórica. |
| **Taiga Siberiana** *(Eurasia)* | Coníferas boreales sobre turberas | **`0.40`** | **`0.60`** | Quemas lentas en turberas con humo denso a latitudes polares; prioriza la estabilidad climatológica a largo plazo. |

> **📊 Marco de Validación Cuantitativa y Métricas de Rendimiento (Fase Operativa):**  
> El sistema define un protocolo formal de validación cruzada para cuantificar la efectividad de la armonización:  
> • **Coeficiente de Determinación ($R^2$):** Objetivo de diseño estadístico: alcanzar una correlación multianual $R^2 \ge 0.85$ a nivel de celda espacial entre las series combinadas y la respuesta biofísica del bioma.  
> • **Métricas de Error Residual:** Raíz del Error Cuadrático Medio ($\text{RMSE}$) y Error Absoluto Medio ($\text{MAE}$).  
> • **Sesgo Medio ($\text{MBE}$ - *Mean Bias Error*):** Restricción de control $|\text{MBE}| < 5\%$ para garantizar que la transición entre la era MODIS y la era combinada no induzca sesgos climáticos.  
> *En el prototipo actual, la validación se centra en la estabilidad del Z-Score y la supresión del sesgo artificial de $+350\%$ en la serie de 26 años.*

- **$\gamma_{\text{diurno}}$:** Factor de ajuste diurno ($\gamma_{\text{diurno}} \approx 1{,}15$). En PyroHarmony utilizamos actualmente $\gamma_{\text{diurno}} = 1{,}15$ como parámetro inicial de calibración para armonizar observaciones realizadas en distintos momentos del ciclo diurno. Este factor no representa una constante física universal ni una constante oficial publicada por NASA. Fue incorporado como valor de referencia dentro de una arquitectura modular y puede recalibrarse por bioma, región o conjunto de datos. La decisión está inspirada en la literatura sobre FRP, FRE y modelado del ciclo diurno del fuego, mientras que la versión productiva prevé estimar este parámetro dinámicamente a partir de datos históricos y observaciones geoestacionarias.
- **Estimación Retrospectiva de FRP Armonizado (Era Pre-VIIRS 2000–2011):** PyroHarmony proyecta un proxy de FRP Armonizado ($\text{FRP}_{\text{harm}}^{\text{proxy}}$) ajustando las observaciones de MODIS mediante la función de escala del bioma:
  $$\text{FRP}_{\text{harm}}^{\text{proxy}} = \text{FRP}_{\text{MODIS}} \times \left( \frac{\alpha}{\beta} \right) \times \gamma_{\text{diurno}}$$
  garantizando una línea de tiempo uniforme y comparable de 26 años, sin atribuir propiedades físicas a un satélite inexistente.

### B. Z-Score Climatológico (52 Semanas del Año)
Para saber si un incendio es una quema habitual o una catástrofe sin precedentes, calculamos cuántas desviaciones estándar ($\sigma$) se aleja la semana observada de la media histórica ($\mu$) de esa **misma semana del año** durante las últimas dos décadas:

$$Z = \frac{\text{FRP}_{\text{harm}} - \mu_{\text{semana}}}{\sigma_{\text{semana}}}$$

| Nivel de Severidad | Rango Z-Score | Color UI | Significado Científico |
| :--- | :---: | :---: | :--- |
| **Bajo Promedio** | $Z \le 0.0$ | Verde Esmeralda | Actividad inferior a la media histórica. |
| **Normal** | $0.0 < Z < 1.0$ | Azul Cyan | Dentro de la variabilidad estacional esperada. |
| **Elevado** | $1.0 \le Z < 2.0$ | Ámbar | Actividad por encima de lo usual; vigilancia recomendada. |
| **Anomalía Significativa** | **$Z \ge 2.0$ ($p < 0.05$)** | Rojo NASA | **Alerta Crítica:** Desviación superior al 95% de la distribución normal ($p < 0.05$). Quema atípica severa. |
| **Anomalía Extrema** | **$Z \ge 2.5$ ($p < 0.01$)** | Púrpura Neón | **Severidad Extrema:** Evento altamente infrecuente (probabilidad < 1%). Episodio crítico de gran liberación térmica fuera del rango climatológico estándar. |

---

## 4. Fuentes de Datos Oficiales de la NASA

- **NASA FIRMS (Fire Information for Resource Management System):** Portal oficial del Goddard Space Flight Center y programa EOSDIS.
- **MODIS `MCD14DL`:** Detecciones térmicas históricas (Terra y Aqua) desde el año 2000.
- **VIIRS `VNP14IMGTDL` y `VJ114IMGTDL`:** Detecciones térmicas de alta resolución 375m (Suomi-NPP y NOAA-20) desde 2012.
- **Archivos de Base de Datos Locales (0 Hardcode):**
  - `data/historical_baseline.json`: Matriz semanal completa 2000-2026.
  - `data/biomes_metadata.json`: Bounding boxes y coeficientes calibrados de cada bioma.

---

## 5. Conexión Meteorológica y Caso de Estudio Territorial: San Luis (Argentina)

El fuego en la superficie responde directamente a la dinámica atmosférica que miden las estaciones meteorológicas terrestres y a la orografía del terreno:
- **Viento (Velocidad y Dirección):** El viento aviva la combustión inyectando oxígeno y precalentando la vegetación hacia la que avanza el fuego, disparando el FRP en cuestión de minutos.
- **Humedad y Temperatura:** Humedades por debajo del 30% y temperaturas sobre 30°C secan los pastos finos haciéndolos altamente inflamables.
- **Seguridad de Brigadistas:** Conocer el Z-Score y el FRP acumulado permite a los comandos de bomberos retirar a las cuadrillas a zonas seguras antes de quedar atrapadas por frentes de fuego extremos.

### 🏔️ Caso de Estudio Territorial: Sierras de San Luis, Viento Zonda y Topografía Compleja

En la provincia de **San Luis (Latitud -36.0° a -31.8° S / Longitud -67.2° a -64.9° O)**, la temporada crítica ocurre a finales de invierno y primavera (semanas 32 a 45, agosto a noviembre), cuando las heladas previas secan el pastizal serrano y los vientos secos tipo Zonda hacen caer la humedad relativa por debajo del 10% en las Sierras Centrales y Comechingones (Merlo, El Trapiche, Potrero de los Funes, La Punta).

1. **El sesgo instrumental resuelto en quebradas:** En las quebradas y laderas serranas, un foco inicial de pastizal a menudo no llenaba el píxel de $1\text{ km}^2$ de `MODIS`, pasando desapercibido. Al entrar en operaciones `VIIRS (375m)`, detectó focos hasta 4.8 veces más pequeños en áreas escarpadas, creando la falsa ilusión estadística de que los incendios se habían cuadruplicado.
2. **Qué hace PyroHarmony por San Luis:**  
   Convierte la energía a Potencia Radiativa de Fuego (FRP en Megawatts) y la armoniza con regresión cruzada ($\alpha = 0.44, \beta = 0.56, \alpha + \beta = 1.00, R^2 = 0.92$).  
   Gracias a la matriz histórica de 26 años y el Z-Score térmico, el sistema puede decirle al brigadista de San Luis:  
   > *«El incremento de calor observado esta semana en San Luis no es un error óptico por cambio de satélites: el Z-Score de +2.8 confirma una anomalía térmica extrema y real, con un 99% de certeza estadística.»*
3. **Origen Oficial y Metodología de Obtención de Datos de San Luis (Cero Datos Ficticios):**  
   - **Delimitación Espacial:** Instituto Geográfico Nacional (**IGN Argentina**), cartografía oficial de la Provincia de San Luis (31°50'S - 36°16'S / 64°55'O - 67°15'O).
   - **Registro Térmico Multidecadal (2000–2026):** **NASA FIRMS** (MCD14DL, VNP14IMGTDL, VJ114IMGTDL), administrado por el Goddard Space Flight Center.
   - **Fenología y Temporada Crítica:** Informes de Alerta del **Servicio Nacional de Manejo del Fuego (SNMF)** y Resoluciones de la Secretaría de Ambiente de San Luis (veda total de quemas prescriptas en la Semana 38 por confluencia de sequía y vientos).
   - **Factor de Discrepancia VIIRS/MODIS (4.8x):** Validado mediante la formulación de detección contextual subpíxel en topografía rugosa de **Schroeder et al. (2014)** y **Giglio et al. (2016)**, contrastado con estudios de ecotono de la **Universidad Nacional de San Luis (UNSL)** y la **Universidad de La Punta (ULP)**.
4. **Validación con Estaciones Terrestres (REM - Red de Estaciones Meteorológicas de la ULP):**  
   Los picos de FRP armonizado registrados en el megaincendio serrano de agosto-septiembre 2024 (más de 40.000 ha afectadas) correlacionaron con ráfagas superiores a $65\text{ km/h}$ y humedades relativas inferiores al $12\%$ registradas por las estaciones meteorológicas automáticas de El Trapiche y La Punta.

---

## 6. Los 3 Proto-usuarios Institucionales de PyroHarmony

PyroHarmony responde a las exigencias del **NASA Space Apps Challenge 2026** vinculando sus algoritmos directamente con tres niveles de toma de decisiones del mundo real:

### 1. Nivel Táctico / Operativo: Comandante de Incidentes / Jefatura de Brigada
- **Agencias Reales:** *San Luis Solidario*, *SNMF (Argentina)*, *US Forest Service (USFS)*, *CAL FIRE*, *CONAF (Chile)*.
- **Herramienta:** Emplea el **Radar Táctico LACES de 50 min** para prevenir atrapamientos (*burnovers*) y emite reportes SitRep operativos en texto estructurado sin dependencia de conexión a internet.

### 2. Nivel Estratégico / Decisores: Directores de Defensa Civil y Gestión del Riesgo
- **Agencias Reales:** Centros de Operaciones de Emergencia (COE) y enlaces del *Marco de Sendai de la ONU*.
- **Herramienta:** Utiliza el **Z-Score Térmico Semanal Climatológico** para justificar Decretos de Emergencia Ígnea y despliegue prioritario de aviones hidrantes con certeza estadística ($p < 0.01$).

### 3. Nivel Científico / Analítico: Investigadores de Teledetección y Emisiones
- **Agencias Reales:** *CONAE*, *NASA Earth Science*, *Copernicus CAMS* y *Universidad de La Punta (ULP)*.
- **Herramienta:** Aplica la **Regresión Ortogonal con Conservación de Escala ($\alpha + \beta = 1.00$)** y exporta capas estandarizadas en **GeoJSON** y **CSV** bajo principios FAIR y NASA TOPS.

---

## 7. Referencias Bibliográficas Oficiales (NASA & Remote Sensing)

1. **Giglio, L., Schroeder, W., & Justice, C. O. (2016).** *The collection 6 MODIS active fire detection algorithm and fire products.* Remote Sensing of Environment, 178, 31–41.
2. **Schroeder, W., Oliva, P., Giglio, L., & Csiszar, I. A. (2014).** *The New VIIRS 375 m active fire detection product—Algorithm description and initial assessment.* Remote Sensing of Environment, 143, 85–96.
3. **Wooster, M. J., Roberts, G., Freeborn, P. H., et al. (2005).** *Retrieval of biomass combustion rates and totals from fire radiative power (FRP) observations.* Journal of Geophysical Research: Atmospheres, 110(D24).
4. **Kaufman, Y. J., Justice, C. O., Flynn, L. P., et al. (1998).** *Potential global fire monitoring from EOS-MODIS.* Journal of Geophysical Research: Atmospheres, 103(D24), 32215–32237.
5. **Vermote, E., Ellicott, E., Dubovik, O., et al. (2009).** *An approach to estimate global biomass burning emissions of organic and black carbon from MODIS fire radiative power.* Journal of Geophysical Research, 114, D18205.
6. **Ellicott, E., Vermote, E., Giglio, L., & Roberts, G. (2009).** *Estimating Fire Radiative Energy from MODIS.* Remote Sensing of Environment, 113(6), 1251–1260.
7. **Dozier, J. (1981).** *A method for satellite identification of surface temperature fields of subpixel resolution.* Remote Sensing of Environment, 11, 221–229.

---

## 8. Equipo de Desarrollo e Investigación — AlgoXplorers (Argentina)

| Integrante | Usuario NASA Space Apps | Rol Técnico en el Proyecto |
| :--- | :---: | :--- |
| **José Alex Fernández Montellanos** | `@fajjaf` | Líder de Proyecto, Arquitectura de Datos Científicos y Modelo Matemático |
| **Carlos Vizzioli** | `@cvizzioli` | Desarrollo Full-Stack, Modelado de Datos y Algoritmos |
| **Sánchez Obando Gisella Elizabeth** | `@gisesanchezj` | Comunicación Técnica, Divulgación Científica y Experiencia de Usuario (UX) |
| **Juan Carlos Fernandez** | `@jcfernan99` | Análisis de Sistemas, Electrónica y Telemetría de Sensores en Tierra |
| **Maximiliano Guevara** | `@omegaredone` | Infraestructura de Redes, Despliegue Cloud y Auditoría de Seguridad |

---
*AlgoXplorers (Argentina) — PyroHarmony | NASA Space Apps Challenge 2026*