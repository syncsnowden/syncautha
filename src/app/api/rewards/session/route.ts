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

    const host = req.headers.get("host") || "";
    const origin = req.headers.get("origin") || `https://${host}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin.replace(/\/+$/, "");
    const postbackUrl = `${siteUrl}/api/rewards/postback?sid=${sid}`;

    // Use body API key if provided, else env var
    const llApiKey = body.lootlabs_api_key || process.env.LOOTLABS_API_KEY || "";
    const llLink = body.lootlabs_link || project.lootlabs_link || "";

    // Save LootLabs settings to project
    if (llLink || llApiKey) {
      const { updateProject } = await import("@/lib/pastefy");
      const updates: any = {};
      if (llLink) updates.lootlabs_link = llLink;
      if (llApiKey) updates.lootlabs_api_key = llApiKey;
      await updateProject(pid, updates).catch(() => {});
    }

    let checkpointUrl = "";
    if (llLink && llApiKey) {
      try {
        const llRes = await fetch("https://lootlabs.gg/api/url/create", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Api-Key": llApiKey },
          body: JSON.stringify({
            url: postbackUrl,
            name: project.name,
            key_duration: body.key_duration || project.key_duration || 3,
            max_keys: body.max_keys || project.max_keys || 1,
            allow_extending: body.allow_extending ?? project.allow_extending ?? false,
            cooldown: body.reward_cooldown ?? project.reward_cooldown ?? 0,
            allow_forgetting: body.allow_forgetting ?? project.allow_forgetting ?? false,
            max_hours: body.max_hours || project.max_hours || undefined,
          }),
        });
        if (llRes.ok) {
          const llData = await llRes.json();
          checkpointUrl = llData.url || "";
        }
      } catch {}
    }

    return Response.json({
      session_id: sid,
      postback_url: postbackUrl,
      checkpoint_url: checkpointUrl,
      public_link: `${siteUrl}/get-key/${project.id}`,
    });
  } catch (e: any) {
    return Response.json({ error: e.message || "Failed." }, { status: 500 });
  }
}
