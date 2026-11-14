/**
 * @file src/models/FirmsDataService.js
 * @description Data ingestion, spatial synthesis, and FAIR Open Science export service
 * (GeoJSON, CSV, and Tactical SitRep) for NASA FIRMS products (MCD14DL, VNP14IMGTDL, VJ114IMGTDL).
 * Pure data layer without DOM manipulation.
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */

import {
  BIOME_CATALOG,
  SATELLITE_FLEET,
  TIMELINE_BOUNDS
} from '../config/constants.js';
import { BiofireModel } from './BiofireModel.js';
import { ClimatologyModel } from './ClimatologyModel.js';
import { HarmonizationModel } from './HarmonizationModel.js';

export class FirmsDataService {
  /**
   * Returns active satellites for a selected year based on real launch history:
   * 2000: Terra | 2002: Aqua | 2012: Suomi-NPP | 2017: NOAA-20
   * @param {number} year Selected timeline year (2000-2026)
   * @returns {Array<object>} Active satellite fleet objects
   */
  static getActiveSatellitesForYear(year) {
    return SATELLITE_FLEET.filter((sat) => year >= sat.launchYear);
  }

  /**
   * Synthesizes spatially binned 0.1° x 0.1° hotspot cells for a given biome, year, and week,
   * calibrated against the climatological Z-Score and sensor overlap physics.
   * @param {string} biomeId Target biome ID
   * @param {number} year Target year (2000-2026)
   * @param {number} week Target week (1-52)
   * @param {Array<Array<object>>} calendarMatrix Precomputed 27x52 matrix
   * @returns {object} Complete snapshot for Controllers and Views
   */
  static getSpatiotemporalSnapshot(biomeId, year, week, calendarMatrix) {
    const biome = BIOME_CATALOG[biomeId] || BIOME_CATALOG.amazon_pantanal;
    const yearIdx = Math.max(
      0,
      Math.min(
        calendarMatrix.length - 1,
        year - TIMELINE_BOUNDS.MIN_YEAR
      )
    );
    const weekIdx = Math.max(0, Math.min(51, week - 1));
    const cellStats = calendarMatrix[yearIdx][weekIdx];
    const isOverlap = year >= TIMELINE_BOUNDS.OVERLAP_START_YEAR;

    const numClusters = 28;
    const rawCells = [];
    const targetHarmonizedMw = cellStats.frpMw;
    const perClusterMw = targetHarmonizedMw / numClusters;

    for (let i = 0; i < numClusters; i++) {
      const angle = i * 2.39996 + year * 0.13 + week * 0.29;
      const radius = 0.15 + ((i % 9) * 0.22);
      const lat = Number((biome.lat + Math.sin(angle) * radius).toFixed(2));
      const lon = Number((biome.lon + Math.cos(angle) * radius * 1.25).toFixed(2));

      const weightFactor = 0.65 + 0.7 * Math.abs(Math.sin(i * 1.17 + week));
      const clusterMw = perClusterMw * weightFactor;

      const modisFrp = clusterMw * 0.96;
      const viirsRawFrp = isOverlap ? (clusterMw * 1.04) / biome.kBiome : 0;
      const countModis = Math.max(1, Math.round(modisFrp / 18));
      const countViirs = isOverlap
        ? Math.max(3, Math.round(countModis * biome.hotspotRatioViirsModis))
        : 0;

      rawCells.push({
        lat,
        lon,
        frpModis: modisFrp,
        frpViirs: viirsRawFrp,
        countModis,
        countViirs
      });
    }

    const harmonizedGrid = HarmonizationModel.harmonizeGridCells(
      rawCells,
      biomeId,
      year
    );
    const activeSatellites = this.getActiveSatellitesForYear(year);
    const biomass = BiofireModel.computeBiomassCombustion(
      harmonizedGrid.totalHarmonizedFrp
    );
    const laces = BiofireModel.evaluateTacticalLacesWindow(
      harmonizedGrid.totalHarmonizedFrp,
      cellStats.zScore
    );
    const conservation = HarmonizationModel.validateConservationLaw(biome);

    return {
      biome,
      year,
      week,
      cellStats,
      harmonizedGrid,
      activeSatellites,
      biomass,
      laces,
      conservation
    };
  }

  /**
   * Generates FAIR-compliant GeoJSON FeatureCollection of the 0.1° harmonized grid.
   * @param {object} snapshot Current spatiotemporal snapshot
   * @returns {string} Formatted GeoJSON string
   */
  static exportGeoJSON(snapshot) {
    const features = snapshot.harmonizedGrid.bins.map((bin, idx) => ({
      type: 'Feature',
      id: `bin_${idx + 1}`,
      geometry: {
        type: 'Point',
        coordinates: [bin.lon, bin.lat]
      },
      properties: {
        biome: snapshot.biome.id,
        year: snapshot.year,
        week: snapshot.week,
        grid_resolution_deg: 0.1,
        frp_modis_mw: bin.frpModis,
        frp_viirs_scaled_mw: bin.viirsScaledFrp,
        frp_harmonized_mw: bin.harmonizedFrp,
        count_modis_1000m: bin.countModis,
        count_viirs_375m: bin.countViirs,
        regime: bin.regime,
        z_score_weekly: snapshot.cellStats.zScore
      }
    }));

    return JSON.stringify(
      {
        type: 'FeatureCollection',
        metadata: {
          project: 'PyroHarmony v2.0.0 — AlgoXplorers (Argentina)',
          challenge: 'NASA Space Apps 2026: Harmonization of MODIS and VIIRS Hot Spots',
          license: 'MIT (FAIR Open Science)',
          wolf_amendment_compliant: true
        },
        features
      },
      null,
      2
    );
  }

  /**
   * Generates FAIR-compliant CSV time series for the active biome and year.
   * @param {string} biomeId Active biome identifier
   * @param {number} year Selected year
   * @param {Array<Array<object>>} calendarMatrix 27x52 matrix
   * @returns {string} CSV content string
   */
  static exportYearlyCSV(biomeId, year, calendarMatrix) {
    const yearIdx = Math.max(0, year - TIMELINE_BOUNDS.MIN_YEAR);
    const row = calendarMatrix[yearIdx] || [];
    const header =
      'biome_id,year,week,frp_harmonized_mw,climatology_mean_mw,climatology_std_mw,z_score,anomaly_tier';
    const lines = row.map(
      (c) =>
        `${biomeId},${c.year},${c.week},${c.frpMw},${c.meanMw},${c.stdMw},${c.zScore},${c.classification.tier}`
    );
    return [header, ...lines].join('\n');
  }

  /**
   * Generates a Tactical Wildland Firefighting Situation Report (SitRep).
   * @param {object} snapshot Current spatiotemporal snapshot
   * @returns {string} Plain-text operational SitRep
   */
  static generateSitRepText(snapshot) {
    const { biome, year, week, cellStats, harmonizedGrid, biomass, laces, activeSatellites } =
      snapshot;
    return [
      '========================================================================',
      'PYROHARMONY v2.0.0 — NASA FIRMS TACTICAL SITUATION REPORT (SITREP)',
      'Team AlgoXplorers (Argentina) | UN Sendai Framework & LACES Protocol',
      '========================================================================',
      `TARGET BIOME AOI    : ${biome.nameEn} (${biome.lat}°, ${biome.lon}°)`,
      `DISPATCH AGENCY     : ${biome.agencyTarget}`,
      `TEMPORAL WINDOW     : Year ${year} | ISO Week ${week}`,
      `ACTIVE SATELLITES   : ${activeSatellites.map((s) => s.name).join(', ')}`,
      '------------------------------------------------------------------------',
      '1. RADIATIVE HARMONIZATION & CONSERVATION METRICS (0.1° x 0.1° BINNING)',
      `   - Harmonized Total FRP     : ${harmonizedGrid.totalHarmonizedFrp} MW`,
      `   - MODIS Raw FRP (1000m)    : ${harmonizedGrid.totalModisFrp} MW (${harmonizedGrid.totalModisCount} pixels)`,
      `   - VIIRS Scaled FRP (375m)  : ${harmonizedGrid.totalViirsScaledFrp} MW (${harmonizedGrid.totalViirsCount} pixels)`,
      `   - Optical Count Illusion   : ${harmonizedGrid.apparentCountRatio}x (Resolved via Kaufman/Wooster MIR)`,
      `   - Scale Conservation Law   : alpha (${biome.alpha}) + beta (${biome.beta}) = ${(biome.alpha + biome.beta).toFixed(2)}`,
      `   - Calibration Quality      : R² = ${biome.rSquared} | MBE = ${biome.mbePercent}%`,
      `   - Dry Biomass Burn Rate    : ${biomass.biomassRateKgPerSec} kg/s (${biomass.biomassTonsPerHour} t/h)`,
      '------------------------------------------------------------------------',
      '2. CLIMATOLOGICAL THERMAL ANOMALY & TACTICAL LACES 50-MIN RADAR',
      `   - Weekly Climatological Z  : Z = ${cellStats.zScore >= 0 ? '+' : ''}${cellStats.zScore} (${cellStats.classification.tier})`,
      `   - Weekly Historical Base   : mu = ${cellStats.meanMw} MW | sigma = ${cellStats.stdMw} MW`,
      `   - 50-Min Orbital Delta     : Suomi-NPP (${laces.suomiFrpMw} MW) -> NOAA-20 (${laces.noaa20FrpMw} MW) [${laces.deltaPercent >= 0 ? '+' : ''}${laces.deltaPercent}%]`,
      `   - LACES Protocol Posture   : ${laces.level.toUpperCase()}`,
      '========================================================================'
    ].join('\n');
  }
}
