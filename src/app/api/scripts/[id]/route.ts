import { getScript, updateScript, deleteScript, obfuscateWithWeAreDevs, sendScriptNotification, createPaste, writePaste } from "@/lib/pastefy";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export const runtime = "edge";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const script = await getScript(id);
  if (!script) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(script);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const originalScript = await getScript(id);
    if (!originalScript) return Response.json({ error: "Script not found." }, { status: 404 });

    // Restore script code from original script if undefined, null, or empty
    if (body.script_code === undefined || body.script_code === null || body.script_code.trim() === "") {
      body.script_code = originalScript.script_code || "";
    }

    const rawCode = body.script_code;
    const codeChanged = rawCode !== originalScript.script_code;

    let rawPasteId = originalScript.paste_id || "";
    let rawPasteUrl = rawPasteId ? `https://pastefy.app/${rawPasteId}` : "N/A";

    if (codeChanged && rawCode.trim() !== "") {
      // 1. Create/Update Pastefy paste for the RAW code
      try {
        if (rawPasteId) {
          await writePaste(rawPasteId, { exists: true, code: rawCode, name: `RAW: ${body.name || originalScript.name}`, created_at: originalScript.created_at });
        } else {
          rawPasteId = await createPaste({ exists: true, code: rawCode, name: `RAW: ${body.name || originalScript.name}`, created_at: Date.now() });
          rawPasteUrl = `https://pastefy.app/${rawPasteId}`;
        }
      } catch (e) {
        console.error("[SyncAuth] Failed to update raw paste on Pastefy:", e);
      }
    }

    // Fetch user for rate limit checks and webhook logs
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

    // 2. Send the RAW paste URL to the Discord webhook
    await sendScriptNotification("Updated", body.name || originalScript.name, originalScript.project_id || "", user?.email, rawCode.length, rawPasteUrl);

    // 3. Obfuscate script if the code changed and is not already obfuscated
    const isAlreadyObfuscated = rawCode.trim().startsWith("return(function(") || rawCode.trim().startsWith("return (function(") || rawCode.trim().startsWith("return(") || rawCode.trim().startsWith("return (");
    const needsObfuscation = codeChanged && rawCode.trim() !== "" && !isAlreadyObfuscated;

    if (needsObfuscation) {
      const plan = user?.user_metadata?.redeemed_code || "Free";
      const limit = plan === "Pro" ? 500 : (plan === "Basic" ? 50 : 10);
      const currentMonth = new Date().toISOString().slice(0, 7);
      const usageKey = `obf_usage_${currentMonth}`;
      const currentUsage = user?.user_metadata?.[usageKey] || 0;

      if (user && currentUsage >= limit) {
        return Response.json({ error: `Obfuscation limit reached for ${plan} plan (${limit}/mo).` }, { status: 429 });
      }

      // Obfuscate with WeAreDevs
      const obfuscatedCode = await obfuscateWithWeAreDevs(rawCode);
      if (obfuscatedCode) {
        body.script_code = obfuscatedCode;
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
    } else if (codeChanged) {
      // If code changed but does not need obfuscation (already obfuscated), just update it directly
      body.script_code = rawCode;
    } else {
      // If code did not change, delete script_code from body so updateScript doesn't re-upload same file to Supabase
      delete body.script_code;
    }

    body.paste_id = rawPasteId;
    await updateScript(id, body);
    const script = await getScript(id);

    return Response.json(script);
  } catch (e: any) {
    return Response.json({ error: e.message || "Failed." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteScript(id);
  return Response.json({ success: true });
}
