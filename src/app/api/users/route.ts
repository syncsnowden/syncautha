import { getProjects, loadProjectData } from "@/lib/pastefy";

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
