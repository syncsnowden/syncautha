import { getDB, updateDB, generateKey, hashHwid } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const project_id = body.project_id;
    if (!project_id) return Response.json({ error: "project_id required" }, { status: 400 });

    const db = await getDB();
    const project = db.projects[project_id];
    if (!project) return Response.json({ error: "Project not found" }, { status: 404 });

    const key = generateKey();
    const now = Date.now();
    const ttl = project.cooldown > 0 ? project.cooldown * 1000 : 86400000; // default 24h
    const entry = {
      key,
      project_id,
      hwid: null,
      created: now,
      expires: now + ttl,
      status: "unused" as const,
      linked_reward: body.reward_id || null,
    };
    await updateDB((d) => { d.keys[key] = entry; });
    return Response.json({ key, expires: entry.expires });
  } catch {
    return Response.json({ error: "Failed to generate key." }, { status: 500 });
  }
}
