"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GetKeyInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params.slug as string) || "";
  const token = searchParams.get("token") || "";

  const [state, setState] = useState<"loading" | "gate" | "idle" | "result" | "error">("loading");
  const [project, setProject] = useState<any>(null);
  const [sessionId, setSessionId] = useState("");
  const [llUrl, setLlUrl] = useState("");
  const [key, setKey] = useState("");
  const [expires, setExpires] = useState(0);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const savedKey = localStorage.getItem("syncauth_key_" + slug);
    if (savedKey) {
      try { const k = JSON.parse(savedKey); if (k.exp > Date.now()) { setKey(k.key); setExpires(k.exp); setState("result"); return; } } catch {}
    }
    init();
  }, []);

  async function init() {
    try {
      const res = await fetch(`/api/get-key/init?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data.error) { setError(data.error); setState("error"); return; }
      setProject(data.project);
      setSessionId(data.session_id);

      if (token) {
        const claimRes = await fetch(`/api/rewards/postback?sid=${token}`);
        const claimData = await claimRes.json();
        if (claimData.status === "completed") setState("idle");
        else { setError("Checkpoint not completed."); setState("error"); }
        return;
      }

      if (data.checkpoint_url) {
        setLlUrl(data.checkpoint_url);
        setState("gate");
      } else {
        setState("idle");
      }
    } catch { setState("gate"); }
  }

  async function startCheckpoint() {
    if (!project) return;
    try {
      const res = await fetch("/api/rewards/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: project.id, lootlabs_link: project.lootlabs_link || "" }),
      });
      const data = await res.json();
      if (data.checkpoint_url) {
        setLlUrl(data.checkpoint_url);
        window.open(data.checkpoint_url, "_blank");
      }
      setState("idle");
    } catch { setError("Failed to create session."); setState("error"); }
  }

  async function generateKey() {
    try {
      const res = await fetch("/api/keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, project_id: project?.id }),
      });
      const data = await res.json();
      if (data.key) {
        setKey(data.key);
        setExpires(data.expires || Date.now() + 86400000);
        localStorage.setItem("syncauth_key_" + slug, JSON.stringify({ key: data.key, exp: data.expires || Date.now() + 86400000 }));
        setState("result");
      } else {
        setError(data.error || "Cannot generate yet.");
        if (data.error?.includes("cooldown")) setCooldown(3600);
        setState("error");
      }
    } catch { setError("Connection failed."); setState("error"); }
  }

  const timeLeft = Math.max(0, Math.floor((expires - Date.now()) / 1000));
  const hours = Math.floor(timeLeft / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0b0e", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 440, background: "#12141d", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "36px 30px", boxShadow: "0 20px 50px rgba(0,0,0,0.6)", color: "#fff", textAlign: "center" }}>
        
        {state === "loading" && <div style={{ color: "#64748b" }}>Loading...</div>}

        {state === "gate" && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(0,200,224,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <i className="fa-solid fa-shield-halved" style={{ fontSize: 24, color: "#00c8e0" }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Checkpoint Required</div>
            <div style={{ fontSize: 13.5, color: "#94a3b8", marginBottom: 24, lineHeight: 1.5 }}>
              Complete a quick checkpoint to verify you&apos;re human and get your license key.
            </div>
            {llUrl ? (
              <a href={llUrl} target="_blank" rel="noreferrer"
                style={{ display: "block", width: "100%", padding: 14, borderRadius: 10, background: "#00c8e0", color: "#000", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", textDecoration: "none", marginBottom: 12 }}>
                Start Checkpoint
              </a>
            ) : (
              <button onClick={startCheckpoint}
                style={{ width: "100%", padding: 14, borderRadius: 10, background: "#00c8e0", color: "#000", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", marginBottom: 12 }}>
                Start Checkpoint
              </button>
            )}
            {!llUrl && (
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Set up LootLabs in the Rewards tab for automatic checkpoints.
              </div>
            )}
          </>
        )}

        {state === "idle" && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <i className="fa-solid fa-check" style={{ fontSize: 24, color: "#22c55e" }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Ready to Generate</div>
            <div style={{ fontSize: 13.5, color: "#94a3b8", marginBottom: 24 }}>
              Checkpoint completed. Generate your license key below.
            </div>
            <button onClick={generateKey}
              style={{ width: "100%", padding: 14, borderRadius: 10, background: "#22c55e", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
              Generate Key
            </button>
          </>
        )}

        {state === "result" && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(0,200,224,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <i className="fa-solid fa-key" style={{ fontSize: 24, color: "#00c8e0" }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Your License Key</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
              Expires in {hours}h {mins}m {secs}s
            </div>
            <div style={{ padding: "14px 18px", background: "rgba(0,200,224,0.08)", borderRadius: 10, border: "1px solid rgba(0,200,224,0.15)", marginBottom: 14 }}>
              <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: "#00c8e0", letterSpacing: 1, wordBreak: "break-all" }}>
                {key}
              </code>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(key); }}
              style={{ padding: "10px 20px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, cursor: "pointer" }}>
              <i className="fa-solid fa-copy" style={{ marginRight: 6 }} /> Copy Key
            </button>
          </>
        )}

        {state === "error" && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 24, color: "#ef4444" }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Error</div>
            <div style={{ fontSize: 13.5, color: "#fca5a5", marginBottom: 20 }}>{error || "Something went wrong."}</div>
            <button onClick={() => { setState("gate"); init(); }}
              style={{ padding: "10px 20px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, cursor: "pointer" }}>
              Try Again
            </button>
          </>
        )}

        {project && state !== "loading" && (
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.04)", fontSize: 12, color: "#475569" }}>
            <i className="fa-solid fa-lock" style={{ marginRight: 4 }} /> Secured by SyncAuth
          </div>
        )}
      </div>
    </div>
  );
}

export default function GetKeyPage() {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0a0b0e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>Loading...</div>}><GetKeyInner /></Suspense>;
}
