"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { getSupabase } from "@/lib/supabase/client";

interface Project {
  id: string;
  name: string;
  lootlabs_link?: string;
  lootlabs_api_key?: string;
  ll_link_2?: string;
  ll_link_3?: string;
  reward_provider?: "lootlabs" | "linkvertise";
  linkvertise_link?: string;
  linkvertise_api_key?: string;
  lv_link_2?: string;
  lv_link_3?: string;
}

export default function RewardsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  async function load() {
    try {
      const sb = getSupabase();
      const { data: { session } } = await sb.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

      const res = await fetch("/api/projects", { headers });
      const data = await res.json();
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      }
    } catch {
      toast.error("Failed to load projects.");
    }
  }

  useEffect(() => { load(); }, []);

  // Synchronize inputs when selected project or its provider change
  useEffect(() => {
    if (selectedProjectId) {
      const p = projects.find(x => x.id === selectedProjectId);
      if (p) {
        const provider = p.reward_provider || "lootlabs";
        setApiKey(provider === "linkvertise" ? p.linkvertise_api_key || "" : p.lootlabs_api_key || "");
        setLink("");
      }
    }
  }, [selectedProjectId, projects]);

  const activeProject = projects.find(p => p.id === selectedProjectId);
  const activeProvider = activeProject?.reward_provider || "lootlabs";
  const activeLinks = activeProject
    ? (activeProvider === "linkvertise"
        ? [activeProject.linkvertise_link, activeProject.lv_link_2, activeProject.lv_link_3].filter((l): l is string => !!l)
        : [activeProject.lootlabs_link, activeProject.ll_link_2, activeProject.ll_link_3].filter((l): l is string => !!l)
      )
    : [];

  async function changeProvider(pid: string, provider: "lootlabs" | "linkvertise") {
    setLoading(true);
    try {
      const sb = getSupabase();
      const { data: { session } } = await sb.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

      const res = await fetch(`/api/projects/${pid}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ reward_provider: provider })
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setProjects(prev => prev.map(pr => pr.id === pid ? { ...pr, ...updated } : pr));
      toast.success(`Provider changed to ${provider === "lootlabs" ? "LootLabs" : "Linkvertise"}`);
    } catch {
      toast.error("Failed to change provider.");
    } finally {
      setLoading(false);
    }
  }

  async function save(pid: string) {
    if (!activeProject) return;
    if (!apiKey.trim()) {
      return toast.error(activeProvider === "linkvertise" ? "Linkvertise API key/token required." : "LootLabs API key required.");
    }
    if (!link.trim()) return toast.error("Enter a link.");
    if (activeLinks.length >= 3) return toast.error("Max 3 checkpoints.");

    setLoading(true);
    try {
      const newCount = activeLinks.length + 1;
      const body: any = { checkpoint_steps: newCount };
      
      if (activeProvider === "linkvertise") {
        body.linkvertise_api_key = apiKey;
        if (activeLinks.length === 0) body.linkvertise_link = link;
        else if (activeLinks.length === 1) body.lv_link_2 = link;
        else body.lv_link_3 = link;
      } else {
        body.lootlabs_api_key = apiKey;
        if (activeLinks.length === 0) body.lootlabs_link = link;
        else if (activeLinks.length === 1) body.ll_link_2 = link;
        else body.ll_link_3 = link;
      }

      const sb = getSupabase();
      const { data: { session } } = await sb.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

      const res = await fetch(`/api/projects/${pid}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      
      setProjects(prev => prev.map(pr => pr.id === pid ? { ...pr, ...updated } : pr));
      setLink("");
      toast.success("Checkpoint added successfully!");
    } catch {
      toast.error("Failed to save.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(pid: string, idx: number) {
    if (!activeProject) return;
    setLoading(true);
    try {
      const body: any = {};
      if (activeProvider === "linkvertise") {
        const existing = [activeProject.linkvertise_link, activeProject.lv_link_2, activeProject.lv_link_3].filter((l): l is string => !!l);
        const newCount = Math.max(existing.length - 1, 0);
        body.checkpoint_steps = newCount;
        if (idx === 0) body.linkvertise_link = "";
        if (idx === 1) body.lv_link_2 = "";
        if (idx === 2) body.lv_link_3 = "";
      } else {
        const existing = [activeProject.lootlabs_link, activeProject.ll_link_2, activeProject.ll_link_3].filter((l): l is string => !!l);
        const newCount = Math.max(existing.length - 1, 0);
        body.checkpoint_steps = newCount;
        if (idx === 0) body.lootlabs_link = "";
        if (idx === 1) body.ll_link_2 = "";
        if (idx === 2) body.ll_link_3 = "";
      }

      const sb = getSupabase();
      const { data: { session } } = await sb.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

      const res = await fetch(`/api/projects/${pid}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();

      setProjects(prev => prev.map(pr => pr.id === pid ? { ...pr, ...updated } : pr));
      toast.success("Removed.");
    } catch {
      toast.error("Failed to remove.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Rewards & Checkpoints</h1>
        <p className="page-subtitle">Configure monetization links and providers for your authentication system.</p>
      </div>

      <div className="page-body" style={{ maxWidth: 720 }}>
        {projects.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-gift empty-icon" />
            <div className="empty-title">No projects yet</div>
            <div className="empty-desc">Create a project first, then come back to add checkpoints.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Project Selector Dropdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="input-label" style={{ fontSize: 13, fontWeight: 600 }}>Active Project</label>
              <select
                className="input"
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", borderRadius: 8, padding: 10, color: "var(--text-1)" }}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Active Project Details Card */}
            {activeProject && (
              <>
                <div className="card">
                  <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {activeProvider === "linkvertise" ? (
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          background: "#ea580c",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9,
                          fontWeight: 800,
                          fontFamily: "sans-serif"
                        }}>LV</div>
                      ) : (
                        <Image src="/lootlabsicon.jpeg" alt="LootLabs" width={20} height={20} style={{ borderRadius: 4 }} />
                      )}
                      {activeProject.name}
                      <span style={{ fontSize: 11, color: activeLinks.length > 0 ? "var(--accent)" : "var(--text-3)", background: "var(--bg-2)", padding: "2px 8px", borderRadius: 10, fontWeight: 400 }}>
                        {activeLinks.length} step{activeLinks.length !== 1 ? "s" : ""}
                      </span>
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <code style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "monospace", background: "var(--bg-2)", padding: "3px 8px", borderRadius: 4, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {siteUrl}/get-key/{activeProject.id}
                      </code>
                      <button className="btn btn-secondary btn-sm" style={{ width: "auto" }} onClick={() => { navigator.clipboard.writeText(`${siteUrl}/get-key/${activeProject.id}`); toast.success("Copied!"); }}>
                        <i className="fa-solid fa-copy" />
                      </button>
                    </div>
                  </div>

                  <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Provider Toggle Dropdown */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label className="input-label" style={{ fontSize: 12, fontWeight: 600 }}>Checkpoint Provider</label>
                      <select
                        className="input"
                        value={activeProvider}
                        onChange={e => changeProvider(activeProject.id, e.target.value as "lootlabs" | "linkvertise")}
                        style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", borderRadius: 8, padding: 10, color: "var(--text-1)" }}
                      >
                        <option value="lootlabs">LootLabs</option>
                        <option value="linkvertise">Linkvertise</option>
                      </select>
                    </div>

                    {/* Step List */}
                    {activeLinks.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {activeLinks.map((l, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--bg-2)", borderRadius: "var(--radius)", border: "1px solid var(--border-2)" }}>
                            <span style={{ background: "var(--accent)", color: "#000", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600 }}>{activeProvider === "linkvertise" ? "Linkvertise" : "LootLabs"}</div>
                              <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "monospace", wordBreak: "break-all", marginTop: 1 }}>{l.length > 50 ? l.slice(0, 50) + "..." : l}</div>
                            </div>
                            <button className="btn btn-secondary btn-sm" style={{ width: "auto", color: "#ef4444" }} onClick={() => remove(activeProject.id, i)}>
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

                    {/* Input form for adding checkpoint */}
                    {activeLinks.length < 3 && (
                      <div className="card" style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
                        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>
                            {activeLinks.length === 0 ? "Add a Checkpoint" : `Add Checkpoint ${activeLinks.length + 1}`}
                          </div>
                          <input
                            className="input"
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                            placeholder={activeProvider === "linkvertise" ? "Linkvertise Anti-Bypassing Token (from Linkvertise Publisher API Settings)" : "LootLabs API key (Profile page)"}
                          />
                          <input
                            className="input"
                            value={link}
                            onChange={e => setLink(e.target.value)}
                            placeholder={activeProvider === "linkvertise" ? "https://linkvertise.com/12345/my-link" : "https://loot-link.com/s?xxxxx"}
                          />
                          <button className="btn btn-primary" onClick={() => save(activeProject.id)} disabled={loading} style={{ width: "auto" }}>
                            {loading ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Configuration Guidelines Box */}
                {activeProvider === "linkvertise" ? (
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">
                        <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: "var(--accent)" }} />
                        Linkvertise Integration Details
                      </span>
                    </div>
                    <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5, margin: 0 }}>
                        For Linkvertise links, you must enable the <strong>Anti-Bypassing</strong> feature in the Linkvertise Dashboard, and configure the target redirect URL using one of the options below.
                      </p>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 600 }}>Option A: Direct Redirect (Recommended for sequential checkpoints)</span>
                        <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 4px 0" }}>Set target URL in Linkvertise to your key generation page. Bypasses will be checked on load via local storage.</p>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <code style={{ flex: 1, fontSize: 11, color: "var(--text-2)", fontFamily: "monospace", background: "var(--bg-2)", padding: "8px 12px", borderRadius: 6, overflowX: "auto" }}>
                            {siteUrl}/get-key/{activeProject.id}
                          </code>
                          <button className="btn btn-secondary btn-sm" style={{ width: "auto", alignSelf: "stretch" }} onClick={() => {
                            navigator.clipboard.writeText(`${siteUrl}/get-key/${activeProject.id}`);
                            toast.success("Copied!");
                          }}>
                            <i className="fa-solid fa-copy" />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 600 }}>Option B: Postback Endpoint Redirect</span>
                        <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 4px 0" }}>Set target URL in Linkvertise to the rewards postback endpoint.</p>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <code style={{ flex: 1, fontSize: 11, color: "var(--text-2)", fontFamily: "monospace", background: "var(--bg-2)", padding: "8px 12px", borderRadius: 6, overflowX: "auto" }}>
                            {siteUrl}/api/rewards/postback
                          </code>
                          <button className="btn btn-secondary btn-sm" style={{ width: "auto", alignSelf: "stretch" }} onClick={() => {
                            navigator.clipboard.writeText(`${siteUrl}/api/rewards/postback`);
                            toast.success("Copied!");
                          }}>
                            <i className="fa-solid fa-copy" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">
                        <i className="fa-solid fa-link" style={{ marginRight: 8, color: "var(--accent)" }} />
                        LootLabs Postback URL
                      </span>
                    </div>
                    <div className="card-body">
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <code style={{ flex: 1, fontSize: 11, color: "var(--text-2)", fontFamily: "monospace", background: "var(--bg-2)", padding: "8px 12px", borderRadius: 6, overflowX: "auto" }}>
                          {siteUrl}/api/rewards/postback
                        </code>
                        <button className="btn btn-secondary btn-sm" style={{ width: "auto", alignSelf: "stretch" }} onClick={() => {
                          navigator.clipboard.writeText(`${siteUrl}/api/rewards/postback`);
                          toast.success("Copied!");
                        }}>
                          <i className="fa-solid fa-copy" />
                        </button>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8, lineHeight: 1.4 }}>
                        Paste in LootLabs link settings as the postback URL. LootLabs automatically appends sid, click_id, IP, and unique_id.
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
