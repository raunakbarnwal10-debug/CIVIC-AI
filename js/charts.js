/**
 * CIVIC AI - Interactive Visual Analytics Charts
 * Lightweight, zero-dependency SVG & Canvas charts with animations and interactive tooltips.
 */

const CivicCharts = {
  categoryColors: {
    Road: '#3b82f6',        // Blue
    Water: '#06b6d4',       // Cyan
    Sanitation: '#10b981',  // Emerald
    Electricity: '#f59e0b', // Amber
    Education: '#8b5cf6',   // Purple
    Other: '#64748b'        // Slate
  },

  priorityColors: {
    High: '#ef4444',   // Red
    Medium: '#f59e0b', // Amber
    Low: '#10b981'     // Emerald
  },

  /**
   * Render Category Distribution Bar Chart into container
   */
  renderCategoryBarChart(containerId, categoryCounts) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = [
      { key: 'Road', label: 'Road', count: categoryCounts.Road || 0, icon: '🚧', color: this.categoryColors.Road },
      { key: 'Water', label: 'Water', count: categoryCounts.Water || 0, icon: '💧', color: this.categoryColors.Water },
      { key: 'Sanitation', label: 'Sanitation', count: categoryCounts.Sanitation || 0, icon: '🧹', color: this.categoryColors.Sanitation },
      { key: 'Electricity', label: 'Electricity', count: categoryCounts.Electricity || 0, icon: '⚡', color: this.categoryColors.Electricity },
      { key: 'Education', label: 'Education', count: categoryCounts.Education || 0, icon: '🏫', color: this.categoryColors.Education }
    ];

    const maxCount = Math.max(1, ...data.map(d => d.count));
    const totalCount = data.reduce((acc, d) => acc + d.count, 0) || 1;

    let html = `
      <div class="chart-bars-container">
    `;

    data.forEach(item => {
      const percentage = Math.round((item.count / totalCount) * 100);
      const barWidth = Math.max(4, Math.round((item.count / maxCount) * 100));

      html += `
        <div class="bar-row" data-category="${item.key}" title="${item.label}: ${item.count} complaints (${percentage}%)">
          <div class="bar-label-group">
            <span class="bar-icon">${item.icon}</span>
            <span class="bar-name">${item.label}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${barWidth}%; background: linear-gradient(90deg, ${item.color}cc, ${item.color});">
              <span class="bar-inner-text">${item.count > 0 ? item.count : ''}</span>
            </div>
          </div>
          <div class="bar-stats">
            <span class="bar-count-badge">${item.count}</span>
            <span class="bar-pct">${percentage}%</span>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  },

  /**
   * Render Priority Donut / Segment Chart
   */
  renderPriorityDonutChart(containerId, priorityCounts) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const high = priorityCounts.High || 0;
    const med = priorityCounts.Medium || 0;
    const low = priorityCounts.Low || 0;
    const total = high + med + low;

    if (total === 0) {
      container.innerHTML = `<div class="chart-empty">No complaint data recorded yet</div>`;
      return;
    }

    const highPct = Math.round((high / total) * 100);
    const medPct = Math.round((med / total) * 100);
    const lowPct = 100 - highPct - medPct;

    // SVG Circular Donut calculations
    const radius = 64;
    const circumference = 2 * Math.PI * radius; // ~402.12

    const highOffset = circumference * (1 - (high / total));
    const medOffset = circumference * (1 - (med / total));
    const lowOffset = circumference * (1 - (low / total));

    const highDash = (high / total) * circumference;
    const medDash = (med / total) * circumference;
    const lowDash = (low / total) * circumference;

    const highRot = -90;
    const medRot = -90 + (high / total) * 360;
    const lowRot = medRot + (med / total) * 360;

    let html = `
      <div class="donut-chart-wrapper">
        <div class="donut-visual">
          <svg viewBox="0 0 160 160" width="140" height="140" class="donut-svg">
            <!-- Background circle -->
            <circle cx="80" cy="80" r="${radius}" fill="none" stroke="#e2e8f0" stroke-width="20" />
            
            <!-- Low Segment -->
            ${low > 0 ? `
              <circle cx="80" cy="80" r="${radius}" fill="none" stroke="${this.priorityColors.Low}" 
                stroke-width="20" stroke-dasharray="${lowDash} ${circumference - lowDash}"
                transform="rotate(${lowRot} 80 80)" class="donut-segment" />
            ` : ''}

            <!-- Medium Segment -->
            ${med > 0 ? `
              <circle cx="80" cy="80" r="${radius}" fill="none" stroke="${this.priorityColors.Medium}" 
                stroke-width="20" stroke-dasharray="${medDash} ${circumference - medDash}"
                transform="rotate(${medRot} 80 80)" class="donut-segment" />
            ` : ''}

            <!-- High Segment -->
            ${high > 0 ? `
              <circle cx="80" cy="80" r="${radius}" fill="none" stroke="${this.priorityColors.High}" 
                stroke-width="20" stroke-dasharray="${highDash} ${circumference - highDash}"
                transform="rotate(${highRot} 80 80)" class="donut-segment" />
            ` : ''}
          </svg>
          <div class="donut-center-label">
            <span class="donut-center-val">${total}</span>
            <span class="donut-center-sub">Total</span>
          </div>
        </div>

        <div class="donut-legend">
          <div class="legend-item high">
            <span class="legend-dot" style="background: ${this.priorityColors.High};"></span>
            <span class="legend-text">High Priority</span>
            <span class="legend-badge high">${high} (${highPct}%)</span>
          </div>
          <div class="legend-item med">
            <span class="legend-dot" style="background: ${this.priorityColors.Medium};"></span>
            <span class="legend-text">Medium Priority</span>
            <span class="legend-badge med">${med} (${medPct}%)</span>
          </div>
          <div class="legend-item low">
            <span class="legend-dot" style="background: ${this.priorityColors.Low};"></span>
            <span class="legend-text">Low Priority</span>
            <span class="legend-badge low">${low} (${lowPct}%)</span>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  /**
   * Refresh all dashboard charts
   */
  updateCharts(stats) {
    this.renderCategoryBarChart('category-chart-container', stats.categoryCounts);
    this.renderPriorityDonutChart('priority-chart-container', stats.priorityCounts);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CivicCharts;
}
