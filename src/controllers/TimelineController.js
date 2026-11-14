/**
 * @file src/controllers/TimelineController.js
 * @description Controller orchestrating the bottom Historical Timeline dock (2000-2026),
 * transport buttons (Prev, Play/Pause, Next, 1x/2x/4x Speed), and Calendar modal sliders.
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */

import { TIMELINE_BOUNDS } from '../config/constants.js';

export class TimelineController {
  constructor(yearSliderId, weekSliderId, playBtnId, onTimeChange) {
    this.yearSlider = document.getElementById(yearSliderId);
    this.weekSlider = document.getElementById(weekSliderId);
    this.masterSlider = document.getElementById('slider-master-timeline');
    this.playBtn = document.getElementById(playBtnId);
    this.prevBtn = document.getElementById('btn-step-prev');
    this.nextBtn = document.getElementById('btn-step-next');
    this.speedBtn = document.getElementById('btn-speed-toggle');
    this.calMasterSlider = document.getElementById('slider-cal-master');
    this.calPlayBtn = document.getElementById('btn-cal-play');
    this.calPrevBtn = document.getElementById('btn-cal-prev');
    this.calNextBtn = document.getElementById('btn-cal-next');
    this.calSpeedBtn = document.getElementById('btn-cal-speed');
    this.onTimeChange = onTimeChange;

    this.currentYear = 2026;
    this.currentWeek = 36;
    this.speedMultiplier = 1;
    this.playTimer = null;
  }

  init() {
    if (this.masterSlider) {
      const totalWeeks =
        (TIMELINE_BOUNDS.MAX_YEAR - TIMELINE_BOUNDS.MIN_YEAR + 1) * 52 - 1;
      this.masterSlider.min = '0';
      this.masterSlider.max = String(totalWeeks);
      this.masterSlider.addEventListener('input', (ev) => {
        const idx = Number(ev.target.value);
        const y = TIMELINE_BOUNDS.MIN_YEAR + Math.floor(idx / 52);
        const w = (idx % 52) + 1;
        this.setYearWeek(y, w);
      });
    }

    if (this.yearSlider) {
      this.yearSlider.addEventListener('input', (ev) => {
        this.setYearWeek(Number(ev.target.value), this.currentWeek);
      });
    }

    if (this.weekSlider) {
      this.weekSlider.addEventListener('input', (ev) => {
        this.setYearWeek(this.currentYear, Number(ev.target.value));
      });
    }

    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlayback());
    }
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.stepWeeks(-1));
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.stepWeeks(1));
    }
    if (this.speedBtn) {
      this.speedBtn.addEventListener('click', () => {
        this.speedMultiplier =
          this.speedMultiplier === 1 ? 2 : this.speedMultiplier === 2 ? 4 : 1;
        this.speedBtn.textContent = `${this.speedMultiplier}x`;
        if (this.playTimer) { this.togglePlayback(); this.togglePlayback(); }
      });
    }
    if (this.calMasterSlider) {
      const totalWeeks = (TIMELINE_BOUNDS.MAX_YEAR - TIMELINE_BOUNDS.MIN_YEAR + 1) * 52 - 1;
      this.calMasterSlider.min = '0';
      this.calMasterSlider.max = String(totalWeeks);
      this.calMasterSlider.addEventListener('input', (ev) => {
        const idx = Number(ev.target.value);
        this.setYearWeek(TIMELINE_BOUNDS.MIN_YEAR + Math.floor(idx / 52), (idx % 52) + 1);
      });
    }
    if (this.calPlayBtn) this.calPlayBtn.addEventListener('click', () => this.togglePlayback());
    if (this.calPrevBtn) this.calPrevBtn.addEventListener('click', () => this.stepWeeks(-1));
    if (this.calNextBtn) this.calNextBtn.addEventListener('click', () => this.stepWeeks(1));
    if (this.calSpeedBtn) {
      this.calSpeedBtn.addEventListener('click', () => {
        if (this.speedBtn) this.speedBtn.click();
        this.calSpeedBtn.textContent = ${this.speedMultiplier}x;
      });
    }
  }

  stepWeeks(delta) {
    let idx =
      (this.currentYear - TIMELINE_BOUNDS.MIN_YEAR) * 52 +
      (this.currentWeek - 1) +
      delta;
    const maxIdx =
      (TIMELINE_BOUNDS.MAX_YEAR - TIMELINE_BOUNDS.MIN_YEAR + 1) * 52 - 1;
    if (idx < 0) idx = maxIdx;
    if (idx > maxIdx) idx = 0;
    const y = TIMELINE_BOUNDS.MIN_YEAR + Math.floor(idx / 52);
    const w = (idx % 52) + 1;
    this.setYearWeek(y, w);
  }

  setYearWeek(year, week) {
    this.currentYear = Math.max(
      TIMELINE_BOUNDS.MIN_YEAR,
      Math.min(TIMELINE_BOUNDS.MAX_YEAR, Number(year))
    );
    this.currentWeek = Math.max(
      1,
      Math.min(TIMELINE_BOUNDS.WEEKS_PER_YEAR, Number(week))
    );
    this._notify();
  }

  togglePlayback() {
    if (this.playTimer) {
      clearInterval(this.playTimer);
      this.playTimer = null;
      if (this.playBtn) this.playBtn.textContent = '▶'; if (this.calPlayBtn) this.calPlayBtn.textContent = '▶';
      return;
    }

    if (this.playBtn) this.playBtn.textContent = '⏸'; if (this.calPlayBtn) this.calPlayBtn.textContent = '⏸';
    this.playTimer = setInterval(() => {
      this.stepWeeks(1);
    }, Math.round(420 / this.speedMultiplier));
  }

  _notify() {
    if (typeof this.onTimeChange === 'function') {
      this.onTimeChange(this.currentYear, this.currentWeek);
    }
  }
}
