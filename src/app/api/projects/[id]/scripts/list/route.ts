import { getProject, loadProjectData, getProjectPasteId } from "@/lib/pastefy";
export const runtime = "edge";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const project = await getProject(id);
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const pasteId = await getProjectPasteId(id);
  if (!pasteId) {
    return Response.json({ error: "Data not found" }, { status: 404 });
  }

  const data = await loadProjectData(pasteId, true);
  const scripts = Object.values(data.scripts || {}).map(s => ({
    id: s.id,
    name: s.name
  }));

  return Response.json(scripts);
}
