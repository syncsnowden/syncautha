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
  max_hours: number; lootlabs_link: string; lootlabs_api_key: string;
  ll_link_2: string; ll_link_3: string; checkpoint_steps: number;
}

const defaultForm = {
  name: "", logs_webhook: "", alert_webhook: "", cooldown: "0",
  allow_hwid_reset: false, auto_delete_expired: false, allow_hwid_clone: false,
  log_hwid: true, log_ip: true, log_username: true, log_displayname: false,
  log_time: true, log_key: true, log_executor: true, log_jobid: false,
  key_duration: "24", max_keys: "3", allow_extending: false,
  reward_cooldown: "0", allow_forgetting: false, max_hours: "0", lootlabs_link: "", lootlabs_api_key: "",
  ll_link_2: "", ll_link_3: "", checkpoint_steps: "1",
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState({ ...defaultForm });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProjects(); }, []);

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
      lootlabs_link: p.lootlabs_link, lootlabs_api_key: p.lootlabs_api_key || "",
      ll_link_2: p.ll_link_2 || "", ll_link_3: p.ll_link_3 || "",
      checkpoint_steps: String(p.checkpoint_steps || 1),
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
        checkpoint_steps: Math.min(3, Math.max(1, Number(form.checkpoint_steps) || 1)),
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="input-group"><label className="input-label">Logs Webhook</label><input className="input" {...f("logs_webhook")} placeholder="Discord webhook" /></div>
                  <div className="input-group"><label className="input-label">Alert Webhook</label><input className="input" {...f("alert_webhook")} placeholder="Discord webhook" /></div>
                </div>

                <div className="card" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
                  <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <label className="input-label" style={{ marginBottom: 4 }}>Reward / LootLabs Settings</label>
                    <div className="input-group">
                      <label className="input-label">LootLabs Link</label>
                      <input className="input" {...f("lootlabs_link")} placeholder="https://lootlabs.gg/your-link" />
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>Create a link on LootLabs — destination can be anything</span>
                    </div>
                    <div className="input-group">
                      <label className="input-label">LootLabs API Key</label>
                      <input className="input" {...f("lootlabs_api_key")} placeholder="From LootLabs → Profile" />
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>Your personal LootLabs API key (each user uses their own)</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div className="input-group"><label className="input-label">Key Duration (hours)</label><input className="input" type="number" step="0.5" {...f("key_duration")} /></div>
                      <div className="input-group"><label className="input-label">Max Keys (per user)</label><input className="input" type="number" {...f("max_keys")} /></div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Checkpoint Steps (1-3)</label>
                      <input className="input" type="number" min="1" max="3" {...f("checkpoint_steps")} />
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>How many checkpoints user must complete (free plan max 3)</span>
                    </div>
                    <div className="input-group">
                      <label className="input-label">LootLabs Link 2</label>
                      <input className="input" {...f("ll_link_2")} placeholder="Step 2 checkpoint link" />
                    </div>
                    <div className="input-group">
                      <label className="input-label">LootLabs Link 3</label>
                      <input className="input" {...f("ll_link_3")} placeholder="Step 3 checkpoint link" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div className="input-group"><label className="input-label">Cooldown (hours)</label><input className="input" type="number" step="0.05" {...f("reward_cooldown")} /></div>
                      <div className="input-group"><label className="input-label">Max Hours (extending cap)</label><input className="input" type="number" {...f("max_hours")} /></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <Toggle label="Allow Extending" {...t("allow_extending")} />
                      <Toggle label="Allow Forgetting" {...t("allow_forgetting")} />
                    </div>
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

                <div className="card" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
                  <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <label className="input-label" style={{ marginBottom: 4 }}>Log to Webhook</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <Toggle label="HWID" {...t("log_hwid")} /><Toggle label="IP" {...t("log_ip")} />
                      <Toggle label="Username" {...t("log_username")} /><Toggle label="Display Name" {...t("log_displayname")} />
                      <Toggle label="Time" {...t("log_time")} /><Toggle label="Key" {...t("log_key")} />
                      <Toggle label="Executor" {...t("log_executor")} /><Toggle label="Job ID" {...t("log_jobid")} />
                    </div>
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
