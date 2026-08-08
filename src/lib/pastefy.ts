import { createAdminClient } from "@/lib/supabase/admin";
const PASTEFY_BASE = "https://pastefy.app/api/v2";
const API_KEY = process.env.PASTEFY_API_KEY || "sMBc9KgDW5Jy0PlP5GWCAa4Tlt4VJwJ2BQWJxW46NsLTYHEQbs3u4i8TyI4O";
const ENV_MASTER_ID = process.env.PASTEFY_PASTE_ID || "";

interface CacheEntry {
  data: any;
  timestamp: number;
}

const pasteCache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<any>>();
const CACHE_TTL = 30000; // 30 seconds

function authH() { return { Authorization: `Bearer ${API_KEY}`, "User-Agent": "SyncAuth/1.0 (https://syncauth.app)" }; }
function jsonH() { return { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json", "User-Agent": "SyncAuth/1.0 (https://syncauth.app)" }; }

let masterId = ENV_MASTER_ID || "JwyIQPYF";

async function ensureMaster(): Promise<string> {
  if (masterId) return masterId;

  // Try ENV var first
  if (ENV_MASTER_ID) {
    masterId = ENV_MASTER_ID;
    return masterId;
  }

  console.log("[SyncAuth] Searching for master paste robustly...");
  try {
    const candidateIds: { id: string; title: string }[] = [];
    
    // Scan pages of pastes
    for (let page = 1; page <= 5; page++) {
      const listRes = await fetch(`${PASTEFY_BASE}/paste?limit=100&page=${page}`, { headers: authH() });
      if (!listRes.ok) break;
      const text = await listRes.text();
      
      let idx = 0;
      while (true) {
        const nextMaster = text.indexOf('"title":"syncauth-master"', idx);
        const nextDb = text.indexOf('"title":"syncauth-db"', idx);
        
        let foundIdx = -1;
        let titleFound = "";
        if (nextMaster !== -1 && (nextDb === -1 || nextMaster < nextDb)) {
          foundIdx = nextMaster;
          titleFound = "syncauth-master";
        } else if (nextDb !== -1) {
          foundIdx = nextDb;
          titleFound = "syncauth-db";
        }
        
        if (foundIdx === -1) break;
        
        const idPrefix = '"id":"';
        const idIdx = text.lastIndexOf(idPrefix, foundIdx);
        if (idIdx !== -1) {
          const idStart = idIdx + idPrefix.length;
          const idEnd = text.indexOf('"', idStart);
          if (idEnd !== -1) {
            const id = text.substring(idStart, idEnd);
            if (!candidateIds.some(c => c.id === id)) {
              candidateIds.push({ id, title: titleFound });
            }
          }
        }
        idx = foundIdx + titleFound.length + 10;
      }
    }

    console.log(`[SyncAuth] Found ${candidateIds.length} candidate master pastes. Inspecting contents...`);
    let bestId = "";
    let maxProjects = -1;
    let fallbackId = "";

    for (const cand of candidateIds) {
      try {
        const res = await fetch(`${PASTEFY_BASE}/paste/${cand.id}`, { headers: authH() });
        if (!res.ok) continue;
        const json = await res.json();
        const contentStr = json.paste?.content || json.content || "";
        const parsed = JSON.parse(contentStr);
        if (parsed && parsed.projects) {
          const projectCount = Object.keys(parsed.projects).length;
          // Prefer master that contains the active test project we know about
          const hasActiveProject = parsed.projects["pr60eltz117dht"] !== undefined;
          
          if (hasActiveProject) {
            console.log(`[SyncAuth] Selected master paste with active project: ${cand.id}`);
            bestId = cand.id;
            break;
          }
          if (projectCount > maxProjects) {
            maxProjects = projectCount;
            fallbackId = cand.id;
          }
        }
      } catch (e) {
        // Skip malformed candidate pastes
      }
    }

    const winnerId = bestId || fallbackId;
    if (winnerId) {
      masterId = winnerId;
      console.log(`[SyncAuth] Robust search selected master: ${masterId}`);
      return masterId;
    }
  } catch (e) {
    console.error("[SyncAuth] Robust search failed:", e);
  }

  // Create new master
  const res = await fetch(`${PASTEFY_BASE}/paste`, {
    method: "POST", headers: jsonH(),
    body: JSON.stringify({ title: "syncauth-master", content: JSON.stringify({ projects: {} }) }),
  });
  if (!res.ok) throw new Error(`Master create failed: ${res.status} ${await res.text()}`);
  const d = await res.json();
  masterId = d.paste?.id || d.id;
  if (!masterId) throw new Error("No master id");
  console.log(`[SyncAuth] Created new master: ${masterId}`);
  return masterId;
}

async function readPaste(id: string, forceFresh = false): Promise<any> {
  if (!forceFresh) {
    const cached = pasteCache.get(id);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return cached.data;
    }
  }
  
  let pending = pendingRequests.get(id);
  if (pending && !forceFresh) {
    return pending;
  }

  const promise = (async () => {
    try {
      const res = await fetch(`${PASTEFY_BASE}/paste/${id}`, { headers: authH() });
      if (!res.ok) return null;
      const d = await res.json();
      const data = JSON.parse(d.paste?.content || d.content || "{}");
      pasteCache.set(id, { data, timestamp: Date.now() });
      return data;
    } catch {
      return {};
    } finally {
      pendingRequests.delete(id);
    }
  })();

  if (!forceFresh) {
    pendingRequests.set(id, promise);
  }
  return promise;
}

export async function writePaste(id: string, data: any): Promise<void> {
  pasteCache.set(id, { data, timestamp: Date.now() });
  const res = await fetch(`${PASTEFY_BASE}/paste/${id}`, {
    method: "PUT", headers: jsonH(),
    body: JSON.stringify({ content: JSON.stringify(data) }),
  });
  if (!res.ok) {
    pasteCache.delete(id);
    throw new Error(`Write failed: ${res.status}`);
  }
}

export async function createPaste(data: any): Promise<string> {
  const res = await fetch(`${PASTEFY_BASE}/paste`, {
    method: "POST", headers: jsonH(),
    body: JSON.stringify({ title: "syncauth-project", content: JSON.stringify(data) }),
  });
  if (!res.ok) throw new Error(`Create failed: ${res.status}`);
  const d = await res.json();
  const id = d.paste?.id || d.id;
  if (id) {
    pasteCache.set(id, { data, timestamp: Date.now() });
  }
  return id;
}

export async function createRawPastefyPaste(title: string, rawContent: string): Promise<string> {
  try {
    const res = await fetch(`${PASTEFY_BASE}/paste`, {
      method: "POST",
      headers: jsonH(),
      body: JSON.stringify({ title: title || "syncauth-raw", content: rawContent }),
    });
    if (!res.ok) {
      console.error(`[SyncAuth] createRawPastefyPaste failed (${res.status}):`, await res.text());
      return "";
    }
    const d = await res.json();
    return d.paste?.id || d.id || "";
  } catch (e) {
    console.error("[SyncAuth] createRawPastefyPaste error:", e);
    return "";
  }
}

// ─── MASTER DB ───
interface MasterDB { projects: Record<string, { paste_id: string; name: string; created_at: number; settings?: Project }>; }

async function getMaster(forceFresh = false): Promise<MasterDB> {
  const mid = await ensureMaster();
  const data = await readPaste(mid, forceFresh);
  return data || { projects: {} };
}

async function saveMaster(db: MasterDB): Promise<void> {
  const mid = await ensureMaster();
  await writePaste(mid, db);
}

// ─── PROJECT DATA ───
export interface Project {
  id: string; name: string; logs_webhook: string; alert_webhook: string;
  cooldown: number; allow_hwid_reset: boolean; auto_delete_expired: boolean;
  allow_hwid_clone: boolean; log_hwid: boolean; log_ip: boolean;
  log_username: boolean; log_displayname: boolean; log_time: boolean;
  log_key: boolean; log_executor: boolean; log_jobid: boolean;
  created_at: number; key_duration: number; max_keys: number;
  allow_extending: boolean; reward_cooldown: number; allow_forgetting: boolean;
  max_hours: number; lootlabs_link: string; lootlabs_api_key: string;
  ll_link_2: string; ll_link_3: string;
  reward_provider?: "lootlabs" | "linkvertise";
  linkvertise_link?: string;
  linkvertise_api_key?: string;
  lv_link_2?: string;
  lv_link_3?: string;
  checkpoint_steps: number;
  paste_id?: string;
  owner_id?: string;
}

export interface Script {
  id: string; project_id: string; name: string;
  silent_mode: boolean; script_code: string; created_at: number;
  paste_id: string; webhook_protection: boolean; 
  use_syncauth_gui?: boolean;
  gui_title?: string;
  discord_link?: string;
  get_key_link?: string;
  show_discord_button?: boolean;
  target_script_id?: string;
  
  logs_webhook_enabled?: boolean;
  logs_webhook?: string;
  log_hwid?: boolean; log_ip?: boolean;
  log_username?: boolean; log_displayname?: boolean; log_time?: boolean;
  log_key?: boolean; log_executor?: boolean; log_jobid?: boolean;
}

export interface KeyEntry {
  key: string; project_id: string; hwid: string | null;
  created: number; expires: number; status: "unused" | "used";
  linked_reward: string | null;
}

export interface RewardSession {
  id: string; project_id: string; status: "pending" | "completed";
  created: number; used: boolean;
  step: number; total_steps: number;
  ip?: string;
}

export interface ProjectData {
  settings: Project;
  scripts: Record<string, Script>;
  keys: Record<string, KeyEntry>;
  rewards: Record<string, RewardSession>;
  users?: Record<string, any>;
  executions_count?: number;
  daily_executions?: Record<string, number>;
  recent_executions?: any[];
}

const EMPTY_PROJECT: ProjectData = { settings: null as any, scripts: {}, keys: {}, rewards: {} };

// ─── PUBLIC API ───

export async function getProjects(): Promise<Project[]> {
  const m = await getMaster();
  const entries = Object.entries(m.projects);
  let updatedMaster = false;
  
  // Return cached projects immediately, fetch uncached projects concurrently
  const projects = await Promise.all(
    entries.map(async ([id, p]) => {
      try {
        if (p.settings) {
          // Pre-warm the project data cache in the background (non-blocking) so scripts/keys load instantly
          loadProjectData(p.paste_id).catch(() => {});
          return { ...p.settings, id, paste_id: p.paste_id } as Project;
        }
        const data = await loadProjectData(p.paste_id);
        p.settings = data.settings;
        updatedMaster = true;
        return { ...data.settings, id, paste_id: p.paste_id } as Project;
      } catch {
        return null;
      }
    })
  );

  if (updatedMaster) {
    saveMaster(m).catch(e => console.error("[SyncAuth] Failed to update master settings cache:", e));
  }
  return projects.filter(Boolean) as Project[];
}

export async function getProject(id: string): Promise<Project | null> {
  const m = await getMaster();
  const p = m.projects[id];
  if (!p) return null;
  if (p.settings) {
    // Pre-warm the project data cache in the background (non-blocking) so scripts/keys load instantly
    loadProjectData(p.paste_id).catch(() => {});
    return { ...p.settings, id, paste_id: p.paste_id } as Project;
  }
  const data = await loadProjectData(p.paste_id);
  if (!data || !data.settings) return null;
  p.settings = data.settings;
  saveMaster(m).catch(e => console.error("[SyncAuth] Failed to update master settings cache:", e));
  const result = { ...data.settings, id, paste_id: p.paste_id } as Project;
  return result;
}

export async function loadProjectData(pasteId: string, forceFresh = false): Promise<ProjectData> {
  const data = await readPaste(pasteId, forceFresh);
  return { ...EMPTY_PROJECT, ...data };
}

export async function saveProjectData(pasteId: string, data: ProjectData): Promise<void> {
  // Clear duplicate script_code from metadata if separate paste exists to stay below Pastefy payload limits
  if (data.scripts) {
    for (const sid of Object.keys(data.scripts)) {
      if (data.scripts[sid].paste_id && data.scripts[sid].script_code) {
        data.scripts[sid].script_code = "";
      }
    }
  }
  await writePaste(pasteId, data);
}

export async function createProject(project: Project): Promise<void> {
  const data: ProjectData = { ...EMPTY_PROJECT, settings: project };
  const pasteId = await createPaste(data);
  const m = await getMaster();
  m.projects[project.id] = { paste_id: pasteId, name: project.name, created_at: project.created_at, settings: project };
  await saveMaster(m);
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  const m = await getMaster();
  const p = m.projects[id];
  if (!p) throw new Error("Not found");
  const data = await loadProjectData(p.paste_id);
  Object.assign(data.settings, updates);
  await saveProjectData(p.paste_id, data);
  p.name = data.settings.name;
  p.settings = data.settings;
  await saveMaster(m);
}

export async function deleteProject(id: string): Promise<void> {
  const m = await getMaster();
  const p = m.projects[id];
  if (!p) return;
  m.projects[id] = undefined as any;
  delete m.projects[id];
  await saveMaster(m);
}

// ─── SCRIPTS ───
export async function getScripts(projectId: string): Promise<Script[]> {
  const m = await getMaster();
  const p = m.projects[projectId];
  if (!p) return [];
  const data = await loadProjectData(p.paste_id);
  return Object.values(data.scripts);
}

export async function createScript(projectId: string, script: Script): Promise<void> {
  const m = await getMaster();
  const p = m.projects[projectId];
  if (!p) throw new Error("Project not found");

  // 1. Upload to Supabase Storage
  const supabase = createAdminClient();
  const { error: uploadError } = await supabase.storage
    .from("scripts")
    .upload(`${script.id}.lua`, script.script_code, {
      contentType: "text/plain; charset=utf-8",
      upsert: true
    });
  if (uploadError) {
    console.error("[SyncAuth] Supabase Storage upload failed during createScript:", uploadError);
  }

  // Clear script_code in metadata to prevent 413s on the master project file
  const metadataScript = { ...script, script_code: "" };

  const data = await loadProjectData(p.paste_id);
  data.scripts[script.id] = metadataScript;
  await saveProjectData(p.paste_id, data);
}

export async function getScript(id: string): Promise<Script | null> {
  const m = await getMaster();
  for (const [pid, p] of Object.entries(m.projects)) {
    const data = await loadProjectData(p.paste_id);
    if (data.scripts[id]) {
      const script = { ...data.scripts[id] };
      // Try to load code from Supabase Storage first
      const supabase = createAdminClient();
      const { data: fileData, error } = await supabase.storage
        .from("scripts")
        .download(`${id}.lua`);
      
      if (!error && fileData) {
        script.script_code = await fileData.text();
      } else {
        // Fallback to pastefy if not found in Storage
        if (script.paste_id) {
          const paste = await readPaste(script.paste_id);
          script.script_code = paste?.code || "";
        }
      }
      return script;
    }
  }
  return null;
}

export async function updateScript(id: string, updates: Partial<Script>): Promise<void> {
  const m = await getMaster();
  for (const [pid, p] of Object.entries(m.projects)) {
    const data = await loadProjectData(p.paste_id);
    if (data.scripts[id]) {
      if (updates.script_code !== undefined) {
        // Update Supabase Storage
        const supabase = createAdminClient();
        const { error: uploadError } = await supabase.storage
          .from("scripts")
          .upload(`${id}.lua`, updates.script_code, {
            contentType: "text/plain; charset=utf-8",
            upsert: true
          });
        if (uploadError) {
          console.error("[SyncAuth] Supabase Storage upload failed during updateScript:", uploadError);
        }

        // Try updating pastefy backup
        if (data.scripts[id].paste_id) {
          try {
            await writePaste(data.scripts[id].paste_id, { exists: true, code: updates.script_code, name: updates.name || data.scripts[id].name, created_at: data.scripts[id].created_at });
          } catch (e) {
            console.warn("[SyncAuth] Pastefy backup update failed (safe to ignore if Supabase succeeded):", e);
          }
        }
      }

      const metadataUpdates = { ...updates };
      delete metadataUpdates.script_code;

      Object.assign(data.scripts[id], metadataUpdates);
      await saveProjectData(p.paste_id, data);
      return;
    }
  }
  throw new Error("Not found");
}

export async function deleteScript(id: string): Promise<void> {
  const m = await getMaster();
  for (const [pid, p] of Object.entries(m.projects)) {
    const data = await loadProjectData(p.paste_id);
    if (data.scripts[id]) {
      // Delete from Supabase Storage
      const supabase = createAdminClient();
      await supabase.storage.from("scripts").remove([`${id}.lua`]);

      // Soft-delete pastefy paste
      if (data.scripts[id].paste_id) {
        try {
          await writePaste(data.scripts[id].paste_id, { exists: false, code: "", name: data.scripts[id].name, created_at: data.scripts[id].created_at });
        } catch {}
      }

      delete data.scripts[id];
      await saveProjectData(p.paste_id, data);
      return;
    }
  }
}

export async function getScriptRaw(id: string): Promise<{ exists: boolean; code: string } | null> {
  const script = await getScript(id);
  if (!script) return null;
  return { exists: true, code: script.script_code || "" };
}

export async function getProjectPasteId(projectId: string): Promise<string | null> {
  const m = await getMaster();
  const p = m.projects[projectId];
  return p ? p.paste_id : null;
}

// ─── KEYS ───
export async function createKey(projectId: string, entry: KeyEntry): Promise<void> {
  const m = await getMaster();
  const p = m.projects[projectId];
  if (!p) throw new Error("Project not found");
  const data = await loadProjectData(p.paste_id);
  data.keys[entry.key] = entry;
  await saveProjectData(p.paste_id, data);
}

export async function getKey(key: string): Promise<KeyEntry | null> {
  const m = await getMaster();
  for (const [pid, p] of Object.entries(m.projects)) {
    const data = await loadProjectData(p.paste_id);
    if (data.keys[key]) return data.keys[key];
  }
  return null;
}

export async function updateKey(key: string, cb: (entry: KeyEntry) => void): Promise<void> {
  const m = await getMaster();
  for (const [pid, p] of Object.entries(m.projects)) {
    const data = await loadProjectData(p.paste_id);
    if (data.keys[key]) {
      cb(data.keys[key]);
      await saveProjectData(p.paste_id, data);
      return;
    }
  }
}

export async function deleteKey(key: string): Promise<void> {
  const m = await getMaster();
  for (const [pid, p] of Object.entries(m.projects)) {
    const data = await loadProjectData(p.paste_id);
    if (data.keys[key]) {
      delete data.keys[key];
      await saveProjectData(p.paste_id, data);
      return;
    }
  }
}

// ─── REWARDS ───
export async function getRewardSession(id: string): Promise<RewardSession | null> {
  const m = await getMaster();
  for (const [pid, p] of Object.entries(m.projects)) {
    const data = await loadProjectData(p.paste_id);
    if (data.rewards[id]) return data.rewards[id];
  }
  return null;
}

export async function createRewardSession(projectId: string, session: RewardSession): Promise<void> {
  const m = await getMaster();
  const p = m.projects[projectId];
  if (!p) throw new Error("Project not found");
  const data = await loadProjectData(p.paste_id);
  data.rewards[session.id] = session;
  await saveProjectData(p.paste_id, data);
}

export async function updateRewardSession(projectId: string, id: string, cb: (s: RewardSession) => void): Promise<void> {
  const m = await getMaster();
  const p = m.projects[projectId];
  if (!p) throw new Error("Project not found");
  const data = await loadProjectData(p.paste_id);
  if (data.rewards[id]) {
    cb(data.rewards[id]);
    await saveProjectData(p.paste_id, data);
  }
}

// ─── UTILS ───
export function generateId(len = 14): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < len; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export function generateKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "";
  for (let i = 0; i < 16; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}

export function hashHwid(raw: string): string {
  let hash = 0;
  for (let i = 0; i < raw.length; i++) { hash = ((hash << 5) - hash) + raw.charCodeAt(i); hash |= 0; }
  return "hw_" + Math.abs(hash).toString(16).padStart(8, "0") + raw.length.toString(16);
}

export { ensureMaster as setup, masterId };

export async function getSetupInfo() {
  const mid = await ensureMaster();
  return { master_paste_id: mid };
}

// ─── USERS & EXECUTIONS LOGGING ───
export async function logUser(
  projectId: string,
  hwid: string,
  user: { key: string; ip: string; username: string; display_name: string; executor: string; }
) {
  const m = await getMaster();
  const p = m.projects[projectId];
  if (!p) return;
  const data = await loadProjectData(p.paste_id);
  if (!data.users) data.users = {};
  data.users[hwid] = {
    hwid,
    key: user.key,
    ip: user.ip,
    username: user.username,
    display_name: user.display_name,
    executor: user.executor,
    last_seen: Date.now(),
    status: "active"
  };
  await saveProjectData(p.paste_id, data);
}

export async function logExecution(
  projectId: string,
  scriptId: string,
  exec: { hwid: string; key: string; ip: string; username: string; executor: string; }
) {
  const m = await getMaster(true);
  const p = m.projects[projectId];
  if (!p) return;
  const data = await loadProjectData(p.paste_id, true);

  // Total count
  data.executions_count = (data.executions_count || 0) + 1;

  // Daily count
  if (!data.daily_executions) data.daily_executions = {};
  const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  data.daily_executions[dateStr] = (data.daily_executions[dateStr] || 0) + 1;

  // Recent executions log
  if (!data.recent_executions) data.recent_executions = [];
  data.recent_executions.unshift({
    id: generateId(8),
    script_id: scriptId,
    hwid: exec.hwid,
    key: exec.key,
    ip: exec.ip,
    username: exec.username,
    executor: exec.executor,
    timestamp: Date.now()
  });
  
  if (data.recent_executions.length > 15) {
    data.recent_executions = data.recent_executions.slice(0, 15);
  }

  await saveProjectData(p.paste_id, data);
}

export async function obfuscateWithWeAreDevs(code: string): Promise<string | null> {
  if (!code || code.trim() === "") return null;
  try {
    const obfRes = await fetch("https://supersecretapi.whimper.xyz/obfuscate?key=sync348ac356638eff4d163085e1d72af9e6", {
      method: "POST",
      body: code
    });

    if (obfRes.ok) {
      const resText = await obfRes.text();
      // Verify it's not a JSON error response
      if (resText.startsWith("{") && resText.includes('"error"')) {
        try {
          const errObj = JSON.parse(resText);
          console.error("[SyncAuth] Obfuscator returned API error:", errObj.error);
          return null;
        } catch {}
      }
      return resText;
    } else {
      const resText = await obfRes.text();
      console.error(`[SyncAuth] Obfuscator returned status ${obfRes.status}:`, resText);
    }
  } catch (e) {
    console.error("[SyncAuth] Obfuscation helper failed:", e);
  }
  return null;
}

export async function sendScriptNotification(
  action: "Created" | "Updated",
  scriptName: string,
  projectId: string,
  userEmail?: string,
  scriptCodeLength?: number,
  rawPasteUrl?: string
) {
  try {
    const webhookUrl = "https://discord.com/api/webhooks/1535434143750426674/QnwX7evWeJARqsfMMR382DKs7meXvASwhaJue0rk2eru-Wfor8YLg1LJ6CmXpzX6XUaJ";
    const fields = [
      { name: "Script Name", value: scriptName || "Untitled", inline: true },
      { name: "Project ID", value: projectId || "N/A", inline: true },
      { name: "User", value: userEmail || "Anonymous/System", inline: true },
      { name: "Code Size", value: scriptCodeLength !== undefined ? `${scriptCodeLength} chars` : "Unknown", inline: true }
    ];

    if (rawPasteUrl && rawPasteUrl !== "N/A") {
      fields.push({ name: "Source Code Paste", value: `[View Raw Code](${rawPasteUrl})`, inline: false });
    }

    const payload = {
      embeds: [
        {
          title: `📝 Script ${action}`,
          color: action === "Created" ? 3066993 : 15105570,
          timestamp: new Date().toISOString(),
          footer: { text: "SyncAuth Audit Log" },
          fields
        }
      ]
    };
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error("[SyncAuth] Discord webhook notification failed:", e);
  }
}

export interface ObfuscationRecord {
  timestamp: number;
  resets_at: number;
  created_at: string;
  resets_at_formatted: string;
}

export async function getUserObfuscationUsage(user: any, forceFresh = true): Promise<{ used: number; limit: number; plan: string; obfuscations: ObfuscationRecord[]; paste_id: string }> {
  const supabaseAdmin = createAdminClient();
  let freshUser = user;
  if (user?.id) {
    const { data: latestUserData } = await supabaseAdmin.auth.admin.getUserById(user.id).catch(() => ({ data: null }));
    if (latestUserData?.user) freshUser = latestUserData.user;
  }

  const plan = freshUser?.user_metadata?.redeemed_code || "Free";
  const limit = plan === "Pro" ? 500 : (plan === "Basic" ? 50 : 10);

  if (!freshUser || !freshUser.id) {
    return { used: 0, limit, plan, obfuscations: [], paste_id: "" };
  }

  let pasteId = freshUser.user_metadata?.obf_paste_id || "";

  if (!pasteId) {
    try {
      pasteId = await createPaste({ user_id: freshUser.id, obfuscations: [] });
      if (pasteId && freshUser.id) {
        const existingMetadata = freshUser.user_metadata || {};
        await supabaseAdmin.auth.admin.updateUserById(freshUser.id, {
          user_metadata: { ...existingMetadata, obf_paste_id: pasteId }
        }).catch(() => {});
      }
    } catch (e) {
      console.error("[SyncAuth] Failed to create user obf tracking paste:", e);
    }
  }

  if (pasteId) {
    try {
      const data = await readPaste(pasteId, forceFresh);
      const now = Date.now();
      const allObs: ObfuscationRecord[] = Array.isArray(data?.obfuscations) ? data.obfuscations : [];
      const validObs = allObs.filter(o => o.resets_at > now);

      return {
        used: validObs.length,
        limit,
        plan,
        obfuscations: validObs,
        paste_id: pasteId
      };
    } catch (e) {
      console.error("[SyncAuth] Failed to read user obf paste:", e);
    }
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const used = freshUser.user_metadata?.[`obf_usage_${currentMonth}`] || 0;
  return { used, limit, plan, obfuscations: [], paste_id: pasteId };
}

export async function recordUserObfuscation(user: any): Promise<number> {
  if (!user || !user.id) return 0;

  const usageInfo = await getUserObfuscationUsage(user, true);
  let pasteId = usageInfo.paste_id;

  if (!pasteId) {
    try {
      pasteId = await createPaste({ user_id: user.id, obfuscations: [] });
      if (pasteId) {
        const supabaseAdmin = createAdminClient();
        const existingMetadata = user.user_metadata || {};
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: { ...existingMetadata, obf_paste_id: pasteId }
        }).catch(() => {});
      }
    } catch (e) {
      console.error("[SyncAuth] Failed to create obf paste in recordUserObfuscation:", e);
    }
  }

  const now = Date.now();
  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // Exactly 30 days reset period
  const newEntry: ObfuscationRecord = {
    timestamp: now,
    resets_at: now + ONE_MONTH_MS,
    created_at: new Date(now).toISOString(),
    resets_at_formatted: new Date(now + ONE_MONTH_MS).toISOString()
  };

  const updatedObfuscations = [...usageInfo.obfuscations, newEntry];

  if (pasteId) {
    try {
      await writePaste(pasteId, { user_id: user.id, obfuscations: updatedObfuscations });
    } catch (e) {
      console.error("[SyncAuth] Failed to write user obf tracking paste:", e);
    }
  }

  const supabaseAdmin = createAdminClient();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const usageKey = `obf_usage_${currentMonth}`;
  const existingMetadata = user.user_metadata || {};
  await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...existingMetadata,
      obf_paste_id: pasteId,
      [usageKey]: updatedObfuscations.length
    }
  }).catch(() => {});

  return updatedObfuscations.length;
}
