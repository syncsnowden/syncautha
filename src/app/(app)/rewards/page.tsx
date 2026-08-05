"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Project { id: string; name: string; lootlabs_link?: string; lootlabs_api_key?: string; ll_link_2?: string; ll_link_3?: string; }

export default function RewardsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [link, setLink] = useState("");
  const [activePid, setActivePid] = useState("");
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
    setLoading(true);
    try {
      const body: any = { lootlabs_api_key: apiKey, checkpoint_steps: existing.length + 1 };
      if (existing.length === 0) body.lootlabs_link = link;
      else if (existing.length === 1) body.ll_link_2 = link;
      else if (existing.length === 2) body.ll_link_3 = link;
      const res = await fetch(`/api/projects/${pid}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      await load();
      setLink("");
      toast.success("Saved!");
    } catch { toast.error("Failed."); }
    finally { setLoading(false); }
  }

  async function remove(pid: string, idx: number) {
    setLoading(true);
    try {
      const body: any = { checkpoint_steps: 1 };
      if (idx === 0) { body.lootlabs_link = ""; body.checkpoint_steps = 0; }
      if (idx === 1) body.ll_link_2 = "";
      if (idx === 2) body.ll_link_3 = "";
      const res = await fetch(`/api/projects/${pid}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      await load();
      toast.success("Removed.");
    } catch { toast.error("Failed."); }
    finally { setLoading(false); }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Rewards</h1>
        <p className="page-subtitle">Add LootLabs checkpoints to your projects.</p>
      </div>
      <div className="page-body">
        {projects.map(p => {
          const links = [p.lootlabs_link, p.ll_link_2, p.ll_link_3].filter((l): l is string => !!l);
          const isActive = activePid === p.id;
          return (
            <div key={p.id} className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <span className="card-title">
                  <Image src="/lootlabsicon.jpeg" alt="LL" width={18} height={18} style={{ borderRadius: 3, marginRight: 8 }} />
                  {p.name}
                  <span style={{ fontSize: 11, color: links.length > 0 ? "var(--accent)" : "var(--text-3)", marginLeft: 10, background: "var(--bg-2)", padding: "2px 8px", borderRadius: 10, fontWeight: 400 }}>
                    {links.length} checkpoint{links.length !== 1 ? "s" : ""}
                  </span>
                </span>
                <code style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "monospace", background: "var(--bg-2)", padding: "3px 8px", borderRadius: 4, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {siteUrl}/get-key/{p.id}
                </code>
                <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { navigator.clipboard.writeText(`${siteUrl}/get-key/${p.id}`); toast.success("Copied!"); }}>
                  <i className="fa-solid fa-copy" />
                </button>
              </div>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {links.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {links.map((l, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--bg-2)", borderRadius: "var(--radius)" }}>
                        <span style={{ background: "var(--accent)", color: "#000", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>LootLabs</div>
                          <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "monospace", wordBreak: "break-all" }}>{l.length > 50 ? l.slice(0, 50) + "..." : l}</div>
                        </div>
                        <button className="btn btn-secondary btn-sm" style={{ width: "auto", color: "#ef4444" }} onClick={() => remove(p.id, i)}>
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    ))}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0", fontSize: 12 }}>
                      <i className="fa-solid fa-arrow-down" style={{ color: "var(--text-3)", marginLeft: 5 }} />
                      <i className="fa-solid fa-key" style={{ color: "var(--accent)", marginLeft: 5 }} />
                      <span style={{ color: "var(--accent)", fontWeight: 600 }}>Receive Key</span>
                    </div>
                  </div>
                )}

                {links.length < 3 && (
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "10px 14px", background: "var(--bg-2)", borderRadius: "var(--radius)", border: "1px dashed var(--border-2)" }}>
                    <input className="input" value={isActive ? apiKey : ""} onChange={e => { setApiKey(e.target.value); setActivePid(p.id); }} onFocus={() => setActivePid(p.id)} placeholder="API key" style={{ flex: 1, minWidth: 120 }} />
                    <input className="input" value={isActive ? link : ""} onChange={e => { setLink(e.target.value); setActivePid(p.id); }} onFocus={() => setActivePid(p.id)} placeholder="https://loot-link.com/s?xxxxx" style={{ flex: 1, minWidth: 180 }} />
                    <button className="btn btn-primary btn-sm" onClick={() => save(p.id)} disabled={loading} style={{ width: "auto" }}>
                      {links.length === 0 ? "Save" : "Add"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="card" style={{ marginTop: 8 }}>
          <div className="card-header">
            <span className="card-title">Postback URL (LootLabs Settings)</span>
          </div>
          <div className="card-body">
            <code style={{ fontSize: 12, color: "var(--text-2)", fontFamily: "monospace", wordBreak: "break-all" }}>{siteUrl}/api/rewards/postback</code>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>LootLabs auto-appends sid, click_id, IP, unique_id. Paste this in your LootLabs link postback settings.</div>
          </div>
        </div>
      </div>
    </>
  );
}
