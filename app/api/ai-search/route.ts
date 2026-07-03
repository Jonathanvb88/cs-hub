import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query?.trim()) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        answer: "AI search is not yet configured. Please add GEMINI_API_KEY to Vercel environment variables.",
        results: [],
        pending: true,
      });
    }

    // Fetch real data from the database to give Gemini context
    const [clients, followups, documents, communications, projects] = await Promise.all([
      sql(`SELECT id, name, industry, health_status, health_score FROM clients WHERE deleted_at IS NULL LIMIT 50`),
      sql(`SELECT f.id, f.title, f.status, f.due_date, c.name as client_name FROM follow_ups f LEFT JOIN clients c ON f.client_id = c.id WHERE f.deleted_at IS NULL LIMIT 50`),
      sql(`SELECT d.id, d.title, d.type, d.status, d.total_value, c.name as client_name FROM documents d LEFT JOIN clients c ON d.client_id = c.id WHERE d.deleted_at IS NULL LIMIT 50`),
      sql(`SELECT cm.id, cm.subject, cm.type, cm.direction, cm.action_required, c.name as client_name FROM communications cm LEFT JOIN clients c ON cm.client_id = c.id WHERE cm.deleted_at IS NULL LIMIT 30`),
      sql(`SELECT p.id, p.name, p.status, c.name as client_name FROM projects p LEFT JOIN clients c ON p.client_id = c.id WHERE p.deleted_at IS NULL LIMIT 30`),
    ]);

    // Build context for Gemini
    const context = `
You are an AI assistant for CS Hub, a Client Success platform for URUP Connect.
Answer the user's question using ONLY the data provided below. Be concise and direct.
Format your response clearly. If you list items, use bullet points.
If no relevant data exists, say so clearly.

CLIENTS (${clients.length}):
${JSON.stringify(clients, null, 2)}

FOLLOW-UPS (${followups.length}):
${JSON.stringify(followups, null, 2)}

DOCUMENTS (${documents.length}):
${JSON.stringify(documents, null, 2)}

COMMUNICATIONS (${communications.length}):
${JSON.stringify(communications, null, 2)}

PROJECTS (${projects.length}):
${JSON.stringify(projects, null, 2)}

Current date: ${new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
`;

    // Call Gemini API
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: context },
                { text: `\nUser question: ${query}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return NextResponse.json({ error: `Gemini API error: ${err}` }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";

    return NextResponse.json({ answer, query });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
