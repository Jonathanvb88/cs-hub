# Database Schema

## CS Hub — Database Design

---

## Design Principles

- UUID primary keys on all tables
- Soft delete via deleted_at on all core tables
- Audit columns: created_at, updated_at, created_by, updated_by
- Full-text search via PostgreSQL tsvector columns
- All timestamps stored in UTC

---

## Core Tables

### users
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| email | VARCHAR(255) | Unique |
| full_name | VARCHAR(255) | |
| role | ENUM | admin, manager, csm, readonly |
| azure_oid | VARCHAR(255) | Microsoft Entra Object ID |
| avatar_url | TEXT | |
| is_active | BOOLEAN | |
| last_login_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | Soft delete |

---

### clients
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | VARCHAR(255) | |
| trading_name | VARCHAR(255) | |
| registration_number | VARCHAR(100) | |
| industry | VARCHAR(100) | |
| website | TEXT | |
| production_url | TEXT | |
| uat_url | TEXT | |
| staging_url | TEXT | |
| health_score | INTEGER | 0–100 |
| health_status | ENUM | active, steady, quiet, at_risk |
| assigned_csm_id | UUID FK users | |
| teams_channel_url | TEXT | |
| sharepoint_url | TEXT | |
| onedrive_folder_url | TEXT | |
| notes | TEXT | |
| search_vector | TSVECTOR | Full-text search |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

---

### contacts
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| client_id | UUID FK clients | |
| first_name | VARCHAR(100) | |
| last_name | VARCHAR(100) | |
| email | VARCHAR(255) | |
| phone | VARCHAR(50) | |
| job_title | VARCHAR(150) | |
| is_primary | BOOLEAN | |
| is_decision_maker | BOOLEAN | |
| linkedin_url | TEXT | |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

---

### projects
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| client_id | UUID FK clients | |
| name | VARCHAR(255) | |
| description | TEXT | |
| status | ENUM | draft, active, on_hold, completed, cancelled |
| type | ENUM | new_build, enhancement, support, campaign, annual_recurring |
| priority | ENUM | low, medium, high, critical |
| start_date | DATE | |
| target_date | DATE | |
| completed_date | DATE | |
| assigned_csm_id | UUID FK users | |
| github_repo_url | TEXT | |
| github_epic_url | TEXT | |
| journey_url | TEXT | |
| reused_from_project_id | UUID FK projects | Self-referential |
| reuse_score | INTEGER | 0–100 estimated reuse |
| search_vector | TSVECTOR | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

---

### communications
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| client_id | UUID FK clients | |
| project_id | UUID FK projects | Nullable |
| type | ENUM | email, teams_meeting, teams_chat, phone_call, note |
| subject | TEXT | |
| body | TEXT | |
| summary | TEXT | AI-generated summary |
| direction | ENUM | inbound, outbound, internal |
| sender_email | VARCHAR(255) | |
| received_at | TIMESTAMPTZ | |
| outlook_message_id | TEXT | Graph reference |
| teams_meeting_id | TEXT | Graph reference |
| action_required | BOOLEAN | |
| action_status | ENUM | pending, in_progress, completed, dismissed |
| search_vector | TSVECTOR | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

---

### attachments
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| communication_id | UUID FK communications | Nullable |
| project_id | UUID FK projects | Nullable |
| document_id | UUID FK documents | Nullable |
| file_name | VARCHAR(255) | |
| file_type | VARCHAR(50) | |
| file_size_bytes | INTEGER | |
| storage_url | TEXT | |
| onedrive_item_id | TEXT | Graph reference |
| ai_parsed | BOOLEAN | |
| ai_summary | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

### documents
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| client_id | UUID FK clients | |
| project_id | UUID FK projects | Nullable |
| type | ENUM | quote, sow, poc, proposal, contract, template |
| title | VARCHAR(255) | |
| version | VARCHAR(20) | |
| status | ENUM | draft, review, approved, sent, accepted, rejected, superseded |
| content_json | JSONB | Structured document content |
| pdf_url | TEXT | |
| docx_url | TEXT | |
| total_value | NUMERIC(12,2) | |
| currency | VARCHAR(3) | Default ZAR |
| valid_until | DATE | |
| signed_at | TIMESTAMPTZ | |
| created_by | UUID FK users | |
| approved_by | UUID FK users | |
| search_vector | TSVECTOR | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

---

### requirements
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| client_id | UUID FK clients | |
| project_id | UUID FK projects | Nullable |
| communication_id | UUID FK communications | Source communication |
| type | ENUM | feature, bug, enhancement, support |
| title | VARCHAR(255) | |
| description | TEXT | |
| business_reason | TEXT | |
| priority | ENUM | low, medium, high, critical |
| status | ENUM | draft, reviewed, approved, exported, rejected |
| requested_by_contact_id | UUID FK contacts | |
| ai_generated | BOOLEAN | |
| reviewed_by | UUID FK users | |
| reviewed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

---

### user_stories
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| requirement_id | UUID FK requirements | |
| title | VARCHAR(255) | |
| as_a | VARCHAR(255) | Persona |
| i_want | TEXT | Goal |
| so_that | TEXT | Benefit |
| acceptance_criteria | JSONB | Array of criteria |
| story_points | INTEGER | |
| ai_generated | BOOLEAN | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

### developer_tasks
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| requirement_id | UUID FK requirements | |
| user_story_id | UUID FK user_stories | Nullable |
| category | ENUM | backend, frontend, testing, devops, design |
| title | VARCHAR(255) | |
| description | TEXT | |
| estimated_hours | DECIMAL(5,2) | |
| priority | ENUM | low, medium, high, critical |
| ai_generated | BOOLEAN | |
| exported_at | TIMESTAMPTZ | |
| export_reference | TEXT | External ticket ref |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

### customer_health_logs
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| client_id | UUID FK clients | |
| health_score | INTEGER | |
| health_status | ENUM | active, steady, quiet, at_risk |
| last_email_at | TIMESTAMPTZ | |
| last_meeting_at | TIMESTAMPTZ | |
| days_since_contact | INTEGER | |
| active_projects_count | INTEGER | |
| completed_projects_count | INTEGER | |
| open_actions_count | INTEGER | |
| ai_recommendation | TEXT | |
| recorded_at | TIMESTAMPTZ | |

---

### project_assets
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| project_id | UUID FK projects | |
| asset_type | ENUM | journey_url, import_template, email_template, sms_template, test_cases, branding, other |
| label | VARCHAR(255) | |
| url | TEXT | |
| file_name | VARCHAR(255) | |
| storage_url | TEXT | |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

### milestones
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| project_id | UUID FK projects | |
| title | VARCHAR(255) | |
| description | TEXT | |
| due_date | DATE | |
| completed_at | TIMESTAMPTZ | |
| status | ENUM | pending, in_progress, completed, missed |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

### follow_ups
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| client_id | UUID FK clients | |
| project_id | UUID FK projects | Nullable |
| communication_id | UUID FK communications | Nullable |
| assigned_to | UUID FK users | |
| title | VARCHAR(255) | |
| description | TEXT | |
| due_date | DATE | |
| priority | ENUM | low, medium, high |
| status | ENUM | pending, completed, dismissed, snoozed |
| completed_at | TIMESTAMPTZ | |
| ai_suggested | BOOLEAN | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

### knowledge_base
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| client_id | UUID FK clients | |
| title | VARCHAR(255) | |
| content | TEXT | |
| tags | TEXT[] | |
| source_type | ENUM | project, communication, document, manual |
| source_id | UUID | Polymorphic reference |
| embedding_vector | VECTOR(1536) | pgvector for similarity search |
| search_vector | TSVECTOR | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

## Key Relationships

- clients 1:N contacts
- clients 1:N projects
- clients 1:N communications
- clients 1:N documents
- projects 1:N requirements
- requirements 1:N user_stories
- requirements 1:N developer_tasks
- communications 1:N attachments
- projects 1:N project_assets
- projects 1:N milestones
- clients 1:N follow_ups
- clients 1:N customer_health_logs
- projects self-referential via reused_from_project_id
