"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, Suspense } from "next/navigation";

function GetKeyInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params.slug as string) || "";
  const token = searchParams.get("token") || "";

  type S = "loading"|"gate"|"progress"|"idle"|"result"|"cooldown"|"error";
  const [state, setState] = useState<S>("loading");
  const [project, setProject] = useState<any>(null);
  const [sessionId, setSessionId] = useState("");
  const [llUrl, setLlUrl] = useState("");
  const [nextUrl, setNextUrl] = useState("");
  const [key, setKey] = useState("");
  const [expires, setExpires] = useState(0);
  const [error, setError] = useState("");
  const [cooldownSec, setCooldownSec] = useState(0);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(1);
  const [copied, setCopied] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    const ck = localStorage.getItem("sa_cd_" + slug);
    if (ck && parseInt(ck) > Date.now()) {
      setCooldownSec(Math.ceil((parseInt(ck) - Date.now()) / 1000));
      setState("cooldown"); return;
    }
    const sk = localStorage.getItem("sa_key_" + slug);
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
    const t = setInterval(() => setCooldownSec(s => { if (s <= 1) { clearInterval(t); init(); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, [cooldownSec]);

  async function init() {
    setState("loading");
    try {
      const res = await fetch(`/api/get-key/init?slug=${encodeURIComponent(slug)}${token ? `&token=${encodeURIComponent(token)}` : ""}`);
      const data = await res.json();
      if (data.error) { setError(data.error); setState("error"); return; }
      setProject(data.project);
      setSessionId(data.session_id);
      setDone(data.completed_steps || 0);
      setTotal(data.total_steps || 1);
      if (data.all_done) { setState("idle"); return; }
      if (!data.checkpoint_url) { setError("No checkpoint configured."); setState("error"); return; }
      if ((data.completed_steps || 0) > 0) { setNextUrl(data.checkpoint_url); setState("progress"); }
      else { setLlUrl(data.checkpoint_url); setState("gate"); }
    } catch { setError("Connection failed."); setState("error"); }
  }

  async function generateKey() {
    setGenLoading(true);
    try {
      const res = await fetch("/api/keys/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, project_id: project?.id }),
      });
      const data = await res.json();
      if (data.key) {
        setKey(data.key);
        const exp = data.expires || Date.now() + 86400000;
        setExpires(exp);
        localStorage.setItem("sa_key_" + slug, JSON.stringify({ key: data.key, exp }));
        setState("result");
      } else if (data.error?.includes("cooldown")) {
        localStorage.setItem("sa_cd_" + slug, String(Date.now() + 86400000));
        setCooldownSec(86400); setState("cooldown");
      } else { setError(data.error || "Checkpoint not completed."); setState("error"); }
    } catch { setError("Connection failed."); setState("error"); }
    setGenLoading(false);
  }

  function copyKey() {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const tl = Math.max(0, Math.floor((expires - Date.now()) / 1000));
  const eh = Math.floor(tl / 3600), em = Math.floor((tl % 3600) / 60), es = tl % 60;
  const cdH = Math.floor(cooldownSec / 3600), cdM = Math.floor((cooldownSec % 3600) / 60), cdS = cooldownSec % 60;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ minHeight:"100vh", background:"#07080f", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif", padding:16, position:"relative", overflow:"hidden" }}>
      {/* Background glow */}
      <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:600, height:600, background:"radial-gradient(ellipse,rgba(0,200,224,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .sa-fade{animation:fadeUp .35s ease both}
        .sa-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;border:none;font-family:Inter,sans-serif;transition:all .18s;outline:none}
        .sa-btn:hover{filter:brightness(1.12);transform:translateY(-1px)}
        .sa-btn:active{transform:translateY(0)}
        .sa-btn.accent{background:linear-gradient(135deg,#00c8e0,#0055ff);color:#fff;box-shadow:0 4px 20px rgba(0,200,224,.25)}
        .sa-btn.green{background:linear-gradient(135deg,#22c55e,#15803d);color:#fff;box-shadow:0 4px 20px rgba(34,197,94,.2)}
        .sa-btn.ghost{background:rgba(255,255,255,.05);color:#94a3b8;border:1px solid rgba(255,255,255,.1)}
        .sa-btn.ghost:hover{background:rgba(255,255,255,.08)}
        .sa-btn.copy{background:rgba(0,200,224,.1);color:#00c8e0;border:1px solid rgba(0,200,224,.2)}
        .sa-btn.copy.done{background:rgba(34,197,94,.12);color:#22c55e;border-color:rgba(34,197,94,.25)}
        .sa-step{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;font-size:12px;transition:all .3s}
        .sa-step.done{background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.18);color:#22c55e}
        .sa-step.current{background:rgba(0,200,224,.07);border:1px solid rgba(0,200,224,.2);color:#00c8e0}
        .sa-step.pending{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);color:#475569}
        .sa-dot{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
        .sa-dot.done{background:#22c55e;color:#000}
        .sa-dot.current{background:rgba(0,200,224,.15);color:#00c8e0;border:1.5px solid #00c8e0}
        .sa-dot.pending{background:rgba(255,255,255,.05);color:#475569}
        .sa-key{padding:16px;background:rgba(0,200,224,.06);border:1px solid rgba(0,200,224,.15);border-radius:10px;font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:#00c8e0;letter-spacing:.5px;word-break:break-all;text-align:center}
        .sa-icon{width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-size:24px}
        .sa-icon.red{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#ef4444}
        .sa-icon.cyan{background:rgba(0,200,224,.1);border:1px solid rgba(0,200,224,.2);color:#00c8e0}
        .sa-icon.green{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.2);color:#22c55e}
        .sa-icon.amber{background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);color:#f59e0b}
        .toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#22c55e;color:#fff;padding:10px 20px;border-radius:99px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;box-shadow:0 8px 24px rgba(0,0,0,.4);animation:fadeUp .3s ease;z-index:9999}
      `}</style>

      {/* Copy toast */}
      {copied && (
        <div className="toast">
          <i className="fa-solid fa-check" /> Key copied to clipboard!
        </div>
      )}

      <div className="sa-fade" style={{ width:"100%", maxWidth: total > 1 && state !== "result" && state !== "cooldown" ? 680 : 420 }}>
        {/* Card */}
        <div style={{ background:"#0f1018", border:"1px solid rgba(255,255,255,.08)", borderRadius:18, overflow:"hidden", boxShadow:"0 30px 80px rgba(0,0,0,.7)" }}>

          {/* Header */}
          {project && (
            <div style={{ padding:"18px 24px", borderBottom:"1px solid rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:15, fontWeight:800, color:"#fff" }}>{project.name}</div>
                <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>
                  <i className="fa-solid fa-shield-halved" style={{ marginRight:5, color:"#00c8e0" }} />
                  SyncAuth License System
                </div>
              </div>
              {total > 1 && (
                <div style={{ background:"rgba(0,200,224,.1)", border:"1px solid rgba(0,200,224,.2)", color:"#00c8e0", padding:"4px 12px", borderRadius:99, fontSize:11, fontWeight:700 }}>
                  <i className="fa-solid fa-flag-checkered" style={{ marginRight:5 }} />
                  {done}/{total} Done
                </div>
              )}
            </div>
          )}

          <div style={{ display:"flex" }}>
            {/* Main content */}
            <div style={{ flex:1, padding:"28px 24px", display:"flex", flexDirection:"column", gap:18 }}>

              {/* LOADING */}
              {state === "loading" && (
                <div style={{ textAlign:"center", padding:"20px 0", color:"#475569" }}>
                  <i className="fa-solid fa-circle-notch" style={{ fontSize:28, animation:"spin 1s linear infinite", display:"block", marginBottom:10, color:"#00c8e0" }} />
                  Loading...
                </div>
              )}

              {/* GATE */}
              {state === "gate" && (
                <>
                  <div style={{ textAlign:"center" }}>
                    <div className="sa-icon red"><i className="fa-solid fa-lock" /></div>
                    <div style={{ fontSize:19, fontWeight:800, color:"#fff", marginBottom:6 }}>
                      Checkpoint {done + 1}{total > 1 ? ` of ${total}` : ""}
                    </div>
                    <p style={{ fontSize:13, color:"#64748b", lineHeight:1.7, margin:0 }}>
                      Complete this checkpoint to {total > 1 && done + 1 < total ? "continue" : "unlock your key"}.
                    </p>
                  </div>
                  <button className="sa-btn accent" onClick={() => window.location.href = llUrl}>
                    <i className="fa-solid fa-rocket" />
                    Start Checkpoint {total > 1 ? `${done + 1}/${total}` : ""}
                  </button>
                </>
              )}

              {/* PROGRESS */}
              {state === "progress" && (
                <>
                  <div style={{ textAlign:"center" }}>
                    <div className="sa-icon green"><i className="fa-solid fa-circle-check" /></div>
                    <div style={{ fontSize:19, fontWeight:800, color:"#fff", marginBottom:6 }}>
                      {done}/{total} Completed!
                    </div>
                    <p style={{ fontSize:13, color:"#64748b", lineHeight:1.7, margin:0 }}>
                      {total - done} more checkpoint{total - done > 1 ? "s" : ""} to go.
                    </p>
                  </div>
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#475569", marginBottom:6 }}>
                      <span><i className="fa-solid fa-chart-simple" style={{ marginRight:5 }} />Progress</span>
                      <span style={{ color:"#00c8e0", fontWeight:700 }}>{pct}%</span>
                    </div>
                    <div style={{ height:6, background:"rgba(255,255,255,.05)", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#22c55e,#00c8e0)", borderRadius:99, transition:"width .5s ease" }} />
                    </div>
                  </div>
                  <button className="sa-btn accent" onClick={() => window.location.href = nextUrl}>
                    <i className="fa-solid fa-arrow-right" />
                    Continue to Checkpoint {done + 1}
                  </button>
                </>
              )}

              {/* IDLE */}
              {state === "idle" && (
                <>
                  <div style={{ textAlign:"center" }}>
                    <div className="sa-icon cyan"><i className="fa-solid fa-trophy" /></div>
                    <div style={{ fontSize:19, fontWeight:800, color:"#fff", marginBottom:6 }}>All Done!</div>
                    <p style={{ fontSize:13, color:"#64748b", lineHeight:1.7, margin:0 }}>
                      All checkpoints completed. Generate your license key below.
                    </p>
                  </div>
                  <button className="sa-btn green" onClick={generateKey} disabled={genLoading}>
                    {genLoading
                      ? <><i className="fa-solid fa-circle-notch" style={{ animation:"spin 1s linear infinite" }} />Generating...</>
                      : <><i className="fa-solid fa-key" />Generate Key</>}
                  </button>
                </>
              )}

              {/* RESULT */}
              {state === "result" && (
                <>
                  <div style={{ textAlign:"center" }}>
                    <div className="sa-icon cyan"><i className="fa-solid fa-key" /></div>
                    <div style={{ fontSize:19, fontWeight:800, color:"#fff", marginBottom:4 }}>Key Generated!</div>
                    <div style={{ fontSize:12, color:"#475569" }}>
                      <i className="fa-regular fa-clock" style={{ marginRight:5 }} />
                      Expires in {eh}h {em}m {es}s
                    </div>
                  </div>
                  <div className="sa-key">{key}</div>
                  <button className={`sa-btn copy${copied ? " done" : ""}`} onClick={copyKey}>
                    {copied
                      ? <><i className="fa-solid fa-check" />Copied!</>
                      : <><i className="fa-regular fa-copy" />Copy Key</>}
                  </button>
                  <p style={{ fontSize:11, color:"#334155", textAlign:"center", margin:0 }}>
                    <i className="fa-solid fa-circle-info" style={{ marginRight:5 }} />
                    Paste this in the loader along with your Script ID.
                  </p>
                </>
              )}

              {/* COOLDOWN */}
              {state === "cooldown" && (
                <>
                  <div style={{ textAlign:"center" }}>
                    <div className="sa-icon amber"><i className="fa-solid fa-hourglass-half" /></div>
                    <div style={{ fontSize:19, fontWeight:800, color:"#fff", marginBottom:4 }}>Cooldown Active</div>
                    <p style={{ fontSize:13, color:"#64748b", lineHeight:1.7 }}>You recently generated a key. Wait before getting another.</p>
                    <div style={{ fontSize:32, fontWeight:800, color:"#f59e0b", fontFamily:"'JetBrains Mono',monospace", marginTop:8 }}>
                      {String(cdH).padStart(2,"0")}:{String(cdM).padStart(2,"0")}:{String(cdS).padStart(2,"0")}
                    </div>
                  </div>
                  <button className="sa-btn ghost" onClick={() => { localStorage.removeItem("sa_cd_" + slug); init(); }}>
                    <i className="fa-solid fa-rotate-right" />Reset (if allowed)
                  </button>
                </>
              )}

              {/* ERROR */}
              {state === "error" && (
                <>
                  <div style={{ textAlign:"center" }}>
                    <div className="sa-icon red"><i className="fa-solid fa-triangle-exclamation" /></div>
                    <div style={{ fontSize:19, fontWeight:800, color:"#fff", marginBottom:4 }}>Error</div>
                    <p style={{ fontSize:13, color:"#fca5a5", lineHeight:1.7 }}>{error}</p>
                  </div>
                  <button className="sa-btn ghost" onClick={() => { setError(""); init(); }}>
                    <i className="fa-solid fa-rotate-right" />Try Again
                  </button>
                </>
              )}
            </div>

            {/* Right: progress tracker */}
            {total > 1 && state !== "result" && state !== "cooldown" && state !== "error" && state !== "loading" && (
              <div style={{ width:190, borderLeft:"1px solid rgba(255,255,255,.05)", padding:"28px 14px", display:"flex", flexDirection:"column", gap:6, justifyContent:"center" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#334155", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>
                  <i className="fa-solid fa-list-check" style={{ marginRight:5 }} />Steps
                </div>
                {Array.from({ length: total }).map((_, i) => {
                  const isDone = i < done, isCurrent = i === done;
                  return (
                    <div key={i} className={`sa-step ${isDone ? "done" : isCurrent ? "current" : "pending"}`}>
                      <div className={`sa-dot ${isDone ? "done" : isCurrent ? "current" : "pending"}`}>
                        {isDone ? <i className="fa-solid fa-check" style={{ fontSize:9 }} /> : i + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:11 }}>Checkpoint {i + 1}</div>
                        <div style={{ fontSize:10, opacity:.7 }}>{isDone ? "Completed" : isCurrent ? "Current" : "Pending"}</div>
                      </div>
                      {isCurrent && <i className="fa-solid fa-chevron-right" style={{ marginLeft:"auto", fontSize:9 }} />}
                    </div>
                  );
                })}
                <div className={`sa-step ${done >= total ? "done" : "pending"}`} style={{ opacity: done >= total ? 1 : 0.35 }}>
                  <div className={`sa-dot ${done >= total ? "done" : "pending"}`}>
                    <i className="fa-solid fa-key" style={{ fontSize:9 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:11 }}>Get Key</div>
                    <div style={{ fontSize:10, opacity:.7 }}>{done >= total ? "Unlocked" : "Locked"}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {project && (
            <div style={{ padding:"10px 24px", borderTop:"1px solid rgba(255,255,255,.04)", textAlign:"center", fontSize:10, color:"#1e2030" }}>
              <i className="fa-solid fa-shield" style={{ marginRight:5 }} />Powered by SyncAuth
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GetKeyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:"100vh", background:"#07080f", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>Loading...</div>}>
      <GetKeyInner />
    </Suspense>
  );
}
