# Product Requirements Document

## CS Hub — Client Success Operating System

**Version:** 1.0
**Status:** Draft
**Owner:** URUP Connect (Pty) Ltd
**Date:** June 2026

---

## 1. Executive Summary

CS Hub is an AI-powered Client Success Operating System designed for Client Success Managers (CSMs) who manage software delivery relationships. It centralises client communications, automates document generation, transforms customer requests into structured developer requirements, and builds organisational memory that grows with every project.

The platform addresses a common challenge in software delivery companies: customer requests arrive scattered across email, meetings, and documents, get manually translated into requirements, and institutional knowledge is lost when staff change or memories fade.

CS Hub eliminates this by connecting every interaction — from the first email to the final deployment — into a single intelligent workspace.

---

## 2. Problem Statement

Client Success Managers in software delivery companies currently face:

- Client emails, meeting notes, and documents spread across Outlook, Teams, SharePoint, and local folders
- 20–30 minutes spent searching for previous work before starting a new project
- SOWs, POCs, and Quotes recreated from scratch for each engagement
- Requirements manually rewritten from customer emails into developer tickets
- No central view of customer health or engagement trends
- Institutional knowledge stored in individuals rather than systems
- Follow-ups missed because there is no proactive reminder system
- No traceability from customer request to deployed feature

---

## 3. Objectives

1. Reduce time spent searching for information by 80%
2. Automate generation of SOWs, POCs, and Quotes from templates
3. Transform customer communications into developer-ready requirements automatically
4. Provide a real-time view of customer health and engagement
5. Build organisational memory that improves with every completed project
6. Maintain end-to-end traceability from customer email to deployment

---

## 4. User Personas

### Primary — Client Success Manager
Daily user. Manages 10–30 client relationships. Sends emails, attends meetings, creates documents, and hands over requirements to development teams.

### Secondary — Delivery Manager
Reviews project status, approves documents, monitors customer health across all CSMs.

### Tertiary — Developer
Receives exported ticket packages. Does not use CS Hub directly in MVP.

### Administrator
Manages users, roles, templates, and system configuration.

---

## 5. Functional Modules

---

### Module 1 — Dashboard

The daily workspace for the CSM.

**My Day Panel**
- Outstanding emails requiring action
- Follow-ups due today
- Meetings scheduled today
- Recently viewed clients
- Overdue actions
- Notifications

**Work Inbox**
- Filtered view showing only emails that require action
- Priority indicators: High (awaiting reply), Medium (follow up in 2 days), Low (waiting for customer)
- One-click mark as actioned
- Link email to client or project

**Quick Stats**
- Active clients count
- Projects in progress
- Documents pending approval
- Customers at risk

---

### Module 2 — Client Hub

Central workspace for each client relationship.

**Client Profile**
- Company name, trading name, registration number
- Industry, website
- Production URL, UAT URL, staging URL
- Assigned CSM
- Teams channel link
- SharePoint and OneDrive links
- Health score and status
- Notes

**Contacts**
- Full contact list with roles
- Primary contact flagging
- Decision maker flagging
- Email and phone
- LinkedIn URL

**Timeline**
- Chronological view of every interaction
- Emails, meetings, quotes, SOWs, projects, deployments
- Filter by type and date range
- Click any item to open full detail

**Projects Tab**
- All projects for this client
- Status, type, priority, dates
- Link to project workspace

**Documents Tab**
- All quotes, SOWs, POCs, proposals, contracts
- Version history
- Status indicators

**Health Tab**
- Health score trend over time
- Last contact date
- AI recommendations
- Engagement metrics

---

### Module 3 — Project Workspace

Full project management per engagement.

**Overview**
- Project name, type, status, priority
- Start date, target date, completion date
- Assigned CSM
- GitHub repo and epic links
- Journey URL

**Timeline and Milestones**
- Visual project timeline
- Milestone tracking
- Status updates

**Requirements**
- All captured requirements
- AI-generated and manual
- Status: draft, reviewed, approved, exported

**Communications**
- All emails and meetings linked to this project
- Attachments

**Documents**
- Quotes, SOWs, POCs linked to this project

**Assets**
- Journey URLs
- Import templates
- Email templates
- Test cases
- Branding assets

---

### Module 4 — AI Requirement Capture Engine

The core AI differentiator.

**Input Sources (MVP — manual paste)**
- Email text
- Meeting notes
- Attached document content

**Classification**
AI classifies the request as:
- New feature
- Bug report
- Enhancement
- Support request

**Extraction Output**
- Client name and contact
- Type and priority
- Business reason
- Affected modules
- User stories (As a / I want / So that)
- Acceptance criteria
- Developer tasks (Backend, Frontend, Testing)

**Ask the Customer**
When information is missing, AI drafts a clarification email rather than creating an incomplete ticket.

**Review Workflow**
CSM reviews all AI output before export:
- Edit any field
- Approve or reject individual items
- Add notes
- Split into multiple tickets
- Change priorities

**Export**
- Copy to clipboard as formatted text
- Export as JSON
- Export as Word document
- (Phase 2) Push directly to GitHub Issues

---

### Module 5 — Document Builder

**Quote Builder**
- Client details auto-populated
- Line items with quantities and rates
- Currency: ZAR default
- VAT calculation
- Validity date
- PDF and Word export

**SOW Builder**
- Project scope
- Deliverables
- Timelines
- Assumptions and exclusions
- Payment terms
- Signatures section
- PDF and Word export

**POC Builder**
- Proof of concept scope
- Success criteria
- Timeline
- Resource requirements

**Proposal Builder**
- Executive summary
- Solution overview
- Pricing
- Team
- References

**Templates**
- Admin-managed templates per document type
- Client branding application
- Reuse from previous similar projects

---

### Module 6 — Customer Health Dashboard

**Health Score Engine**
Weighted scoring based on:
- Days since last email (25%)
- Days since last meeting (25%)
- Active projects count (20%)
- Open follow-ups overdue (15%)
- Completed projects in last 90 days (15%)

**Status Bands**
- Active: 80–100 — Weekly engagement, new projects
- Steady: 60–79 — Monthly communication, work progressing
- Quiet: 40–59 — No meetings for 45 days
- At Risk: 0–39 — No engagement for 90+ days

**AI Recommendations**
- "ABC Ltd has been inactive for 60 days. Consider scheduling a catch-up."
- "XYZ completed their 10th project. Consider sending a thank-you."
- "Client A usually starts planning in October. Reach out now."

**Milestone Celebrations**
- First project
- 10th project
- 1 year as a customer
- 5 years as a customer
- AI drafts suggested message

---

### Module 7 — Project Intelligence

**Similar Project Detection**
When a new request arrives, AI searches previous projects by:
- Email content similarity
- Keywords and terminology
- Client history
- Project type
- Feature lists

**Reuse Score**
Estimates percentage of previous work that can be reused:
- Journey: 95%
- Requirements: 90%
- SOW: 80%
- Quote: 70%
- Test Cases: 100%

**Before You Start Assistant**
On opening a new project:
- Lists similar previous projects
- Recommends specific assets to reuse
- Estimates preparation time saved

**Customer Knowledge Library**
Per client:
- All previous project assets
- Journey URLs
- Import templates
- Email templates
- Previous SOWs and Quotes
- Test cases
- Lessons learned

---

### Module 8 — Global Search

Searches across:
- Clients
- Contacts
- Projects
- Communications (emails and meeting notes)
- Documents
- Attachments
- Requirements
- Knowledge base

Full-text search with filters by type, client, date range, and status.

---

### Module 9 — Administration

- User management
- Role assignment
- Document template management
- System configuration
- Integration settings
- Audit log

---

## 6. Non-Functional Requirements

**Performance**
- Dashboard loads in under 2 seconds
- Search returns results in under 1 second
- AI requirement extraction completes in under 10 seconds

**Security**
- Microsoft Entra ID authentication
- Role-based access control
- All data encrypted at rest and in transit
- POPIA compliant (South African data protection)
- Audit trail on all data modifications

**Scalability**
- Designed to support up to 500 concurrent users
- Database designed for 10 years of accumulated data

**Availability**
- 99.5% uptime target
- Vercel edge deployment for global performance

---

## 7. Out of Scope for MVP

- Real Microsoft Graph integration (Phase 2)
- Direct GitHub Issues push (Phase 2)
- Mobile application
- Customer-facing portal
- Revenue tracking
- Multi-tenancy
