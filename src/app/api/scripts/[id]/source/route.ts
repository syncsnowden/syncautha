import { createAdminClient } from "@/lib/supabase/admin";
import { getScript, getScriptRaw } from "@/lib/pastefy";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = createAdminClient();
    let { data: fileData, error } = await supabase.storage
      .from("scripts")
      .download(`raw/${id}.lua`);

    if (error || !fileData) {
      // Fallback to standard storage file
      const res = await supabase.storage
        .from("scripts")
        .download(`${id}.lua`);
      fileData = res.data;
      error = res.error;
    }

    if (fileData) {
      const rawText = await fileData.text();
      if (rawText && rawText.trim() !== "") {
        return new Response(rawText, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store, max-age=0"
          }
        });
      }
    }

    // Fallback to Pastefy raw content
    const scriptRaw = await getScriptRaw(id);
    if (scriptRaw && scriptRaw.code) {
      return new Response(scriptRaw.code, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store, max-age=0"
        }
      });
    }

    const scriptObj = await getScript(id);
    if (scriptObj && scriptObj.script_code) {
      return new Response(scriptObj.script_code, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store, max-age=0"
        }
      });
    }

    return new Response("-- SyncAuth Source Code Placeholder\nprint('Script source code initialized.')", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  } catch (e: any) {
    return new Response(`Error: ${e.message}`, { status: 500, headers: { "Content-Type": "text/plain" } });
  }
}
