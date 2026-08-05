import { getScript } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Block browser access — only allow Roblox/executor User-Agents
  const ua = req.headers.get("user-agent") || "";
  const isRoblox = ua.includes("Roblox") || req.headers.get("roblox-id") || ua.toLowerCase().includes("axios");
  if (!isRoblox) {
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>SyncAuth</title><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"/></head><body style="margin:0;background:#08090d;color:#fff;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh"><div style="text-align:center;max-width:400px;padding:40px 24px"><div style="width:56px;height:56px;border-radius:50%;background:rgba(0,200,224,.08);display:flex;align-items:center;justify-content:center;margin:0 auto 20px"><i class="fa-solid fa-lock" style="font-size:24px;color:#00c8e0"/></div><h1 style="font-size:20px;font-weight:800;margin:0 0 8px">Access Denied</h1><p style="font-size:13px;color:#94a3b8;line-height:1.6">This script is protected by <b>SyncAuth</b>. Use the key system loader to access it.</p><div style="margin-top:24px;padding:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:8px;font-size:11px;color:#64748b">Protected by SyncAuth License System</div></div></body></html>`;
    return new Response(html, { status: 403, headers: { "content-type": "text/html" } });
  }
  const script = await getScript(id);
  if (!script) return new Response("-- Script not found", { status: 404, headers: { "content-type": "text/plain" } });
  return new Response(script.script_code, { headers: { "content-type": "text/plain" } });
}
