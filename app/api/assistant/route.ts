import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

interface AssistantRequest {
  message: string;
  activeClientId?: string | null;
  activeClientName?: string | null;
}

async function gatherContext(activeClientId?: string | null) {
  const clients = await sql(`SELECT id, name, industry, health_score, health_status FROM clients WHERE deleted_at IS NULL`);
  const followUps = await sql(`SELECT title, client_name, due_date, priority, status FROM follow_ups WHERE deleted_at IS NULL AND status = 'pending' ORDER BY due_date ASC LIMIT 20`);
  const projects = await sql(`SELECT p.name, p.status, p.priority, c.name as client_name FROM projects p LEFT JOIN clients c ON p.client_id = c.id WHERE p.deleted_at IS NULL LIMIT 20`);
  const documents = await sql(`SELECT title, type, status, total_value, c.name as client_name FROM documents d LEFT JOIN clients c ON d.client_id = c.id WHERE d.deleted_at IS NULL ORDER BY d.created_at DESC LIMIT 10`);

  let activeClientDetail = null;
  if (activeClientId) {
    const rows = await sql(`SELECT * FROM clients WHERE id = $1`, [activeClientId]);
    activeClientDetail = rows[0] || null;
  }

  return { clients, followUps, projects, documents, activeClientDetail };
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body: AssistantRequest = await req.json();
    const { message, activeClientId, activeClientName } = body;

    const context = await gatherContext(activeClientId);

    const systemPrompt = `You are the CS Hub AI Assistant, embedded inside a Client Success platform used by a CSM at URUP Connect (South Africa). You help the user by answering questions about their real client data, and by drafting content (follow-ups, emails) for their review.

You have access to the user's REAL current data below. Always answer using this real data — never invent clients, numbers, or facts not present in it.

CURRENT DATA:
Clients: ${JSON.stringify(context.clients)}
Pending Follow-ups: ${JSON.stringify(context.followUps)}
Projects: ${JSON.stringify(context.projects)}
Recent Documents: ${JSON.stringify(context.documents)}
${activeClientId ? `Currently active client in the user's panel: ${JSON.stringify(context.activeClientDetail)}` : "No client is currently active in the user's panel."}

Respond ONLY with valid JSON. No preamble, no markdown, no code fences.

JSON structure:
{
  "responseType": "answer | draft_followup | draft_email | clarify",
  "message": "string — your conversational reply to show the user, written naturally",
  "draftFollowUp": {
    "title": "string",
    "clientName": "string",
    "dueDate": "YYYY-MM-DD or null",
    "priority": "high | medium | low"
  } or null,
  "draftEmail": {
    "to": "string — contact name or role if known, else empty",
    "clientName": "string",
    "subject": "string",
    "body": "string — full email body, professional South African business tone"
  } or null
}

Rules:
- responseType "answer" — for questions about data (counts, status, who/what/when). Set draftFollowUp and draftEmail to null.
- responseType "draft_followup" — when the user asks you to create/add/schedule a follow-up or reminder. Fill draftFollowUp, set draftEmail to null.
- responseType "draft_email" — when the user asks you to draft/write/compose an email. Fill draftEmail, set draftFollowUp to null.
- responseType "clarify" — only if the request is genuinely ambiguous (e.g. which client they mean when several could match). Ask ONE specific clarifying question in "message".
- If a client is active in the panel and the user's request is about "this client" or doesn't name one, use the active client.
- Keep "message" concise — 1 to 3 sentences for answers, a short framing sentence for drafts (the draft itself carries the detail).
- Never claim to have sent, saved, or created anything yourself — you only draft; the user reviews and saves.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || "";
    const clean = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      parsed = { responseType: "answer", message: rawText, draftFollowUp: null, draftEmail: null };
    }

    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
