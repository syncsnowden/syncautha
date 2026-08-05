import { getScript } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Block browser access — only allow Roblox/executor User-Agents
  const ua = req.headers.get("user-agent") || "";
  const isRoblox = ua.includes("Roblox") || req.headers.get("roblox-id") || ua.toLowerCase().includes("axios");
  if (!isRoblox) {
    return new Response("-- SyncAuth: Direct access blocked. Use the key system loader.", {
      status: 403,
      headers: { "content-type": "text/plain" },
    });
  }
  const script = await getScript(id);
  if (!script) return new Response("-- Script not found", { status: 404, headers: { "content-type": "text/plain" } });
  return new Response(script.script_code, { headers: { "content-type": "text/plain" } });
}
