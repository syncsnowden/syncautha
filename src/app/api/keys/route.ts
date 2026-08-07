import { createKey, generateKey, getProjects, loadProjectData } from "@/lib/pastefy";
import { createClient } from "@/lib/supabase/server";
export const runtime = "edge";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    const { data: { user } } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();

    const allProjects = await getProjects();
    const projects = user ? allProjects.filter(p => p.owner_id === user.id || !p.owner_id) : allProjects.filter(p => !p.owner_id);

    const allKeys: any[] = [];
    for (const p of projects) {
      if (!p.paste_id) continue;
      const data = await loadProjectData(p.paste_id, true);
      if (data && data.keys) {
        Object.values(data.keys).forEach((k: any) => {
          allKeys.push({
            ...k,
            project_name: p.name
          });
        });
      }
    }
    // Sort keys newest first
    allKeys.sort((a: any, b: any) => b.created - a.created);
    return Response.json(allKeys);
  } catch (e: any) {
    console.error("[GET /api/keys] Error:", e);
    return Response.json({ error: e.message || "Failed to load keys" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pid = body.project_id;
    if (!pid) return Response.json({ error: "project_id required" }, { status: 400 });
    const key = generateKey();
    const now = Date.now();
    await createKey(pid, { key, project_id: pid, hwid: null, created: now, expires: now + 86400000, status: "unused", linked_reward: null });
    return Response.json({ key, expires: now + 86400000 });
  } catch (e: any) {
    console.error("[POST /api/keys] Error:", e);
    return Response.json({ error: e.message || "Failed." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    if (!key) return Response.json({ error: "key parameter required" }, { status: 400 });
    
    const { deleteKey } = await import("@/lib/pastefy");
    await deleteKey(key);
    return Response.json({ success: true });
  } catch (e: any) {
    console.error("[DELETE /api/keys] Error:", e);
    return Response.json({ error: e.message || "Failed to delete key" }, { status: 500 });
  }
}
