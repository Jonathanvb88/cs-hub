import { describe, it, expect } from "vitest";
import { calculateHealthScore } from "./healthScore";

const base = {
  daysSinceLastContact: 5,
  overdueFollowUps: 0,
  pendingFollowUps: 0,
  activeProjects: 0,
  onHoldOrCancelledProjects: 0,
  recentDocuments: 0,
};

describe("calculateHealthScore", () => {
  it("scores a recently-contacted client with no other signals as active", () => {
    const result = calculateHealthScore(base);
    // baseline 70 + 20 (contacted within 7 days) = 90
    expect(result.score).toBe(90);
    expect(result.status).toBe("active");
  });

  it("treats never-contacted clients as a strong negative signal", () => {
    const result = calculateHealthScore({ ...base, daysSinceLastContact: null });
    // baseline 70 - 25 = 45
    expect(result.score).toBe(45);
    expect(result.status).toBe("quiet");
  });

  it("penalises contact gaps on a sliding scale", () => {
    expect(calculateHealthScore({ ...base, daysSinceLastContact: 7 }).score).toBe(90);
    expect(calculateHealthScore({ ...base, daysSinceLastContact: 21 }).score).toBe(75);
    expect(calculateHealthScore({ ...base, daysSinceLastContact: 45 }).score).toBe(60);
    expect(calculateHealthScore({ ...base, daysSinceLastContact: 46 }).score).toBe(40);
  });

  it("caps the overdue follow-up penalty at 30 points regardless of count", () => {
    const fewOverdue = calculateHealthScore({ ...base, overdueFollowUps: 3 });
    const manyOverdue = calculateHealthScore({ ...base, overdueFollowUps: 50 });
    expect(fewOverdue.score).toBe(90 - 24); // 3 * 8
    expect(manyOverdue.score).toBe(90 - 30); // capped, not 400
  });

  it("caps the pending follow-up bonus at 10 points", () => {
    const result = calculateHealthScore({ ...base, pendingFollowUps: 100 });
    expect(result.score).toBe(90 + 10 > 100 ? 100 : 90 + 10);
  });

  it("rewards active projects and penalises stalled ones, both capped", () => {
    const activeOnly = calculateHealthScore({ ...base, activeProjects: 10 });
    expect(activeOnly.score).toBe(100); // 90 + 15 capped -> clamped to 100

    const stalledOnly = calculateHealthScore({ ...base, onHoldOrCancelledProjects: 10 });
    expect(stalledOnly.score).toBe(70); // 90 - 20 capped
  });

  it("clamps the final score to the 0-100 range", () => {
    const worstCase = calculateHealthScore({
      daysSinceLastContact: 100,
      overdueFollowUps: 999,
      pendingFollowUps: 0,
      activeProjects: 0,
      onHoldOrCancelledProjects: 999,
      recentDocuments: 0,
    });
    expect(worstCase.score).toBe(0);
    expect(worstCase.status).toBe("at_risk");

    const bestCase = calculateHealthScore({
      daysSinceLastContact: 1,
      overdueFollowUps: 0,
      pendingFollowUps: 999,
      activeProjects: 999,
      onHoldOrCancelledProjects: 0,
      recentDocuments: 999,
    });
    expect(bestCase.score).toBe(100);
    expect(bestCase.status).toBe("active");
  });

  it("maps score bands to the correct status label", () => {
    // Verify each status boundary explicitly, since these thresholds drive
    // real dashboard behaviour (which clients show as "at risk", etc).
    expect(calculateHealthScore({ ...base, daysSinceLastContact: null, overdueFollowUps: 0 }).status).toBe("quiet"); // 45
    expect(
      calculateHealthScore({ ...base, daysSinceLastContact: null, overdueFollowUps: 2 }).status
    ).toBe("at_risk"); // 45 - 16 = 29
  });
});
