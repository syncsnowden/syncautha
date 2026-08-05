"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Project { id: string; name: string; lootlabs_link?: string; lootlabs_api_key?: string; ll_link_2?: string; ll_link_3?: string; }

export default function RewardsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [llApiKey, setLlApiKey] = useState("");
  const [links, setLinks] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    const lastPid = typeof window !== "undefined" ? localStorage.getItem("syncauth_rewards_project") : "";
    if (lastPid) setProjectId(lastPid);
    loadProjects();
  }, []);

  useEffect(() => {
    if (!projectId) return;
    const p = projects.find(x => x.id === projectId);
    if (p) selectProject(p);
  }, [projects, projectId]);

  async function loadProjects() {
    const res = await fetch("/api/projects");
    setProjects(await res.json());
  }

  function selectProject(p: Project) {
    setProjectId(p.id);
    localStorage.setItem("syncauth_rewards_project", p.id);
    setLlApiKey(p.lootlabs_api_key || "");
    const existing = [p.lootlabs_link || "", p.ll_link_2 || "", p.ll_link_3 || ""].filter(l => l.trim());
    setLinks(existing.length > 0 ? existing : [""]);
  }

  function addLink() {
    if (links.length >= 3) return;
    setLinks([...links, ""]);
  }

  function removeLink(i: number) {
    const n = links.filter((_, idx) => idx !== i);
    setLinks(n.length > 0 ? n : [""]);
  }

  async function saveAll() {
    if (!projectId) return toast.error("Select a project.");
    if (!llApiKey.trim()) return toast.error("Enter your LootLabs API key.");
    const valid = links.filter(l => l.trim());
    if (valid.length === 0) return toast.error("Enter at least one link.");
    setLoading(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lootlabs_link: valid[0] || "",
          lootlabs_api_key: llApiKey,
          ll_link_2: valid[1] || "",
          ll_link_3: valid[2] || "",
          checkpoint_steps: valid.length,
        }),
      });
      toast.success("Saved!");
      loadProjects();
    } catch { toast.error("Failed."); }
    finally { setLoading(false); }
  }

  const selected = projects.find(p => p.id === projectId);
  const existingCount = selected ? [selected.lootlabs_link, selected.ll_link_2, selected.ll_link_3].filter(Boolean).length : 0;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Rewards</h1>
        <p className="page-subtitle">Set up LootLabs checkpoints — users complete them to earn keys.</p>
      </div>

      <div className="page-body" style={{ maxWidth: 900 }}>
        <div style={{ display: "grid", gridTemplateColumns: selected && existingCount > 0 ? "1fr 280px" : "1fr", gap: 20, alignItems: "start" }}>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <span className="card-title">
                <Image src="/lootlabsicon.jpeg" alt="LootLabs" width={20} height={20} style={{ borderRadius: 4, marginRight: 8 }} />
                Checkpoints {selected ? `— ${selected.name}` : ""}
              </span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Project</label>
              <select className="input" value={projectId} onChange={e => { const p = projects.find(x => x.id === e.target.value); if (p) selectProject(p); }}>
                <option value="">Select a project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}{p.lootlabs_link ? ` (${[p.lootlabs_link, p.ll_link_2, p.ll_link_3].filter(Boolean).length})` : ""}</option>)}
              </select>
            </div>

            {projectId && (
              <>
                <div className="input-group">
                  <label className="input-label">LootLabs API Key</label>
                  <input className="input" value={llApiKey} onChange={e => setLlApiKey(e.target.value)} placeholder="From LootLabs → Profile page" />
                </div>

                {links.map((link, i) => (
                  <div key={i} className="card" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", padding: 0 }}>
                    <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ background: "var(--accent)", color: "#000", width: 22, height: 22, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text-1)" }}>Checkpoint {i + 1}</span>
                        {i > 0 && (
                          <button onClick={() => removeLink(i)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 13 }}>
                            <i className="fa-solid fa-trash" />
                          </button>
                        )}
                      </div>
                      <input className="input" value={link} onChange={e => {
                        const n = [...links];
                        n[i] = e.target.value;
                        setLinks(n);
                      }} placeholder="https://loot-link.com/s?xxxxx" />
                    </div>
                  </div>
                ))}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="btn btn-primary" onClick={saveAll} disabled={loading} style={{ width: "auto" }}>
                    {loading ? "Saving..." : "Save Checkpoints"}
                  </button>
                  {links.filter(l => l.trim()).length >= 1 && links.length < 3 && (
                    <button className="btn btn-secondary" style={{ width: "auto" }} onClick={addLink}>
                      <i className="fa-solid fa-plus" /> Add Another Checkpoint
                    </button>
                  )}
                </div>

              </>
            )}
          </div>
        </div>

        {selected && existingCount > 0 && (
          <div className="card" style={{ position: "sticky", top: 20 }}>
            <div className="card-header">
              <span className="card-title"><i className="fa-solid fa-share" style={{ marginRight: 6, color: "var(--accent)", fontSize: 13 }} />Share with Users</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>Send this link to your users:</div>
              <code style={{ fontSize: 12, color: "var(--accent)", fontFamily: "monospace", wordBreak: "break-all", background: "var(--bg-2)", padding: "8px 10px", borderRadius: 6 }}>{siteUrl}/get-key/{selected.id}</code>
              <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => { navigator.clipboard.writeText(`${siteUrl}/get-key/${selected.id}`); toast.success("Copied!"); }}>
                <i className="fa-solid fa-copy" /> Copy Link
              </button>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{existingCount} checkpoint{existingCount > 1 ? "s" : ""} configured</div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <span className="card-title"><i className="fa-solid fa-list" style={{ marginRight: 8, color: "var(--accent)" }} />All Projects</span>
            <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => setShowAll(!showAll)}>{showAll ? "Collapse" : "Expand"}</button>
          </div>
          {showAll && (
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {projects.map(p => {
                const plinks = [p.lootlabs_link, p.ll_link_2, p.ll_link_3].filter(Boolean);
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontWeight: 600, fontSize: 13, minWidth: 90 }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: "var(--text-3)", background: "var(--bg-2)", padding: "2px 8px", borderRadius: 10 }}>{plinks.length} step{plinks.length !== 1 ? "s" : ""}</span>
                    <code style={{ flex: 1, fontSize: 11, color: "var(--accent)", fontFamily: "monospace", wordBreak: "break-all", minWidth: 180 }}>{siteUrl}/get-key/{p.id}</code>
                    <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => selectProject(p)}><i className="fa-solid fa-pen" /></button>
                    <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { navigator.clipboard.writeText(`${siteUrl}/get-key/${p.id}`); toast.success("Copied!"); }}><i className="fa-solid fa-copy" /></button>
                    <button className="btn btn-secondary btn-sm" style={{ width: "auto", color: "#ef4444" }} onClick={async () => {
                      if (!confirm(`Clear all checkpoints for "${p.name}"?`)) return;
                      await fetch(`/api/projects/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lootlabs_link: "", ll_link_2: "", ll_link_3: "", checkpoint_steps: 0 }) });
                      toast.success("Checkpoints cleared.");
                      loadProjects();
                    }}><i className="fa-solid fa-trash" /></button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
