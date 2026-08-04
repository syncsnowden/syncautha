"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function GetKeyPage() {
  const params = useParams();
  const raw = (params.slug as string) || "";
  const [step, setStep] = useState<"loading" | "checkpoint" | "generate" | "done" | "error">("loading");
  const [project, setProject] = useState<any>(null);
  const [sessionId, setSessionId] = useState("");
  const [postbackUrl, setPostbackUrl] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { init(); }, []);

  async function init() {
    try {
      const res = await fetch(`/api/get-key/init?slug=${encodeURIComponent(raw)}`);
      const data = await res.json();
      if (data.error) { setError(data.error); setStep("error"); return; }
      setProject(data.project);
      setSessionId(data.session_id);
      setPostbackUrl(data.postback_url);

      if (data.lootlabs_url) {
        window.location.href = data.lootlabs_url;
        return;
      }
      setStep("checkpoint");
    } catch { setError("Connection failed."); setStep("error"); }
  }

  async function generateKey() {
    setStep("generate");
    try {
      const res = await fetch("/api/keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, project_id: project.id }),
      });
      const data = await res.json();
      if (data.key) { setKey(data.key); setStep("done"); }
      else { setError(data.error || "Cannot generate key yet. Complete the checkpoint first."); setStep("checkpoint"); }
    } catch { setError("Connection failed."); setStep("checkpoint"); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#030305", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", color: "#fff", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 440, background: "#0a0b0e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "32px 28px", boxShadow: "0 20px 50px rgba(0,0,0,0.7)", textAlign: "center" }}>
        
        {step === "loading" && <div>Loading...</div>}

        {step === "error" && (
          <>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: "#fca5a5" }}>Error</div>
            <p style={{ fontSize: 14, color: "#94a3b8" }}>{error}</p>
          </>
        )}

        {step === "checkpoint" && project && (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{project.name}</div>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
              Complete the checkpoint to get your license key.
            </p>
            <div style={{ padding: 14, background: "rgba(255,255,255,0.04)", borderRadius: 10, marginBottom: 16, fontSize: 12, color: "var(--text-3)", wordBreak: "break-all" }}>
              If using LootLabs, set this as your postback URL:<br />
              <code style={{ color: "var(--accent)", fontSize: 11 }}>{postbackUrl}</code>
            </div>
            <button onClick={generateKey}
              style={{ width: "100%", padding: 14, borderRadius: 10, background: "var(--accent, #00c8e0)", color: "#000", border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
              I Completed the Checkpoint
            </button>
          </>
        )}

        {step === "generate" && (
          <div>Generating key...</div>
        )}

        {step === "done" && key && (
          <>
            <div style={{ color: "#22c55e", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Your License Key</div>
            <div style={{ padding: 14, background: "rgba(255,255,255,0.04)", borderRadius: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "var(--accent, #00c8e0)", letterSpacing: 1, wordBreak: "break-all", marginBottom: 16 }}>
              {key}
            </div>
            <button onClick={() => { navigator.clipboard.writeText(key); }}
              style={{ padding: "10px 20px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, cursor: "pointer" }}>
              Copy Key
            </button>
          </>
        )}
      </div>
    </div>
  );
}
