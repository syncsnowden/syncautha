import { getDB, updateDB } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDB();
  const script = db.scripts[id];
  if (!script) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(script);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    await updateDB((db) => {
      if (!db.scripts[id]) throw new Error("Not found");
      Object.assign(db.scripts[id], body);
    });
    const db = await getDB();
    return Response.json(db.scripts[id]);
  } catch (e: any) {
    if (e.message === "Not found") return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ error: "Failed to update." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await updateDB((db) => { delete db.scripts[id]; });
  return Response.json({ success: true });
}
