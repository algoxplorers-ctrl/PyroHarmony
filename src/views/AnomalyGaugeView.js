/**
 * @file src/views/AnomalyGaugeView.js
 * @description Semicircular SVG Anomaly Speedometer View matching the exact PyroHarmony
 * telemetry card aesthetic (0σ, +1σ, +2σ, +3σ radial ticks, glowing needle, Z-Score & p-value).
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */

import { i18n } from '../config/i18n.js';

export class AnomalyGaugeView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  /**
   * Computes two-tailed normal survival p-value approximation for Z-Score display.
   * @param {number} z Z-Score value
   * @returns {string} Formatted 4-decimal p-value string
   */
  _formatExactPValue(z) {
    const absZ = Math.max(0, z);
    const t = 1 / (1 + 0.2316419 * absZ);
    const d = 0.3989423 * Math.exp((-absZ * absZ) / 2);
    const p =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return Math.max(0.0001, Math.min(0.9999, p)).toFixed(4);
  }

  /**
   * Renders the semicircular SVG Z-Score gauge and digital readout below the arc.
   * @param {object} cellStats Current week climatological statistics
   */
  render(cellStats) {
    if (!this.container || !cellStats) return;

    const z = cellStats.zScore;
    const clampedZ = Math.max(-1.0, Math.min(3.2, z));
    // Map [-1.0, +3.2] onto [-105deg, +105deg]
    const needleAngleDeg = ((clampedZ + 1.0) / 4.2) * 210 - 105;
    const statusText = i18n.t(cellStats.classification.i18nKey);
    const color =
      z >= 2.0 ? '#ef4444' : z >= 1.0 ? '#f59e0b' : z > 0 ? '#10b981' : '#38bdf8';
    const pValStr = this._formatExactPValue(z);

    this.container.innerHTML = `
      <div class="gauge-card-block">
        <svg viewBox="0 0 240 135" class="anomaly-gauge-svg" role="img" aria-label="Climatological Z-Score Gauge">
          <defs>
            <linearGradient id="pyroArcGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stop-color="#10b981" />
              <stop offset="30%" stop-color="#06b6d4" />
              <stop offset="55%" stop-color="#eab308" />
              <stop offset="78%" stop-color="#ef4444" />
              <stop offset="100%" stop-color="#a855f7" />
            </linearGradient>
          </defs>

          <!-- Outer Glow & Main Semicircular Arc -->
          <path d="M 32 115 A 88 88 0 1 1 208 115" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="14" stroke-linecap="round"/>
          <path d="M 32 115 A 88 88 0 1 1 208 115" fill="none" stroke="url(#pyroArcGrad)" stroke-width="11" stroke-linecap="round"/>

          <!-- Radial Tick Marks & Labels (0σ, +1σ, +2σ, +3σ) -->
          <text x="72" y="24" fill="#cbd5e1" font-size="9.5" font-weight="700" font-family="monospace">0σ</text>
          <text x="128" y="18" fill="#cbd5e1" font-size="9.5" font-weight="700" font-family="monospace">+1σ</text>
          <text x="182" y="42" fill="#cbd5e1" font-size="9.5" font-weight="700" font-family="monospace">+2σ</text>
          <text x="214" y="92" fill="#cbd5e1" font-size="9.5" font-weight="700" font-family="monospace">+3σ</text>

          <!-- Tapered Instrument Needle -->
          <g transform="translate(120, 102) rotate(${needleAngleDeg.toFixed(1)})">
            <polygon points="-3,4 0,-74 3,4" fill="#f8fafc" stroke="${color}" stroke-width="1.2" />
            <circle cx="0" cy="0" r="6.5" fill="#0f172a" stroke="#f59e0b" stroke-width="2.5" />
          </g>
        </svg>

        <div class="gauge-readout-center">
          <div class="gauge-z-main" style="color:${color};">
            Z: ${z >= 0 ? '+' : ''}${z.toFixed(2)}
          </div>
          <div class="gauge-z-status" style="color:${color};">${statusText}</div>
          <div class="gauge-z-pval">p-value: ${pValStr}</div>
        </div>
      </div>
    `;
  }
}
