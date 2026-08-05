"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Project { id: string; name: string; lootlabs_link?: string; lootlabs_api_key?: string; ll_link_2?: string; ll_link_3?: string; checkpoint_steps?: number; }

export default function RewardsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [llApiKey, setLlApiKey] = useState("");
  const [llLink1, setLlLink1] = useState("");
  const [llLink2, setLlLink2] = useState("");
  const [llLink3, setLlLink3] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => { loadProjects(); }, []);

  async function loadProjects() {
    const res = await fetch("/api/projects");
    setProjects(await res.json());
  }

  function selectProject(p: Project) {
    setProjectId(p.id);
    setLlApiKey(p.lootlabs_api_key || "");
    setLlLink1(p.lootlabs_link || "");
    setLlLink2(p.ll_link_2 || "");
    setLlLink3(p.ll_link_3 || "");
  }

  async function saveAll() {
    if (!projectId) return toast.error("Select a project.");
    if (!llApiKey.trim()) return toast.error("Enter your LootLabs API key.");
    if (!llLink1.trim()) return toast.error("Enter at least one LootLabs link.");
    setLoading(true);
    try {
      let steps = 0;
      if (llLink1.trim()) steps = 1;
      if (llLink2.trim()) steps = 2;
      if (llLink3.trim()) steps = 3;
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lootlabs_link: llLink1, lootlabs_api_key: llApiKey, ll_link_2: llLink2, ll_link_3: llLink3, checkpoint_steps: steps }),
      });
      if (res.ok) { toast.success("Saved!"); loadProjects(); }
      else toast.error("Failed.");
    } catch { toast.error("Failed."); }
    finally { setLoading(false); }
  }

  const selected = projects.find(p => p.id === projectId);
  const totalLinks = [selected?.lootlabs_link, selected?.ll_link_2, selected?.ll_link_3].filter(Boolean).length;
  const lnk1 = selected?.lootlabs_link || "";
  const lnk2 = selected?.ll_link_2 || "";
  const lnk3 = selected?.ll_link_3 || "";

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Rewards</h1>
        <p className="page-subtitle">Set up LootLabs checkpoints — users complete them to earn keys.</p>
      </div>

      <div className="page-body" style={{ maxWidth: 680 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title"><i className="fa-solid fa-link" style={{ marginRight: 8, color: "var(--accent)" }} />Checkpoints</span>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Project</label>
              <select className="input" value={projectId} onChange={e => { const p = projects.find(x => x.id === e.target.value); if (p) selectProject(p); }}>
                <option value="">Select a project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}{p.lootlabs_link ? " (" + ([p.lootlabs_link, p.ll_link_2, p.ll_link_3].filter(Boolean).length) + " checkpoints)" : ""}</option>)}
              </select>
            </div>

            {projectId && (
              <>
                <div className="input-group">
                  <label className="input-label">LootLabs API Key</label>
                  <input className="input" value={llApiKey} onChange={e => setLlApiKey(e.target.value)} placeholder="From LootLabs → Profile page" />
                </div>

                {[llLink1, llLink2, llLink3].map((link, i) => (
                  link !== undefined && (
                    <div key={i} className="input-group">
                      <label className="input-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ background: "var(--accent)", color: "#000", width: 20, height: 20, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                        Checkpoint {i + 1} Link
                        {i > 0 && (
                          <button onClick={() => {
                            if (i === 1) { setLlLink2(""); saveAll(); }
                            if (i === 2) { setLlLink3(""); saveAll(); }
                          }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12, marginLeft: "auto" }}>
                            <i className="fa-solid fa-trash" />
                          </button>
                        )}
                      </label>
                      <input className="input" value={link} onChange={e => {
                        if (i === 0) setLlLink1(e.target.value);
                        if (i === 1) setLlLink2(e.target.value);
                        if (i === 2) setLlLink3(e.target.value);
                      }} placeholder="https://loot-link.com/s?xxxxx" />
                    </div>
                  )
                ))}

                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-primary" onClick={saveAll} disabled={loading} style={{ width: "auto" }}>
                    {loading ? "Saving..." : "Save"}
                  </button>
                  {totalLinks < 3 && (
                    <button className="btn btn-secondary" style={{ width: "auto" }} onClick={() => {
                      if (!llLink2.trim()) setLlLink2("");
                      else setLlLink3("");
                      toast.success("Added checkpoint " + (totalLinks + 1));
                    }}>
                      <i className="fa-solid fa-plus" /> Add Checkpoint {totalLinks < 3 ? `(${totalLinks}/3)` : ""}
                    </button>
                  )}
                  {totalLinks > 1 && (
                    <button className="btn btn-secondary" style={{ width: "auto" }} onClick={() => {
                      if (lnk3) { setLlLink3(""); saveAll(); }
                      else if (lnk2) { setLlLink2(""); saveAll(); }
                    }}>
                      Remove Last
                    </button>
                  )}
                </div>

                {selected && totalLinks > 0 && (
                  <div style={{ marginTop: 8, padding: "12px 16px", background: "rgba(0,200,224,0.04)", border: "1px solid rgba(0,200,224,0.1)", borderRadius: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>
                      <i className="fa-solid fa-share" style={{ marginRight: 6 }} />Share this link with users:
                    </div>
                    <code style={{ fontSize: 13, color: "var(--text-1)", fontFamily: "monospace", wordBreak: "break-all" }}>
                      {siteUrl}/get-key/{selected.id}
                    </code>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: 6, width: "auto" }} onClick={() => { navigator.clipboard.writeText(`${siteUrl}/get-key/${selected.id}`); toast.success("Copied!"); }}>
                      <i className="fa-solid fa-copy" /> Copy
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
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
                    <span style={{ fontWeight: 600, fontSize: 13, minWidth: 100 }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: "var(--text-3)", background: "var(--bg-2)", padding: "2px 8px", borderRadius: 10 }}>
                      {plinks.length} checkpoint{plinks.length !== 1 ? "s" : ""}
                    </span>
                    <code style={{ flex: 1, fontSize: 11, color: "var(--accent)", fontFamily: "monospace", wordBreak: "break-all", minWidth: 180 }}>{siteUrl}/get-key/{p.id}</code>
                    <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => selectProject(p)}><i className="fa-solid fa-pen" /></button>
                    <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { navigator.clipboard.writeText(`${siteUrl}/get-key/${p.id}`); toast.success("Copied!"); }}><i className="fa-solid fa-copy" /></button>
                    <button className="btn btn-secondary btn-sm" style={{ width: "auto", color: "#ef4444" }} onClick={async () => {
                      await fetch(`/api/projects/${p.id}`, {
                        method: "PUT", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ lootlabs_link: "", lootlabs_api_key: "", ll_link_2: "", ll_link_3: "", checkpoint_steps: 1 }),
                      });
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
