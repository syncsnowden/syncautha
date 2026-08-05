"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import LootLabsIcon from "@/components/LootLabsIcon";

interface Project { id: string; name: string; lootlabs_link?: string; lootlabs_api_key?: string; }

export default function RewardsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [llLink, setLlLink] = useState("");
  const [llApiKey, setLlApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showAll, setShowAll] = useState(false);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => { fetch("/api/projects").then(r => r.json()).then(setProjects); }, []);

  async function createCheckpoint() {
    if (!projectId) return toast.error("Select a project.");
    if (!llLink.trim()) return toast.error("Enter your LootLabs link.");
    if (!llApiKey.trim()) return toast.error("Enter your LootLabs API key (from Profile page).");
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/rewards/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, lootlabs_link: llLink, lootlabs_api_key: llApiKey }),
      });
      const data = await res.json();
      if (data.session_id) {
        setResult(data);
        toast.success("Checkpoint saved!");
        loadProjects();
      } else {
        toast.error(data.error || "Failed");
      }
    } catch { toast.error("Failed."); }
    finally { setLoading(false); }
  }

  async function loadProjects() {
    const res = await fetch("/api/projects");
    setProjects(await res.json());
  }

  function editProject(p: Project) {
    setProjectId(p.id);
    setLlLink(p.lootlabs_link || "");
    setLlApiKey(p.lootlabs_api_key || "");
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Rewards</h1>
        <p className="page-subtitle">Add your LootLabs link so users can complete checkpoints for keys.</p>
      </div>

      <div className="page-body" style={{ maxWidth: 650 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title"><LootLabsIcon size={16} /> Add LootLabs Checkpoint</span>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Project</label>
              <select className="input" value={projectId} onChange={e => { setProjectId(e.target.value); const p = projects.find(x => x.id === e.target.value); setLlLink(p?.lootlabs_link || ""); setLlApiKey(p?.lootlabs_api_key || ""); }}>
                <option value="">Select project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}{p.lootlabs_link ? " ✓" : ""}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">LootLabs Link URL</label>
              <input className="input" value={llLink} onChange={e => setLlLink(e.target.value)} placeholder="https://lootlabs.gg/your-link" />
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>Create a link on LootLabs first — destination can be anything</span>
            </div>
            <div className="input-group">
              <label className="input-label">LootLabs API Key</label>
              <input className="input" value={llApiKey} onChange={e => setLlApiKey(e.target.value)} placeholder="From LootLabs → Profile page" />
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>Used to generate checkpoint URLs. Each user uses their own.</span>
            </div>
            <button className="btn btn-primary" onClick={createCheckpoint} disabled={loading} style={{ width: "auto" }}>
              <i className="fa-solid fa-save" /> Save Checkpoint
            </button>
          </div>
        </div>

        {result && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title"><i className="fa-solid fa-check-circle" style={{ marginRight: 8, color: "#22c55e" }} />Checkpoint Saved</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className="input-label" style={{ marginBottom: 6 }}>Postback URL — paste this in LootLabs settings</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" value={result.postback_url} readOnly style={{ fontFamily: "monospace", fontSize: 12 }} />
                  <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { navigator.clipboard.writeText(result.postback_url); toast.success("Copied!"); }}>
                    <i className="fa-solid fa-copy" />
                  </button>
                </div>
              </div>
              <div>
                <label className="input-label" style={{ marginBottom: 6 }}>Public Key Page</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" value={result.key_system_url || `${siteUrl}/get-key/${projectId}`} readOnly style={{ fontFamily: "monospace", fontSize: 12 }} />
                  <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { navigator.clipboard.writeText(result.key_system_url || `${siteUrl}/get-key/${projectId}`); toast.success("Copied!"); }}>
                    <i className="fa-solid fa-copy" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <span className="card-title">Setup Steps</span>
          </div>
          <div className="card-body">
            <ol style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.8, paddingLeft: 18 }}>
              <li>Create a link on <b>LootLabs</b> — set destination to anything</li>
              <li>Paste the link above, select your project, click <b>Save</b></li>
              <li>Copy the <b>Postback URL</b> — paste it in LootLabs link settings</li>
              <li>Share the <b>Public Key Page</b> link with your users</li>
              <li>Users visit the link, click Start Checkpoint, complete tasks, get a key</li>
            </ol>
          </div>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <span className="card-title"><i className="fa-solid fa-link" style={{ marginRight: 8, color: "var(--accent)" }} />Your Projects &amp; Links</span>
            <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => setShowAll(!showAll)}>{showAll ? "Hide" : "Show All"}</button>
          </div>
          {showAll && (
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {projects.map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text-1)", minWidth: 100 }}>{p.name}</span>
                  <code style={{ flex: 1, background: "var(--bg-2)", padding: "6px 10px", borderRadius: 6, fontSize: 12, color: "var(--accent)", fontFamily: "monospace", wordBreak: "break-all", minWidth: 200 }}>{siteUrl}/get-key/{p.id}</code>
                  <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { navigator.clipboard.writeText(`${siteUrl}/get-key/${p.id}`); toast.success("Copied!"); }}>
                    <i className="fa-solid fa-copy" />
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => editProject(p)}><i className="fa-solid fa-pen" /></button>
                  <button className="btn btn-danger btn-sm" style={{ width: "auto" }} onClick={async () => {
                    if (!confirm("Delete " + p.name + "?")) return;
                    await fetch(`/api/projects/${p.id}`, { method: "DELETE" });
                    toast.success("Deleted.");
                    loadProjects();
                  }}><i className="fa-solid fa-trash" /></button>
                </div>
              ))}
              {projects.length === 0 && <div style={{ color: "var(--text-3)", fontSize: 13 }}>No projects yet.</div>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
