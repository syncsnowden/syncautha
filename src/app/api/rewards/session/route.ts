import { getDB, updateDB, generateId } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const project_id = body.project_id;
    if (!project_id) return Response.json({ error: "project_id required" }, { status: 400 });

    const db = await getDB();
    const project = db.projects[project_id];
    if (!project) return Response.json({ error: "Project not found" }, { status: 404 });

    const sessionId = generateId(14);
    await updateDB((d) => {
      d.rewards[sessionId] = {
        id: sessionId,
        project_id,
        status: "pending",
        created: Date.now(),
        used: false,
      };
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://syncauth-eight.vercel.app";
    const postbackUrl = `${siteUrl}/api/rewards/postback?sid=${sessionId}`;

    let lootlabsUrl = "";
    if (project.lootlabs_link) {
      try {
        const llRes = await fetch("https://lootlabs.gg/api/url/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": process.env.LOOTLABS_API_KEY || "",
          },
          body: JSON.stringify({
            url: postbackUrl,
            name: project.name,
            key_duration: project.key_duration,
            max_keys: project.max_keys,
            allow_extending: project.allow_extending,
            cooldown: project.reward_cooldown,
            allow_forgetting: project.allow_forgetting,
            max_hours: project.max_hours || undefined,
          }),
        });
        if (llRes.ok) {
          const llData = await llRes.json();
          lootlabsUrl = llData.url || llData.link || "";
        }
      } catch {}
    }

    return Response.json({
      session_id: sessionId,
      postback_url: postbackUrl,
      lootlabs_url: lootlabsUrl,
    });
  } catch (e: any) {
    return Response.json({ error: e.message || "Failed." }, { status: 500 });
  }
}
