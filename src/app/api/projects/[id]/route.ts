import { getProject, updateProject, deleteProject } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(project);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    await updateProject(id, body);
    const project = await getProject(id);
    return Response.json(project);
  } catch (e: any) {
    console.error("Update project error:", e);
    return Response.json({ error: e.message || "Failed to update." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteProject(id);
  return Response.json({ success: true });
}
