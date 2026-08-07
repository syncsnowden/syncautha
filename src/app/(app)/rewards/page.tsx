"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Project { id: string; name: string; lootlabs_link?: string; lootlabs_api_key?: string; ll_link_2?: string; ll_link_3?: string; }

export default function RewardsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  async function load() {
    const res = await fetch("/api/projects");
    setProjects(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function save(pid: string) {
    const p = projects.find(x => x.id === pid);
    const existing = p ? [p.lootlabs_link, p.ll_link_2, p.ll_link_3].filter((l): l is string => !!l) : [];
    if (!apiKey.trim()) return toast.error("API key required.");
    if (!link.trim()) return toast.error("Enter a link.");
    if (existing.length >= 3) return toast.error("Max 3 checkpoints.");
    setLoading(true);
    try {
      const newCount = existing.length + 1; // after adding this link
      const body: any = { lootlabs_api_key: apiKey, checkpoint_steps: newCount };
      if (existing.length === 0) body.lootlabs_link = link;
      else if (existing.length === 1) body.ll_link_2 = link;
      else body.ll_link_3 = link;
      const res = await fetch(`/api/projects/${pid}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setProjects(prev => prev.map(pr => pr.id === pid ? { ...pr, lootlabs_link: updated.lootlabs_link || "", lootlabs_api_key: updated.lootlabs_api_key || "", ll_link_2: updated.ll_link_2 || "", ll_link_3: updated.ll_link_3 || "" } : pr));
      setLink("");
      toast.success("Saved!");
    } catch { toast.error("Failed."); }
    finally { setLoading(false); }
  }

  async function remove(pid: string, idx: number) {
    setLoading(true);
    try {
      const p = projects.find(x => x.id === pid);
      const existing = p ? [p.lootlabs_link, p.ll_link_2, p.ll_link_3].filter((l): l is string => !!l) : [];
      const newCount = Math.max(existing.length - 1, 0);
      const body: any = { checkpoint_steps: newCount };
      if (idx === 0) body.lootlabs_link = "";
      if (idx === 1) body.ll_link_2 = "";
      if (idx === 2) body.ll_link_3 = "";
      const res = await fetch(`/api/projects/${pid}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setProjects(prev => prev.map(pr => pr.id === pid ? { ...pr, lootlabs_link: updated.lootlabs_link || "", ll_link_2: updated.ll_link_2 || "", ll_link_3: updated.ll_link_3 || "" } : pr));
      toast.success("Removed.");
    } catch { toast.error("Failed."); }
    finally { setLoading(false); }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Rewards</h1>
        <p className="page-subtitle">Set up LootLabs checkpoints for your projects.</p>
      </div>
      <div className="page-body" style={{ maxWidth: 720 }}>
        {projects.length === 0 && (
          <div className="empty-state">
            <i className="fa-solid fa-gift empty-icon" />
            <div className="empty-title">No projects yet</div>
            <div className="empty-desc">Create a project first, then come back to add checkpoints.</div>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {projects.map(p => {
            const links = [p.lootlabs_link, p.ll_link_2, p.ll_link_3].filter((l): l is string => !!l);
            return (
              <div key={p.id} className="card">
                <div className="card-header">
                  <span className="card-title">
                    <Image src="/lootlabsicon.jpeg" alt="LL" width={20} height={20} style={{ borderRadius: 4, marginRight: 8 }} />
                    {p.name}
                    <span style={{ fontSize: 11, color: links.length > 0 ? "var(--accent)" : "var(--text-3)", marginLeft: 10, background: "var(--bg-2)", padding: "2px 8px", borderRadius: 10, fontWeight: 400 }}>
                      {links.length} step{links.length !== 1 ? "s" : ""}
                    </span>
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <code style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "monospace", background: "var(--bg-2)", padding: "3px 8px", borderRadius: 4, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {siteUrl}/get-key/{p.id}
                    </code>
                    <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { navigator.clipboard.writeText(`${siteUrl}/get-key/${p.id}`); toast.success("Copied!"); }}>
                      <i className="fa-solid fa-copy" />
                    </button>
                  </div>
                </div>
                <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {links.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {links.map((l, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--bg-2)", borderRadius: "var(--radius)", border: "1px solid var(--border-2)" }}>
                          <span style={{ background: "var(--accent)", color: "#000", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>LootLabs</div>
                            <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "monospace", wordBreak: "break-all", marginTop: 1 }}>{l.length > 50 ? l.slice(0, 50) + "..." : l}</div>
                          </div>
                          <button className="btn btn-secondary btn-sm" style={{ width: "auto", color: "#ef4444" }} onClick={() => remove(p.id, i)}>
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      ))}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0 4px 12px", fontSize: 12 }}>
                        <i className="fa-solid fa-chevron-down" style={{ color: "var(--border-2)" }} />
                        <i className="fa-solid fa-key" style={{ color: "var(--accent)" }} />
                        <span style={{ color: "var(--accent)", fontWeight: 600 }}>Receive Key</span>
                      </div>
                    </div>
                  )}

                  {links.length < 3 && (
                    <div className="card" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
                      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {links.length === 0 ? "Add a Checkpoint" : `Add Checkpoint ${links.length + 1}`}
                        </div>
                        <input className="input" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="LootLabs API key (Profile page)" />
                        <input className="input" value={link} onChange={e => setLink(e.target.value)} placeholder="https://loot-link.com/s?xxxxx" />
                        <button className="btn btn-primary" onClick={() => save(p.id)} disabled={loading} style={{ width: "auto" }}>
                          {loading ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <span className="card-title"><i className="fa-solid fa-link" style={{ marginRight: 8, color: "var(--accent)" }} />Postback URL</span>
          </div>
          <div className="card-body">
            <code style={{ fontSize: 12, color: "var(--text-2)", fontFamily: "monospace", wordBreak: "break-all" }}>{siteUrl}/api/rewards/postback</code>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>Paste in LootLabs link settings as postback URL. LootLabs auto-adds sid, click_id, IP, unique_id.</div>
          </div>
        </div>
      </div>
    </>
  );
}
