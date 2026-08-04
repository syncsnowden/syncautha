import { getScripts, createScript, generateId, type Script } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scripts = await getScripts(id);
  return Response.json(scripts);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: project_id } = await params;
  try {
    const body = await req.json();
    const script: Script = {
      id: generateId(14),
      project_id,
      name: body.name || "Untitled",
      silent_mode: body.silent_mode ?? false,
      script_code: body.script_code || "",
      created_at: Date.now(),
    };
    await createScript(project_id, script);
    return Response.json(script, { status: 201 });
  } catch {
    return Response.json({ error: "Failed." }, { status: 500 });
  }
}
