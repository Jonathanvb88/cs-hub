# Architecture

## CS Hub — System Architecture

---

## Overview

CS Hub is a three-tier web application built on Next.js (frontend), FastAPI (backend), and PostgreSQL (database), deployed on Vercel with AI capabilities powered by OpenAI.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                    │
│              Next.js / TypeScript / Tailwind         │
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────┐
│                  VERCEL EDGE NETWORK                 │
│              Next.js App Router / API Routes         │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                  FASTAPI BACKEND                     │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Auth      │  │   Client    │  │  Document   │ │
│  │   Service   │  │   Service   │  │  Service    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │     AI      │  │  Graph API  │  │   Search    │ │
│  │   Service   │  │   Service   │  │   Service   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└──────┬──────────────────┬──────────────────┬────────┘
       │                  │                  │
┌──────▼──────┐  ┌────────▼──────┐  ┌───────▼──────┐
│ PostgreSQL  │  │  OpenAI API   │  │ Microsoft    │
│  Database   │  │  / Azure OAI  │  │ Graph API    │
└─────────────┘  └───────────────┘  └──────────────┘
```

---

## Frontend Architecture

### Framework
- Next.js 14 with App Router
- TypeScript throughout
- Tailwind CSS for styling
- React Query for server state management
- Zustand for client state management

### Key Directories
```
frontend/
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   ├── clients/
│   ├── projects/
│   ├── documents/
│   ├── intelligence/
│   └── settings/
├── components/
│   ├── ui/
│   ├── clients/
│   ├── documents/
│   ├── ai/
│   └── shared/
├── lib/
│   ├── api/
│   ├── auth/
│   └── utils/
└── public/
```

---

## Backend Architecture

### Framework
- Python 3.11+
- FastAPI with async support
- SQLAlchemy ORM
- Alembic for migrations
- Pydantic for data validation
- Celery + Redis for background tasks

### Key Services
```
backend/
├── api/
│   ├── routes/
│   └── middleware/
├── services/
│   ├── client_service.py
│   ├── document_service.py
│   ├── email_service.py
│   ├── project_service.py
│   └── health_service.py
├── ai/
│   ├── requirement_engine.py
│   ├── similarity_engine.py
│   ├── health_engine.py
│   └── prompts/
├── graph/
│   ├── outlook.py
│   ├── teams.py
│   └── onedrive.py
├── auth/
│   └── entra.py
└── db/
    ├── models/
    └── migrations/
```

---

## Database

- PostgreSQL 15+
- Soft delete on all core tables (deleted_at)
- Audit columns on all tables (created_at, updated_at, created_by)
- Full-text search via PostgreSQL tsvector
- UUID primary keys throughout

---

## Authentication

- Microsoft Entra ID (Azure AD) via OAuth 2.0 / OIDC
- JWT tokens validated on every API request
- Role-based access control: Admin, Manager, CSM, Read-Only

---

## AI Architecture

### Requirement Capture Engine
1. Input: raw email text, meeting notes, or document content
2. Classification: feature request, bug, enhancement, support
3. Extraction: requirements, user stories, acceptance criteria, tasks
4. Gap detection: missing information flagged for Ask the Customer
5. Output: structured ticket package for review

### Project Intelligence Engine
1. Input: new client request or email content
2. Embedding: generate vector embedding of content
3. Similarity search: compare against historical project embeddings
4. Ranking: score by similarity, recency, and client match
5. Output: ranked list of similar projects with reusable assets

### Customer Health Engine
1. Inputs: last contact date, email frequency, meeting count, project activity
2. Scoring: weighted algorithm producing 0-100 health score
3. Classification: Active (80-100), Steady (60-79), Quiet (40-59), At Risk (0-39)
4. Recommendations: AI-generated suggested next actions

---

## Deployment

- Frontend and backend deployed via Vercel
- Vercel team: URUPConnect
- Auto-deploy on push to main branch
- Environment variables managed in Vercel dashboard
- Database hosted on Supabase or Railway (PostgreSQL)

---

## MVP Constraints

- Microsoft Graph integration: mock data in Phase 1, real Graph in Phase 2
- Ticketing: copy/export only in Phase 1, GitHub Issues direct push in Phase 2
- AI: OpenAI API (gpt-4o) throughout
- Storage: database-only in Phase 1, OneDrive/SharePoint in Phase 6
