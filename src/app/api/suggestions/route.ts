import { NextResponse } from "next/server";

// Simple in-memory rate limiting map: IP -> lastTimestamp
const rateLimitMap = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const now = Date.now();
    const lastTime = rateLimitMap.get(ip) || 0;
    const COOLDOWN_MS = 20 * 1000; // 20 seconds

    if (now - lastTime < COOLDOWN_MS) {
      const secondsLeft = Math.ceil((COOLDOWN_MS - (now - lastTime)) / 1000);
      return NextResponse.json(
        { error: `Please wait ${secondsLeft} seconds before sending another suggestion.` },
        { status: 429 }
      );
    }

    const { suggestion, username } = await req.json();

    if (!suggestion || typeof suggestion !== "string" || !suggestion.trim()) {
      return NextResponse.json({ error: "Suggestion message cannot be empty." }, { status: 400 });
    }

    // Safety check for ping attempts (@everyone or @here)
    if (/@everyone|@here/i.test(suggestion)) {
      return NextResponse.json(
        { error: "Warning: Pinging @everyone or @here is strictly forbidden!" },
        { status: 400 }
      );
    }

    // Webhook URL kept securely on server side
    const webhookUrl =
      process.env.DISCORD_SUGGESTION_WEBHOOK ||
      "https://discord.com/api/webhooks/1534245601460355236/ePwHYRYdet1__VBhjjetM1dKm7mQVHGGZPV0Krdi9C5Y_zGqj9__gPho3B1d-ZRAoZeC";

    // Send payload to Discord
    const discordPayload = {
      username: "SyncAuth Suggestions Bot",
      avatar_url: "https://syncauth-eight.vercel.app/syncauthlogo.png",
      embeds: [
        {
          title: "💡 New SyncAuth Suggestion",
          description: suggestion.trim(),
          color: 0x6366f1, // Indigo match
          fields: [
            {
              name: "Submitted By",
              value: username?.trim() || "Anonymous User",
              inline: true,
            },
            {
              name: "Timestamp",
              value: new Date().toISOString(),
              inline: true,
            },
          ],
          footer: {
            text: "SyncAuth Feedback System",
          },
        },
      ],
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordPayload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Discord Webhook Error:", errText);
      return NextResponse.json({ error: "Failed to dispatch suggestion to Discord." }, { status: 500 });
    }

    // Record rate limit timestamp upon successful dispatch
    rateLimitMap.set(ip, now);

    return NextResponse.json({ success: true, message: "Thank you! Your suggestion has been sent." });
  } catch (error) {
    console.error("Suggestion handler error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
