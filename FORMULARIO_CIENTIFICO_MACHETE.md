# Machete Científico & Formulario Maestro — AlgoXplorers
> **Formulario Maestro, Matemáticas y Física de PyroHarmony**  
> **NASA Space Apps Challenge 2026** | *Harmonization of MODIS and VIIRS Hot Spots*  
> **Equipo:** AlgoXplorers (Argentina)  
> **Autores:** José Alex Fernández Montellanos (`@fajjaf`), Carlos Vizzioli (`@cvizzioli`), Sánchez Obando Gisella Elizabeth (`@gisesanchezj`), Juan Carlos Fernandez (`@jcfernan99`), Maximiliano Guevara (`@omegaredone`)

---

## 📑 Temas de Estudio en este Documento

1. **La Física Térmica y el Fuego:** ¿Por qué NO usamos temperatura en °C? (Stefan-Boltzmann, el poder de $T^4$ y Sub-píxel)
2. **La Potencia Radiativa del Fuego (FRP en Megawatts):** Ecuación de Wooster y Kaufman
3. **La Fractura Óptica MODIS vs. VIIRS:** Geometría de Píxel, Efecto Bowtie y Swath Nadir
4. **El Modelo de Armonización:** Spatial Binning, Calibración Cruzada, Conservación $\alpha + \beta = 1{,}00$ y Caso San Luis
5. **El Z-Score Fenológico Semanal:** Matriz 52 Semanas × 26 Años
6. **Satélites en Órbita Polar:** Terra, Aqua, Suomi-NPP y NOAA-20 (Órbita, Nadir y Swath)
7. **"El Machete del Defensor":** 12 Respuestas Clave Rápidas para Memorizar (Incluyendo San Luis y los 3 Proto-usuarios)

---

## MÓDULO 1: La Física Térmica: ¿Por qué la temperatura en °C engaña?

> ⚠️ **La Trampa Clásica del Termómetro de Cocina:**  
> Muchos creen erróneamente que un satélite espacial mide la temperatura como si le pusiera un termómetro a la llama (*"el incendio está a 800 °C"*). **Eso es imposible desde 700 km de altura.**

### 1.1 La Ley de Stefan-Boltzmann
Cualquier cuerpo emite energía térmica proporcional a la **cuarta potencia de su temperatura absoluta en Kelvin ($T^4$)**:

$$E = \epsilon \cdot \sigma \cdot T^4$$

* $\sigma = 5{,}67 \times 10^{-8}\text{ W}/(\text{m}^2\cdot\text{K}^4)$ (Constante de Stefan-Boltzmann).
* $\epsilon \approx 1$ (Emisividad del fuego/suelo, comportamiento casi de cuerpo negro).

### 1.2 ¿Qué significa exactamente $T^4$ ("T a la cuarta") y por qué es tan monstruoso?
**$T^4$** significa multiplicar la temperatura absoluta en Kelvin cuatro veces por sí misma:

$$T^4 = T \times T \times T \times T$$

> 💥 **El Salto Exponencial (¿Por qué no es lineal?):**  
> Si la física fuera lineal, duplicar la temperatura daría el doble de calor. Pero con **$T^4$**, la energía se dispara de forma vertiginosa:  
> * Si **duplicas** la temperatura ($2 \times T$) $\rightarrow$ la radiación aumenta **16 veces** ($2^4 = 2 \times 2 \times 2 \times 2 = 16$).  
> * Si **triplicas** la temperatura ($3 \times T$) $\rightarrow$ la radiación aumenta **81 veces** ($3^4 = 3 \times 3 \times 3 \times 3 = 81$).

Comparativa en la vida real entre suelo frío y llama activa ($K = ^\circ\text{C} + 273{,}15$):

| Objeto | Temperatura (°C) | Temperatura en Kelvin ($T$) | Su valor a la cuarta ($T^4$) | Radiancia Relativa |
|---|---|---|---|---|
| **Suelo frío / pasto** | $20^\circ\text{C}$ | $293{,}15\text{ K}$ | $293^4 \approx \mathbf{7{,}37\text{ mil millones}}$ | Línea de base ($1\times$) |
| **Llama de fuego activo** | $800^\circ\text{C}$ | $1.073{,}15\text{ K}$ | $1073^4 \approx \mathbf{1{,}326\text{ billones}}$ | **¡180 veces más energía por m²!** |

> 🛰️ **¿Por qué este $T^4$ salva a la NASA y a PyroHarmony?**  
> Porque gracias a que la energía crece a la cuarta potencia ($T^4$), una llamita pequeña de apenas $10\text{ m} \times 10\text{ m}$ en medio de un píxel gigante de $1\text{ km} \times 1\text{ km}$ **emite 180 veces más radiación por metro cuadrado que la selva que la rodea**. Brilla como un faro cegador en el espectro infrarrojo del satélite. Si la física fuera lineal, un satélite a 700 km de altura jamás podría detectar fuegos pequeños, porque el pasto frío taparía la señal térmica por completo.

### 1.3 El Problema del Sub-píxel (Cálculo Numérico Real)
En MODIS, un píxel mide **1.000 m × 1.000 m = 1.000.000 m²** (100 hectáreas). Un frente de fuego activo típico mide unos **100 m²** (el 0,01% del píxel). El resto es suelo y árboles fríos.

> 📐 **Ejemplo con números reales: ¿Cómo un fuego de 800 °C da 21,3 °C aparentes?**  
> * Suelo frío de fondo: $T_{\text{bg}} = 20^\circ\text{C} = 293{,}15\text{ K}$ (ocupa el $99{,}99\%$ del píxel, $1-p = 0{,}9999$).  
> * Llama de fuego: $T_{\text{fuego}} = 800^\circ\text{C} = 1073{,}15\text{ K}$ (ocupa solo $p = 0{,}0001$, es decir 100 m² de 1.000.000 m²).  
> 
> El sensor satelital promedia la radiación total emitida ($T_{\text{aparente}}^4$):  
> $$T_{\text{aparente}}^4 = (1 - p) \cdot T_{\text{bg}}^4 + p \cdot T_{\text{fuego}}^4$$  
> $$T_{\text{aparente}}^4 = 0{,}9999 \cdot (293{,}15)^4 + 0{,}0001 \cdot (1073{,}15)^4$$  
> $$(293{,}15)^4 \approx 7{,}38 \times 10^9 \quad \longrightarrow \quad 0{,}9999 \times 7{,}38 \times 10^9 \approx 7{,}379 \times 10^9$$  
> $$(1073{,}15)^4 \approx 1{,}326 \times 10^{12} \quad \longrightarrow \quad 0{,}0001 \times 1{,}326 \times 10^{12} \approx 1{,}326 \times 10^8$$  
> $$T_{\text{aparente}}^4 \approx 7{,}379 \times 10^9 + 0{,}133 \times 10^9 = 7{,}512 \times 10^9$$  
> $$T_{\text{aparente}} = \sqrt[4]{7{,}512 \times 10^9} \approx 294{,}46\text{ K} \approx \mathbf{21{,}3^\circ\text{C}}$$  
> 
> 👉 **Conclusión brutal:** La llama está a 800 °C, pero el sensor satelital registra 21,3 °C (¡solo 1,3 °C más caliente que el suelo frío de al lado!). Por eso la temperatura en °C es inútil para medir incendios.

---

## MÓDULO 2: Fire Radiative Power (FRP): Medir Energía en Megawatts (MW)

> 💡 **La Solución de la NASA (Kaufman & Wooster, 1998–2005):**  
> En lugar de buscar la "temperatura", los científicos descubrieron que en la banda del **Infrarrojo Medio (MIR a 3,9–4,0 µm)**, la radiancia emitida por el fuego es **linealmente proporcional a la energía radiativa total** liberada por la combustión.

### 2.1 Ecuación de Wooster (Aproximación de Radiación MIR)
Para cada píxel con fuego detectado, el FRP en Megawatts se calcula como:

$$FRP = \frac{A_{\text{pix}} \cdot \sigma}{a} \cdot \left( L_4 - \bar{L}_{4,\text{bg}} \right)$$

* $A_{\text{pix}}$: Área real del píxel en la superficie terrestre ($10^6\text{ m}^2$ para MODIS en Nadir).
* $\sigma$: Constante de Stefan-Boltzmann ($5{,}67 \times 10^{-8}\text{ W}/(\text{m}^2\cdot\text{K}^4)$).
* $a$: Constante de calibración del canal MIR ($\approx 3{,}0 \times 10^{-9}\text{ W}\cdot\text{m}^{-2}\cdot\text{sr}^{-1}\cdot\mu\text{m}^{-1}\cdot\text{K}^{-4}$).
* $L_4$: Radiancia espectral medida en el canal 4 µm.
* $\bar{L}_{4,\text{bg}}$: Radiancia media del suelo circundante no quemado (fondo o background).

### 2.2 ¿Por qué el FRP es una métrica biofísica real?
Existe una relación directa y universal demostrada en laboratorio entre la energía radiada ($FRE$) y los kilos de biomasa quemados:

$$FRE = \int_{t_1}^{t_2} FRP(t) \, dt \quad [\text{MegaJoules o GigaJoules}]$$
$$M_{\text{biomasa}} = C_e \times FRE$$

$$C_e \approx 0{,}368 \pm 0{,}015\text{ kg de biomasa quemada por cada MegaJoule de energía} \quad (\text{Wooster et al., 2005})$$

---

## MÓDULO 3: La Fractura Instrumental: MODIS (1.000m) vs. VIIRS (375m)

En 2012 la NASA encendió VIIRS a bordo de Suomi-NPP. Al día siguiente, las estadísticas mostraron un salto de **300% a 500% en focos de calor**.

| Característica Técnica | Sensor MODIS (Terra & Aqua) | Sensor VIIRS (Suomi-NPP & NOAA-20) | Impacto en los Datos |
|---|---|---|---|
| **Resolución en Nadir** | 1.000 m × 1.000 m ($1{,}0\text{ km}^2$) | 375 m × 375 m ($0{,}14\text{ km}^2$) | El píxel de VIIRS es **7 veces más chico en área**. |
| **Umbral de detección de fuego** | $\sim 10\text{ MW}$ a $15\text{ MW}$ mínimo | $\sim 1{,}5\text{ MW}$ a $3\text{ MW}$ mínimo | VIIRS detecta fogatas que MODIS ignora. |
| **Ancho de barrido (Swath)** | 2.330 km | 3.040 km | VIIRS no deja franjas ciegas en el ecuador. |
| **Efecto en los bordes** | Efecto Bowtie (píxel se estira a 2 × 4,8 km) | Agregación a bordo (píxel solo se estira a 750 m) | MODIS pierde precisión en los bordes. |

> 🔥 **El Ejemplo para entender la disparidad 4x en Hotspots:**  
> Imagina un incendio de 800 m × 800 m:  
> * **MODIS:** Cae dentro de **1 solo píxel** de 1 km² $\rightarrow$ Reporta: **1 foco de calor**.  
> * **VIIRS:** Con píxeles de 375 m, abarca al menos **4 píxeles contiguos** $\rightarrow$ Reporta: **4 focos de calor**.  
> *¡El fuego es idéntico, pero el recuento simple se cuadruplicó artificialmente!*

---

## MÓDULO 4: El Modelo Matemático de Armonización de PyroHarmony

### Paso 1: Spatial Binning Homogéneo
Se proyectan todas las detecciones de MODIS y VIIRS en una **grilla regular homogénea de $0{,}1^\circ \times 0{,}1^\circ$** ($\approx 11\text{ km} \times 11\text{ km}$ en el ecuador):

$$FRP_{\text{cell}}(t) = \sum_{i \in \text{cell}} FRP_i(t)$$

### Paso 2: Ecuación de Calibración Cruzada con Conservación de Escala
Durante la era de solapamiento satelital (2012–2024), entrenamos una regresión lineal ortogonal por bioma respetando la **conservación de energía**:

$$FRP_{\text{harm}} = \alpha \cdot FRP_{\text{MODIS}} + \beta \cdot \left( k_{\text{bioma}} \cdot FRP_{\text{VIIRS}} \right)$$

$$\text{Condición de Conservación de Escala: } \alpha + \beta = 1{,}00$$

* $k_{\text{bioma}}$: Factor de escala empírico por densidad vegetal (Amazonía $\approx 0{,}88$, Chaco $\approx 0{,}94$, Taiga $\approx 0{,}82$).

> ### 🏔️ Caso de Calibración Territorial: San Luis (Sierras y Monte)
> En zonas de topografía rugosa con vientos locales intensos (viento Zonda), el modelo calibra parámetros regionales específicos:  
> $$\alpha = 0{,}44 \qquad \beta = 0{,}56 \qquad R^2 = 0{,}92$$  
> Esto corrige la subdetección en laderas escarpadas, asegurando que cuando el sistema emita una alarma en San Luis, responda a una emergencia biofísica comprobada y no a un espejismo instrumental.

### Paso 3: Métricas de Control de Calidad
* **Coeficiente de Determinación ($R^2 \ge 0{,}85$):** Mide qué porcentaje de la variación física es explicada por el modelo.
* **Sesgo Medio Absoluto ($|\text{MBE}| < 5\%$):** Mean Bias Error. Garantiza que el modelo no sobreestime ni subestime la energía radiada total.

---

## MÓDULO 5: El Z-Score Fenológico: Matriz de 52 Semanas × 26 Años

> 🌾 **¿Qué es la Fenología del Fuego?**  
> * **Abril (Semana 15):** Temporada de lluvias amazónica. 300 MW es una **anomalía grave y destructiva**.  
> * **Agosto (Semana 34):** Temporada seca. 300 MW es **absolutamente normal**.  
> *Si promedias todo el año junto, generas falsas alarmas en época de lluvias y ocultas desastres en época seca.*

### 5.1 Fórmula del Z-Score Semanal
Para cada una de las 52 semanas del año ($s \in [1, 52]$), calculamos la media ($\mu_s$) y la desviación estándar ($\sigma_s$) de los 26 años históricos (2000–2026):

$$\mu_s = \frac{1}{N} \sum_{y=2000}^{2026} FRP_{s,y} \qquad \sigma_s = \sqrt{\frac{1}{N-1} \sum_{y=2000}^{2026} (FRP_{s,y} - \mu_s)^2}$$

$$Z_{s,y} = \frac{FRP_{\text{harm}(s,y)} - \mu_s}{\sigma_s}$$

### 5.2 Tabla de Clasificación de Severidad

| Rango de Z-Score | Color en Pantalla | Significado Biofísico | Significancia Estadística |
|---|---|---|---|
| $Z \le 0{,}0$ | Verde (Bajo) | Actividad inferior a la media histórica observada. | Condición normal o húmeda. |
| $0{,}0 < Z < 1{,}0$ | Cyan (Normal) | Dentro del desvío típico esperado de la estación. | Variabilidad natural ($\sim 68\%$ casos). |
| $1{,}0 \le Z < 2{,}0$ | Ámbar (Alerta) | Actividad notablemente superior a lo habitual. | Vigilancia preventiva reforzada. |
| $Z \ge 2{,}0$ | Rojo (Anomalía Crítica) | **Anomalía estadísticamente significativa.** | **$p < 0{,}05$ (probabilidad al azar &lt; 5%).** |
| $Z \ge 2{,}5$ | Púrpura (Emergencia Extrema) | **Evento atípico extremo severo.** | **$p < 0{,}01$ (menos de 1 vez cada 100 eventos).** |

---

## MÓDULO 6: La Constelación Satelital: Terra, Aqua, Suomi-NPP y NOAA-20

Todos estos satélites vuelan en **Órbita Polar Heliosincrónica (Sun-Synchronous LEO)** a $\sim 705 - 824\text{ km}$ de altitud con una inclinación de $98^\circ$:

| Satélite | Lanzamiento | Sensor | Paso Ecuatorial Solar | Función Estratégica |
|---|---|---|---|---|
| **Terra** | Dic 1999 | MODIS | 10:30 AM (Descendente) | Paso matutino. Inicio de la serie de 26 años. |
| **Aqua** | May 2002 | MODIS | 13:30 PM (Ascendente) | Paso vespertino (pico térmico de incendios). |
| **Suomi-NPP** | Oct 2011 | VIIRS | 13:30 PM (Ascendente) | Inaugura la era de alta resolución (375 m). |
| **NOAA-20 (JPSS-1)** | Nov 2017 | VIIRS | 13:30 PM (Ascendente) | Vuela a 50 min de Suomi-NPP, duplicando la revisita. |

### 6.2 ¿Qué significa NADIR?
**Nadir** es la línea recta vertical que apunta hacia abajo, hacia el centro de la Tierra ($90^\circ$ perpendicular al suelo). Es lo opuesto al **Cénit** (hacia arriba al espacio exterior):
* **Punto de máxima nitidez óptica:** Justo en el Nadir, el sensor no sufre deformación angular (MODIS 1 km², VIIRS 375 m).
* **Ancho de barrido (Swath):** A medida que el sensor barre hacia los lados alejándose del Nadir, cubre el ancho total: **2.330 km en MODIS** y **3.040 km en VIIRS**.

### 6.3 Velocidad Orbital Real vs. Maqueta 3D
* **Velocidad absoluta:** Viajan a unos **27.000 km/h** ($7{,}5\text{ km/s}$), es decir 25 veces más rápido que un avión comercial.
* **Período orbital:** Tardan de **99 a 101 minutos** en dar una vuelta completa a la Tierra ($\approx 14$ órbitas por día).
* **Time-lapse en la maqueta 3D:** Se acelera a una vuelta cada 15 segundos para poder visualizar dinámicamente la órbita polar y el cono Nadir.

---

## MÓDULO 7: "El Machete del Defensor": 12 Respuestas Clave para Memorizar

### ❓ 1. "¿Por qué no usan temperatura en °C en lugar de inventar FRP en Megawatts?"
**Respuesta:** "Porque un satélite desde el espacio no puede medir la temperatura de la llama. En un píxel de 1 km², una llama de 800 °C ocupa solo el 0,01% del área rodeada de suelo frío, dando una temperatura aparente de apenas 21 °C. El **FRP en Megawatts** resuelve esto porque mide la energía radiativa real emitida en la banda de 4 µm, que es físicamente proporcional a los kilogramos de biomasa consumidos."

### ❓ 2. "¿Por qué VIIRS cuenta 4 veces más focos que MODIS?"
**Respuesta:** "Por una razón puramente geométrica: el píxel de VIIRS (375 m) es 7 veces más pequeño en área que el de MODIS (1000 m). Un mismo fuego que MODIS registra como un único punto rojo, VIIRS lo desagrega en 4 o 5 píxeles individuales. Si cuentas puntos crees que hay 4 veces más fuego, pero si mides FRP en Megawatts, la energía total es prácticamente la misma."

### ❓ 3. "¿Qué significa Nadir?"
**Respuesta:** "Es la línea recta vertical que apunta hacia abajo, hacia el centro de la Tierra ($90^\circ$ perpendicular). Es el punto de máxima resolución óptica del satélite antes de que los haces se abran hacia los costados en el ancho de barrido (Swath)."

### ❓ 4. "¿Por qué los satélites se mueven tan rápido en la maqueta?"
**Respuesta:** "En la realidad viajan a 27.000 km/h pero tardan 100 minutos en dar una vuelta completa a la Tierra. En la maqueta aceleramos la escala temporal a modo *time-lapse* para que en 15 segundos se pueda apreciar la órbita polar, la inclinación de $98^\circ$ y el barrido del haz Nadir sobre los biomas."

### ❓ 5. "¿Por qué el Z-Score es semanal y no mensual o anual?"
**Respuesta:** "Por la **fenología del fuego**. 500 MW en abril (temporada de lluvias amazónica) es una catástrofe anómala, pero 500 MW en agosto (temporada seca) es un evento habitual. El Z-Score compara la semana 34 de 2024 exclusivamente contra las semanas 34 de los 26 años previos, respetando el ciclo estacional natural."

### ❓ 6. "¿Qué significa que $\alpha + \beta = 1{,}00$ en la armonización?"
**Respuesta:** "Es el principio de **conservación de escala y energía**. Garantiza que la combinación ponderada de MODIS ($\alpha$) y VIIRS ($\beta$) no infle ni destruya artificialmente la potencia total observada."

### ❓ 7. "¿Qué es un Z-Score de 2.0?"
**Respuesta:** "Significa que la energía observada está 2 desviaciones estándar por encima de la media histórica de esa semana. En estadística corresponde a $p < 0{,}05$, lo que demuestra que la probabilidad de que ocurra por simple azar climático es menor al 5%: es una **anomalía estadísticamente significativa**."

### ❓ 8. "¿Cómo generaron los datos previos a 2012 si VIIRS no existía?"
**Respuesta:** "No inventamos datos ni creamos un 'VIIRS sintético'. Realizamos una **Estimación Retrospectiva de FRP Armonizado**: calculamos los coeficientes de regresión ortogonal durante la era de solapamiento (2012–2024) y aplicamos esa función de calibración sobre las observaciones reales de MODIS de 2000 a 2011, preservando la escala física en Megawatts."

### ❓ 9. "¿Qué datasets oficiales de la NASA utiliza el proyecto?"
**Respuesta:** "Datos de NASA FIRMS: `MCD14DL` (MODIS Colección 6.1) y `VNP14IMGTDL` / `VJ114IMGTDL` (VIIRS 375 m NRT y Standard). Para la visualización orbital usamos capas Blue Marble de NASA GIBS."

### ❓ 10. "¿Por qué la maqueta no se traba con miles de fuegos?"
**Respuesta:** "Porque implementamos `InstancedMesh` en Three.js con WebGL. En lugar de crear 50.000 objetos individuales que saturan la CPU, se envía una sola geometría a la memoria GPU y se dibujan todas las partículas en un solo draw call a 60 FPS estables."

### ❓ 11. "¿Cómo aplican este modelo al caso real de San Luis (Argentina)?"
**Respuesta:** "Calibramos los coeficientes ($\alpha = 0{,}44$, $\beta = 0{,}56$, $R^2 = 0{,}92$) para corregir la subdetección en laderas escarpadas y pastizales de monte bajo viento Zonda. En semanas críticas de sequía extrema, el velocímetro emite la alerta situacional validada:  
*«El incremento de calor observado esta semana en San Luis no es un error óptico por cambio de satélites: el Z-Score de +2.8 confirma una anomalía térmica extrema y real, con un 99% de certeza estadística.»*"

### ❓ 12. "¿A qué usuarios institucionales les sirve cada fórmula de este machete?"
**Respuesta:** "A tres niveles de usuarios reales:  
1. **Brigadista de Terreno (Nivel 1):** Consulta el Anomaly Gauge y la ventana de 50 min de revisita satelital para saber si el frente es seguro o exige repliegue táctico inmediato.  
2. **Comandante Operativo (Nivel 2):** Usa el FRP en MW en celdas de 11 km para despachar aviones hidrantes y helibaldes hacia donde la biomasa se quema con mayor violencia.  
3. **Científico Ambiental (Nivel 3):** Audita el Burning Calendar de 26 años para estudiar el adelantamiento estacional del fuego impulsado por el cambio climático."

---
*Equipo AlgoXplorers (Argentina) — PyroHarmony | NASA Space Apps Challenge 2026*  
*Documento de estudio y capacitación interna para el equipo.*
