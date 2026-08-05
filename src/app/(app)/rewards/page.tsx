"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Project { id: string; name: string; lootlabs_link?: string; lootlabs_api_key?: string; ll_link_2?: string; ll_link_3?: string; }

export default function RewardsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [llApiKey, setLlApiKey] = useState("");
  const [link1, setLink1] = useState("");
  const [link2, setLink2] = useState("");
  const [link3, setLink3] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("syncauth_rewards_pid") : "";
    loadProjects().then(() => { if (saved) setProjectId(saved); });
  }, []);

  useEffect(() => {
    if (!projectId) return;
    const p = projects.find(x => x.id === projectId);
    if (p) {
      setLlApiKey(p.lootlabs_api_key || "");
      setLink1(p.lootlabs_link || "");
      setLink2(p.ll_link_2 || "");
      setLink3(p.ll_link_3 || "");
    }
  }, [projectId, projects]);

  async function loadProjects() {
    const res = await fetch("/api/projects");
    setProjects(await res.json());
  }

  function selectProject(id: string) {
    setProjectId(id);
    localStorage.setItem("syncauth_rewards_pid", id);
  }

  async function save() {
    if (!projectId) return toast.error("Select a project.");
    if (!llApiKey.trim()) return toast.error("API key required.");
    const links = [link1.trim(), link2.trim(), link3.trim()].filter(Boolean);
    if (links.length === 0) return toast.error("Add at least one link.");
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lootlabs_link: links[0] || "",
          ll_link_2: links[1] || "",
          ll_link_3: links[2] || "",
          lootlabs_api_key: llApiKey,
          checkpoint_steps: links.length,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(`Saved ${links.length} checkpoint${links.length>1?"s":""}!`);
      await loadProjects();
    } catch { toast.error("Save failed."); }
    finally { setLoading(false); }
  }

  async function clearAll() {
    if (!confirm("Remove ALL checkpoints?")) return;
    setLink1(""); setLink2(""); setLink3("");
    await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lootlabs_link: "", ll_link_2: "", ll_link_3: "", checkpoint_steps: 0 }),
    });
    toast.success("Cleared.");
    loadProjects();
  }

  const selected = projects.find(p => p.id === projectId);
  const allLinks = [link1, link2, link3].filter(Boolean);
  const stepCount = allLinks.length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Rewards</h1>
        <p className="page-subtitle">Set up LootLabs checkpoints.</p>
      </div>

      <div className="page-body" style={{ maxWidth: stepCount > 0 ? 900 : 640 }}>
        <div style={{ display: "grid", gridTemplateColumns: stepCount > 0 ? "1fr 300px" : "1fr", gap: 20, alignItems: "start" }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Image src="/lootlabsicon.jpeg" alt="LootLabs" width={20} height={20} style={{ borderRadius: 4, marginRight: 8 }} />
                Checkpoints {selected ? `— ${selected.name}` : ""}
              </span>
              {selected && stepCount > 0 && (
                <button className="btn btn-secondary btn-sm" style={{ width: "auto", color: "#ef4444" }} onClick={clearAll}>
                  <i className="fa-solid fa-trash" /> Clear All
                </button>
              )}
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Project</label>
                <select className="input" value={projectId} onChange={e => selectProject(e.target.value)}>
                  <option value="">Select a project...</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {projectId && (
                <>
                  <div className="input-group">
                    <label className="input-label">LootLabs API Key</label>
                    <input className="input" value={llApiKey} onChange={e => setLlApiKey(e.target.value)} placeholder="From LootLabs → Profile page" />
                  </div>

                  {[link1, link2, link3].map((link, i) => {
                    const setLink = [setLink1, setLink2, setLink3][i];
                    const prevHasLink = i === 0 || [link1, link2, link3][i-1].trim();
                    if (!prevHasLink && !link.trim()) return null;
                    return (
                      <div key={i} className="card" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", padding: 0 }}>
                        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ background: "var(--accent)", color: "#000", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>Checkpoint {i + 1}</span>
                            {i > 0 && (
                              <button onClick={() => { setLink(""); save(); }} style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12 }}>
                                <i className="fa-solid fa-xmark" />
                              </button>
                            )}
                          </div>
                          <input className="input" value={link} onChange={e => setLink(e.target.value)} placeholder="https://loot-link.com/s?xxxxx" />
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="btn btn-primary" onClick={save} disabled={loading} style={{ width: "auto" }}>
                      <i className="fa-solid fa-save" /> {loading ? "Saving..." : "Save"}
                    </button>
                    {stepCount >= 1 && stepCount < 3 && (
                      <button className="btn btn-secondary" style={{ width: "auto" }} onClick={() => {
                        const slots = [link1, link2, link3];
                        const next = slots.findIndex((s, idx) => !s.trim() && idx >= stepCount);
                        if (next >= 0) {
                          const setters = [setLink1, setLink2, setLink3];
                          setters[next]("");
                        }
                      }}>
                        <i className="fa-solid fa-plus" /> Add Checkpoint {stepCount + 1}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {selected && stepCount > 0 && (
            <div className="card" style={{ position: "sticky", top: 20 }}>
              <div className="card-header">
                <span className="card-title" style={{ fontSize: 13 }}><i className="fa-solid fa-share" style={{ marginRight: 6, color: "var(--accent)" }} />Share</span>
              </div>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{stepCount} checkpoint{stepCount>1?"s":""} configured</div>
                <code style={{ fontSize: 12, color: "var(--accent)", fontFamily: "monospace", wordBreak: "break-all", background: "var(--bg-2)", padding: "8px 10px", borderRadius: 6 }}>{siteUrl}/get-key/{selected.id}</code>
                <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => { navigator.clipboard.writeText(`${siteUrl}/get-key/${selected.id}`); toast.success("Copied!"); }}>
                  <i className="fa-solid fa-copy" /> Copy Link
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <span className="card-title"><i className="fa-solid fa-list" style={{ marginRight: 8, color: "var(--accent)" }} />All Projects</span>
            <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => setShowAll(!showAll)}>{showAll ? "Collapse" : "Expand"}</button>
          </div>
          {showAll && (
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {projects.map(p => {
                const n = [p.lootlabs_link, p.ll_link_2, p.ll_link_3].filter(Boolean).length;
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontWeight: 600, fontSize: 13, minWidth: 90 }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: n > 0 ? "var(--accent)" : "var(--text-3)", background: "var(--bg-2)", padding: "2px 8px", borderRadius: 10 }}>{n} step{n!==1?"s":""}</span>
                    <code style={{ flex: 1, fontSize: 11, color: n > 0 ? "var(--accent)" : "var(--text-3)", fontFamily: "monospace", wordBreak: "break-all", minWidth: 160 }}>{siteUrl}/get-key/{p.id}</code>
                    <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => selectProject(p.id)}><i className="fa-solid fa-pen" /></button>
                    <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { if (!confirm("Delete " + p.name + "?")) return; fetch(`/api/projects/${p.id}`, { method: "DELETE" }).then(() => { toast.success("Deleted."); loadProjects(); }); }}><i className="fa-solid fa-trash" /></button>
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
