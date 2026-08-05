"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GetKeyInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params.slug as string) || "";
  const token = searchParams.get("token") || "";

  const [state, setState] = useState<"loading" | "gate" | "idle" | "result" | "cooldown" | "error">("loading");
  const [project, setProject] = useState<any>(null);
  const [sessionId, setSessionId] = useState("");
  const [llUrl, setLlUrl] = useState("");
  const [key, setKey] = useState("");
  const [expires, setExpires] = useState(0);
  const [error, setError] = useState("");
  const [cooldownSec, setCooldownSec] = useState(0);

  useEffect(() => {
    const ck = localStorage.getItem("syncauth_cooldown_" + slug);
    if (ck && parseInt(ck) > Date.now()) {
      setCooldownSec(Math.ceil((parseInt(ck) - Date.now()) / 1000));
      setState("cooldown");
      return;
    }
    const sk = localStorage.getItem("syncauth_key_" + slug);
    if (sk) {
      try { const k = JSON.parse(sk); if (k.exp > Date.now()) { setKey(k.key); setExpires(k.exp); setState("result"); return; } } catch {}
    }
    init();
  }, []);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const t = setInterval(() => {
      setCooldownSec(s => {
        if (s <= 1) { setState("gate"); clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownSec]);

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
        if (claimData.status === "completed") { setState("idle"); return; }
      }

      if (data.checkpoint_url) {
        setLlUrl(data.checkpoint_url);
        setState("gate");
      } else {
        setError("No checkpoint configured. Add LootLabs in the Rewards tab.");
        setState("error");
      }
    } catch { setError("Connection failed."); setState("error"); }
  }

  async function startCheckpoint() {
    if (llUrl) {
      window.location.href = llUrl;
    } else {
      setError("No checkpoint configured.");
      setState("error");
    }
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
        if (data.error?.includes("cooldown")) {
          localStorage.setItem("syncauth_cooldown_" + slug, String(Date.now() + 86400000));
          setCooldownSec(86400);
          setState("cooldown");
        } else {
          setError(data.error || "Checkpoint not completed.");
          setState("error");
        }
      }
    } catch { setError("Connection failed."); setState("error"); }
  }

  const timeLeft = Math.max(0, Math.floor((expires - Date.now()) / 1000));
  const h = Math.floor(timeLeft / 3600), m = Math.floor((timeLeft % 3600) / 60), s = timeLeft % 60;
  const cdH = Math.floor(cooldownSec / 3600), cdM = Math.floor((cooldownSec % 3600) / 60), cdS = cooldownSec % 60;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", padding: 20 }}>
      <style>{`
        .ks-card { background: #11131e; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 32px 28px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); color: #fff; text-align: center; max-width: 420px; width: 100%; }
        .ks-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .ks-icon.gate { background: rgba(239,68,68,0.08); }
        .ks-icon.ready { background: rgba(34,197,94,0.08); }
        .ks-icon.done { background: rgba(0,200,224,0.08); }
        .ks-icon i { font-size: 22px; }
        .ks-icon.gate i { color: #ef4444; }
        .ks-icon.ready i { color: #22c55e; }
        .ks-icon.done i { color: #00c8e0; }
        .ks-btn { display: block; width: 100%; padding: 12px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; font-family: Inter, sans-serif; text-decoration: none; }
        .ks-btn.red { background: #ef4444; color: #fff; }
        .ks-btn.green { background: #22c55e; color: #fff; }
        .ks-btn.ghost { background: rgba(255,255,255,0.04); color: #94a3b8; border: 1px solid rgba(255,255,255,0.06); }
        .ks-key-box { padding: 14px 16px; background: rgba(0,200,224,0.06); border: 1px solid rgba(0,200,224,0.12); border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 17px; font-weight: 700; color: #00c8e0; letter-spacing: 0.5px; word-break: break-all; }
        .ks-meta { font-size: 12px; color: #64748b; margin-top: 8px; }
      `}</style>

      <div className="ks-card">
        {state === "loading" && <div style={{ color: "#64748b", fontSize: 14 }}>Loading...</div>}

        {state === "gate" && (
          <>
            <div className="ks-icon gate"><i className="fa-solid fa-shield-halved" /></div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Checkpoint Required</div>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20, lineHeight: 1.5 }}>
              Complete a quick verification to get your license key for {project?.name || "this script"}.
            </p>
            <button onClick={startCheckpoint} className="ks-btn red">Start Checkpoint</button>
          </>
        )}

        {state === "idle" && (
          <>
            <div className="ks-icon ready"><i className="fa-solid fa-check" /></div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Ready</div>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Checkpoint completed. Generate your key below.</p>
            <button onClick={generateKey} className="ks-btn green">Generate Key</button>
          </>
        )}

        {state === "cooldown" && (
          <>
            <div className="ks-icon gate"><i className="fa-solid fa-clock" /></div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Cooldown Active</div>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>You recently generated a key. Wait before generating another.</p>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b", marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>
              {String(cdH).padStart(2, "0")}:{String(cdM).padStart(2, "0")}:{String(cdS).padStart(2, "0")}
            </div>
            <button onClick={() => { localStorage.removeItem("syncauth_cooldown_" + slug); setState("gate"); init(); }} className="ks-btn ghost">Reset (if allowed)</button>
          </>
        )}

        {state === "result" && (
          <>
            <div className="ks-icon done"><i className="fa-solid fa-key" /></div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Key Generated</div>
            <p className="ks-meta">Expires in {h}h {m}m {s}s</p>
            <div className="ks-key-box" style={{ marginBottom: 12 }}>{key}</div>
            <button onClick={() => { navigator.clipboard.writeText(key); }} className="ks-btn ghost">
              <i className="fa-solid fa-copy" style={{ marginRight: 6 }} /> Copy Key
            </button>
            <p className="ks-meta" style={{ marginTop: 6 }}>Paste this in the loader along with your Script ID.</p>
          </>
        )}

        {state === "error" && (
          <>
            <div className="ks-icon gate"><i className="fa-solid fa-triangle-exclamation" /></div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Error</div>
            <p style={{ fontSize: 13, color: "#fca5a5", marginBottom: 16 }}>{error}</p>
            <button onClick={() => { setState("gate"); init(); }} className="ks-btn ghost">Try Again</button>
          </>
        )}

        {project && state !== "loading" && (
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.04)", fontSize: 11, color: "#3b3b4d" }}>
            Powered by SyncAuth
          </div>
        )}
      </div>
    </div>
  );
}

export default function GetKeyPage() {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>Loading...</div>}><GetKeyInner /></Suspense>;
}
