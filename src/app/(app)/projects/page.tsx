"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Project {
  id: string; name: string; logs_webhook: string; alert_webhook: string;
  cooldown: number; allow_hwid_reset: boolean; auto_delete_expired: boolean;
  allow_hwid_clone: boolean; log_hwid: boolean; log_ip: boolean; log_username: boolean;
  log_displayname: boolean; log_time: boolean; log_key: boolean; log_executor: boolean;
  log_jobid: boolean; created_at: number; key_duration: number; max_keys: number;
  allow_extending: boolean; reward_cooldown: number; allow_forgetting: boolean;
  max_hours: number;
}

const defaultForm = {
  name: "", logs_webhook: "", alert_webhook: "", cooldown: "0",
  allow_hwid_reset: false, auto_delete_expired: false, allow_hwid_clone: false,
  log_hwid: true, log_ip: true, log_username: true, log_displayname: false,
  log_time: true, log_key: true, log_executor: true, log_jobid: false,
  key_duration: "24", max_keys: "3", allow_extending: false,
  reward_cooldown: "0", allow_forgetting: false, max_hours: "0",
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [obfUsage, setObfUsage] = useState<{ used: number; limit: number; plan: string } | null>(null);

  useEffect(() => {
    loadProjects();
    const fetchUsage = async () => {
      try {
        const { getSupabase } = await import("@/lib/supabase/client");
        const sb = getSupabase();
        const { data: { session } } = await sb.auth.getSession();
        let token = session?.access_token || "";
        
        if (!token) {
          const raw = localStorage.getItem("syncauth_session");
          if (raw) token = JSON.parse(raw)?.access_token || "";
        }
        
        if (token) {
          const r = await fetch("/api/obf-usage", { headers: { Authorization: `Bearer ${token}` } });
          if (r.ok) {
            const d = await r.json();
            if (d?.used !== undefined) setObfUsage(d);
          }
        }
      } catch (e) {
        console.error("Obf usage fetch failed", e);
      }
    };
    fetchUsage();
  }, []);

  async function loadProjects() {
    const res = await fetch("/api/projects");
    setProjects(await res.json());
  }

  function resetForm() { setForm({ ...defaultForm }); setEditId(""); setShowForm(false); }

  function editProject(p: Project) {
    setEditId(p.id);
    setForm({
      name: p.name, logs_webhook: p.logs_webhook, alert_webhook: p.alert_webhook,
      cooldown: String(p.cooldown), allow_hwid_reset: p.allow_hwid_reset,
      auto_delete_expired: p.auto_delete_expired, allow_hwid_clone: p.allow_hwid_clone,
      log_hwid: p.log_hwid, log_ip: p.log_ip, log_username: p.log_username,
      log_displayname: p.log_displayname, log_time: p.log_time, log_key: p.log_key,
      log_executor: p.log_executor, log_jobid: p.log_jobid,
      key_duration: String(p.key_duration), max_keys: String(p.max_keys),
      allow_extending: p.allow_extending, reward_cooldown: String(p.reward_cooldown),
      allow_forgetting: p.allow_forgetting, max_hours: String(p.max_hours),
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Project name required.");
    setSaving(true);
    try {
      const body = {
        ...form,
        cooldown: Number(form.cooldown) || 0,
        key_duration: Number(form.key_duration) || 24,
        max_keys: Number(form.max_keys) || 3,
        reward_cooldown: Number(form.reward_cooldown) || 0,
        max_hours: Number(form.max_hours) || 0,
      };
      const url = editId ? `/api/projects/${editId}` : "/api/projects";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      toast.success(editId ? "Project updated!" : "Project created!");
      resetForm(); loadProjects();
    } catch { toast.error("Failed to save."); }
    finally { setSaving(false); }
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project and all scripts/keys?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    toast.success("Deleted."); loadProjects();
  }

  const f = (k: string) => ({ value: (form as any)[k], onChange: (e: any) => setForm({ ...form, [k]: e.target.value }) });
  const t = (k: string) => ({ checked: (form as any)[k], onChange: (v: boolean) => setForm({ ...form, [k]: v }) });

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <p className="page-subtitle">Manage your script projects, key systems and LootLabs rewards.</p>
      </div>
      <div className="page-body">
        {obfUsage && (
          <div style={{ 
            marginBottom: 24, 
            padding: "20px 24px", 
            background: "linear-gradient(145deg, rgba(30,32,40,0.8) 0%, rgba(15,17,25,0.9) 100%)", 
            border: "1px solid rgba(255,255,255,0.08)", 
            borderRadius: 16, 
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            display: "flex", 
            flexDirection: "column", 
            gap: 12,
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, background: "var(--accent)", filter: "blur(80px)", opacity: 0.15, borderRadius: "50%" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0, 200, 224, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0, 200, 224, 0.2)" }}>
                  <i className="fa-solid fa-shield-halved" style={{ color: "var(--accent)", fontSize: 16 }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", letterSpacing: "0.02em" }}>Obfuscation Quota</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Monthly limit based on your plan</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: obfUsage.used >= obfUsage.limit ? "#ef4444" : "var(--text-1)" }}>
                  {obfUsage.used} <span style={{ color: "var(--text-3)", fontSize: 14, fontWeight: 600 }}>/ {obfUsage.limit}</span>
                </div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ fontSize: 11, padding: "3px 10px", background: "linear-gradient(90deg, var(--accent) 0%, #00a8c0 100%)", color: "#fff", borderRadius: 99, fontWeight: 700, boxShadow: "0 2px 8px rgba(0,200,224,0.3)" }}>
                    {obfUsage.plan} Plan
                  </span>
                </div>
              </div>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden", marginTop: 4, border: "1px solid rgba(255,255,255,0.02)" }}>
              <div style={{ 
                height: "100%", 
                width: `${Math.min(100, (obfUsage.used / obfUsage.limit) * 100)}%`, 
                background: obfUsage.used >= obfUsage.limit ? "#ef4444" : "linear-gradient(90deg, var(--accent) 0%, #00e0ff 100%)", 
                borderRadius: 99, 
                transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 0 10px var(--accent)"
              }} />
            </div>
            {obfUsage.used >= obfUsage.limit && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, padding: "8px 12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 8 }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ef4444", fontSize: 12 }} />
                <span style={{ fontSize: 12, color: "#fca5a5", fontWeight: 500 }}>Monthly limit reached. Upgrade your plan to obfuscate more scripts.</span>
              </div>
            )}
          </div>
        )}
        <button className="btn btn-primary" style={{ marginBottom: 16, width: "auto" }} onClick={() => { resetForm(); setShowForm(true); }}>
          <i className="fa-solid fa-plus" /> Create Project
        </button>

        {showForm && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">{editId ? "Edit Project" : "New Project"}</span>
              <button className="btn btn-ghost" onClick={resetForm}><i className="fa-solid fa-xmark" /></button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="input-group"><label className="input-label">Project Name</label><input className="input" {...f("name")} placeholder="My Script Hub" /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
                  <div className="input-group"><label className="input-label">Alert Webhook (Key Generation, etc.)</label><input className="input" {...f("alert_webhook")} placeholder="Discord webhook" /></div>
                </div>

                <div className="card" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
                  <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <label className="input-label" style={{ marginBottom: 4 }}>Key Settings</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div className="input-group"><label className="input-label">Key Duration (hours)</label><input className="input" type="number" step="0.5" {...f("key_duration")} /></div>
                      <div className="input-group"><label className="input-label">Max Keys (per user)</label><input className="input" type="number" {...f("max_keys")} /></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div className="input-group"><label className="input-label">Cooldown (hours)</label><input className="input" type="number" step="0.05" {...f("reward_cooldown")} /></div>
                      <div className="input-group"><label className="input-label">Max Hours (extending cap)</label><input className="input" type="number" {...f("max_hours")} /></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <Toggle label="Allow Extending" {...t("allow_extending")} />
                      <Toggle label="Allow Forgetting" {...t("allow_forgetting")} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>Manage checkpoints in the <b>Rewards</b> tab</span>
                  </div>
                </div>

                <div className="card" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
                  <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <label className="input-label" style={{ marginBottom: 4 }}>License Settings</label>
                    <div className="input-group"><label className="input-label">Key Cooldown (seconds)</label><input className="input" type="number" {...f("cooldown")} /></div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <Toggle label="Allow HWID Reset" {...t("allow_hwid_reset")} />
                      <Toggle label="Auto Delete Expired" {...t("auto_delete_expired")} />
                    </div>
                    <Toggle label="Allow HWID Clone Sharing" {...t("allow_hwid_clone")} />
                  </div>
                </div>

                <button className="btn btn-primary" disabled={saving} style={{ width: "auto" }}>
                  <i className="fa-solid fa-save" /> {saving ? "Saving..." : editId ? "Update Project" : "Create Project"}
                </button>
              </form>
            </div>
          </div>
        )}

        {projects.length === 0 && !showForm && (
          <div className="empty-state"><i className="fa-solid fa-folder-open empty-icon" /><div className="empty-title">No projects yet</div></div>
        )}
        <div style={{ display: "grid", gap: 12 }}>
          {projects.map((p) => (
            <div key={p.id} className="card">
              <div className="card-body" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-1)" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>ID: {p.id} | Keys: {p.key_duration}h | Max: {p.max_keys} | Cooldown: {p.reward_cooldown}h</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => router.push(`/projects/${p.id}`)}><i className="fa-solid fa-code" /> Scripts</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => editProject(p)}><i className="fa-solid fa-gear" /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteProject(p.id)}><i className="fa-solid fa-trash" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
      <div style={{ width: 36, height: 20, borderRadius: 10, background: checked ? "var(--accent)" : "var(--border-2)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: checked ? 18 : 2, transition: "left 0.2s" }} />
      </div>
      <span style={{ fontSize: 13, color: "var(--text-2)" }}>{label}</span>
    </div>
  );
}
