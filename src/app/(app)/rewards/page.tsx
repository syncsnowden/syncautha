"use client";
import { useEffect, useState } from "react";
import LootLabsIcon from "@/components/LootLabsIcon";
import toast from "react-hot-toast";

interface Project { id: string; name: string; }

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
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/rewards/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          lootlabs_link: llLink,
          lootlabs_api_key: llApiKey,
        }),
      });
      const data = await res.json();
      if (data.session_id) {
        setResult(data);
        toast.success("Checkpoint created!");
      } else {
        toast.error(data.error || "Failed");
      }
    } catch { toast.error("Failed."); }
    finally { setLoading(false); }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Rewards</h1>
        <p className="page-subtitle">Create LootLabs checkpoints for users to earn keys.</p>
      </div>

      <div className="page-body" style={{ maxWidth: 650 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title"><i className="fa-solid fa-shield-halved" style={{ marginRight: 8, color: "var(--accent)" }} />Create Checkpoint</span>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Project</label>
              <select className="input" value={projectId} onChange={e => setProjectId(e.target.value)}>
                <option value="">Select project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="card" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", padding: 0 }}>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-1)" }}>
                  <LootLabsIcon size={16} /> LootLabs Anti-Bypass Setup
                </div>
                <div className="input-group">
                  <label className="input-label">LootLabs Link</label>
                  <input className="input" value={llLink} onChange={e => setLlLink(e.target.value)} placeholder="https://lootlabs.gg/your-link" />
                  <span style={{ fontSize: 11, color: "var(--text-3)" }}>Create a link on LootLabs dashboard first, paste it here</span>
                </div>
                <div className="input-group">
                  <label className="input-label">LootLabs API Key</label>
                  <input className="input" value={llApiKey} onChange={e => setLlApiKey(e.target.value)} placeholder="Found in LootLabs Profile page" />
                  <span style={{ fontSize: 11, color: "var(--text-3)" }}>Go to LootLabs → Profile → copy your API key</span>
                </div>
                <button className="btn btn-primary" onClick={createCheckpoint} disabled={loading} style={{ width: "auto" }}>
                  <i className="fa-solid fa-plus" /> {loading ? "Creating..." : "Create Checkpoint"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title"><i className="fa-solid fa-check-circle" style={{ marginRight: 8, color: "#22c55e" }} />Checkpoint Created</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {result.checkpoint_url && (
                <div>
                  <label className="input-label" style={{ marginBottom: 6 }}>Checkpoint URL (share with users)</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="input" value={result.checkpoint_url} readOnly style={{ fontFamily: "monospace", fontSize: 12 }} />
                    <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { navigator.clipboard.writeText(result.checkpoint_url); toast.success("Copied!"); }}>
                      <i className="fa-solid fa-copy" />
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="input-label" style={{ marginBottom: 6 }}>Postback URL (paste in LootLabs settings)</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" value={result.postback_url} readOnly style={{ fontFamily: "monospace", fontSize: 12 }} />
                  <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { navigator.clipboard.writeText(result.postback_url); toast.success("Copied!"); }}>
                    <i className="fa-solid fa-copy" />
                  </button>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4, display: "block" }}>
                  Paste this in LootLabs → Edit Link → Postback URL field. Include {'{CLICK_ID}'} {'{IP}'} {'{UNIQUE_ID}'} parameters.
                </span>
              </div>
              <div>
                <label className="input-label" style={{ marginBottom: 6 }}>Public Link</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" value={result.public_link} readOnly style={{ fontFamily: "monospace", fontSize: 12 }} />
                  <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { navigator.clipboard.writeText(result.public_link); toast.success("Copied!"); }}>
                    <i className="fa-solid fa-copy" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <span className="card-title"><i className="fa-solid fa-link" style={{ marginRight: 8, color: "var(--accent)" }} />Your Key System URLs</span>
            <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => setShowAll(!showAll)}>{showAll ? "Hide" : "Show All"}</button>
          </div>
          {showAll && (
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {projects.map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text-1)", minWidth: 100 }}>{p.name}</span>
                  <code style={{ flex: 1, background: "var(--bg-2)", padding: "6px 10px", borderRadius: 6, fontSize: 12, color: "var(--accent)", fontFamily: "monospace", wordBreak: "break-all" }}>{siteUrl}/get-key/{p.id}</code>
                  <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { navigator.clipboard.writeText(`${siteUrl}/get-key/${p.id}`); toast.success("Copied!"); }}>
                    <i className="fa-solid fa-copy" />
                  </button>
                  <button className="btn btn-danger btn-sm" style={{ width: "auto" }} onClick={async () => {
                    if (!confirm("Delete project " + p.name + "?")) return;
                    await fetch(`/api/projects/${p.id}`, { method: "DELETE" });
                    toast.success("Deleted.");
                    setProjects(projects.filter(x => x.id !== p.id));
                  }}>
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              ))}
              {projects.length === 0 && <div style={{ color: "var(--text-3)", fontSize: 13 }}>No projects yet. Create one first.</div>}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title"><i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: "var(--accent)" }} />How it works</span>
          </div>
          <div className="card-body">
            <ol style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.8, paddingLeft: 18 }}>
              <li>Create a link on <b>LootLabs</b> dashboard (any destination URL)</li>
              <li>Copy your LootLabs <b>API key</b> from Profile page</li>
              <li>Paste both above and click <b>Create Checkpoint</b></li>
              <li>Copy the <b>Postback URL</b> and paste it in your LootLabs link settings (as postback)</li>
              <li>Share the <b>Checkpoint URL</b> or <b>Public Link</b> with your users</li>
              <li>Users complete checkpoint → auto-gets a key</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
