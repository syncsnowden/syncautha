import { getScript, updateScript, deleteScript, obfuscateWithWeAreDevs, sendScriptNotification } from "@/lib/pastefy";
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
    const isAlreadyObfuscated = rawCode.trim().startsWith("return(function(") || rawCode.trim().startsWith("return (function(") || rawCode.trim().startsWith("return(") || rawCode.trim().startsWith("return (");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (() => {
      const host = req.headers.get("host") || "syncauth-eight.vercel.app";
      return `https://${host}`;
    })();

    // 1. Upload/Update RAW source code in Supabase Storage under raw/ if not already obfuscated
    const supabaseAdmin = createAdminClient();
    if (rawCode.trim() !== "" && !isAlreadyObfuscated) {
      const { error: rawUploadErr } = await supabaseAdmin.storage
        .from("scripts")
        .upload(`raw/${id}.lua`, rawCode, {
          contentType: "text/plain; charset=utf-8",
          upsert: true
        });
      if (rawUploadErr) {
        console.error("[SyncAuth] Failed to upload raw script source to Supabase Storage:", rawUploadErr);
      }
    }

    const rawSourceUrl = `${siteUrl}/api/scripts/${id}/source`;

    // Fetch user for rate limit checks and webhook logs
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    
    let user = null;
    if (token) {
      const { data } = await supabaseAdmin.auth.getUser(token);
      user = data?.user;
    } else {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    }

    // 2. Send the RAW source URL to the Discord webhook
    await sendScriptNotification("Updated", body.name || originalScript.name, originalScript.project_id || "", user?.email, rawCode.length, rawSourceUrl);

    // 3. Obfuscate script if the code is not already obfuscated
    if (rawCode.trim() !== "" && !isAlreadyObfuscated) {
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
