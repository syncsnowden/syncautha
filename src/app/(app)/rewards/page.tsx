"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Project { id: string; name: string; lootlabs_link?: string; lootlabs_api_key?: string; ll_link_2?: string; ll_link_3?: string; }

export default function RewardsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pid, setPid] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [l1, setL1] = useState("");
  const [l2, setL2] = useState("");
  const [l3, setL3] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [addStep, setAddStep] = useState(-1);
  const [refetch, setRefetch] = useState(0);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("synr_pid") : "";
    loadProjects().then(() => { if (saved) setPid(saved); });
  }, []);

  useEffect(() => {
    if (!pid || projects.length === 0) return;
    const p = projects.find(x => x.id === pid);
    if (!p) return;
    setApiKey(p.lootlabs_api_key || "");
    setL1(p.lootlabs_link || "");
    setL2(p.ll_link_2 || "");
    setL3(p.ll_link_3 || "");
    setAddStep(-1);
  }, [pid, projects, refetch]);

  async function loadProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch {}
  }

  function select(id: string) {
    setPid(id);
    localStorage.setItem("synr_pid", id);
  }

  async function save() {
    if (!pid) return toast.error("Select project.");
    if (!apiKey.trim()) return toast.error("API key required.");
    if (!l1.trim()) return toast.error("Add a checkpoint link.");
    setLoading(true);
    try {
      const links = [l1.trim(), l2.trim(), l3.trim()].filter(Boolean);
      const res = await fetch(`/api/projects/${pid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lootlabs_link: links[0] || "",
          ll_link_2: links[1] || "",
          ll_link_3: links[2] || "",
          lootlabs_api_key: apiKey,
          checkpoint_steps: links.length,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Saved " + links.length + " checkpoint" + (links.length > 1 ? "s" : "") + "!");
      setAddStep(-1);
      await loadProjects();
    } catch { toast.error("Save failed."); }
    finally { setLoading(false); }
  }

  async function clearAll() {
    if (!confirm("Remove all checkpoints?")) return;
    setL1(""); setL2(""); setL3(""); setApiKey("");
    await fetch(`/api/projects/${pid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lootlabs_link: "", ll_link_2: "", ll_link_3: "", lootlabs_api_key: "", checkpoint_steps: 0 }),
    });
    toast.success("Cleared.");
    await loadProjects();
  }

  function startAdd() {
    const filled = [l1, l2, l3].filter(Boolean).length;
    if (filled >= 3) return toast.error("Max 3 checkpoints.");
    const nextEmpty = [l1, l2, l3].findIndex((s, idx) => !s.trim() && idx >= filled);
    if (nextEmpty >= 0) setAddStep(nextEmpty);
  }

  const selected = projects.find(x => x.id === pid);
  const allLinks = [l1, l2, l3].filter(Boolean);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Rewards</h1>
        <p className="page-subtitle">Set up LootLabs checkpoints.</p>
      </div>

      <div className="page-body" style={{ maxWidth: pid ? "calc(100% - 40px)" : 640 }}>
        <div style={{ display: "grid", gridTemplateColumns: pid ? "1fr 320px" : "1fr", gap: 24, alignItems: "start" }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Image src="/lootlabsicon.jpeg" alt="LL" width={20} height={20} style={{ borderRadius: 4, marginRight: 8 }} />
                Checkpoints {selected ? `— ${selected.name}` : ""}
              </span>
              {selected && ([selected.lootlabs_link, selected.ll_link_2, selected.ll_link_3].filter(Boolean).length > 0) && (
                <button className="btn btn-secondary btn-sm" style={{ width: "auto", color: "#ef4444" }} onClick={clearAll}>
                  <i className="fa-solid fa-trash" /> Clear All
                </button>
              )}
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Project</label>
                <select className="input" value={pid} onChange={e => select(e.target.value)}>
                  <option value="">Select a project...</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {pid && (
                <>
                  <div className="input-group">
                    <label className="input-label">LootLabs API Key</label>
                    <input className="input" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="From LootLabs → Profile" />
                  </div>

                  {[l1, l2, l3].map((link, i) => {
                    const setters = [setL1, setL2, setL3];
                    const isSaved = !!link.trim();
                    const editing = addStep === i;
                    
                    if (!isSaved && !editing) return null;
                    if (isSaved && !editing) {
                      return (
                        <div key={i} className="card" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", padding: 0 }}>
                          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ background: "var(--accent)", color: "#000", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600 }}>LootLabs Checkpoint {i + 1}</div>
                              <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "monospace", wordBreak: "break-all", marginTop: 2 }}>
                                {link.length > 60 ? link.slice(0, 60) + "..." : link}
                              </div>
                            </div>
                            <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => setAddStep(i)}><i className="fa-solid fa-pen" /></button>
                            {i > 0 && <button className="btn btn-secondary btn-sm" style={{ width: "auto", color: "#ef4444" }} onClick={() => { setters[i](""); save(); }}><i className="fa-solid fa-trash" /></button>}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={i} className="card" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", padding: 0 }}>
                        <div className="card-body">
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <span style={{ background: "var(--accent)", color: "#000", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{isSaved ? "Edit" : "New"} Checkpoint {i + 1}</span>
                            <button onClick={() => setAddStep(-1)} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: 12 }}><i className="fa-solid fa-xmark" /></button>
                          </div>
                          <input className="input" value={link} onChange={e => setters[i](e.target.value)} placeholder="https://loot-link.com/s?xxxxx" />
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-primary" onClick={save} disabled={loading} style={{ width: "auto" }}>
                      {loading ? "Saving..." : "Save"}
                    </button>
                    {l1.trim() && allLinks.length < 3 && addStep === -1 && (
                      <button className="btn btn-secondary" style={{ width: "auto" }} onClick={startAdd}>
                        <i className="fa-solid fa-plus" /> Add Another Checkpoint
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {pid && (
            <div className="card" style={{ position: "sticky", top: 20 }}>
              <div className="card-header">
                <span className="card-title"><Image src="/lootlabsicon.jpeg" alt="LL" width={18} height={18} style={{ borderRadius: 3, marginRight: 8 }} />Checkpoint Flow</span>
              </div>
              <div className="card-body" style={{ padding: 16 }}>
                {allLinks.length > 0 ? (
                  <>
                    {allLinks.map((link, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <span style={{ background: "var(--accent)", color: "#000", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>LootLabs</div>
                            <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.3 }}>
                              {link.length > 45 ? link.slice(0, 45) + "..." : link}
                            </div>
                          </div>
                        </div>
                        {i < allLinks.length - 1 && (
                          <div style={{ padding: "5px 0 5px 11px", color: "var(--border-2)", fontSize: 14 }}>
                            <i className="fa-solid fa-chevron-down" />
                          </div>
                        )}
                      </div>
                    ))}
                    <div style={{ padding: "5px 0 5px 11px", color: "var(--border-2)", fontSize: 14 }}>
                      <i className="fa-solid fa-chevron-down" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <i className="fa-solid fa-key" style={{ color: "var(--accent)", fontSize: 14, width: 22, textAlign: "center" }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>Receive Key</span>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center", padding: "10px 0" }}>
                    Add a checkpoint and click Save.
                  </div>
                )}

                <div style={{ marginTop: 16, padding: "10px 12px", background: "var(--bg-2)", borderRadius: 8, border: "1px solid var(--border-2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Postback URL</div>
                  <code style={{ fontSize: 10, color: "var(--text-2)", fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.4 }}>
                    {siteUrl}/api/rewards/postback
                  </code>
                  <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4 }}>LootLabs auto-appends sid, click_id, IP, and unique_id.</div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Share</div>
                  <code style={{ fontSize: 11, color: "var(--accent)", fontFamily: "monospace", wordBreak: "break-all", background: "var(--bg-2)", padding: "6px 8px", borderRadius: 6, display: "block", border: "1px solid var(--border-2)" }}>
                    {siteUrl}/get-key/{pid}
                  </code>
                  <button className="btn btn-primary btn-sm" style={{ width: "100%", marginTop: 6 }} onClick={() => { navigator.clipboard.writeText(`${siteUrl}/get-key/${pid}`); toast.success("Copied!"); }}>
                    <i className="fa-solid fa-copy" /> Copy
                  </button>
                </div>
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
                    <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => select(p.id)}><i className="fa-solid fa-pen" /></button>
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
