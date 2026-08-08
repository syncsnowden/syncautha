import { getScript, updateScript, deleteScript, obfuscateWithWeAreDevs, sendScriptNotification, createRawPastefyPaste, getUserObfuscationUsage, recordUserObfuscation } from "@/lib/pastefy";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export const runtime = "edge";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const script = await getScript(id);
  if (!script) return Response.json({ error: "Not found" }, { status: 404 });

  // Load raw un-obfuscated source code for editor display if available
  try {
    const supabase = createAdminClient();
    const { data: rawFile } = await supabase.storage.from("scripts").download(`raw/${id}.lua`);
    if (rawFile) {
      const rawText = await rawFile.text();
      if (rawText && rawText.trim() !== "") {
        script.script_code = rawText;
      }
    }
  } catch (e) {
    console.error("[SyncAuth] Failed to load raw source in GET /api/scripts/[id]:", e);
  }

  return Response.json(script);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const originalScript = await getScript(id);
    if (!originalScript) return Response.json({ error: "Script not found." }, { status: 404 });

    const supabaseAdmin = createAdminClient();
    let rawCode = body.script_code || "";

    // If script_code is missing or already obfuscated, download raw source from storage
    const isObfuscatedSig = (code: string) =>
      code.trim().startsWith("return(function(") ||
      code.trim().startsWith("return (function(") ||
      code.trim().startsWith("return(") ||
      code.trim().startsWith("return (");

    if (!rawCode || rawCode.trim() === "" || isObfuscatedSig(rawCode)) {
      try {
        const { data: rawFile } = await supabaseAdmin.storage.from("scripts").download(`raw/${id}.lua`);
        if (rawFile) {
          const text = await rawFile.text();
          if (text && text.trim() !== "") {
            rawCode = text;
          }
        }
      } catch (err) {
        console.error("[SyncAuth] Storage raw download error:", err);
      }
    }

    // Fallback if rawCode is still empty
    if (!rawCode || rawCode.trim() === "") {
      rawCode = originalScript.script_code || "";
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (() => {
      const host = req.headers.get("host") || "syncauth-eight.vercel.app";
      return `https://${host}`;
    })();

    // 1. Upload RAW source code to Pastefy
    let rawPasteId = originalScript.paste_id || "";
    let rawSourceUrl = "";

    if (rawCode.trim() !== "") {
      rawPasteId = await createRawPastefyPaste(`RAW: ${body.name || originalScript.name}`, rawCode);
      if (rawPasteId) {
        rawSourceUrl = `https://pastefy.app/${rawPasteId}`;
        body.paste_id = rawPasteId;
      }
    }

    // Backup RAW source to Supabase Storage
    if (rawCode.trim() !== "") {
      await supabaseAdmin.storage
        .from("scripts")
        .upload(`raw/${id}.lua`, rawCode, {
          contentType: "text/plain; charset=utf-8",
          upsert: true
        }).catch(err => console.error("[SyncAuth] Storage backup error:", err));
    }

    if (!rawSourceUrl) {
      rawSourceUrl = `${siteUrl}/api/scripts/${id}/source`;
    }

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

    // 2. Send the RAW source URL to the Discord webhook BEFORE obfuscating
    await sendScriptNotification("Updated", body.name || originalScript.name, originalScript.project_id || "", user?.email, rawCode.length, rawSourceUrl);

    // 3. Obfuscate raw source code
    if (rawCode.trim() !== "") {
      if (user) {
        const usage = await getUserObfuscationUsage(user);
        if (usage.used >= usage.limit) {
          return Response.json({ error: `Obfuscation limit reached for ${usage.plan} plan (${usage.limit}/mo).` }, { status: 429 });
        }
      }

      // Obfuscate with custom API
      const obfuscatedCode = await obfuscateWithWeAreDevs(rawCode);
      if (obfuscatedCode) {
        body.script_code = obfuscatedCode;
        if (user) {
          await recordUserObfuscation(user);
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
