import { getProjects, createProject, generateId, type Project } from "@/lib/pastefy";
import { createClient } from "@/lib/supabase/server";
export const runtime = "edge";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supabase = await createClient();
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
  const { data: { user } } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();

  const projects = await getProjects();
  
  if (!user) {
    // If not authenticated, only return legacy projects with no owner
    return Response.json(projects.filter(p => !p.owner_id));
  }

  // Filter projects to only those owned by the user, OR legacy projects with no owner
  const userProjects = projects.filter(p => p.owner_id === user.id || !p.owner_id);
  return Response.json(userProjects);
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    const { data: { user } } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();

    const body = await req.json();
    const id = generateId(14);
    const project: Project = {
      id,
      name: body.name || "Untitled",
      logs_webhook: body.logs_webhook || "",
      alert_webhook: body.alert_webhook || "",
      cooldown: Number(body.cooldown) || 0,
      allow_hwid_reset: body.allow_hwid_reset ?? false,
      auto_delete_expired: body.auto_delete_expired ?? false,
      allow_hwid_clone: body.allow_hwid_clone ?? false,
      log_hwid: body.log_hwid ?? true,
      log_ip: body.log_ip ?? true,
      log_username: body.log_username ?? true,
      log_displayname: body.log_displayname ?? false,
      log_time: body.log_time ?? true,
      log_key: body.log_key ?? true,
      log_executor: body.log_executor ?? true,
      log_jobid: body.log_jobid ?? false,
      created_at: Date.now(),
      key_duration: Number(body.key_duration) || 24,
      max_keys: Number(body.max_keys) || 3,
      allow_extending: body.allow_extending ?? false,
      reward_cooldown: Number(body.reward_cooldown) || 0,
      allow_forgetting: body.allow_forgetting ?? false,
      max_hours: Number(body.max_hours) || 0,
      lootlabs_link: body.lootlabs_link || "",
      lootlabs_api_key: body.lootlabs_api_key || "",
      ll_link_2: body.ll_link_2 || "",
      ll_link_3: body.ll_link_3 || "",
      reward_provider: body.reward_provider || "lootlabs",
      linkvertise_link: body.linkvertise_link || "",
      linkvertise_api_key: body.linkvertise_api_key || "",
      lv_link_2: body.lv_link_2 || "",
      lv_link_3: body.lv_link_3 || "",
      checkpoint_steps: Number(body.checkpoint_steps) || 1,
      owner_id: user?.id || undefined, // Assign ownership to the creator
    };
    await createProject(project);
    return Response.json(project, { status: 201 });
  } catch (e: any) {
    console.error("Project create error:", e);
    return Response.json({ error: e.message || "Failed to create project." }, { status: 500 });
  }
}
