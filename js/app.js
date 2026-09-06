/**
 * CIVIC AI - Main Application Controller
 * Handles SPA navigation, form submission with simulated AI scanning,
 * reactive dashboard updates, status transitions, search, and demo presets.
 */

const CivicApp = {
  currentView: 'landing',
  currentFilter: 'all',
  searchQuery: '',

  /**
   * Initialize application on DOM ready
   */
  init() {
    console.log("🏛️ Civic AI Platform Initializing...");
    
    // Set up initial state and render dashboard
    this.refreshDashboard();
    this.updateLandingStats();

    // Listen to hash changes for direct URL bookmarking
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'landing';
      if (['landing', 'report', 'dashboard', 'about'].includes(hash)) {
        this.navigateTo(hash, false);
      }
    });

    // Check initial hash
    if (window.location.hash) {
      const initialView = window.location.hash.replace('#', '');
      if (['landing', 'report', 'dashboard', 'about'].includes(initialView)) {
        this.navigateTo(initialView, false);
      }
    }
  },

  /**
   * SPA View Navigator
   */
  navigateTo(viewName, updateHash = true) {
    this.currentView = viewName;

    // 1. Update View Elements
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // 2. Update Navbar Link Highlights
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.view === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // 3. Close mobile menu if open
    const navLinks = document.getElementById('nav-links');
    if (navLinks) {
      navLinks.classList.remove('mobile-open');
    }

    // 4. View specific refreshes
    if (viewName === 'dashboard') {
      this.refreshDashboard();
    } else if (viewName === 'landing') {
      this.updateLandingStats();
    }

    if (updateHash) {
      window.location.hash = viewName;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Toggle Mobile Hamburger Menu
   */
  toggleMobileMenu() {
    const navLinks = document.getElementById('nav-links');
    if (navLinks) {
      navLinks.classList.toggle('mobile-open');
    }
  },

  /**
   * Quick Fill Demo Presets for Hackathon Judges
   */
  fillDemoPreset(presetKey) {
    const nameInput = document.getElementById('citizen-name');
    const locInput = document.getElementById('citizen-location');
    const descInput = document.getElementById('complaint-desc');
    const catSelect = document.getElementById('category-select');

    if (!nameInput || !locInput || !descInput) return;

    if (presetKey === 'school_pothole') {
      nameInput.value = "Aditya Kumar";
      locInput.value = "Near City High School Gate";
      descInput.value = "There is a dangerous pothole near our school.";
      if (catSelect) catSelect.value = "Auto";
      this.showToast("Filled demo preset: School Danger Pothole", "info");
    } else if (presetKey === 'market_garbage') {
      nameInput.value = "Priya Nair";
      locInput.value = "Sector 4 Main Market";
      descInput.value = "Garbage has not been collected for 3 days and dustbins are overflowing creating a dirty sanitation hazard.";
      if (catSelect) catSelect.value = "Sanitation";
      this.showToast("Filled demo preset: Market Sanitation", "info");
    } else if (presetKey === 'water_leak') {
      nameInput.value = "Ananya Patel";
      locInput.value = "MG Road near City Hospital";
      descInput.value = "Major drinking water pipeline burst causing heavy water leakage and flooding the roadway.";
      if (catSelect) catSelect.value = "Water";
      this.showToast("Filled demo preset: Water Pipeline Leak", "info");
    } else if (presetKey === 'dark_street') {
      nameInput.value = "Rohan Verma";
      locInput.value = "Station Road Junction";
      descInput.value = "Streetlight not working on main junction, electricity pole is dark at night.";
      if (catSelect) catSelect.value = "Electricity";
      this.showToast("Filled demo preset: Streetlight Outage", "info");
    }
  },

  /**
   * 1-Click Hackathon Quick Demo Flow
   */
  runQuickDemo() {
    this.navigateTo('report');
    this.fillDemoPreset('school_pothole');
    
    // Auto trigger submission after a brief moment for judge presentation
    setTimeout(() => {
      const submitBtn = document.getElementById('btn-submit-complaint');
      if (submitBtn) {
        submitBtn.click();
      }
    }, 400);
  },

  /**
   * Handle Citizen Form Submission with simulated AI delay
   */
  handleFormSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('citizen-name').value.trim();
    const location = document.getElementById('citizen-location').value.trim();
    const description = document.getElementById('complaint-desc').value.trim();
    const categorySelect = document.getElementById('category-select').value;

    if (!description) {
      this.showToast("Please provide a problem description.", "warning");
      return;
    }

    // UI Loading State
    const form = document.getElementById('complaint-form');
    const loadingOverlay = document.getElementById('ai-loading-overlay');
    const resultCard = document.getElementById('ai-result-card');
    const submitBtn = document.getElementById('btn-submit-complaint');

    if (submitBtn) submitBtn.disabled = true;
    if (resultCard) resultCard.classList.remove('active');
    if (loadingOverlay) loadingOverlay.classList.add('active');

    // Simulate AI inference delay (~1.1 seconds)
    setTimeout(() => {
      // 1. Run local AI analysis
      const aiResult = CivicAIEngine.analyzeComplaint(description, categorySelect);

      // 2. Persist to CivicStore
      const newComplaint = CivicStore.addComplaint({
        citizenName: name,
        location: location,
        description: description,
        categoryKey: aiResult.categoryKey,
        categoryName: aiResult.categoryName,
        categoryIcon: aiResult.categoryIcon,
        priority: aiResult.priority,
        priorityScore: aiResult.priorityScore,
        department: aiResult.department,
        summary: aiResult.summary,
        confidence: aiResult.confidence
      });

      // 3. Populate AI Result Card
      document.getElementById('result-category').innerHTML = `${aiResult.categoryIcon} ${aiResult.categoryName}`;
      
      const prioBadge = document.getElementById('result-priority');
      const prioClass = aiResult.priority.toLowerCase();
      prioBadge.innerHTML = `<span class="badge-priority ${prioClass}">🔴 ${aiResult.priority.toUpperCase()} (${aiResult.priorityScore}%)</span>`;

      document.getElementById('result-department').textContent = `🏛️ ${aiResult.department}`;
      document.getElementById('result-summary').textContent = `"${aiResult.summary}"`;
      document.getElementById('result-status-badge').textContent = `⏳ Status: Pending (Ticket: ${newComplaint.id})`;

      // 4. Reveal Results Card
      if (loadingOverlay) loadingOverlay.classList.remove('active');
      if (resultCard) resultCard.classList.add('active');
      if (submitBtn) submitBtn.disabled = false;

      // 5. Update stats in background
      this.updateLandingStats();
      this.showToast(`AI classified complaint #${newComplaint.id} as ${aiResult.priority} Priority`, "success");

      // Smooth scroll to result card
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1100);
  },

  /**
   * Reset the submission form
   */
  resetForm() {
    const resultCard = document.getElementById('ai-result-card');
    if (resultCard) resultCard.classList.remove('active');
    
    document.getElementById('complaint-desc').value = "";
    document.getElementById('citizen-location').value = "";
    document.getElementById('complaint-desc').focus();
    this.showToast("Form ready for next complaint", "info");
  },

  /**
   * Refresh all Dashboard components (KPIs, Charts, Table)
   */
  refreshDashboard() {
    const stats = CivicStore.getStats();

    // 1. Update KPI Card numbers
    const kpiTotal = document.getElementById('kpi-total');
    const kpiHigh = document.getElementById('kpi-high');
    const kpiProgress = document.getElementById('kpi-progress');
    const kpiResolved = document.getElementById('kpi-resolved');

    if (kpiTotal) kpiTotal.textContent = stats.total;
    if (kpiHigh) kpiHigh.textContent = stats.highPriority;
    if (kpiProgress) kpiProgress.textContent = stats.inProgress;
    if (kpiResolved) kpiResolved.textContent = stats.resolved;

    // 2. Render Charts
    if (typeof CivicCharts !== 'undefined') {
      CivicCharts.updateCharts(stats);
    }

    // 3. Render Table
    this.renderComplaintsTable();
  },

  /**
   * Update landing page dynamic numbers
   */
  updateLandingStats() {
    const stats = CivicStore.getStats();
    const landingTotal = document.getElementById('landing-stat-total');
    if (landingTotal) {
      landingTotal.textContent = `${stats.total}`;
    }
  },

  /**
   * Filter handling
   */
  setFilter(filterType) {
    this.currentFilter = filterType;

    // Update filter button styles
    document.querySelectorAll('.filter-chip-btn').forEach(btn => {
      if (btn.dataset.filter === filterType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.renderComplaintsTable();
  },

  /**
   * Search handling
   */
  handleSearch(query) {
    this.searchQuery = (query || '').toLowerCase().trim();
    this.renderComplaintsTable();
  },

  /**
   * Render Complaints Data Table with filters and search
   */
  renderComplaintsTable() {
    const tbody = document.getElementById('complaints-table-body');
    if (!tbody) return;

    let complaints = CivicStore.getComplaints();

    // 1. Apply Filter
    if (this.currentFilter === 'high') {
      complaints = complaints.filter(c => c.priority === 'High');
    } else if (this.currentFilter === 'pending') {
      complaints = complaints.filter(c => c.status === 'Pending');
    } else if (this.currentFilter === 'in_progress') {
      complaints = complaints.filter(c => c.status === 'In Progress');
    } else if (this.currentFilter === 'resolved') {
      complaints = complaints.filter(c => c.status === 'Resolved');
    }

    // 2. Apply Search
    if (this.searchQuery) {
      complaints = complaints.filter(c => {
        const text = `${c.id} ${c.citizenName} ${c.location} ${c.description} ${c.summary} ${c.category} ${c.department}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    // 3. Empty State Check
    if (complaints.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="table-empty-state">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
            <div style="font-weight: 700; margin-bottom: 0.25rem;">No matching complaints found</div>
            <div style="font-size: 0.85rem;">Try adjusting your search or filter criteria.</div>
          </td>
        </tr>
      `;
      return;
    }

    // 4. Render Table Rows
    let html = '';
    complaints.forEach(c => {
      const prioClass = (c.priority || 'Medium').toLowerCase();
      const statusClass = c.status === 'In Progress' ? 'progress' : (c.status || 'Pending').toLowerCase();
      const icon = c.categoryIcon || '🏛️';

      html += `
        <tr id="row-${c.id}">
          <td class="table-id-cell">#${c.id}</td>
          <td class="table-complaint-cell">
            <div class="table-complaint-title" title="${c.description}">${c.description}</div>
            <div class="table-complaint-sub">👤 ${c.citizenName || 'Citizen'} • ${this.formatTimeAgo(c.createdAt)}</div>
          </td>
          <td>📍 ${c.location || 'Local Area'}</td>
          <td>
            <span style="font-weight: 600;">${icon} ${c.category || 'General'}</span>
          </td>
          <td>
            <span class="badge-priority ${prioClass}">
              ${c.priority === 'High' ? '🔴' : (c.priority === 'Medium' ? '🟡' : '🟢')} ${c.priority}
            </span>
          </td>
          <td style="font-size: 0.82rem; color: var(--text-muted);">
            ${c.department || 'Municipal Corp.'}
          </td>
          <td>
            <select class="badge-status-select ${statusClass}" onchange="CivicApp.handleStatusChange('${c.id}', this.value)" aria-label="Update Status">
              <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
              <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>⚙️ In Progress</option>
              <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>✅ Resolved</option>
            </select>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  /**
   * Handle admin status transition
   */
  handleStatusChange(id, newStatus) {
    const updated = CivicStore.updateStatus(id, newStatus);
    if (updated) {
      this.refreshDashboard();
      this.showToast(`Updated complaint #${id} to "${newStatus}"`, "success");
    }
  },

  /**
   * Reset store back to initial seed data
   */
  resetToSeedData() {
    if (confirm("Reset complaint dataset to default demo records?")) {
      CivicStore.resetToDefaults();
      this.refreshDashboard();
      this.updateLandingStats();
      this.showToast("Demo complaints data restored!", "info");
    }
  },

  /**
   * Export dataset as CSV
   */
  exportDataCSV() {
    const csvContent = CivicStore.exportToCSV();
    if (!csvContent) {
      this.showToast("No data to export", "warning");
      return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `civic_ai_complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast("Complaints CSV exported successfully!", "success");
  },

  /**
   * Display toast notification
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  /**
   * Helper: relative time formatter
   */
  formatTimeAgo(isoString) {
    if (!isoString) return 'recently';
    const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
};

// Bootstrap application once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  CivicApp.init();
});
