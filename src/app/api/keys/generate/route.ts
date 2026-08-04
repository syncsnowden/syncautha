import { getRewardSession, updateRewardSession, createKey, generateKey } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { session_id, project_id } = body;
    if (!session_id || !project_id) return Response.json({ error: "session_id and project_id required" }, { status: 400 });
    const session = await getRewardSession(session_id);
    if (!session) return Response.json({ error: "Not found" }, { status: 404 });
    if (session.project_id !== project_id) return Response.json({ error: "Wrong project" }, { status: 403 });
    if (session.status !== "completed") return Response.json({ error: "Not completed" }, { status: 400 });
    if (session.used) return Response.json({ error: "Already used" }, { status: 400 });
    await updateRewardSession(project_id, session_id, (s) => { s.used = true; });
    const key = generateKey();
    const now = Date.now();
    await createKey(project_id, { key, project_id, hwid: null, created: now, expires: now + 86400000, status: "unused", linked_reward: session_id });
    return Response.json({ key, expires: now + 86400000 });
  } catch { return Response.json({ error: "Failed." }, { status: 500 }); }
}
