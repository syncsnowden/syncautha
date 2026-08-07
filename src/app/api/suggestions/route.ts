import { NextResponse } from "next/server";
export const runtime = "edge";

// Global last sent timestamp to enforce 1 message per 20 seconds universally
let globalLastTimestamp = 0;

export async function POST(req: Request) {
  try {
    const now = Date.now();
    const COOLDOWN_MS = 20 * 1000; // 20 seconds

    if (now - globalLastTimestamp < COOLDOWN_MS) {
      const secondsLeft = Math.ceil((COOLDOWN_MS - (now - globalLastTimestamp)) / 1000);
      return NextResponse.json(
        { error: `Please wait ${secondsLeft} seconds. Suggestions are globally rate-limited.` },
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

    // Update the universal rate limit timestamp on success
    globalLastTimestamp = now;

    return NextResponse.json({ success: true, message: "Thank you! Your suggestion has been sent." });
  } catch (error) {
    console.error("Suggestion handler error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
