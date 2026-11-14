# 🧭 GUÍA TÉCNICA DE INTERPRETACIÓN DE LA MAQUETA (LAS 4 ZONAS DE COMANDO)

**Sistema:** PyroHarmony v2.0.0 — Centro de Comando de Armonización Orbital MODIS y VIIRS  
**Equipo Desarrollador:** AlgoXplorers (Argentina) · NASA Space Apps Challenge 2026  
**Modalidad Documental:** Manual Operativo en Tercera Persona y Protocolo de Validación en 3 Etapas

---

## 1. Arquitectura Operativa de las 4 Zonas de Comando

El entorno interactivo de **PyroHarmony** se organiza en cuatro zonas funcionales sincronizadas bajo el patrón Modelo-Vista-Controlador (MVC):

### ZONA 1 — HUD Superior de Telemetría y Control Global
Ubicada en la franja superior fija de la pantalla, la Zona 1 expone en tiempo real los indicadores críticos de misión:
- **Active Biome AOI:** Identifica el bioma actualmente enfocado por la cámara orbital y el motor estadístico.
- **Total Harmonized FRP (MW):** Muestra la potencia radiativa total armonizada sobre la malla de $0.1^\circ \times 0.1^\circ$.
- **Active Satellites in Orbit:** Indica cuántos de los 4 satélites oficiales de EE.UU. (Terra, Aqua, Suomi-NPP, NOAA-20) se encontraban operativos en el año seleccionado.
- **WebGL Telemetry (FPS):** Monitorea la estabilidad gráfica a 60 cuadros por segundo.
- **Conmutador Bilingüe (`#btn-toggle-lang`):** Inicia por defecto en inglés (`EN`) y permite conmutar instantáneamente a español (`ES`) sin recargar el DOM.

### ZONA 2 — Globo Terráqueo 3D Heliosincrónico (Three.js WebGL)
Ocupa el hemisferio izquierdo del área principal y representa la geometría orbital a escala física:
- **Órbitas Polares Heliosincrónicas ($98.2^\circ$ de inclinación):** Dibuja el desplazamiento de **Terra** (cruce ecuatorial 10:30 AM), **Aqua** (13:30 PM), **Suomi-NPP** (13:30 PM) y **NOAA-20** (separado por 50 minutos orbitales respecto de Suomi-NPP).
- **Conos de Barrido Nadir a Escala:** Contrasta visualmente el ancho de barrido (*swath*) de MODIS ($2.330\text{ km}$) frente al de VIIRS ($3.040\text{ km}$).
- **Celdas Térmicas por `InstancedMesh`:** Renderiza los clústeres de fuego agregados en celdas de $0.1^\circ \times 0.1^\circ$ manteniendo 60 FPS y liberando memoria GPU mediante `.dispose()`.

### ZONA 3 — Panel de Diagnóstico Biofísico y Radar Táctico LACES
Ubicada en la columna derecha, integra cinco módulos analíticos:
1. **Selector de Biomas Calibrados:** Permite alternar entre 5 biomas globales con sus coeficientes $\alpha$, $\beta$, $k_{\text{bioma}}$ y $R^2$.
2. **Velocímetro Anomaly Gauge (SVG Semicircular):** Grafica el $Z$-Score climatológico semanal con marcas en $-2\sigma$, $0\mu$, $+1\sigma$, $+2\sigma$ y $+3\sigma$.
3. **Sensor Discrepancy Card:** Demuestra cómo una discrepancia de conteo de píxeles de $3\times$ a $5\times$ entre VIIRS y MODIS converge en valores físicamente consistentes de FRP en Megawatts ($\alpha + \beta = 1.00$).
4. **Radar Táctico de Bomberos (Protocolo LACES):** Evalúa la ventana orbital de 50 minutos entre Suomi-NPP (13:30) y NOAA-20 (14:20) para alertar sobre aceleración del frente ($\Delta\text{FRP}$) bajo las 5 directrices **LACES** (*Lookouts, Awareness, Communications, Escape Routes, Safety Zones*).
5. **Generador SitRep y Exportación FAIR:** Descarga instantánea de reportes tácticos (`.txt`), mallas armonizadas (`.geojson`) y series temporales (`.csv`).

### ZONA 4 — Scrubber Multidecadal (2000–2026) y Calendario Fenológico de Quema
Situada en el panel inferior de ancho completo:
- **Scrubber Temporal (`Year:` y `Week:`):** Permite recorrer desde el año 2000 hasta 2026. Al cruzar el umbral de 2012, el sistema conmuta automáticamente entre el *Proxy Retrospectivo MODIS (2000–2011)* y la *Armonización Ortogonal Bulsensor MODIS + VIIRS (2012–2026)*.
- **Burning Activity Calendar ($52\text{ semanas} \times 27\text{ años}$):** Mapa de calor interactivo de 1.404 celdas donde cada celda codifica el $Z$-Score térmico semanal respecto a la fenología histórica de esa misma semana.

---

## 2. Protocolo de Validación de la Maqueta en 3 Etapas

1. **Etapa 1 — Verificación de Discontinuidad Instrumental y Evolución de Flota (2000 ➔ 2017):**  
   El evaluador desplaza el deslizador `Year:` al año **2001** (solo **Terra** activo en órbita), luego a **2005** (**Terra + Aqua**), a **2013** (se incorpora **Suomi-NPP** con cono VIIRS de $3.040\text{ km}$) y finalmente a **2020** (constelación completa con **NOAA-20**).
2. **Etapa 2 — Auditoría del Caso Benchmark Ground Truth (Pantanal, Semana 35 de 2020):**  
   Al presionar el botón **Pantanal 2020 Benchmark (W35)** en el HUD, la maqueta se posiciona en el bioma *Amazon & Pantanal Wetlands*, Año `2020`, Semana `35`, verificando que el velocímetro marque exactamente **$Z = +2.82$ ($p < 0.01$, Anomalía Extrema Crítica)** y que la tarjeta de discrepancia confirme $\alpha + \beta = 1.00$.
3. **Etapa 3 — Prueba de Interoperabilidad FAIR y Conmutación Bilingüe Instantánea:**  
   El evaluador hace clic en el botón `EN` (`#btn-toggle-lang`) para verificar la traducción instantánea a `ES` sin recarga de página, y descarga los archivos `.txt` (SitRep), `.geojson` y `.csv` comprobando la validez estructural de los datos abiertos.
