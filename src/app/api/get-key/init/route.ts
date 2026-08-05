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

    // If user returned from LootLabs with token, advance checkpoint step
    let activeSession: string | null = null;
    let completedSteps = 0;
    let totalSteps = project.checkpoint_steps || 1;
    if (totalSteps < 1) totalSteps = 1;

    if (token) {
      const existingSession = await getRewardSession(token);
      if (existingSession) {
        completedSteps = (existingSession.step || 0) + 1; // Advance step
        totalSteps = existingSession.total_steps || totalSteps;
        const { updateRewardSession } = await import("@/lib/pastefy");
        await updateRewardSession(project.id, token, (s) => {
          s.step = completedSteps;
          if (completedSteps >= totalSteps) s.status = "completed";
        });
        // Reuse this session for all steps — both mid-flow and fully completed
        activeSession = token;
      }
    }

    let sessionId = activeSession;
    if (!sessionId) {
      // No token at all → brand new session
      sessionId = generateId(14);
      await createRewardSession(project.id, {
        id: sessionId, project_id: project.id,
        status: "pending", created: Date.now(), used: false,
        step: 0, total_steps: totalSteps,
      });
    }

    // Get all LootLabs links
    const links = [project.lootlabs_link, project.ll_link_2, project.ll_link_3].filter(Boolean);
    const currentLink = links[completedSteps] || "";

    // Encrypt the return URL
    let checkpointUrl = "";
    const llApiKey = project.lootlabs_api_key || "";
    if (llApiKey && currentLink) {
      const returnUrl = `${siteUrl}/get-key/${project.id}?token=${sessionId}`;
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
            const base = currentLink.replace(/[?&]$/, "");
            const sep = base.includes("?") ? "&" : "?";
            checkpointUrl = `${base}${sep}puid=${encodeURIComponent(sessionId)}&data=${dataParam}`;
          }
        }
      } catch {}
    }

    return Response.json({
      project: { id: project.id, name: project.name },
      session_id: sessionId,
      all_done: completedSteps >= totalSteps,
      completed_steps: completedSteps,
      total_steps: totalSteps,
      checkpoint_url: checkpointUrl,
      postback_url: `${siteUrl}/api/rewards/postback?sid=${sessionId}`,
    });
  } catch (e: any) {
    return Response.json({ error: e.message || "Failed." }, { status: 500 });
  }
}
