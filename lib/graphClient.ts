const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

async function graphFetch(endpoint: string, accessToken: string, options: RequestInit = {}) {
  const res = await fetch(`${GRAPH_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Graph API error ${res.status}: ${errText}`);
  }
  return res.json();
}

export interface GraphEmail {
  id: string;
  subject: string;
  bodyPreview: string;
  from: { emailAddress: { name: string; address: string } };
  receivedDateTime: string;
  isRead: boolean;
  webLink: string;
}

export interface GraphEvent {
  id: string;
  subject: string;
  start: { dateTime: string };
  end: { dateTime: string };
  organizer: { emailAddress: { name: string; address: string } };
  onlineMeeting?: { joinUrl: string };
  bodyPreview: string;
}

export async function getRecentEmails(accessToken: string, top = 10): Promise<GraphEmail[]> {
  const data = await graphFetch(
    `/me/messages?$top=${top}&$orderby=receivedDateTime desc&$select=id,subject,bodyPreview,from,receivedDateTime,isRead,webLink`,
    accessToken
  );
  return data.value || [];
}

export async function getTodayEvents(accessToken: string): Promise<GraphEvent[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const data = await graphFetch(
    `/me/calendarview?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}&$select=id,subject,start,end,organizer,onlineMeeting,bodyPreview&$orderby=start/dateTime`,
    accessToken
  );
  return data.value || [];
}

export async function getUserProfile(accessToken: string) {
  return graphFetch(`/me?$select=displayName,mail,jobTitle`, accessToken);
}

export async function sendEmail(accessToken: string, to: string, subject: string, body: string) {
  return graphFetch(`/me/sendMail`, accessToken, {
    method: "POST",
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: "Text", content: body },
        toRecipients: [{ emailAddress: { address: to } }],
      },
    }),
  });
}
