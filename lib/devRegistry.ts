export interface DevPageInfo {
  file: string;
  apiRoutes?: string[];
  notes?: string;
}

/**
 * Maps a route pathname to its source file and, where already catalogued during the
 * code audit, the API routes that page calls. Not yet exhaustive — extend as more
 * pages get verified. This is intentionally hand-maintained rather than guessed, so
 * everything shown here is accurate rather than inferred.
 */
const registry: Record<string, DevPageInfo> = {
  "/dashboard": { file: "app/(app)/dashboard/page.tsx", apiRoutes: ["/api/db/communications", "/api/db/followups", "/api/db/clients"] },
  "/projects": { file: "app/(app)/projects/page.tsx", apiRoutes: ["/api/db/projects", "/api/db/users"] },
  "/health": { file: "app/(app)/health/page.tsx", apiRoutes: ["/api/db/health-calculate"] },
  "/clients": { file: "app/(app)/clients/page.tsx" },
  "/communications": { file: "app/(app)/communications/page.tsx" },
  "/followups": { file: "app/(app)/followups/page.tsx" },
  "/calendar": { file: "app/(app)/calendar/page.tsx" },
  "/documents": { file: "app/(app)/documents/page.tsx" },
  "/documents/view": { file: "app/(app)/documents/view/page.tsx" },
  "/documents/poc/new": { file: "app/(app)/documents/poc/new/page.tsx" },
  "/documents/quote/new": { file: "app/(app)/documents/quote/new/page.tsx" },
  "/documents/sow/new": { file: "app/(app)/documents/sow/new/page.tsx" },
  "/documents/uat/new": { file: "app/(app)/documents/uat/new/page.tsx" },
  "/knowledge": { file: "app/(app)/knowledge/page.tsx" },
  "/reminders": { file: "app/(app)/reminders/page.tsx" },
  "/reports": { file: "app/(app)/reports/page.tsx" },
  "/search": { file: "app/(app)/search/page.tsx" },
  "/settings": { file: "app/(app)/settings/page.tsx" },
  "/settings/priorities": { file: "app/(app)/settings/priorities/page.tsx" },
  "/team": { file: "app/(app)/team/page.tsx" },
  "/profile": { file: "app/(app)/profile/page.tsx" },
  "/inbox": { file: "app/(app)/inbox/page.tsx" },
  "/audit": { file: "app/(app)/audit/page.tsx" },
  "/ai-search": { file: "app/(app)/ai-search/page.tsx", apiRoutes: ["/api/ai-search"] },
  "/intelligence": { file: "app/(app)/intelligence/page.tsx" },
  "/intelligence/capture": { file: "app/(app)/intelligence/capture/page.tsx" },
  "/intelligence/meeting": { file: "app/(app)/intelligence/meeting/page.tsx" },
  "/intelligence/projects": { file: "app/(app)/intelligence/projects/page.tsx" },
};

// Dynamic routes (e.g. /clients/abc123) matched after the [id] segment.
const dynamicRegistry: { test: RegExp; info: DevPageInfo }[] = [
  { test: /^\/clients\/[^/]+\/coach/, info: { file: "app/(app)/clients/[id]/coach/page.tsx" } },
  { test: /^\/clients\/[^/]+\/conversations/, info: { file: "app/(app)/clients/[id]/conversations/page.tsx" } },
  { test: /^\/clients\/[^/]+\/playbook/, info: { file: "app/(app)/clients/[id]/playbook/page.tsx" } },
  { test: /^\/clients\/[^/]+$/, info: { file: "app/(app)/clients/[id]/page.tsx" } },
  { test: /^\/projects\/[^/]+$/, info: { file: "app/(app)/projects/[id]/page.tsx", apiRoutes: ["/api/db/projects?id=", "/api/db/users"] } },
];

export function getDevPageInfo(pathname: string): DevPageInfo {
  if (registry[pathname]) return registry[pathname];
  const match = dynamicRegistry.find((r) => r.test.test(pathname));
  if (match) return match.info;
  return {
    file: "Not yet catalogued",
    notes: "This route hasn't been added to lib/devRegistry.ts yet — add an entry there.",
  };
}
