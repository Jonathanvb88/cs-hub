# API Specification

## CS Hub — API Contract

---

## Base URL

```
https://cs-hub.vercel.app/api/v1
```

---

## Authentication

All endpoints require a Bearer token obtained via Microsoft Entra ID OAuth 2.0 flow.

```
Authorization: Bearer <access_token>
```

---

## Standard Response Envelope

### Success
```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "CLIENT_NOT_FOUND",
    "message": "Client with ID xyz does not exist.",
    "field": null
  }
}
```

---

## Clients

### GET /clients
List all clients with pagination and filtering.

Query params: page, per_page, search, health_status, assigned_csm_id, sort_by, sort_dir

### POST /clients
Create a new client.

```json
{
  "name": "ABC Ltd",
  "industry": "Retail",
  "website": "https://abcltd.co.za",
  "production_url": "https://app.abcltd.co.za",
  "assigned_csm_id": "uuid"
}
```

### GET /clients/{id}
Get full client profile including contacts, health score, and recent activity.

### PUT /clients/{id}
Update client details.

### DELETE /clients/{id}
Soft delete client.

---

## Contacts

### GET /clients/{client_id}/contacts
List contacts for a client.

### POST /clients/{client_id}/contacts
Add a contact.

```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@abcltd.co.za",
  "job_title": "IT Manager",
  "is_primary": true
}
```

### PUT /clients/{client_id}/contacts/{id}
Update contact.

### DELETE /clients/{client_id}/contacts/{id}
Soft delete contact.

---

## Projects

### GET /projects
List all projects. Filterable by client_id, status, type, assigned_csm_id.

### POST /projects
Create a project.

```json
{
  "client_id": "uuid",
  "name": "Annual Rewards Journey 2026",
  "type": "annual_recurring",
  "priority": "high",
  "start_date": "2026-07-01",
  "target_date": "2026-08-31"
}
```

### GET /projects/{id}
Full project detail including milestones, requirements, documents, assets.

### PUT /projects/{id}
Update project.

### GET /projects/{id}/similar
Returns similar historical projects ranked by AI similarity score.

```json
{
  "data": [
    {
      "project_id": "uuid",
      "name": "Annual Rewards Journey 2025",
      "similarity_score": 96,
      "reuse_estimate": {
        "journey_url": 95,
        "sow": 80,
        "quote": 70,
        "test_cases": 100
      },
      "assets": []
    }
  ]
}
```

---

## Communications

### GET /clients/{client_id}/communications
List communications for a client. Filterable by type, direction, action_required.

### POST /communications
Create a communication record (manual entry for MVP).

```json
{
  "client_id": "uuid",
  "type": "email",
  "subject": "Annual Rewards Campaign Request",
  "body": "Hi Jonathan, we would like to launch...",
  "direction": "inbound",
  "sender_email": "john@abcltd.co.za",
  "received_at": "2026-06-29T09:00:00Z"
}
```

### PUT /communications/{id}
Update communication, including action_required and action_status.

---

## AI — Requirement Capture

### POST /ai/extract-requirements
Core AI endpoint. Extracts structured requirements from raw text input.

Request:
```json
{
  "client_id": "uuid",
  "project_id": "uuid",
  "source_type": "email",
  "content": "We would like users to upload multiple files and receive email notifications when processing is complete.",
  "sender": "john@abcltd.co.za"
}
```

Response:
```json
{
  "data": {
    "classification": "enhancement",
    "priority": "medium",
    "business_reason": "Improve user efficiency",
    "modules_affected": ["File Upload", "Notifications"],
    "user_stories": [
      {
        "as_a": "user",
        "i_want": "upload multiple files simultaneously",
        "so_that": "I can reduce processing time",
        "acceptance_criteria": [
          "User can upload multiple files",
          "Maximum of 20 files",
          "Progress bar displayed",
          "Email notification sent on completion"
        ]
      }
    ],
    "developer_tasks": [
      { "category": "backend", "title": "Update upload API" },
      { "category": "backend", "title": "Queue processing" },
      { "category": "frontend", "title": "Multi-file upload component" },
      { "category": "testing", "title": "Large file testing" }
    ],
    "missing_information": [
      "Maximum file size not specified",
      "Supported file types not defined"
    ],
    "clarification_email_draft": "Hi John, thank you for your request..."
  }
}
```

### POST /ai/meeting-summary
Generates a structured summary from meeting notes text.

### POST /ai/health-recommendations
Returns AI-generated recommendations for a client based on their health data.

### POST /ai/draft-email
Generates a draft email given a context and purpose.

---

## Documents

### GET /clients/{client_id}/documents
List all documents for a client.

### POST /documents
Create a document.

```json
{
  "client_id": "uuid",
  "project_id": "uuid",
  "type": "sow",
  "title": "SOW — Annual Rewards Journey 2026",
  "content_json": {}
}
```

### GET /documents/{id}/export/pdf
Generate and return PDF.

### GET /documents/{id}/export/docx
Generate and return Word document.

---

## Customer Health

### GET /clients/{client_id}/health
Current health score, status, and AI recommendations.

### GET /health/dashboard
All clients ranked by health score. Used for the health dashboard overview.

---

## Search

### GET /search
Global search across all entities.

Query params: q (required), types (comma-separated: clients,projects,communications,documents), client_id, date_from, date_to, page, per_page

```json
{
  "data": {
    "clients": [],
    "projects": [],
    "communications": [],
    "documents": [],
    "attachments": []
  },
  "meta": {
    "total": 42,
    "query": "annual rewards"
  }
}
```

---

## Follow-ups

### GET /follow-ups
List follow-ups for the current user. Filterable by status, due_date, client_id.

### POST /follow-ups
Create a follow-up task.

### PUT /follow-ups/{id}
Update status (complete, dismiss, snooze).

---

## Worked Example

Creating a requirement from a customer email end-to-end:

1. POST /communications — store the inbound email
2. POST /ai/extract-requirements — extract requirements from email body
3. Review the response in the UI
4. POST /requirements — save approved requirements
5. POST /user-stories (bulk) — save approved user stories
6. POST /developer-tasks (bulk) — save approved tasks
7. GET /requirements/{id}/export — copy to clipboard or download as Word
