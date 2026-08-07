"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function KeySystemInner() {
  const searchParams = useSearchParams();
  const [projectId, setProjectId] = useState(searchParams.get("project") || "");
  const [project, setProject] = useState<any>(null);
  const [step, setStep] = useState<"idle" | "checkpoint" | "generate" | "done">("idle");
  const [sessionId, setSessionId] = useState("");
  const [lootlabsUrl, setLootlabsUrl] = useState("");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadProject() {
    if (!projectId.trim()) return;
    try {
      const res = await fetch(`/api/projects/${projectId.trim()}`);
      if (res.ok) setProject(await res.json());
      else setError("Project not found.");
    } catch { setError("Failed to load project."); }
  }

  async function startSession() {
    if (!project) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/rewards/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: project.id }),
      });
      const data = await res.json();
      if (data.session_id) {
        setSessionId(data.session_id);
        if (data.lootlabs_url) {
          setLootlabsUrl(data.lootlabs_url);
          setStep("checkpoint");
        } else {
          setStep("generate");
        }
      } else {
        setError(data.error || "Failed to create session.");
      }
    } catch { setError("Connection error."); }
    finally { setLoading(false); }
  }

  function onCheckpointDone() {
    setStep("generate");
  }

  async function generateKey() {
    if (!sessionId) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, project_id: project.id }),
      });
      const data = await res.json();
      if (data.key) {
        setKey(data.key);
        setStep("done");
      } else {
        setError(data.error || "Could not generate key. Complete the checkpoint first.");
      }
    } catch { setError("Connection error."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#030305", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", color: "#fff", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 440, background: "#0a0b0e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "32px 28px", boxShadow: "0 20px 50px rgba(0,0,0,0.7)" }}>
        
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{project ? project.name : "Key System"}</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>Get your license key</div>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 13 }}>{error}</div>
        )}

        {!project ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              placeholder="Enter Project ID"
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", padding: "12px 14px", fontSize: 14, outline: "none" }}
            />
            <button onClick={loadProject} style={{ padding: "12px", borderRadius: 10, background: "#fff", color: "#000", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Load Project
            </button>
          </div>
        ) : step === "checkpoint" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#94a3b8" }}>Complete the checkpoint to unlock your key.</p>
            <a href={lootlabsUrl} target="_blank" rel="noreferrer" style={{ padding: "14px", borderRadius: 10, background: "var(--accent, #00c8e0)", color: "#000", border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer", textDecoration: "none", display: "block" }}>
              Complete Checkpoint
            </a>
            <button onClick={onCheckpointDone} style={{ padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>
              I completed the checkpoint
            </button>
          </div>
        ) : step === "generate" || step === "idle" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "center" }}>
            {step === "idle" && (
              <button onClick={startSession} disabled={loading} style={{ padding: "14px", borderRadius: 10, background: "var(--accent, #00c8e0)", color: "#000", border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                {loading ? "Creating..." : "Get Key"}
              </button>
            )}
            {step === "generate" && (
              <button onClick={generateKey} disabled={loading} style={{ padding: "14px", borderRadius: 10, background: "var(--accent, #00c8e0)", color: "#000", border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                {loading ? "Please wait..." : "Generate Key"}
              </button>
            )}
          </div>
        ) : step === "done" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>Your License Key</div>
            <div style={{ padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "var(--accent, #00c8e0)", letterSpacing: 1, wordBreak: "break-all" }}>
              {key}
            </div>
            <button onClick={() => { navigator.clipboard.writeText(key); }} style={{ padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, cursor: "pointer" }}>
              Copy Key
            </button>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
              Enter this key in the loader along with the Script ID.
            </div>
          </div>
        ) : null}

        {project && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <button onClick={() => { setProject(null); setStep("idle"); setKey(""); setError(""); }} style={{ background: "none", border: "none", color: "#64748b", fontSize: 12, cursor: "pointer" }}>
              Change Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KeySystemPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#030305", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Inter, sans-serif" }}>Loading...</div>}>
      <KeySystemInner />
    </Suspense>
  );
}
