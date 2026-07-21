// Despite the filename (kept for now to avoid touching every import across
// the app), this file contains no mock/fake data - only real, shared health
// status formatting helpers used throughout the app.

export function getHealthColor(status: string) {
  switch (status) {
    case "active": return "#10b981";
    case "steady": return "#3b82f6";
    case "quiet": return "#f59e0b";
    case "at_risk": return "#ef4444";
    default: return "#94a3b8";
  }
}

export function getHealthLabel(status: string) {
  switch (status) {
    case "active": return "Active";
    case "steady": return "Steady";
    case "quiet": return "Quiet";
    case "at_risk": return "At Risk";
    default: return "Unknown";
  }
}

export function getHealthBadgeClass(status: string) {
  switch (status) {
    case "active": return "badge badge-green";
    case "steady": return "badge badge-blue";
    case "quiet": return "badge badge-amber";
    case "at_risk": return "badge badge-red";
    default: return "badge badge-gray";
  }
}
