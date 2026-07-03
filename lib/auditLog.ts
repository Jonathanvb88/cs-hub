import { sql } from "@/lib/db";

export async function logAction(params: {
  action: string;
  entityType: string;
  entityId?: string | null;
  entityName?: string | null;
  userName?: string;
  userEmail?: string | null;
  details?: Record<string, unknown> | null;
}) {
  try {
    await sql(
      `INSERT INTO audit_log (action, entity_type, entity_id, entity_name, user_name, user_email, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        params.action,
        params.entityType,
        params.entityId || null,
        params.entityName || null,
        params.userName || "Jonathan",
        params.userEmail || null,
        params.details ? JSON.stringify(params.details) : null,
      ]
    );
  } catch {
    // Never block the main action if audit logging fails
  }
}
