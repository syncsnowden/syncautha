import { getProject, createRewardSession, generateId } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pid = body.project_id;
    if (!pid) return Response.json({ error: "project_id required" }, { status: 400 });

    const project = await getProject(pid);
    if (!project) return Response.json({ error: "Project not found" }, { status: 404 });

    const sid = generateId(14);
    await createRewardSession(pid, {
      id: sid, project_id: pid,
      status: "pending", created: Date.now(), used: false,
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin") || "";
    const postbackUrl = `${siteUrl}/api/rewards/postback?sid=${sid}`;

    let lootlabsUrl = "";
    const apiKey = process.env.LOOTLABS_API_KEY || "";
    if (project.lootlabs_link && apiKey) {
      try {
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
      } catch {}
    }

    return Response.json({
      session_id: sid,
      postback_url: postbackUrl,
      lootlabs_url: lootlabsUrl,
      key_system_url: `${siteUrl}/get-key/${project.id}`,
    });
  } catch (e: any) {
    return Response.json({ error: e.message || "Failed." }, { status: 500 });
  }
}
