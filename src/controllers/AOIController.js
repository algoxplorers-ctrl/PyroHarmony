/**
 * @file src/controllers/AOIController.js
 * @description Controller managing Biome Area of Interest (AOI) selection, bilingual
 * dropdown options rendering, and Ground Truth Benchmark quick-jump triggers.
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */

import { APP_METADATA, BIOME_CATALOG } from '../config/constants.js';
import { i18n } from '../config/i18n.js';

export class AOIController {
  constructor(selectElementId, benchmarkBtnId, onBiomeChange, onBenchmarkTrigger) {
    this.selectEl = document.getElementById(selectElementId);
    this.benchmarkBtn = document.getElementById(benchmarkBtnId);
    this.onBiomeChange = onBiomeChange;
    this.onBenchmarkTrigger = onBenchmarkTrigger;
    this.activeBiomeId = APP_METADATA.BENCHMARK_CASE.biomeId;
  }

  init() {
    this.populateBiomeOptions();
    if (this.selectEl) {
      this.selectEl.addEventListener('change', (ev) => {
        this.activeBiomeId = ev.target.value;
        if (typeof this.onBiomeChange === 'function') {
          this.onBiomeChange(this.activeBiomeId);
        }
      });
    }

    if (this.benchmarkBtn) {
      this.benchmarkBtn.addEventListener('click', () => {
        const bm = APP_METADATA.BENCHMARK_CASE;
        this.activeBiomeId = bm.biomeId;
        if (this.selectEl) this.selectEl.value = bm.biomeId;
        if (typeof this.onBenchmarkTrigger === 'function') {
          this.onBenchmarkTrigger(bm.biomeId, bm.year, bm.week);
        }
      });
    }
  }

  populateBiomeOptions() {
    if (!this.selectEl) return;
    const lang = i18n.getLang();
    const currentVal = this.activeBiomeId;

    this.selectEl.innerHTML = Object.values(BIOME_CATALOG)
      .map((b) => {
        const label = lang === 'es' ? b.nameEs : b.nameEn;
        const selected = b.id === currentVal ? 'selected' : '';
        return `<option value="${b.id}" ${selected}>${label}</option>`;
      })
      .join('');
  }

  setBiome(biomeId) {
    if (BIOME_CATALOG[biomeId]) {
      this.activeBiomeId = biomeId;
      if (this.selectEl) this.selectEl.value = biomeId;
    }
  }
}
