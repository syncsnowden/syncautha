import { getScripts, createScript, generateId, type Script, obfuscateWithWeAreDevs, sendScriptNotification } from "@/lib/pastefy";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export const runtime = "edge";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scripts = await getScripts(id);
  return Response.json(scripts);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: project_id } = await params;
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    
    let user = null;
    if (token) {
      const supabaseAdmin = createAdminClient();
      const { data } = await supabaseAdmin.auth.getUser(token);
      user = data?.user;
    } else {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    }
    
    // TEMPORARY BYPASS: if unauthorized, allow script creation but don't track usage
    // if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const plan = user?.user_metadata?.redeemed_code || "Free";
    const limit = plan === "Pro" ? 500 : (plan === "Basic" ? 50 : 10);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usageKey = `obf_usage_${currentMonth}`;
    const currentUsage = user?.user_metadata?.[usageKey] || 0;

    if (user && currentUsage >= limit) {
      return Response.json({ error: `Obfuscation limit reached for ${plan} plan (${limit}/mo).` }, { status: 429 });
    }

    const body = await req.json();
    let code = body.script_code || "";
    
    const isAlreadyObfuscated = code.trim().startsWith("return(") || code.trim().startsWith("return (");

    // Obfuscate with WeAreDevs
    if (code.trim() !== "" && !isAlreadyObfuscated) {
      const obfuscatedCode = await obfuscateWithWeAreDevs(code);
      if (obfuscatedCode) {
        code = obfuscatedCode;
        if (user) {
          const supabaseAdmin = createAdminClient();
          // Fetch latest metadata to merge properly
          const { data: latestUserData } = await supabaseAdmin.auth.admin.getUserById(user.id);
          const existingMetadata = latestUserData?.user?.user_metadata || {};
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...existingMetadata,
              [usageKey]: (existingMetadata[usageKey] || 0) + 1
            }
          });
        }
      } else {
        return Response.json({ error: "Obfuscation failed. Please check the obfuscator service or try again." }, { status: 500 });
      }
    }

    const script: Script = {
      id: generateId(14),
      project_id,
      name: body.name || "Untitled",
      silent_mode: body.silent_mode ?? false,
      script_code: code,
      created_at: Date.now(),
      paste_id: "",
      webhook_protection: body.webhook_protection ?? false,
      use_syncauth_gui: body.use_syncauth_gui ?? true,
      gui_title: body.gui_title || "",
      discord_link: body.discord_link || "",
      get_key_link: body.get_key_link || "",
      show_discord_button: body.show_discord_button ?? true,
      target_script_id: body.target_script_id || "",
      logs_webhook_enabled: body.logs_webhook_enabled ?? false,
      logs_webhook: body.logs_webhook || "",
      log_hwid: body.log_hwid ?? true,
      log_ip: body.log_ip ?? true,
      log_username: body.log_username ?? true,
      log_displayname: body.log_displayname ?? false,
      log_time: body.log_time ?? true,
      log_key: body.log_key ?? true,
      log_executor: body.log_executor ?? true,
      log_jobid: body.log_jobid ?? false,
    };
    await createScript(project_id, script);
    
    // Await Discord notification to prevent premature runtime termination
    await sendScriptNotification("Created", script.name, project_id, user?.email, body.script_code?.length);

    return Response.json(script, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return Response.json({ error: e.message || "Failed." }, { status: 500 });
  }
}
