import { getScript } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Block browser access — only allow Roblox/executor User-Agents
  const ua = req.headers.get("user-agent") || "";
  const isRoblox = ua.includes("Roblox") || req.headers.get("roblox-id") || ua.toLowerCase().includes("axios");
  if (!isRoblox) {
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SyncAuth</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',-apple-system,sans-serif;background:#06080d;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center}.card{text-align:center;padding:48px 32px;max-width:420px}.icon-wrap{width:64px;height:64px;border-radius:50%;background:rgba(0,200,224,.06);border:1px solid rgba(0,200,224,.12);display:flex;align-items:center;justify-content:center;margin:0 auto 24px}.icon-wrap i{font-size:26px;color:#00c8e0}h1{font-size:22px;font-weight:700;letter-spacing:-.01em;margin-bottom:8px}p{font-size:14px;color:#64748b;line-height:1.7}.footer{margin-top:32px;padding:14px 20px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05);border-radius:10px;font-size:12px;font-weight:500;color:#334155;letter-spacing:.02em}</style></head><body><div class="card"><div class="icon-wrap"><i class="fa-solid fa-shield-halved"></i></div><h1>Access Denied</h1><p>This script is protected by <strong style="color:#00c8e0">SyncAuth</strong>. Direct access is blocked. Use the key system loader to authenticate and run this script.</p><div class="footer">SYNCAUTH · LICENSE PROTECTION</div></div></body></html>`;
    return new Response(html, { status: 403, headers: { "content-type": "text/html" } });
  }
  const script = await getScript(id);
  if (!script) return new Response("-- Script not found", { status: 404, headers: { "content-type": "text/plain" } });
  return new Response(script.script_code, { headers: { "content-type": "text/plain" } });
}
