import { getDB, updateDB, generateId, type Project } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDB();
  return Response.json(Object.values(db.projects));
}

export async function POST(req: Request) {
  try {
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
    };
    await updateDB((db) => { db.projects[id] = project; });
    return Response.json(project, { status: 201 });
  } catch (e: any) {
    console.error("Project create error:", e);
    return Response.json({ error: e.message || "Failed to create project." }, { status: 500 });
  }
}
