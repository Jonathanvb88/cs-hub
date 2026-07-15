import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

interface ClientRow {
  id: string;
  name: string;
  health_status: string;
  health_score: number;
  client_since: string | null;
  renewal_date: string | null;
}

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const clients = await sql(`SELECT id, name, health_status, health_score, client_since, renewal_date FROM clients WHERE deleted_at IS NULL`) as ClientRow[];
    const dismissed = await sql(`SELECT client_id, reminder_key FROM dismissed_reminders`) as { client_id: string; reminder_key: string }[];
    const isDismissed = (clientId: string, key: string) => dismissed.some(d => d.client_id === clientId && d.reminder_key === key);

    const milestones = [];
    const reminders = [];
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

    for (const client of clients) {
      const projects = await sql(
        `SELECT status, created_at FROM projects WHERE client_id = $1 AND deleted_at IS NULL`,
        [client.id]
      );
      const lastComm = await sql(
        `SELECT received_at FROM communications WHERE client_id = $1 AND deleted_at IS NULL ORDER BY received_at DESC LIMIT 1`,
        [client.id]
      );
      const primaryContact = await sql(
        `SELECT name FROM contacts WHERE client_id = $1 AND deleted_at IS NULL ORDER BY is_primary DESC LIMIT 1`,
        [client.id]
      );
      const contactName = primaryContact[0]?.name?.split(" ")[0] || client.name;

      // Milestone: first project ever
      if (projects.length === 1) {
        const key = "first_project";
        if (!isDismissed(client.id, key)) {
          milestones.push({
            clientId: client.id, clientName: client.name, key,
            title: "First Project Started",
            description: `${client.name}'s first project with us has just begun.`,
            actionLabel: "Send welcome note",
            color: "var(--accent-blue)",
            draft: `Hi ${contactName},\n\nExcited to be kicking off our first project together. We're committed to delivering great work and building a strong long-term partnership.\n\nPlease don't hesitate to reach out with any questions as we get moving.\n\nWarm regards,\nJonathan`,
          });
        }
      }

      // Milestone: large engagement (5+ active projects at once)
      const activeCount = projects.filter((p: any) => p.status === "active").length;
      if (activeCount >= 5) {
        const key = "large_engagement";
        if (!isDismissed(client.id, key)) {
          milestones.push({
            clientId: client.id, clientName: client.name, key,
            title: `${activeCount} Active Projects`,
            description: `${client.name} now has ${activeCount} projects running simultaneously - your highest engagement level with this client.`,
            actionLabel: "Send appreciation note",
            color: "var(--accent-green)",
            draft: `Hi ${contactName},\n\nI wanted to take a moment to say thank you for the continued trust you place in our team. With ${activeCount} active projects running concurrently, it's been a busy but rewarding partnership.\n\nWe're committed to delivering each one to a high standard. Looking forward to our next catch-up.\n\nWarm regards,\nJonathan`,
          });
        }
      }

      // Milestone: anniversary (within 7 days of client_since's month/day, year 1+)
      if (client.client_since) {
        const since = new Date(client.client_since);
        const years = today.getFullYear() - since.getFullYear();
        if (years >= 1) {
          const anniversaryThisYear = new Date(today.getFullYear(), since.getMonth(), since.getDate());
          const daysDiff = Math.abs((today.getTime() - anniversaryThisYear.getTime()) / 86400000);
          if (daysDiff <= 7) {
            const key = `anniversary_${today.getFullYear()}`;
            if (!isDismissed(client.id, key)) {
              milestones.push({
                clientId: client.id, clientName: client.name, key,
                title: `${years} Year${years > 1 ? "s" : ""} as a Client`,
                description: `${client.name} has been a client since ${since.toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}.`,
                actionLabel: "Send anniversary message",
                color: "var(--accent-blue)",
                draft: `Hi ${contactName},\n\nI can hardly believe it's been ${years} year${years > 1 ? "s" : ""} since we first started working together. Thank you for your trust and partnership - here's to many more years ahead.\n\nWarm regards,\nJonathan`,
              });
            }
          }
        }
      }

      // Reminder: quiet client (30+ days no contact) - keyed by month so it can re-trigger if it recurs later
      const daysSinceContact = lastComm.length > 0
        ? Math.floor((Date.now() - new Date(lastComm[0].received_at).getTime()) / 86400000)
        : null;
      if (daysSinceContact !== null && daysSinceContact >= 30) {
        const key = `quiet_${thisMonth}`;
        if (!isDismissed(client.id, key)) {
          reminders.push({
            clientId: client.id, clientName: client.name, key,
            reminder: `No contact in ${daysSinceContact} days. Risk of disengagement is rising.`,
            urgency: daysSinceContact >= 60 ? "critical" : "high",
          });
        }
      }

      // Reminder: renewal approaching within 60 days
      if (client.renewal_date) {
        const days = Math.floor((new Date(client.renewal_date).getTime() - Date.now()) / 86400000);
        if (days >= 0 && days <= 60) {
          const key = `renewal_${client.renewal_date}`;
          if (!isDismissed(client.id, key)) {
            reminders.push({
              clientId: client.id, clientName: client.name, key,
              reminder: `Renewal due in ${days} day${days !== 1 ? "s" : ""}. Time to start the conversation.`,
              urgency: days <= 14 ? "critical" : "medium",
            });
          }
        }
      }
    }

    return NextResponse.json({ milestones, reminders });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const { clientId, key } = await req.json();
    if (!clientId || !key) return NextResponse.json({ error: "clientId and key are required" }, { status: 400 });
    await sql(
      `INSERT INTO dismissed_reminders (client_id, reminder_key) VALUES ($1, $2)
       ON CONFLICT (client_id, reminder_key) DO NOTHING`,
      [clientId, key]
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
