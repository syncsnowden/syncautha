import { getDB, updateDB, generateKey } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { session_id, project_id } = body;
    if (!session_id || !project_id) return Response.json({ error: "session_id and project_id required" }, { status: 400 });

    const db = await getDB();
    const session = db.rewards[session_id];
    if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
    if (session.project_id !== project_id) return Response.json({ error: "Session does not belong to this project" }, { status: 403 });
    if (session.status !== "completed") return Response.json({ error: "Checkpoint not completed" }, { status: 400 });
    if (session.used) return Response.json({ error: "Session already used" }, { status: 400 });

    const key = generateKey();
    const ttl = 86400000;
    await updateDB((d) => {
      d.rewards[session_id].used = true;
      d.keys[key] = {
        key,
        project_id,
        hwid: null,
        created: Date.now(),
        expires: Date.now() + ttl,
        status: "unused",
        linked_reward: session_id,
      };
    });
    return Response.json({ key, expires: Date.now() + ttl });
  } catch {
    return Response.json({ error: "Failed." }, { status: 500 });
  }
}
