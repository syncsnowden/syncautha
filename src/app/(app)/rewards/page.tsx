"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Project { id: string; name: string; lootlabs_link?: string; lootlabs_api_key?: string; ll_link_2?: string; ll_link_3?: string; }

export default function RewardsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pid, setPid] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  const project = projects.find(p => p.id === pid);
  const savedLinks = [project?.lootlabs_link, project?.ll_link_2, project?.ll_link_3].filter((l): l is string => !!l);

  async function load() {
    const res = await fetch("/api/projects");
    setProjects(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!pid) return toast.error("Select a project.");
    if (!apiKey.trim()) return toast.error("API key required.");
    if (!link.trim()) return toast.error("Enter a link.");
    setLoading(true);
    try {
      const body = { lootlabs_link: link, lootlabs_api_key: apiKey, checkpoint_steps: 1 };
      const res = await fetch(`/api/projects/${pid}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      toast.success("Saved!");
      setLink("");
      await load();
    } catch { toast.error("Failed."); }
    finally { setLoading(false); }
  }

  async function addAnother() {
    if (!pid) return;
    const idx = savedLinks.length;
    if (idx >= 3) return toast.error("Max 3.");
    setLoading(true);
    try {
      const body: any = { lootlabs_api_key: apiKey, checkpoint_steps: idx + 1 };
      if (idx === 1) body.ll_link_2 = link;
      if (idx === 2) body.ll_link_3 = link;
      const res = await fetch(`/api/projects/${pid}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      toast.success("Added checkpoint " + (idx + 1) + "!");
      setLink("");
      await load();
    } catch { toast.error("Failed."); }
    finally { setLoading(false); }
  }

  async function remove(index: number) {
    if (!pid) return;
    setLoading(true);
    try {
      const body: any = { checkpoint_steps: Math.max(0, savedLinks.length - 1) };
      if (index === 0) body.lootlabs_link = "";
      if (index === 1) body.ll_link_2 = "";
      if (index === 2) body.ll_link_3 = "";
      const res = await fetch(`/api/projects/${pid}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      toast.success("Removed.");
      await load();
    } catch { toast.error("Failed."); }
    finally { setLoading(false); }
  }

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
              <span className="card-title"><Image src="/lootlabsicon.jpeg" alt="LL" width={20} height={20} style={{ borderRadius: 4, marginRight: 8 }} />Checkpoints</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Project</label>
                <select className="input" value={pid} onChange={e => { setPid(e.target.value); load(); }}>
                  <option value="">Select...</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {pid && (
                <>
                  {/* Saved checkpoints */}
                  {savedLinks.map((l, i) => (
                    <div key={i} className="card" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
                      <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ background: "var(--accent)", color: "#000", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>LootLabs Checkpoint {i + 1}</div>
                          <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "monospace", wordBreak: "break-all" }}>{l.length > 50 ? l.slice(0, 50) + "..." : l}</div>
                        </div>
                        <button className="btn btn-secondary btn-sm" style={{ width: "auto", color: "#ef4444" }} onClick={() => remove(i)}><i className="fa-solid fa-trash" /></button>
                      </div>
                    </div>
                  ))}

                  {/* New checkpoint form */}
                  <div className="card" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
                    <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>
                        {savedLinks.length === 0 ? "Add Checkpoint" : "Add Checkpoint " + (savedLinks.length + 1)}
                      </div>
                      <div className="input-group">
                        <label className="input-label">LootLabs API Key</label>
                        <input className="input" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="From LootLabs → Profile" />
                      </div>
                      <div className="input-group">
                        <label className="input-label">LootLabs Link</label>
                        <input className="input" value={link} onChange={e => setLink(e.target.value)} placeholder="https://loot-link.com/s?xxxxx" />
                      </div>
                      <button className="btn btn-primary" onClick={savedLinks.length === 0 ? save : addAnother} disabled={loading} style={{ width: "auto" }}>
                        {loading ? "Saving..." : savedLinks.length === 0 ? "Save Checkpoint" : "Add Checkpoint " + (savedLinks.length + 1)}
                      </button>
                    </div>
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
                {savedLinks.length > 0 ? (
                  <>
                    {savedLinks.map((l, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <span style={{ background: "var(--accent)", color: "#000", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>LootLabs</div>
                            <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "monospace", wordBreak: "break-all" }}>{l.length > 45 ? l.slice(0, 45) + "..." : l}</div>
                          </div>
                        </div>
                        {i < savedLinks.length - 1 && <div style={{ padding: "5px 0 5px 11px", color: "var(--border-2)", fontSize: 14 }}><i className="fa-solid fa-chevron-down" /></div>}
                      </div>
                    ))}
                    <div style={{ padding: "5px 0 5px 11px", color: "var(--border-2)", fontSize: 14 }}><i className="fa-solid fa-chevron-down" /></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <i className="fa-solid fa-key" style={{ color: "var(--accent)", fontSize: 14, width: 22, textAlign: "center" }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>Receive Key</span>
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Share with users</div>
                      <code style={{ fontSize: 11, color: "var(--accent)", fontFamily: "monospace", wordBreak: "break-all", background: "var(--bg-2)", padding: "6px 8px", borderRadius: 6, display: "block", border: "1px solid var(--border-2)" }}>{siteUrl}/get-key/{pid}</code>
                      <button className="btn btn-primary btn-sm" style={{ width: "100%", marginTop: 6 }} onClick={() => { navigator.clipboard.writeText(`${siteUrl}/get-key/${pid}`); toast.success("Copied!"); }}>
                        <i className="fa-solid fa-copy" /> Copy
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center", padding: "10px 0" }}>
                    Add a checkpoint to see the flow and get your share link.
                  </div>
                )}
                <div style={{ marginTop: 16, padding: "10px 12px", background: "var(--bg-2)", borderRadius: 8, border: "1px solid var(--border-2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Postback URL</div>
                  <code style={{ fontSize: 10, color: "var(--text-2)", fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.4 }}>{siteUrl}/api/rewards/postback</code>
                  <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4 }}>LootLabs auto-appends sid, click_id, IP, and unique_id.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
