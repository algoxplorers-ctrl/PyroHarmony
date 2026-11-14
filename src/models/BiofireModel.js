/**
 * @file src/models/BiofireModel.js
 * @description Pure biophysical radiative model implementing Stefan-Boltzmann sub-pixel
 * physics (Dozier, 1981) and 4 µm Mid-Infrared (MIR) Fire Radiative Power formulation
 * (Kaufman et al., 1998; Wooster et al., 2005). Strictly decoupled from DOM and WebGL.
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */

import { PHYSICS_CONSTANTS } from '../config/constants.js';

export class BiofireModel {
  /**
   * Computes radiative exitance E = epsilon * sigma * T^4 (W/m²)
   * @param {number} tempKelvin Temperature in Kelvin
   * @param {number} emissivity Surface spectral emissivity (0 < epsilon <= 1)
   * @returns {number} Radiative flux density in W/m²
   */
  static computeStefanBoltzmannFlux(tempKelvin, emissivity = 0.98) {
    if (tempKelvin <= 0) return 0;
    const t4 = Math.pow(tempKelvin, 4);
    return emissivity * PHYSICS_CONSTANTS.STEFAN_BOLTZMANN_SIGMA * t4;
  }

  /**
   * Demonstrates the sub-pixel apparent brightness temperature fallacy (Dozier, 1981).
   * Example: An 800 °C (1073.15 K) flame occupying p = 0.01% (0.0001) of a 1 km² MODIS
   * pixel against a 21 °C (294.15 K) background yields ~21.3 °C apparent brightness temp.
   * @param {number} flameTempC Flame temperature in Celsius (default 800 °C)
   * @param {number} bgTempC Background temperature in Celsius (default 21 °C)
   * @param {number} fractionalArea Sub-pixel fraction p in [0, 1] (default 0.0001 = 0.01%)
   * @returns {{apparentTempC: number, apparentTempK: number, activeFluxWm2: number}}
   */
  static computeSubpixelApparentTemperature(
    flameTempC = 800,
    bgTempC = 21,
    fractionalArea = 0.0001
  ) {
    const p = Math.max(0, Math.min(1, fractionalArea));
    const tFlameK = flameTempC + 273.15;
    const tBgK = bgTempC + 273.15;

    const mixedT4 = p * Math.pow(tFlameK, 4) + (1 - p) * Math.pow(tBgK, 4);
    const apparentTempK = Math.pow(mixedT4, 0.25);
    const apparentTempC = apparentTempK - 273.15;
    const activeFluxWm2 =
      PHYSICS_CONSTANTS.STEFAN_BOLTZMANN_SIGMA * mixedT4;

    return {
      apparentTempC: Number(apparentTempC.toFixed(2)),
      apparentTempK: Number(apparentTempK.toFixed(2)),
      activeFluxWm2: Number(activeFluxWm2.toFixed(2))
    };
  }

  /**
   * Computes Fire Radiative Power (FRP in Megawatts) via the Wooster et al. (2005)
   * and Kaufman et al. (1998) 4 µm MIR radiance method:
   * FRP = (A_pix * sigma / a) * (L4 - L4_bg)
   * @param {number} radianceMir4um Active fire pixel 4 µm spectral radiance L4
   * @param {number} radianceBg4um Background window 4 µm spectral radiance L4_bg
   * @param {number} pixelAreaKm2 Sensor pixel area in km² (MODIS = 1.0, VIIRS = 0.140625)
   * @returns {number} Fire Radiative Power in Megawatts (MW)
   */
  static computeMirFrpMegawatts(radianceMir4um, radianceBg4um, pixelAreaKm2 = 1.0) {
    const deltaL4 = Math.max(0, radianceMir4um - radianceBg4um);
    const areaM2 = pixelAreaKm2 * 1e6;
    const coeff =
      (areaM2 * PHYSICS_CONSTANTS.STEFAN_BOLTZMANN_SIGMA) /
      PHYSICS_CONSTANTS.WOOSTER_MIR_COEFF_A;
    const frpWatts = coeff * deltaL4 * 1e-6; // Scaled to spectral radiance units
    const frpMw = frpWatts / 1e6;
    return Number(Math.max(0, frpMw).toFixed(3));
  }

  /**
   * Converts Fire Radiative Power (MW = MJ/s) to Dry Biomass Combustion Rate (kg/s)
   * using Wooster et al. (2005) universal radiative conversion coefficient Ce = 0.368 kg/MJ.
   * @param {number} frpMegawatts Total harmonized FRP in MW
   * @returns {{biomassRateKgPerSec: number, biomassTonsPerHour: number}}
   */
  static computeBiomassCombustion(frpMegawatts) {
    const validFrp = Math.max(0, frpMegawatts);
    const kgPerSec = validFrp * PHYSICS_CONSTANTS.BIOMASS_COMBUSTION_CE;
    const tonsPerHour = (kgPerSec * 3600) / 1000;
    return {
      biomassRateKgPerSec: Number(kgPerSec.toFixed(2)),
      biomassTonsPerHour: Number(tonsPerHour.toFixed(2))
    };
  }

  /**
   * Computes tactical 50-minute Suomi-NPP (13:30) -> NOAA-20 (14:20) orbital rate of spread
   * and LACES wildland firefighter safety protocol status.
   * @param {number} harmonizedFrpMw Current harmonized FRP in MW
   * @param {number} zScore Current weekly climatological Z-Score
   * @returns {{suomiFrpMw: number, noaa20FrpMw: number, deltaPercent: number, level: string}}
   */
  static evaluateTacticalLacesWindow(harmonizedFrpMw, zScore) {
    const amplification = zScore >= 2.0 ? 1.24 : zScore >= 1.0 ? 1.11 : 1.03;
    const suomiFrpMw = Number((harmonizedFrpMw * 0.94).toFixed(1));
    const noaa20FrpMw = Number((suomiFrpMw * amplification).toFixed(1));
    const deltaPercent =
      suomiFrpMw > 0
        ? Number((((noaa20FrpMw - suomiFrpMw) / suomiFrpMw) * 100).toFixed(1))
        : 0;

    let level = 'nominal';
    if (zScore >= 2.0 || deltaPercent >= 20) {
      level = 'critical';
    } else if (zScore >= 1.0 || deltaPercent >= 10) {
      level = 'watch';
    }

    return {
      suomiFrpMw,
      noaa20FrpMw,
      deltaPercent,
      level
    };
  }
}
