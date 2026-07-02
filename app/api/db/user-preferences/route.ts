import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

async function ensureTable() {
  await sql(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_key VARCHAR(100) UNIQUE NOT NULL DEFAULT 'jonathan',
      email_notifications BOOLEAN DEFAULT true,
      followup_reminders BOOLEAN DEFAULT true,
      health_alerts BOOLEAN DEFAULT true,
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `);
  const existing = await sql(`SELECT COUNT(*) as count FROM user_preferences`);
  if (Number(existing[0].count) === 0) {
    await sql(`INSERT INTO user_preferences (user_key) VALUES ('jonathan')`);
  }
}

export async function GET() {
  try {
    await ensureTable();
    const rows = await sql(`SELECT * FROM user_preferences WHERE user_key = 'jonathan'`);
    return NextResponse.json({ preferences: rows[0] || {} });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureTable();
    const body = await req.json();
    const { emailNotifications, followupReminders, healthAlerts } = body;
    const rows = await sql(
      `INSERT INTO user_preferences (user_key, email_notifications, followup_reminders, health_alerts)
       VALUES ('jonathan', $1, $2, $3)
       ON CONFLICT (user_key) DO UPDATE SET
         email_notifications = $1,
         followup_reminders = $2,
         health_alerts = $3,
         updated_at = now()
       RETURNING *`,
      [emailNotifications, followupReminders, healthAlerts]
    );
    return NextResponse.json({ preferences: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
