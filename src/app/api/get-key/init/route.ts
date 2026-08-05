import { getProjects, getProject, createRewardSession, generateId, getRewardSession } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug") || "";
    const token = url.searchParams.get("token") || "";
    const siteUrl = (() => {
      if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
      const host = req.headers.get("host") || "syncauth-eight.vercel.app";
      return `https://${host}`;
    })();

    let project = await getProject(slug);
    if (!project) {
      const projects = await getProjects();
      const found = projects.find(p => p.name.toLowerCase().replace(/[^a-z0-9]/g, "-") === slug.toLowerCase())
        || projects.find(p => p.name.toLowerCase().includes(slug.toLowerCase()));
      if (found) project = await getProject(found.id);
    }
    if (!project) return Response.json({ error: "Project not found." }, { status: 404 });

    // Check for existing completed session (user returned from LootLabs)
    let activeSession: string | null = null;
    if (token) {
      const existingSession = await getRewardSession(token);
      if (existingSession && existingSession.status === "completed" && !existingSession.used) {
        activeSession = token;
      }
    }

    let sessionId = activeSession;
    if (!sessionId) {
      sessionId = generateId(14);
      await createRewardSession(project.id, {
        id: sessionId, project_id: project.id,
        status: "pending", created: Date.now(), used: false,
      });
    }

    // Encrypt return URL via LootLabs API
    let checkpointUrl = "";
    const llApiKey = project.lootlabs_api_key || process.env.LOOTLABS_API_KEY || "";
    const llLink = project.lootlabs_link || "";
    const returnUrl = `${siteUrl}/get-key/${project.id}?token=${sessionId}`;

    if (llApiKey && llLink) {
      try {
        const body = JSON.stringify({ destination_url: returnUrl, api_token: llApiKey });
        let llRes = await fetch("https://creators.lootlabs.gg/api/public/url_encryptor", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${llApiKey}`, Accept: "application/json" },
          body,
        });
        if (!llRes.ok) {
          llRes = await fetch(`https://creators.lootlabs.gg/api/public/url_encryptor?destination_url=${encodeURIComponent(returnUrl)}&api_token=${llApiKey}`, {
            headers: { Accept: "application/json" },
          });
        }
        if (llRes.ok) {
          const dd = await llRes.json();
          if (dd.message && dd.type !== "error") {
            const encrypted = dd.message;
            const dataParam = encrypted.includes("%") ? encrypted : encodeURIComponent(encrypted);
            const base = llLink.replace(/[?&]$/, "");
            const sep = base.includes("?") ? "&" : "?";
            checkpointUrl = `${base}${sep}puid=${encodeURIComponent(sessionId)}&data=${dataParam}`;
          }
        }
      } catch {}
    }

    return Response.json({
      project: { id: project.id, name: project.name },
      session_id: sessionId,
      has_completed_session: !!activeSession,
      checkpoint_url: checkpointUrl || project.lootlabs_link || "",
      postback_url: `${siteUrl}/api/rewards/postback?sid=${sessionId}`,
    });
  } catch (e: any) {
    return Response.json({ error: e.message || "Failed." }, { status: 500 });
  }
}
