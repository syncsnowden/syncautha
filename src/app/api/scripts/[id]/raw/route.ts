import { getScript, getProject, getProjectPasteId, loadProjectData, hashHwid, getScriptRaw, logExecution } from "@/lib/pastefy";
import { encryptWebhook } from "@/lib/crypto";

export const dynamic = "force-dynamic";

const DELETED = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SyncAuth</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',-apple-system,sans-serif;background:#06080d;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center}.card{text-align:center;padding:48px 32px;max-width:420px}.icon-wrap{width:64px;height:64px;border-radius:50%;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.12);display:flex;align-items:center;justify-content:center;margin:0 auto 24px}.icon-wrap i{font-size:26px;color:#ef4444}h1{font-size:22px;font-weight:700;letter-spacing:-.01em;margin-bottom:8px}p{font-size:14px;color:#64748b;line-height:1.7}.footer{margin-top:32px;padding:14px 20px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05);border-radius:10px;font-size:12px;font-weight:500;color:#334155;letter-spacing:.02em}</style></head><body><div class="card"><div class="icon-wrap"><i class="fa-solid fa-trash"></i></div><h1>Script Deleted</h1><p>This script has been <strong style="color:#ef4444">deleted</strong> by the owner and is no longer available.</p><div class="footer">SYNCAUTH · LICENSE PROTECTION</div></div></body></html>`;

const DENIED = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SyncAuth</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',-apple-system,sans-serif;background:#06080d;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center}.card{text-align:center;padding:48px 32px;max-width:420px}.icon-wrap{width:64px;height:64px;border-radius:50%;background:rgba(0,200,224,.06);border:1px solid rgba(0,200,224,.12);display:flex;align-items:center;justify-content:center;margin:0 auto 24px}.icon-wrap i{font-size:26px;color:#00c8e0}h1{font-size:22px;font-weight:700;letter-spacing:-.01em;margin-bottom:8px}p{font-size:14px;color:#64748b;line-height:1.7}.footer{margin-top:32px;padding:14px 20px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05);border-radius:10px;font-size:12px;font-weight:500;color:#334155;letter-spacing:.02em}</style></head><body><div class="card"><div class="icon-wrap"><i class="fa-solid fa-shield-halved"></i></div><h1>Access Denied</h1><p>This script is protected by <strong style="color:#00c8e0">SyncAuth</strong>. Direct access is blocked. Use the key system loader to authenticate and run this script.</p><div class="footer">SYNCAUTH · LICENSE PROTECTION</div></div></body></html>`;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ua = req.headers.get("user-agent") || "";
  const isRoblox = ua.includes("Roblox") || req.headers.get("roblox-id") || ua.toLowerCase().includes("axios");

  const script = await getScript(id);
  if (!script) {
    return new Response("-- Script not found", { status: 404, headers: { "content-type": "text/plain" } });
  }

  const data = await getScriptRaw(id);
  if (!data) return new Response("-- Script not found", { status: 404, headers: { "content-type": "text/plain" } });
  if (!data.exists) return new Response(DELETED, { status: 404, headers: { "content-type": "text/html" } });

  if (!isRoblox) return new Response(DENIED, { status: 403, headers: { "content-type": "text/html" } });

  // Get project to check keys and validate request hwid
  const project = await getProject(script.project_id);
  if (!project) return new Response("-- Project not found", { status: 404, headers: { "content-type": "text/plain" } });

  const pasteId = await getProjectPasteId(script.project_id);
  if (!pasteId) return new Response("-- Project not found", { status: 404, headers: { "content-type": "text/plain" } });

  const url = new URL(req.url);
  const hwid = url.searchParams.get("hwid") || "";
  if (!script.keyless_mode && !hwid) {
    return new Response('error("SyncAuth Access Denied: Missing HWID parameter. You must run this script via the Loader, not directly.")', { status: 403, headers: { "content-type": "text/plain" } });
  }

  const username = url.searchParams.get("username") || "RobloxPlayer";
  const executor = url.searchParams.get("executor") || "Unknown";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
             req.headers.get("x-real-ip") || 
             "127.0.0.1";

  const projectData = await loadProjectData(pasteId);
  const hashed = hwid ? hashHwid(hwid) : "keyless-user";

  let matchingKeyEntry = null;

  if (!script.keyless_mode) {
    // Search if a valid non-expired key session exists for this hashed HWID
    matchingKeyEntry = Object.values(projectData.keys).find((entry: any) =>
      entry.hwid === hashed &&
      (entry.status === "used" || entry.status === "active") &&
      entry.expires > Date.now()
    );

    if (!matchingKeyEntry) {
      return new Response('error("SyncAuth Access Denied: No active key session found for this HWID.")', { status: 403, headers: { "content-type": "text/plain" } });
    }
  }

  // Log execution asynchronously (non-blocking) to count stats
  logExecution(script.project_id, id, {
    hwid: hashed,
    key: matchingKeyEntry?.key || "keyless",
    ip,
    username,
    executor
  }).catch(err => console.error("[SyncAuth] Failed to log execution:", err));

  let code = data.code || "";
  
  // SyncAuth Auto-Safety Injector: Automatically prevents user scripts from crashing on failed loadstrings
  const safetyPolyfill = `-- [SyncAuth Auto-Safety Injector] --
local __original_loadstring = loadstring
local loadstring = function(source, chunkname)
    if not source or type(source) ~= "string" or source == "" then
        return function() warn("[SyncAuth Auto-Fix] Prevented crash: Script attempted to load and execute an empty or missing remote file.") end
    end
    local func, err = __original_loadstring(source, chunkname)
    if not func then
        return function() warn("[SyncAuth Auto-Fix] Prevented crash: Syntax error in loaded code ->", err) end
    end
    return func
end
-------------------------------------
`;

  code = safetyPolyfill + code;
  if (script.webhook_protection) {
    const siteUrl = (() => {
      if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
      const host = req.headers.get("host") || "syncauth-eight.vercel.app";
      return `https://${host}`;
    })();
    const webhookRegex = /https?:\/\/(?:discord|discordapp)\.com\/api\/webhooks\/(\d+)\/([A-Za-z0-9_-]+)/g;
    code = code.replace(webhookRegex, (match) => {
      const encrypted = encryptWebhook(match);
      return `${siteUrl}/api/webhooks/proxy?w=${encodeURIComponent(encrypted)}`;
    });
  }

  return new Response(code, { headers: { "content-type": "text/plain" } });
}
