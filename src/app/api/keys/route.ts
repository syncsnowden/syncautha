import { createKey, generateKey } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pid = body.project_id;
    if (!pid) return Response.json({ error: "project_id required" }, { status: 400 });
    const key = generateKey();
    const now = Date.now();
    await createKey(pid, { key, project_id: pid, hwid: null, created: now, expires: now + 86400000, status: "unused", linked_reward: null });
    return Response.json({ key, expires: now + 86400000 });
  } catch { return Response.json({ error: "Failed." }, { status: 500 }); }
}
