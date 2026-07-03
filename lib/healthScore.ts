export interface HealthScoreInput {
  daysSinceLastContact: number | null;
  overdueFollowUps: number;
  pendingFollowUps: number;
  activeProjects: number;
  onHoldOrCancelledProjects: number;
  recentDocuments: number;
}

export interface HealthScoreResult {
  score: number;
  status: "active" | "steady" | "quiet" | "at_risk";
}

/**
 * Pure scoring function for client health. Kept dependency-free (no DB, no fetch)
 * so it can be unit tested directly — see lib/healthScore.test.ts.
 */
export function calculateHealthScore(params: HealthScoreInput): HealthScoreResult {
  let score = 70; // baseline for a client with some activity

  // Recency of contact — the single strongest signal
  if (params.daysSinceLastContact === null) {
    score -= 25; // never contacted / no communications logged at all
  } else if (params.daysSinceLastContact <= 7) {
    score += 20;
  } else if (params.daysSinceLastContact <= 21) {
    score += 5;
  } else if (params.daysSinceLastContact <= 45) {
    score -= 10;
  } else {
    score -= 30;
  }

  // Overdue follow-ups are a strong negative signal — things are being dropped
  score -= Math.min(params.overdueFollowUps * 8, 30);

  // Pending (not yet overdue) follow-ups suggest active engagement
  score += Math.min(params.pendingFollowUps * 2, 10);

  // Active projects are healthy; stalled/cancelled projects are a warning sign
  score += Math.min(params.activeProjects * 5, 15);
  score -= Math.min(params.onHoldOrCancelledProjects * 10, 20);

  // Recent document activity (quotes, SOWs) signals commercial engagement
  score += Math.min(params.recentDocuments * 4, 12);

  score = Math.max(0, Math.min(100, Math.round(score)));

  let status: HealthScoreResult["status"];
  if (score >= 75) status = "active";
  else if (score >= 55) status = "steady";
  else if (score >= 35) status = "quiet";
  else status = "at_risk";

  return { score, status };
}
