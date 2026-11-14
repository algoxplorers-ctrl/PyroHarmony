/**
 * @file src/views/TimelineView.js
 * @description Renders the bottom Historical Timeline dock (2000-2026) and Top HUD
 * satellite constellation badge. Pure View layer.
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */

import { TIMELINE_BOUNDS } from '../config/constants.js';
import { i18n } from '../config/i18n.js';

export class TimelineView {
  constructor(elements) {
    this.yearSlider = document.getElementById(elements.yearSliderId);
    this.weekSlider = document.getElementById(elements.weekSliderId);
    this.masterSlider = document.getElementById('slider-master-timeline');
    this.yearValueEl = document.getElementById(elements.yearValueId);
    this.weekValueEl = document.getElementById(elements.weekValueId);
    this.hudSatsEl = document.getElementById(elements.hudSatsId);
  }

  /**
   * Synchronizes bottom timeline dock readouts, master scrubber, and top constellation pill.
   * @param {object} snapshot Current spatiotemporal snapshot
   */
  render(snapshot) {
    if (!snapshot) return;
    const { year, week, activeSatellites } = snapshot;

    if (this.yearSlider && Number(this.yearSlider.value) !== year) {
      this.yearSlider.value = String(year);
    }
    if (this.weekSlider && Number(this.weekSlider.value) !== week) {
      this.weekSlider.value = String(week);
    }
    if (this.masterSlider) {
      const idx = (year - TIMELINE_BOUNDS.MIN_YEAR) * 52 + (week - 1);
      if (Number(this.masterSlider.value) !== idx) {
        this.masterSlider.value = String(idx);
      }
    }

    if (this.yearValueEl) {
      this.yearValueEl.textContent = String(year);
    }
    if (this.weekValueEl) {
      this.weekValueEl.textContent = `${week} / 52`;
    }

    if (this.hudSatsEl) {
      const count = activeSatellites.length;
      const key =
        count >= 4
          ? 'hud.sat_constellation_4'
          : count === 3
            ? 'hud.sat_constellation_3'
            : count === 2
              ? 'hud.sat_constellation_2'
              : 'hud.sat_constellation_1';
      this.hudSatsEl.textContent = `🛰️ ${i18n.t(key)}`;
    }
  }
}
