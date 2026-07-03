# CS Hub

**AI-Powered Client Success Operating System**

CS Hub is an enterprise-grade platform that centralises client communications, project delivery, document generation, knowledge management, and relationship intelligence for Client Success Managers.

---

## Vision

To eliminate manual searching, reduce administrative effort, improve customer engagement, and ensure every customer interaction is transformed into actionable knowledge.

CS Hub integrates with Microsoft Outlook, Microsoft Teams, Microsoft Graph, and internal delivery processes to help Client Success Managers capture requirements, generate project documentation, monitor customer engagement, and improve delivery efficiency.

---

## Three Core Pillars

### 1. Work Management
Emails, follow-ups, SOWs, POCs, quotes, projects, and tickets — all in one workspace.

### 2. Knowledge Management
Every email, meeting, attachment, requirement, and document connected in one searchable timeline. Organisational memory that grows with every project.

### 3. Relationship Intelligence
AI monitors customer engagement, flags at-risk clients, suggests follow-ups, celebrates milestones, and helps build stronger long-term relationships.

---

## Key Differentiators

**Requirement Capture Engine**
Reads emails, meeting notes, and attached documents. Automatically extracts requirements, generates user stories, acceptance criteria, and developer tasks. Flags missing information before tickets are created.

**Project Intelligence**
Recognises recurring work patterns. When a client requests their annual campaign, the system surfaces previous SOWs, quotes, URLs, test cases, and assets. Estimates reuse percentage and saves preparation time.

**Customer Health Dashboard**
Tracks engagement across email, meetings, projects, and activity. Proactively recommends follow-up actions before relationships go cold.

**End-to-End Traceability**
Customer Email > Meeting Notes > SOW > POC > Developer Tasks > Testing > Deployment > Release Notes. Every stage linked.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | PostgreSQL |
| Authentication | Microsoft Entra ID (Azure AD) |
| AI | OpenAI / Azure OpenAI |
| Integrations | Microsoft Graph, Outlook, Teams, OneDrive, SharePoint, GitHub |
| Deployment | Vercel (URUPConnect team) |

---

## Development Phases

| Phase | Scope |
|---|---|
| Phase 1 | Dashboard, Client Hub, Outlook and Teams integration (mock MVP) |
| Phase 2 | Quote, SOW and POC generation |
| Phase 3 | AI Requirement Analysis and Ticket Builder |
| Phase 4 | Customer Health, Relationship Timeline, proactive follow-up |
| Phase 5 | Project Intelligence, Organisational Memory, Knowledge Reuse |

---

## Repository Structure

```
cs-hub/
├── README.md
├── PRODUCT_REQUIREMENTS.md
├── ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── API_SPECIFICATION.md
├── AI_PROMPTS.md
├── USER_STORIES.md
├── ROADMAP.md
├── RELEASE_PLAN.md
├── SECURITY.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
├── backend/
│   ├── api/
│   ├── services/
│   ├── ai/
│   ├── graph/
│   ├── auth/
│   └── db/
├── docs/
│   ├── wireframes/
│   ├── process-flows/
│   ├── decisions/
│   └── images/
└── .github/
    ├── workflows/
    ├── ISSUE_TEMPLATE/
    └── PULL_REQUEST_TEMPLATE/
```

---

## GitHub Epics

| Epic | Module |
|---|---|
| Epic 1 | Authentication and User Management |
| Epic 2 | Client Management |
| Epic 3 | Outlook Integration |
| Epic 4 | Microsoft Teams Integration |
| Epic 5 | Document Management |
| Epic 6 | Quote Builder |
| Epic 7 | SOW Builder |
| Epic 8 | POC Builder |
| Epic 9 | AI Requirement Analysis |
| Epic 10 | Developer Ticket Builder |
| Epic 11 | Customer Health Dashboard |
| Epic 12 | Relationship Intelligence |
| Epic 13 | Project Intelligence |
| Epic 14 | Knowledge Management |
| Epic 15 | Global Search |
| Epic 16 | Reporting and Analytics |
| Epic 17 | Administration |

---

## Developer Setup

### Environment Variables

Copy `.env.example` to `.env.local` and fill in real values. Full list with descriptions and where to obtain each one is documented in `.env.example` itself. In production, these are set in Vercel → Project → Settings → Environment Variables, not committed to the repo.

### Database Setup

The database schema is applied via a set of one-off, idempotent GET endpoints rather than a formal migration tool. Each is safe to re-run (they use `IF NOT EXISTS` guards throughout). On a fresh database, run these once, in this order, by visiting each URL while signed in:

1. `/api/db/init` — base schema
2. `/api/db/init-v2` — schema additions (check route source for specifics)
3. `/api/db/init-v3` — adds `users` table and `assigned_user_id` columns
4. `/api/db/init-calendar` — calendar events table
5. `/api/db/init-knowledge` — knowledge base tables
6. `/api/db/init-priorities` — priorities table
7. `/api/db/init-templates` — document templates table
8. `/api/db/init-dev-mode` — adds the `is_developer` flag used by the developer mode panel

**Known gap:** `DATABASE_SCHEMA.md` was written as an early design spec and has drifted from what these routes actually create (for example it documents `users.full_name`, `users.azure_oid`, and `users.avatar_url`, none of which exist — the real columns are `name`, `role`, and `avatar_initials`). Treat the `init-*` route source files as the source of truth until that document is reconciled.

### Developer Mode

Signed-in users with `is_developer = true` on their `users` row see a small `</>` toggle bottom-right on every page, showing the source file, known API calls, and live deployment info for the current screen. Route-to-file mappings live in `lib/devRegistry.ts` — add an entry there when building a new page.

---

## Status

Active development. Internal platform — URUP Connect (Pty) Ltd.

---

*Built by URUP Connect (Pty) Ltd — South Africa*
