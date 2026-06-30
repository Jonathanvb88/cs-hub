# CS Hub — Sprint Notes

_Last updated: 30 June 2026_

## Status: Pending Verification (blocked on Vercel daily deploy cap)

These features are code-complete and pushed to `main`, but have not yet been confirmed live on production because Vercel's daily deployment limit was hit twice today (once via the manual Redeploy button, once via the standard Git-push pipeline).

### 1. Real Health Dashboard scoring
- **Files:** `app/api/db/health-calculate/route.ts`, `app/(app)/health/page.tsx`
- **What it does:** Replaces fabricated mock health scores with a real calculation based on: days since last logged communication, overdue follow-ups, active vs stalled projects, and recent document activity (60-day window).
- **Status:** A TypeScript build error (`Type 'Record<string, any>[]' is not assignable to type 'ClientRow[]'`) was found and fixed in commit `74efc768`. This fix has NOT yet been confirmed to build successfully on Vercel — the deploy cap hit before we could verify.
- **Verification needed:** Once quota resets, push any small commit, then visit `/health` and confirm scores show real numbers (not the old mock 1-100 fabricated values) and that the "why this score" expandable row works.
- **Also needed:** Run `https://cs-hub-dusky.vercel.app/api/db/init-priorities` is NOT related to this — no DB init needed for health-calculate, it uses existing tables.

### 2. Custom Priority Categories
- **Files:** `app/api/db/init-priorities/route.ts`, `app/api/db/priorities/route.ts`, `app/(app)/settings/priorities/page.tsx`, `app/(app)/settings/page.tsx`, `app/(app)/followups/page.tsx`, `app/(app)/projects/page.tsx`
- **What it does:** Lets the user define custom priority labels and colors (beyond Critical/High/Medium/Low) via Settings → Priority Categories. Follow-ups and Projects pull priority options dynamically from this table instead of hardcoded values.
- **Status:** Code complete, never built/deployed yet — blocked by the same cap, on top of (likely the cause of) the cap.
- **Verification needed once live:**
  1. Run `https://cs-hub-dusky.vercel.app/api/db/init-priorities` once to create the table and seed Critical/High/Medium/Low
  2. Go to Settings → Priority Categories → confirm the four defaults appear
  3. Add a custom priority (e.g. "Strategic") with a color, confirm it appears as an option on New Follow-up and New Project forms
  4. Confirm existing Follow-ups/Projects with old priority values (high/medium/low) still render correctly with the new dynamic lookup

## Known Working (confirmed live before the cap)
- Clients, Documents (Quote/SOW/POC + templates), Follow-ups, Projects, Communications — full DB persistence
- Team page + assignment dropdowns on Clients/Projects/Follow-ups
- Reports page (real analytics)
- Client Timeline (real aggregated activity)
- Project detail page (fixes the old broken "Open" button)
- Communications real client picker + working "View Client Profile" link
- Light theme redesign, persistent client context panel, mobile bottom nav

## Known Permanently Disabled (cost decision, not a bug)
- AI Assistant (floating chat bubble) — removed from layout. Code still exists in `components/assistant/AIAssistant.tsx` and `app/api/assistant/route.ts` if ever re-enabled.
- All other AI features (Requirement Capture, Meeting Intelligence, Relationship Coach, AI health recommendations) will return 401 errors until `ANTHROPIC_API_KEY` in Vercel env vars is replaced with a valid key tied to an account with billing set up. This is a deliberate stop, not a bug — see chat history for the cost discussion.

## Known Gaps Not Yet Addressed
- Microsoft Graph integration — fully coded, blocked on the CEO clicking the admin consent URL. No further code work possible until that happens.
- Mobile native app (installable, push notifications) — explicitly deprioritized vs Attio/Folk comparison, no current plan to build.
- Deeper BI/forecasting beyond the current Reports page — not started.

## Operational Notes for Next Session
- **Vercel daily deploy cap is shared** between manual Redeploy clicks and normal `git push` triggers — both count against the same ~100/day limit. If a push doesn't show up in `list_deployments` at all (not even as ERROR), that's the signal the cap has been hit again, not a webhook bug.
- A small no-op commit is a reliable way to test if the cap has cleared.
- The Anthropic API key currently in Vercel env vars is invalid/unauthorized (confirmed via 401 in runtime logs) — replacing it requires Jonathan to set up billing on a Claude Console account first (Organization workspace recommended over Individual, given this is for URUP Connect).
