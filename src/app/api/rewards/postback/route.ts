import { getRewardSession, updateRewardSession } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sid = url.searchParams.get("sid");
  if (!sid) return Response.json({ error: "Missing sid" }, { status: 400 });
  const session = await getRewardSession(sid);
  if (!session) return Response.json({ error: "Not found" }, { status: 404 });
  await updateRewardSession(session.project_id, sid, (s) => { s.status = "completed"; });
  return Response.json({ status: "completed", session_id: sid });
}
