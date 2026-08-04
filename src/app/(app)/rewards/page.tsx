"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Project { id: string; name: string; }

export default function RewardsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [sessionUrl, setSessionUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(setProjects);
  }, []);

  async function createSession() {
    if (!selectedProject) return toast.error("Select a project.");
    setLoading(true);
    try {
      const res = await fetch("/api/rewards/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: selectedProject }),
      });
      const data = await res.json();
      if (data.session_id) {
        setSessionId(data.session_id);
        setSessionUrl(data.reward_url);
        toast.success("Session created! Share the postback URL.");
      } else {
        toast.error(data.error || "Failed");
      }
    } catch {
      toast.error("Failed to create session.");
    } finally {
      setLoading(false);
    }
  }

  async function claimKey() {
    if (!sessionId) return toast.error("No active session.");
    setLoading(true);
    try {
      const res = await fetch("/api/keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, project_id: selectedProject }),
      });
      const data = await res.json();
      if (data.key) {
        setKey(data.key);
        toast.success("Key generated from reward!");
      } else {
        toast.error(data.error || "Not completed or already used.");
      }
    } catch {
      toast.error("Failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Rewards</h1>
        <p className="page-subtitle">LootLabs checkpoint integration — users complete tasks to earn keys.</p>
      </div>

      <div className="page-body" style={{ maxWidth: 600 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title"><i className="fa-solid fa-gift" style={{ marginRight: 8, color: "var(--accent)" }} />Create Reward Session</span>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Project</label>
              <select className="input" value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
                <option value="">Select project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={createSession} disabled={loading} style={{ width: "auto" }}>
              <i className="fa-solid fa-plus" /> Create Session
            </button>
          </div>
        </div>

        {sessionId && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title"><i className="fa-solid fa-link" style={{ marginRight: 8, color: "var(--accent)" }} />Postback URL</span>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 10 }}>
                Set this as your LootLabs postback URL. When a user completes the checkpoint, this endpoint marks the session as complete.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input" value={sessionUrl} readOnly style={{ fontFamily: "monospace", fontSize: 12 }} />
                <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { navigator.clipboard.writeText(sessionUrl); toast.success("Copied!"); }}>
                  <i className="fa-solid fa-copy" />
                </button>
              </div>
              <button className="btn btn-primary" style={{ marginTop: 12, width: "auto" }} onClick={claimKey} disabled={loading}>
                <i className="fa-solid fa-key" /> Claim Key from Session
              </button>
            </div>
          </div>
        )}

        {key && (
          <div className="card">
            <div className="card-header">
              <span className="card-title"><i className="fa-solid fa-check-circle" style={{ marginRight: 8, color: "var(--accent)" }} />Generated Key</span>
            </div>
            <div className="card-body">
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: "var(--accent)", letterSpacing: 1, padding: "12px 16px", background: "var(--bg-2)", borderRadius: "var(--radius)", textAlign: "center" }}>
                {key}
              </div>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={() => { navigator.clipboard.writeText(key); toast.success("Copied!"); }}>
                <i className="fa-solid fa-copy" /> Copy Key
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
