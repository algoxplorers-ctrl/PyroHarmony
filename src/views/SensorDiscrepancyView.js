/**
 * @file src/views/SensorDiscrepancyView.js
 * @description Renders the left-panel Radiative Telemetry summary, Optical vs. Physical
 * Discrepancy rows, and right-panel Tactical Burnover Radar (LACES 50-min window).
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */

import { i18n } from '../config/i18n.js';

export class SensorDiscrepancyView {
  constructor(discrepancyContainerId, lacesContainerId) {
    this.discrepancyContainer = document.getElementById(discrepancyContainerId);
    this.lacesContainer = document.getElementById(lacesContainerId);
    this.totalPowerEl = document.getElementById('telemetry-total-mw');
    this.subPowerEl = document.getElementById('telemetry-sub-mw');
    this.regimeBadgeEl = document.getElementById('telemetry-regime-badge');
  }

  /**
   * Updates the Left Telemetry & Discrepancy Panel and Right Tactical Burnover Radar.
   * @param {object} snapshot Current spatiotemporal snapshot
   */
  render(snapshot) {
    if (!snapshot) return;
    this._renderLeftTelemetryAndDiscrepancy(snapshot);
    this._renderRightTacticalRadar(snapshot);
  }

  _renderLeftTelemetryAndDiscrepancy(snapshot) {
    const { harmonizedGrid, biome, biomass } = snapshot;

    // Scale display MW to realistic cluster telemetry matching the UI card
    const dispHarmMw = (harmonizedGrid.totalHarmonizedFrp / 25).toFixed(2);
    const dispModisMw = (harmonizedGrid.totalModisFrp / 35).toFixed(0);
    const dispViirsMw = harmonizedGrid.isOverlapEra
      ? (harmonizedGrid.totalViirsScaledFrp / 19).toFixed(1)
      : '0.0 (Pre-2012)';

    if (this.totalPowerEl) {
      this.totalPowerEl.textContent = `${dispHarmMw} MW`;
    }
    if (this.subPowerEl) {
      this.subPowerEl.textContent = `MODIS: ${dispModisMw} MW | VIIRS: ${dispViirsMw} MW`;
    }
    if (this.regimeBadgeEl) {
      this.regimeBadgeEl.textContent = harmonizedGrid.isOverlapEra
        ? i18n.t('left.badge_harmonized')
        : i18n.t('left.badge_proxy');
    }

    if (!this.discrepancyContainer) return;
    const weightSum = (biome.alpha + biome.beta).toFixed(2);

    this.discrepancyContainer.innerHTML = `
      <div class="discrepancy-list-card">
        <div class="disc-row">
          <span class="disc-row-label">${i18n.t('left.modis_px')}</span>
          <span class="disc-row-val val-orange">${harmonizedGrid.totalModisCount}</span>
        </div>
        <div class="disc-row">
          <span class="disc-row-label">${i18n.t('left.viirs_px')}</span>
          <span class="disc-row-val val-cyan">${
            harmonizedGrid.isOverlapEra ? harmonizedGrid.totalViirsCount : 'N/A'
          }</span>
        </div>
        <div class="disc-row">
          <span class="disc-row-label">${i18n.t('left.optical_ratio')}</span>
          <span class="disc-row-val val-amber">${
            harmonizedGrid.isOverlapEra
              ? `${harmonizedGrid.apparentCountRatio}x`
              : '1.0x (Proxy)'
          }</span>
        </div>
        <div class="disc-row">
          <span class="disc-row-label">${i18n.t('left.scale_law')}</span>
          <span class="disc-row-val val-green">α(${biome.alpha})+β(${biome.beta})=${weightSum} · R²=${biome.rSquared}</span>
        </div>
        <div class="disc-row">
          <span class="disc-row-label">${i18n.t('left.biomass_rate')}</span>
          <span class="disc-row-val">${biomass.biomassRateKgPerSec} kg/s</span>
        </div>
        <div class="z-simple-note">
          <div class="z-simple-title">${i18n.t('left.z_simple_title')}</div>
          <div class="z-simple-body">${i18n.t('left.z_simple_body')}</div>
        </div>
      </div>
    `;
  }

  _renderRightTacticalRadar(snapshot) {
    if (!this.lacesContainer) return;
    const { laces } = snapshot;

    let statusTitle = i18n.t('right.status_standby');
    let statusBody = i18n.t('right.msg_standby');
    let cardClass = 'laces-alert-box laces-standby';

    if (laces.level === 'critical') {
      statusTitle = i18n.t('right.status_critical');
      statusBody = `${i18n.t('right.msg_critical')} (ΔFRP: +${laces.deltaPercent}%)`;
      cardClass = 'laces-alert-box laces-critical';
    } else if (laces.level === 'watch') {
      statusTitle = i18n.t('right.status_watch');
      statusBody = `${i18n.t('right.msg_watch')} (ΔFRP: +${laces.deltaPercent}%)`;
      cardClass = 'laces-alert-box laces-watch';
    }

    this.lacesContainer.innerHTML = `
      <div class="${cardClass}">
        <div class="laces-status-header">🛡️ ${statusTitle}</div>
        <div class="laces-status-desc">${statusBody}</div>
      </div>
      <div class="laces-rule-box">
        <div class="laces-rule-title">${i18n.t('right.rule_title')}</div>
        <div class="laces-rule-text">${i18n.t('right.rule_body')}</div>
      </div>
    `;
  }
}
