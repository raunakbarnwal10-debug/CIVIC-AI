/**
 * CIVIC AI - Reactive Local Storage State Management
 * Stores complaints, manages seed data, computes real-time statistics & KPIs.
 */

const STORAGE_KEY = 'civic_ai_complaints_data_v1';

const SEED_COMPLAINTS = [
  {
    id: "CIVIC-101",
    citizenName: "Aarav Sharma",
    location: "Near DAV Public School Gate, Ranchi",
    description: "There is a dangerous deep pothole right in front of the school gate. Two school buses scraped their bottom yesterday and it is a major hazard for children.",
    category: "Road",
    categoryName: "Road & Infrastructure",
    categoryIcon: "🚧",
    priority: "High",
    priorityScore: 92,
    department: "Municipal Corporation / Public Works Dept (PWD)",
    summary: "Dangerous deep pothole reported right outside school gate creating safety hazard.",
    status: "Pending",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hrs ago
    confidence: 96
  },
  {
    id: "CIVIC-102",
    citizenName: "Priya Nair",
    location: "Main Market, Sector 4, Indiranagar",
    description: "Garbage has not been collected for 4 days. Waste bins are overflowing and stray animals are scattering trash on the road creating bad sanitation.",
    category: "Sanitation",
    categoryName: "Sanitation & Waste Management",
    categoryIcon: "🧹",
    priority: "Medium",
    priorityScore: 65,
    department: "Sanitation & Public Health Dept.",
    summary: "Garbage overflow and uncollected waste in commercial market area.",
    status: "In Progress",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(), // 18 hrs ago
    confidence: 94
  },
  {
    id: "CIVIC-103",
    citizenName: "Rohan Verma",
    location: "Station Road Junction, Near Metro Pillar 42",
    description: "Streetlight not working on main junction since last weekend. Road gets completely dark at night.",
    category: "Electricity",
    categoryName: "Electricity & Power Grid",
    categoryIcon: "⚡",
    priority: "Medium",
    priorityScore: 58,
    department: "State Electricity Distribution Dept.",
    summary: "Streetlight pole non-functional causing low visibility on junction.",
    status: "Resolved",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    confidence: 91
  },
  {
    id: "CIVIC-104",
    citizenName: "Ananya Patel",
    location: "MG Road near City Hospital, Jaipur",
    description: "Main drinking water pipeline burst creating heavy water leakage and flooding the roadway. Clean water is wasting rapidly.",
    category: "Water",
    categoryName: "Water Supply & Sewerage",
    categoryIcon: "💧",
    priority: "High",
    priorityScore: 88,
    department: "City Jal Board / Water Supply Board",
    summary: "Major water supply pipeline burst causing road flooding near hospital.",
    status: "In Progress",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(), // 8 hrs ago
    confidence: 95
  },
  {
    id: "CIVIC-105",
    citizenName: "Vikram Sen",
    location: "Ward 12 Govt Primary School, Pune",
    description: "Classroom roof is leaking rainwater onto student benches and desks during monsoon.",
    category: "Education",
    categoryName: "Public Education & Schools",
    categoryIcon: "🏫",
    priority: "Medium",
    priorityScore: 68,
    department: "Dept. of School Education & Literacy",
    summary: "Classroom ceiling seepage and damaged school infrastructure.",
    status: "Pending",
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(), // 28 hrs ago
    confidence: 90
  },
  {
    id: "CIVIC-106",
    citizenName: "Sunita Roy",
    location: "Central Park Walkway East, Delhi",
    description: "A few pavement tiles are broken along the pedestrian footpath. Minor repair needed.",
    category: "Road",
    categoryName: "Road & Infrastructure",
    categoryIcon: "🚧",
    priority: "Low",
    priorityScore: 35,
    department: "Municipal Corporation / Public Works Dept (PWD)",
    summary: "Loose footpath tiles along park pedestrian walkway.",
    status: "Resolved",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
    confidence: 86
  },
  {
    id: "CIVIC-107",
    citizenName: "Karan Johar",
    location: "Civil Lines, Near Sub-Divisional Hospital",
    description: "Urgent! Live sparking electric cable fallen on footpath after heavy storm. Immediate accident risk!",
    category: "Electricity",
    categoryName: "Electricity & Power Grid",
    categoryIcon: "⚡",
    priority: "High",
    priorityScore: 98,
    department: "State Electricity Distribution Dept.",
    summary: "Live sparking electrical wire on pedestrian sidewalk posing electrocution danger.",
    status: "In Progress",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hrs ago
    confidence: 99
  }
];

const CivicStore = {
  /**
   * Get all complaints from localStorage or initialize with seed data
   */
  getComplaints() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.saveComplaints(SEED_COMPLAINTS);
        return [...SEED_COMPLAINTS];
      }
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to read from localStorage, using seed data:", e);
      return [...SEED_COMPLAINTS];
    }
  },

  /**
   * Save complaints array to localStorage
   */
  saveComplaints(complaints) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  },

  /**
   * Add new complaint to the top of list
   */
  addComplaint(complaintData) {
    const complaints = this.getComplaints();
    const nextNum = complaints.length + 101;
    const newId = `CIVIC-${String(nextNum).padStart(3, '0')}`;

    const newEntry = {
      id: newId,
      citizenName: complaintData.citizenName || "Anonymous Citizen",
      location: complaintData.location || "City Limits",
      description: complaintData.description,
      category: complaintData.categoryKey || complaintData.category || "Road",
      categoryName: complaintData.categoryName || "General Infrastructure",
      categoryIcon: complaintData.categoryIcon || "🏛️",
      priority: complaintData.priority || "Medium",
      priorityScore: complaintData.priorityScore || 50,
      department: complaintData.department || "Municipal Corporation",
      summary: complaintData.summary || complaintData.description.substring(0, 80) + "...",
      status: "Pending",
      createdAt: new Date().toISOString(),
      confidence: complaintData.confidence || 95
    };

    complaints.unshift(newEntry);
    this.saveComplaints(complaints);
    return newEntry;
  },

  /**
   * Update the status of an existing complaint (Pending, In Progress, Resolved)
   */
  updateStatus(id, newStatus) {
    const complaints = this.getComplaints();
    const index = complaints.findIndex(c => c.id === id);
    if (index !== -1) {
      complaints[index].status = newStatus;
      complaints[index].updatedAt = new Date().toISOString();
      this.saveComplaints(complaints);
      return complaints[index];
    }
    return null;
  },

  /**
   * Delete a complaint
   */
  deleteComplaint(id) {
    let complaints = this.getComplaints();
    complaints = complaints.filter(c => c.id !== id);
    this.saveComplaints(complaints);
    return complaints;
  },

  /**
   * Reset store back to initial seed data
   */
  resetToDefaults() {
    this.saveComplaints(SEED_COMPLAINTS);
    return [...SEED_COMPLAINTS];
  },

  /**
   * Get calculated statistics & metric KPIs
   */
  getStats() {
    const complaints = this.getComplaints();

    const total = complaints.length;
    const highPriority = complaints.filter(c => c.priority === 'High').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const pending = complaints.filter(c => c.status === 'Pending').length;

    // Category breakdown counts
    const categoryCounts = {
      Road: 0,
      Water: 0,
      Sanitation: 0,
      Electricity: 0,
      Education: 0,
      Other: 0
    };

    // Priority breakdown counts
    const priorityCounts = {
      High: 0,
      Medium: 0,
      Low: 0
    };

    complaints.forEach(c => {
      const cat = c.category || 'Other';
      if (categoryCounts.hasOwnProperty(cat)) {
        categoryCounts[cat]++;
      } else {
        categoryCounts.Other++;
      }

      const prio = c.priority || 'Medium';
      if (priorityCounts.hasOwnProperty(prio)) {
        priorityCounts[prio]++;
      }
    });

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      total,
      highPriority,
      inProgress,
      resolved,
      pending,
      resolutionRate,
      categoryCounts,
      priorityCounts
    };
  },

  /**
   * Export all complaints as CSV
   */
  exportToCSV() {
    const complaints = this.getComplaints();
    if (!complaints.length) return "";

    const headers = ["ID", "Citizen Name", "Location", "Category", "Priority", "Department", "Status", "Created At", "Summary"];
    const rows = complaints.map(c => [
      `"${c.id}"`,
      `"${(c.citizenName || '').replace(/"/g, '""')}"`,
      `"${(c.location || '').replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${c.priority}"`,
      `"${(c.department || '').replace(/"/g, '""')}"`,
      `"${c.status}"`,
      `"${new Date(c.createdAt).toLocaleString()}"`,
      `"${(c.summary || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CivicStore;
}
