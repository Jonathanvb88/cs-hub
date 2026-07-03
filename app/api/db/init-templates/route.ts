import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS document_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type VARCHAR(20) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        content_json JSONB DEFAULT '{}',
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    await sql(`CREATE INDEX IF NOT EXISTS idx_templates_type ON document_templates(type)`);

    // Seed a few starter templates if none exist
    const existing = await sql(`SELECT COUNT(*) as count FROM document_templates WHERE deleted_at IS NULL`);
    if (Number(existing[0].count) === 0) {
      await sql(
        `INSERT INTO document_templates (type, name, description, content_json) VALUES
        ('quote', 'Standard Project Quote', 'Default quote structure: discovery, development, testing, deployment', $1),
        ('quote', 'Retainer / Ongoing Support', 'Monthly retainer quote with hourly rate line items', $2),
        ('sow', 'Standard Software Delivery SOW', 'Full SOW with deliverables, milestones, assumptions, exclusions', $3),
        ('sow', 'Annual Campaign SOW', 'Recurring campaign SOW structure based on prior year template', $4),
        ('poc', 'Standard POC', 'Proof of concept with success criteria and resource plan', $5)`,
        [
          JSON.stringify({ items: [
            { id: "1", description: "Discovery & Requirements", qty: 1, unit: "project", rate: 15000 },
            { id: "2", description: "Development", qty: 1, unit: "project", rate: 45000 },
            { id: "3", description: "Testing & QA", qty: 1, unit: "project", rate: 10000 },
            { id: "4", description: "Deployment & Handover", qty: 1, unit: "project", rate: 5000 },
          ], notes: "This quote is valid for 30 days from the date of issue. Work will commence upon written acceptance and receipt of deposit.", includeVat: true }),
          JSON.stringify({ items: [
            { id: "1", description: "Monthly Retainer — Support & Maintenance", qty: 1, unit: "month", rate: 12000 },
            { id: "2", description: "Ad-hoc Development (per hour)", qty: 10, unit: "hour", rate: 950 },
          ], notes: "This retainer renews monthly. Unused ad-hoc hours do not roll over.", includeVat: true }),
          JSON.stringify({
            scope: "This Statement of Work covers the design, development, testing and deployment of the agreed solution as outlined in the associated quote and discovery sessions.",
            deliverables: [
              { id: "1", title: "Discovery & Requirements Sign-off", description: "Documented requirements signed off by client.", milestone: "Week 1" },
              { id: "2", title: "Development Complete", description: "All agreed features built and unit tested.", milestone: "Week 4" },
              { id: "3", title: "UAT Complete", description: "Client testing completed and sign-off received.", milestone: "Week 5" },
              { id: "4", title: "Production Deployment", description: "Solution deployed to production environment.", milestone: "Week 6" },
            ],
            assumptions: [
              { id: "1", text: "Client will provide timely feedback within 48 hours of each review." },
              { id: "2", text: "Client will supply all branding assets, content and data required for the solution." },
            ],
            paymentTerms: "50% deposit upon acceptance. 50% balance upon go-live.",
          }),
          JSON.stringify({
            scope: "This Statement of Work covers the annual recurring campaign, reusing prior year assets where applicable and updating creative, copy, and technical integrations as required.",
            deliverables: [
              { id: "1", title: "Campaign Brief Sign-off", description: "Confirmed scope and objectives for this year's campaign.", milestone: "Week 1" },
              { id: "2", title: "Asset Refresh Complete", description: "Updated creative, copy and branding applied to reused journey.", milestone: "Week 2" },
              { id: "3", title: "Campaign Live", description: "Campaign deployed and monitored for first 48 hours.", milestone: "Week 3" },
            ],
            assumptions: [
              { id: "1", text: "Prior year journey and infrastructure remain reusable without major rebuild." },
            ],
            paymentTerms: "Full payment due 14 days before campaign launch.",
          }),
          JSON.stringify({
            objective: "Demonstrate that the proposed solution meets the client's core requirements within a controlled environment before full development commences.",
            duration: "2 weeks",
            resources: "1 x Developer, 1 x CSM",
            criteria: [
              { id: "1", criteria: "Core user journey completes end-to-end", measure: "User can complete the full workflow without errors" },
              { id: "2", criteria: "Performance meets baseline", measure: "Page load under 3 seconds on standard connection" },
            ],
          }),
        ]
      );
    }

    return NextResponse.json({ success: true, message: "Templates table initialized" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
