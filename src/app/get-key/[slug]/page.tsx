"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GetKeyInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params.slug as string) || "";
  const token = searchParams.get("token") || "";

  type AppState = "loading" | "gate" | "progress" | "idle" | "result" | "cooldown" | "error";
  const [state, setState] = useState<AppState>("loading");
  const [project, setProject] = useState<any>(null);
  const [sessionId, setSessionId] = useState("");
  const [llUrl, setLlUrl] = useState("");     // CP to start (gate state)
  const [nextUrl, setNextUrl] = useState(""); // next CP URL (progress state)
  const [key, setKey] = useState("");
  const [expires, setExpires] = useState(0);
  const [error, setError] = useState("");
  const [cooldownSec, setCooldownSec] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [totalSteps, setTotalSteps] = useState(1);

  useEffect(() => {
    const ck = localStorage.getItem("syncauth_cooldown_" + slug);
    if (ck && parseInt(ck) > Date.now()) {
      setCooldownSec(Math.ceil((parseInt(ck) - Date.now()) / 1000));
      setState("cooldown");
      return;
    }
    const sk = localStorage.getItem("syncauth_key_" + slug);
    if (sk) {
      try {
        const k = JSON.parse(sk);
        if (k.exp > Date.now()) { setKey(k.key); setExpires(k.exp); setState("result"); return; }
      } catch {}
    }
    init();
  }, [slug]);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const t = setInterval(() => {
      setCooldownSec(s => {
        if (s <= 1) { clearInterval(t); setState("gate"); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownSec]);

  async function init() {
    try {
      const res = await fetch(
        `/api/get-key/init?slug=${encodeURIComponent(slug)}${token ? `&token=${encodeURIComponent(token)}` : ""}`
      );
      const data = await res.json();
      if (data.error) { setError(data.error); setState("error"); return; }

      setProject(data.project);
      setSessionId(data.session_id);
      const done  = data.completed_steps || 0;
      const total = data.total_steps || 1;
      setCompletedSteps(done);
      setTotalSteps(total);

      if (data.all_done) {
        // All checkpoints complete — show Generate Key
        setState("idle");
        return;
      }

      if (!data.checkpoint_url) {
        setError("No checkpoint configured for this step.");
        setState("error");
        return;
      }

      if (done > 0) {
        // Returned from a checkpoint mid-flow → show progress screen with Continue button
        setNextUrl(data.checkpoint_url);
        setState("progress");
      } else {
        // Fresh start — show first checkpoint
        setLlUrl(data.checkpoint_url);
        setState("gate");
      }
    } catch {
      setError("Connection failed.");
      setState("error");
    }
  }

  function goToCheckpoint(url: string) {
    if (url) window.location.href = url;
    else { setError("Checkpoint URL not ready."); setState("error"); }
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
        localStorage.setItem(
          "syncauth_key_" + slug,
          JSON.stringify({ key: data.key, exp: data.expires || Date.now() + 86400000 })
        );
        setState("result");
      } else if (data.error?.includes("cooldown")) {
        localStorage.setItem("syncauth_cooldown_" + slug, String(Date.now() + 86400000));
        setCooldownSec(86400);
        setState("cooldown");
      } else {
        setError(data.error || "Checkpoint not completed.");
        setState("error");
      }
    } catch { setError("Connection failed."); setState("error"); }
  }

  const timeLeft = Math.max(0, Math.floor((expires - Date.now()) / 1000));
  const eh = Math.floor(timeLeft / 3600), em = Math.floor((timeLeft % 3600) / 60), es = timeLeft % 60;
  const cdH = Math.floor(cooldownSec / 3600), cdM = Math.floor((cooldownSec % 3600) / 60), cdS = cooldownSec % 60;

  /* ── Checkpoint progress tracker (right panel) ── */
  const ProgressTracker = ({ done, total }: { done: number; total: number }) => {
    if (total <= 1) return null;
    return (
      <div style={{
        display: "flex", flexDirection: "column", gap: 6,
        background: "rgba(255,255,255,0.02)", borderRadius: 10,
        padding: "14px 12px", border: "1px solid rgba(255,255,255,0.05)",
        minWidth: 160,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" }}>
          Progress
        </div>
        {Array.from({ length: total }).map((_, i) => {
          const isDone = i < done;
          const isCurrent = i === done;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 10px", borderRadius: 8,
              background: isDone ? "rgba(34,197,94,0.08)" : isCurrent ? "rgba(0,200,224,0.08)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${isDone ? "rgba(34,197,94,0.2)" : isCurrent ? "rgba(0,200,224,0.2)" : "rgba(255,255,255,0.04)"}`,
              transition: "all 0.2s",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700,
                background: isDone ? "#22c55e" : isCurrent ? "rgba(0,200,224,0.2)" : "rgba(255,255,255,0.06)",
                color: isDone ? "#000" : isCurrent ? "#00c8e0" : "#475569",
                border: isCurrent ? "1px solid #00c8e0" : "none",
              }}>
                {isDone ? "✓" : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: isDone ? "#22c55e" : isCurrent ? "#00c8e0" : "#475569" }}>
                  Checkpoint {i + 1}
                </div>
                <div style={{ fontSize: 10, color: isDone ? "#22c55e" : isCurrent ? "#94a3b8" : "#334155" }}>
                  {isDone ? "Completed" : isCurrent ? "Current" : "Pending"}
                </div>
              </div>
            </div>
          );
        })}
        {/* Final → key */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "7px 10px", borderRadius: 8,
          background: done >= total ? "rgba(0,200,224,0.08)" : "rgba(255,255,255,0.01)",
          border: `1px solid ${done >= total ? "rgba(0,200,224,0.2)" : "rgba(255,255,255,0.03)"}`,
          opacity: done >= total ? 1 : 0.4,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
            background: done >= total ? "#00c8e0" : "rgba(255,255,255,0.04)",
            color: done >= total ? "#000" : "#334155",
          }}>🗝</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: done >= total ? "#00c8e0" : "#334155" }}>Get Key</div>
            <div style={{ fontSize: 10, color: done >= total ? "#94a3b8" : "#1e293b" }}>
              {done >= total ? "Unlocked!" : "Locked"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ── Card layout ── */
  const isWide = totalSteps > 1 && state !== "loading" && state !== "result" && state !== "cooldown" && state !== "error";

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Inter, sans-serif", padding: 20,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .ks-card { background: #111318; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; box-shadow: 0 24px 60px rgba(0,0,0,0.6); color: #fff; width: 100%; }
        .ks-btn { display: block; width: 100%; padding: 13px; border-radius: 9px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; font-family: Inter, sans-serif; text-decoration: none; text-align: center; transition: opacity 0.15s, transform 0.1s; }
        .ks-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .ks-btn:active { transform: translateY(0); }
        .ks-btn.accent { background: linear-gradient(135deg, #00c8e0, #006bff); color: #fff; }
        .ks-btn.green  { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; }
        .ks-btn.ghost  { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.08); }
        .ks-key-box { padding: 14px 16px; background: rgba(0,200,224,0.06); border: 1px solid rgba(0,200,224,0.15); border-radius: 9px; font-family: 'JetBrains Mono', monospace; font-size: 17px; font-weight: 700; color: #00c8e0; letter-spacing: 0.5px; word-break: break-all; }
        .ks-meta { font-size: 12px; color: #64748b; }
        .ks-badge { display: inline-flex; align-items: center; gap: 5px; background: rgba(0,200,224,0.1); color: #00c8e0; border: 1px solid rgba(0,200,224,0.2); border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 700; }
      `}</style>

      <div className="ks-card" style={{ maxWidth: isWide ? 740 : 420 }}>
        {/* ── Header ── */}
        {project && state !== "loading" && (
          <div style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{project.name}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>License Key System</div>
            </div>
            {totalSteps > 1 && (
              <span className="ks-badge">
                {completedSteps}/{totalSteps} Completed
              </span>
            )}
          </div>
        )}

        {/* ── Body: left action + right progress ── */}
        <div style={{
          display: "flex",
          flexDirection: isWide ? "row" : "column",
          gap: 0,
        }}>
          {/* Left / Main Action */}
          <div style={{
            flex: 1, padding: "28px 24px",
            display: "flex", flexDirection: "column", gap: 16,
          }}>

            {/* LOADING */}
            {state === "loading" && (
              <div style={{ textAlign: "center", color: "#475569", fontSize: 14, padding: "20px 0" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                Loading...
              </div>
            )}

            {/* GATE — Start current checkpoint */}
            {state === "gate" && (
              <>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, margin: "0 auto 16px",
                  }}>🔒</div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
                    Checkpoint {completedSteps + 1}{totalSteps > 1 ? ` of ${totalSteps}` : ""}
                  </div>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                    Complete this checkpoint to{totalSteps > 1 && completedSteps + 1 < totalSteps ? " continue" : " unlock your key"}.
                  </p>
                </div>
                <button className="ks-btn accent" onClick={() => goToCheckpoint(llUrl)}>
                  🚀 Start Checkpoint {totalSteps > 1 ? `${completedSteps + 1}/${totalSteps}` : ""}
                </button>
              </>
            )}

            {/* PROGRESS — Intermediate "X/Y done" screen */}
            {state === "progress" && (
              <>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 26, margin: "0 auto 16px",
                  }}>✅</div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
                    {completedSteps}/{totalSteps} Completed!
                  </div>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                    Nice work! {totalSteps - completedSteps} more checkpoint{totalSteps - completedSteps > 1 ? "s" : ""} to unlock your key.
                  </p>
                </div>

                {/* Mini progress bar */}
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 99, height: 6, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    width: `${(completedSteps / totalSteps) * 100}%`,
                    background: "linear-gradient(90deg, #22c55e, #00c8e0)",
                    transition: "width 0.4s ease",
                  }} />
                </div>
                <div style={{ fontSize: 11, color: "#64748b", textAlign: "center" }}>
                  {Math.round((completedSteps / totalSteps) * 100)}% complete
                </div>

                <button className="ks-btn accent" onClick={() => goToCheckpoint(nextUrl)}>
                  ▶ Continue to Checkpoint {completedSteps + 1}
                </button>
              </>
            )}

            {/* IDLE — All done, generate key */}
            {state === "idle" && (
              <>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "rgba(0,200,224,0.1)", border: "1px solid rgba(0,200,224,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, margin: "0 auto 16px",
                  }}>🎉</div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>All Done!</div>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                    All checkpoints completed. Click below to generate your license key.
                  </p>
                </div>
                <button className="ks-btn green" onClick={generateKey}>
                  🗝 Generate Key
                </button>
              </>
            )}

            {/* RESULT — Key displayed */}
            {state === "result" && (
              <>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "rgba(0,200,224,0.1)", border: "1px solid rgba(0,200,224,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, margin: "0 auto 12px",
                  }}>🗝</div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Key Generated!</div>
                  <div className="ks-meta">
                    Expires in {eh}h {em}m {es}s
                  </div>
                </div>
                <div className="ks-key-box">{key}</div>
                <button className="ks-btn ghost" onClick={() => { navigator.clipboard.writeText(key); }}>
                  📋 Copy Key
                </button>
                <p className="ks-meta" style={{ textAlign: "center" }}>
                  Paste this in the loader along with your Script ID.
                </p>
              </>
            )}

            {/* COOLDOWN */}
            {state === "cooldown" && (
              <>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, margin: "0 auto 12px",
                  }}>⏱</div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Cooldown Active</div>
                  <p className="ks-meta" style={{ marginBottom: 12 }}>You recently generated a key. Wait before getting another.</p>
                  <div style={{ fontSize: 30, fontWeight: 800, color: "#f59e0b", fontFamily: "monospace" }}>
                    {String(cdH).padStart(2, "0")}:{String(cdM).padStart(2, "0")}:{String(cdS).padStart(2, "0")}
                  </div>
                </div>
                <button className="ks-btn ghost" onClick={() => { localStorage.removeItem("syncauth_cooldown_" + slug); init(); }}>
                  Reset (if allowed)
                </button>
              </>
            )}

            {/* ERROR */}
            {state === "error" && (
              <>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, margin: "0 auto 12px",
                  }}>⚠️</div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Error</div>
                  <p style={{ fontSize: 13, color: "#fca5a5", lineHeight: 1.6 }}>{error}</p>
                </div>
                <button className="ks-btn ghost" onClick={() => { setError(""); setState("loading"); init(); }}>
                  Try Again
                </button>
              </>
            )}
          </div>

          {/* Right — Progress tracker (only when multi-step & relevant states) */}
          {isWide && (
            <div style={{
              width: 200, flexShrink: 0,
              borderLeft: "1px solid rgba(255,255,255,0.05)",
              padding: "28px 16px",
              display: "flex", flexDirection: "column", justifyContent: "center",
            }}>
              <ProgressTracker done={completedSteps} total={totalSteps} />
            </div>
          )}
        </div>

        {/* Footer */}
        {project && state !== "loading" && (
          <div style={{
            padding: "12px 24px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            fontSize: 11, color: "#1e293b", textAlign: "center",
          }}>
            Powered by SyncAuth
          </div>
        )}
      </div>
    </div>
  );
}

export default function GetKeyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        Loading...
      </div>
    }>
      <GetKeyInner />
    </Suspense>
  );
}
