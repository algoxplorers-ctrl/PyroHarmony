/**
 * @file src/config/i18n.js
 * @description Bilingual Internationalization Service (EN default / ES dynamic toggle)
 * for PyroHarmony v2.0.0. Zero page reload required.
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */

import { DEFAULT_LANGUAGE } from './constants.js';

const DICTIONARY = Object.freeze({
  en: {
    'hud.aoi_label': 'AOI:',
    'hud.calendar_btn': 'Calendar 2000-2026',
    'hud.audio_btn': 'Audio',
    'hud.sitrep_btn': 'SitRep',
    'hud.admin_btn': 'Admin',
    'hud.install_btn': 'Install App',
    'hud.sat_constellation_4': '4 Satellites (Quad Constellation)',
    'hud.sat_constellation_3': '3 Satellites (Terra · Aqua · Suomi)',
    'hud.sat_constellation_2': '2 Satellites (Terra · Aqua MODIS)',
    'hud.sat_constellation_1': '1 Satellite (Terra EOS AM-1)',
    'left.rad_title': 'RADIATIVE TELEMETRY (FRP)',
    'left.badge_harmonized': 'HARMONIZED',
    'left.badge_proxy': 'PROXY PRE-2012',
    'left.total_power': 'Total Thermal Power:',
    'left.disc_title': 'OPTICAL VS. PHYSICAL DISCREPANCY',
    'left.badge_multisensor': 'MULTI-SENSOR',
    'left.modis_px': 'MODIS Pixel Count (1000m):',
    'left.viirs_px': 'VIIRS Pixel Count (375m):',
    'left.optical_ratio': 'Apparent Count Ratio (Bias):',
    'left.scale_law': 'Scale Conservation (α + β):',
    'left.biomass_rate': 'Dry Biomass Burn Rate (Ce):',
    'left.benchmark_btn': 'Pantanal 2020 Benchmark (W35 · Z = +2.82)',
    'right.radar_title': 'TACTICAL BURNOVER RADAR',
    'right.status_standby': 'SAFETY STATUS: STANDBY',
    'right.status_watch': 'SAFETY STATUS: ELEVATED WATCH',
    'right.status_critical': 'SAFETY STATUS: CRITICAL EVACUATION',
    'right.msg_standby': '50 min window (Suomi-NPP 13:30 ➡️ NOAA-20 14:20). No anomalous fire acceleration.',
    'right.msg_watch': '50 min window (Suomi-NPP 13:30 ➡️ NOAA-20 14:20). Moderate radiative acceleration detected — alert Lookouts.',
    'right.msg_critical': '50 min window (Suomi-NPP 13:30 ➡️ NOAA-20 14:20). Extreme radiative surge detected — trigger LACES escape routes!',
    'right.rule_title': 'Life Safety Rule (LACES):',
    'right.rule_body': 'If ΔFRP > 150% in 50 min or rear spotting is detected at < 3.5 km, evacuate immediately to Safety Zone.',
    'bottom.year_prefix': 'Year:',
    'bottom.timeline_title': 'Historical Timeline 2000 - 2026',
    'bottom.week_prefix': 'Week:',
    'status.below': 'Below Historical Average',
    'status.normal': 'Normal Seasonal Activity',
    'status.elevated': 'Elevated Activity',
    'status.significant': 'Significant Anomaly (p < 0.05)',
    'status.extreme': 'Extreme Critical Anomaly (p < 0.01)',
    'hud.auto_rotation_opt': '🌐 Planetary Auto-Rotation (Global View)',
    'modal.calendar_title': 'PHENOLOGICAL BURNING ACTIVITY CALENDAR (52 WEEKS × 27 YEARS · 2000–2026)',
    'modal.admin_title': 'ADMINISTRATION, BIOME CALIBRATION & WOLF AMENDMENT AUDIT',
    'tooltip.calendar_cell': 'Year {year} · Week {week} | Harmonized FRP: {frp} MW | Z-Score: {z} ({status})'
  },
  es: {
    'hud.aoi_label': 'AOI:',
    'hud.calendar_btn': 'Calendario 2000-2026',
    'hud.audio_btn': 'Audio',
    'hud.sitrep_btn': 'SitRep',
    'hud.admin_btn': 'Admin',
    'hud.install_btn': 'Instalar App',
    'hud.sat_constellation_4': '4 Satélites (Constelación Cuádruple)',
    'hud.sat_constellation_3': '3 Satélites (Terra · Aqua · Suomi)',
    'hud.sat_constellation_2': '2 Satélites (Terra · Aqua MODIS)',
    'hud.sat_constellation_1': '1 Satélite (Terra EOS AM-1)',
    'left.rad_title': 'TELEMETRÍA RADIATIVA (FRP)',
    'left.badge_harmonized': 'ARMONIZADO',
    'left.badge_proxy': 'PROXY PRE-2012',
    'left.total_power': 'Potencia Térmica Total:',
    'left.disc_title': 'DISCREPANCIA ÓPTICA VS. FÍSICA',
    'left.badge_multisensor': 'MULTI-SENSOR',
    'left.modis_px': 'Conteo Píxeles MODIS (1000m):',
    'left.viirs_px': 'Conteo Píxeles VIIRS (375m):',
    'left.optical_ratio': 'Ratio Aparente de Conteo (Sesgo):',
    'left.scale_law': 'Conservación de Escala (α + β):',
    'left.biomass_rate': 'Tasa Quema Biomasa Seca (Ce):',
    'left.benchmark_btn': 'Benchmark Pantanal 2020 (S35 · Z = +2.82)',
    'right.radar_title': 'RADAR TÁCTICO DE ATRAPAMIENTO',
    'right.status_standby': 'ESTADO DE SEGURIDAD: EN ESPERA (STANDBY)',
    'right.status_watch': 'ESTADO DE SEGURIDAD: VIGILANCIA ELEVADA',
    'right.status_critical': 'ESTADO DE SEGURIDAD: EVACUACIÓN CRÍTICA',
    'right.msg_standby': 'Ventana de 50 min (Suomi-NPP 13:30 ➡️ NOAA-20 14:20). Sin aceleración anómala de fuego.',
    'right.msg_watch': 'Ventana de 50 min (Suomi-NPP 13:30 ➡️ NOAA-20 14:20). Aceleración radiativa moderada — alertar Vigías.',
    'right.msg_critical': 'Ventana de 50 min (Suomi-NPP 13:30 ➡️ NOAA-20 14:20). ¡Pulso radiativo extremo — activar rutas de escape LACES!',
    'right.rule_title': 'Regla de Vida y Seguridad (LACES):',
    'right.rule_body': 'Si ΔFRP > 150% en 50 min o se detectan focos secundarios a < 3.5 km, evacuar de inmediato a Zona Segura.',
    'bottom.year_prefix': 'Año:',
    'bottom.timeline_title': 'Línea de Tiempo Histórica 2000 - 2026',
    'bottom.week_prefix': 'Semana:',
    'status.below': 'Bajo el Promedio Histórico',
    'status.normal': 'Actividad Estacional Normal',
    'status.elevated': 'Actividad Elevada',
    'status.significant': 'Anomalía Significativa (p < 0.05)',
    'status.extreme': 'Anomalía Extrema Crítica (p < 0.01)',
    'hud.auto_rotation_opt': '🌐 Rotación Automática (Vista Global)',
    'modal.calendar_title': 'CALENDARIO FENOLÓGICO DE ACTIVIDAD DE QUEMA (52 SEMANAS × 27 AÑOS · 2000–2026)',
    'modal.admin_title': 'ADMINISTRACIÓN, CALIBRACIÓN DE BIOMAS Y AUDITORÍA ENMIENDA WOLF',
    'tooltip.calendar_cell': 'Año {year} · Semana {week} | FRP Armonizado: {frp} MW | Z-Score: {z} ({status})'
  }
});

export class I18nService {
  constructor(initialLang = DEFAULT_LANGUAGE) {
    this.storageKey = 'pyroharmony_lang_v2';
    this.currentLang = this._loadStoredLang(initialLang);
    this.listeners = [];
  }

  _loadStoredLang(fallback) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(this.storageKey);
        if (saved === 'en' || saved === 'es') return saved;
      }
    } catch (_) {}
    return fallback;
  }

  getLang() {
    return this.currentLang;
  }

  setLang(lang) {
    this.currentLang = lang === 'es' ? 'es' : 'en';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.storageKey, this.currentLang);
      }
    } catch (_) {}
    this.applyToDOM();
    this.listeners.forEach((cb) => cb(this.currentLang));
    return this.currentLang;
  }

  toggleLang() {
    return this.setLang(this.currentLang === 'en' ? 'es' : 'en');
  }

  t(key, params = {}) {
    const table = DICTIONARY[this.currentLang] || DICTIONARY.en;
    let text = table[key] || DICTIONARY.en[key] || key;
    Object.keys(params).forEach((k) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
    });
    return text;
  }

  onChange(callback) {
    if (typeof callback === 'function') this.listeners.push(callback);
  }

  applyToDOM(root = typeof document !== 'undefined' ? document : null) {
    if (!root) return;
    if (root.documentElement) root.documentElement.setAttribute('lang', this.currentLang);
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = this.t(key);
    });
    const langBtn = root.getElementById('btn-toggle-lang');
    if (langBtn) langBtn.textContent = this.currentLang.toUpperCase();
  }
}

export const I18nManager = I18nService;
export const i18n = new I18nService(DEFAULT_LANGUAGE);
