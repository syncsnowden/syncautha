const PASTEFY_BASE = "https://pastefy.app/api/v2";
const API_KEY = process.env.PASTEFY_API_KEY || "sMBc9KgDW5Jy0PlP5GWCAa4Tlt4VJwJ2BQWJxW46NsLTYHEQbs3u4i8TyI4O";
let PASTE_ID = process.env.PASTEFY_PASTE_ID || "";

const headers = { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" };

export interface Project {
  id: string;
  name: string;
  logs_webhook: string;
  alert_webhook: string;
  cooldown: number;
  allow_hwid_reset: boolean;
  auto_delete_expired: boolean;
  allow_hwid_clone: boolean;
  log_hwid: boolean;
  log_ip: boolean;
  log_username: boolean;
  log_displayname: boolean;
  log_time: boolean;
  log_key: boolean;
  log_executor: boolean;
  log_jobid: boolean;
  created_at: number;
}

export interface Script {
  id: string;
  project_id: string;
  name: string;
  silent_mode: boolean;
  script_code: string;
  created_at: number;
}

export interface KeyEntry {
  key: string;
  project_id: string;
  hwid: string | null;
  created: number;
  expires: number;
  status: "unused" | "used";
  linked_reward: string | null;
}

export interface RewardSession {
  id: string;
  project_id: string;
  status: "pending" | "completed";
  created: number;
  used: boolean;
}

export interface DB {
  projects: Record<string, Project>;
  scripts: Record<string, Script>;
  keys: Record<string, KeyEntry>;
  rewards: Record<string, RewardSession>;
}

const EMPTY_DB: DB = { projects: {}, scripts: {}, keys: {}, rewards: {} };

async function fetchDB(): Promise<DB> {
  if (!PASTE_ID) {
    const res = await fetch(`${PASTEFY_BASE}/paste`, {
      method: "POST",
      headers,
      body: JSON.stringify({ title: "syncauth-db", content: JSON.stringify(EMPTY_DB), visibility: "unlisted" }),
    });
    if (!res.ok) throw new Error(`Pastefy create failed: ${res.status}`);
    const data = await res.json();
    PASTE_ID = data.id || data.paste?.id;
    if (!PASTE_ID) throw new Error("Failed to create Pastefy paste");
    return EMPTY_DB;
  }

  const res = await fetch(`${PASTEFY_BASE}/paste/${PASTE_ID}`, { headers });
  if (!res.ok) {
    PASTE_ID = "";
    return fetchDB();
  }
  const data = await res.json();
  try {
    return JSON.parse(data.content || data.paste?.content || "{}");
  } catch {
    return EMPTY_DB;
  }
}

async function saveDB(db: DB): Promise<void> {
  if (!PASTE_ID) throw new Error("No paste ID");
  const res = await fetch(`${PASTEFY_BASE}/paste/${PASTE_ID}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ content: JSON.stringify(db) }),
  });
  if (!res.ok) throw new Error(`Pastefy save failed: ${res.status}`);
}

let cache: DB | null = null;

export async function getDB(): Promise<DB> {
  if (!cache) cache = await fetchDB();
  return cache;
}

export async function updateDB(updater: (db: DB) => void): Promise<DB> {
  const db = await getDB();
  updater(db);
  await saveDB(db);
  return db;
}

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
  for (let i = 0; i < raw.length; i++) {
    const ch = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return "hw_" + Math.abs(hash).toString(16).padStart(8, "0") + raw.length.toString(16);
}
