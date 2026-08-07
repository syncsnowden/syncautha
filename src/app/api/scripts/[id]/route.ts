import { getScript, updateScript, deleteScript } from "@/lib/pastefy";
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

    const codeChanged = body.script_code && body.script_code !== originalScript.script_code;

    if (codeChanged) {
      // Auth check
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

      if (user) {
        const plan = user.user_metadata?.redeemed_code || "Free";
        const limit = plan === "Pro" ? 500 : (plan === "Basic" ? 50 : 10);
        const currentMonth = new Date().toISOString().slice(0, 7);
        const usageKey = `obf_usage_${currentMonth}`;
        const currentUsage = user.user_metadata?.[usageKey] || 0;

        if (currentUsage >= limit) {
          return Response.json({ error: `Obfuscation limit reached for ${plan} plan (${limit}/mo).` }, { status: 429 });
        }

        // Obfuscate with WeAreDevs
        try {
          const obfRes = await fetch("https://wearedevs.net/api/obfuscate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ script: body.script_code })
          });
          if (obfRes.ok) {
            const resText = await obfRes.text();
            let obfuscatedCode = "";
            let success = false;
            try {
              const obfData = JSON.parse(resText);
              if (obfData.success && obfData.obfuscated) {
                obfuscatedCode = obfData.obfuscated;
                success = true;
              } else if (obfData.obfuscated) {
                obfuscatedCode = obfData.obfuscated;
                success = true;
              }
            } catch {
              if (resText && !resText.includes("<!DOCTYPE html>") && !resText.includes("<html")) {
                obfuscatedCode = resText;
                success = true;
              }
            }
            if (success && obfuscatedCode) {
              body.script_code = obfuscatedCode;
              const supabaseAdmin = createAdminClient();
              await supabaseAdmin.auth.admin.updateUserById(user.id, {
                user_metadata: { [usageKey]: currentUsage + 1 }
              });
            }
          }
        } catch (e) { console.error("[SyncAuth] Obfuscation failed:", e); }
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
