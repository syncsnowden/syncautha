"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Project { id: string; name: string; lootlabs_link?: string; lootlabs_api_key?: string; ll_link_2?: string; ll_link_3?: string; }

export default function RewardsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [openId, setOpenId] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("synr_open") || "";
    return "";
  });
  const [apiKey, setApiKey] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  const open = projects.find(p => p.id === openId);
  const savedLinks = [open?.lootlabs_link, open?.ll_link_2, open?.ll_link_3].filter((l): l is string => !!l);

  async function load() {
    const res = await fetch("/api/projects");
    setProjects(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function save(pid: string) {
    if (!apiKey.trim()) return toast.error("API key required.");
    if (!link.trim()) return toast.error("Enter a link.");
    setLoading(true);
    try {
      const body: any = { lootlabs_link: link, lootlabs_api_key: apiKey, checkpoint_steps: savedLinks.length + 1 };
      if (savedLinks.length >= 1) body.ll_link_2 = link;
      if (savedLinks.length >= 2) body.ll_link_3 = link;
      const res = await fetch(`/api/projects/${pid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setProjects(prev => prev.map(p => p.id === pid ? { ...p, ...updated } : p));
      setLink("");
      toast.success("Saved!");
    } catch { toast.error("Failed."); }
    finally { setLoading(false); }
  }

  async function removeLink(pid: string, index: number) {
    setLoading(true);
    try {
      const body: any = { checkpoint_steps: Math.max(0, savedLinks.length - 1) };
      if (index === 0) body.lootlabs_link = "";
      if (index === 1) body.ll_link_2 = "";
      if (index === 2) body.ll_link_3 = "";
      const res = await fetch(`/api/projects/${pid}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setProjects(prev => prev.map(p => p.id === pid ? { ...p, ...updated } : p));
      toast.success("Removed.");
    } catch { toast.error("Failed."); }
    finally { setLoading(false); }
  }

  function openProject(p: Project) {
    const next = p.id === openId ? "" : p.id;
    setOpenId(next);
    localStorage.setItem("synr_open", next);
    setApiKey(p.lootlabs_api_key || "");
    setLink("");
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Rewards</h1>
        <p className="page-subtitle">Manage LootLabs checkpoints for each project.</p>
      </div>
      <div className="page-body">
        {projects.length === 0 && <div style={{ color: "var(--text-3)", textAlign: "center", padding: 40 }}>No projects yet. Create one first.</div>}
        {projects.map(p => {
          const links = [p.lootlabs_link, p.ll_link_2, p.ll_link_3].filter((l): l is string => !!l);
          const isOpen = openId === p.id;
          return (
            <div key={p.id} className="card" style={{ marginBottom: 16 }}>
              <div className="card-header" style={{ cursor: "pointer" }} onClick={() => openProject(p)}>
                <span className="card-title">
                  <i className={`fa-solid ${isOpen ? "fa-chevron-down" : "fa-chevron-right"}`} style={{ marginRight: 10, fontSize: 11, color: "var(--text-3)", width: 12, textAlign: "center" }} />
                  <Image src="/lootlabsicon.jpeg" alt="LL" width={18} height={18} style={{ borderRadius: 3, marginRight: 8 }} />
                  {p.name}
                  <span style={{ fontSize: 11, color: links.length > 0 ? "var(--accent)" : "var(--text-3)", marginLeft: 10, background: "var(--bg-2)", padding: "2px 8px", borderRadius: 10, fontWeight: 400 }}>
                    {links.length} checkpoint{links.length !== 1 ? "s" : ""}
                  </span>
                </span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }} onClick={e => e.stopPropagation()}>
                  <code style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "monospace", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", background: "var(--bg-2)", padding: "3px 8px", borderRadius: 4 }}>
                    {siteUrl}/get-key/{p.id}
                  </code>
                  <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { navigator.clipboard.writeText(`${siteUrl}/get-key/${p.id}`); toast.success("Copied!"); }}>
                    <i className="fa-solid fa-copy" />
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Saved checkpoints */}
                  {links.map((l, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg-2)", borderRadius: "var(--radius)", border: "1px solid var(--border-2)" }}>
                      <span style={{ background: "var(--accent)", color: "#000", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>LootLabs Checkpoint {i + 1}</div>
                        <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "monospace", wordBreak: "break-all" }}>{l.length > 55 ? l.slice(0, 55) + "..." : l}</div>
                      </div>
                      <button className="btn btn-secondary btn-sm" style={{ width: "auto", color: "#ef4444" }} onClick={() => removeLink(p.id, i)}>
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  ))}

                  {/* Flow indicator */}
                  {links.length > 0 && (
                    <div style={{ padding: "10px 14px", background: "rgba(0,200,224,0.04)", border: "1px solid rgba(0,200,224,0.1)", borderRadius: "var(--radius)", display: "flex", flexDirection: "column", gap: 4 }}>
                      {links.map((l, i) => (
                        <div key={i} style={{ fontSize: 11, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ background: "var(--accent)", color: "#000", width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>{i + 1}</span>
                          LootLabs
                          {i < links.length - 1 && <i className="fa-solid fa-arrow-down" style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: 10 }} />}
                        </div>
                      ))}
                      <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <i className="fa-solid fa-key" style={{ width: 16, textAlign: "center", fontSize: 10 }} /> Receive Key
                      </div>
                    </div>
                  )}

                  {/* Add checkpoint form */}
                  <div style={{ padding: "14px", background: "var(--bg-2)", borderRadius: "var(--radius)", border: "1px dashed var(--border-2)" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>
                      {links.length === 0 ? "Add Checkpoint" : `Add Checkpoint ${links.length + 1}`}
                      {links.length >= 3 && <span style={{ color: "var(--text-3)", fontWeight: 400, fontSize: 12 }}> (max 3)</span>}
                    </div>
                    {links.length < 3 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <input className="input" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="LootLabs API key (Profile page)" />
                        <input className="input" value={link} onChange={e => setLink(e.target.value)} placeholder="https://loot-link.com/s?xxxxx" />
                        <button className="btn btn-primary" onClick={() => save(p.id)} disabled={loading} style={{ width: "auto" }}>
                          {loading ? "Saving..." : links.length === 0 ? "Save Checkpoint" : "Add Checkpoint"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Postback info */}
                  <div style={{ padding: "10px 14px", background: "var(--bg-2)", borderRadius: "var(--radius)", border: "1px solid var(--border-2)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Postback URL (LootLabs settings)</div>
                    <code style={{ fontSize: 10, color: "var(--text-2)", fontFamily: "monospace", wordBreak: "break-all" }}>{siteUrl}/api/rewards/postback</code>
                    <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4 }}>LootLabs auto-appends sid, click_id, IP, unique_id.</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
