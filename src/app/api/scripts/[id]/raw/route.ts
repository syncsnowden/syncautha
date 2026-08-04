import { getDB } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDB();
  const script = db.scripts[id];
  if (!script) return new Response("-- Script not found", { status: 404, headers: { "content-type": "text/plain" } });
  return new Response(script.script_code, { headers: { "content-type": "text/plain" } });
}
