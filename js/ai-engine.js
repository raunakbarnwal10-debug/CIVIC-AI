/**
 * CIVIC AI - Local Intelligent Heuristic & NLP Analysis Engine
 * Zero paid API key required. High-speed client-side rule-based analysis
 * tailored for Digital Public Infrastructure & Governance hackathons.
 */

const CivicAIEngine = {
  // Knowledge Base & Keyword Dictionaries
  taxonomy: {
    Road: {
      name: "Road & Infrastructure",
      department: "Municipal Corporation / Public Works Dept (PWD)",
      keywords: ["pothole", "potholes", "road", "roads", "bridge", "footpath", "pavement", "tarmac", "asphalt", "divider", "crater", "speed breaker", "highway", "traffic light", "manhole"],
      icon: "🚧",
      baseTime: "48 hours"
    },
    Sanitation: {
      name: "Sanitation & Waste Management",
      department: "Sanitation & Public Health Dept.",
      keywords: ["garbage", "waste", "dustbin", "dirty", "sanitation", "trash", "dump", "sewage", "debris", "litter", "overflowing", "smell", "foul", "drain", "stench"],
      icon: "🧹",
      baseTime: "24 hours"
    },
    Water: {
      name: "Water Supply & Sewerage",
      department: "City Jal Board / Water Supply Board",
      keywords: ["water", "leakage", "pipeline", "drinking water", "tap", "pipe", "supply", "contamination", "flood", "waterlogged", "drainage", "burst", "dirty water", "no water"],
      icon: "💧",
      baseTime: "36 hours"
    },
    Electricity: {
      name: "Electricity & Power Grid",
      department: "State Electricity Distribution Dept.",
      keywords: ["streetlight", "electricity", "pole", "light", "lights", "blackout", "transformer", "power cut", "dark", "live wire", "lamp post", "spark", "cable", "wiring"],
      icon: "⚡",
      baseTime: "24 hours"
    },
    Education: {
      name: "Public Education & Schools",
      department: "Dept. of School Education & Literacy",
      keywords: ["school", "classroom", "college", "campus", "student", "students", "teacher", "playground", "blackboard", "desk", "mid-day meal", "institution"],
      icon: "🏫",
      baseTime: "72 hours"
    }
  },

  highPriorityKeywords: [
    "danger", "dangerous", "accident", "accidents", "school", "hospital", 
    "urgent", "urgently", "collapse", "live wire", "electrocution", "critical", 
    "emergency", "injury", "injured", "child", "children", "risk", "severe", 
    "fatal", "deep crater", "sparking", "burst pipeline", "flooding", "hazard"
  ],

  lowPriorityKeywords: [
    "minor", "aesthetic", "small", "paint", "request", "suggestion", 
    "inquiry", "cosmetic", "slowly", "informational"
  ],

  /**
   * Analyze citizen complaint text and extract structured governance metadata
   * @param {string} text - Raw citizen complaint description
   * @param {string} userSelectedCategory - Optional category explicitly picked by citizen
   * @returns {Object} Structured AI analysis result
   */
  analyzeComplaint(text, userSelectedCategory = "") {
    const rawText = (text || "").trim();
    const cleanText = rawText.toLowerCase();
    const words = cleanText.match(/\b[a-z0-9-]+\b/g) || [];

    // 1. Detect Category Scores
    const categoryScores = {
      Road: 0,
      Sanitation: 0,
      Water: 0,
      Electricity: 0,
      Education: 0
    };

    const matchedKeywords = [];

    for (const [catKey, catData] of Object.entries(this.taxonomy)) {
      for (const kw of catData.keywords) {
        if (cleanText.includes(kw)) {
          categoryScores[catKey] += (kw.split(" ").length * 2); // longer phrases have higher weight
          matchedKeywords.push(kw);
        }
      }
    }

    // Determine Best Category
    let detectedCategory = "Other";
    let maxScore = 0;

    for (const [catKey, score] of Object.entries(categoryScores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedCategory = catKey;
      }
    }

    // Honor user selected category if valid and high score is low
    if (userSelectedCategory && userSelectedCategory !== "Auto" && this.taxonomy[userSelectedCategory]) {
      if (maxScore === 0 || userSelectedCategory === detectedCategory) {
        detectedCategory = userSelectedCategory;
      }
    }

    // Default metadata if category is Other
    const categoryMeta = this.taxonomy[detectedCategory] || {
      name: "General Public Administration",
      department: "Local Administration / Grievance Redressal Cell",
      icon: "🏛️",
      baseTime: "5-7 business days"
    };

    // 2. Priority Detection Logic
    let priority = "Medium";
    let priorityScore = 50; // 0 to 100
    let priorityReasons = [];

    // Check High Priority Triggers
    const highMatches = this.highPriorityKeywords.filter(kw => cleanText.includes(kw));
    const lowMatches = this.lowPriorityKeywords.filter(kw => cleanText.includes(kw));

    if (highMatches.length > 0) {
      priority = "High";
      priorityScore = Math.min(98, 75 + (highMatches.length * 8));
      priorityReasons.push(`Contains high-urgency/safety indicators: "${highMatches.slice(0, 3).join(', ')}"`);
    } else if (lowMatches.length > 0 && maxScore <= 2) {
      priority = "Low";
      priorityScore = 25;
      priorityReasons.push(`Contains routine or cosmetic indicators`);
    } else {
      priority = "Medium";
      priorityScore = 55;
      priorityReasons.push("Standard civic infrastructure maintenance requirement");
    }

    // 3. AI Executive Summary Generation
    const summary = this.generateSummary(rawText, detectedCategory, priority, highMatches);

    // 4. Calculate Confidence
    let confidence = 85;
    if (matchedKeywords.length > 0) {
      confidence = Math.min(99, 88 + (matchedKeywords.length * 3));
    } else if (rawText.length > 20) {
      confidence = 78;
    } else {
      confidence = 65;
    }

    // 5. Estimated Resolution Time
    let estimatedResolution = categoryMeta.baseTime || "48 hours";
    if (priority === "High") {
      estimatedResolution = "Within 24 hours (Expedited)";
    } else if (priority === "Low") {
      estimatedResolution = "5 - 7 business days";
    }

    return {
      categoryKey: detectedCategory,
      categoryName: categoryMeta.name,
      categoryIcon: categoryMeta.icon,
      department: categoryMeta.department,
      priority: priority,
      priorityScore: priorityScore,
      priorityReasons: priorityReasons,
      summary: summary,
      matchedKeywords: [...new Set(matchedKeywords)],
      confidence: confidence,
      estimatedResolution: estimatedResolution,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Generates a clean 1-sentence executive summary suitable for administrators
   */
  generateSummary(text, category, priority, highMatches) {
    if (!text) return "Civic infrastructure grievance reported for department review.";

    const firstSentence = text.split(/[.!?\n]/)[0].trim();
    
    // Customize concise summary for common demo scenarios
    if (text.toLowerCase().includes("pothole") && text.toLowerCase().includes("school")) {
      return "Critical road damage and hazardous pothole reported in high-density school zone.";
    }
    if (text.toLowerCase().includes("garbage") || text.toLowerCase().includes("waste")) {
      return "Accumulated uncollected waste and public sanitation hazard reported.";
    }
    if (text.toLowerCase().includes("water") && (text.toLowerCase().includes("leak") || text.toLowerCase().includes("pipe"))) {
      return "Water pipeline leakage and potential drinking water wastage identified.";
    }
    if (text.toLowerCase().includes("streetlight") || text.toLowerCase().includes("dark")) {
      return "Street lighting outage causing safety and visibility concerns.";
    }

    if (firstSentence.length > 15 && firstSentence.length < 120) {
      return `${firstSentence}. AI categorized for urgent ${category} redressal.`;
    }

    return `Citizen reported an issue concerning ${category} requiring ${priority} priority attention.`;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CivicAIEngine;
}
