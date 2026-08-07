import { getScript, getProject, hashHwid, logExecution } from "@/lib/pastefy";
export const runtime = "edge";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { hwid, username, executor, jobid } = body;
    
    if (!hwid) return Response.json({ error: "Missing hwid" }, { status: 400 });

    const script = await getScript(id);
    if (!script) return Response.json({ error: "Not found" }, { status: 404 });
    const project = await getProject(script.project_id);
    if (!project) return Response.json({ error: "Project not found" }, { status: 404 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
               req.headers.get("x-real-ip") || 
               "127.0.0.1";
               
    const hashed = hashHwid(hwid);

    // Log execution
    await logExecution(script.project_id, id, {
      hwid: hashed,
      key: "pending",
      ip,
      username: username || "RobloxPlayer",
      executor: executor || "Unknown"
    }).catch(err => console.error("[SyncAuth] Failed to log execution:", err));

    // Trigger script-specific Discord logs webhook if configured
    if (script.logs_webhook_enabled && script.logs_webhook && script.logs_webhook.startsWith("https://discord.com/api/webhooks/")) {
      const hookUrl = script.logs_webhook;
      const now = new Date();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (() => {
        const host = req.headers.get("host") || "syncauth-eight.vercel.app";
        return `https://${host}`;
      })();

      const fields: { name: string; value: string; inline: boolean }[] = [];

      if (script.log_username ?? true) {
        fields.push({ name: "Username", value: `\`${username || "RobloxPlayer"}\``, inline: true });
      }
      if (script.log_executor ?? true) {
        fields.push({ name: "Executor", value: `\`${executor || "Unknown"}\``, inline: true });
      }
      if (script.log_hwid ?? true) {
        fields.push({ name: "HWID", value: `\`${hashed}\``, inline: false });
      }
      if (script.log_ip ?? true) {
        fields.push({ name: "IP Address", value: `||${ip}||`, inline: true });
      }
      if (script.log_jobid ?? false) {
        fields.push({ name: "Job ID", value: `\`${jobid || "N/A"}\``, inline: false });
      }

      fetch(hookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            author: {
              name: "SyncAuth · Execution Log",
              icon_url: `${siteUrl}/syncauthlogo.png`,
              url: siteUrl
            },
            title: `${script.name || "Script"} was executed`,
            description: `**Project:** \`${project.name || script.project_id}\`\nThis execution was logged when the key system was loaded.`,
            color: 0x00c8e0,
            thumbnail: { url: `${siteUrl}/syncauthlogo.png` },
            fields,
            footer: {
              text: `SyncAuth · Script ID: ${id}`,
              icon_url: `${siteUrl}/syncauthlogo.png`
            },
            timestamp: (script.log_time ?? true) ? now.toISOString() : undefined
          }]
        })
      }).catch(e => console.error("[SyncAuth] Failed to send script execution webhook", e));
    }

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: "Internal Error" }, { status: 500 });
  }
}
