import { getProjects, loadProjectData } from "@/lib/pastefy";
export const runtime = "edge";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await getProjects();
    const allUsers: any[] = [];
    for (const p of projects) {
      if (!p.paste_id) continue;
      const data = await loadProjectData(p.paste_id);
      if (data && data.users) {
        Object.values(data.users).forEach((u: any) => {
          allUsers.push({
            ...u,
            project_name: p.name,
            project_id: p.id
          });
        });
      }
    }
    // Sort by last seen descending
    allUsers.sort((a, b) => b.last_seen - a.last_seen);
    return Response.json(allUsers);
  } catch (e: any) {
    console.error("[GET /api/users] Error:", e);
    return Response.json({ error: e.message || "Failed to load users" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const hwid = url.searchParams.get("hwid");
    const projectId = url.searchParams.get("project_id");
    if (!hwid || !projectId) {
      return Response.json({ error: "hwid and project_id parameters required" }, { status: 400 });
    }

    const { getProjectPasteId, loadProjectData, saveProjectData, deleteKey } = await import("@/lib/pastefy");
    const pasteId = await getProjectPasteId(projectId);
    if (!pasteId) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    const data = await loadProjectData(pasteId);
    if (data.users && data.users[hwid]) {
      const userKey = data.users[hwid].key;
      // Delete the user
      delete data.users[hwid];
      await saveProjectData(pasteId, data);
      
      // Delete the associated key to make it unusable
      if (userKey) {
        await deleteKey(userKey);
      }
    }

    return Response.json({ success: true });
  } catch (e: any) {
    console.error("[DELETE /api/users] Error:", e);
    return Response.json({ error: e.message || "Failed to delete user" }, { status: 500 });
  }
}
