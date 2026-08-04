"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Project {
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

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState({
    name: "",
    logs_webhook: "",
    alert_webhook: "",
    cooldown: "0",
    allow_hwid_reset: false,
    auto_delete_expired: false,
    allow_hwid_clone: false,
    log_hwid: true,
    log_ip: true,
    log_username: true,
    log_displayname: false,
    log_time: true,
    log_key: true,
    log_executor: true,
    log_jobid: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProjects(); }, []);

  async function loadProjects() {
    const res = await fetch("/api/projects");
    setProjects(await res.json());
  }

  function resetForm() {
    setForm({
      name: "", logs_webhook: "", alert_webhook: "", cooldown: "0",
      allow_hwid_reset: false, auto_delete_expired: false, allow_hwid_clone: false,
      log_hwid: true, log_ip: true, log_username: true, log_displayname: false,
      log_time: true, log_key: true, log_executor: true, log_jobid: false,
    });
    setEditId("");
    setShowForm(false);
  }

  function editProject(p: Project) {
    setEditId(p.id);
    setForm({
      name: p.name,
      logs_webhook: p.logs_webhook,
      alert_webhook: p.alert_webhook,
      cooldown: String(p.cooldown),
      allow_hwid_reset: p.allow_hwid_reset,
      auto_delete_expired: p.auto_delete_expired,
      allow_hwid_clone: p.allow_hwid_clone,
      log_hwid: p.log_hwid,
      log_ip: p.log_ip,
      log_username: p.log_username,
      log_displayname: p.log_displayname,
      log_time: p.log_time,
      log_key: p.log_key,
      log_executor: p.log_executor,
      log_jobid: p.log_jobid,
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
      };
      const url = editId ? `/api/projects/${editId}` : "/api/projects";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      toast.success(editId ? "Project updated!" : "Project created!");
      resetForm();
      loadProjects();
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project and all its scripts/keys?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    toast.success("Deleted.");
    loadProjects();
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <p className="page-subtitle">Manage your script projects and key systems.</p>
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
                <div className="input-group">
                  <label className="input-label">Project Name</label>
                  <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="My Script Hub" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="input-group">
                    <label className="input-label">Logs Webhook</label>
                    <input className="input" value={form.logs_webhook} onChange={e => setForm({ ...form, logs_webhook: e.target.value })} placeholder="Discord webhook URL" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Alert Webhook</label>
                    <input className="input" value={form.alert_webhook} onChange={e => setForm({ ...form, alert_webhook: e.target.value })} placeholder="Discord webhook URL" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Key Cooldown (seconds, 0 = 24h default)</label>
                  <input className="input" type="number" value={form.cooldown} onChange={e => setForm({ ...form, cooldown: e.target.value })} />
                </div>

                <div className="card" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
                  <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <label className="input-label" style={{ marginBottom: 4 }}>Settings</label>
                    <Toggle label="Allow HWID Reset" checked={form.allow_hwid_reset} onChange={v => setForm({ ...form, allow_hwid_reset: v })} />
                    <Toggle label="Auto Delete Expired Users" checked={form.auto_delete_expired} onChange={v => setForm({ ...form, auto_delete_expired: v })} />
                    <Toggle label="Allow HWID Clone Sharing" checked={form.allow_hwid_clone} onChange={v => setForm({ ...form, allow_hwid_clone: v })} />
                  </div>
                </div>

                <div className="card" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
                  <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <label className="input-label" style={{ marginBottom: 4 }}>Log to Webhook</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <Toggle label="HWID" checked={form.log_hwid} onChange={v => setForm({ ...form, log_hwid: v })} />
                      <Toggle label="IP" checked={form.log_ip} onChange={v => setForm({ ...form, log_ip: v })} />
                      <Toggle label="Username" checked={form.log_username} onChange={v => setForm({ ...form, log_username: v })} />
                      <Toggle label="Display Name" checked={form.log_displayname} onChange={v => setForm({ ...form, log_displayname: v })} />
                      <Toggle label="Time" checked={form.log_time} onChange={v => setForm({ ...form, log_time: v })} />
                      <Toggle label="Key" checked={form.log_key} onChange={v => setForm({ ...form, log_key: v })} />
                      <Toggle label="Executor" checked={form.log_executor} onChange={v => setForm({ ...form, log_executor: v })} />
                      <Toggle label="Job ID" checked={form.log_jobid} onChange={v => setForm({ ...form, log_jobid: v })} />
                    </div>
                  </div>
                </div>

                <button className="btn btn-primary" disabled={saving} style={{ width: "auto" }}>
                  {saving ? "Saving..." : editId ? "Update Project" : "Create Project"}
                </button>
              </form>
            </div>
          </div>
        )}

        {projects.length === 0 && !showForm && (
          <div className="empty-state">
            <i className="fa-solid fa-folder-open empty-icon" />
            <div className="empty-title">No projects yet</div>
            <div className="empty-desc">Create your first project to start managing scripts and keys.</div>
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {projects.map((p) => (
            <div key={p.id} className="card">
              <div className="card-body" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-1)" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>ID: {p.id}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => router.push(`/projects/${p.id}`)}>
                    <i className="fa-solid fa-code" /> Scripts
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => editProject(p)}>
                    <i className="fa-solid fa-gear" />
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteProject(p.id)}>
                    <i className="fa-solid fa-trash" />
                  </button>
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
