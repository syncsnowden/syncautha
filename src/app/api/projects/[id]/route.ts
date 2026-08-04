import { getDB, updateDB } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDB();
  const project = db.projects[id];
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(project);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    await updateDB((db) => {
      if (!db.projects[id]) throw new Error("Not found");
      Object.assign(db.projects[id], body);
    });
    const db = await getDB();
    return Response.json(db.projects[id]);
  } catch (e: any) {
    if (e.message === "Not found") return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ error: "Failed to update." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await updateDB((db) => {
    delete db.projects[id];
    for (const sid of Object.keys(db.scripts)) {
      if (db.scripts[sid].project_id === id) delete db.scripts[sid];
    }
    for (const kid of Object.keys(db.keys)) {
      if (db.keys[kid].project_id === id) delete db.keys[kid];
    }
  });
  return Response.json({ success: true });
}
