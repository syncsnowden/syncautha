const PASTEFY_BASE = "https://pastefy.app/api/v2";
const API_KEY = process.env.PASTEFY_API_KEY || "sMBc9KgDW5Jy0PlP5GWCAa4Tlt4VJwJ2BQWJxW46NsLTYHEQbs3u4i8TyI4O";
const ENV_MASTER_ID = process.env.PASTEFY_PASTE_ID || "";

function authH() { return { Authorization: `Bearer ${API_KEY}` }; }
function jsonH() { return { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" }; }

let masterId = ENV_MASTER_ID;

async function ensureMaster(): Promise<string> {
  if (masterId) return masterId;

  // Try to find an existing master paste by searching
  try {
    const searchRes = await fetch(
      `${PASTEFY_BASE}/paste?search=syncauth-master&limit=5`,
      { headers: authH() }
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const items = searchData.items || searchData.data || [];
      if (items.length > 0) {
        masterId = items[0].id || items[0].paste?.id;
        if (masterId) {
          console.log(`[SyncAuth] Found existing master: ${masterId}`);
          return masterId;
        }
      }
    }
  } catch {}

  // Create new master paste
  const res = await fetch(`${PASTEFY_BASE}/paste`, {
    method: "POST", headers: jsonH(),
    body: JSON.stringify({ title: "syncauth-master", content: JSON.stringify({ projects: {} }) }),
  });
  if (!res.ok) throw new Error(`Master create failed: ${res.status}`);
  const d = await res.json();
  masterId = d.paste?.id || d.id;
  if (!masterId) throw new Error("No master id");
  console.log(`[SyncAuth] Created master: ${masterId}`);
  console.log(`[SyncAuth] ⚠️ Set PASTEFY_PASTE_ID=${masterId} on Vercel for guaranteed persistence`);
  return masterId;
}

async function readPaste(id: string): Promise<any> {
  const res = await fetch(`${PASTEFY_BASE}/paste/${id}`, { headers: authH() });
  if (!res.ok) return null;
  const d = await res.json();
  try { return JSON.parse(d.paste?.content || d.content || "{}"); } catch { return {}; }
}

async function writePaste(id: string, data: any): Promise<void> {
  const res = await fetch(`${PASTEFY_BASE}/paste/${id}`, {
    method: "PUT", headers: jsonH(),
    body: JSON.stringify({ content: JSON.stringify(data) }),
  });
  if (!res.ok) throw new Error(`Write failed: ${res.status}`);
}

async function createPaste(data: any): Promise<string> {
  const res = await fetch(`${PASTEFY_BASE}/paste`, {
    method: "POST", headers: jsonH(),
    body: JSON.stringify({ title: "syncauth-project", content: JSON.stringify(data) }),
  });
  if (!res.ok) throw new Error(`Create failed: ${res.status}`);
  const d = await res.json();
  return d.paste?.id || d.id;
}

// ─── MASTER DB ───
interface MasterDB { projects: Record<string, { paste_id: string; name: string; created_at: number }>; }

async function getMaster(): Promise<MasterDB> {
  const mid = await ensureMaster();
  const data = await readPaste(mid);
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
  max_hours: number; lootlabs_link: string;
}

export interface Script {
  id: string; project_id: string; name: string;
  silent_mode: boolean; script_code: string; created_at: number;
}

export interface KeyEntry {
  key: string; project_id: string; hwid: string | null;
  created: number; expires: number; status: "unused" | "used";
  linked_reward: string | null;
}

export interface RewardSession {
  id: string; project_id: string; status: "pending" | "completed";
  created: number; used: boolean;
}

interface ProjectData {
  settings: Project;
  scripts: Record<string, Script>;
  keys: Record<string, KeyEntry>;
  rewards: Record<string, RewardSession>;
}

const EMPTY_PROJECT: ProjectData = { settings: null as any, scripts: {}, keys: {}, rewards: {} };

// ─── PUBLIC API ───

export async function getProjects(): Promise<Project[]> {
  const m = await getMaster();
  return Object.entries(m.projects).map(([id, p]) => ({ ...p, id } as unknown as Project));
}

export async function getProject(id: string): Promise<Project | null> {
  const m = await getMaster();
  const p = m.projects[id];
  if (!p) return null;
  return { ...p, id } as unknown as Project;
}

async function loadProjectData(pasteId: string): Promise<ProjectData> {
  const data = await readPaste(pasteId);
  return { ...EMPTY_PROJECT, ...data };
}

async function saveProjectData(pasteId: string, data: ProjectData): Promise<void> {
  await writePaste(pasteId, data);
}

export async function createProject(project: Project): Promise<void> {
  const data: ProjectData = { ...EMPTY_PROJECT, settings: project };
  const pasteId = await createPaste(data);
  const m = await getMaster();
  m.projects[project.id] = { paste_id: pasteId, name: project.name, created_at: project.created_at };
  await saveMaster(m);
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  const m = await getMaster();
  const p = m.projects[id];
  if (!p) throw new Error("Not found");
  const data = await loadProjectData(p.paste_id);
  Object.assign(data.settings, updates);
  await saveProjectData(p.paste_id, data);
  m.projects[id].name = data.settings.name;
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
      delete data.scripts[id];
      await saveProjectData(p.paste_id, data);
      return;
    }
  }
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
