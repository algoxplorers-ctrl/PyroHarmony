/**
 * @file src/models/HarmonizationModel.js
 * @description Spatial binning (0.1° x 0.1° homogeneous grid), orthogonal cross-sensor
 * calibration with strict scale conservation (alpha + beta = 1.00), and pre-2012
 * retrospective MODIS proxy estimation. Zero DOM dependencies.
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */

import {
  BIOME_CATALOG,
  PHYSICS_CONSTANTS,
  TIMELINE_BOUNDS
} from '../config/constants.js';

export class HarmonizationModel {
  /**
   * Validates that biome regression weights strictly obey scale conservation (alpha + beta = 1.00)
   * and NASA quality control metrics (R² >= 0.85 and |MBE| < 5%).
   * @param {object} biome Biome configuration object
   * @returns {{isValid: boolean, weightSum: number, rSquaredOk: boolean, mbeOk: boolean}}
   */
  static validateConservationLaw(biome) {
    const weightSum = Number((biome.alpha + biome.beta).toFixed(4));
    const isConserved = Math.abs(weightSum - 1.0) < 1e-4;
    const rSquaredOk = biome.rSquared >= 0.85;
    const mbeOk = Math.abs(biome.mbePercent) < 5.0;

    return {
      isValid: isConserved && rSquaredOk && mbeOk,
      weightSum,
      rSquaredOk,
      mbeOk
    };
  }

  /**
   * Aggregates raw satellite hotspots into a homogeneous 0.1° x 0.1° (~11.1 km) grid.
   * @param {Array<{lat: number, lon: number, frpModis: number, frpViirs: number, countModis: number, countViirs: number}>} cells
   * @param {string} biomeId Active biome identifier
   * @param {number} year Selected year (2000-2026)
   * @returns {object} Spatial binning and cross-calibration summary
   */
  static harmonizeGridCells(cells, biomeId, year) {
    const biome = BIOME_CATALOG[biomeId] || BIOME_CATALOG.amazon_pantanal;
    const isOverlapEra = year >= TIMELINE_BOUNDS.OVERLAP_START_YEAR;
    const binSize = PHYSICS_CONSTANTS.SPATIAL_BIN_DEG;
    const gridMap = new Map();

    cells.forEach((pt) => {
      const binLat = Number((Math.round(pt.lat / binSize) * binSize).toFixed(1));
      const binLon = Number((Math.round(pt.lon / binSize) * binSize).toFixed(1));
      const key = `${binLat}_${binLon}`;

      if (!gridMap.has(key)) {
        gridMap.set(key, {
          key,
          lat: binLat,
          lon: binLon,
          frpModis: 0,
          frpViirs: 0,
          countModis: 0,
          countViirs: 0
        });
      }
      const bin = gridMap.get(key);
      bin.frpModis += pt.frpModis || 0;
      bin.frpViirs += isOverlapEra ? pt.frpViirs || 0 : 0;
      bin.countModis += pt.countModis || 0;
      bin.countViirs += isOverlapEra ? pt.countViirs || 0 : 0;
    });

    let totalModisFrp = 0;
    let totalViirsScaledFrp = 0;
    let totalHarmonizedFrp = 0;
    let totalModisCount = 0;
    let totalViirsCount = 0;
    const harmonizedBins = [];

    gridMap.forEach((bin) => {
      const cellResult = this.computeHarmonizedFrp(
        bin.frpModis,
        bin.frpViirs,
        biome,
        year
      );
      totalModisFrp += cellResult.modisFrp;
      totalViirsScaledFrp += cellResult.viirsScaledFrp;
      totalHarmonizedFrp += cellResult.harmonizedFrp;
      totalModisCount += bin.countModis;
      totalViirsCount += bin.countViirs;

      harmonizedBins.push({
        ...bin,
        viirsScaledFrp: cellResult.viirsScaledFrp,
        harmonizedFrp: cellResult.harmonizedFrp,
        regime: cellResult.regime
      });
    });

    const apparentCountRatio =
      isOverlapEra && totalModisCount > 0
        ? Number((totalViirsCount / totalModisCount).toFixed(2))
        : 1.0;

    return {
      biomeId: biome.id,
      year,
      isOverlapEra,
      alpha: biome.alpha,
      beta: biome.beta,
      kBiome: biome.kBiome,
      rSquared: biome.rSquared,
      mbePercent: biome.mbePercent,
      totalModisCount,
      totalViirsCount,
      apparentCountRatio,
      totalModisFrp: Number(totalModisFrp.toFixed(1)),
      totalViirsScaledFrp: Number(totalViirsScaledFrp.toFixed(1)),
      totalHarmonizedFrp: Number(totalHarmonizedFrp.toFixed(1)),
      bins: harmonizedBins
    };
  }

  /**
   * Computes harmonized FRP for a single 0.1° bin:
   * - Overlap Era (2012-2026): FRP_harm = alpha * FRP_MODIS + beta * (k_biome * FRP_VIIRS)
   * - Pre-2012 Era (2000-2011): Retrospective Orthogonal Transfer Proxy without synthetic VIIRS invention
   * @param {number} frpModis Raw MODIS FRP (MW)
   * @param {number} frpViirs Raw VIIRS FRP (MW)
   * @param {object} biome Biome orthogonal regression parameters
   * @param {number} year Target year
   * @returns {{modisFrp: number, viirsScaledFrp: number, harmonizedFrp: number, regime: string}}
   */
  static computeHarmonizedFrp(frpModis, frpViirs, biome, year) {
    const cleanModis = Math.max(0, frpModis);
    const cleanViirs = Math.max(0, frpViirs);

    if (year < TIMELINE_BOUNDS.OVERLAP_START_YEAR) {
      // Pre-2012 Retrospective Proxy: multi-annual structural correction factor
      const transferFactor =
        biome.alpha + biome.beta * (1 - biome.mbePercent / 100);
      const proxyFrp = cleanModis * transferFactor;
      return {
        modisFrp: Number(cleanModis.toFixed(2)),
        viirsScaledFrp: 0,
        harmonizedFrp: Number(proxyFrp.toFixed(2)),
        regime: 'RETROSPECTIVE_PROXY_PRE2012'
      };
    }

    const viirsScaled = biome.kBiome * cleanViirs;
    const harmonized =
      biome.alpha * cleanModis + biome.beta * viirsScaled;

    return {
      modisFrp: Number(cleanModis.toFixed(2)),
      viirsScaledFrp: Number(viirsScaled.toFixed(2)),
      harmonizedFrp: Number(harmonized.toFixed(2)),
      regime: 'DUAL_SENSOR_HARMONIZED'
    };
  }
}
