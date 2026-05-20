import { NextResponse } from "next/server";

/**
 * Mock send endpoint. In production this is where the Gmail API / Microsoft
 * Graph transport gets called with the rendered HTML. For the POC we just
 * log the payload, simulate quota tracking, and return a fake message id.
 *
 * Wiring the real Gmail API transport here is the next milestone — the
 * surface area of this route stays the same.
 */

// Naive in-memory per-process quota counter. Will reset on every dev reload.
let dailyCount = 0;
const DAILY_CAP = 2000; // simulate a Google Workspace account

export async function POST(req: Request) {
  const body = await req.json();
  const { template_id, subject, to, html } = body as {
    template_id?: string;
    subject?: string;
    to?: string;
    html?: string;
  };

  if (!to || !subject || !html) {
    return NextResponse.json(
      { error: "Missing required fields: to, subject, html" },
      { status: 400 }
    );
  }

  if (dailyCount >= DAILY_CAP) {
    return NextResponse.json(
      {
        error: "quota_exceeded",
        message: "Mock daily quota of 2000 reached. Resets at midnight."
      },
      { status: 429 }
    );
  }

  dailyCount += 1;

  // In a real implementation, hand off to GmailApiTransport / GraphTransport
  // here. For now: log to server console so you can inspect the final HTML.
  console.log("\n=========== MOCK SEND ===========");
  console.log("template_id:", template_id);
  console.log("to:", to);
  console.log("subject:", subject);
  console.log("html length:", html.length, "chars");
  console.log("---- HTML PREVIEW (first 500 chars) ----");
  console.log(html.slice(0, 500));
  console.log("=================================\n");

  return NextResponse.json({
    ok: true,
    provider: "mock-gmail-api",
    message_id: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    daily_quota_remaining: DAILY_CAP - dailyCount,
    sent_at: new Date().toISOString()
  });
}
