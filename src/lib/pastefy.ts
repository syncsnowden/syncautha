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

function authH() { return { Authorization: `Bearer ${API_KEY}` }; }
function jsonH() { return { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" }; }

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

async function writePaste(id: string, data: any): Promise<void> {
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

async function createPaste(data: any): Promise<string> {
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
  // Create separate paste for script
  const pasteId = await createPaste({ exists: true, code: script.script_code, name: script.name, created_at: script.created_at });
  script.paste_id = pasteId;
  const data = await loadProjectData(p.paste_id);
  data.scripts[script.id] = script;
  await saveProjectData(p.paste_id, data);
}

export async function getScript(id: string): Promise<Script | null> {
  const m = await getMaster();
  for (const [pid, p] of Object.entries(m.projects)) {
    const data = await loadProjectData(p.paste_id);
    if (data.scripts[id]) return data.scripts[id];
  }
  return null;
}

export async function updateScript(id: string, updates: Partial<Script>): Promise<void> {
  const m = await getMaster();
  for (const [pid, p] of Object.entries(m.projects)) {
    const data = await loadProjectData(p.paste_id);
    if (data.scripts[id]) {
      Object.assign(data.scripts[id], updates);
      // Also update the script's own paste if code changed
      if (updates.script_code !== undefined && data.scripts[id].paste_id) {
        await writePaste(data.scripts[id].paste_id, { exists: true, code: updates.script_code, name: data.scripts[id].name, created_at: data.scripts[id].created_at });
      }
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
      // Soft-delete: mark the script paste as inactive
      if (data.scripts[id].paste_id) {
        await writePaste(data.scripts[id].paste_id, { exists: false, code: "", name: data.scripts[id].name, created_at: data.scripts[id].created_at });
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
  if (!script.paste_id) {
    return { exists: true, code: script.script_code || "" };
  }
  const paste = await readPaste(script.paste_id);
  if (!paste) return null;
  return { exists: paste.exists !== false, code: paste.code || "" };
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
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    
    // 1. Visit main page to warm up connection, headers, and cookies
    const pageRes = await fetch("https://wearedevs.net/obfuscator", {
      headers: { "User-Agent": userAgent }
    });
    
    let cookies: string[] = [];
    if (typeof pageRes.headers.getSetCookie === "function") {
      cookies = pageRes.headers.getSetCookie();
    } else {
      const rawCookie = pageRes.headers.get("set-cookie");
      if (rawCookie) cookies = [rawCookie];
    }
    const cookieHeader = cookies.map(c => c.split(";")[0]).join("; ");

    // 2. Perform obfuscation request
    const obfRes = await fetch("https://wearedevs.net/api/obfuscate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": userAgent,
        "Cookie": cookieHeader,
        "Referer": "https://wearedevs.net/obfuscator",
        "Origin": "https://wearedevs.net",
        "Accept": "application/json, text/plain, */*"
      },
      body: JSON.stringify({ script: code })
    });

    if (obfRes.ok) {
      const resText = await obfRes.text();
      try {
        const obfData = JSON.parse(resText);
        if (obfData.obfuscated) {
          return obfData.obfuscated;
        }
      } catch {
        if (resText && !resText.includes("<!DOCTYPE html>") && !resText.includes("<html")) {
          return resText;
        }
      }
      console.error("[SyncAuth] Obfuscator returned success = false or HTML payload:", resText.slice(0, 500));
    } else {
      console.error(`[SyncAuth] Obfuscator returned status ${obfRes.status}: ${obfRes.statusText}`);
    }
  } catch (e) {
    console.error("[SyncAuth] Obfuscation helper failed:", e);
  }
  return null;
}
