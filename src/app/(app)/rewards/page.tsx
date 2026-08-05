"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Project { id: string; name: string; lootlabs_link?: string; lootlabs_api_key?: string; ll_link_2?: string; ll_link_3?: string; checkpoint_steps?: number; }

export default function RewardsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [llLink, setLlLink] = useState("");
  const [llApiKey, setLlApiKey] = useState("");
  const [llLink2, setLlLink2] = useState("");
  const [llLink3, setLlLink3] = useState("");
  const [steps, setSteps] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => { loadProjects(); }, []);

  async function loadProjects() {
    const res = await fetch("/api/projects");
    setProjects(await res.json());
  }

  function selectProject(p: Project) {
    setProjectId(p.id);
    setLlLink(p.lootlabs_link || "");
    setLlApiKey(p.lootlabs_api_key || "");
    setLlLink2(p.ll_link_2 || "");
    setLlLink3(p.ll_link_3 || "");
    setSteps(p.checkpoint_steps || 1);
  }

  async function saveCheckpoint() {
    if (!projectId) return toast.error("Select a project.");
    if (!llLink.trim()) return toast.error("Enter at least one LootLabs link.");
    if (!llApiKey.trim()) return toast.error("Enter your LootLabs API key.");
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lootlabs_link: llLink, lootlabs_api_key: llApiKey, ll_link_2: llLink2, ll_link_3: llLink3, checkpoint_steps: steps }),
      });
      if (res.ok) {
        toast.success("Saved!");
        setShowForm(false);
        loadProjects();
      } else toast.error("Failed.");
    } catch { toast.error("Failed."); }
    finally { setLoading(false); }
  }

  const selectedProject = projects.find(p => p.id === projectId);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Rewards</h1>
        <p className="page-subtitle">Manage LootLabs checkpoints for your projects.</p>
      </div>

      <div className="page-body" style={{ maxWidth: 700 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title"><i className="fa-solid fa-list-check" style={{ marginRight: 8, color: "var(--accent)" }} />Checkpoints</span>
            <button className="btn btn-primary btn-sm" style={{ width: "auto" }} onClick={() => { setShowForm(true); }}>
              <i className="fa-solid fa-plus" /> Add Checkpoint
            </button>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="input-group">
              <label className="input-label">Project</label>
              <select className="input" value={projectId} onChange={e => { const p = projects.find(x => x.id === e.target.value); if (p) selectProject(p); }}>
                <option value="">Select a project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {selectedProject && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                {selectedProject.lootlabs_link && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--bg-2)", borderRadius: "var(--radius)", border: "1px solid var(--border-2)" }}>
                    <span style={{ background: "var(--accent)", color: "#000", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>1</span>
                    <code style={{ flex: 1, fontSize: 12, color: "var(--text-2)", wordBreak: "break-all", fontFamily: "monospace" }}>{selectedProject.lootlabs_link}</code>
                    <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { navigator.clipboard.writeText(`${siteUrl}/get-key/${selectedProject.id}`); toast.success("Link copied!"); }}>
                      <i className="fa-solid fa-link" />
                    </button>
                  </div>
                )}
                {selectedProject.ll_link_2 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--bg-2)", borderRadius: "var(--radius)", border: "1px solid var(--border-2)" }}>
                    <span style={{ background: "var(--accent)", color: "#000", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>2</span>
                    <code style={{ flex: 1, fontSize: 12, color: "var(--text-2)", wordBreak: "break-all", fontFamily: "monospace" }}>{selectedProject.ll_link_2}</code>
                  </div>
                )}
                {selectedProject.ll_link_3 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--bg-2)", borderRadius: "var(--radius)", border: "1px solid var(--border-2)" }}>
                    <span style={{ background: "var(--accent)", color: "#000", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>3</span>
                    <code style={{ flex: 1, fontSize: 12, color: "var(--text-2)", wordBreak: "break-all", fontFamily: "monospace" }}>{selectedProject.ll_link_3}</code>
                  </div>
                )}
                {!selectedProject.lootlabs_link && !selectedProject.ll_link_2 && !selectedProject.ll_link_3 && (
                  <div style={{ color: "var(--text-3)", fontSize: 13, padding: "8px 0" }}>No checkpoints configured.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">{projectId && selectedProject ? "Edit Checkpoints" : "Add Checkpoint"}</span>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}><i className="fa-solid fa-xmark" /></button>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Steps (1-3)</label>
                <input className="input" type="number" min="1" max="3" value={steps} onChange={e => setSteps(Math.min(3, Math.max(1, Number(e.target.value) || 1)))} />
              </div>
              <div className="input-group">
                <label className="input-label">LootLabs API Key</label>
                <input className="input" value={llApiKey} onChange={e => setLlApiKey(e.target.value)} placeholder="From LootLabs → Profile" />
              </div>
              <div className="input-group">
                <label className="input-label">Link 1</label>
                <input className="input" value={llLink} onChange={e => setLlLink(e.target.value)} placeholder="https://loot-link.com/s?xxxxx" />
              </div>
              {steps >= 2 && (
                <div className="input-group">
                  <label className="input-label">Link 2</label>
                  <input className="input" value={llLink2} onChange={e => setLlLink2(e.target.value)} placeholder="https://loot-link.com/s?xxxxx" />
                </div>
              )}
              {steps >= 3 && (
                <div className="input-group">
                  <label className="input-label">Link 3</label>
                  <input className="input" value={llLink3} onChange={e => setLlLink3(e.target.value)} placeholder="https://loot-link.com/s?xxxxx" />
                </div>
              )}
              <button className="btn btn-primary" onClick={saveCheckpoint} disabled={loading} style={{ width: "auto" }}>
                {loading ? "Saving..." : "Save Checkpoints"}
              </button>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <span className="card-title"><i className="fa-solid fa-link" style={{ marginRight: 8, color: "var(--accent)" }} />Key System URLs</span>
            <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => setShowAll(!showAll)}>{showAll ? "Hide" : "Show All"}</button>
          </div>
          {showAll && (
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {projects.map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, minWidth: 100 }}>{p.name}</span>
                  <code style={{ flex: 1, background: "var(--bg-2)", padding: "6px 10px", borderRadius: 6, fontSize: 12, color: "var(--accent)", fontFamily: "monospace", wordBreak: "break-all" }}>{siteUrl}/get-key/{p.id}</code>
                  <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { navigator.clipboard.writeText(`${siteUrl}/get-key/${p.id}`); toast.success("Copied!"); }}><i className="fa-solid fa-copy" /></button>
                  <button className="btn btn-danger btn-sm" style={{ width: "auto" }} onClick={async () => {
                    if (!confirm("Delete " + p.name + "?")) return;
                    await fetch(`/api/projects/${p.id}`, { method: "DELETE" });
                    toast.success("Deleted."); loadProjects();
                  }}><i className="fa-solid fa-trash" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
