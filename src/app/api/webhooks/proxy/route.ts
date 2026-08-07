import { decryptWebhook } from "@/lib/crypto";
export const runtime = "edge";

export const dynamic = "force-dynamic";

async function handle(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const w = searchParams.get("w");
    if (!w) {
      return new Response("Missing webhook parameter", { status: 400 });
    }

    let webhookUrl: string;
    try {
      webhookUrl = decryptWebhook(w);
    } catch {
      return new Response("Invalid webhook parameter", { status: 400 });
    }

    if (!webhookUrl.startsWith("https://discord.com/api/webhooks/") && !webhookUrl.startsWith("https://discordapp.com/api/webhooks/")) {
      return new Response("Invalid webhook destination", { status: 400 });
    }

    const method = req.method;
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== "host" &&
        lowerKey !== "connection" &&
        lowerKey !== "content-length" &&
        lowerKey !== "accept-encoding"
      ) {
        headers[key] = value;
      }
    });

    const bodyText = method !== "GET" && method !== "HEAD" ? await req.text() : undefined;

    const res = await fetch(webhookUrl, {
      method,
      headers,
      body: bodyText,
    });

    const resText = await res.text();
    return new Response(resText, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "text/plain",
      },
    });
  } catch (e: any) {
    return new Response(e.message || "Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) { return handle(req); }
export async function POST(req: Request) { return handle(req); }
export async function PUT(req: Request) { return handle(req); }
export async function DELETE(req: Request) { return handle(req); }
