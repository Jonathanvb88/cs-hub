import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        role VARCHAR(50) DEFAULT 'csm',
        avatar_initials VARCHAR(4),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Seed Jonathan as the first user if table is empty
    const existing = await sql(`SELECT COUNT(*) as count FROM users`);
    if (Number(existing[0].count) === 0) {
      await sql(
        `INSERT INTO users (name, email, role, avatar_initials) VALUES ($1, $2, $3, $4)`,
        ["Jonathan", "jonathanvb@urupconnect.com", "csm", "JV"]
      );
    }

    // Add assignment columns (safe re-run with IF NOT EXISTS)
    await sql(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS assigned_user_id UUID REFERENCES users(id)`);
    await sql(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS assigned_user_id UUID REFERENCES users(id)`);
    await sql(`ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS assigned_user_id UUID REFERENCES users(id)`);

    return NextResponse.json({ success: true, message: "Users table and assignment columns added" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
