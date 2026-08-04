import { getProjects, createRewardSession, generateId } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug") || "";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin || "https://syncauth-eight.vercel.app";

    const projects = await getProjects();
    if (projects.length === 0) return Response.json({ error: "No projects found." }, { status: 404 });

    // Try exact ID match first, then partial name match
    let project = projects.find(p => p.id === slug);
    if (!project) {
      project = projects.find(p => p.name.toLowerCase().replace(/[^a-z0-9]/g, "-") === slug.toLowerCase());
    }
    if (!project) {
      project = projects.find(p => p.name.toLowerCase().includes(slug.toLowerCase()));
    }
    if (!project) {
      return Response.json({ error: "Project not found. Check the link." }, { status: 404 });
    }

    const sessionId = generateId(14);
    await createRewardSession(project.id, {
      id: sessionId, project_id: project.id,
      status: "pending", created: Date.now(), used: false,
    });

    let lootlabsUrl = "";
    if (project.lootlabs_link) {
      try {
        const apiKey = process.env.LOOTLABS_API_KEY || "";
        if (apiKey) {
          const postbackUrl = `${siteUrl}/api/rewards/postback?sid=${sessionId}`;
          const llRes = await fetch("https://lootlabs.gg/api/url/create", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Api-Key": apiKey },
            body: JSON.stringify({
              url: postbackUrl,
              name: project.name,
              key_duration: project.key_duration || 3,
              max_keys: project.max_keys || 1,
              allow_extending: project.allow_extending,
              cooldown: project.reward_cooldown || 0,
              allow_forgetting: project.allow_forgetting,
              max_hours: project.max_hours || undefined,
            }),
          });
          if (llRes.ok) {
            const llData = await llRes.json();
            lootlabsUrl = llData.url || "";
          }
        }
      } catch {}
    }

    return Response.json({
      project: { id: project.id, name: project.name, cooldown: project.cooldown },
      session_id: sessionId,
      postback_url: `${siteUrl}/api/rewards/postback?sid=${sessionId}`,
      lootlabs_url: lootlabsUrl,
    });
  } catch (e: any) {
    return Response.json({ error: e.message || "Failed." }, { status: 500 });
  }
}
