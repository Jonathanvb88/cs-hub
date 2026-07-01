# CS Hub — Sprint Notes

_Last updated: 1 July 2026_

## Current Build Status: STABLE — Tester Ready

Production URL: **cs-hub-dusky.vercel.app**
GitHub: github.com/Jonathanvb88/cs-hub (main branch)

---

## Pending Verification (latest batch — may still be building)

The following commits are in the deployment queue. If the build shows ERROR, the most likely cause is a TypeScript strict-mode issue in one of the files below — check Vercel build logs for the exact line.

- Document View page — `app/(app)/documents/view/page.tsx` — Suspense boundary added for useSearchParams
- Client profile Quick Actions wired + inline follow-up form
- Document status dropdown (Draft → Sent → Accepted)
- Reports date range filter (All time / 30 / 90 / 180 / 365 days)
- Reports API supports `?days=N` parameter
- Settings page — data export section, platform info, cleaner status notices
- Client Context Panel — Log Conversation and New UAT Sign-off added

**DB init routes to run once after deploy:**
- `/api/db/init-priorities` — custom priority categories table
- `/api/db/init-v3` — users table and assignment columns
(These are safe to re-run; they use CREATE TABLE IF NOT EXISTS)

---

## Confirmed Live Features (all working in production)

### Core Data (real Postgres, zero mock data)
- Clients — full CRUD, assignment dropdowns, health scores
- Documents — Quote / SOW / POC / UAT builders, templates, status workflow
- Follow-ups — real DB, priority categories, assignment
- Projects — real DB, project detail page, assignment
- Communications — real DB, client picker, WhatsApp/SMS Conversation Capture
- Team — real DB, 10 roles (CSM, Key Accounts, Sales Manager, Project Manager, Delivery Manager, Finance Admin, Visuals, Executive Partner, Administrator, Read Only)
- Reports — real analytics with date range filter
- Health Dashboard — real calculated scores from DB signals
- Client Timeline — real aggregated activity
- Search — queries real Postgres across clients, projects, documents, communications
- Sidebar badges — live counts from DB, refresh every 60 seconds

### Pages Built (29 total)
Dashboard, Clients, Client Profile (Overview/Contacts/Timeline/Projects/Documents/Conversations/Health tabs), Coach, Playbook, Conversations (WhatsApp capture), Projects, Project Detail, Work Inbox, Communications, Follow-ups, Reminders, Documents, Document View, UAT Sign-off Builder, Knowledge, Health, Intelligence Hub, Requirement Capture, Meeting Intelligence, Project Intelligence, Reports, Team, Search, Settings, Priority Categories Settings, Profile, Documents View

### UI/UX
- Light theme, dark sidebar, forest-green accent
- Consistent type scale via CSS variables
- Skeleton loaders on high-traffic screens
- Proper empty states with CTAs throughout
- Toast notifications on all save/create actions
- Persistent client context panel (desktop docked, mobile bottom sheet)
- Mobile bottom navigation
- User profile page with password change and notification preferences
- Sidebar profile link → /profile

---

## Deliberately Disabled (cost decisions, not bugs)

### AI Features — ALL PAUSED
Every AI feature returns 401. Root cause: `ANTHROPIC_API_KEY` in Vercel is invalid/revoked.
To fix: generate a new key at console.anthropic.com (Organization account), update in Vercel env vars, redeploy.
Affected: AI Assistant, Requirement Capture Engine, Meeting Intelligence, Project Intelligence, Health Recommendations, Relationship Coach, Conversation Capture AI button.
The "AI paused" notice is now shown clearly on Health Dashboard and Intelligence pages instead of silent failure.

### Microsoft Graph — PENDING ADMIN CONSENT
Code is fully built. CEO/Global Administrator needs to click the admin consent URL in Azure AD.
Settings page now shows a clear amber notice explaining this.
Affected: Outlook email sync, Teams meetings, Calendar integration.

---

## Known Remaining Gaps (lower priority)

- Knowledge Library not persisted to DB — assets added via form are session-only
- Settings page notification toggles are visual only (no backend)
- Reports top-clients table doesn't respect date range filter (uses all-time)
- Mobile content layout is functional but not mobile-first designed

---

## Operational Notes

### Vercel Daily Deploy Cap
- Hard limit: ~100 deployments/day
- Manual Redeploy button and Git-push deployments use the SAME daily quota
- When capped, the cap error appears in the manual Redeploy dialog
- Workaround: a small no-op Git commit triggers the build quota separately from the dashboard Redeploy button — but this uses the same overall count
- If both are blocked, wait 24 hours from when the first cap was hit

### TypeScript Strict Mode
- All API routes that return `sql()` results must cast with `as TypeName[]` or use typed interfaces
- Components using `Record<string, unknown>[]` for DB rows will always hit TS errors — use proper interfaces
- `useSearchParams()` must be wrapped in `<Suspense>` in Next.js 14 App Router
- `content.X && (` patterns with `content: Record<string, unknown>` require `!!(content.X as string) && (`

### GitHub API
- Always GET the file first to retrieve `sha` before PUT — omitting sha on existing files causes 422
- URL encoding: `(` → `%28`, `)` → `%29`, `[` → `%5B`, `]` → `%5D`

### Vercel IDs
- Project: `prj_TxSJ4s9scyyUqawodGSLwTsamCWK`
- Team: `team_oaBil6BjcTAncLCfsycYAbzW`
- GitHub token: `[REDACTED — stored in Vercel env vars]`
