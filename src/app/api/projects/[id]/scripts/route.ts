import { getDB, updateDB, generateId, type Script } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDB();
  const scripts = Object.values(db.scripts).filter((s) => s.project_id === id);
  return Response.json(scripts);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: project_id } = await params;
  try {
    const body = await req.json();
    const scriptId = generateId(14);
    const script: Script = {
      id: scriptId,
      project_id,
      name: body.name || "Untitled Script",
      silent_mode: body.silent_mode ?? false,
      script_code: body.script_code || "",
      created_at: Date.now(),
    };
    await updateDB((db) => { db.scripts[scriptId] = script; });
    return Response.json(script, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create script." }, { status: 500 });
  }
}
