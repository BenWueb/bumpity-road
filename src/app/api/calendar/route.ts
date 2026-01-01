import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";
export const revalidate = 60;

function getServiceAccountCreds() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    const parsed = JSON.parse(json) as {
      client_email?: string;
      private_key?: string;
    };
    return {
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    };
  }

  return {
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  };
}

function normalizePrivateKey(key?: string) {
  if (!key) return key;
  // When stored in env vars, newlines are often escaped.
  return key.replace(/\\n/g, "\n");
}

export async function GET(req: Request) {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const { clientEmail, privateKey } = getServiceAccountCreds();

    if (!calendarId) {
      return NextResponse.json(
        { error: "Missing GOOGLE_CALENDAR_ID" },
        { status: 500 }
      );
    }
    if (!clientEmail || !privateKey) {
      return NextResponse.json(
        {
          error:
            "Missing Google service account credentials (set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)",
        },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const maxResultsRaw = url.searchParams.get("maxResults");
    const maxResults = Math.min(
      Math.max(Number(maxResultsRaw ?? "10") || 10, 1),
      25
    );

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: normalizePrivateKey(privateKey),
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    const calendar = google.calendar({ version: "v3", auth });
    const now = new Date();

    const res = await calendar.events.list({
      calendarId,
      timeMin: now.toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events =
      res.data.items?.map((e) => ({
        id: e.id ?? "",
        summary: e.summary ?? "(No title)",
        start: e.start?.dateTime ?? e.start?.date ?? null,
        end: e.end?.dateTime ?? e.end?.date ?? null,
        location: e.location ?? null,
        htmlLink: e.htmlLink ?? null,
      })) ?? [];

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}


