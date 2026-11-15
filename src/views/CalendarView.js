/**
 * @file src/views/CalendarView.js
 * @description Renders the interactive 52 Weeks x 27 Years (2000-2026) Phenological
 * Burning Activity Calendar heatmap with dynamic bilingual tooltips and cell click selection.
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */

import { i18n, getWeekPeriodLabel, MONTH_HEADER_CONFIG } from '../config/i18n.js';

const MONTH_END_WEEKS = new Set([4, 8, 13, 17, 22, 26, 30, 35, 39, 43, 48]);

export class CalendarView {
  constructor(containerId, tooltipId) {
    this.container = document.getElementById(containerId);
    this.tooltip = document.getElementById(tooltipId);
    this.onCellSelect = null;
  }

  /**
   * Registers callback invoked when a user clicks any (year, week) cell in the heatmap.
   * @param {Function} callback (year, week) => void
   */
  bindCellSelect(callback) {
    this.onCellSelect = callback;
  }

  /**
   * Renders the full 2000-2026 x 52-week climatological Z-Score matrix.
   * @param {Array<Array<object>>} matrix Precomputed calendar matrix from ClimatologyModel
   * @param {number} selectedYear Currently active year
   * @param {number} selectedWeek Currently active week
   */
  render(matrix, selectedYear, selectedWeek) {
    if (!this.container || !Array.isArray(matrix)) return;

    const fragment = document.createDocumentFragment();
    const table = document.createElement('div');
    table.className = 'calendar-matrix-grid';

    const headerRow = document.createElement('div');
    headerRow.className = 'calendar-month-header';

    const spacer = document.createElement('span');
    spacer.className = 'calendar-year-label';
    spacer.textContent = '';
    headerRow.appendChild(spacer);

    const monthStrip = document.createElement('div');
    monthStrip.className = 'calendar-month-strip';
    const currentLang = i18n.getLang();
    MONTH_HEADER_CONFIG.forEach((m) => {
      const mLabel = document.createElement('span');
      mLabel.className = 'calendar-month-label';
      mLabel.style.gridColumn = `span ${m.span}`;
      mLabel.textContent = currentLang === 'es' ? m.es : m.en;
      monthStrip.appendChild(mLabel);
    });
    headerRow.appendChild(monthStrip);
    table.appendChild(headerRow);

    matrix.forEach((yearRow) => {
      if (!yearRow.length) return;
      const rowYear = yearRow[0].year;
      const rowEl = document.createElement('div');
      rowEl.className =
        rowYear === selectedYear
          ? 'calendar-year-row active-year-row'
          : 'calendar-year-row';

      const yearLabel = document.createElement('span');
      yearLabel.className = 'calendar-year-label';
      yearLabel.textContent = String(rowYear);
      rowEl.appendChild(yearLabel);

      const cellsWrap = document.createElement('div');
      cellsWrap.className = 'calendar-weeks-strip';

      yearRow.forEach((cell) => {
        const cellEl = document.createElement('button');
        cellEl.type = 'button';
        const isSelected =
          cell.year === selectedYear && cell.week === selectedWeek;
        const isBenchmark = cell.year === 2020 && cell.week === 35;
        const isMonthEnd = MONTH_END_WEEKS.has(cell.week);

        cellEl.className = [
          'calendar-cell',
          isSelected ? 'selected-cell' : '',
          isBenchmark ? 'benchmark-cell' : '',
          isMonthEnd ? 'month-end-cell' : ''
        ]
          .filter(Boolean)
          .join(' ');

        cellEl.style.backgroundColor = cell.classification.colorHex;
        cellEl.dataset.year = String(cell.year);
        cellEl.dataset.week = String(cell.week);

        cellEl.addEventListener('mouseenter', (ev) =>
          this._showTooltip(ev, cell)
        );
        cellEl.addEventListener('mouseleave', () => this._hideTooltip());
        cellEl.addEventListener('click', () => {
          if (typeof this.onCellSelect === 'function') {
            this.onCellSelect(cell.year, cell.week);
          }
        });

        cellsWrap.appendChild(cellEl);
      });

      rowEl.appendChild(cellsWrap);
      table.appendChild(rowEl);
    });

    this.container.innerHTML = '';
    fragment.appendChild(table);
    this.container.appendChild(fragment);
  }

  _showTooltip(event, cell) {
    if (!this.tooltip) return;
    const currentLang = i18n.getLang();
    const monthText = getWeekPeriodLabel(cell.week, currentLang);
    const statusText = i18n.t(cell.classification.i18nKey);
    const label = i18n.t('tooltip.calendar_cell', {
      year: cell.year,
      week: cell.week,
      month: monthText,
      frp: cell.frpMw,
      z: `${cell.zScore >= 0 ? '+' : ''}${cell.zScore.toFixed(2)}`,
      status: statusText
    });
    this.tooltip.textContent = label;
    this.tooltip.style.display = 'block';
    this.tooltip.style.left = `${Math.min(window.innerWidth - 320, event.clientX + 12)}px`;
    this.tooltip.style.top = `${Math.max(12, event.clientY - 36)}px`;
  }

  _hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }
}
