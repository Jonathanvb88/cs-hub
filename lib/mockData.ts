export const mockClients = [
  {
    id: "1",
    name: "ABC Retail Group",
    industry: "Retail",
    healthScore: 87,
    healthStatus: "active",
    assignedCsm: "Jonathan",
    lastContact: "2 days ago",
    activeProjects: 3,
    productionUrl: "https://app.abcretail.co.za",
    uatUrl: "https://uat.abcretail.co.za",
    website: "https://abcretail.co.za",
    contacts: [
      { id: "c1", name: "Sarah Mkhize", email: "sarah@abcretail.co.za", title: "IT Manager", isPrimary: true },
      { id: "c2", name: "David Nkosi", email: "d.nkosi@abcretail.co.za", title: "CTO", isPrimary: false },
    ],
    notes: "Key enterprise client. Prefers morning calls. Decision maker is David Nkosi.",
    teamsChannel: "https://teams.microsoft.com/abc-retail",
    clientSince: "2022-03-15",
  },
  {
    id: "2",
    name: "MedPharm SA",
    industry: "Pharmaceuticals",
    healthScore: 62,
    healthStatus: "steady",
    assignedCsm: "Jonathan",
    lastContact: "8 days ago",
    activeProjects: 1,
    productionUrl: "https://portal.medpharm.co.za",
    uatUrl: "https://uat.medpharm.co.za",
    website: "https://medpharm.co.za",
    contacts: [
      { id: "c3", name: "Priya Naidoo", email: "p.naidoo@medpharm.co.za", title: "Head of IT", isPrimary: true },
    ],
    notes: "POPIA compliance is a priority for this client. Requires formal sign-off on all changes.",
    teamsChannel: "",
    clientSince: "2023-01-10",
  },
  {
    id: "3",
    name: "FastFreight Logistics",
    industry: "Logistics",
    healthScore: 38,
    healthStatus: "at_risk",
    assignedCsm: "Jonathan",
    lastContact: "34 days ago",
    activeProjects: 0,
    productionUrl: "https://track.fastfreight.co.za",
    uatUrl: "",
    website: "https://fastfreight.co.za",
    contacts: [
      { id: "c4", name: "Mike van der Berg", email: "mike@fastfreight.co.za", title: "Operations Manager", isPrimary: true },
    ],
    notes: "No activity since Q1. At risk of churn. Needs a check-in call.",
    teamsChannel: "",
    clientSince: "2021-11-20",
  },
  {
    id: "4",
    name: "Apex Bank Limited",
    industry: "Banking",
    healthScore: 91,
    healthStatus: "active",
    assignedCsm: "Jonathan",
    lastContact: "Yesterday",
    activeProjects: 5,
    productionUrl: "https://digital.apexbank.co.za",
    uatUrl: "https://uat.apexbank.co.za",
    website: "https://apexbank.co.za",
    contacts: [
      { id: "c5", name: "Zanele Dlamini", email: "z.dlamini@apexbank.co.za", title: "Digital Transformation Lead", isPrimary: true },
      { id: "c6", name: "Thabo Molefe", email: "t.molefe@apexbank.co.za", title: "IT Director", isPrimary: false },
    ],
    notes: "Highest revenue client. Monthly steering committee. Strict SLA requirements.",
    teamsChannel: "https://teams.microsoft.com/apex-bank",
    clientSince: "2020-06-01",
  },
  {
    id: "5",
    name: "ConnectTel",
    industry: "Telecommunications",
    healthScore: 54,
    healthStatus: "quiet",
    assignedCsm: "Jonathan",
    lastContact: "18 days ago",
    activeProjects: 1,
    productionUrl: "https://selfservice.connecttel.co.za",
    uatUrl: "https://uat.connecttel.co.za",
    website: "https://connecttel.co.za",
    contacts: [
      { id: "c7", name: "Lungelo Dube", email: "l.dube@connecttel.co.za", title: "Product Manager", isPrimary: true },
    ],
    notes: "Engagement has dropped since Q4. Project is live but no new requests.",
    teamsChannel: "",
    clientSince: "2022-09-05",
  },
];

export const mockEmails = [
  {
    id: "e1",
    clientId: "1",
    clientName: "ABC Retail Group",
    from: "sarah@abcretail.co.za",
    subject: "Annual Black Friday Campaign — Ready to Start",
    preview: "Hi Jonathan, we would like to kick off planning for this year's Black Friday campaign...",
    receivedAt: "Today, 09:14",
    priority: "high",
    actionStatus: "pending",
  },
  {
    id: "e2",
    clientId: "4",
    clientName: "Apex Bank Limited",
    from: "z.dlamini@apexbank.co.za",
    subject: "Dashboard Redesign — Feedback on POC",
    preview: "Team reviewed the POC yesterday. Overall positive but a few changes needed on the...",
    receivedAt: "Today, 08:30",
    priority: "high",
    actionStatus: "pending",
  },
  {
    id: "e3",
    clientId: "2",
    clientName: "MedPharm SA",
    from: "p.naidoo@medpharm.co.za",
    subject: "Re: POPIA Compliance Module — Sign-off",
    preview: "Please find attached the signed approval document. You may proceed with deployment...",
    receivedAt: "Yesterday, 16:45",
    priority: "medium",
    actionStatus: "pending",
  },
  {
    id: "e4",
    clientId: "5",
    clientName: "ConnectTel",
    from: "l.dube@connecttel.co.za",
    subject: "Quick question on the self-service portal",
    preview: "Hi, just wanted to check — is it possible to add a chat widget to the portal?",
    receivedAt: "Yesterday, 11:20",
    priority: "low",
    actionStatus: "pending",
  },
];

export const mockFollowUps = [
  { id: "f1", clientName: "FastFreight Logistics", title: "Schedule check-in call", dueDate: "Today", priority: "high", status: "pending" },
  { id: "f2", clientName: "ABC Retail Group", title: "Send Black Friday SOW draft", dueDate: "Tomorrow", priority: "high", status: "pending" },
  { id: "f3", clientName: "ConnectTel", title: "Follow up on chat widget request", dueDate: "Thu 3 Jul", priority: "medium", status: "pending" },
  { id: "f4", clientName: "Apex Bank Limited", title: "Share updated dashboard wireframes", dueDate: "Fri 4 Jul", priority: "medium", status: "pending" },
];

export const mockMeetings = [
  { id: "m1", clientName: "Apex Bank Limited", title: "Monthly Steering Committee", time: "10:00 — 11:00", platform: "Teams" },
  { id: "m2", clientName: "MedPharm SA", title: "Compliance Module Handover", time: "14:00 — 15:00", platform: "Teams" },
];

export const mockProjects = [
  { id: "p1", clientId: "1", name: "Black Friday Campaign 2026", status: "active", type: "annual_recurring", priority: "high", targetDate: "2026-10-31" },
  { id: "p2", clientId: "1", name: "Loyalty Programme Enhancement", status: "active", type: "enhancement", priority: "medium", targetDate: "2026-08-15" },
  { id: "p3", clientId: "4", name: "Digital Banking Dashboard v3", status: "active", type: "new_build", priority: "high", targetDate: "2026-09-30" },
  { id: "p4", clientId: "4", name: "Mobile App Phase 2", status: "active", type: "enhancement", priority: "high", targetDate: "2026-11-30" },
  { id: "p5", clientId: "2", name: "POPIA Compliance Module", status: "completed", type: "new_build", priority: "high", targetDate: "2026-06-30" },
  { id: "p6", clientId: "5", name: "Self-Service Portal", status: "active", type: "new_build", priority: "medium", targetDate: "2026-07-31" },
];

export const mockTimeline = [
  { id: "t1", type: "email", title: "Annual Black Friday Campaign request received", date: "Today, 09:14", icon: "email" },
  { id: "t2", type: "meeting", title: "Quarterly Business Review", date: "28 Jun 2026", icon: "meeting" },
  { id: "t3", type: "document", title: "SOW signed — Loyalty Programme Enhancement", date: "20 Jun 2026", icon: "document" },
  { id: "t4", type: "project", title: "Black Friday Campaign 2025 — Completed", date: "5 Dec 2025", icon: "project" },
  { id: "t5", type: "email", title: "Feature request: bulk import improvements", date: "1 Nov 2025", icon: "email" },
];

export function getHealthColor(status: string) {
  switch (status) {
    case "active": return "#10b981";
    case "steady": return "#3b82f6";
    case "quiet": return "#f59e0b";
    case "at_risk": return "#ef4444";
    default: return "#94a3b8";
  }
}

export function getHealthLabel(status: string) {
  switch (status) {
    case "active": return "Active";
    case "steady": return "Steady";
    case "quiet": return "Quiet";
    case "at_risk": return "At Risk";
    default: return "Unknown";
  }
}

export function getHealthBadgeClass(status: string) {
  switch (status) {
    case "active": return "badge badge-green";
    case "steady": return "badge badge-blue";
    case "quiet": return "badge badge-amber";
    case "at_risk": return "badge badge-red";
    default: return "badge badge-gray";
  }
}
