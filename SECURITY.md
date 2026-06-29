# Security

## CS Hub — Security Model

---

## Authentication

- Microsoft Entra ID (Azure AD) via OAuth 2.0 and OIDC
- JWT access tokens validated on every API request
- Token expiry: 1 hour access token, 24 hour refresh token
- No passwords stored in CS Hub

---

## Authorisation — Role-Based Access Control

| Permission | Admin | Manager | CSM | Read-Only |
|---|---|---|---|---|
| View all clients | Yes | Yes | Own only | Yes |
| Create clients | Yes | Yes | Yes | No |
| Delete clients | Yes | Yes | No | No |
| View all projects | Yes | Yes | Own only | Yes |
| Create documents | Yes | Yes | Yes | No |
| Approve documents | Yes | Yes | No | No |
| Export tickets | Yes | Yes | Yes | No |
| View health dashboard | Yes | Yes | Yes | Yes |
| Manage users | Yes | No | No | No |
| Manage templates | Yes | Yes | No | No |
| View audit log | Yes | Yes | No | No |

---

## Data Protection

- All data encrypted at rest (AES-256)
- All data encrypted in transit (TLS 1.3)
- Database credentials stored in Vercel environment variables only
- No secrets committed to GitHub

---

## POPIA Compliance (South Africa)

- Personal information collected only for defined business purposes
- Data subjects can request deletion of their personal information
- Soft delete implemented on all tables containing personal data
- Data processing activities logged in audit trail
- No personal data shared with third parties beyond OpenAI API (anonymised where possible)

---

## Audit Trail

All create, update, and delete operations on core tables log:
- User ID
- Action type
- Timestamp
- Previous values (for updates)
- IP address

---

## API Security

- Rate limiting: 100 requests per minute per user
- Input validation via Pydantic on all endpoints
- SQL injection prevention via SQLAlchemy ORM
- XSS prevention via Next.js output encoding
- CORS restricted to approved origins

---

## AI Security

- Customer data sent to OpenAI API is subject to OpenAI data processing terms
- Sensitive fields (contact details, financial figures) should be anonymised before sending to AI where possible
- AI outputs are always reviewed by a human before being saved or exported
- No AI output is acted on automatically without user approval

---

## Incident Response

- Security incidents reported to the system administrator immediately
- Vercel deployment logs retained for 30 days
- Database backups taken daily, retained for 30 days
