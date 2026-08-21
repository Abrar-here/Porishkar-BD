// ─── F02: Issue Priority & Auto-Categorization Engine ──────────────
//
// A small point-scoring system, not a complicated rules engine.
// Three factors each contribute a weight; the total score maps to
// one of 4 priority levels. All numbers below are the "configurable
// rule set" the assignment refers to — a developer can tune them
// here without touching any calling code.

// How risky is each waste category, on its own?
const CATEGORY_WEIGHTS = {
  Medical: 40,
  "Water Body Pollution": 35,
  Industrial: 25,
  Construction: 15,
  Household: 10,
};

// How much does the citizen-reported volume matter?
const VOLUME_WEIGHTS = {
  Large: 30,
  Medium: 15,
  Small: 5,
};

// Every unresolved report already sitting nearby adds this many
// points, up to a capped maximum — a cluster of 20 nearby reports
// shouldn't outweigh everything else entirely.
const POINTS_PER_NEARBY_REPORT = 8;
const MAX_NEARBY_POINTS = 40;

// How close counts as "the same area" — kept small and simple
// (straight-line radius), not a full geofencing/zone system.
export const NEARBY_RADIUS_KM = 0.5;

// Only these statuses count as "unresolved" when checking for
// nearby clustering — a resolved/closed/cancelled report nearby
// shouldn't make a new report look more urgent.
export const UNRESOLVED_STATUSES = [
  "Reported",
  "Assigned",
  "Collector En Route",
  "Cleanup In Progress",
  "Under Investigation",
];

// Score → priority level thresholds.
const PRIORITY_THRESHOLDS = [
  { level: "Critical", min: 70 },
  { level: "High", min: 45 },
  { level: "Medium", min: 20 },
  { level: "Low", min: 0 },
];

// Turns a raw score into one of the 4 priority labels.
const scoreToPriority = (score) => {
  for (const { level, min } of PRIORITY_THRESHOLDS) {
    if (score >= min) return level;
  }
  return "Low";
};

// The main function: given a report's category, volume, and how many
// unresolved reports already exist nearby, calculate a priority.
// Returns both the label and the raw score/breakdown, so the reasoning
// can be shown to an admin or logged if needed.
export const calculatePriority = ({ category, estimatedVolume, nearbyCount }) => {
  const categoryScore = CATEGORY_WEIGHTS[category] || 0;
  const volumeScore = VOLUME_WEIGHTS[estimatedVolume] || 0;
  const nearbyScore = Math.min(
    nearbyCount * POINTS_PER_NEARBY_REPORT,
    MAX_NEARBY_POINTS,
  );

  const totalScore = categoryScore + volumeScore + nearbyScore;
  const priority = scoreToPriority(totalScore);

  return {
    priority,
    breakdown: { categoryScore, volumeScore, nearbyScore, totalScore },
  };
};