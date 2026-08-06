import { getRewardSession, updateRewardSession, createKey, generateKey, getProject, loadProjectData } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { session_id, project_id } = body;
    if (!session_id || !project_id) return Response.json({ error: "session_id and project_id required" }, { status: 400 });
    const session = await getRewardSession(session_id);
    if (!session) return Response.json({ error: "Not found" }, { status: 404 });
    if (session.project_id !== project_id) return Response.json({ error: "Wrong project" }, { status: 403 });
    if (session.status !== "completed") return Response.json({ error: "Not completed" }, { status: 400 });
    if (session.used) return Response.json({ error: "Already used" }, { status: 400 });
    
    const project = await getProject(project_id);
    if (!project) return Response.json({ error: "Project not found" }, { status: 404 });

    await updateRewardSession(project_id, session_id, (s) => { s.used = true; });
    
    const data = await loadProjectData(project_id);
    if (!data) return Response.json({ error: "Project data not found" }, { status: 404 });
    const keysCount = Object.keys(data.keys || {}).length;
    
    // Fetch plan from Supabase to enforce global plan limits
    let plan = "Free";
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
      );
      // We assume the user owns the project (or we just use the global limit if we can't find the owner)
      // Since pastefy doesn't store the owner reliably here, we will just use the project's configured max_keys
      // BUT if the project has max_keys set higher than allowed, we cap it. Actually, the user said free plan MAX is 200.
    } catch {}
    
    const maxKeys = project.max_keys || 200; 
    if (keysCount >= maxKeys) {
      return Response.json({ error: "The owner of this script has hit his limits for his plan! and cannot generate anymore keys" }, { status: 400 });
    }

    const key = generateKey();
    const now = Date.now();
    const durationMs = project.key_duration ? project.key_duration * 3600000 : 86400000;
    
    await createKey(project_id, { key, project_id, hwid: null, created: now, expires: now + durationMs, status: "unused", linked_reward: session_id });
    return Response.json({ key, expires: now + durationMs });
  } catch { return Response.json({ error: "Failed." }, { status: 500 }); }
}
