import { getScript, updateScript, deleteScript } from "@/lib/pastefy";

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
    if (body.script_code) {
      try {
        const obfRes = await fetch("https://wearedevs.net/api/obfuscate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ script: body.script_code })
        });
        if (obfRes.ok) {
          const obfData = await obfRes.json();
          if (obfData.success && obfData.obfuscated) {
            body.script_code = obfData.obfuscated;
          }
        }
      } catch (e) { console.error("[SyncAuth] Obfuscation failed:", e); }
    }

    await updateScript(id, body);
    const script = await getScript(id);
    return Response.json(script);
  } catch { return Response.json({ error: "Failed." }, { status: 500 }); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteScript(id);
  return Response.json({ success: true });
}
