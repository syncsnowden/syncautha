import { getScript, updateScript, deleteScript } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const script = await getScript(id);
  if (!script) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(script);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    await updateScript(id, body);
    const script = await getScript(id);
    return Response.json(script);
  } catch { return Response.json({ error: "Failed." }, { status: 500 }); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteScript(id);
  return Response.json({ success: true });
}
