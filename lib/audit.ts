import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { sql } from "@/lib/db";

/**
 * Writes a real entry to the existing audit_log table. Fails silently -
 * an audit entry should never be the thing that breaks the actual action
 * it's describing.
 */
export async function logAudit(
  req: NextRequest,
  action: string,
  entityType: string,
  entityId: string | null,
  entityName: string | null,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    await sql(
      `INSERT INTO audit_log (action, entity_type, entity_id, entity_name, user_name, user_email, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        action, entityType, entityId, entityName,
        token?.name || "Jonathan", token?.email || null,
        details ? JSON.stringify(details) : null,
      ]
    );
  } catch (e) {
    console.error("logAudit failed:", e);
  }
}
