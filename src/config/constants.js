/**
 * @file src/config/constants.js
 * @description Physical constants, orbital telemetry, biome calibration coefficients,
 * Supabase cloud configuration, and statistical thresholds for PyroHarmony v2.0.0.
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */

export const APP_METADATA = Object.freeze({
  NAME: 'PyroHarmony',
  VERSION: '2.0.0',
  TEAM: 'AlgoXplorers',
  COUNTRY: 'Argentina',
  CHALLENGE: 'Harmonization of MODIS and VIIRS Hot Spots',
  DEFAULT_LANGUAGE: 'en',
  WOLF_AMENDMENT_COMPLIANT: true,
  BENCHMARK_CASE: Object.freeze({
    biomeId: 'amazon_pantanal',
    year: 2020,
    week: 35,
    expectedZScore: 2.82,
    pValue: 0.0048,
    label: 'Pantanal Megafire Benchmark (Week 35, 2020)'
  })
});

export const DEFAULT_LANGUAGE = 'en';

/**
 * Official Cloud Backend Configuration (Supabase Inc., San Francisco, CA, USA)
 * 100% Wolf Amendment Compliant — Public Client Configuration
 */
export const SUPABASE_CONFIG = Object.freeze({
  URL: 'https://feptrjorbyjmxweefpby.supabase.co',
  PUBLISHABLE_KEY: 'sb_publishable_z2qOAoSiUgwbGbu0Zzi4IA_34JmHiM8',
  TABLE_TELEMETRY: 'pyroharmony_telemetry',
  ORIGIN: 'Supabase Inc. (San Francisco, CA, USA)'
});

/**
 * Fundamental Radiative Physics Constants
 * Kaufman et al. (1998), Wooster et al. (2005), Dozier (1981)
 */
export const PHYSICS_CONSTANTS = Object.freeze({
  STEFAN_BOLTZMANN_SIGMA: 5.670374419e-8, // W·m⁻²·K⁻⁴
  WOOSTER_MIR_COEFF_A: 3.0e-9,            // W·m⁻²·sr⁻¹·µm⁻¹·K⁻⁴ (4 µm MIR spectral band)
  BIOMASS_COMBUSTION_CE: 0.368,           // kg/MJ (Wooster et al., 2005)
  SUBPIXEL_FLAME_TEMP_K: 1073.15,         // 800 °C flame temperature in Kelvin
  BACKGROUND_TEMP_K: 294.15,              // 21 °C ambient background in Kelvin
  MODIS_PIXEL_AREA_KM2: 1.00,             // 1000 m × 1000 m nadir footprint
  VIIRS_PIXEL_AREA_KM2: 0.140625,         // 375 m × 375 m I-band nadir footprint
  AREA_RATIO_MODIS_TO_VIIRS: 7.11,        // 1.0 / 0.140625
  SPATIAL_BIN_DEG: 0.1,                   // 0.1° × 0.1° (~11.1 km equatorial)
  SPATIAL_BIN_KM: 11.132
});

/**
 * Sun-Synchronous Polar-Orbiting Satellites (98.2° inclination)
 * 100% US NASA / NOAA Assets (Wolf Amendment Verified)
 */
export const SATELLITE_FLEET = Object.freeze([
  {
    id: 'terra',
    name: 'Terra (EOS AM-1)',
    sensor: 'MODIS',
    agency: 'NASA',
    launchYear: 2000,
    equatorCrossingLocal: '10:30 AM',
    inclinationDeg: 98.2,
    altitudeKm: 705,
    swathWidthKm: 2330,
    resolutionM: 1000,
    colorHex: '#ff5252',
    phaseOffsetRad: 0.0
  },
  {
    id: 'aqua',
    name: 'Aqua (EOS PM-1)',
    sensor: 'MODIS',
    agency: 'NASA',
    launchYear: 2002,
    equatorCrossingLocal: '13:30 PM',
    inclinationDeg: 98.2,
    altitudeKm: 705,
    swathWidthKm: 2330,
    resolutionM: 1000,
    colorHex: '#00e5ff',
    phaseOffsetRad: 1.5708
  },
  {
    id: 'suomi_npp',
    name: 'Suomi-NPP',
    sensor: 'VIIRS',
    agency: 'NASA / NOAA',
    launchYear: 2012,
    equatorCrossingLocal: '13:30 PM',
    inclinationDeg: 98.7,
    altitudeKm: 834,
    swathWidthKm: 3040,
    resolutionM: 375,
    colorHex: '#ffd600',
    phaseOffsetRad: 3.1416
  },
  {
    id: 'noaa_20',
    name: 'NOAA-20 (JPSS-1)',
    sensor: 'VIIRS',
    agency: 'NOAA / NASA',
    launchYear: 2017,
    equatorCrossingLocal: '14:20 PM (+50 min)',
    inclinationDeg: 98.7,
    altitudeKm: 834,
    swathWidthKm: 3040,
    resolutionM: 375,
    colorHex: '#00e676',
    phaseOffsetRad: 4.0142
  }
]);

/**
 * Orthogonal Regression & Scale-Conserving Biome Calibration Parameters (2012-2024)
 * Strictly satisfies alpha + beta = 1.00, R² >= 0.85, |MBE| < 5%
 */
export const BIOME_CATALOG = Object.freeze({
  amazon_pantanal: {
    id: 'amazon_pantanal',
    nameEn: 'Amazon & Pantanal (South America)',
    nameEs: 'Amazonia y Pantanal (Sudamérica)',
    lat: -17.8,
    lon: -57.4,
    alpha: 0.42,
    beta: 0.58,
    kBiome: 0.64,
    rSquared: 0.93,
    mbePercent: -1.8,
    hotspotRatioViirsModis: 4.3,
    peakWeek: 35,
    seasonalWidth: 6.5,
    baseMeanMw: 1420,
    baseStdMw: 410,
    agencyTarget: 'IBAMA (Brazil) / SNMF (Argentina)'
  },
  parana_chaco: {
    id: 'parana_chaco',
    nameEn: 'Paraná Delta & Gran Chaco (Argentina)',
    nameEs: 'Delta del Paraná y Gran Chaco (Argentina)',
    lat: -32.4,
    lon: -60.5,
    alpha: 0.45,
    beta: 0.55,
    kBiome: 0.68,
    rSquared: 0.91,
    mbePercent: 1.4,
    hotspotRatioViirsModis: 3.9,
    peakWeek: 34,
    seasonalWidth: 7.0,
    baseMeanMw: 980,
    baseStdMw: 295,
    agencyTarget: 'SNMF / CONAE (Argentina)'
  },
  san_luis_serrano: {
    id: 'san_luis_serrano',
    nameEn: 'San Luis: Sierras & Monte (Argentina)',
    nameEs: 'San Luis: Sierras y Monte Puntano (Argentina)',
    lat: -33.3,
    lon: -66.3,
    alpha: 0.44,
    beta: 0.56,
    kBiome: 0.65,
    rSquared: 0.92,
    mbePercent: 1.1,
    hotspotRatioViirsModis: 4.8,
    peakWeek: 38,
    seasonalWidth: 5.5,
    baseMeanMw: 620,
    baseStdMw: 185,
    agencyTarget: 'San Luis Solidario / Bomberos Voluntarios / SNMF'
  },
  california_chaparral: {
    id: 'california_chaparral',
    nameEn: 'California Chaparral & Sierra Nevada (USA)',
    nameEs: 'Chaparral de California y Sierra Nevada (EE.UU.)',
    lat: 38.6,
    lon: -120.8,
    alpha: 0.39,
    beta: 0.61,
    kBiome: 0.71,
    rSquared: 0.94,
    mbePercent: -1.1,
    hotspotRatioViirsModis: 4.6,
    peakWeek: 36,
    seasonalWidth: 5.5,
    baseMeanMw: 1650,
    baseStdMw: 480,
    agencyTarget: 'USFS / CAL FIRE (United States)'
  },
  boreal_taiga: {
    id: 'boreal_taiga',
    nameEn: 'North American Boreal Taiga (Canada / Alaska)',
    nameEs: 'Taiga Boreal Norteamericana (Canadá / Alaska)',
    lat: 61.5,
    lon: -114.3,
    alpha: 0.48,
    beta: 0.52,
    kBiome: 0.62,
    rSquared: 0.89,
    mbePercent: 2.3,
    hotspotRatioViirsModis: 3.5,
    peakWeek: 28,
    seasonalWidth: 5.0,
    baseMeanMw: 1890,
    baseStdMw: 540,
    agencyTarget: 'USFS / CWFIS (North America)'
  },
  australian_savanna: {
    id: 'australian_savanna',
    nameEn: 'Australian Tropical Savanna & Eucalyptus',
    nameEs: 'Sabana Tropical y Eucaliptos (Australia)',
    lat: -15.4,
    lon: 133.8,
    alpha: 0.44,
    beta: 0.56,
    kBiome: 0.69,
    rSquared: 0.92,
    mbePercent: -2.1,
    hotspotRatioViirsModis: 4.1,
    peakWeek: 45,
    seasonalWidth: 7.5,
    baseMeanMw: 1540,
    baseStdMw: 450,
    agencyTarget: 'AFAC / CSIRO (Australia)'
  }
});

export const Z_SCORE_THRESHOLDS = Object.freeze({
  BELOW_AVERAGE_MAX: 0.0,
  NORMAL_MAX: 1.0,
  ELEVATED_MAX: 2.0,
  SIGNIFICANT_ANOMALY_MIN: 2.0,
  EXTREME_CRITICAL_MIN: 2.5
});

export const TIMELINE_BOUNDS = Object.freeze({
  MIN_YEAR: 2000,
  MAX_YEAR: 2026,
  OVERLAP_START_YEAR: 2012,
  WEEKS_PER_YEAR: 52
});

export const WORLD_GEOJSON_URLS = Object.freeze([
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson',
  'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'
]);

/**
 * Reference Country Centroids [lat, lon, Name ES, Name EN, minSpanDeg]
 */
export const WORLD_COUNTRIES = Object.freeze([
  [-34.6, -64.0, 'Argentina', 'Argentina', 22], [-33.3, -66.3, 'San Luis', 'San Luis', 4], [-51.7, -59.0, 'Islas Malvinas', 'Islas Malvinas', 4],
  [-14.2, -51.9, 'Brasil', 'Brazil', 32], [-33.4, -70.6, 'Chile', 'Chile', 18],
  [-32.5, -55.7, 'Uruguay', 'Uruguay', 5], [-23.4, -58.4, 'Paraguay', 'Paraguay', 7],
  [-16.2, -63.5, 'Bolivia', 'Bolivia', 11], [-9.1, -75.0, 'Perú', 'Peru', 13],
  [-1.8, -78.1, 'Ecuador', 'Ecuador', 6], [4.5, -74.2, 'Colombia', 'Colombia', 11],
  [6.4, -66.5, 'Venezuela', 'Venezuela', 10], [23.6, -102.5, 'México', 'Mexico', 18],
  [39.8, -98.5, 'Estados Unidos', 'United States', 35], [56.1, -106.3, 'Canadá', 'Canada', 40],
  [40.4, -3.7, 'España', 'Spain', 9], [46.2, 2.2, 'Francia', 'France', 10],
  [51.1, 10.4, 'Alemania', 'Germany', 9], [41.8, 12.5, 'Italia', 'Italy', 9],
  [54.0, -2.0, 'Reino Unido', 'United Kingdom', 8], [52.0, 19.1, 'Polonia', 'Poland', 7],
  [48.3, 31.1, 'Ucrania', 'Ukraine', 12], [61.5, 90.0, 'Rusia', 'Russia', 50],
  [38.9, 35.2, 'Turquía', 'Turkey', 12], [26.8, 30.8, 'Egipto', 'Egypt', 11],
  [28.0, 1.6, 'Argelia', 'Algeria', 18], [31.7, -7.0, 'Marruecos', 'Morocco', 9],
  [9.0, 8.6, 'Nigeria', 'Nigeria', 11], [-4.0, 21.7, 'R. D. del Congo', 'DR Congo', 16],
  [9.1, 40.4, 'Etiopía', 'Ethiopia', 11], [-6.3, 34.8, 'Tanzania', 'Tanzania', 10],
  [-11.2, 17.8, 'Angola', 'Angola', 12], [-29.0, 24.0, 'Sudáfrica', 'South Africa', 14],
  [-18.7, 46.8, 'Madagascar', 'Madagascar', 10], [23.8, 45.0, 'Arabia Saudita', 'Saudi Arabia', 16],
  [32.4, 53.6, 'Irán', 'Iran', 14], [30.3, 69.3, 'Pakistán', 'Pakistan', 11],
  [21.0, 78.0, 'India', 'India', 24], [35.8, 104.1, 'China', 'China', 34],
  [46.8, 103.8, 'Mongolia', 'Mongolia', 16], [48.0, 66.9, 'Kazajistán', 'Kazakhstan', 20],
  [-2.5, 118.0, 'Indonesia', 'Indonesia', 22], [36.2, 138.2, 'Japón', 'Japan', 10],
  [-25.2, 133.7, 'Australia', 'Australia', 32], [-40.9, 174.8, 'Nueva Zelanda', 'New Zealand', 9]
]);
