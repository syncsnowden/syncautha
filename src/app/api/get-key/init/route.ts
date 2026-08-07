import { getProjects, getProject, createRewardSession, generateId, getRewardSession } from "@/lib/pastefy";
export const runtime = "edge";

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

    const provider = project.reward_provider || "lootlabs";
    const links = (provider === "linkvertise")
      ? [project.linkvertise_link, project.lv_link_2, project.lv_link_3].filter(Boolean)
      : [project.lootlabs_link, project.ll_link_2, project.ll_link_3].filter(Boolean);
    const totalSteps = Math.max(links.length, 1);

    const hash = url.searchParams.get("hash") || "";
    const ip = req.headers.get("cf-connecting-ip") || 
               req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
               req.headers.get("x-real-ip") || 
               "127.0.0.1";

    let completedSteps = 0;
    let activeSession: string | null = null;

    if (token) {
      const existingSession = await getRewardSession(token);
      if (existingSession && existingSession.project_id === project.id) {
        // Enforce IP matching to prevent sharing completed session tokens
        const sessionIp = existingSession.ip;
        if (sessionIp && sessionIp !== ip) {
          activeSession = null;
        } else {
          // If the session IP is not set, set it now
          if (!sessionIp) {
            const { updateRewardSession } = await import("@/lib/pastefy");
            await updateRewardSession(project.id, token, (s) => {
              s.ip = ip;
            });
          }

          if (provider === "linkvertise") {
            completedSteps = existingSession.step || 0;
            // If the user has returned with a Linkvertise hash parameter, verify it!
            if (hash) {
              const lvApiKey = project.linkvertise_api_key || "";
              if (lvApiKey) {
                try {
                  const lvRes = await fetch(`https://publisher.linkvertise.com/api/v1/anti_bypassing?token=${lvApiKey}&hash=${hash}`, {
                    method: "POST"
                  });
                  const resText = await lvRes.text();
                  if (resText.toUpperCase().includes("TRUE")) {
                    completedSteps = completedSteps + 1;
                    const { updateRewardSession } = await import("@/lib/pastefy");
                    await updateRewardSession(project.id, token, (s) => {
                      s.step = completedSteps;
                      s.total_steps = totalSteps;
                      if (completedSteps >= totalSteps) s.status = "completed";
                    });
                  }
                } catch (e: any) {
                  console.error("Linkvertise API error during init verify:", e);
                }
              }
            }
          } else {
            // For LootLabs/others, auto-increment when they return with the token,
            // but only if they haven't already completed all steps.
            if (existingSession.step < totalSteps && existingSession.status !== "completed") {
              completedSteps = (existingSession.step || 0) + 1;
              const { updateRewardSession } = await import("@/lib/pastefy");
              await updateRewardSession(project.id, token, (s) => {
                s.step = completedSteps;
                s.total_steps = totalSteps;
                if (completedSteps >= totalSteps) s.status = "completed";
              });
            } else {
              completedSteps = existingSession.step || 0;
            }
          }
          activeSession = token;
        }
      }
    }

    let sessionId = activeSession;
    if (!sessionId) {
      sessionId = generateId(14);
      await createRewardSession(project.id, {
        id: sessionId, project_id: project.id,
        status: "pending", created: Date.now(), used: false,
        step: 0, total_steps: totalSteps,
        ip: ip,
      });
    }

    const currentLink = links[completedSteps] || "";

    // Encrypt return URL via LootLabs url_encryptor or construct Linkvertise URL
    let checkpointUrl = "";
    if (currentLink) {
      if (provider === "linkvertise") {
        const base = currentLink.replace(/[?&]$/, "");
        const sep = base.includes("?") ? "&" : "?";
        checkpointUrl = `${base}${sep}sid=${encodeURIComponent(sessionId)}`;
      } else {
        const llApiKey = project.lootlabs_api_key || "";
        if (llApiKey) {
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
      }
    }

    return Response.json({
      project: { id: project.id, name: project.name },
      session_id: sessionId,
      all_done: completedSteps >= totalSteps,
      completed_steps: completedSteps,
      total_steps: totalSteps,
      checkpoint_url: checkpointUrl,
      postback_url: `${siteUrl}/api/rewards/postback?sid=${sessionId}`,
      _debug: {
        project_checkpoint_steps: project.checkpoint_steps,
        links_count: links.length,
        total_steps_used: totalSteps,
        token_received: token || null,
        completed_steps: completedSteps,
        all_done: completedSteps >= totalSteps,
        checkpoint_url_generated: !!checkpointUrl,
      },
    });
  } catch (e: any) {
    return Response.json({ error: e.message || "Failed." }, { status: 500 });
  }
}
