import { getProject, updateProject, deleteProject } from "@/lib/pastefy";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

async function getAuthenticatedUser(req: Request) {
  try {
    const supabase = await createClient();
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    const { data: { user } } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });

  const user = await getAuthenticatedUser(req);
  if (project.owner_id && (!user || project.owner_id !== user.id)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json(project);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const project = await getProject(id);
    if (!project) return Response.json({ error: "Not found" }, { status: 404 });

    const user = await getAuthenticatedUser(req);
    if (project.owner_id && (!user || project.owner_id !== user.id)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await updateProject(id, body);
    const updated = await getProject(id);
    return Response.json(updated);
  } catch (e: any) {
    console.error("Update project error:", e);
    return Response.json({ error: e.message || "Failed to update." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const project = await getProject(id);
    if (!project) return Response.json({ error: "Not found" }, { status: 404 });

    const user = await getAuthenticatedUser(req);
    if (project.owner_id && (!user || project.owner_id !== user.id)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteProject(id);
    return Response.json({ success: true });
  } catch (e: any) {
    console.error("Delete project error:", e);
    return Response.json({ error: e.message || "Failed to delete." }, { status: 500 });
  }
}
