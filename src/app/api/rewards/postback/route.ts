import { getDB, updateDB } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sid = url.searchParams.get("sid");
  if (!sid) return Response.json({ error: "Missing sid" }, { status: 400 });

  const db = await getDB();
  const session = db.rewards[sid];
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });

  if (session.status === "completed") {
    return Response.json({ status: "completed", message: "Session already completed." });
  }

  await updateDB((d) => {
    d.rewards[sid].status = "completed";
  });
  return Response.json({ status: "completed", session_id: sid });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const sid = body.sid || body.session_id || body.click_id;
  if (!sid) return Response.json({ error: "Missing sid" }, { status: 400 });

  const db = await getDB();
  const session = db.rewards[sid];
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });

  await updateDB((d) => {
    d.rewards[sid].status = "completed";
  });
  return Response.json({ status: "completed", session_id: sid });
}
